'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FileVideo,
  Download,
  Share2,
  RefreshCw,
  Video,
  Play,
  Pause,
  Heart,
  Volume2,
  VolumeX
} from 'lucide-react';
import syncService from '../../lib/sync';
import storageService from '../../lib/storage';

interface VideoConverterSuiteProps {
  initialTarget?: 'mp4' | 'webm' | 'mov' | 'mkv' | 'avi';
}

export default function VideoConverterSuite({ initialTarget = 'webm' }: VideoConverterSuiteProps) {
  const [file, setFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>(initialTarget);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  
  // Share state
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Video playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favs.includes('video-converter'));
      syncService.addToHistory('video-converter');
    }
  }, []);

  const toggleFavorite = () => {
    if (typeof window === 'undefined') return;
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    let updated;
    if (isFavorite) {
      updated = favs.filter((id: string) => id !== 'video-converter');
    } else {
      updated = [...favs, 'video-converter'];
    }
    localStorage.setItem('favorites', JSON.stringify(updated));
    setIsFavorite(!isFavorite);
    syncService.saveFavorite('video-converter', !isFavorite);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) loadVideoFile(uploaded);
  };

  const loadVideoFile = (uploaded: File) => {
    setFile(uploaded);
    setDownloadUrl(null);
    setProcessedBlob(null);
    setShareUrl(null);
    const url = URL.createObjectURL(uploaded);
    setVideoSrc(url);
    setIsPlaying(false);
    setCurrentTime(0);

    // Auto-select complementary format to convert
    const ext = uploaded.name.split('.').pop()?.toLowerCase();
    if (ext === 'mp4') {
      setTargetFormat('webm');
    } else {
      setTargetFormat('mp4');
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(20);
    setDownloadUrl(null);
    setProcessedBlob(null);
    setShareUrl(null);

    const formData = new FormData();
    formData.append('action', 'convert');
    formData.append('file', file);
    formData.append('targetFormat', targetFormat);

    try {
      setProgress(50);
      const response = await fetch('/api/video/process', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let errMsg = 'Server error during conversion.';
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch (e) {
          try {
            const errText = await response.text();
            const cleanText = errText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            if (cleanText) errMsg = cleanText.slice(0, 200);
          } catch (inner) {}
        }
        throw new Error(errMsg);
      }

      setProgress(85);
      const blob = await response.blob();
      setProcessedBlob(blob);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProgress(100);

      // Log activity to Supabase
      syncService.logActivity('Video Converter', `Converted "${file.name}" to ${targetFormat.toUpperCase()}`);
    } catch (err: any) {
      console.error(err);
      alert(`Conversion failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(null), 1000);
    }
  };

  const handleShare = async () => {
    if (!processedBlob || !file) return;
    setIsSharing(true);
    try {
      const ext = targetFormat;
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const exportFile = new File([processedBlob], `${cleanName}_converted.${ext}`, {
        type: processedBlob.type
      });

      const uploadRes = await storageService.uploadFile(exportFile, { isPublic: true });
      setShareUrl(uploadRes.url);
      await navigator.clipboard.writeText(uploadRes.url);
      alert('Shareable link copied to clipboard!');
    } catch (err: any) {
      console.error(err);
      // Fallback
      if (downloadUrl) {
        await navigator.clipboard.writeText(window.location.origin + downloadUrl);
        alert('Local blob link copied to clipboard!');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', minHeight: '500px' }}>
      <style>{`
        .video-suite-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        .video-suite-sidebar {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 16px;
        }
        .video-suite-player-container {
          position: relative;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: #000;
          border: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .format-badge {
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .pulse-active {
          animation: pulseGlow 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Video size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: 0 }}>Video Format Converter</h2>
        </div>
        <button
          onClick={toggleFavorite}
          style={{
            background: 'transparent',
            border: '1px solid var(--glass-border)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isFavorite ? '#ff4757' : 'var(--text-secondary)'
          }}
        >
          <Heart size={20} fill={isFavorite ? '#ff4757' : 'none'} />
        </button>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
        Convert between MP4, WebM, MOV, MKV, and AVI containers instantly.
      </p>

      {/* Dropzone */}
      {!videoSrc ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--glass-border)',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--glass-bg)',
            transition: 'var(--transition-smooth)'
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) loadVideoFile(dropped);
          }}
        >
          <FileVideo size={48} color="var(--primary-color)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Drag & Drop Video to Convert</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Supports MP4, WebM, MOV, MKV, and AVI up to 100MB
          </p>
          <button className="btn-primary" style={{ margin: '0 auto' }}>
            Browse Video Files
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/*"
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="video-suite-grid">
          {/* Left: Preview & Player */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="video-suite-player-container">
              <video
                ref={videoRef}
                src={videoSrc}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                onClick={togglePlay}
              />
              
              {/* Controls */}
              <div style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={togglePlay}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} fill="#fff" />}
                </button>
                <button
                  onClick={toggleMute}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <span style={{ fontSize: '0.78rem', color: '#ccc', minWidth: '80px' }}>
                  {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
                </span>
                
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => {
                    const time = Number(e.target.value);
                    setCurrentTime(time);
                    if (videoRef.current) videoRef.current.currentTime = time;
                  }}
                  style={{ flex: 1, accentColor: 'var(--primary-color)', height: '4px', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Metadata Info */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="format-badge" style={{ background: 'rgba(0, 161, 155, 0.15)', color: 'var(--primary-color)' }}>
                Input: {file?.name.split('.').pop()?.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Size: {(file!.size / (1024 * 1024)).toFixed(2)} MB
              </div>
            </div>

            {progress !== null && (
              <div style={{ padding: '10px 0' }}>
                <div style={{ height: '6px', background: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div 
                    className={progress === 50 ? 'pulse-active' : ''} 
                    style={{ 
                      width: `${progress}%`, 
                      height: '100%', 
                      background: 'var(--primary-color)', 
                      transition: 'width 0.3s ease',
                      boxShadow: progress === 50 ? '0 0 8px var(--primary-color)' : 'none'
                    }} 
                  />
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }} className={progress === 50 ? 'pulse-active' : ''}>
                  {progress === 50 ? (
                    <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                      Transcoding media file on server... (Please wait, converting track streams)
                    </span>
                  ) : (
                    `Converting video tracks... ${progress}%`
                  )}
                </p>
              </div>
            )}

            {/* Download/Share Actions */}
            {downloadUrl && (
              <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0,161,155,0.05)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-color)' }}>Conversion Success!</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={downloadUrl}
                      download={`${file?.name.replace(/\.[^/.]+$/, '')}_converted.${targetFormat}`}
                      className="btn-primary"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.82rem' }}
                    >
                      <Download size={14} /> Download File
                    </a>
                    <button
                      onClick={handleShare}
                      disabled={isSharing}
                      className="btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.82rem' }}
                    >
                      {isSharing ? <RefreshCw size={14} className="animate-spin" /> : <Share2 size={14} />}
                      Share Link
                    </button>
                  </div>
                </div>

                {/* Visual Preview Player for Converted Video */}
                <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: '#000' }}>
                  <video
                    src={downloadUrl}
                    controls
                    style={{ width: '100%', maxHeight: '320px', display: 'block', objectFit: 'contain' }}
                    onError={(e) => {
                      // Silently hide the preview if the browser format is not natively supported (like AVI or MKV)
                      (e.target as HTMLElement).parentElement!.style.display = 'none';
                    }}
                  />
                </div>

                {shareUrl && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '10px', borderRadius: '8px', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                    <strong>Shareable URL:</strong> <a href={shareUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)' }}>{shareUrl}</a>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => {
                setVideoSrc(null);
                setFile(null);
                setDownloadUrl(null);
                setProcessedBlob(null);
                setShareUrl(null);
              }}
              className="btn-secondary"
              style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.8rem' }}
            >
              Change Video File
            </button>
          </div>

          {/* Right: Convert Controls */}
          <div className="video-suite-sidebar">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Target Format
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {(['mp4', 'webm', 'mov', 'mkv', 'avi'] as const).map((fmt) => {
                const isCurrent = file?.name.split('.').pop()?.toLowerCase() === fmt;
                return (
                  <button
                    key={fmt}
                    onClick={() => {
                      if (isCurrent) return;
                      setTargetFormat(fmt);
                      setDownloadUrl(null);
                      setProcessedBlob(null);
                      setShareUrl(null);
                    }}
                    disabled={isCurrent}
                    style={{
                      background: targetFormat === fmt ? 'rgba(0, 161, 155, 0.15)' : 'rgba(255,255,255,0.02)',
                      border: targetFormat === fmt ? '1px solid var(--primary-color)' : '1px solid var(--glass-border)',
                      borderRadius: '10px',
                      padding: '12px',
                      color: targetFormat === fmt ? 'var(--primary-color)' : isCurrent ? 'var(--text-secondary)' : 'var(--text-color)',
                      cursor: isCurrent ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: isCurrent ? 0.4 : 1
                    }}
                  >
                    <span style={{ textTransform: 'uppercase' }}>{fmt}</span>
                    {isCurrent && <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>Current Format</span>}
                    {targetFormat === fmt && !isCurrent && <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)' }}>Selected</span>}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleConvert}
              disabled={isProcessing || !file || file?.name.split('.').pop()?.toLowerCase() === targetFormat}
              style={{
                width: '100%',
                background: 'var(--primary-color)',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: isProcessing || !file || file?.name.split('.').pop()?.toLowerCase() === targetFormat ? 0.6 : 1
              }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Convert to {targetFormat.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
