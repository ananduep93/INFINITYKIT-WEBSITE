'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, File as FileIcon, X, CheckCircle, AlertTriangle, ArrowRight, Download, RefreshCw, FileText } from 'lucide-react';
import ReusableLoading from './ReusableLoading';

interface ToolWorkspaceProps {
  toolId: string;
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  hasText?: boolean;
  textPlaceholder?: string;
  textLabel?: string;
  onProcess: (files: File[], textInput?: string) => Promise<{ downloadUrl?: string; fileName?: string; resultData?: any }>;
  instructions?: string[];
  actionButtonText?: string;
  onReset?: () => void;
  onFileChange?: (files: File[]) => void;
}

export default function ToolWorkspace({
  toolId,
  accept = '*/*',
  maxSizeMB = 50,
  maxFiles = 1,
  hasText = false,
  textPlaceholder = 'Enter custom context or instructions here...',
  textLabel = 'Additional Prompt or Specifications',
  onProcess,
  instructions = [
    'Drag and drop your file(s) into the workspace container above.',
    'Wait for the file parsing checks to complete successfully.',
    'Trigger the processing action to compile the optimized outputs locally.'
  ],
  actionButtonText = 'Process Utilities',
  onReset,
  onFileChange
}: ToolWorkspaceProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [textInput, setTextInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [phase, setPhase] = useState<'upload' | 'processing' | 'success' | 'error'>('upload');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing workspace...');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<{ downloadUrl?: string; fileName?: string; resultData?: any } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync files state change to parent listener
  useEffect(() => {
    onFileChange?.(files);
  }, [files, onFileChange]);

  // Drag over states
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (incoming: File[]) => {
    const valid: File[] = [];
    for (const file of incoming) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is ${maxSizeMB}MB.`);
        continue;
      }
      valid.push(file);
    }

    setFiles((prev) => {
      const combined = [...prev, ...valid];
      return combined.slice(0, maxFiles); // Enforce maxFiles limit
    });
  };

  const removeFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleWorkspaceAction = async () => {
    if (files.length === 0 && !hasText) {
      setErrorMsg('Please select or drop at least one file to proceed.');
      setPhase('error');
      return;
    }

    setPhase('processing');
    setProgress(0);
    setStatusText('Reading uploaded files payload...');

    // Progress bar simulation interval
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressTimer);
          return 95; // Wait at 95% for actual calculation completion
        }
        
        // Dynamic status text updates
        if (prev === 20) setStatusText('Parsing document structure...');
        if (prev === 45) setStatusText('Running algorithmic models locally...');
        if (prev === 75) setStatusText('Compiling optimized outputs...');

        return prev + 5;
      });
    }, 150);

    try {
      const res = await onProcess(files, hasText ? textInput : undefined);
      clearInterval(progressTimer);
      setProgress(100);
      setStatusText('Complete!');
      setResult(res);
      setTimeout(() => setPhase('success'), 300);
    } catch (err: any) {
      clearInterval(progressTimer);
      setErrorMsg(err.message || 'An unexpected computational failure occurred in the browser workspace.');
      setPhase('error');
    }
  };

  const resetWorkspace = () => {
    setFiles([]);
    setTextInput('');
    setResult(null);
    setErrorMsg('');
    setProgress(0);
    setPhase('upload');
    onReset?.();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Upload Phase */}
      {phase === 'upload' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          
          <div className="glass-panel" style={{ margin: 0, padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={20} color="var(--primary-color)" /> Workspace Upload Area
            </h3>

            {/* Drag & Drop Box */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: dragActive ? '2px dashed var(--primary-color)' : '2px dashed var(--glass-border)',
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                background: dragActive ? 'rgba(0,161,155,0.06)' : 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={maxFiles > 1}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(0,161,155,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-color)'
                }}>
                  <Upload size={26} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-color)' }}>
                    Drag & Drop files here or click to browse
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                    Supports files up to {maxSizeMB}MB (Maximum of {maxFiles} file{maxFiles > 1 ? 's' : ''})
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Files Preview List */}
            {files.length > 0 && (
              <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Parsed File Queue ({files.length}/{maxFiles})
                </h4>
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="glass-panel"
                    style={{
                      margin: 0,
                      padding: '12px 15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <FileIcon size={18} color="var(--primary-color)" style={{ flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{file.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => removeFile(idx, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,53,69,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Optional Text Prompt Field */}
            {hasText && (
              <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-color)' }}>
                  {textLabel}
                </label>
                <textarea
                  className="form-textarea"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={textPlaceholder}
                  rows={4}
                  required
                />
              </div>
            )}

            {/* Action Trigger Button */}
            <button
              onClick={handleWorkspaceAction}
              disabled={files.length === 0 && !hasText}
              className="btn"
              style={{
                width: '100%',
                marginTop: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: files.length === 0 && !hasText ? 0.6 : 1,
                cursor: files.length === 0 && !hasText ? 'not-allowed' : 'pointer'
              }}
            >
              {actionButtonText} <ArrowRight size={16} />
            </button>
          </div>

          {/* Interactive Instructions Card */}
          <div className="glass-panel" style={{ margin: 0, padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="var(--primary-color)" /> Operating Instructions
              </h3>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {instructions.map((step, idx) => (
                  <li key={idx}><strong>{step.split(':')[0]}</strong>{step.includes(':') ? step.substring(step.indexOf(':')) : ''}</li>
                ))}
              </ol>
            </div>
            
            <div style={{
              marginTop: '30px',
              padding: '15px 20px',
              background: 'rgba(0,161,155,0.04)',
              borderRadius: '12px',
              borderLeft: '4px solid var(--primary-color)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4
            }}>
              🔒 **Local Security Sandbox:** File parsing calculations occur completely within client browser sandbox nodes. No private contents leave your local device.
            </div>
          </div>

        </div>
      )}

      {/* Processing Loader Phase */}
      {phase === 'processing' && (
        <div className="glass-panel" style={{ margin: 0, padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px', textAlign: 'center' }}>
          <ReusableLoading type="spinner" />
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{statusText}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
              Optimizing parameters local-first. Please keep this tab active.
            </p>
          </div>

          {/* Progress Timeline Bar */}
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            <div style={{
              width: '100%',
              height: '8px',
              borderRadius: '10px',
              background: 'var(--glass-border)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary-color) 0%, #00d2c4 100%)',
                borderRadius: '10px',
                transition: 'width 0.2s ease-out'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <span>PROCESSED STATUS</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Success Download Phase */}
      {phase === 'success' && (
        <div className="glass-panel" style={{ margin: 0, padding: '50px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', textAlign: 'center' }}>
          
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(40,167,69,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#28a745'
          }}>
            <CheckCircle size={36} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-color)' }}>Workspace Output Ready</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '8px', maxWidth: '500px', margin: '8px auto 0' }}>
              Your file operation succeeded. The compiled payload has been structured into a download package locally.
            </p>
          </div>

          {/* Action result panel */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', marginTop: '10px' }}>
            {result?.downloadUrl && (
              <a
                href={result.downloadUrl}
                download={result.fileName || `infinitykit_export_${Date.now()}`}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
              >
                <Download size={16} /> Download Result File
              </a>
            )}

            <button
              onClick={resetWorkspace}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-color)',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} /> Process Another File
            </button>
          </div>

          {/* Preview Panel if resultData is provided */}
          {result?.resultData && (
            <div style={{ width: '100%', maxWidth: '750px', textAlign: 'left', marginTop: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Output Preview
              </h4>
              <div
                className="glass-panel"
                style={{
                  margin: 0,
                  padding: '20px',
                  borderRadius: '12px',
                  background: 'rgba(0,0,0,0.2)',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid var(--glass-border)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
                {typeof result.resultData === 'string' ? result.resultData : JSON.stringify(result.resultData, null, 2)}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Error Phase */}
      {phase === 'error' && (
        <div className="glass-panel" style={{ margin: 0, padding: '50px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px', textAlign: 'center' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(220,53,69,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc3545'
          }}>
            <AlertTriangle size={36} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Operation Failed</h2>
            <p style={{ color: '#dc3545', fontSize: '0.95rem', fontWeight: 600, marginTop: '8px' }}>
              {errorMsg}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '6px', maxWidth: '500px', margin: '6px auto 0' }}>
              Troubleshoot by checking your input format bounds or files schema integrity, and retry the execution.
            </p>
          </div>

          <button
            onClick={resetWorkspace}
            className="btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={14} /> Retry Workspace Session
          </button>
        </div>
      )}

    </div>
  );
}
