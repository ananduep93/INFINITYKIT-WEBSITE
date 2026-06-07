'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Wrench,
  Download,
  Share2,
  RefreshCw,
  Play,
  Pause,
  VolumeX,
  Volume2,
  Music,
  Image,
  Film,
  Camera,
  Heart
} from 'lucide-react';
import syncService from '../../lib/sync';
import storageService from '../../lib/storage';

interface VideoUtilitiesSuiteProps {
  initialTab?: 'extract-audio' | 'mute' | 'video-to-gif' | 'extract-thumbnail';
}

export default function VideoUtilitiesSuite({ initialTab = 'extract-audio' }: VideoUtilitiesSuiteProps) {
  const [file, setFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Extract Audio params
  const [audioFormat, setAudioFormat] = useState<string>('mp3');

  // Video to GIF params
  const [gifWidth, setGifWidth] = useState<number>(480);
  const [gifFps, setGifFps] = useState<number>(10);

  // Thumbnail Extractor params
  const [thumbnailTime, setThumbnailTime] = useState<number>(1);

  // Results
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favs.includes('video-utilities'));
      syncService.addToHistory('video-utilities');
    }
  }, []);

  const toggleFavorite = () => {
    if (typeof window === 'undefined') return;
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    let updated;
    if (isFavorite) {
      updated = favs.filter((id: string) => id !== 'video-utilities');
    } else {
      updated = [...favs, 'video-utilities'];
    }
    localStorage.setItem('favorites', JSON.stringify(updated));
    setIsFavorite(!isFavorite);
    syncService.saveFavorite('video-utilities', !isFavorite);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) loadVideoFile(uploaded);
  };

  const loadVideoFile = (uploaded: File) => {
    setFile(uploaded);
    setDownloadUrl(null);
    setResultBlob(null);
    setShareUrl(null);
    const url = URL.createObjectURL(uploaded);
    setVideoSrc(url);
    setIsPlaying(false);
    setCurrentTime(0);
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

  // Set thumbnail capture timestamp to the current video playback head position
  const useCurrentPlaybackTime = () => {
    setThumbnailTime(Number(currentTime.toFixed(2)));
  };

  const handleExecuteUtility = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(15);
    setDownloadUrl(null);
    setResultBlob(null);
    setShareUrl(null);

    const formData = new FormData();
    formData.append('file', file);

    if (activeTab === 'extract-audio') {
      formData.append('action', 'extract-audio');
      formData.append('format', audioFormat);
    } else if (activeTab === 'mute') {
      formData.append('action', 'mute');
    } else if (activeTab === 'video-to-gif') {
      formData.append('action', 'video-to-gif');
      formData.append('gifW', String(gifWidth));
      formData.append('fps', String(gifFps));
    } else if (activeTab === 'extract-thumbnail') {
      formData.append('action', 'extract-thumbnail');
      formData.append('time', String(thumbnailTime));
    }

    try {
      setProgress(50);
      const response = await fetch('/api/video/process', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server processing failed.');
      }

      setProgress(85);
      const blob = await response.blob();
      setResultBlob(blob);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProgress(100);

      syncService.logActivity('Video Utilities', `Ran action "${activeTab}" on "${file.name}"`);
    } catch (err: any) {
      console.error(err);
      alert(`Processing failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(null), 1000);
    }
  };

  const handleShare = async () => {
    if (!resultBlob || !file) return;
    setIsSharing(true);
    try {
      let ext = 'mp4';
      if (activeTab === 'extract-audio') ext = audioFormat;
      else if (activeTab === 'video-to-gif') ext = 'gif';
      else if (activeTab === 'extract-thumbnail') ext = 'png';

      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const exportFile = new File([resultBlob], `utility_${cleanName}.${ext}`, {
        type: resultBlob.type
      });

      const uploadRes = await storageService.uploadFile(exportFile, { isPublic: true });
      setShareUrl(uploadRes.url);
      await navigator.clipboard.writeText(uploadRes.url);
      alert('Shareable link copied to clipboard!');
    } catch (err: any) {
      console.error(err);
      if (downloadUrl) {
        await navigator.clipboard.writeText(window.location.origin + downloadUrl);
        alert('Local blob link copied to clipboard!');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', minHeight: '520px' }}>
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
        @media (max-width: 1024px) {
          .video-suite-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Wrench size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: 0 }}>Video Utility Tools</h2>
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
        Extract MP3 audio streams, mute voice tracks, compile high-quality animated GIFs, or extract high-res PNG frame screenshots.
      </p>

      {/* Upload Dropzone */}
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
          <Wrench size={48} color="var(--primary-color)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Drag & Drop Video here</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Supports MP4, WebM, MOV, MKV, and AVI up to 100MB
          </p>
          <button className="btn-primary" style={{ margin: '0 auto' }}>
            Select Video File
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
          
          {/* Left Panel: Preview & Outputs */}
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

            {/* Progress indicator */}
            {progress !== null && (
              <div style={{ padding: '10px 0' }}>
                <div style={{ height: '6px', background: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.3s ease' }} />
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                  Executing video rendering pipeline... {progress}%
                </p>
              </div>
            )}

            {/* Results Panel */}
            {downloadUrl && (
              <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0,161,155,0.05)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {activeTab === 'extract-thumbnail' && (
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'start', flexWrap: 'wrap' }}>
                    <img
                      src={downloadUrl}
                      alt="Extracted frame thumbnail"
                      style={{
                        width: '180px',
                        height: 'auto',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: '#000'
                      }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Thumbnail Frame Extracted</span>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Frame captured at {thumbnailTime}s and scaled to 640px width PNG output.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'video-to-gif' && (
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'start', flexWrap: 'wrap' }}>
                    <img
                      src={downloadUrl}
                      alt="Compiled animated GIF"
                      style={{
                        width: '180px',
                        height: 'auto',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: '#000'
                      }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Animated GIF Compiled</span>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                        High-fidelity parallelized color palettes generated at {gifFps} FPS.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'extract-audio' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <Music size={24} color="var(--primary-color)" />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>Audio Waveform Extracted</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                          Exported audio track in {audioFormat.toUpperCase()} format.
                        </p>
                      </div>
                    </div>
                    {/* Audio Player Preview */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <audio src={downloadUrl} controls style={{ width: '100%', display: 'block' }} />
                    </div>
                  </div>
                )}

                {activeTab === 'mute' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <Film size={24} color="var(--primary-color)" />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>Video Muted Successfully</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                          Removed all audio channels from the video.
                        </p>
                      </div>
                    </div>
                    {/* Muted Video Player Preview */}
                    <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: '#000' }}>
                      <video
                        src={downloadUrl}
                        controls
                        style={{ width: '100%', maxHeight: '240px', display: 'block', objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                  <a
                    href={downloadUrl}
                    download={`output_${Date.now()}`}
                    className="btn-primary"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.82rem' }}
                  >
                    <Download size={14} /> Download Output
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
                setResultBlob(null);
                setShareUrl(null);
              }}
              className="btn-secondary"
              style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.8rem' }}
            >
              Change Video File
            </button>
          </div>

          {/* Right Panel: Settings */}
          <div className="video-suite-sidebar">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Utility
            </h3>

            {/* Utility Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {(['extract-audio', 'mute', 'video-to-gif', 'extract-thumbnail'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setDownloadUrl(null);
                    setResultBlob(null);
                    setShareUrl(null);
                  }}
                  style={{
                    background: activeTab === tab ? 'rgba(0, 161, 155, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: activeTab === tab ? '1px solid var(--primary-color)' : '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-color)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {tab === 'extract-audio' && <Music size={14} />}
                  {tab === 'mute' && <VolumeX size={14} />}
                  {tab === 'video-to-gif' && <Film size={14} />}
                  {tab === 'extract-thumbnail' && <Camera size={14} />}
                  <span style={{ textAlign: 'center' }}>
                    {tab === 'extract-audio' && 'Extract Audio'}
                    {tab === 'mute' && 'Mute Video'}
                    {tab === 'video-to-gif' && 'Video to GIF'}
                    {tab === 'extract-thumbnail' && 'Thumbnail'}
                  </span>
                </button>
              ))}
            </div>

            {/* Config Panels */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginBottom: '20px' }}>
              
              {/* Extract Audio */}
              {activeTab === 'extract-audio' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Audio Output Container</label>
                  <select
                    className="form-input"
                    value={audioFormat}
                    onChange={(e) => setAudioFormat(e.target.value)}
                  >
                    <option value="mp3">MP3 Format (Compressed)</option>
                    <option value="wav">WAV Format (Lossless PCM)</option>
                  </select>
                </div>
              )}

              {/* Muted video */}
              {activeTab === 'mute' && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Muting strips audio packets completely, converting the video into a silent playback track.
                </p>
              )}

              {/* Video to GIF */}
              {activeTab === 'video-to-gif' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>GIF Width: {gifWidth}px</label>
                    <input
                      type="range"
                      min="240"
                      max="720"
                      step="20"
                      value={gifWidth}
                      onChange={(e) => setGifWidth(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--primary-color)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Frame Rate: {gifFps} FPS</label>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      step="1"
                      value={gifFps}
                      onChange={(e) => setGifFps(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--primary-color)' }}
                    />
                  </div>
                </div>
              )}

              {/* Thumbnail Extractor */}
              {activeTab === 'extract-thumbnail' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Timestamp Offset: {thumbnailTime}s</label>
                  <input
                    type="range"
                    min="0.1"
                    max={duration || 100}
                    step="0.1"
                    value={thumbnailTime}
                    onChange={(e) => setThumbnailTime(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary-color)', marginBottom: '8px' }}
                  />
                  <button
                    onClick={useCurrentPlaybackTime}
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px', justifyContent: 'center' }}
                  >
                    Grab Current Frame Timestamp
                  </button>
                </div>
              )}

            </div>

            <button
              onClick={handleExecuteUtility}
              disabled={isProcessing || !file}
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
                opacity: isProcessing || !file ? 0.6 : 1
              }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wrench size={16} />
                  Run Utility
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
