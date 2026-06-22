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
import syncService from '../../../lib/sync';
import storageService from '../../../lib/storage';

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

  // Video playback (source video)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Video playback (output cropped video if applicable)

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

  const handleAiAction = async (action: 'subtitle' | 'summary' | 'transcript') => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(15);
    setTextResult(null);

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
        let errMsg = 'AI processing failed.';
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

      setProgress(80);

      const data = await response.json();
      setTextResult(data.result);
      setResultType(action);

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

  ;

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
        Automatically transcribe, generate WebVTT subtitles, or summarize video content.
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

            

            <button
              onClick={() => {
                setVideoSrc(null);
                setFile(null);
                setTextResult(null);

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

              

              
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
