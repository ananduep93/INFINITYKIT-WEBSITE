'use client';

import React, { useState, useRef, useEffect } from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function BlurBackground() {
  const [blur, setBlur] = useState(15);
  const [focusSize, setFocusSize] = useState(120);
  const [focusPos, setFocusPos] = useState({ x: 0.5, y: 0.5 }); // Normalized coordinates (0 to 1)
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isDraggingRef = useRef(false);

  // Redraw the canvas portrait blurred structure when focus parameters or position changes
  useEffect(() => {
    if (!imageSrc) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear previous
    ctx.clearRect(0, 0, w, h);
    ctx.filter = 'none';

    // 1. Draw background blurred image
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    ctx.drawImage(img, 0, 0, w, h);
    ctx.restore();

    // 2. Overlay sharp focus circle mask
    const fx = focusPos.x * w;
    const fy = focusPos.y * h;

    ctx.save();
    ctx.beginPath();
    ctx.arc(fx, fy, focusSize, 0, Math.PI * 2);
    ctx.clip();
    
    // Draw original sharp image inside clip
    ctx.drawImage(img, 0, 0, w, h);
    ctx.restore();

    // 3. Draw a subtle dashed indicator circle representing focus limits (only in browser preview)
    ctx.save();
    ctx.beginPath();
    ctx.arc(fx, fy, focusSize, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 161, 155, 0.7)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.restore();

  }, [blur, focusSize, focusPos, imageSrc]);

  const handleProcess = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload an image file.');
    }

    const file = files[0];
    setFileName(file.name);

    return new Promise<{ downloadUrl: string; fileName: string; resultData: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setImageSrc(src);

        const img = new Image();
        img.src = src;
        img.onload = () => {
          imgRef.current = img;
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
            }
          }

          setTimeout(() => {
            if (canvasRef.current) {
              // Export URL needs to be drawn clean WITHOUT the focus indicator circle
              const cleanUrl = getCleanBlurredDataUrl();
              resolve({
                downloadUrl: cleanUrl,
                fileName: `portrait_blur_${file.name}`,
                resultData: 'Portrait mode background blur applied successfully! You can drag the focus ring in the workspace preview below to adjust the sharp focus spot.'
              });
            } else {
              reject(new Error('Canvas rendering error.'));
            }
          }, 300);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  // Renders a clean frame without the UI outline circle to prepare standard downloads
  const getCleanBlurredDataUrl = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return '';

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return '';

    // Blurred base
    tempCtx.save();
    tempCtx.filter = `blur(${blur}px)`;
    tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
    tempCtx.restore();

    // Sharp overlay
    const fx = focusPos.x * canvas.width;
    const fy = focusPos.y * canvas.height;

    tempCtx.save();
    tempCtx.beginPath();
    tempCtx.arc(fx, fy, focusSize, 0, Math.PI * 2);
    tempCtx.clip();
    tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
    tempCtx.restore();

    return tempCanvas.toDataURL('image/jpeg', 0.95);
  };

  // Mouse coordinate handlers to drag the portrait ring
  const updateFocusCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setFocusPos({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y))
    });
  };

  const handleReset = () => {
    setImageSrc(null);
    setFileName('');
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Portrait Blur Background
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Create professional DLSR style depth-of-field portrait effects. Adjust blur radii and drag focus rings anywhere locally.
      </p>

      <ToolWorkspace
        toolId="blur-background"
        accept="image/*"
        maxFiles={1}
        onProcess={handleProcess}
        onReset={handleReset}
        actionButtonText="Initialize Portrait Blur"
        instructions={[
          'Upload any image (PNG, JPEG, WebP).',
          'Wait for depth filters to pre-render.',
          'Click and drag or tap anywhere on the image preview workspace to place the circular focus zone.',
          'Adjust blur intensity and focus size parameters using sliders below to fit your subject.'
        ]}
      />

      {imageSrc && (
        <div className="glass-panel" style={{ marginTop: '25px', padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>Interactive Portrait Workspace</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            {/* Blur Level */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>
                <span>Background Blur Intensity</span>
                <span>{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-color)' }}
              />
            </div>

            {/* Focus Ring Radius */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>
                <span>Focus Aperture Size</span>
                <span>{focusSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                value={focusSize}
                onChange={(e) => setFocusSize(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-color)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Canvas Interactive Viewport */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              background: '#222',
              borderRadius: '12px',
              padding: '10px',
              maxHeight: '450px',
              overflow: 'auto',
              border: '1px solid var(--glass-border)',
              width: '100%'
            }}>
              <canvas
                ref={canvasRef}
                onMouseDown={(e) => {
                  isDraggingRef.current = true;
                  updateFocusCoordinates(e);
                }}
                onMouseMove={(e) => {
                  if (isDraggingRef.current) {
                    updateFocusCoordinates(e);
                  }
                }}
                onMouseUp={() => isDraggingRef.current = false}
                onMouseLeave={() => isDraggingRef.current = false}
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  cursor: 'move',
                  borderRadius: '8px'
                }}
              />
            </div>

            {/* Export trigger */}
            <button
              onClick={() => {
                const cleanUrl = getCleanBlurredDataUrl();
                if (cleanUrl) {
                  const a = document.createElement('a');
                  a.href = cleanUrl;
                  a.download = `portrait_blur_${fileName || 'export.jpg'}`;
                  a.click();
                }
              }}
              className="btn"
            >
              Export Portrait Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
