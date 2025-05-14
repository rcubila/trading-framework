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
} from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import { importTradesFromCSV } from '../lib/csv-import';

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

const SAMPLE_TEMPLATE = `Open,Symbol,Open Price,Volume,Action,Close,Close Price,Win/Loss,Profit,Tags,Notes
2024-03-18 10:30:00,AAPL,175.50,100,BUY,2024-03-18 14:45:00,178.25,Win,275,Tech;Momentum,Strong breakout pattern
2024-03-14,TSLA,190.25,50,SELL,2024-03-14 15:30:00,187.50,Win,137.50,EV;Trend,Clear resistance break`;

export const ImportTrades = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [showTemplate, setShowTemplate] = useState(false);
  const templateRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
    setErrors([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!files.length) return;

    setImporting(true);
    setProgress(0);
    setErrors([]);

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await importTradesFromCSV(files[0]);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (!result.success) {
        // Parse error message to create error objects
        const errorLines = result.message.split('\n');
        const parsedErrors: ImportError[] = errorLines
          .filter(line => line.includes('Row'))
          .map(line => {
            const match = line.match(/Row (\d+): (.*)/);
            return {
              row: match ? parseInt(match[1]) : 0,
              message: match ? match[2] : line
            };
          });
        setErrors(parsedErrors);
      } else {
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

  const handleCopyTemplate = () => {
    if (templateRef.current) {
      templateRef.current.select();
      document.execCommand('copy');
      // Show a toast or notification here
    }
  };

  const removeFile = (file: FileWithPreview) => {
    setFiles(files.filter(f => f !== file));
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
  };

  return (
    <div style={{
      padding: '5px',
      color: 'white',
      minHeight: '100vh',
      background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 27, 75, 0.3) 100%)',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px',
        background: 'rgba(15, 23, 42, 0.4)',
        padding: '5px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '4px',
            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Import Trades
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <RiDownloadLine />
            <span>Import your trading history from CSV files</span>
          </p>
        </div>
        <button
          onClick={() => setShowTemplate(!showTemplate)}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '12px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
          }}
        >
          <RiFileTextLine />
          View Template
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '5px',
        marginBottom: '5px'
      }}>
        {/* Drop Zone */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: '16px',
          padding: '5px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
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

          {/* Error Display */}
          {errors.length > 0 && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                color: '#ef4444',
              }}>
                <RiFileWarningLine />
                <span>Import Errors</span>
              </div>
              {errors.map((error, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: '14px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ color: '#ef4444' }}>Row {error.row}:</span>
                  <span>{error.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions Panel */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: '16px',
          padding: '5px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <div style={{ padding: '20px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <RiInformationLine />
              Import Instructions
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {[
                'Prepare your trade history in CSV format',
                'Required columns: Open, Symbol, Open Price, Volume, Action',
                'Action must be either "BUY" or "SELL"',
                'Use the template format for best results',
                'One trade per row',
              ].map((instruction, index) => (
                <li
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '14px',
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60a5fa',
                  }}>
                    {index + 1}
                  </div>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>

          {/* Template Section */}
          <div style={{
            marginTop: '20px',
            padding: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <RiFileTextLine />
              CSV Template
            </h3>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
            }}>
              <textarea
                ref={templateRef}
                readOnly
                value={SAMPLE_TEMPLATE}
                style={{
                  width: '100%',
                  height: '100px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  resize: 'none',
                }}
              />
            </div>
            <button
              onClick={handleCopyTemplate}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <RiFileTextLine />
              Copy Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 