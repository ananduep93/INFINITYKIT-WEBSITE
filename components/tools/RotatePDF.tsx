'use client';

import React, { useState, useRef, useCallback } from 'react';
import { RotateCw, Upload, Download, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';

type RotationAngle = 90 | 180 | 270;
type RotationMode = 'all' | 'specific';

export default function RotatePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [angle, setAngle] = useState<RotationAngle>(90);
  const [mode, setMode] = useState<RotationMode>('all');
  const [pageRange, setPageRange] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetResult = () => {
    setDownloadUrl(null);
    setError(null);
    setSuccess(null);
  };

  const loadPDF = useCallback(async (f: File) => {
    resetResult();
    setFile(f);
    try {
      const bytes = await f.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      setPageCount(pdf.getPageCount());
    } catch {
      setError('Could not read PDF. Please ensure the file is a valid PDF.');
      setFile(null);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadPDF(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === 'application/pdf') loadPDF(f);
    else setError('Please drop a valid PDF file.');
  }, [loadPDF]);

  const parsePageRange = (input: string, total: number): number[] => {
    const indices: number[] = [];
    const parts = input.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [s, e] = trimmed.split('-').map(x => parseInt(x.trim(), 10));
        if (isNaN(s) || isNaN(e) || s < 1 || e > total || s > e)
          throw new Error(`Invalid range "${trimmed}". PDF has ${total} pages.`);
        for (let i = s - 1; i < e; i++) indices.push(i);
      } else {
        const n = parseInt(trimmed, 10);
        if (isNaN(n) || n < 1 || n > total)
          throw new Error(`Invalid page "${trimmed}". PDF has ${total} pages.`);
        indices.push(n - 1);
      }
    }
    return Array.from(new Set(indices));
  };

  const handleRotate = async () => {
    if (!file) return;
    resetResult();
    setIsProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = pdf.getPages();

      let targetIndices: number[];
      if (mode === 'all') {
        targetIndices = pages.map((_, i) => i);
      } else {
        if (!pageRange.trim()) throw new Error('Please enter page numbers or ranges.');
        targetIndices = parsePageRange(pageRange, pageCount);
      }

      for (const idx of targetIndices) {
        const page = pages[idx];
        const currentRot = page.getRotation().angle;
        page.setRotation(degrees((currentRot + angle) % 360));
      }

      const resultBytes = await pdf.save();
      const blob = new Blob([resultBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const name = `rotated_${file.name}`;
      setDownloadUrl(url);
      setDownloadName(name);
      setSuccess(`Successfully rotated ${targetIndices.length} page${targetIndices.length > 1 ? 's' : ''} by ${angle}°.`);
    } catch (err: any) {
      setError(err.message || 'Failed to rotate PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPageCount(0);
    resetResult();
    setPageRange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const angleOptions: RotationAngle[] = [90, 180, 270];

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel" style={{ maxWidth: '820px', margin: '0 auto', padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, #007a75 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <RotateCw size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              Rotate PDF Pages
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Rotate all pages or specific pages of your PDF by 90°, 180°, or 270° — 100% client-side.
            </p>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '24px 0' }} />

        {/* Drop Zone */}
        {!file ? (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--primary-color)' : 'var(--glass-border)'}`,
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              background: isDragging ? 'rgba(0,161,155,0.06)' : 'transparent',
            }}
          >
            <Upload size={36} color="var(--primary-color)" style={{ marginBottom: '12px' }} />
            <p style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 4px' }}>
              Drop your PDF here
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              or click to browse files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '16px 20px', borderRadius: '12px',
            background: 'rgba(0,161,155,0.08)', border: '1px solid rgba(0,161,155,0.25)',
          }}>
            <FileText size={28} color="var(--primary-color)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{file.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                {(file.size / 1024).toFixed(1)} KB &nbsp;·&nbsp; {pageCount} page{pageCount !== 1 ? 's' : ''}
              </div>
            </div>
            <button onClick={removeFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* Controls */}
        {file && (
          <div style={{ marginTop: '28px' }}>
            {/* Rotation Angle */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: '10px' }}>
                Rotation Angle
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {angleOptions.map(a => (
                  <button
                    key={a}
                    onClick={() => setAngle(a)}
                    style={{
                      padding: '10px 24px', borderRadius: '10px', border: '2px solid',
                      borderColor: angle === a ? 'var(--primary-color)' : 'var(--glass-border)',
                      background: angle === a ? 'var(--primary-color)' : 'transparent',
                      color: angle === a ? '#fff' : 'var(--text-color)',
                      fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                      transition: 'var(--transition-smooth)',
                    }}
                  >
                    {a}°
                  </button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: '10px' }}>
                Pages to Rotate
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {(['all', 'specific'] as RotationMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      padding: '10px 24px', borderRadius: '10px', border: '2px solid',
                      borderColor: mode === m ? 'var(--primary-color)' : 'var(--glass-border)',
                      background: mode === m ? 'var(--primary-color)' : 'transparent',
                      color: mode === m ? '#fff' : 'var(--text-color)',
                      fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                      transition: 'var(--transition-smooth)',
                    }}
                  >
                    {m === 'all' ? `All Pages (${pageCount})` : 'Specific Pages'}
                  </button>
                ))}
              </div>

              {mode === 'specific' && (
                <input
                  type="text"
                  className="form-input"
                  value={pageRange}
                  onChange={e => setPageRange(e.target.value)}
                  placeholder={`e.g. 1, 3-5, 7  (PDF has ${pageCount} pages)`}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '10px',
                    border: '1.5px solid var(--glass-border)', background: 'var(--glass-bg)',
                    color: 'var(--text-color)', fontSize: '0.9rem', boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              )}
            </div>

            {/* Process Button */}
            <button
              onClick={handleRotate}
              disabled={isProcessing}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: isProcessing ? 'var(--glass-border)' : 'var(--primary-color)',
                color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'var(--transition-smooth)',
              }}
            >
              {isProcessing ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Rotating Pages...</>
              ) : (
                <><RotateCw size={18} /> Rotate PDF</>
              )}
            </button>
          </div>
        )}

        {/* Status Messages */}
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
              download={downloadName}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '10px',
                background: 'var(--primary-color)', color: '#fff',
                fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
                transition: 'var(--transition-smooth)',
              }}
            >
              <Download size={16} /> Download Rotated PDF
            </a>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
