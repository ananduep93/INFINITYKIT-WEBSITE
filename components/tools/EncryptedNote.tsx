'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Unlock, Copy, Check, FileText, Sparkles, RefreshCw } from 'lucide-react';

export default function EncryptedNote() {
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt'>('encrypt');
  
  // Encrypt states
  const [noteToEncrypt, setNoteToEncrypt] = useState('');
  const [encryptKey, setEncryptKey] = useState('');
  const [encryptedOutput, setEncryptedOutput] = useState('');
  const [encryptCopied, setEncryptCopied] = useState(false);

  // Decrypt states
  const [cipherInput, setCipherInput] = useState('');
  const [decryptKey, setDecryptKey] = useState('');
  const [decryptedOutput, setDecryptedOutput] = useState('');
  const [decryptError, setDecryptError] = useState('');

  // Auto-detect sharing payload in URL search params on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sharedNote = params.get('note') || params.get('payload');
      if (sharedNote) {
        setCipherInput(sharedNote);
        setActiveTab('decrypt');
      }
    }
  }, []);

  // Symmetric XOR Cipher helper supporting safe UTF-8 encoding
  const xorCipher = (input: string, key: string): string => {
    if (!key) return input;
    let output = '';
    for (let i = 0; i < input.length; i++) {
      const charCode = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      output += String.fromCharCode(charCode);
    }
    return output;
  };

  const handleEncrypt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteToEncrypt.trim() || !encryptKey.trim()) return;

    try {
      // 1. Safe UTF-8 translation
      const utf8String = encodeURIComponent(noteToEncrypt);
      // 2. XOR encryption
      const cipherText = xorCipher(utf8String, encryptKey);
      // 3. Base64 export
      const base64 = btoa(cipherText);
      setEncryptedOutput(base64);
    } catch (err) {
      alert('Encryption failed. Please use standard characters.');
    }
  };

  const handleDecrypt = (e: React.FormEvent) => {
    e.preventDefault();
    setDecryptError('');
    setDecryptedOutput('');
    
    if (!cipherInput.trim() || !decryptKey.trim()) return;

    try {
      // 1. Base64 translation back
      const cipherText = atob(cipherInput.trim());
      // 2. XOR decryption
      const utf8String = xorCipher(cipherText, decryptKey);
      // 3. UTF-8 translation back
      const rawText = decodeURIComponent(utf8String);
      
      setDecryptedOutput(rawText);
    } catch (err) {
      setDecryptError('Decryption failed! The passkey is incorrect, or the encrypted payload has been corrupted.');
    }
  };

  const copyShareLink = () => {
    if (!encryptedOutput) return;
    const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
    const shareUrl = `${baseUrl}?note=${encodeURIComponent(encryptedOutput)}`;
    navigator.clipboard.writeText(shareUrl);
    setEncryptCopied(true);
    setTimeout(() => setEncryptCopied(false), 2000);
  };

  const copyEncryptedString = () => {
    if (!encryptedOutput) return;
    navigator.clipboard.writeText(encryptedOutput);
    setEncryptCopied(true);
    setTimeout(() => setEncryptCopied(false), 2000);
  };

  const resetEncrypt = () => {
    setNoteToEncrypt('');
    setEncryptKey('');
    setEncryptedOutput('');
  };

  const resetDecrypt = () => {
    setCipherInput('');
    setDecryptKey('');
    setDecryptedOutput('');
    setDecryptError('');
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '750px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Dead Drop Encrypted Notes
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Symmetrically encrypt private messages locally using XOR ciphers and passkeys. Create self-contained sharing payloads.
      </p>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--glass-border)',
        marginBottom: '25px',
        gap: '20px'
      }}>
        <button
          onClick={() => setActiveTab('encrypt')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'encrypt' ? '3px solid var(--primary-color)' : '3px solid transparent',
            color: activeTab === 'encrypt' ? 'var(--text-color)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '1rem',
            padding: '10px 5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition-smooth)'
          }}
        >
          <Lock size={16} /> Encrypt Note
        </button>
        <button
          onClick={() => setActiveTab('decrypt')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'decrypt' ? '3px solid var(--primary-color)' : '3px solid transparent',
            color: activeTab === 'decrypt' ? 'var(--text-color)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '1rem',
            padding: '10px 5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition-smooth)'
          }}
        >
          <Unlock size={16} /> Decrypt Note
        </button>
      </div>

      {/* Tab Contents: ENCRYPT */}
      {activeTab === 'encrypt' ? (
        <form onSubmit={handleEncrypt} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Secret Message / Note</label>
            <textarea
              value={noteToEncrypt}
              onChange={(e) => setNoteToEncrypt(e.target.value)}
              placeholder="Type your sensitive note here..."
              required
              className="form-textarea"
              style={{ height: '140px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Secret Passkey (Keep this safe!)</label>
            <input
              type="password"
              value={encryptKey}
              onChange={(e) => setEncryptKey(e.target.value)}
              placeholder="e.g. MySuperSecureKey123!"
              required
              className="form-input"
            />
          </div>

          {!encryptedOutput ? (
            <button type="submit" className="btn" style={{ width: '100%' }}>
              <Lock size={18} /> Encrypt and Generate Payload
            </button>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              background: 'rgba(0, 161, 155, 0.03)',
              border: '1px solid rgba(0, 161, 155, 0.15)',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                🔒 Note Successfully Encrypted
              </h4>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Encrypted Payload (Base64)</label>
                <textarea
                  readOnly
                  value={encryptedOutput}
                  className="form-textarea"
                  style={{ height: '80px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="btn"
                  style={{ flex: 1, minWidth: '180px', padding: '10px 15px', borderRadius: '10px', fontSize: '0.85rem' }}
                >
                  {encryptCopied ? <Check size={16} /> : <Copy size={16} />}
                  {encryptCopied ? 'Link Copied!' : 'Copy Decryption Link'}
                </button>
                <button
                  type="button"
                  onClick={copyEncryptedString}
                  className="btn btn-secondary"
                  style={{ padding: '10px 15px', borderRadius: '10px', fontSize: '0.85rem' }}
                >
                  Copy Payload
                </button>
                <button
                  type="button"
                  onClick={resetEncrypt}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginLeft: 'auto'
                  }}
                >
                  <RefreshCw size={14} /> Clear
                </button>
              </div>
            </div>
          )}
        </form>
      ) : (
        /* Tab Contents: DECRYPT */
        <form onSubmit={handleDecrypt} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Encrypted Payload (Base64)</label>
            <textarea
              value={cipherInput}
              onChange={(e) => setCipherInput(e.target.value)}
              placeholder="Paste encrypted base64 payload here..."
              required
              className="form-textarea"
              style={{ height: '100px', fontFamily: 'monospace', fontSize: '0.8rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Secret Passkey</label>
            <input
              type="password"
              value={decryptKey}
              onChange={(e) => setDecryptKey(e.target.value)}
              placeholder="Enter the corresponding secret key"
              required
              className="form-input"
            />
          </div>

          {decryptError && (
            <div style={{
              padding: '12px 18px',
              borderRadius: '8px',
              backgroundColor: 'rgba(220, 53, 69, 0.05)',
              border: '1px solid rgba(220, 53, 69, 0.15)',
              color: 'var(--error-color)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              {decryptError}
            </div>
          )}

          {!decryptedOutput ? (
            <button type="submit" className="btn" style={{ width: '100%' }}>
              <Unlock size={18} /> Decrypt Message
            </button>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              background: 'rgba(40, 167, 69, 0.03)',
              border: '1px solid rgba(40, 167, 69, 0.15)',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} /> Note Decrypted Successfully
              </h4>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Decrypted Message</label>
                <div style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  padding: '15px',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-color)'
                }}>
                  {decryptedOutput}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(decryptedOutput);
                    alert('Decrypted note copied to clipboard!');
                  }}
                  className="btn"
                  style={{ padding: '10px 18px', borderRadius: '10px', fontSize: '0.85rem' }}
                >
                  <Copy size={16} /> Copy Message
                </button>
                <button
                  type="button"
                  onClick={resetDecrypt}
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px', borderRadius: '10px', fontSize: '0.85rem' }}
                >
                  <RefreshCw size={16} /> Clear Note
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* Security Tip Banner */}
      <div style={{
        marginTop: '25px',
        padding: '15px',
        borderRadius: '10px',
        backgroundColor: 'rgba(0, 161, 155, 0.05)',
        border: '1px solid rgba(0, 161, 155, 0.15)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Sparkles size={18} color="var(--primary-color)" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          <strong>Zero Server Footprint:</strong> InfinityKit does not store any of your private texts, decrypted notes, or passwords on cloud database servers. The encryption and decryption cycle operates purely inside your local browser memory space.
        </div>
      </div>
    </div>
  );
}
