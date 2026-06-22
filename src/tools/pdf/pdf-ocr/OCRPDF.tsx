'use client';

import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { FileText, Upload, Download, Copy, Check } from 'lucide-react';
import ReusableLoading from '../../../components/ui/ReusableLoading';
import { getPdfJs } from '../../../lib/pdfjs';

const OCR_LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'fra', label: 'French' },
  { code: 'deu', label: 'German' },
  { code: 'spa', label: 'Spanish' },
  { code: 'ita', label: 'Italian' },
  { code: 'por', label: 'Portuguese' },
  { code: 'nld', label: 'Dutch' },
  { code: 'chi_sim', label: 'Chinese Simplified' },
  { code: 'jpn', label: 'Japanese' },
  { code: 'ara', label: 'Arabic' },
  { code: 'hin', label: 'Hindi' },
];

export default function OCRPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [ocrText, setOcrText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [ocrLanguage, setOcrLanguage] = useState('eng');
  // 0 = no limit (all pages)
  const [maxPages, setMaxPages] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setOcrText('');

    try {
      const pdfjs = await getPdfJs();
      const arrayBuffer = await uploaded.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setNumPages(pdfDoc.numPages);
    } catch (err: any) {
      setError('Failed to load PDF document metadata.');
      setFile(null);
    }
  };

  const runOCR = async () => {
    if (!file || !numPages) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setOcrText('');

    try {
      const pdfjs = await getPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      const pagesToProcess = maxPages > 0 ? Math.min(numPages, maxPages) : numPages;

      for (let i = 1; i <= pagesToProcess; i++) {
        setCurrentPage(i);

        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
        }

        // Run Tesseract OCR on page canvas with selected language
        const ocrResult = await Tesseract.recognize(canvas, ocrLanguage, {});
        fullText += `--- Page ${i} ---\n${ocrResult.data.text}\n\n`;
      }

      setOcrText(fullText);
      setSuccess(`OCR successfully completed for ${pagesToProcess} page(s)!`);

    } catch (err: any) {
      setError(err.message || 'Error occurred while processing OCR.');
    } finally {
      setIsProcessing(false);
      setCurrentPage(0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ocrText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTextFile = () => {
    const blob = new Blob([ocrText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr_${file ? file.name.replace(/\.pdf$/i, '') : 'document'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setFile(null);
    setNumPages(null);
    setOcrText('');
    setError(null);
    setSuccess(null);
    setCurrentPage(0);
  };

  const pagesToProcess = numPages
    ? (maxPages > 0 ? Math.min(numPages, maxPages) : numPages)
    : 0;
  const progressPercent = pagesToProcess > 0 ? Math.round((currentPage / pagesToProcess) * 100) : 0;

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
            <FileText size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>
              Extract PDF Text
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Convert scanned or layout PDFs into searchable plain text completely client-side in your browser.
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
            <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            marginBottom: '20px', padding: '14px 18px', borderRadius: '12px',
            background: 'rgba(0,161,155,0.08)', border: '1px solid rgba(0,161,155,0.3)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
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
              Select PDF document for text extraction
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

        {/* File details, options, and process trigger */}
        {file && numPages && !isProcessing && !ocrText && (
          <div className="glass-panel" style={{ margin: 0, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <FileText size={32} color="var(--primary-color)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Pages: {numPages} &nbsp;·&nbsp; Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={resetAll}
                style={{
                  background: 'none', border: '1px solid var(--glass-border)', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px'
                }}
              >
                Change
              </button>
            </div>

            {/* Options row: language + page limit */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {/* Language selector */}
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  OCR Language
                </label>
                <select
                  value={ocrLanguage}
                  onChange={e => setOcrLanguage(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '9px',
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-color)', fontSize: '0.88rem', fontWeight: 600,
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  {OCR_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label} ({lang.code})</option>
                  ))}
                </select>
              </div>

              {/* Max pages selector */}
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pages to Process
                </label>
                <select
                  value={maxPages}
                  onChange={e => setMaxPages(Number(e.target.value))}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '9px',
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-color)', fontSize: '0.88rem', fontWeight: 600,
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value={0}>All pages ({numPages})</option>
                  <option value={10}>First 10 pages</option>
                  <option value={25}>First 25 pages</option>
                  <option value={50}>First 50 pages</option>
                </select>
              </div>
            </div>

            {/* Info note */}
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 16px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}>
              ℹ️ Processing all {numPages} pages may take several minutes for large documents. OCR runs entirely in your browser — no data leaves your device.
            </p>

            <button
              onClick={runOCR}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: 'var(--primary-color)', color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              Run AI OCR Text Recognition
            </button>
          </div>
        )}

        {/* Processing Indicator with progress bar */}
        {isProcessing && (
          <div className="glass-panel" style={{ margin: 0, padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
            <ReusableLoading type="spinner" />
            <div style={{ width: '100%', maxWidth: '420px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-color)', margin: '0 0 6px' }}>
                Processing page {currentPage} of {pagesToProcess}…
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 14px' }}>
                Extracting text layouts. Please keep this tab active.
              </p>
              {/* Progress bar */}
              <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: 'var(--glass-border)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '999px',
                  background: 'linear-gradient(90deg, var(--primary-color), #007a75)',
                  width: `${progressPercent}%`,
                  transition: 'width 0.35s ease',
                }} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '8px 0 0', fontWeight: 600 }}>
                {progressPercent}% complete
              </p>
            </div>
          </div>
        )}

        {/* Result Text Field */}
        {ocrText && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-color)' }}>
                Extracted Text Contents
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)', fontSize: '0.78rem',
                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  {copied ? <Check size={12} color="var(--primary-color)" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
                <button
                  onClick={downloadTextFile}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: 'none',
                    background: 'var(--primary-color)', color: '#fff', fontSize: '0.78rem',
                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Download size={12} /> Download TXT
                </button>
                <button
                  onClick={resetAll}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--glass-border)',
                    background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.78rem',
                    fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={ocrText}
              rows={12}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px',
                background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)',
                color: 'var(--text-color)', fontFamily: 'monospace', fontSize: '0.85rem',
                outline: 'none', resize: 'vertical', lineHeight: 1.5
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
}
