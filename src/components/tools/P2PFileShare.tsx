'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Download, Copy, Check, Info, Wifi, FileText, ArrowRight, Loader2, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';

interface FileMessage {
  fileName: string;
  fileSize: number;
  fileType: string;
  totalChunks: number;
}

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSpeed(bytesPerSec: number) {
  if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB limit
const CHUNK_SIZE = 64 * 1024; // 64 KB WebRTC data chunk size for high cross-browser compatibility

export default function P2PFileShare() {
  const [mode, setMode] = useState<'send' | 'receive'>('send');
  const [file, setFile] = useState<File | null>(null);
  const [shareCode, setShareCode] = useState('');
  const [receiveCode, setReceiveCode] = useState('');
  const [progress, setProgress] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState(0);
  const [status, setStatus] = useState<'idle' | 'initializing' | 'waiting' | 'connecting' | 'transferring' | 'completed' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [incomingFile, setIncomingFile] = useState<FileMessage | null>(null);
  const [peerInstance, setPeerInstance] = useState<any>(null);
  const [peerLoading, setPeerLoading] = useState(true);

  // Refs for tracking network transfer data across renders
  const connectionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chunksBufferRef = useRef<ArrayBuffer[]>([]);
  const currentChunkIndexRef = useRef<number>(0);
  const arrayBufferRef = useRef<ArrayBuffer | null>(null);
  const transferStartTimeRef = useRef<number>(0);
  const transferBytesSentRef = useRef<number>(0);

  // 1. Dynamic import of PeerJS for client-side execution only (avoid Next.js SSR crashes)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('peerjs')
        .then((module) => {
          setPeerInstance(() => module.default);
          setPeerLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load PeerJS module dynamically:', err);
          setErrorMsg('Failed to load WebRTC engine. Please reload the page.');
          setStatus('error');
          setPeerLoading(false);
        });
    }
    return () => {
      cleanupConnection();
    };
  }, []);

  const cleanupConnection = () => {
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    chunksBufferRef.current = [];
    currentChunkIndexRef.current = 0;
    arrayBufferRef.current = null;
  };

  const reset = () => {
    cleanupConnection();
    setFile(null);
    setShareCode('');
    setReceiveCode('');
    setProgress(0);
    setTransferSpeed(0);
    setIncomingFile(null);
    setStatus('idle');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 2. Sender side logic
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) {
      setErrorMsg(`File too large. Max 50 MB. Your file is ${formatSize(f.size)}.`);
      setStatus('error');
      return;
    }
    setFile(f);
    setStatus('idle');
    setErrorMsg('');
  };

  // Helper to slice and send a specific chunk
  const sendChunk = useCallback((conn: any, index: number) => {
    if (!arrayBufferRef.current) return;
    const arrayBuffer = arrayBufferRef.current;
    const start = index * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, arrayBuffer.byteLength);
    const chunk = arrayBuffer.slice(start, end);

    conn.send({
      type: 'CHUNK',
      index: index,
      data: chunk,
    });

    transferBytesSentRef.current += chunk.byteLength;
    
    // Calculate and update transfer speed
    const duration = (Date.now() - transferStartTimeRef.current) / 1000;
    if (duration > 0) {
      setTransferSpeed(transferBytesSentRef.current / duration);
    }
  }, []);

  const initSenderPeer = useCallback(() => {
    if (!peerInstance || !file) return;
    cleanupConnection();
    setStatus('initializing');
    setErrorMsg('');

    const code = generateCode();
    // Connect to public cloud PeerJS server with our custom 6 character code
    const peer = new peerInstance(code, {
      debug: 1,
    });

    peer.on('open', (id: string) => {
      setShareCode(id);
      setStatus('waiting');
    });

    peer.on('connection', (conn: any) => {
      connectionRef.current = conn;
      setStatus('connecting');

      conn.on('open', () => {
        setStatus('transferring');
        setProgress(0);
        setTransferSpeed(0);
        transferStartTimeRef.current = Date.now();
        transferBytesSentRef.current = 0;

        // Read selected file as ArrayBuffer
        const reader = new FileReader();
        reader.onload = (e) => {
          const ab = e.target?.result as ArrayBuffer;
          arrayBufferRef.current = ab;
          const totalChunks = Math.ceil(ab.byteLength / CHUNK_SIZE);

          // Send START metadata
          conn.send({
            type: 'START',
            name: file.name,
            size: file.size,
            mime: file.type,
            totalChunks: totalChunks,
          });
        };
        reader.readAsArrayBuffer(file);
      });

      // Handle receiving connection control and ACKs
      conn.on('data', (data: any) => {
        if (data.type === 'ACK') {
          const ackIndex = data.index;
          const totalChunks = Math.ceil((arrayBufferRef.current?.byteLength || 0) / CHUNK_SIZE);

          // Update progress
          const nextIndex = ackIndex + 1;
          setProgress(Math.round((nextIndex / totalChunks) * 100));

          if (nextIndex < totalChunks) {
            sendChunk(conn, nextIndex);
          } else {
            // Transfer complete
            conn.send({ type: 'DONE' });
            setStatus('completed');
            peer.destroy(); // Free public room resource
          }
        }
      });

      conn.on('close', () => {
        if (status !== 'completed') {
          setErrorMsg('Receiver disconnected before the transfer completed.');
          setStatus('error');
        }
      });

      conn.on('error', (err: any) => {
        console.error('Data connection error:', err);
        setErrorMsg('Data channel connection failed. Try again.');
        setStatus('error');
      });
    });

    peer.on('error', (err: any) => {
      console.error('Sender peer error:', err);
      if (err.type === 'unavailable-id') {
        // Regenerate and retry if ID is occupied
        peer.destroy();
        setTimeout(() => {
          initSenderPeer();
        }, 500);
      } else {
        setErrorMsg(`Failed to connect to signal server: ${err.message}`);
        setStatus('error');
        peer.destroy();
      }
    });
  }, [peerInstance, file, sendChunk, status]);

  // 3. Receiver side logic
  const initReceiverPeer = useCallback(() => {
    if (!peerInstance || !receiveCode.trim()) return;
    cleanupConnection();
    setStatus('connecting');
    setErrorMsg('');

    const targetCode = receiveCode.trim().toUpperCase();
    // Connect as client on random temporary ID
    const peer = new peerInstance({
      debug: 1,
    });

    peer.on('open', () => {
      const conn = peer.connect(targetCode, {
        reliable: true,
      });
      connectionRef.current = conn;

      conn.on('open', () => {
        // Receiver successfully linked to sender
        setStatus('waiting');
        chunksBufferRef.current = [];
        currentChunkIndexRef.current = 0;
        transferStartTimeRef.current = Date.now();
        transferBytesSentRef.current = 0;
      });

      conn.on('data', (data: any) => {
        if (data.type === 'START') {
          // File details arrived
          setIncomingFile({
            fileName: data.name,
            fileSize: data.size,
            fileType: data.mime,
            totalChunks: data.totalChunks,
          });
          setStatus('transferring');
          setProgress(0);
          setTransferSpeed(0);
          chunksBufferRef.current = [];
          currentChunkIndexRef.current = 0;

          // Acknowledge metadata and request the first chunk
          conn.send({ type: 'ACK', index: -1 });
        } else if (data.type === 'CHUNK') {
          const { index, data: chunkBuffer } = data;
          
          if (index === currentChunkIndexRef.current) {
            chunksBufferRef.current.push(chunkBuffer);
            currentChunkIndexRef.current++;
            
            // Calculate progress and transfer speed
            const total = incomingFile?.totalChunks || data.totalChunks || 1;
            setProgress(Math.round((currentChunkIndexRef.current / total) * 100));
            
            transferBytesSentRef.current += chunkBuffer.byteLength;
            const duration = (Date.now() - transferStartTimeRef.current) / 1000;
            if (duration > 0) {
              setTransferSpeed(transferBytesSentRef.current / duration);
            }

            // Send ACK to request the next chunk
            conn.send({ type: 'ACK', index: index });
          }
        } else if (data.type === 'DONE') {
          // All chunks loaded, compile buffers into a final Blob
          setStatus('completed');
          peer.destroy(); // Cleanup signaling connection
        }
      });

      conn.on('close', () => {
        if (status !== 'completed') {
          setErrorMsg('Sender closed connection or went offline.');
          setStatus('error');
        }
      });

      conn.on('error', (err: any) => {
        console.error('Receiver connection error:', err);
        setErrorMsg('Data channel connection failed.');
        setStatus('error');
      });
    });

    peer.on('error', (err: any) => {
      console.error('Receiver peer error:', err);
      setErrorMsg(`Connection failed: Code might be incorrect or sender went offline.`);
      setStatus('error');
      peer.destroy();
    });
  }, [peerInstance, receiveCode, incomingFile, status]);

  const downloadReceivedFile = () => {
    if (chunksBufferRef.current.length === 0 || !incomingFile) return;
    
    // Assemble the ArrayBuffers into a compiled single Blob
    const blob = new Blob(chunksBufferRef.current, { type: incomingFile.fileType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = incomingFile.fileName;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup reference
    document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (peerLoading) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <Loader2 size={36} color="var(--primary-color)" className="animate-spin" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontWeight: 700, margin: 0 }}>Initializing WebRTC Engine...</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>Preparing client-side P2P channels.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px 0' }}>
      {/* Information Banner */}
      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid var(--glass-border)', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <Info size={20} color="var(--primary-color)" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-color)' }}>Direct Multi-Device Sharing:</strong> Uses **PeerJS WebRTC** to create a secure, direct in-browser connection between two devices (phones, laptops, tablets) without uploading the file to any intermediate server. 
          <div style={{ marginTop: '4px' }}>• Maximum limit is **50 MB** for high efficiency chunking. Make sure this tab remains active during the transfer.</div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="glass-panel" style={{ padding: '6px', marginBottom: '24px', display: 'inline-flex', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
        {(['send', 'receive'] as const).map(m => (
          <button 
            key={m} 
            onClick={() => { setMode(m); reset(); }} 
            style={{ 
              padding: '10px 28px', 
              borderRadius: '10px', 
              border: 'none', 
              background: mode === m ? 'var(--primary-gradient)' : 'transparent', 
              color: mode === m ? 'white' : 'var(--text-secondary)', 
              cursor: 'pointer', 
              fontWeight: 700, 
              fontSize: '0.9rem', 
              transition: 'all 0.2s', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}
          >
            {m === 'send' ? <Share2 size={16} /> : <Download size={16} />}
            {m === 'send' ? 'Send File' : 'Receive File'}
          </button>
        ))}
      </div>

      {/* ─── SEND MODE ─── */}
      {mode === 'send' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* SENDER COLUMN 1: File Selection & Control */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Share2 size={20} color="var(--primary-color)" /> Select File to Share
            </h3>

            {/* Drop / Drag Area */}
            <div
              onClick={() => status !== 'transferring' && fileInputRef.current?.click()}
              style={{ 
                border: '2px dashed var(--glass-border)', 
                borderRadius: '16px', 
                padding: '40px 20px', 
                textAlign: 'center', 
                cursor: status === 'transferring' ? 'not-allowed' : 'pointer', 
                transition: 'all 0.3s',
                background: file ? 'rgba(99,102,241,0.03)' : 'rgba(0,0,0,0.01)',
              }}
              onDragOver={e => { e.preventDefault(); if (status !== 'transferring') (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-color)'; }}
              onDragLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)'; }}
              onDrop={e => {
                e.preventDefault();
                if (status === 'transferring') return;
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)';
                const f = e.dataTransfer.files[0];
                if (f) { 
                  if (f.size > MAX_FILE_SIZE) { 
                    setErrorMsg(`Too large. Max 50 MB. Loaded: ${formatSize(f.size)}`); 
                    setStatus('error'); 
                  } else { 
                    setFile(f); 
                    setStatus('idle'); 
                    setErrorMsg(''); 
                  } 
                }
              }}
            >
              <FileText size={42} color="var(--text-secondary)" style={{ opacity: file ? 0.8 : 0.4, marginBottom: '12px', margin: '0 auto 10px' }} />
              {file ? (
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-color)', wordBreak: 'break-all' }}>{file.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    {formatSize(file.size)} · {file.type || 'Generic Binary'}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px', color: 'var(--text-color)' }}>Drag & drop file here or click to browse</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Maximum allowed: 50 MB</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" onChange={handleFileSelect} style={{ display: 'none' }} disabled={status === 'transferring'} />

            {/* Error Message */}
            {status === 'error' && (
              <div style={{ display: 'flex', gap: '8px', color: '#ef4444', fontSize: '0.84rem', marginTop: '16px', background: 'rgba(239,68,68,0.06)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.15)', alignItems: 'center' }}>
                <XCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Transfer State & Progress Card */}
            {status === 'transferring' && (
              <div style={{ marginTop: '20px', background: 'var(--glass-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Loader2 size={12} className="animate-spin" /> Transferring File...
                  </span>
                  <span style={{ fontWeight: 700 }}>{progress}%</span>
                </div>
                
                {/* Progress bar container */}
                <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-gradient)', transition: 'width 0.1s ease-out', borderRadius: '4px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  <span>Speed: <strong>{formatSpeed(transferSpeed)}</strong></span>
                  <span>Direct Peer Link</span>
                </div>
              </div>
            )}

            {/* Status Summary Banner */}
            {status === 'completed' && (
              <div style={{ display: 'flex', gap: '8px', color: '#10b981', fontSize: '0.86rem', marginTop: '16px', background: 'rgba(16,185,129,0.06)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.15)', alignItems: 'center', fontWeight: 600 }}>
                <Check size={18} style={{ flexShrink: 0 }} />
                <span>File uploaded and fully downloaded by the receiver! ✅</span>
              </div>
            )}

            <button
              onClick={initSenderPeer}
              disabled={!file || status === 'transferring' || status === 'initializing'}
              style={{ 
                width: '100%', 
                marginTop: '20px', 
                padding: '12px', 
                border: 'none', 
                borderRadius: '12px', 
                background: file && status !== 'transferring' ? 'var(--primary-gradient)' : 'var(--glass-bg)', 
                color: file && status !== 'transferring' ? 'white' : 'var(--text-secondary)', 
                cursor: file && status !== 'transferring' ? 'pointer' : 'not-allowed', 
                fontWeight: 700, 
                fontSize: '0.92rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px', 
                transition: 'all 0.2s',
                boxShadow: file && status !== 'transferring' ? 'var(--neon-shadow)' : 'none'
              }}
            >
              {status === 'initializing' ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Registering Code...
                </>
              ) : (
                <>
                  <Wifi size={16} /> Share & Get Code
                </>
              )}
            </button>
          </div>

          {/* SENDER COLUMN 2: Share code Display */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', minHeight: '300px' }}>
            {shareCode ? (
              <>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '0 0 10px' }}>Open this tool on the receiver device and enter this code:</p>
                  <div style={{ 
                    fontSize: '2.8rem', 
                    fontWeight: 900, 
                    letterSpacing: '6px', 
                    color: 'var(--primary-color)', 
                    fontFamily: 'monospace', 
                    padding: '20px 32px', 
                    background: 'rgba(99,102,241,0.06)', 
                    borderRadius: '16px', 
                    border: '2px solid rgba(99,102,241,0.2)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    {shareCode}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={copyCode} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '10px 22px', 
                      borderRadius: '10px', 
                      border: '1px solid var(--glass-border)', 
                      background: 'var(--glass-bg)', 
                      color: 'var(--text-color)', 
                      cursor: 'pointer', 
                      fontWeight: 700, 
                      fontSize: '0.86rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copied ? <><Check size={16} color="#10b981" /> Copied!</> : <><Copy size={16} /> Copy Code</>}
                  </button>

                  <button 
                    onClick={reset} 
                    style={{ 
                      padding: '10px 22px', 
                      border: '1px solid var(--glass-border)', 
                      background: 'transparent', 
                      color: 'var(--text-secondary)', 
                      borderRadius: '10px', 
                      cursor: 'pointer', 
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                  >
                    Cancel
                  </button>
                </div>

                {status === 'waiting' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '10px' }}>
                    <Loader2 size={14} className="animate-spin" /> Waiting for receiver to connect...
                  </div>
                )}
                
                {status === 'connecting' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontSize: '0.82rem', marginTop: '10px', fontWeight: 600 }}>
                    <Loader2 size={14} className="animate-spin" /> Establishing peer handshake...
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                <ArrowRight size={36} opacity={0.3} style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>Select a file first, then click "Share & Get Code" to receive your custom WebRTC sharing pin.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── RECEIVE MODE ─── */}
      {mode === 'receive' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '520px', margin: '0 auto', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.25rem', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Download size={20} color="var(--primary-color)" /> Receive P2P File
          </h3>

          {status !== 'completed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ENTER SHARE CODE
                </label>
                <input
                  value={receiveCode}
                  onChange={e => setReceiveCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A1B2C3"
                  maxLength={6}
                  disabled={status === 'connecting' || status === 'transferring'}
                  className="form-input"
                  style={{ 
                    textAlign: 'center', 
                    letterSpacing: '8px', 
                    fontSize: '1.6rem', 
                    fontWeight: 900, 
                    fontFamily: 'monospace',
                    padding: '14px',
                    borderRadius: '12px',
                    textTransform: 'uppercase'
                  }}
                />
              </div>

              {/* Errors inside receiver block */}
              {status === 'error' && (
                <div style={{ display: 'flex', gap: '8px', color: '#ef4444', fontSize: '0.84rem', background: 'rgba(239,68,68,0.06)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.15)', alignItems: 'center' }}>
                  <XCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Connecting loading card */}
              {status === 'connecting' && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(99,102,241,0.04)', borderRadius: '10px', border: '1px dashed var(--glass-border)', fontSize: '0.85rem' }}>
                  <Loader2 size={16} className="animate-spin" color="var(--primary-color)" />
                  <span>Connecting to peer handshake signal...</span>
                </div>
              )}

              {/* Handshake succeeded, waiting for file metadata */}
              {status === 'waiting' && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(16,185,129,0.04)', borderRadius: '10px', border: '1px dashed rgba(16,185,129,0.2)', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Connected! Waiting for sender to stream file metadata...</span>
                </div>
              )}

              {/* Streaming transfer visual details */}
              {status === 'transferring' && incomingFile && (
                <div style={{ background: 'var(--glass-bg)', padding: '18px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <FileText size={24} color="var(--primary-color)" />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{incomingFile.fileName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Size: {formatSize(incomingFile.fileSize)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Receiving Chunks...</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{progress}%</span>
                  </div>

                  {/* Progress bar container */}
                  <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-gradient)', transition: 'width 0.1s ease-out', borderRadius: '4px' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    <span>Speed: <strong>{formatSpeed(transferSpeed)}</strong></span>
                    <span>P2P Encrypted</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={initReceiverPeer}
                  disabled={receiveCode.length < 6 || status === 'connecting' || status === 'transferring' || status === 'waiting'}
                  style={{ 
                    flex: 1,
                    padding: '12px', 
                    border: 'none', 
                    borderRadius: '12px', 
                    background: receiveCode.length === 6 && status === 'idle' ? 'var(--primary-gradient)' : 'var(--glass-bg)', 
                    color: receiveCode.length === 6 && status === 'idle' ? 'white' : 'var(--text-secondary)', 
                    cursor: receiveCode.length === 6 && status === 'idle' ? 'pointer' : 'not-allowed', 
                    fontWeight: 700, 
                    fontSize: '0.92rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    transition: 'all 0.2s',
                    boxShadow: receiveCode.length === 6 && status === 'idle' ? 'var(--neon-shadow)' : 'none'
                  }}
                >
                  <Wifi size={16} /> Link & Receive
                </button>

                {(status === 'connecting' || status === 'transferring' || status === 'waiting' || status === 'error') && (
                  <button 
                    onClick={reset} 
                    style={{ 
                      padding: '12px 18px', 
                      border: '1px solid var(--glass-border)', 
                      background: 'transparent', 
                      color: 'var(--text-secondary)', 
                      borderRadius: '12px', 
                      cursor: 'pointer', 
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5, margin: '8px 0 0' }}>
                *Note: The sender must remain on this page with their code active to complete the WebRTC direct transfer.
              </p>
            </div>
          )}

          {/* Transfer successfully finalized */}
          {status === 'completed' && incomingFile && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '10px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }}>
                <Check size={32} color="#10b981" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-color)', wordBreak: 'break-all' }}>{incomingFile.fileName}</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Compiled successfully · {formatSize(incomingFile.fileSize)}
                </div>
              </div>

              <button 
                onClick={downloadReceivedFile} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '14px 32px', 
                  border: 'none', 
                  borderRadius: '12px', 
                  background: '#10b981', 
                  color: 'white', 
                  cursor: 'pointer', 
                  fontWeight: 700, 
                  fontSize: '0.94rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.3)'
                }}
              >
                <Download size={18} /> Download Received File
              </button>

              <button 
                onClick={reset} 
                style={{ 
                  padding: '8px 20px', 
                  border: '1px solid var(--glass-border)', 
                  background: 'transparent', 
                  color: 'var(--text-secondary)', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                Receive Another File
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
