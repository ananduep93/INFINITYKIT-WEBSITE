'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  Download,
  Upload,
  RefreshCw,
  Sliders,
  Scissors,
  Trash2,
  Brush,
  Eraser,
  Sun,
  Eye,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

interface ImageAISuiteProps {
  initialTab?: 'bg-remover' | 'remove-objects' | 'remove-watermark' | 'remove-text' | 'colorize' | 'restore';
}

export default function ImageAISuite({ initialTab = 'bg-remover' }: ImageAISuiteProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Background Remover state
  const [threshold, setThreshold] = useState<number>(30);
  const [pickedColor, setPickedColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [apiToken, setApiToken] = useState<string>('');
  const [useRemoveBgApi, setUseRemoveBgApi] = useState<boolean>(false);

  // Inpainting (Objects / Watermark / Text Removal) state
  const [brushSize, setBrushSize] = useState<number>(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushMode, setBrushMode] = useState<'paint' | 'erase'>('paint');
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  // Colorize State
  const [colorizeMode, setColorizeMode] = useState<string>('sepia'); // sepia, cyanotype, warm, cool, golden
  const [colorIntensity, setColorIntensity] = useState<number>(80);

  // Restoration State
  const [denoiseLevel, setDenoiseLevel] = useState<number>(30);
  const [contrastBoost, setContrastBoost] = useState<number>(40);
  const [sharpnessBoost, setSharpnessBoost] = useState<number>(50);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mobile check removed - using CSS media queries

  // Sync favorites & history
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favs.includes(`ai-edit-${activeTab}`));

      // Load remove.bg key from settings if exists
      const savedSettings = JSON.parse(localStorage.getItem('infinityKitSettings') || '{}');
      if (savedSettings.removeBgKey) {
        setApiToken(savedSettings.removeBgKey);
        setUseRemoveBgApi(true);
      }

      import('../../lib/sync').then((m) => {
        m.default.addToHistory(`ai-edit-${activeTab}`);
      });
    }
  }, [activeTab]);

  const toggleFavorite = () => {
    if (typeof window === 'undefined') return;
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    const key = `ai-edit-${activeTab}`;
    let updated;
    if (isFavorite) {
      updated = favs.filter((id: string) => id !== key);
    } else {
      updated = [...favs, key];
    }
    localStorage.setItem('favorites', JSON.stringify(updated));
    setIsFavorite(!isFavorite);

    import('../../lib/sync').then((m) => {
      m.default.saveFavorite(key, !isFavorite);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setProcessedSrc(null);
      setPickedColor(null);
    };
    reader.readAsDataURL(uploaded);
  };

  // Initialize Canvas layouts when image loads
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      sourceImageRef.current = img;

      // Set up Drawing Preview canvas
      const drawCanvas = drawCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (drawCanvas && maskCanvas) {
        drawCanvas.width = img.naturalWidth;
        drawCanvas.height = img.naturalHeight;
        maskCanvas.width = img.naturalWidth;
        maskCanvas.height = img.naturalHeight;

        // Init draw canvas
        const dCtx = drawCanvas.getContext('2d');
        if (dCtx) {
          dCtx.drawImage(img, 0, 0);
        }

        // Init mask canvas (solid black background initially)
        const mCtx = maskCanvas.getContext('2d');
        if (mCtx) {
          mCtx.fillStyle = '#000000';
          mCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        }

        // Auto background picking: select top-left corner pixel
        if (activeTab === 'bg-remover') {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = 1;
          tempCanvas.height = 1;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.drawImage(img, 0, 0, 1, 1);
            const pixel = tempCtx.getImageData(0, 0, 1, 1).data;
            setPickedColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
          }
        }
      }
    };
  }, [imageSrc, activeTab]);

  // Re-run colorization / filters in real time
  useEffect(() => {
    if (imageSrc && sourceImageRef.current && (activeTab === 'colorize' || activeTab === 'restore')) {
      processFilters();
    }
  }, [imageSrc, colorizeMode, colorIntensity, denoiseLevel, contrastBoost, sharpnessBoost, activeTab]);

  // Re-run local chroma removal
  useEffect(() => {
    if (imageSrc && activeTab === 'bg-remover' && pickedColor && !useRemoveBgApi) {
      processLocalBgRemoval();
    }
  }, [threshold, pickedColor, useRemoveBgApi, imageSrc, activeTab]);

  // Prevent default touch movement (scrolling) during active drawing on canvas
  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const preventScroll = (e: TouchEvent) => {
      if (isDrawing && e.cancelable) {
        e.preventDefault();
      }
    };

    canvas.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      canvas.removeEventListener('touchmove', preventScroll);
    };
  }, [isDrawing]);

  // 1. Local Chroma Background Eraser
  const processLocalBgRemoval = () => {
    const img = sourceImageRef.current;
    const canvas = drawCanvasRef.current;
    if (!img || !canvas || !pickedColor) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const { r: pr, g: pg, b: pb } = pickedColor;
    const tolerance = threshold * 2.5;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const dist = Math.sqrt((r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2);
      if (dist < tolerance) {
        data[i + 3] = 0; // Transparent
      }
    }
    ctx.putImageData(imgData, 0, 0);
    setProcessedSrc(canvas.toDataURL('image/png'));
  };

  // Canvas picking color on click
  const handleBgColorPick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas || !sourceImageRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(sourceImageRef.current, 0, 0);
      const pixel = tempCtx.getImageData(x, y, 1, 1).data;
      setPickedColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
    }
  };

  // remove.bg API request
  const processRemoveBgApi = async () => {
    if (!file || !apiToken) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('image_file', file);
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiToken
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('API request failed. Verify your remove.bg key.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedSrc(url);

      import('../../lib/sync').then((m) => {
        m.default.logActivity('AI Background Stripper', 'Removed background using remove.bg API.');
      });
    } catch (err: any) {
      alert(err.message || 'Background removal API failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Client-Side Inpainting (For Objects, Text, Watermark removal)
  // Brushing Drawing triggers
  const getCanvasMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const handleBrushStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    drawBrushStroke(e);
  };

  const handleBrushMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    drawBrushStroke(e);
  };

  const handleBrushEnd = () => {
    setIsDrawing(false);
  };

  const getCanvasTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: ((touch.clientX - rect.left) / rect.width) * canvas.width,
      y: ((touch.clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const handleBgColorPickTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas || !sourceImageRef.current) return;
    const pos = getCanvasTouchPos(e);
    const x = Math.floor(pos.x);
    const y = Math.floor(pos.y);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(sourceImageRef.current, 0, 0);
      const pixel = tempCtx.getImageData(x, y, 1, 1).data;
      const rgb = { r: pixel[0], g: pixel[1], b: pixel[2] };
      setPickedColor(rgb);
    }
  };

  const handleBrushStartTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    drawBrushStrokeTouch(e);
  };

  const handleBrushMoveTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    drawBrushStrokeTouch(e);
  };

  const handleBrushEndTouch = () => {
    setIsDrawing(false);
  };

  const drawBrushStrokeTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const drawCanvas = drawCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!drawCanvas || !maskCanvas) return;

    const dCtx = drawCanvas.getContext('2d');
    const mCtx = maskCanvas.getContext('2d');
    if (!dCtx || !mCtx) return;

    const pos = getCanvasTouchPos(e);

    dCtx.lineJoin = 'round';
    dCtx.lineCap = 'round';
    dCtx.lineWidth = brushSize;

    if (brushMode === 'paint') {
      dCtx.globalCompositeOperation = 'source-over';
      dCtx.strokeStyle = 'rgba(255, 65, 54, 0.4)';
      dCtx.beginPath();
      dCtx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      dCtx.fill();

      mCtx.fillStyle = '#ffffff';
      mCtx.beginPath();
      mCtx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      mCtx.fill();
    } else {
      dCtx.save();
      dCtx.beginPath();
      dCtx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      dCtx.clip();
      if (sourceImageRef.current) {
        dCtx.drawImage(sourceImageRef.current, 0, 0);
      }
      dCtx.restore();

      mCtx.fillStyle = '#000000';
      mCtx.beginPath();
      mCtx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      mCtx.fill();
    }
  };

  const drawBrushStroke = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const drawCanvas = drawCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!drawCanvas || !maskCanvas) return;

    const dCtx = drawCanvas.getContext('2d');
    const mCtx = maskCanvas.getContext('2d');
    if (!dCtx || !mCtx) return;

    const pos = getCanvasMousePos(e);

    // Draw on visual preview canvas (red transparent brush)
    dCtx.lineJoin = 'round';
    dCtx.lineCap = 'round';
    dCtx.lineWidth = brushSize;

    if (brushMode === 'paint') {
      dCtx.globalCompositeOperation = 'source-over';
      dCtx.strokeStyle = 'rgba(255, 65, 54, 0.4)'; // Red mask overlay
      dCtx.beginPath();
      // Draw a point
      dCtx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      dCtx.fill();

      // Draw on mask canvas (white pixels means modified mask region)
      mCtx.fillStyle = '#ffffff';
      mCtx.beginPath();
      mCtx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      mCtx.fill();
    } else {
      // Eraser: clear overlay by re-drawing original image segments
      dCtx.save();
      dCtx.beginPath();
      dCtx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      dCtx.clip();
      if (sourceImageRef.current) {
        dCtx.drawImage(sourceImageRef.current, 0, 0);
      }
      dCtx.restore();

      // Eraser on mask canvas: paint back to solid black
      mCtx.fillStyle = '#000000';
      mCtx.beginPath();
      mCtx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      mCtx.fill();
    }
  };

  const clearMaskSelection = () => {
    const drawCanvas = drawCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const img = sourceImageRef.current;
    if (!drawCanvas || !maskCanvas || !img) return;

    const dCtx = drawCanvas.getContext('2d');
    const mCtx = maskCanvas.getContext('2d');
    if (dCtx && mCtx) {
      dCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
      dCtx.drawImage(img, 0, 0);

      mCtx.fillStyle = '#000000';
      mCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    }
    setProcessedSrc(null);
  };

  // Run client-side diffusion inpainting
  const executeInpainting = () => {
    const drawCanvas = drawCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const img = sourceImageRef.current;
    if (!drawCanvas || !maskCanvas || !img) return;

    setIsProcessing(true);

    setTimeout(() => {
      const dCtx = drawCanvas.getContext('2d');
      const mCtx = maskCanvas.getContext('2d');
      if (!dCtx || !mCtx) {
        setIsProcessing(false);
        return;
      }

      // Read image pixels
      const w = drawCanvas.width;
      const h = drawCanvas.height;
      
      // Get base image pixels (must be original without red overlays)
      const baseCanvas = document.createElement('canvas');
      baseCanvas.width = w;
      baseCanvas.height = h;
      const baseCtx = baseCanvas.getContext('2d');
      if (!baseCtx) return;
      baseCtx.drawImage(img, 0, 0);

      const baseData = baseCtx.getImageData(0, 0, w, h);
      const basePixels = baseData.data;

      // Get mask pixels
      const maskData = mCtx.getImageData(0, 0, w, h);
      const maskPixels = maskData.data;

      // Fast marching inpainting boundary approximation:
      // Loop over iterations, average masked pixels with surrounding non-masked pixel colors
      const iterations = 30;
      
      // Copy array so we don't read-write conflicts in the same pass
      const workingPixels = new Uint8ClampedArray(basePixels);

      for (let iter = 0; iter < iterations; iter++) {
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = (y * w + x) * 4;

            // Check if this pixel is inside the mask (white pixels in maskCanvas)
            // Mask is white (R > 128)
            if (maskPixels[idx] > 128) {
              let rSum = 0, gSum = 0, bSum = 0, count = 0;

              // 8-neighbor average check
              const neighbors = [
                idx - 4,          // Left
                idx + 4,          // Right
                idx - w * 4,      // Top
                idx + w * 4,      // Bottom
                idx - w * 4 - 4,  // Top Left
                idx - w * 4 + 4,  // Top Right
                idx + w * 4 - 4,  // Bottom Left
                idx + w * 4 + 4   // Bottom Right
              ];

              for (const nIdx of neighbors) {
                // If neighbor is NOT inside the mask, prioritize its texture
                if (maskPixels[nIdx] <= 128) {
                  rSum += workingPixels[nIdx];
                  gSum += workingPixels[nIdx + 1];
                  bSum += workingPixels[nIdx + 2];
                  count++;
                }
              }

              if (count > 0) {
                workingPixels[idx] = Math.round(rSum / count);
                workingPixels[idx + 1] = Math.round(gSum / count);
                workingPixels[idx + 2] = Math.round(bSum / count);
                // Temporarily unmask this pixel so it can propagate in subsequent iterations
                maskPixels[idx] = 0; 
              }
            }
          }
        }
      }

      // Draw final results
      baseData.data.set(workingPixels);
      dCtx.putImageData(baseData, 0, 0);
      setProcessedSrc(drawCanvas.toDataURL('image/jpeg'));
      setIsProcessing(false);

      import('../../lib/sync').then((m) => {
        m.default.logActivity('AI Object Remover', 'Successfully inpainted and erased objects.');
      });
    }, 100);
  };

  // 3. Colorization filter routines (duotone & gradient maps)
  const processFilters = () => {
    const img = sourceImageRef.current;
    const canvas = drawCanvasRef.current;
    if (!img || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const len = data.length;

    if (activeTab === 'colorize') {
      const factor = colorIntensity / 100;

      for (let i = 0; i < len; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Luminous Gray
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        let tr = gray;
        let tg = gray;
        let tb = gray;

        if (colorizeMode === 'sepia') {
          tr = gray * 0.9 + 40;
          tg = gray * 0.7 + 20;
          tb = gray * 0.5;
        } else if (colorizeMode === 'cyanotype') {
          tr = gray * 0.4;
          tg = gray * 0.6 + 10;
          tb = gray * 0.9 + 40;
        } else if (colorizeMode === 'golden') {
          tr = gray * 1.0 + 35;
          tg = gray * 0.85 + 15;
          tb = gray * 0.6;
        } else if (colorizeMode === 'warm') {
          tr = Math.min(255, r * 1.15);
          tg = g;
          tb = Math.max(0, b * 0.85);
        }

        // Interpolate with original intensity
        data[i] = r * (1 - factor) + tr * factor;
        data[i + 1] = g * (1 - factor) + tg * factor;
        data[i + 2] = b * (1 - factor) + tb * factor;
      }
    } else if (activeTab === 'restore') {
      // Old photo restore: Contrast stretching + sharpen matrix + simple low-pass noise reduction
      const contrast = (contrastBoost + 100) / 100; // factor
      
      // Calculate global luminance levels for stretch min/max
      let minLum = 255;
      let maxLum = 0;
      for (let i = 0; i < len; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (lum < minLum) minLum = lum;
        if (lum > maxLum) maxLum = lum;
      }

      const lumRange = maxLum - minLum || 1;

      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // 1. Histogram stretching (stretch faded brightness levels)
        r = ((r - minLum) / lumRange) * 255;
        g = ((g - minLum) / lumRange) * 255;
        b = ((b - minLum) / lumRange) * 255;

        // 2. Contrast adjustment
        r = (r - 128) * contrast + 128;
        g = (g - 128) * contrast + 128;
        b = (b - 128) * contrast + 128;

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }

      ctx.putImageData(imgData, 0, 0);

      // Apply convolution matrix sharpen if requested
      if (sharpnessBoost > 0) {
        const factor = sharpnessBoost / 150; // Max sharpness coefficient
        const tempImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const sharpened = sharpenKernelRestoration(tempImgData, factor);
        ctx.putImageData(sharpened, 0, 0);
      }
    }

    if (activeTab === 'colorize' || activeTab === 'restore') {
      ctx.putImageData(imgData, 0, 0);
      setProcessedSrc(canvas.toDataURL('image/jpeg'));
    }
  };

  const sharpenKernelRestoration = (imgData: ImageData, amount: number): ImageData => {
    const w = imgData.width;
    const h = imgData.height;
    const src = imgData.data;
    
    const output = new ImageData(w, h);
    const dst = output.data;

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
        dst[idx + 3] = src[idx + 3];
      }
    }
    return output;
  };

  const downloadResult = () => {
    const finalUrl = processedSrc || imageSrc;
    if (!finalUrl) return;

    const link = document.createElement('a');
    link.href = finalUrl;
    link.download = `ai_processed_${file?.name || 'image.png'}`;
    link.click();
  };

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <style>{`
        .image-suite-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        .image-suite-sidebar {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 16px;
          height: 520px;
          overflow-y: auto;
        }
        .image-suite-preview-canvas-container {
          position: relative;
          background: repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 50% / 20px 20px;
          border-radius: 16px;
          min-height: 400px;
          max-height: 520px;
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--glass-border);
        }
        @media (max-width: 1024px) {
          .image-suite-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .image-suite-sidebar {
            height: auto !important;
          }
          .image-suite-preview-canvas-container {
            min-height: 300px !important;
            max-height: 360px !important;
          }
        }
      `}</style>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: 0 }}>AI Editing Suite</h2>
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
        Leverage client-side inpainting matrices and visual restoration kernels to strip objects, restore color details, or drop background layouts locally.
      </p>

      {!imageSrc ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--glass-border)',
            borderRadius: '16px',
            padding: '65px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--glass-bg)'
          }}
        >
          <ImageIcon size={48} color="var(--primary-color)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Upload Image for AI Editing</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Supports JPG, PNG, and WebP up to 30MB
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
        <div className="image-suite-grid">
          
          {/* Preview Panel (Canvas-driven) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Resolution: <strong>{sourceImageRef.current?.naturalWidth}x{sourceImageRef.current?.naturalHeight}px</strong>
              </span>
              
              {/* Wipe brush markings */}
              {(activeTab === 'remove-objects' || activeTab === 'remove-watermark' || activeTab === 'remove-text') && (
                <button
                  onClick={clearMaskSelection}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--glass-border)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Interactive Drawing Box */}
            <div className="image-suite-preview-canvas-container">
              <canvas
                ref={drawCanvasRef}
                onMouseDown={
                  (activeTab === 'remove-objects' || activeTab === 'remove-watermark' || activeTab === 'remove-text')
                    ? handleBrushStart
                    : (activeTab === 'bg-remover' ? handleBgColorPick : undefined)
                }
                onMouseMove={
                  (activeTab === 'remove-objects' || activeTab === 'remove-watermark' || activeTab === 'remove-text')
                    ? handleBrushMove
                    : undefined
                }
                onMouseUp={
                  (activeTab === 'remove-objects' || activeTab === 'remove-watermark' || activeTab === 'remove-text')
                    ? handleBrushEnd
                    : undefined
                }
                onMouseLeave={handleBrushEnd}
                onTouchStart={
                  (activeTab === 'remove-objects' || activeTab === 'remove-watermark' || activeTab === 'remove-text')
                    ? handleBrushStartTouch
                    : (activeTab === 'bg-remover' ? handleBgColorPickTouch : undefined)
                }
                onTouchMove={
                  (activeTab === 'remove-objects' || activeTab === 'remove-watermark' || activeTab === 'remove-text')
                    ? handleBrushMoveTouch
                    : undefined
                }
                onTouchEnd={
                  (activeTab === 'remove-objects' || activeTab === 'remove-watermark' || activeTab === 'remove-text')
                    ? handleBrushEndTouch
                    : undefined
                }
                style={{
                  maxWidth: '100%',
                  maxHeight: '480px',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  cursor: (activeTab === 'remove-objects' || activeTab === 'remove-watermark' || activeTab === 'remove-text')
                    ? 'crosshair'
                    : (activeTab === 'bg-remover' ? 'pointer' : 'default')
                }}
              />
              
              {/* Invisible helper mask canvas */}
              <canvas ref={maskCanvasRef} style={{ display: 'none' }} />
            </div>

            {/* Export Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setImageSrc(null);
                  setProcessedSrc(null);
                  setFile(null);
                }}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                Change Image
              </button>
              <button
                onClick={downloadResult}
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} /> Export Result
              </button>
            </div>

          </div>

          {/* Right Panel: Side Tuning settings */}
          <div className="image-suite-sidebar">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Editing Presets
            </h3>

            {/* Tab Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {(['bg-remover', 'remove-objects', 'remove-watermark', 'remove-text', 'colorize', 'restore'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setProcessedSrc(null);
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
                    textAlign: 'center',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab === 'bg-remover' && 'Remove Bg'}
                  {tab === 'remove-objects' && 'Erase Object'}
                  {tab === 'remove-watermark' && 'Remove Watermark'}
                  {tab === 'remove-text' && 'Remove Text'}
                  {tab === 'colorize' && 'Colorize'}
                  {tab === 'restore' && 'Restore Photo'}
                </button>
              ))}
            </div>

            {/* Editing parameter layout */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              
              {/* BACKGROUND REMOVAL PARAMETERS */}
              {activeTab === 'bg-remover' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                    <input
                      type="checkbox"
                      id="remove-bg-api"
                      checked={useRemoveBgApi}
                      onChange={(e) => setUseRemoveBgApi(e.target.checked)}
                    />
                    <label htmlFor="remove-bg-api" style={{ fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                      Use remove.bg API Key
                    </label>
                  </div>

                  {useRemoveBgApi ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="remove.bg API token"
                        value={apiToken}
                        onChange={(e) => setApiToken(e.target.value)}
                      />
                      <button
                        onClick={processRemoveBgApi}
                        disabled={isProcessing}
                        className="btn-primary"
                        style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }}
                      >
                        {isProcessing ? 'Calling API...' : 'Remove Background'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                        Click anywhere on the preview image to select the target color shade to strip out.
                      </span>

                      {pickedColor && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Active Shade:</span>
                          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: `rgb(${pickedColor.r}, ${pickedColor.g}, ${pickedColor.b})`, border: '1px solid #fff' }} />
                        </div>
                      )}

                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                        Color Tolerance Tolerance: {threshold}%
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={threshold}
                        onChange={(e) => setThreshold(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--primary-color)' }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* INPAINTING BRUSH PANEL (Objects, watermark, text) */}
              {(activeTab === 'remove-objects' || activeTab === 'remove-watermark' || activeTab === 'remove-text') && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 8px' }}>
                    {activeTab === 'remove-objects' && 'Object Erasing Brush'}
                    {activeTab === 'remove-watermark' && 'Watermark Brush overlay'}
                    {activeTab === 'remove-text' && 'Text Highlighter brush'}
                  </h4>

                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>
                    Paint over the region you want to erase. Use a snug fit to help texture matching algorithms.
                  </span>

                  <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                    <button
                      onClick={() => setBrushMode('paint')}
                      style={{
                        flex: 1,
                        background: brushMode === 'paint' ? 'var(--primary-color)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        padding: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: brushMode === 'paint' ? '#fff' : 'var(--text-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Brush size={12} /> Brush
                    </button>
                    <button
                      onClick={() => setBrushMode('erase')}
                      style={{
                        flex: 1,
                        background: brushMode === 'erase' ? 'var(--primary-color)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        padding: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: brushMode === 'erase' ? '#fff' : 'var(--text-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eraser size={12} /> Clear Brush
                    </button>
                  </div>

                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Brush Diameter Size: {brushSize}px
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer', marginBottom: '20px' }}
                  />

                  <button
                    onClick={executeInpainting}
                    disabled={isProcessing}
                    className="btn-primary"
                    style={{ width: '100%', padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Inpainting texture...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> Erase Selected Region
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* COLORIZE PANEL */}
              {activeTab === 'colorize' && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 12px' }}>Duotone Color Schemes</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '16px' }}>
                    {['sepia', 'cyanotype', 'warm', 'golden'].map((scheme) => (
                      <button
                        key={scheme}
                        onClick={() => setColorizeMode(scheme)}
                        style={{
                          background: colorizeMode === scheme ? 'var(--primary-color)' : 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--glass-border)',
                          padding: '8px 4px',
                          borderRadius: '6px',
                          color: colorizeMode === scheme ? '#fff' : 'var(--text-color)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        {scheme}
                      </button>
                    ))}
                  </div>

                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Color Saturation Strength: {colorIntensity}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={colorIntensity}
                    onChange={(e) => setColorIntensity(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                  />
                </div>
              )}

              {/* RESTORATION PANEL */}
              {activeTab === 'restore' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Restore Faded Contrast: {contrastBoost}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={contrastBoost}
                      onChange={(e) => setContrastBoost(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Detail Sharpening factor: {sharpnessBoost}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sharpnessBoost}
                      onChange={(e) => setSharpnessBoost(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
