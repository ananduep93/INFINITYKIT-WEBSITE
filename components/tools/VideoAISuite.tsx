'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  Play,
  Pause,
  Copy,
  Heart,
  Key,
  FileText,
  Volume2,
  VolumeX,
  FileCode
} from 'lucide-react';
import syncService from '../../lib/sync';
import storageService from '../../lib/storage';

export default function VideoAISuite() {
  const [file, setFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [provider, setProvider] = useState<'openai' | 'gemini'>('openai');
  
  // Results
  const [textResult, setTextResult] = useState<string | null>(null);
  const [resultType, setResultType] = useState<'subtitle' | 'summary' | 'transcript' | 'video' | null>(null);
  const [videoResultUrl, setVideoResultUrl] = useState<string | null>(null);
  const [videoResultBlob, setVideoResultBlob] = useState<Blob | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Video playback (source video)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Video playback (output cropped video if applicable)
  const [isOutPlaying, setIsOutPlaying] = useState(false);
  const outVideoRef = useRef<HTMLVideoElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favs.includes('video-ai'));
      
      // Load stored Gemini Key from settings if exists
      const savedKey = localStorage.getItem('infinitykit_gemini_key') || '';
      setGeminiKey(savedKey);

      // Load stored OpenAI Key from settings if exists
      const savedOpenaiKey = localStorage.getItem('infinitykit_openai_key') || '';
      setOpenaiKey(savedOpenaiKey);

      // Load stored preferred provider if exists
      const savedProvider = localStorage.getItem('infinitykit_video_ai_provider') as 'openai' | 'gemini' | null;
      if (savedProvider) {
        setProvider(savedProvider);
      } else if (savedOpenaiKey) {
        setProvider('openai');
      } else if (savedKey) {
        setProvider('gemini');
      }
      
      syncService.addToHistory('video-ai');
    }
  }, []);

  const toggleFavorite = () => {
    if (typeof window === 'undefined') return;
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    let updated;
    if (isFavorite) {
      updated = favs.filter((id: string) => id !== 'video-ai');
    } else {
      updated = [...favs, 'video-ai'];
    }
    localStorage.setItem('favorites', JSON.stringify(updated));
    setIsFavorite(!isFavorite);
    syncService.saveFavorite('video-ai', !isFavorite);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) loadVideoFile(uploaded);
  };

  const loadVideoFile = (uploaded: File) => {
    setFile(uploaded);
    setTextResult(null);
    setResultType(null);
    setVideoResultUrl(null);
    setVideoResultBlob(null);
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

  const saveGeminiKey = (val: string) => {
    setGeminiKey(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('infinitykit_gemini_key', val);
    }
  };

  const saveOpenaiKey = (val: string) => {
    setOpenaiKey(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('infinitykit_openai_key', val);
    }
  };

  const handleProviderChange = (val: 'openai' | 'gemini') => {
    setProvider(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('infinitykit_video_ai_provider', val);
    }
  };

  const handleAiAction = async (action: 'subtitle' | 'summary' | 'transcript' | 'shorts' | 'reel') => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(15);
    setTextResult(null);
    setVideoResultUrl(null);
    setVideoResultBlob(null);
    setShareUrl(null);

    const formData = new FormData();
    formData.append('action', action);
    formData.append('file', file);
    formData.append('provider', provider);

    try {
      setProgress(40);
      const headers: Record<string, string> = {};
      if (geminiKey) {
        headers['x-gemini-key'] = geminiKey;
        formData.append('geminiKey', geminiKey);
      }
      if (openaiKey) {
        headers['x-openai-key'] = openaiKey;
        formData.append('openaiKey', openaiKey);
      }

      const response = await fetch('/api/video/ai', {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'AI processing failed.');
      }

      setProgress(80);

      if (action === 'subtitle' || action === 'summary' || action === 'transcript') {
        const data = await response.json();
        setTextResult(data.result);
        setResultType(action);
      } else {
        // Shorts / Reels clip returns binary blob
        const blob = await response.blob();
        setVideoResultBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoResultUrl(url);
        setResultType('video');
      }

      setProgress(100);
      syncService.logActivity('Video AI Suite', `Completed AI ${action.toUpperCase()} action on "${file.name}"`);
    } catch (err: any) {
      console.error(err);
      alert(`AI execution failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(null), 1000);
    }
  };

  const handleCopyText = () => {
    if (textResult) {
      navigator.clipboard.writeText(textResult);
      alert('Content copied to clipboard!');
    }
  };

  const handleDownloadText = () => {
    if (!textResult || !file) return;
    let ext = 'txt';
    if (resultType === 'subtitle') ext = 'vtt';
    else if (resultType === 'summary') ext = 'md';

    const blob = new Blob([textResult], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, '')}_ai_output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareVideo = async () => {
    if (!videoResultBlob || !file) return;
    setIsSharing(true);
    try {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const exportFile = new File([videoResultBlob], `ai_crop_${cleanName}.mp4`, {
        type: 'video/mp4'
      });

      const uploadRes = await storageService.uploadFile(exportFile, { isPublic: true });
      setShareUrl(uploadRes.url);
      await navigator.clipboard.writeText(uploadRes.url);
      alert('Shareable link copied to clipboard!');
    } catch (err: any) {
      console.error(err);
      if (videoResultUrl) {
        await navigator.clipboard.writeText(window.location.origin + videoResultUrl);
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
        .ai-result-panel {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 16px;
          max-height: 250px;
          overflow-y: auto;
          font-family: monospace;
          white-space: pre-wrap;
          font-size: 0.82rem;
          color: var(--text-color);
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
          <Sparkles size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: 0 }}>Video AI Assistant</h2>
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

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
        Automatically transcribe, generate WebVTT subtitles, summarize video content, or crop clips to vertical 9:16 Shorts/Reels highlights.
      </p>

      {/* API Key Config */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--glass-border)',
        padding: '16px',
        borderRadius: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={16} color="var(--primary-color)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Preferred AI Provider:</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '8px' }}>
            {(['openai', 'gemini'] as const).map((prov) => (
              <button
                key={prov}
                onClick={() => handleProviderChange(prov)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: provider === prov ? 'var(--primary-color)' : 'transparent',
                  color: provider === prov ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textTransform: 'capitalize'
                }}
              >
                {prov === 'openai' ? 'OpenAI (Recommended)' : 'Google Gemini'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>OpenAI API Key:</label>
            <input
              type="password"
              placeholder="Optional. Paste key (starts with sk-...)"
              value={openaiKey}
              onChange={(e) => saveOpenaiKey(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'var(--text-color)',
                outline: 'none',
                fontSize: '0.8rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Gemini API Key:</label>
            <input
              type="password"
              placeholder="Optional. Paste key (starts with AIzaSy...)"
              value={geminiKey}
              onChange={(e) => saveGeminiKey(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'var(--text-color)',
                outline: 'none',
                fontSize: '0.8rem'
              }}
            />
          </div>
        </div>
      </div>

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
          <Sparkles size={48} color="var(--primary-color)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Drag & Drop Video for AI Tasks</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Transcribe, subtitle, summarize, or extract vertical clips
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
          
          {/* Left Panel: Preview & Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="video-suite-player-container">
              <video
                ref={videoRef}
                src={videoSrc}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                style={{ width: '100%', maxHeight: '380px', objectFit: 'contain' }}
                onClick={togglePlay}
              />
              
              {/* Timeline controls */}
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

            {/* Progress indicators */}
            {progress !== null && (
              <div style={{ padding: '10px 0' }}>
                <div style={{ height: '6px', background: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.3s ease' }} />
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                  {provider === 'openai' ? 'OpenAI Whisper & GPT-4o' : 'Gemini AI'} analyzing audio waveforms... {progress}%
                </p>
              </div>
            )}

            {/* Text results panel */}
            {textResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'capitalize' }}>
                    AI {resultType} Result
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={handleCopyText}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Copy size={12} /> Copy
                    </button>
                    <button
                      onClick={handleDownloadText}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Download size={12} /> Export File
                    </button>
                  </div>
                </div>
                <div className="ai-result-panel">{textResult}</div>
              </div>
            )}

            {/* Video output results panel (Shorts/Reels vertical) */}
            {videoResultUrl && (
              <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0,161,155,0.04)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '14px' }}>AI Clipped Highlight Output (9:16)</h4>
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'start', flexWrap: 'wrap' }}>
                  {/* Vertical Video Element */}
                  <div style={{
                    width: '140px',
                    height: '248px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#000',
                    border: '1px solid var(--glass-border)',
                    position: 'relative'
                  }}>
                    <video
                      ref={outVideoRef}
                      src={videoResultUrl}
                      controls
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onPlay={() => setIsOutPlaying(true)}
                      onPause={() => setIsOutPlaying(false)}
                    />
                  </div>

                  {/* Vertical Clip Download/Share */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      Vertical highlight compiled with centered focal cropping and compressed for mobile delivery formats.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={videoResultUrl}
                        download={`ai_highlight_${file?.name}`}
                        className="btn-primary"
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.82rem' }}
                      >
                        <Download size={14} /> Download Highlight
                      </a>
                      <button
                        onClick={handleShareVideo}
                        disabled={isSharing}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.82rem' }}
                      >
                        {isSharing ? <RefreshCw size={14} className="animate-spin" /> : <Share2 size={14} />}
                        Share Link
                      </button>
                    </div>

                    {shareUrl && (
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '10px', borderRadius: '8px', fontSize: '0.78rem', wordBreak: 'break-all', marginTop: '4px' }}>
                        <strong>Shareable URL:</strong> <a href={shareUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)' }}>{shareUrl}</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setVideoSrc(null);
                setFile(null);
                setTextResult(null);
                setVideoResultUrl(null);
                setVideoResultBlob(null);
                setShareUrl(null);
              }}
              className="btn-secondary"
              style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.8rem' }}
            >
              Change Video File
            </button>

          </div>

          {/* Right Panel: AI Triggers */}
          <div className="video-suite-sidebar">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Options
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-secondary"
                disabled={isProcessing || !file}
                onClick={() => handleAiAction('subtitle')}
                style={{ justifyContent: 'flex-start', gap: '10px', padding: '12px' }}
              >
                <FileCode size={16} color="var(--primary-color)" />
                AI Subtitle Generator
              </button>

              <button
                className="btn-secondary"
                disabled={isProcessing || !file}
                onClick={() => handleAiAction('summary')}
                style={{ justifyContent: 'flex-start', gap: '10px', padding: '12px' }}
              >
                <FileText size={16} color="var(--primary-color)" />
                AI Video Summary
              </button>

              <button
                className="btn-secondary"
                disabled={isProcessing || !file}
                onClick={() => handleAiAction('transcript')}
                style={{ justifyContent: 'flex-start', gap: '10px', padding: '12px' }}
              >
                <FileText size={16} color="var(--primary-color)" />
                AI Transcript
              </button>

              <button
                className="btn-secondary"
                disabled={isProcessing || !file}
                onClick={() => handleAiAction('shorts')}
                style={{ justifyContent: 'flex-start', gap: '10px', padding: '12px' }}
              >
                <Sparkles size={16} color="var(--primary-color)" />
                AI Shorts Generator (9:16)
              </button>

              <button
                className="btn-secondary"
                disabled={isProcessing || !file}
                onClick={() => handleAiAction('reel')}
                style={{ justifyContent: 'flex-start', gap: '10px', padding: '12px' }}
              >
                <Sparkles size={16} color="var(--primary-color)" />
                AI Reel Generator (9:16)
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
