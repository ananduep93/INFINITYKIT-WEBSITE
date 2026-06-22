'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Info, Upload, Copy, CheckCircle, X } from 'lucide-react';

interface ImageMetadata {
  name: string;
  sizeByte: number;
  mimeType: string;
  width: number;
  height: number;
  aspectRatio: string;
  preview: string;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageInfo() {
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp'];

  const loadImage = useCallback((file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      setError('Unsupported image format. Please upload JPEG, PNG, WebP, GIF, SVG, or BMP.');
      return;
    }
    setError(null);

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const preview = URL.createObjectURL(file);
    previewUrlRef.current = preview;

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const divisor = gcd(w, h);
      const ar = `${w / divisor}:${h / divisor}`;

      setMetadata({
        name: file.name,
        sizeByte: file.size,
        mimeType: file.type,
        width: w,
        height: h,
        aspectRatio: ar,
        preview,
      });
    };
    img.onerror = () => setError('Failed to load image. The file may be corrupted.');
    img.src = preview;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadImage(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) loadImage(f);
  };

  const clearImage = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setMetadata(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyInfo = async () => {
    if (!metadata) return;
    const text = [
      `File Name: ${metadata.name}`,
      `File Size: ${formatSize(metadata.sizeByte)}`,
      `MIME Type: ${metadata.mimeType}`,
      `Dimensions: ${metadata.width} × ${metadata.height} px`,
      `Aspect Ratio: ${metadata.aspectRatio}`,
    ].join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const infoRows: { label: string; value: string }[] = metadata
    ? [
        { label: 'File Name', value: metadata.name },
        { label: 'File Size', value: formatSize(metadata.sizeByte) },
        { label: 'MIME Type', value: metadata.mimeType },
        { label: 'Dimensions', value: `${metadata.width} × ${metadata.height} px` },
        { label: 'Aspect Ratio', value: metadata.aspectRatio },
      ]
    : [];

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel" style={{ maxWidth: '820px', margin: '0 auto', padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, #007a75 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Info size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              Image Info Inspector
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Instantly inspect image metadata: dimensions, file size, format, and aspect ratio.
            </p>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '24px 0' }} />

        {/* Drop Zone */}
        {!metadata ? (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--primary-color)' : 'var(--glass-border)'}`,
              borderRadius: '16px', padding: '60px 24px', textAlign: 'center',
              cursor: 'pointer', transition: 'var(--transition-smooth)',
              background: isDragging ? 'rgba(0,161,155,0.06)' : 'transparent',
            }}
          >
            <Upload size={40} color="var(--primary-color)" style={{ marginBottom: '14px' }} />
            <p style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 4px' }}>Drop your image here</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              JPEG · PNG · WebP · GIF · SVG · BMP
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Preview */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={metadata.preview}
                alt={metadata.name}
                style={{
                  width: '180px', height: '180px', objectFit: 'contain',
                  borderRadius: '14px', border: '1.5px solid var(--glass-border)',
                  background: 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 16px 16px',
                }}
              />
              <button
                onClick={clearImage}
                style={{
                  position: 'absolute', top: '-8px', right: '-8px', width: '26px', height: '26px',
                  borderRadius: '50%', border: 'none', background: '#ef4444',
                  color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Info Table */}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>Image Details</span>
                <button
                  onClick={copyInfo}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '8px', border: '1.5px solid var(--glass-border)',
                    background: copied ? 'rgba(0,161,155,0.1)' : 'transparent',
                    color: copied ? 'var(--primary-color)' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Info'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                {infoRows.map((row, i) => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px',
                      background: i % 2 === 0 ? 'var(--glass-bg)' : 'transparent',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, minWidth: '100px', flexShrink: 0 }}>
                      {row.label}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dimension Visual */}
              <div style={{
                marginTop: '16px', padding: '14px 16px', borderRadius: '10px',
                background: 'rgba(0,161,155,0.07)', border: '1px solid rgba(0,161,155,0.2)',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '6px',
                  background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.7rem' }}>
                    {metadata.aspectRatio}
                  </span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{metadata.width} × {metadata.height} pixels</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    {(metadata.width * metadata.height).toLocaleString()} total pixels
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Another */}
        {metadata && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '10px 22px', borderRadius: '10px', border: '1.5px solid var(--glass-border)',
                background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600,
                fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition-smooth)',
              }}
            >
              Inspect Another Image
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '20px', padding: '14px 18px', borderRadius: '12px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <X size={18} color="#ef4444" />
            <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
