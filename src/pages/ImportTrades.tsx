import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  RiUploadCloud2Line,
  RiFileExcel2Line,
  RiFileTextLine,
  RiCloseLine,
  RiCheckLine,
  RiDownloadLine,
  RiInformationLine,
  RiFileWarningLine,
  RiImageLine,
  RiMagicLine,
  RiTestTubeLine,
} from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import { importTradesFromCSV } from '../lib/csv-import';
import { processTradeImages, testOpenAIAccess } from '../lib/image-import';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface FileWithPreview extends File {
  preview?: string;
}

interface ImportError {
  row: number;
  message: string;
}

const ACCEPTED_FILE_TYPES = {
  'text/csv': ['.csv'],
};

const ACCEPTED_IMAGE_TYPES = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
};

const SAMPLE_TEMPLATE = `Open,Symbol,Open Price,Volume,Action,Close,Close Price,Win/Loss,Profit,Tags,Notes
2024-03-18 10:30:00,AAPL,175.50,100,BUY,2024-03-18 14:45:00,178.25,Win,275,Tech;Momentum,Strong breakout pattern
2024-03-14,TSLA,190.25,50,SELL,2024-03-14 15:30:00,187.50,Win,137.50,EV;Trend,Clear resistance break`;

export const ImportTrades = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [imageFiles, setImageFiles] = useState<FileWithPreview[]>([]);
  const [importing, setImporting] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [showTemplate, setShowTemplate] = useState(false);
  const templateRef = useRef<HTMLTextAreaElement>(null);
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{ isValid: boolean; message: string } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
    setErrors([]);
  }, []);

  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    setImageFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
    setErrors([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
  });

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    onDrop: onImageDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxFiles: 5,
  });

  const handleImport = async () => {
    try {
      setImporting(true);
      setProgress(0);
      setErrors([]);

      for (const file of files) {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const text = e.target?.result as string;
            const { trades, errors: importErrors } = await importTradesFromCSV(text);
            
            if (importErrors.length > 0) {
              setErrors(importErrors);
              return;
            }

            // Import trades to database
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user logged in');

            // Convert trades to database format
            const dbTrades = trades.map(trade => ({
              user_id: user.id,
              ...trade
            }));

            // Insert trades into database
            const { error } = await supabase
              .from('trades')
              .insert(dbTrades);

            if (error) throw error;

            // Show success message and navigate to trades page
            const successMessage = document.createElement('div');
            successMessage.style.position = 'fixed';
            successMessage.style.top = '20px';
            successMessage.style.right = '20px';
            successMessage.style.padding = '16px 24px';
            successMessage.style.background = 'rgba(34, 197, 94, 0.9)';
            successMessage.style.color = 'white';
            successMessage.style.borderRadius = '8px';
            successMessage.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            successMessage.style.zIndex = '9999';
            successMessage.style.display = 'flex';
            successMessage.style.alignItems = 'center';
            successMessage.style.gap = '8px';
            successMessage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>Trades imported successfully!';
            document.body.appendChild(successMessage);

            setTimeout(() => {
              document.body.removeChild(successMessage);
              navigate('/trades');
            }, 2000);
          } catch (error) {
            console.error('Import error:', error);
            setErrors([{ row: 0, message: 'Failed to import file' }]);
          }
        };

        reader.readAsText(file);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Import error:', error);
      setErrors([{ row: 0, message: 'Failed to import file' }]);
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const handleImageImport = async () => {
    try {
      setProcessingImages(true);
      setErrors([]);

      // Show AI processing message
      const processingMessage = document.createElement('div');
      processingMessage.style.position = 'fixed';
      processingMessage.style.top = '20px';
      processingMessage.style.right = '20px';
      processingMessage.style.padding = '16px 24px';
      processingMessage.style.background = 'rgba(168, 85, 247, 0.9)';
      processingMessage.style.color = 'white';
      processingMessage.style.borderRadius = '8px';
      processingMessage.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      processingMessage.style.zIndex = '9999';
      processingMessage.style.display = 'flex';
      processingMessage.style.alignItems = 'center';
      processingMessage.style.gap = '8px';
      processingMessage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path></svg>AI is processing your trade screenshots...';
      document.body.appendChild(processingMessage);

      // Process images with AI
      const { trades, errors: processErrors } = await processTradeImages(imageFiles);

      if (processErrors.length > 0) {
        setErrors(processErrors);
        document.body.removeChild(processingMessage);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // Convert trades to database format
      const dbTrades = trades.map(trade => ({
        user_id: user.id,
        ...trade
      }));

      // Insert trades into database
      const { error } = await supabase
        .from('trades')
        .insert(dbTrades);

      if (error) throw error;

      // Remove processing message
      document.body.removeChild(processingMessage);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.style.position = 'fixed';
      successMessage.style.top = '20px';
      successMessage.style.right = '20px';
      successMessage.style.padding = '16px 24px';
      successMessage.style.background = 'rgba(34, 197, 94, 0.9)';
      successMessage.style.color = 'white';
      successMessage.style.borderRadius = '8px';
      successMessage.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      successMessage.style.zIndex = '9999';
      successMessage.style.display = 'flex';
      successMessage.style.alignItems = 'center';
      successMessage.style.gap = '8px';
      successMessage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>Screenshots processed and trades imported successfully!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        document.body.removeChild(successMessage);
        navigate('/trades');
      }, 2000);

    } catch (error: any) {
      console.error('Image processing error:', error);
      setErrors([{ row: 0, message: error?.message || 'Failed to process images' }]);
    } finally {
      setProcessingImages(false);
    }
  };

  const handleCopyTemplate = () => {
    if (templateRef.current) {
      templateRef.current.select();
      document.execCommand('copy');
    }
  };

  const removeFile = (file: FileWithPreview, isImage: boolean = false) => {
    if (isImage) {
      setImageFiles(imageFiles.filter(f => f !== file));
    } else {
      setFiles(files.filter(f => f !== file));
    }
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
  };

  const handleTestAPI = async () => {
    setIsTestingAPI(true);
    setApiTestResult(null);
    try {
      const result = await testOpenAIAccess();
      setApiTestResult(result);
    } finally {
      setIsTestingAPI(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      <div style={{ 
        background: 'rgba(15, 23, 42, 0.4)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          Import Trades
        </h1>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '14px'
        }}>
          Import your trading history from a CSV file or let AI process your trade screenshots
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
      }}>
        {/* CSV Import Section */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <RiFileExcel2Line />
            CSV Import
          </h2>
          
          <div
            {...getRootProps()}
            style={{
              padding: '40px',
              borderRadius: '12px',
              border: `2px dashed ${isDragActive ? '#60a5fa' : 'rgba(255, 255, 255, 0.1)'}`,
              backgroundColor: isDragActive ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
          >
            <input {...getInputProps()} />
            <RiUploadCloud2Line style={{ fontSize: '48px', marginBottom: '16px', color: '#60a5fa' }} />
            <p style={{ marginBottom: '8px', fontSize: '16px' }}>
              {isDragActive
                ? 'Drop your file here...'
                : 'Drag & drop your trade history file here'}
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              Supported format: CSV
            </p>
          </div>

          {/* File Preview */}
          <AnimatePresence>
            {files.map((file) => (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  marginTop: '20px',
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <RiFileExcel2Line style={{ fontSize: '24px', color: '#22c55e' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ marginBottom: '4px' }}>{file.name}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(file)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                  }}
                >
                  <RiCloseLine />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Import Button */}
          {files.length > 0 && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={handleImport}
                disabled={importing}
                style={{
                  background: importing
                    ? 'rgba(59, 130, 246, 0.5)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: importing ? 'default' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {importing ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Importing... {progress}%
                  </>
                ) : (
                  <>
                    <RiUploadCloud2Line />
                    Start Import
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* AI Screenshot Import Section */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <RiMagicLine style={{ color: '#a855f7' }} />
              AI Screenshot Import
            </h2>
            {isAdmin && (
              <button
                onClick={handleTestAPI}
                disabled={isTestingAPI}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: isTestingAPI ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  color: '#a855f7',
                  cursor: isTestingAPI ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isTestingAPI ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(168, 85, 247, 0.3)',
                      borderTop: '2px solid #a855f7',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Testing API...
                  </>
                ) : (
                  <>
                    <RiTestTubeLine />
                    Test API Access
                  </>
                )}
              </button>
            )}
          </div>

          {apiTestResult && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: apiTestResult.isValid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${apiTestResult.isValid ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              color: apiTestResult.isValid ? '#22c55e' : '#ef4444',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {apiTestResult.isValid ? <RiCheckLine /> : <RiFileWarningLine />}
              {apiTestResult.message}
            </div>
          )}
          
          <div
            {...getImageRootProps()}
            style={{
              padding: '40px',
              borderRadius: '12px',
              border: `2px dashed ${isImageDragActive ? '#a855f7' : 'rgba(255, 255, 255, 0.1)'}`,
              backgroundColor: isImageDragActive ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
          >
            <input {...getImageInputProps()} />
            <RiImageLine style={{ fontSize: '48px', marginBottom: '16px', color: '#a855f7' }} />
            <p style={{ marginBottom: '8px', fontSize: '16px' }}>
              {isImageDragActive
                ? 'Drop your screenshots here...'
                : 'Drag & drop your trade screenshots here'}
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              Supported formats: PNG, JPG, JPEG
            </p>
          </div>

          {/* Image Preview */}
          <AnimatePresence>
            {imageFiles.map((file) => (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  marginTop: '20px',
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <img 
                  src={file.preview} 
                  alt={file.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    aspectRatio: '1/1'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ marginBottom: '4px' }}>{file.name}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(file, true)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                  }}
                >
                  <RiCloseLine />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Process Button */}
          {imageFiles.length > 0 && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={handleImageImport}
                disabled={processingImages}
                style={{
                  background: processingImages
                    ? 'rgba(168, 85, 247, 0.5)'
                    : 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: processingImages ? 'default' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {processingImages ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <RiMagicLine />
                    Process with AI
                  </>
                )}
              </button>
            </div>
          )}

          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              color: '#a855f7',
            }}>
              <RiInformationLine />
              <span style={{ fontWeight: '500' }}>AI Processing</span>
            </div>
            <p style={{ 
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.5',
            }}>
              Our AI will analyze your trade screenshots and automatically extract trade information. Supported platforms include MT4, MT5, TradingView, and most major brokers.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              padding: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '12px',
              marginTop: '20px',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              color: '#ef4444',
            }}>
              <RiFileWarningLine />
              <span style={{ fontWeight: '500' }}>Import Errors</span>
            </div>
            {errors.map((error, index) => (
              <div
                key={index}
                style={{
                  fontSize: '14px',
                  color: 'rgba(239, 68, 68, 0.9)',
                  marginTop: '4px',
                }}
              >
                {error.row > 0 ? `Row ${error.row}: ` : ''}{error.message}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Section */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.4)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        marginTop: '24px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <RiFileTextLine />
            CSV Template
          </h2>
          <button
            onClick={() => setShowTemplate(!showTemplate)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {showTemplate ? 'Hide Template' : 'Show Template'}
          </button>
        </div>

        <AnimatePresence>
          {showTemplate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                position: 'relative',
                marginTop: '16px',
              }}>
                <textarea
                  ref={templateRef}
                  value={SAMPLE_TEMPLATE}
                  readOnly
                  style={{
                    width: '100%',
                    height: '120px',
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    resize: 'none',
                  }}
                />
                <button
                  onClick={handleCopyTemplate}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <RiDownloadLine />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 