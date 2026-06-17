'use client';

import React, { useState, useRef } from 'react';
import { FileDown, Upload, FileText, CheckCircle, AlertCircle, RefreshCw, Download, Layers } from 'lucide-react';
import ReusableLoading from '../ui/ReusableLoading';
import { getPdfJs } from '../../lib/pdfjs';

export default function PDFToJPG() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scale, setScale] = useState(2.0); // 2.0 ≈ 150 DPI

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadJSZip = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).JSZip) { resolve((window as any).JSZip); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
      script.onload = () => resolve((window as any).JSZip);
      script.onerror = () => reject(new Error('Failed to load ZIP library.'));
      document.body.appendChild(script);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const uploaded = e.target.files[0];

    if (uploaded.type !== 'application/pdf' && !uploaded.name.endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }

    setFile(uploaded);
    setError(null);
    setSuccess(null);
    setDownloadUrl(null);

    try {
      const pdfjs = await getPdfJs();
      const arrayBuffer = await uploaded.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setNumPages(pdf.numPages);
    } catch (err: any) {
      setError('Failed to parse PDF document.');
      setFile(null);
    }
  };

  const runConvert = async () => {
    if (!file || !numPages) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setProgress({ current: 0, total: numPages });

    try {
      const pdfjs = await getPdfJs();
      const JSZip = await loadJSZip();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      const zip = new JSZip();

      for (let i = 1; i <= numPages; i++) {
        setProgress({ current: i, total: numPages });
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const base64Data = dataUrl.split(',')[1];
          zip.file(`page_${String(i).padStart(3, '0')}.jpg`, base64Data, { base64: true });
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      setDownloadUrl(url);
      setSuccess(`Successfully converted all ${numPages} page(s) to high-resolution JPG!`);
    } catch (err: any) {
      setError(err.message || 'Error occurred while converting pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setNumPages(null);
    setDownloadUrl(null);
    setError(null);
    setSuccess(null);
    setProgress({ current: 0, total: 0 });
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel" style={{ maxWidth: '850px', margin: '0 auto', padding: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, #007a75 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Layers size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>
              PDF to JPG Converter
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Convert and extract high-resolution JPG images from your PDF documents 100% locally.
            </p>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '24px 0' }} />

        {/* Alerts */}
        {error && (
          <div style={{
            marginBottom: '20px', padding: '14px 18px', borderRadius: '12px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            marginBottom: '20px', padding: '14px 18px', borderRadius: '12px',
            background: 'rgba(0,161,155,0.08)', border: '1px solid rgba(0,161,155,0.3)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <CheckCircle size={18} color="var(--primary-color)" />
            <span style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 600 }}>{success}</span>
          </div>
        )}

        {/* Upload box */}
        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--glass-border)',
              borderRadius: '16px', padding: '60px 24px', textAlign: 'center',
              cursor: 'pointer', transition: 'var(--transition-smooth)',
            }}
          >
            <Upload size={40} color="var(--primary-color)" style={{ marginBottom: '14px' }} />
            <p style={{ fontWeight: 700, fontSize: '1.05rem', margin: '0 0 6px', color: 'var(--text-color)' }}>
              Select a PDF file
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 16px' }}>
              Drag and drop your file here, or click to browse local files
            </p>
            <span style={{
              fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px',
              background: 'var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 600
            }}>
              Zero server tracking
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={handleUpload}
        />

        {/* File preview details */}
        {file && numPages && !isProcessing && !downloadUrl && (
          <div className="glass-panel" style={{ margin: 0, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <FileText size={32} color="var(--primary-color)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Size: {(file.size / 1024 / 1024).toFixed(2)} MB &nbsp;·&nbsp; Pages: {numPages}
                </p>
              </div>
              <button
                onClick={resetAll}
                style={{
                  background: 'none', border: '1px solid var(--glass-border)', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px'
                }}
              >
                Change File
              </button>
            </div>

            {/* Resolution Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Output Resolution</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[{label: 'Standard (72 DPI)', val: 1.0}, {label: 'High (150 DPI)', val: 2.0}, {label: 'Ultra (300 DPI)', val: 4.0}].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setScale(opt.val)}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                      background: scale === opt.val ? 'var(--primary-color)' : 'var(--glass-border)',
                      color: scale === opt.val ? '#fff' : 'var(--text-secondary)',
                      border: 'none'
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            </div>

            <button
              onClick={runConvert}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: 'var(--primary-color)', color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              Convert All {numPages} Page(s) to JPG
            </button>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="glass-panel" style={{ margin: 0, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
            <ReusableLoading type="spinner" />
            <p style={{ fontWeight: 600, color: 'var(--text-color)' }}>
              {progress.current > 0 ? `Rendering page ${progress.current} of ${progress.total}...` : 'Initializing PDF engine...'}
            </p>
            {progress.total > 0 && (
              <div style={{ width: '100%', maxWidth: '300px', height: '6px', borderRadius: '99px', background: 'var(--glass-border)', overflow: 'hidden' }}>
                <div style={{ width: `${(progress.current / progress.total) * 100}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '99px', transition: 'width 0.3s ease' }} />
              </div>
            )}
          </div>
        )}

        {/* Download Section */}
        {downloadUrl && (
          <div className="glass-panel" style={{ margin: 0, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(0,161,155,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)'
            }}>
              <CheckCircle size={30} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>JPG Extraction Complete</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                All pages have been extracted into an image zip archive.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href={downloadUrl}
                download={`${file ? file.name.replace(/\.[^/.]+$/, '') : 'document'}_jpg.zip`}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '10px 20px' }}
              >
                <FileDown size={16} /> Download ZIP Archive
              </a>
              <button
                onClick={resetAll}
                className="btn btn-secondary"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-color)', cursor: 'pointer', padding: '10px 20px' }}
              >
                Convert Another
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
