'use client';

import React, { useState, useRef, useEffect } from 'react';
import ToolWorkspace from '../../../components/ui/ToolWorkspace';

export default function BackgroundRemover() {
  const [threshold, setThreshold] = useState(30);
  const [pickedColor, setPickedColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Run transparent pixel filtering locally when pickedColor or threshold changes
  useEffect(() => {
    if (!imageSrc || !pickedColor) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const { r: pr, g: pg, b: pb } = pickedColor;
    const limit = threshold * 2.5; // Scale threshold for Euclidean color distance

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate Euclidean color distance
      const dist = Math.sqrt((r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2);
      if (dist < limit) {
        data[i + 3] = 0; // Set transparent
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [pickedColor, threshold, imageSrc]);

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
              // Default picked color is top-left corner pixel (typically background)
              const topPixel = ctx.getImageData(0, 0, 1, 1).data;
              setPickedColor({ r: topPixel[0], g: topPixel[1], b: topPixel[2] });
            }
          }

          // Small delay to let canvas process
          setTimeout(() => {
            if (canvasRef.current) {
              const url = canvasRef.current.toDataURL('image/png');
              resolve({
                downloadUrl: url,
                fileName: `bg_removed_${file.name.replace(/\.[^/.]+$/, '')}.png`,
                resultData: 'Background removed successfully. You can adjust the threshold or click on any spot in the preview to pick a different background color to strip!'
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

  const handleReset = () => {
    setImageSrc(null);
    setPickedColor(null);
    setFileName('');
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);

    // Re-draw original to get clean pixel color
    if (imgRef.current) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(imgRef.current, 0, 0);
        const pixel = tempCtx.getImageData(x, y, 1, 1).data;
        setPickedColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
      }
    }
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Background Remover
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Strip solid backgrounds from your images locally and instantly. Pick custom color blocks to erase and fine-tune with tolerances.
      </p>

      <ToolWorkspace
        toolId="bg-remover"
        accept="image/*"
        maxFiles={1}
        onProcess={handleProcess}
        onReset={handleReset}
        actionButtonText="Initialize Background Removal"
        instructions={[
          'Upload any image (PNG, JPEG, WebP).',
          'Wait for the canvas workspace to initialize.',
          'Double-click or click anywhere on the image preview to pick the color block to make transparent.',
          'Tune the "Removal Threshold" slider to dynamically clear matching color shades, and save as a transparent PNG!'
        ]}
      />

      {imageSrc && (
        <div className="glass-panel" style={{ marginTop: '25px', padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>Dynamic Fine-Tuning Console</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Threshold Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>
                <span>Removal Threshold (Tolerance)</span>
                <span>{threshold}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-color)' }}
              />
            </div>

            {/* Picked Color Indicator */}
            {pickedColor && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Active Removal Color:</span>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: `rgb(${pickedColor.r}, ${pickedColor.g}, ${pickedColor.b})`,
                  border: '1px solid var(--glass-border)'
                }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  RGB({pickedColor.r}, {pickedColor.g}, {pickedColor.b})
                </span>
              </div>
            )}

            {/* Interactive Canvas Preview */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              background: 'repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 50% / 20px 20px',
              borderRadius: '12px',
              padding: '10px',
              maxHeight: '450px',
              overflow: 'auto',
              border: '1px solid var(--glass-border)'
            }}>
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                title="Click any pixel to pick a new background color to erase"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  cursor: 'crosshair',
                  borderRadius: '8px'
                }}
              />
            </div>

            {/* Instant Download Button */}
            <button
              onClick={() => {
                const canvas = canvasRef.current;
                if (canvas) {
                  const url = canvas.toDataURL('image/png');
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `bg_removed_${fileName || 'export'}.png`;
                  a.click();
                }
              }}
              className="btn"
              style={{ alignSelf: 'center', marginTop: '10px' }}
            >
              Export Transparent PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
