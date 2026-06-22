'use client';

import React, { useState } from 'react';
import ToolWorkspace from '../../../components/ui/ToolWorkspace';

export default function ImageResizer() {
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [originalAspect, setOriginalAspect] = useState<number | null>(null);

  const handleResize = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload an image to resize.');
    }

    const file = files[0];
    return new Promise<{ downloadUrl: string; fileName: string; resultData: any }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas 2D context.'));
            return;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to resize image canvas.'));
              return;
            }
            const downloadUrl = URL.createObjectURL(blob);
            resolve({
              downloadUrl,
              fileName: `resized_${file.name}`,
              resultData: `Resized Image Dimensions: ${width}px x ${height}px\nAspect Ratio Mode: ${maintainAspect ? 'Locked' : 'Unlocked'}`
            });
          }, file.type);
        };
        img.onerror = () => reject(new Error('Failed to load image structure.'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file payload.'));
      reader.readAsDataURL(file);
    });
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (maintainAspect && originalAspect) {
      setHeight(Math.round(val / originalAspect));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (maintainAspect && originalAspect) {
      setWidth(Math.round(val * originalAspect));
    }
  };

  const handleFileLoaded = (fileList: File[]) => {
    if (fileList.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const aspect = img.width / img.height;
          setOriginalAspect(aspect);
          setWidth(img.width);
          setHeight(img.height);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(fileList[0]);
    }
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Resize Image Boundaries
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Adjust image width & height coordinates client-side with aspect ratio locking.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Width (Pixels)</label>
          <input
            type="number"
            className="form-input"
            value={width}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Height (Pixels)</label>
          <input
            type="number"
            className="form-input"
            value={height}
            onChange={(e) => handleHeightChange(Number(e.target.value))}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '25px 0 0 0' }}>
          <input
            type="checkbox"
            id="aspect-ratio"
            checked={maintainAspect}
            onChange={(e) => setMaintainAspect(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
          />
          <label htmlFor="aspect-ratio" style={{ fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none' }}>
            Lock Aspect Ratio
          </label>
        </div>
      </div>

      <ToolWorkspace
        toolId="resizeimage"
        accept="image/*"
        maxFiles={1}
        onProcess={handleResize}
        onFileChange={handleFileLoaded}
        onReset={() => {
          setWidth(800);
          setHeight(600);
          setOriginalAspect(null);
        }}
        actionButtonText="Resize Image"
        instructions={[
          'Upload your JPG, PNG, or WebP graphic file.',
          'Set custom Width and Height bounds (use aspect-locking to avoid stretch distortions).',
          'Click the "Resize Image" button to output your resized graphic locally.'
        ]}
      />
    </div>
  );
}
