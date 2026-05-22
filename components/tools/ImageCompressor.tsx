'use client';

import React, { useState } from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function ImageCompressor() {
  const [quality, setQuality] = useState(0.7);

  const handleCompress = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload an image to compress.');
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

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Get raw canvas WebP or JPEG compression URL
          const format = file.type === 'image/png' ? 'image/jpeg' : file.type; // PNGs don't compress via quality unless converted to JPEG
          const dataUrl = canvas.toDataURL(format, quality);

          // Convert to blob to measure size
          fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
              const downloadUrl = URL.createObjectURL(blob);
              const originalSize = (file.size / 1024).toFixed(1);
              const compressedSize = (blob.size / 1024).toFixed(1);
              const ratio = ((1 - (blob.size / file.size)) * 100).toFixed(0);

              resolve({
                downloadUrl,
                fileName: `compressed_${file.name.substring(0, file.name.lastIndexOf('.'))}.${format.split('/')[1]}`,
                resultData: `Original Size: ${originalSize} KB\nCompressed Size: ${compressedSize} KB\nSaved Size Ratio: ${ratio}%`
              });
            })
            .catch(err => reject(err));
        };
        img.onerror = () => reject(new Error('Failed to load image structure.'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file payload.'));
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Browser Image Compressor
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Reduce JPEG/PNG image sizes 100% locally in your browser without losing visual clarity.
      </p>

      <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-color)' }}>
          Compression Strength Quality: {Math.round(quality * 100)}%
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

      <ToolWorkspace
        toolId="compressimage"
        accept="image/*"
        maxFiles={1}
        onProcess={handleCompress}
        actionButtonText="Compress Image"
        instructions={[
          'Upload your JPG, PNG, or WebP graphic file.',
          'Adjust the Compression Strength slider above (lower percentages yield smaller file sizes).',
          'Click the "Compress Image" button to optimize your assets locally.'
        ]}
      />
    </div>
  );
}
