'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Scissors,
  Download,
  RotateCcw,
  Sliders,
  Maximize2,
  Settings,
  Layers,
  Sparkles,
  RefreshCw,
  Film,
  Video,
  FileVideo,
  VolumeX,
  Play,
  Pause,
  Clock,
  Heart
} from 'lucide-react';

interface VideoEditorSuiteProps {
  initialTab?: 'compress' | 'trim' | 'crop' | 'resize' | 'rotate' | 'reverse' | 'merge' | 'split';
}

export default function VideoEditorSuite({ initialTab = 'trim' }: VideoEditorSuiteProps) {
  const [file, setFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Loaded metadata
  const [duration, setDuration] = useState<number>(0);
  const [videoWidth, setVideoWidth] = useState<number>(0);
  const [videoHeight, setVideoHeight] = useState<number>(0);

  // Video playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Compress State
  const [quality, setQuality] = useState<string>('medium'); // low, medium, high

  // Trim State
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);

  // Crop State
  const [cropW, setCropW] = useState<number>(320);
  const [cropH, setCropH] = useState<number>(240);
  const [cropX, setCropX] = useState<number>(0);
  const [cropY, setCropY] = useState<number>(0);
  const [cropPreset, setCropPreset] = useState<string>('custom');

  // Crop drag/resize state
  const [renderedVideo, setRenderedVideo] = useState<{ width: number; height: number; left: number; top: number } | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [isResizingCrop, setIsResizingCrop] = useState<string | null>(null); // 'tl', 'tr', 'bl', 'br'
  const dragStartPos = useRef({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });

  const updateRenderedVideoDimensions = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const container = video.parentElement;
    if (!container) return;

    const containerWidth = video.clientWidth;
    const containerHeight = video.clientHeight;

    const videoRatio = video.videoWidth / video.videoHeight;
    const containerRatio = containerWidth / containerHeight;

    let width = 0;
    let height = 0;
    let left = 0;
    let top = 0;

    if (videoRatio > containerRatio) {
      width = containerWidth;
      height = containerWidth / videoRatio;
      top = (containerHeight - height) / 2;
    } else {
      height = containerHeight;
      width = containerHeight * videoRatio;
      left = (containerWidth - width) / 2;
    }

    setRenderedVideo({ width, height, left, top });
  };

  useEffect(() => {
    if (activeTab === 'crop' && videoSrc) {
      const timer = setTimeout(() => {
        updateRenderedVideoDimensions();
      }, 200);

      window.addEventListener('resize', updateRenderedVideoDimensions);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener('resize', updateRenderedVideoDimensions);
      };
    }
  }, [activeTab, videoSrc, isProcessing]);

  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, handle: string | null) => {
    e.stopPropagation();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartPos.current = {
      x: clientX,
      y: clientY,
      cropX,
      cropY,
      cropW,
      cropH
    };

    if (handle) {
      setIsResizingCrop(handle);
    } else {
      setIsDraggingCrop(true);
    }
  };

  useEffect(() => {
    if (!isDraggingCrop && !isResizingCrop) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const dx = clientX - dragStartPos.current.x;
      const dy = clientY - dragStartPos.current.y;

      if (!renderedVideo || !videoWidth || !videoHeight) return;

      // Convert screen pixels to video pixels
      const scaleX = videoWidth / renderedVideo.width;
      const scaleY = videoHeight / renderedVideo.height;

      const videoDx = dx * scaleX;
      const videoDy = dy * scaleY;

      if (isDraggingCrop) {
        let newX = Math.round(dragStartPos.current.cropX + videoDx);
        let newY = Math.round(dragStartPos.current.cropY + videoDy);

        newX = Math.max(0, Math.min(videoWidth - cropW, newX));
        newY = Math.max(0, Math.min(videoHeight - cropH, newY));

        setCropX(newX);
        setCropY(newY);
      } else if (isResizingCrop) {
        let newW = dragStartPos.current.cropW;
        let newH = dragStartPos.current.cropH;
        let newX = dragStartPos.current.cropX;
        let newY = dragStartPos.current.cropY;

        const handle = isResizingCrop;

        if (cropPreset === 'custom') {
          if (handle.includes('r')) {
            newW = Math.round(dragStartPos.current.cropW + videoDx);
          } else if (handle.includes('l')) {
            const potentialW = Math.round(dragStartPos.current.cropW - videoDx);
            if (potentialW > 20) {
              newW = potentialW;
              newX = Math.round(dragStartPos.current.cropX + videoDx);
            }
          }

          if (handle.includes('b')) {
            newH = Math.round(dragStartPos.current.cropH + videoDy);
          } else if (handle.includes('t')) {
            const potentialH = Math.round(dragStartPos.current.cropH - videoDy);
            if (potentialH > 20) {
              newH = potentialH;
              newY = Math.round(dragStartPos.current.cropY + videoDy);
            }
          }
        } else {
          let ratio = 1;
          if (cropPreset === '16:9') ratio = 16 / 9;
          else if (cropPreset === '9:16') ratio = 9 / 16;
          else if (cropPreset === '1:1') ratio = 1;

          if (handle.includes('r')) {
            newW = Math.round(dragStartPos.current.cropW + videoDx);
          } else if (handle.includes('l')) {
            const potentialW = Math.round(dragStartPos.current.cropW - videoDx);
            if (potentialW > 20) {
              newW = potentialW;
              newX = Math.round(dragStartPos.current.cropX + videoDx);
            }
          }

          newH = Math.round(newW / ratio);

          if (handle.includes('t')) {
            newY = Math.round(dragStartPos.current.cropY + (dragStartPos.current.cropH - newH));
          }
        }

        if (newW > 20 && newH > 20) {
          if (newX < 0) { newW += newX; newX = 0; }
          if (newY < 0) { newH += newY; newY = 0; }
          if (newX + newW > videoWidth) newW = videoWidth - newX;
          if (newY + newH > videoHeight) newH = videoHeight - newY;

          setCropW(newW);
          setCropH(newH);
          setCropX(newX);
          setCropY(newY);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingCrop(false);
      setIsResizingCrop(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingCrop, isResizingCrop, cropX, cropY, cropW, cropH, cropPreset, videoWidth, videoHeight, renderedVideo]);

  // Resize State
  const [resizeW, setResizeW] = useState<number>(640);
  const [resizeH, setResizeH] = useState<number>(360);
  const [maintainAspect, setMaintainAspect] = useState(true);

  // Rotate State
  const [rotateAngle, setRotateAngle] = useState<string>('90');

  // Reverse State (no extra config parameters)

  // Merge State (multi-file uploads)
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  // Split State
  const [splitTime, setSplitTime] = useState<number>(0);
  const [splitResult, setSplitResult] = useState<{ part1Url: string; part2Url: string; name: string } | null>(null);

  // Processing Result (download URL for single outputs)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Favorite Sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favs.includes('video-editor'));
      
      import('../../lib/sync').then((m) => {
        m.default.addToHistory('video-editor');
      });
    }
  }, []);

  const toggleFavorite = () => {
    if (typeof window === 'undefined') return;
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    let updated;
    if (isFavorite) {
      updated = favs.filter((id: string) => id !== 'video-editor');
    } else {
      updated = [...favs, 'video-editor'];
    }
    localStorage.setItem('favorites', JSON.stringify(updated));
    setIsFavorite(!isFavorite);
    
    import('../../lib/sync').then((m) => {
      m.default.saveFavorite('video-editor', !isFavorite);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    loadVideoFile(uploaded);
  };

  const loadVideoFile = (uploaded: File) => {
    setFile(uploaded);
    setDownloadUrl(null);
    setSplitResult(null);
    const url = URL.createObjectURL(uploaded);
    setVideoSrc(url);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setEndTime(video.duration);
    setSplitTime(video.duration / 2);
    setVideoWidth(video.videoWidth);
    setVideoHeight(video.videoHeight);
    setResizeW(video.videoWidth);
    setResizeH(video.videoHeight);
    setCropW(Math.min(video.videoWidth, 320));
    setCropH(Math.min(video.videoHeight, 240));
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
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

  // Preset aspect ratio cropping
  const handleCropPreset = (preset: string) => {
    setCropPreset(preset);
    if (preset === 'custom') return;
    
    let targetW = videoWidth;
    let targetH = videoHeight;
    
    if (preset === '1:1') {
      const min = Math.min(videoWidth, videoHeight);
      targetW = min;
      targetH = min;
    } else if (preset === '16:9') {
      targetW = videoWidth;
      targetH = Math.round(videoWidth * (9 / 16));
      if (targetH > videoHeight) {
        targetH = videoHeight;
        targetW = Math.round(videoHeight * (16 / 9));
      }
    } else if (preset === '9:16') {
      targetH = videoHeight;
      targetW = Math.round(videoHeight * (9 / 16));
      if (targetW > videoWidth) {
        targetW = videoWidth;
        targetH = Math.round(videoWidth * (16 / 9));
      }
    }

    setCropW(targetW);
    setCropH(targetH);
    setCropX(Math.round((videoWidth - targetW) / 2));
    setCropY(Math.round((videoHeight - targetH) / 2));
  };

  // Perform processing via server-side API route
  const handleProcessVideo = async () => {
    if (!file && activeTab !== 'merge') return;
    setIsProcessing(true);
    setProgress(15);
    setDownloadUrl(null);
    setSplitResult(null);

    const formData = new FormData();
    formData.append('action', activeTab);

    if (activeTab === 'merge') {
      if (mergeFiles.length < 2) {
        alert('Please select at least 2 videos to merge');
        setIsProcessing(false);
        return;
      }
      mergeFiles.forEach(f => formData.append('files', f));
    } else {
      formData.append('file', file!);
    }

    // Append action-specific parameters
    if (activeTab === 'compress') {
      formData.append('quality', quality);
    } else if (activeTab === 'trim') {
      formData.append('startTime', String(startTime));
      formData.append('duration', String(endTime - startTime));
    } else if (activeTab === 'crop') {
      formData.append('cropW', String(cropW));
      formData.append('cropH', String(cropH));
      formData.append('cropX', String(cropX));
      formData.append('cropY', String(cropY));
    } else if (activeTab === 'resize') {
      formData.append('resizeW', String(resizeW));
      formData.append('resizeH', String(resizeH));
    } else if (activeTab === 'rotate') {
      formData.append('rotateAngle', rotateAngle);
    } else if (activeTab === 'split') {
      // Split handles 2 sequential trim requests or 2 outputs. We simulate splitting via 2 requests
      // to keep backend simple.
      setProgress(30);
    }

    try {
      if (activeTab === 'split') {
        // Split Part 1
        setProgress(40);
        const formPart1 = new FormData();
        formPart1.append('action', 'trim');
        formPart1.append('file', file!);
        formPart1.append('startTime', '0');
        formPart1.append('duration', String(splitTime));
        
        const res1 = await fetch('/api/video/process', { method: 'POST', body: formPart1 });
        if (!res1.ok) throw new Error('Failed to process split part 1');
        const blob1 = await res1.blob();
        
        // Split Part 2
        setProgress(75);
        const formPart2 = new FormData();
        formPart2.append('action', 'trim');
        formPart2.append('file', file!);
        formPart2.append('startTime', String(splitTime));
        formPart2.append('duration', String(duration - splitTime));
        
        const res2 = await fetch('/api/video/process', { method: 'POST', body: formPart2 });
        if (!res2.ok) throw new Error('Failed to process split part 2');
        const blob2 = await res2.blob();

        setProgress(95);
        setSplitResult({
          part1Url: URL.createObjectURL(blob1),
          part2Url: URL.createObjectURL(blob2),
          name: file!.name.replace(/\.[^/.]+$/, '')
        });
      } else {
        // Single file processing endpoint call
        setProgress(50);
        const response = await fetch('/api/video/process', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          let errMsg = 'Server error occurred during video processing.';
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
        const processedBlob = await response.blob();
        const url = URL.createObjectURL(processedBlob);
        setDownloadUrl(url);
      }

      setProgress(100);
      
      // Log activity to Supabase
      import('../../lib/sync').then((m) => {
        m.default.logActivity('Video Editor Suite', `Processed action "${activeTab}" on video`);
      });

    } catch (err: any) {
      console.error(err);
      alert(`Processing failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(null), 1000);
    }
  };

  const handleMergeFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded) return;
    const fileList = Array.from(uploaded);
    setMergeFiles(prev => [...prev, ...fileList]);
  };

  const removeMergeFile = (index: number) => {
    setMergeFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', minHeight: '550px' }}>
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
          max-height: 600px;
          overflow-y: auto;
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
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .pulse-active {
          animation: pulseGlow 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scissors size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: 0 }}>Visual Video Editor</h2>
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
        Trim, crop, scale, rotate, and reverse video clips directly in your browser. Files are processed securely.
      </p>

      {/* UPLOAD PANEL */}
      {!videoSrc && activeTab !== 'merge' ? (
        <div
          onClick={triggerFileSelect}
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Drag & Drop Video here</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Supports MP4, WebM, MOV, and AVI up to 100MB
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
          
          {/* LEFT PANEL: PREVIEW & TIMELINE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {activeTab !== 'merge' ? (
              <div className="video-suite-player-container">
                <video
                  ref={videoRef}
                  src={videoSrc!}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  style={{ width: '100%', maxHeight: '420px', objectFit: 'contain' }}
                  onClick={togglePlay}
                />
                
                {/* Visual crop overlay guide */}
                 {activeTab === 'crop' && renderedVideo && (
                   <div
                     style={{
                       position: 'absolute',
                       left: `${renderedVideo.left}px`,
                       top: `${renderedVideo.top}px`,
                       width: `${renderedVideo.width}px`,
                       height: `${renderedVideo.height}px`,
                       pointerEvents: 'auto',
                       overflow: 'hidden'
                     }}
                   >
                     {/* Draggable crop box guide */}
                     <div
                       onMouseDown={(e) => handleCropMouseDown(e, null)}
                       onTouchStart={(e) => handleCropMouseDown(e, null)}
                       style={{
                         position: 'absolute',
                         left: `${(cropX / videoWidth) * 100}%`,
                         top: `${(cropY / videoHeight) * 100}%`,
                         width: `${(cropW / videoWidth) * 100}%`,
                         height: `${(cropH / videoHeight) * 100}%`,
                         border: '2px dashed var(--primary-color)',
                         boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                         boxSizing: 'border-box',
                         cursor: 'move',
                         pointerEvents: 'auto'
                       }}
                     >
                       {/* Crop corner drag handles */}
                       {['tl', 'tr', 'bl', 'br'].map((handle) => {
                         const isTop = handle.startsWith('t');
                         const isLeft = handle.endsWith('l');
                         return (
                           <div
                             key={handle}
                             onMouseDown={(e) => handleCropMouseDown(e, handle)}
                             onTouchStart={(e) => handleCropMouseDown(e, handle)}
                             style={{
                               position: 'absolute',
                               top: isTop ? -6 : 'auto',
                               bottom: !isTop ? -6 : 'auto',
                               left: isLeft ? -6 : 'auto',
                               right: !isLeft ? -6 : 'auto',
                               width: '12px',
                               height: '12px',
                               background: 'var(--primary-color)',
                               border: '1.5px solid #fff',
                               borderRadius: '50%',
                               cursor: handle === 'tl' || handle === 'br' ? 'nwse-resize' : 'nesw-resize',
                               pointerEvents: 'auto',
                               zIndex: 10
                             }}
                           />
                         );
                       })}
                     </div>
                   </div>
                 )}

                {/* Custom Controls Bar */}
                <div style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={togglePlay}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} fill="#fff" />}
                  </button>
                  <span style={{ fontSize: '0.78rem', color: '#ccc', minWidth: '80px' }}>
                    {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
                  </span>
                  
                  {/* Timeline Scrubber */}
                  <input
                    type="range"
                    min="0"
                    max={duration}
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
            ) : (
              // Multi-file Merge Upload section
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px' }}>Merge Video Files</h3>
                <div
                  onClick={() => mergeInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--glass-border)',
                    borderRadius: '12px',
                    padding: '30px 10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.01)',
                    marginBottom: '16px'
                  }}
                >
                  <FileVideo size={36} color="var(--primary-color)" style={{ margin: '0 auto 10px' }} />
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600 }}>Click to add videos to merge queue</p>
                  <input
                    type="file"
                    ref={mergeInputRef}
                    onChange={handleMergeFilesUpload}
                    multiple
                    accept="video/*"
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Queue list */}
                {mergeFiles.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {mergeFiles.map((f, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--glass-border)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)' }}>#{idx + 1}</span>
                          <span style={{ fontSize: '0.8rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{f.name}</span>
                        </div>
                        <button
                          onClick={() => removeMergeFile(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ff4757',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* RESULTS STATE BUTTONS */}
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
                      Encoding video frames on server... (Please wait, this might take a few moments for larger files)
                    </span>
                  ) : (
                    `Processing video buffers... ${progress}%`
                  )}
                </p>
              </div>
            )}

            {downloadUrl && (
              <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0,161,155,0.05)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-color)' }}>Processing Success!</span>
                  <a
                    href={downloadUrl}
                    download={`edited_video.mp4`}
                    className="btn-primary"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.82rem' }}
                  >
                    <Download size={14} /> Download File
                  </a>
                </div>
                <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: '#000' }}>
                  <video
                    src={downloadUrl}
                    controls
                    style={{ width: '100%', maxHeight: '320px', display: 'block', objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}

            {splitResult && (
              <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0,161,155,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '4px' }}>Splitting Completed!</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Part 1 Preview:</span>
                    <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: '#000' }}>
                      <video
                        src={splitResult.part1Url}
                        controls
                        style={{ width: '100%', maxHeight: '180px', display: 'block', objectFit: 'contain' }}
                      />
                    </div>
                    <a
                      href={splitResult.part1Url}
                      download={`${splitResult.name}_part1.mp4`}
                      className="btn-primary"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '0.78rem' }}
                    >
                      <Download size={12} /> Download Part 1
                    </a>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Part 2 Preview:</span>
                    <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: '#000' }}>
                      <video
                        src={splitResult.part2Url}
                        controls
                        style={{ width: '100%', maxHeight: '180px', display: 'block', objectFit: 'contain' }}
                      />
                    </div>
                    <a
                      href={splitResult.part2Url}
                      download={`${splitResult.name}_part2.mp4`}
                      className="btn-primary"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '0.78rem' }}
                    >
                      <Download size={12} /> Download Part 2
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Change file option */}
            {videoSrc && (
              <button
                onClick={() => {
                  setVideoSrc(null);
                  setFile(null);
                  setDownloadUrl(null);
                  setSplitResult(null);
                }}
                className="btn-secondary"
                style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.8rem' }}
              >
                Change Video File
              </button>
            )}

          </div>

          {/* RIGHT SIDE: SUITE TABS & SETTINGS */}
          <div className="video-suite-sidebar">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Editing Modules
            </h3>
            
            {/* Tab layout selection grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {(['compress', 'trim', 'crop', 'resize', 'rotate', 'reverse', 'merge', 'split'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setDownloadUrl(null);
                    setSplitResult(null);
                  }}
                  style={{
                    background: activeTab === tab ? 'rgba(0, 161, 155, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: activeTab === tab ? '1px solid var(--primary-color)' : '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-color)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {tab === 'compress' && <Settings size={14} />}
                  {tab === 'trim' && <Scissors size={14} />}
                  {tab === 'crop' && <Sliders size={14} />}
                  {tab === 'resize' && <Maximize2 size={14} />}
                  {tab === 'rotate' && <Layers size={14} />}
                  {tab === 'reverse' && <RotateCcw size={14} />}
                  {tab === 'merge' && <Video size={14} />}
                  {tab === 'split' && <Clock size={14} />}
                  {tab}
                </button>
              ))}
            </div>

            {/* ACTION TUNING PANEL */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginBottom: '20px' }}>
              
              {/* COMPRESS TAB */}
              {activeTab === 'compress' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Compression Level</label>
                  <select
                    className="form-input"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                  >
                    <option value="high">High Quality (Low compression)</option>
                    <option value="medium">Medium Quality (Standard compression)</option>
                    <option value="low">Low Quality (Smallest size)</option>
                  </select>
                </div>
              )}

              {/* TRIM TAB */}
              {activeTab === 'trim' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Start Offset: {startTime.toFixed(1)}s</label>
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      step="0.1"
                      value={startTime}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setStartTime(val);
                        if (val > endTime) setEndTime(val);
                      }}
                      style={{ width: '100%', accentColor: 'var(--primary-color)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>End Offset: {endTime.toFixed(1)}s</label>
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      step="0.1"
                      value={endTime}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEndTime(val);
                        if (val < startTime) setStartTime(val);
                      }}
                      style={{ width: '100%', accentColor: 'var(--primary-color)' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>
                    Total Trim Length: {(endTime - startTime).toFixed(1)} seconds
                  </span>
                </div>
              )}

              {/* CROP TAB */}
              {activeTab === 'crop' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Presets</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    {['custom', '1:1', '16:9', '9:16'].map(preset => (
                      <button
                        key={preset}
                        onClick={() => handleCropPreset(preset)}
                        style={{
                          flex: 1,
                          fontSize: '0.72rem',
                          padding: '6px',
                          borderRadius: '6px',
                          border: cropPreset === preset ? '1px solid var(--primary-color)' : '1px solid var(--glass-border)',
                          background: cropPreset === preset ? 'rgba(0, 161, 155, 0.1)' : 'transparent',
                          color: cropPreset === preset ? 'var(--primary-color)' : 'var(--text-color)',
                          cursor: 'pointer'
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Width (px)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={cropW}
                        onChange={(e) => setCropW(Number(e.target.value))}
                        disabled={cropPreset !== 'custom'}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Height (px)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={cropH}
                        onChange={(e) => setCropH(Number(e.target.value))}
                        disabled={cropPreset !== 'custom'}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>X Offset</label>
                      <input
                        type="number"
                        className="form-input"
                        value={cropX}
                        onChange={(e) => setCropX(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Y Offset</label>
                      <input
                        type="number"
                        className="form-input"
                        value={cropY}
                        onChange={(e) => setCropY(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* RESIZE TAB */}
              {activeTab === 'resize' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Target Width (px)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={resizeW}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setResizeW(val);
                        if (maintainAspect && videoWidth > 0) {
                          setResizeH(Math.round(val * (videoHeight / videoWidth)));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Target Height (px)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={resizeH}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setResizeH(val);
                        if (maintainAspect && videoHeight > 0) {
                          setResizeW(Math.round(val * (videoWidth / videoHeight)));
                        }
                      }}
                    />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={maintainAspect}
                      onChange={(e) => setMaintainAspect(e.target.checked)}
                    />
                    Maintain Aspect Ratio
                  </label>
                </div>
              )}

              {/* ROTATE TAB */}
              {activeTab === 'rotate' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Rotation Angle</label>
                  <select
                    className="form-input"
                    value={rotateAngle}
                    onChange={(e) => setRotateAngle(e.target.value)}
                  >
                    <option value="90">90° Clockwise</option>
                    <option value="180">180° Half-turn</option>
                    <option value="270">90° Counter-Clockwise</option>
                  </select>
                </div>
              )}

              {/* REVERSE TAB */}
              {activeTab === 'reverse' && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  No extra options. Click "Process Video" to generate a video play-backward file output.
                </p>
              )}

              {/* MERGE TAB */}
              {activeTab === 'merge' && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Ensure all files added in the queue match standard aspect ratios to guarantee compile stability.
                </p>
              )}

              {/* SPLIT TAB */}
              {activeTab === 'split' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Split Point: {splitTime.toFixed(1)}s</label>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.1"
                    value={splitTime}
                    onChange={(e) => setSplitTime(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary-color)' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>
                    Cuts the clip into two parts: [0s to {splitTime.toFixed(1)}s] and [{splitTime.toFixed(1)}s to {duration.toFixed(1)}s].
                  </span>
                </div>
              )}

            </div>

            {/* GLOBAL PROCESS TRIGGER */}
            <button
              onClick={handleProcessVideo}
              disabled={isProcessing || (!file && activeTab !== 'merge')}
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
                opacity: isProcessing || (!file && activeTab !== 'merge') ? 0.6 : 1
              }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Rendering Video...
                </>
              ) : (
                <>
                  <Film size={16} />
                  Process Video
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
