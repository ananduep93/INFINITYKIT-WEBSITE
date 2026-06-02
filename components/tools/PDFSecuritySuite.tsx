'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, Upload, RefreshCw, Download, 
  Lock, Unlock, ShieldAlert, CheckCircle, AlertTriangle 
} from 'lucide-react';
import ReusableLoading from '../ui/ReusableLoading';

interface PDFSecuritySuiteProps {
  initialMode?: 'protect' | 'unlock' | 'restrictions';
}

export default function PDFSecuritySuite({ initialMode = 'protect' }: PDFSecuritySuiteProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outFileName, setOutFileName] = useState('');
  const [mode, setMode] = useState<'protect' | 'unlock' | 'restrictions'>(initialMode);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
      setDownloadUrl(null);
    }
  };

  const handleProtect = async () => {
    if (!file) return;
    if (!password.trim()) {
      setError('Please specify a secure password to protect this document.');
      return;
    }

    setIsProcessing(true);
    setProgress(15);
    setStatusText('Importing file bytes...');

    try {
      const fileBytes = new Uint8Array(await file.arrayBuffer());
      setProgress(40);
      setStatusText('Generating security keys...');

      const encoder = new TextEncoder();
      const passwordBytes = encoder.encode(password);
      
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const baseKey = await window.crypto.subtle.importKey(
        'raw', passwordBytes, { name: 'PBKDF2' }, false, ['deriveKey']
      );

      const aesKey = await window.crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );

      setProgress(70);
      setStatusText('Encrypting PDF payloads locally...');

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv }, aesKey, fileBytes
      );

      const ciphertext = new Uint8Array(encryptedBuffer);
      const header = encoder.encode('SPDF');
      const container = new Uint8Array(header.length + salt.length + iv.length + ciphertext.length);

      container.set(header, 0);
      container.set(salt, header.length);
      container.set(iv, header.length + salt.length);
      container.set(ciphertext, header.length + salt.length + iv.length);

      setProgress(90);
      setStatusText('Assembling secure PDF package...');

      const blob = new Blob([container], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      const name = `${file.name.replace(/\.pdf$/i, '')}_secured.pdf`;
      setOutFileName(name);
      setProgress(100);
      setSuccess('PDF successfully password encrypted locally with military-grade AES-256-GCM. Save your password; it cannot be recovered.');

    } catch (err: any) {
      setError(err.message || 'Encryption processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlock = async () => {
    if (!file) return;
    if (!password.trim()) {
      setError('Please enter the password to decrypt the PDF container.');
      return;
    }

    setIsProcessing(true);
    setProgress(20);
    setStatusText('Verifying file headers...');

    try {
      const container = new Uint8Array(await file.arrayBuffer());
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      const headerBytes = container.subarray(0, 4);
      const headerText = decoder.decode(headerBytes);

      if (headerText !== 'SPDF') {
        throw new Error('This tool is designed to unlock files encrypted on InfinityKit. Please upload a valid secured PDF (_secured.pdf) created here.');
      }

      setProgress(50);
      setStatusText('Deriving cryptographic key...');

      const salt = container.subarray(4, 20);
      const iv = container.subarray(20, 32);
      const ciphertext = container.subarray(32);

      const baseKey = await window.crypto.subtle.importKey(
        'raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
      );

      const aesKey = await window.crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      setProgress(80);
      setStatusText('Decrypting blocks...');

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv }, aesKey, ciphertext
      );

      const decryptedPdfBytes = new Uint8Array(decryptedBuffer);
      const blob = new Blob([decryptedPdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      const name = file.name.replace(/(_secured|\.secured)\.pdf$/i, '.pdf');
      setOutFileName(name);
      setProgress(100);
      setSuccess('PDF successfully decrypted and unlocked!');

    } catch (err: any) {
      setError('Incorrect decryption password or corrupted file container.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveRestrictions = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(30);
    setStatusText('Ingesting document structures...');

    try {
      const { PDFDocument } = await import('pdf-lib');
      const fileBytes = await file.arrayBuffer();

      setProgress(60);
      setStatusText('Stripping owner metadata and copying page layers...');

      // Load document, ignoring standard encryption dictionaries
      const srcDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const targetDoc = await PDFDocument.create();

      const pagesToCopy = srcDoc.getPageIndices();
      const copiedPages = await targetDoc.copyPages(srcDoc, pagesToCopy);
      copiedPages.forEach(p => targetDoc.addPage(p));

      setProgress(85);
      setStatusText('Compiling clean unrestricted file...');

      const clearedBytes = await targetDoc.save();
      const blob = new Blob([clearedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      setOutFileName(`unrestricted_${file.name}`);
      setProgress(100);
      setSuccess('All Owner restrictions, copying, modification, and printing blocks have been stripped. PDF is fully unlocked!');

    } catch (err: any) {
      setError(err.message || 'Failed to remove document restrictions. File may have complex dynamic encryption.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPassword('');
    setError(null);
    setSuccess(null);
    setDownloadUrl(null);
    setProgress(0);
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', padding: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary-color) 0%, #007a75 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Lock size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>
                PDF Security Suite
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                Protect files, unlock secured containers, or strip usage restrictions 100% locally.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', background: 'var(--glass-border)', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            {(['protect', 'unlock', 'restrictions'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); resetAll(); }}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: mode === m ? 'var(--primary-color)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--text-color)',
                  fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                  textTransform: 'uppercase', transition: 'all 0.2s'
                }}
              >
                {m === 'restrictions' ? 'Strip Blocks' : m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '24px 0' }} />

        {/* Alerts */}
        {error && (
          <div style={{
            marginBottom: '20px', padding: '14px 18px', borderRadius: '12px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <AlertTriangle size={18} color="#ef4444" />
            <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            marginBottom: '20px', padding: '14px 18px', borderRadius: '12px',
            background: 'rgba(0,161,155,0.08)', border: '1px solid rgba(0,161,155,0.3)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <CheckCircle size={18} color="var(--primary-color)" />
            <span style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 600 }}>{success}</span>
          </div>
        )}

        {/* Workspace Form */}
        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--glass-border)',
              borderRadius: '16px', padding: '54px 24px', textAlign: 'center',
              cursor: 'pointer', transition: 'var(--transition-smooth)',
            }}
          >
            <Upload size={40} color="var(--primary-color)" style={{ marginBottom: '14px' }} />
            <p style={{ fontWeight: 700, fontSize: '1.05rem', margin: '0 0 6px', color: 'var(--text-color)' }}>
              {mode === 'protect' ? 'Select a PDF to encrypt' : mode === 'unlock' ? 'Select a locked (.secured.pdf) container' : 'Select a restricted PDF to strip'}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 16px' }}>
              Drag and drop your file here, or click to browse local files
            </p>
            <span style={{
              fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px',
              background: 'var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 600
            }}>
              Client-First Sandboxing
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={mode === 'unlock' ? '.pdf' : 'application/pdf'}
          style={{ display: 'none' }}
          onChange={handleUpload}
        />

        {/* Selected file view */}
        {file && !isProcessing && !downloadUrl && (
          <div className="glass-panel" style={{ margin: 0, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <FileText size={32} color="var(--primary-color)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={resetAll}
                style={{
                  background: 'none', border: '1px solid var(--glass-border)', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px'
                }}
              >
                Change File
              </button>
            </div>

            {/* Input field for Password if in Protect or Unlock mode */}
            {mode !== 'restrictions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-color)' }}>
                  {mode === 'protect' ? 'Set Encryption Password' : 'Enter Decryption Password'}
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a secure password..."
                  required
                />
              </div>
            )}

            {/* Action Trigger Button */}
            <button
              onClick={mode === 'protect' ? handleProtect : mode === 'unlock' ? handleUnlock : handleRemoveRestrictions}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: 'var(--primary-color)', color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {mode === 'protect' ? (
                <><Lock size={16} /> Password Protect Document</>
              ) : mode === 'unlock' ? (
                <><Unlock size={16} /> Decrypt PDF Container</>
              ) : (
                <><ShieldAlert size={16} /> Strip Restriction Flags</>
              )}
            </button>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="glass-panel" style={{ margin: 0, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
            <ReusableLoading type="spinner" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{statusText}</h3>
              <div style={{ width: '250px', height: '6px', background: 'var(--glass-border)', borderRadius: '10px', overflow: 'hidden', marginTop: '12px' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.2s' }} />
              </div>
            </div>
          </div>
        )}

        {/* Download Section */}
        {downloadUrl && (
          <div className="glass-panel" style={{ margin: 0, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(0,161,155,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)'
            }}>
              <CheckCircle size={30} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Operation Complete</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Files have been encrypted, decrypted, or cleared on your local CPU.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href={downloadUrl}
                download={outFileName}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '10px 20px' }}
              >
                <Download size={16} /> Download Result File
              </a>
              <button
                onClick={resetAll}
                className="btn btn-secondary"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-color)', cursor: 'pointer', padding: '10px 20px' }}
              >
                Start Over
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
