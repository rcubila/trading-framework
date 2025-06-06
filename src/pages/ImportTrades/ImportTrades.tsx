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
  RiDeleteBinLine,
} from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import { importTradesFromCSV } from '../../lib/csv-import';
import { processTradeImages, testOpenAIAccess } from '../../lib/image-import';
import { supabase, supabaseAdmin, profilesApi } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import styles from './ImportTrades.module.css';

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

      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error('Failed to get current user');
      }
      if (!user) throw new Error('No user logged in');

      console.log('Current user:', user.id);

      // Ensure profile exists
      try {
        await profilesApi.getProfile(user.id);
      } catch (error: any) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          await profilesApi.createProfile({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            updated_at: new Date().toISOString()
          });
        } else {
          throw error;
        }
      }

      for (const file of files) {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            console.log('Starting file import...');
            const text = e.target?.result as string;
            console.log('File content:', text);
            
            const { trades, errors: importErrors } = await importTradesFromCSV(text);
            console.log('Import result:', { trades, errors: importErrors });
            
            if (importErrors.length > 0) {
              console.error('Import errors:', importErrors.map(err => `Row ${err.row}: ${err.message}`).join('\n'));
              // Only show the first 5 errors to avoid overwhelming the UI
              setErrors(importErrors.slice(0, 5));
              return;
            }

            if (trades.length === 0) {
              console.error('No trades to import');
              setErrors([{ row: 0, message: 'No valid trades found in the file' }]);
              return;
            }

            // Convert trades to database format with user_id
            const dbTrades = trades.map(trade => ({
              user_id: user.id,
              ...trade
            }));
            console.log('Prepared trades for database:', dbTrades);

            // Insert trades into database
            const { error: insertError } = await supabase
              .from('trades')
              .insert(dbTrades);

            if (insertError) {
              console.error('Database error:', insertError);
              throw insertError;
            }

            console.log('Trades imported successfully');
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = styles.successToast;
            successMessage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>Trades imported successfully!';
            document.body.appendChild(successMessage);

            setTimeout(() => {
              document.body.removeChild(successMessage);
              navigate('/trades');
            }, 2000);
          } catch (error) {
            console.error('Import error:', error);
            setErrors([{ row: 0, message: error instanceof Error ? error.message : 'Failed to import file' }]);
          }
        };

        reader.readAsText(file);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Import error:', error);
      setErrors([{ row: 0, message: error instanceof Error ? error.message : 'Failed to import file' }]);
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
      processingMessage.className = styles.processingToast;
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
      successMessage.className = styles.successToast;
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
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h1 className={styles.headerTitle}>
          Import Trades
        </h1>
        <p className={styles.headerSubtitle}>
          Import your trading history from a CSV file or let AI process your trade screenshots
        </p>
      </div>

      <div className={styles.mainGrid}>
        {/* CSV Import Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <RiFileExcel2Line />
            CSV Import
          </h2>
          
          <div
            {...getRootProps()}
            className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
          >
            <input {...getInputProps()} />
            <RiUploadCloud2Line className={styles.dropzoneIcon} />
            <p className={styles.dropzoneText}>
              {isDragActive
                ? 'Drop your file here...'
                : 'Drag & drop your trade history file here'}
            </p>
            <p className={styles.dropzoneSubtext}>
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
                className={styles.filePreview}
              >
                <RiFileExcel2Line className={styles.fileIcon} />
                <div className={styles.fileInfo}>
                  <p className={styles.fileName}>{file.name}</p>
                  <p className={styles.fileSize}>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(file)}
                  className={styles.removeFileButton}
                >
                  <RiCloseLine />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Import Button */}
          {files.length > 0 && (
            <div className={styles.buttonContainer}>
              <button
                onClick={handleImport}
                disabled={importing}
                className={styles.importButton}
              >
                {importing ? (
                  <>
                    <div className={styles.loadingSpinner} />
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
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <RiMagicLine className={styles.magicLineIcon} />
              AI Screenshot Import
            </h2>
            {isAdmin && (
              <button
                onClick={handleTestAPI}
                disabled={isTestingAPI}
                className={styles.testApiButton}
              >
                {isTestingAPI ? (
                  <>
                    <div className={styles.loadingSpinner} />
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
            <div className={`${styles.apiTestResult} ${apiTestResult.isValid ? styles.success : styles.error}`}>
              {apiTestResult.isValid ? <RiCheckLine /> : <RiFileWarningLine />}
              {apiTestResult.message}
            </div>
          )}
          
          <div
            {...getImageRootProps()}
            className={`${styles.imageDropzone} ${isImageDragActive ? styles.active : ''}`}
          >
            <input {...getImageInputProps()} />
            <RiImageLine className={styles.imageDropzoneIcon} />
            <p className={styles.imageDropzoneText}>
              {isImageDragActive
                ? 'Drop your screenshots here...'
                : 'Drag & drop your trade screenshots here'}
            </p>
            <p className={styles.imageDropzoneSubtext}>
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
                className={styles.imagePreviewContainer}
              >
                <img 
                  src={file.preview} 
                  alt={file.name}
                  className={styles.imagePreview}
                />
                <div className={styles.imagePreviewInfo}>
                  <p className={styles.imagePreviewName}>{file.name}</p>
                  <p className={styles.imagePreviewSize}>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(file, true)}
                  className={styles.imagePreviewRemove}
                >
                  <RiCloseLine />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Process Button */}
          {imageFiles.length > 0 && (
            <div className={styles.buttonContainer}>
              <button
                onClick={handleImageImport}
                disabled={processingImages}
                className={styles.processButton}
              >
                {processingImages ? (
                  <>
                    <div className={styles.loadingSpinner} />
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

          <div className={styles.sectionInfo}>
            <div className={styles.infoItem}>
              <RiInformationLine />
              <span className={styles.infoText}>AI Processing</span>
            </div>
            <p className={styles.infoDescription}>
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
            className={styles.errorContainer}
          >
            <div className={styles.errorItem}>
              <RiFileWarningLine />
              <span className={styles.errorText}>Import Errors</span>
            </div>
            {errors.map((error, index) => (
              <div
                key={index}
                className={styles.errorDescription}
              >
                {error.row > 0 ? `Row ${error.row}: ` : ''}{error.message}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <RiFileTextLine />
            CSV Template
          </h2>
          <button
            onClick={() => setShowTemplate(!showTemplate)}
            className={styles.templateToggle}
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
              className={styles.templateAnimationContainer}
            >
              <div className={styles.templateContent}>
                <div className={styles.templateText}>
                  {SAMPLE_TEMPLATE}
                </div>
                <button
                  onClick={handleCopyTemplate}
                  className={styles.copyButton}
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