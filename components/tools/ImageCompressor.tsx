'use client';

import React, { useState } from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function ImageCompressor() {
  const [targetSize, setTargetSize] = useState<number>(500);
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB'>('KB');

  const handleCompress = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload an image to compress.');
    }

    const file = files[0];
    const targetBytes = targetUnit === 'MB' ? targetSize * 1024 * 1024 : targetSize * 1024;

    return new Promise<{ downloadUrl: string; fileName: string; resultData: any }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas 2D context.'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const format = file.type === 'image/png' ? 'image/jpeg' : (file.type || 'image/jpeg');

          const toBlob = (q: number): Promise<Blob | null> =>
            new Promise((res) => canvas.toBlob(res, format, q));

          let bestBlob: Blob | null = null;

          if (file.size <= targetBytes) {
            // Already under target — export at full quality
            bestBlob = await toBlob(0.95);
          } else {
            // Binary search for highest quality that still fits target
            let lo = 0.05, hi = 0.95;
            for (let i = 0; i < 14; i++) {
              const mid = (lo + hi) / 2;
              const blob = await toBlob(mid);
              if (!blob) break;
              if (blob.size <= targetBytes) {
                bestBlob = blob;
                lo = mid; // Fits — try higher quality
              } else {
                hi = mid; // Too big — lower quality
              }
            }
            // Fallback: use lowest quality if nothing fit
            if (!bestBlob) {
              bestBlob = await toBlob(lo);
            }
          }

          if (!bestBlob) {
            reject(new Error('Compression failed. Please try again.'));
            return;
          }

          const downloadUrl = URL.createObjectURL(bestBlob);
          const originalSizeKB = (file.size / 1024).toFixed(1);
          const compressedSizeKB = (bestBlob.size / 1024).toFixed(1);
          const ratio = ((1 - (bestBlob.size / file.size)) * 100).toFixed(0);

          resolve({
            downloadUrl,
            fileName: `compressed_${file.name.substring(0, file.name.lastIndexOf('.'))}.${format.split('/')[1]}`,
            resultData: `Original Size: ${originalSizeKB} KB\nCompressed Size: ${compressedSizeKB} KB\nSize Reduction: ${ratio}%`
          });
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
        Compress JPEG/PNG images to a target file size — 100% locally in your browser.
      </p>

      <div style={{ marginBottom: '25px' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-color)', display: 'block', marginBottom: '10px' }}>
          Target File Size
        </label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="number"
            min="1"
            value={targetSize}
            onChange={(e) => setTargetSize(Math.max(1, Number(e.target.value)))}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              color: 'var(--text-color)',
              fontSize: '1rem',
              fontWeight: 600,
              outline: 'none'
            }}
            placeholder="e.g. 500"
          />
          {(['KB', 'MB'] as const).map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => setTargetUnit(unit)}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                border: targetUnit === unit ? 'none' : '1px solid var(--glass-border)',
                background: targetUnit === unit ? 'var(--primary-gradient)' : 'var(--glass-bg)',
                color: targetUnit === unit ? 'white' : 'var(--text-color)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {unit}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          The tool finds the best quality level that fits within your target. Actual result may vary slightly for already-compressed images.
        </p>
      </div>

      <ToolWorkspace
        toolId="compressimage"
        accept="image/*"
        maxFiles={1}
        onProcess={handleCompress}
        actionButtonText="Compress Image"
        instructions={[
          'Upload your JPG, PNG, or WebP image file.',
          'Enter a target file size (e.g. 500 KB or 2 MB) and select the unit.',
          'Click "Compress Image" — the tool finds the best quality that hits your target.'
        ]}
      />
    </div>
  );
}
