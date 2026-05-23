'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Download, Copy, Check, Info, Wifi, FileText, ArrowRight } from 'lucide-react';

interface FileMessage {
  code: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  dataUrl: string;
  timestamp: number;
}

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit for BroadcastChannel

export default function P2PFileShare() {
  const [mode, setMode] = useState<'send' | 'receive'>('send');
  const [file, setFile] = useState<File | null>(null);
  const [shareCode, setShareCode] = useState('');
  const [receiveCode, setReceiveCode] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'sharing' | 'waiting' | 'received' | 'error'>('idle');
  const [receivedFile, setReceivedFile] = useState<FileMessage | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const channelRef = useRef<BroadcastChannel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { channelRef.current?.close(); };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) {
      setErrorMsg(`File too large. Max 5 MB. Your file: ${formatSize(f.size)}`);
      setStatus('error');
      return;
    }
    setFile(f); setStatus('idle'); setErrorMsg('');
  };

  const shareFile = useCallback(() => {
    if (!file) return;
    const code = generateCode();
    setShareCode(code);
    setStatus('sharing');
    setProgress(0);

    const reader = new FileReader();
    reader.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 60)); };
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProgress(80);

      // Open BroadcastChannel on code
      const ch = new BroadcastChannel(`p2p_share_${code}`);
      channelRef.current = ch;

      const msg: FileMessage = { code, fileName: file.name, fileSize: file.size, fileType: file.type, dataUrl, timestamp: Date.now() };

      // Listen for receiver ping
      ch.onmessage = (e) => {
        if (e.data?.type === 'REQUEST') {
          ch.postMessage({ type: 'FILE', ...msg });
          setProgress(100);
          setStatus('received'); // sender view: "sent"
        }
      };
      setProgress(100);
    };
    reader.readAsDataURL(file);
  }, [file]);

  const receiveFile = useCallback(() => {
    if (!receiveCode.trim()) return;
    const code = receiveCode.trim().toUpperCase();
    setStatus('waiting');

    const ch = new BroadcastChannel(`p2p_share_${code}`);
    channelRef.current = ch;
    ch.onmessage = (e) => {
      if (e.data?.type === 'FILE') {
        setReceivedFile(e.data as FileMessage);
        setStatus('received');
        ch.close();
      }
    };
    // Send request
    ch.postMessage({ type: 'REQUEST', code });

    // Timeout after 30s
    setTimeout(() => {
      if (status === 'waiting') {
        setStatus('error');
        setErrorMsg('No sender found with that code. Make sure the sender tab is open.');
        ch.close();
      }
    }, 30000);
  }, [receiveCode, status]);

  const downloadReceived = () => {
    if (!receivedFile) return;
    const a = document.createElement('a');
    a.href = receivedFile.dataUrl;
    a.download = receivedFile.fileName;
    a.click();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    channelRef.current?.close();
    setFile(null); setShareCode(''); setReceiveCode(''); setProgress(0);
    setStatus('idle'); setReceivedFile(null); setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ padding: '10px 0' }}>
      {/* Info banner */}
      <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <Info size={16} color="var(--primary-color)" style={{ marginTop: '1px', flexShrink: 0 }} />
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>How it works:</strong> Uses the BroadcastChannel API to transfer files between tabs on the same browser/origin. Open this tool in two tabs — one as Sender, one as Receiver — then share the code. Max file size: 5 MB.
        </span>
      </div>

      {/* Mode Switcher */}
      <div className="glass-panel" style={{ padding: '6px', marginBottom: '16px', display: 'inline-flex', borderRadius: '14px' }}>
        {(['send', 'receive'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); reset(); }} style={{ padding: '10px 28px', borderRadius: '10px', border: 'none', background: mode === m ? 'var(--primary-color)' : 'transparent', color: mode === m ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '7px' }}>
            {m === 'send' ? <Share2 size={15} /> : <Download size={15} />}
            {m === 'send' ? 'Send File' : 'Receive File'}
          </button>
        ))}
      </div>

      {/* SEND MODE */}
      {mode === 'send' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Upload area */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Share2 size={18} color="var(--primary-color)" /> Select File to Share</h3>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '32px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s' }}
              onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-color)'; }}
              onDragLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)'; }}
              onDrop={e => {
                e.preventDefault();
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)';
                const f = e.dataTransfer.files[0];
                if (f) { if (f.size > MAX_FILE_SIZE) { setErrorMsg(`Too large. Max 5 MB.`); setStatus('error'); } else { setFile(f); setStatus('idle'); setErrorMsg(''); } }
              }}
            >
              <FileText size={36} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '10px' }} />
              {file ? (
                <div>
                  <div style={{ fontWeight: 700 }}>{file.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{formatSize(file.size)} · {file.type || 'Unknown type'}</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Drop file here or click to browse</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Max 5 MB</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" onChange={handleFileSelect} style={{ display: 'none' }} />

            {status === 'error' && <div style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '10px', fontWeight: 600 }}>{errorMsg}</div>}

            {progress > 0 && status === 'sharing' && (
              <div style={{ marginTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}><span>Reading file...</span><span>{progress}%</span></div>
                <div style={{ height: '6px', background: 'var(--glass-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.3s', borderRadius: '3px' }} />
                </div>
              </div>
            )}

            <button
              onClick={shareFile}
              disabled={!file || status === 'sharing'}
              style={{ width: '100%', marginTop: '16px', padding: '12px', border: 'none', borderRadius: '10px', background: file ? 'var(--primary-color)' : 'var(--glass-bg)', color: file ? 'white' : 'var(--text-secondary)', cursor: file ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', transition: 'all 0.2s' }}
            >
              <Wifi size={16} /> Share File
            </button>
          </div>

          {/* Share Code */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            {shareCode ? (
              <>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 10px' }}>Share this code with the receiver:</p>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '6px', color: 'var(--primary-color)', fontFamily: 'monospace', padding: '16px 24px', background: 'rgba(99,102,241,0.1)', borderRadius: '14px', border: '2px solid rgba(99,102,241,0.3)' }}>{shareCode}</div>
                </div>
                <button onClick={copyCode} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-color)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  {copied ? <><Check size={15} color="#10b981" /> Copied!</> : <><Copy size={15} /> Copy Code</>}
                </button>
                {status === 'received' && <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={16} /> File sent successfully!</div>}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>Open this tool in another tab, switch to "Receive File", and enter the code above.</div>
                <button onClick={reset} style={{ padding: '8px 16px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>Reset</button>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <ArrowRight size={32} opacity={0.3} />
                <p style={{ fontSize: '0.85rem', marginTop: '10px' }}>Select a file and click "Share File" to get a share code</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECEIVE MODE */}
      {mode === 'receive' && (
        <div className="glass-panel" style={{ padding: '28px', maxWidth: '480px', margin: '0 auto' }}>
          <h3 style={{ fontWeight: 700, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Download size={18} color="var(--primary-color)" /> Receive File</h3>

          {status !== 'received' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>ENTER SHARE CODE</label>
                <input
                  value={receiveCode}
                  onChange={e => setReceiveCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A1B2C3"
                  maxLength={6}
                  className="form-input"
                  style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.3rem', fontWeight: 800, fontFamily: 'monospace' }}
                />
              </div>
              {status === 'error' && <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}>{errorMsg}</div>}
              <button
                onClick={receiveFile}
                disabled={receiveCode.length < 3 || status === 'waiting'}
                style={{ padding: '12px', border: 'none', borderRadius: '10px', background: 'var(--primary-color)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}
              >
                {status === 'waiting' ? '⏳ Waiting for sender...' : <><Wifi size={16} /> Connect & Receive</>}
              </button>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                The sender must have this tool open with the share code active.
              </p>
            </div>
          )}

          {status === 'received' && receivedFile && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={28} color="#10b981" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{receivedFile.fileName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{formatSize(receivedFile.fileSize)} · {receivedFile.fileType || 'Unknown'}</div>
              </div>
              <button onClick={downloadReceived} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '12px 24px', border: 'none', borderRadius: '10px', background: '#10b981', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
                <Download size={16} /> Download File
              </button>
              <button onClick={reset} style={{ padding: '8px 16px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>Receive Another</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
