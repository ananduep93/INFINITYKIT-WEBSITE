'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Crop,
  RotateCw,
  Sliders,
  Sparkles,
  Maximize2,
  Percent,
  Download,
  RotateCcw,
  RefreshCw,
  Eye,
  Columns,
  Heart,
  History,
  FileImage,
  Layers,
  Settings2,
  Scissors
} from 'lucide-react';

interface ImageEditorSuiteProps {
  initialTab?: 'resize' | 'compress' | 'crop' | 'rotate' | 'flip' | 'blur' | 'sharpen' | 'pixelate';
}

export default function ImageEditorSuite({ initialTab = 'resize' }: ImageEditorSuiteProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [modifiedSrc, setModifiedSrc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Before-After comparison state
  const [comparisonMode, setComparisonMode] = useState<boolean>(true); // true = Slider, false = Side-by-side
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Resize State
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [originalAspect, setOriginalAspect] = useState<number>(1.333);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);

  // Compress State
  const [quality, setQuality] = useState<number>(0.8);
  const [compressedSize, setCompressedSize] = useState<string | null>(null);

  // Crop State
  const [cropRatio, setCropRatio] = useState<string>('custom'); // custom, 1:1, 16:9, 4:3
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, w: 80, h: 80 }); // Percentages
  const cropRef = useRef<HTMLDivElement>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 });

  // Rotate & Flip State
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [angleSlider, setAngleSlider] = useState<number>(0); // -180 to 180 fine tune
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Filters state
  const [blurRadius, setBlurRadius] = useState<number>(0); // 0 to 50px
  const [sharpenAmount, setSharpenAmount] = useState<number>(0); // 0 to 100
  const [pixelSize, setPixelSize] = useState<number>(1); // 1 (none) to 50 pixels

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle Initial Favorites Check & History additions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favs.includes('image-editor'));
      
      // Dynamic Activity logger
      import('../../lib/sync').then((m) => {
        m.default.addToHistory('image-editor');
      });
    }
  }, []);

  // Update Aspect Ratio and dimensions when source image loads
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const aspect = img.naturalWidth / img.naturalHeight;
    setOriginalAspect(aspect);
    setOriginalWidth(img.naturalWidth);
    setOriginalHeight(img.naturalHeight);
    setWidth(img.naturalWidth);
    setHeight(img.naturalHeight);
    
    // Apply initial state
    applyEdits(img);
  };

  // Re-run edits whenever control parameters change
  useEffect(() => {
    if (imageSrc && imageRef.current) {
      applyEdits(imageRef.current);
    }
  }, [
    activeTab, width, height, quality, rotation, angleSlider, flipH, flipV,
    blurRadius, sharpenAmount, pixelSize, cropBox, cropRatio
  ]);

  const toggleFavorite = () => {
    if (typeof window === 'undefined') return;
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    let updated;
    if (isFavorite) {
      updated = favs.filter((id: string) => id !== 'image-editor');
    } else {
      updated = [...favs, 'image-editor'];
    }
    localStorage.setItem('favorites', JSON.stringify(updated));
    setIsFavorite(!isFavorite);
    
    // Sync with Supabase
    import('../../lib/sync').then((m) => {
      m.default.saveFavorite('image-editor', !isFavorite);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(uploaded);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Apply visual enhancements client-side on canvas
  const applyEdits = (img: HTMLImageElement) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Calculate Crop bounds in pixels
      let cropX = 0;
      let cropY = 0;
      let cropW = img.naturalWidth;
      let cropH = img.naturalHeight;

      if (activeTab === 'crop') {
        cropX = (cropBox.x / 100) * img.naturalWidth;
        cropY = (cropBox.y / 100) * img.naturalHeight;
        cropW = (cropBox.w / 100) * img.naturalWidth;
        cropH = (cropBox.h / 100) * img.naturalHeight;
      }

      // 2. Set Canvas sizes (Resize overrides Crop dimensions if active)
      let finalW = cropW;
      let finalH = cropH;

      if (activeTab === 'resize') {
        finalW = width;
        finalH = height;
      }

      // 3. Handle Rotations bounds calculations
      const totalAngleRad = ((rotation + angleSlider) * Math.PI) / 180;
      const absCos = Math.abs(Math.cos(totalAngleRad));
      const absSin = Math.abs(Math.sin(totalAngleRad));
      
      const rotatedW = finalW * absCos + finalH * absSin;
      const rotatedH = finalW * absSin + finalH * absCos;

      canvas.width = rotatedW;
      canvas.height = rotatedH;

      // Clean canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Translate context to center for rotations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(totalAngleRad);

      // Flips scaling
      const scaleX = flipH ? -1 : 1;
      const scaleY = flipV ? -1 : 1;
      ctx.scale(scaleX, scaleY);

      // Draw rotated image centered
      ctx.drawImage(
        img,
        cropX, cropY, cropW, cropH, // Source
        -finalW / 2, -finalH / 2, finalW, finalH // Destination
      );

      // Apply Filters: Blur
      if (blurRadius > 0) {
        ctx.filter = `blur(${blurRadius}px)`;
        // Re-draw with filters
        ctx.clearRect(-finalW / 2, -finalH / 2, finalW, finalH);
        ctx.drawImage(
          img,
          cropX, cropY, cropW, cropH,
          -finalW / 2, -finalH / 2, finalW, finalH
        );
        ctx.filter = 'none';
      }

      // Restore transformations matrix
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Apply Sharpening convolution
      if (sharpenAmount > 0) {
        const tempImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const sharpened = sharpenKernel(tempImgData, sharpenAmount / 100);
        ctx.putImageData(sharpened, 0, 0);
      }

      // Apply Pixelation
      if (pixelSize > 1) {
        const w = canvas.width;
        const h = canvas.height;
        const tempImgData = ctx.getImageData(0, 0, w, h);
        const data = tempImgData.data;

        for (let y = 0; y < h; y += pixelSize) {
          for (let x = 0; x < w; x += pixelSize) {
            // Find center pixel color of the block
            const centerX = Math.min(x + Math.floor(pixelSize / 2), w - 1);
            const centerY = Math.min(y + Math.floor(pixelSize / 2), h - 1);
            const pixelIdx = (centerY * w + centerX) * 4;

            const r = data[pixelIdx];
            const g = data[pixelIdx + 1];
            const b = data[pixelIdx + 2];
            const a = data[pixelIdx + 3];

            // Draw block
            for (let dy = 0; dy < pixelSize && y + dy < h; dy++) {
              for (let dx = 0; dx < pixelSize && x + dx < w; dx++) {
                const idx = ((y + dy) * w + (x + dx)) * 4;
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = a;
              }
            }
          }
        }
        ctx.putImageData(tempImgData, 0, 0);
      }

      // Export to modifiedSrc state
      const format = file?.type || 'image/jpeg';
      canvas.toBlob((blob) => {
        if (blob) {
          setModifiedSrc(URL.createObjectURL(blob));
          setCompressedSize((blob.size / 1024).toFixed(1));
        }
      }, format, activeTab === 'compress' ? quality : 0.95);

    } catch (err) {
      console.error('In-browser drawing error:', err);
    }
  };

  // 3x3 Sharpen Kernel matrix convolution
  const sharpenKernel = (imgData: ImageData, amount: number): ImageData => {
    const w = imgData.width;
    const h = imgData.height;
    const src = imgData.data;
    
    const output = new ImageData(w, h);
    const dst = output.data;

    // Convolution weights
    // amount = 0: [0, 0, 0, 0, 1, 0, 0, 0, 0]
    // amount = 1: [0, -1, 0, -1, 5, -1, 0, -1, 0]
    const center = 1 + 4 * amount;
    const edge = -amount;

    const kernel = [
      0, edge, 0,
      edge, center, edge,
      0, edge, 0
    ];

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let r = 0, g = 0, b = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIdx = ((y + ky) * w + (x + kx)) * 4;
            const weight = kernel[(ky + 1) * 3 + (kx + 1)];

            r += src[pixelIdx] * weight;
            g += src[pixelIdx + 1] * weight;
            b += src[pixelIdx + 2] * weight;
          }
        }

        const idx = (y * w + x) * 4;
        dst[idx] = Math.min(255, Math.max(0, r));
        dst[idx + 1] = Math.min(255, Math.max(0, g));
        dst[idx + 2] = Math.min(255, Math.max(0, b));
        dst[idx + 3] = src[idx + 3]; // Keep opacity alpha
      }
    }

    return output;
  };

  // Slider dragging logic
  const handleSliderMouseMove = (e: React.MouseEvent) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  };

  const handleSliderTouchMove = (e: React.TouchEvent) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  };

  // Crop Dragging logic
  const handleCropMouseDown = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    setIsDraggingCrop(type);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
      boxW: cropBox.w,
      boxH: cropBox.h
    };
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingCrop) return;
      
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      // Calculate container dimensions
      const container = cropRef.current?.parentElement;
      if (!container) return;
      const cRect = container.getBoundingClientRect();

      // Convert delta px to percentages
      const dxPct = (dx / cRect.width) * 100;
      const dyPct = (dy / cRect.height) * 100;

      if (isDraggingCrop === 'move') {
        const nextX = Math.max(0, Math.min(100 - dragStart.current.boxW, dragStart.current.boxX + dxPct));
        const nextY = Math.max(0, Math.min(100 - dragStart.current.boxH, dragStart.current.boxY + dyPct));
        setCropBox(prev => ({
          ...prev,
          x: parseFloat(nextX.toFixed(2)),
          y: parseFloat(nextY.toFixed(2))
        }));
      } else if (isDraggingCrop === 'br') {
        const nextW = Math.max(10, Math.min(100 - dragStart.current.boxX, dragStart.current.boxW + dxPct));
        let nextH = Math.max(10, Math.min(100 - dragStart.current.boxY, dragStart.current.boxH + dyPct));

        if (cropRatio !== 'custom') {
          const ratioNum = cropRatio === '1:1' ? 1 : cropRatio === '16:9' ? 16/9 : 4/3;
          // Calculate height from width percentage, adjusted for image aspect ratio
          nextH = (nextW * cRect.width) / ratioNum / cRect.height;
        }

        setCropBox(prev => ({
          ...prev,
          w: parseFloat(nextW.toFixed(2)),
          h: parseFloat(Math.min(100 - prev.y, nextH).toFixed(2))
        }));
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDraggingCrop(null);
    };

    if (isDraggingCrop) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingCrop, cropBox, cropRatio]);

  // Adjust crop preset ratio
  const handleRatioSelect = (ratio: string) => {
    setCropRatio(ratio);
    if (ratio === 'custom') return;

    const ratioNum = ratio === '1:1' ? 1 : ratio === '16:9' ? 16/9 : 4/3;
    
    // Center a bounding crop box matching that aspect ratio
    const boxW = 60;
    // height = width / ratioNum, adjusted for original image aspect
    const boxH = boxW / ratioNum;

    setCropBox({
      x: 20,
      y: parseFloat(((100 - boxH) / 2).toFixed(2)),
      w: boxW,
      h: parseFloat(boxH.toFixed(2))
    });
  };

  const resetAllEdits = () => {
    setRotation(0);
    setAngleSlider(0);
    setFlipH(false);
    setFlipV(false);
    setBlurRadius(0);
    setSharpenAmount(0);
    setPixelSize(1);
    setQuality(0.8);
    setWidth(originalWidth);
    setHeight(originalHeight);
    setCropBox({ x: 10, y: 10, w: 80, h: 80 });
    setCropRatio('custom');
  };

  // Export & Download Result File
  const downloadResult = () => {
    if (!modifiedSrc) return;
    
    const ext = file?.name.substring(file.name.lastIndexOf('.')) || '.jpg';
    const link = document.createElement('a');
    link.href = modifiedSrc;
    link.download = `edited_${file?.name.substring(0, file.name.lastIndexOf('.')) || 'image'}${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Track activity inside Supabase
    import('../../lib/sync').then((m) => {
      m.default.logActivity('Image Editor Suite', `Downloaded processed image (${width}x${height}px) using ${activeTab}`);
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', minHeight: '550px' }}>
      
      {/* Top Suite Title and Favorite buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scissors size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: 0 }}>Visual Image Editor Suite</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
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
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
        Perform lightning-fast crops, compressions, rotations, flips, and local filter layers directly in your browser. All computations are 100% private.
      </p>

      {/* Main Drag-Drop Area if no file is present */}
      {!imageSrc ? (
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
            if (dropped) {
              setFile(dropped);
              const reader = new FileReader();
              reader.onload = (event) => setImageSrc(event.target?.result as string);
              reader.readAsDataURL(dropped);
            }
          }}
        >
          <FileImage size={48} color="var(--primary-color)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Drag & Drop Image here</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Supports PNG, JPEG, WebP, SVG, and GIF formats up to 50MB
          </p>
          <button className="btn-primary" style={{ margin: '0 auto' }}>
            Browse Files
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Area: Canvas Preview / Split Slider View */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Split controls overlay */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.1)', padding: '4px', borderRadius: '8px' }}>
                <button
                  onClick={() => setComparisonMode(true)}
                  style={{
                    border: 'none',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: comparisonMode ? 'var(--primary-color)' : 'transparent',
                    color: comparisonMode ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700
                  }}
                >
                  <Columns size={12} style={{ marginRight: '4px', display: 'inline' }} /> Before/After Slider
                </button>
                <button
                  onClick={() => setComparisonMode(false)}
                  style={{
                    border: 'none',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: !comparisonMode ? 'var(--primary-color)' : 'transparent',
                    color: !comparisonMode ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700
                  }}
                >
                  <Eye size={12} style={{ marginRight: '4px', display: 'inline' }} /> Direct Output
                </button>
              </div>

              {/* Reset tools buttons */}
              <button
                onClick={resetAllEdits}
                style={{
                  border: '1px solid var(--glass-border)',
                  background: 'transparent',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RotateCcw size={12} /> Reset Changes
              </button>
            </div>

            {/* Split Slider Preview */}
            <div
              ref={sliderContainerRef}
              onMouseMove={handleSliderMouseMove}
              onTouchMove={handleSliderTouchMove}
              style={{
                position: 'relative',
                width: '100%',
                maxHeight: '520px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#0a0a0c',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: comparisonMode ? 'ew-resize' : 'default'
              }}
            >
              {/* Invisible element to read original source loaded events */}
              <img
                ref={imageRef}
                src={imageSrc}
                onLoad={handleImageLoad}
                style={{ display: 'none' }}
                alt="Source helper"
              />

              {comparisonMode ? (
                <div style={{ position: 'relative', width: '100%', height: '420px' }}>
                  {/* Before state (Base layer) */}
                  <img
                    src={imageSrc}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none'
                    }}
                    alt="Original"
                  />
                  {/* After state (Clipped top layer) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${sliderPosition}%`,
                      overflow: 'hidden',
                      borderRight: '2px solid var(--primary-color)'
                    }}
                  >
                    <img
                      src={modifiedSrc || imageSrc}
                      style={{
                        width: sliderContainerRef.current?.getBoundingClientRect().width || '100%',
                        height: '100%',
                        objectFit: 'contain',
                        maxWidth: 'none',
                        pointerEvents: 'none'
                      }}
                      alt="Modified"
                    />
                  </div>
                  {/* Handle indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: `${sliderPosition}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--primary-color)',
                      border: '2px solid #fff',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none'
                    }}
                  >
                    <Sliders size={14} color="#fff" />
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative', width: '100%', height: '420px', padding: '10px' }}>
                  <img
                    src={modifiedSrc || imageSrc}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                    alt="Modified full preview"
                  />

                  {/* Crop overlay box only visible in crop tab */}
                  {activeTab === 'crop' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        right: '10px',
                        bottom: '10px',
                        pointerEvents: 'none'
                      }}
                    >
                      <div
                        ref={cropRef}
                        style={{
                          position: 'absolute',
                          top: `${cropBox.y}%`,
                          left: `${cropBox.x}%`,
                          width: `${cropBox.w}%`,
                          height: `${cropBox.h}%`,
                          border: '2px dashed var(--primary-color)',
                          boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                          pointerEvents: 'auto',
                          cursor: 'grab'
                        }}
                        onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                      >
                        {/* Crop handle corner */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleCropMouseDown(e, 'br');
                          }}
                          style={{
                            position: 'absolute',
                            bottom: '-6px',
                            right: '-6px',
                            width: '14px',
                            height: '14px',
                            background: 'var(--primary-color)',
                            border: '2px solid #fff',
                            cursor: 'se-resize',
                            borderRadius: '2px'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom download footer actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.02)',
                padding: '12px 18px',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)'
              }}
            >
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Dimensions: <strong>{width}px × {height}px</strong>
                </p>
                {compressedSize && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--primary-color)', margin: '2px 0 0' }}>
                    Est. File Size: <strong>{compressedSize} KB</strong>
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setImageSrc(null);
                    setModifiedSrc(null);
                    setFile(null);
                    setCompressedSize(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-color)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Change Image
                </button>
                <button
                  onClick={downloadResult}
                  style={{
                    background: 'var(--primary-color)',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} /> Download Edited
                </button>
              </div>
            </div>
          </div>

          {/* Right Area: Tool Edit Tab Controls */}
          <div
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              padding: '16px',
              height: '520px',
              overflowY: 'auto'
            }}
          >
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Editing Modules
            </h3>
            
            {/* Tab selection grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {(['resize', 'compress', 'crop', 'rotate', 'flip', 'blur', 'sharpen', 'pixelate'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === 'crop') setComparisonMode(false); // Force crop visuals overlay
                  }}
                  style={{
                    background: activeTab === tab ? 'rgba(0, 161, 155, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: activeTab === tab ? '1px solid var(--primary-color)' : '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-color)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {tab === 'resize' && <Maximize2 size={16} />}
                  {tab === 'compress' && <Percent size={16} />}
                  {tab === 'crop' && <Crop size={16} />}
                  {tab === 'rotate' && <RotateCw size={16} />}
                  {tab === 'flip' && <Layers size={16} />}
                  {tab === 'blur' && <Sliders size={16} />}
                  {tab === 'sharpen' && <Sparkles size={16} />}
                  {tab === 'pixelate' && <Settings2 size={16} />}
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB PANEL CONTENTS */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              
              {/* RESIZE PANEL */}
              {activeTab === 'resize' && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 12px' }}>Resize Dimensions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Width (px)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={width}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setWidth(val);
                          if (maintainAspect) setHeight(Math.round(val / originalAspect));
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Height (px)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={height}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setHeight(val);
                          if (maintainAspect) setWidth(Math.round(val * originalAspect));
                        }}
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={maintainAspect}
                        onChange={(e) => setMaintainAspect(e.target.checked)}
                      />
                      Lock Aspect Ratio
                    </label>
                  </div>
                </div>
              )}

              {/* COMPRESS PANEL */}
              {activeTab === 'compress' && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 6px' }}>Quality Compression</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    Reduce target file sizes by sliding output quality ratios.
                  </p>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Compression Strength: {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                  />
                </div>
              )}

              {/* CROP PANEL */}
              {activeTab === 'crop' && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 12px' }}>Crop Aspect Ratio Presets</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {['custom', '1:1', '16:9', '4:3'].map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => handleRatioSelect(ratio)}
                        style={{
                          background: cropRatio === ratio ? 'var(--primary-color)' : 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--glass-border)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          color: cropRatio === ratio ? '#fff' : 'var(--text-color)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                    Note: Adjust boundaries using the dashed grid handles directly over the preview workspace.
                  </p>
                </div>
              )}

              {/* ROTATE PANEL */}
              {activeTab === 'rotate' && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 12px' }}>Rotation Parameters</h4>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {[0, 90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setRotation(deg)}
                        style={{
                          flex: 1,
                          background: rotation === deg ? 'var(--primary-color)' : 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--glass-border)',
                          padding: '8px',
                          borderRadius: '6px',
                          color: rotation === deg ? '#fff' : 'var(--text-color)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                  
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Fine-tune Rotation: {angleSlider}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={angleSlider}
                    onChange={(e) => setAngleSlider(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                  />
                </div>
              )}

              {/* FLIP PANEL */}
              {activeTab === 'flip' && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 12px' }}>Flip Axis Options</h4>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setFlipH(!flipH)}
                      style={{
                        flex: 1,
                        background: flipH ? 'var(--primary-color)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--glass-border)',
                        padding: '12px',
                        borderRadius: '8px',
                        color: flipH ? '#fff' : 'var(--text-color)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Flip Horizontal
                    </button>
                    <button
                      onClick={() => setFlipV(!flipV)}
                      style={{
                        flex: 1,
                        background: flipV ? 'var(--primary-color)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--glass-border)',
                        padding: '12px',
                        borderRadius: '8px',
                        color: flipV ? '#fff' : 'var(--text-color)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Flip Vertical
                    </button>
                  </div>
                </div>
              )}

              {/* BLUR PANEL */}
              {activeTab === 'blur' && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 12px' }}>Gaussian Blur filter</h4>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Blur Intensity: {blurRadius}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={blurRadius}
                    onChange={(e) => setBlurRadius(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                  />
                </div>
              )}

              {/* SHARPEN PANEL */}
              {activeTab === 'sharpen' && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 12px' }}>Edge Sharpening Filter</h4>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Sharpen Factor: {sharpenAmount}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={sharpenAmount}
                    onChange={(e) => setSharpenAmount(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                  />
                </div>
              )}

              {/* PIXELATE PANEL */}
              {activeTab === 'pixelate' && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 12px' }}>Retro Pixelation Grid</h4>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Block Dimension: {pixelSize}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="1"
                    value={pixelSize}
                    onChange={(e) => setPixelSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                  />
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
