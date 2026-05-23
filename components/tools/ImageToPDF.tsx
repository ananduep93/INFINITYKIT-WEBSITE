'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ImageIcon, Upload, Download, Trash2, ChevronUp, ChevronDown, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { jsPDF } from 'jspdf';

type PageSize = 'a4' | 'letter' | 'fit';

interface ImageEntry {
  id: string;
  file: File;
  preview: string;
  name: string;
}

export default function ImageToPDF() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

  const resetResult = () => {
    setDownloadUrl(null);
    setError(null);
    setSuccess(null);
  };

  const addImages = useCallback((files: File[]) => {
    resetResult();
    const valid = files.filter(f => ACCEPTED.includes(f.type));
    if (valid.length === 0) {
      setError('Only JPEG, PNG, and WebP images are accepted.');
      return;
    }
    const entries: ImageEntry[] = valid.map(f => ({
      id: `${Date.now()}_${Math.random()}`,
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
    }));
    setImages(prev => [...prev, ...entries]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addImages(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addImages(Array.from(e.dataTransfer.files));
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const entry = prev.find(x => x.id === id);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter(x => x.id !== id);
    });
    resetResult();
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    setImages(prev => {
      const idx = prev.findIndex(x => x.id === id);
      if (idx === -1) return prev;
      const newArr = [...prev];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= newArr.length) return prev;
      [newArr[idx], newArr[swapIdx]] = [newArr[swapIdx], newArr[idx]];
      return newArr;
    });
    resetResult();
  };

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const handleConvert = async () => {
    if (images.length === 0) {
      setError('Please add at least one image.');
      return;
    }
    resetResult();
    setIsProcessing(true);
    try {
      // A4: 210x297mm, Letter: 215.9x279.4mm
      const pageSizes: Record<string, [number, number]> = {
        a4: [210, 297],
        letter: [215.9, 279.4],
      };

      let pdf: jsPDF | null = null;

      for (let i = 0; i < images.length; i++) {
        const entry = images[i];
        const img = await loadImage(entry.preview);
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;

        let pdfW: number, pdfH: number;
        if (pageSize === 'fit') {
          // Convert px to mm (96dpi -> 25.4mm/inch)
          pdfW = (imgW / 96) * 25.4;
          pdfH = (imgH / 96) * 25.4;
        } else {
          [pdfW, pdfH] = pageSizes[pageSize];
        }

        if (i === 0) {
          pdf = new jsPDF({ orientation: pdfW > pdfH ? 'l' : 'p', unit: 'mm', format: [pdfW, pdfH] });
        } else {
          pdf!.addPage([pdfW, pdfH], pdfW > pdfH ? 'l' : 'p');
        }

        // Fit image within page margins
        const margin = pageSize === 'fit' ? 0 : 10;
        const availW = pdfW - margin * 2;
        const availH = pdfH - margin * 2;
        const ratio = Math.min(availW / imgW, availH / imgH);
        const drawW = imgW * ratio;
        const drawH = imgH * ratio;
        const x = margin + (availW - drawW) / 2;
        const y = margin + (availH - drawH) / 2;

        const format = entry.file.type === 'image/png' ? 'PNG' : 'JPEG';
        pdf!.addImage(entry.preview, format, x, y, drawW, drawH);
      }

      const blob = pdf!.output('blob');
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setSuccess(`PDF created with ${images.length} page${images.length > 1 ? 's' : ''}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to create PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pageSizeOptions: { value: PageSize; label: string }[] = [
    { value: 'a4', label: 'A4 (210×297mm)' },
    { value: 'letter', label: 'Letter (216×279mm)' },
    { value: 'fit', label: 'Fit to Image' },
  ];

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel" style={{ maxWidth: '860px', margin: '0 auto', padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, #007a75 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ImageIcon size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              Image to PDF
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Convert JPEG, PNG, and WebP images into a single PDF document — locally in your browser.
            </p>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '24px 0' }} />

        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--primary-color)' : 'var(--glass-border)'}`,
            borderRadius: '16px', padding: '36px 24px', textAlign: 'center',
            cursor: 'pointer', transition: 'var(--transition-smooth)',
            background: isDragging ? 'rgba(0,161,155,0.06)' : 'transparent',
            marginBottom: '24px',
          }}
        >
          <Upload size={32} color="var(--primary-color)" style={{ marginBottom: '10px' }} />
          <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 4px' }}>
            Drop images here or click to browse
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
            JPEG · PNG · WebP — Multiple files accepted
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* Page Size Selector */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: '10px' }}>
            Page Size
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {pageSizeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPageSize(opt.value)}
                style={{
                  padding: '10px 20px', borderRadius: '10px', border: '2px solid',
                  borderColor: pageSize === opt.value ? 'var(--primary-color)' : 'var(--glass-border)',
                  background: pageSize === opt.value ? 'var(--primary-color)' : 'transparent',
                  color: pageSize === opt.value ? '#fff' : 'var(--text-color)',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Image Queue */}
        {images.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                Images ({images.length})
              </label>
              <button
                onClick={() => { images.forEach(e => URL.revokeObjectURL(e.preview)); setImages([]); resetResult(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <X size={14} /> Clear All
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {images.map((entry, idx) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 16px', borderRadius: '12px',
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  }}
                >
                  <img
                    src={entry.preview}
                    alt={entry.name}
                    style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.name}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      Page {idx + 1} &nbsp;·&nbsp; {(entry.file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => moveImage(entry.id, 'up')}
                      disabled={idx === 0}
                      style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1, padding: '4px', color: 'var(--text-secondary)' }}
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      onClick={() => moveImage(entry.id, 'down')}
                      disabled={idx === images.length - 1}
                      style={{ background: 'none', border: 'none', cursor: idx === images.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === images.length - 1 ? 0.3 : 1, padding: '4px', color: 'var(--text-secondary)' }}
                    >
                      <ChevronDown size={18} />
                    </button>
                    <button
                      onClick={() => removeImage(entry.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={isProcessing || images.length === 0}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            background: (isProcessing || images.length === 0) ? 'var(--glass-border)' : 'var(--primary-color)',
            color: '#fff', fontWeight: 800, fontSize: '1rem',
            cursor: (isProcessing || images.length === 0) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'var(--transition-smooth)',
          }}
        >
          {isProcessing ? (
            <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating PDF...</>
          ) : (
            <><FileText size={18} /> Convert to PDF</>
          )}
        </button>

        {/* Status */}
        {error && (
          <div style={{
            marginTop: '20px', padding: '14px 18px', borderRadius: '12px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {success && downloadUrl && (
          <div style={{
            marginTop: '20px', padding: '18px', borderRadius: '14px',
            background: 'rgba(0,161,155,0.08)', border: '1px solid rgba(0,161,155,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <CheckCircle size={20} color="var(--primary-color)" />
              <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{success}</span>
            </div>
            <a
              href={downloadUrl}
              download={`images_${Date.now()}.pdf`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '10px',
                background: 'var(--primary-color)', color: '#fff',
                fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
              }}
            >
              <Download size={16} /> Download PDF
            </a>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
