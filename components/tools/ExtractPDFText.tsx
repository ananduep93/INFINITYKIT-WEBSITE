'use client';

import React, { useState, useRef } from 'react';
import { FileText, Upload, RefreshCw, Download, Copy, Check } from 'lucide-react';
import ReusableLoading from '../ui/ReusableLoading';

export default function ExtractPDFText() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load PDF.js script dynamically
  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF engine. Check internet connection.'));
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
    setExtractedText('');

    try {
      const pdfjs = await loadPdfJs();
      const arrayBuffer = await uploaded.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setNumPages(pdfDoc.numPages);
    } catch (err: any) {
      setError('Failed to load PDF document metadata.');
      setFile(null);
    }
  };

  const runExtraction = async () => {
    if (!file || !numPages) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const pdfjs = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let text = '';
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const items = content.items as any[];

        // Group into lines based on Y coordinate with tolerance
        const mappedItems = items.map((item: any) => ({
          str: item.str,
          x: item.transform[4],
          y: item.transform[5],
          width: item.width,
          height: item.height
        }));

        const lines: { y: number; height: number; items: typeof mappedItems }[] = [];
        for (const item of mappedItems) {
          let foundLine = lines.find(line => Math.abs(line.y - item.y) < Math.max(item.height * 0.7, 4));
          if (foundLine) {
            foundLine.items.push(item);
          } else {
            lines.push({
              y: item.y,
              height: item.height,
              items: [item]
            });
          }
        }

        // Sort lines from top to bottom (Y descending)
        lines.sort((a, b) => b.y - a.y);

        // Sort items within each line by X ascending (left to right)
        for (const line of lines) {
          line.items.sort((a, b) => a.x - b.x);
        }

        let pageText = '';
        let lastY = -1;
        let lastLineHeight = 12;

        for (const line of lines) {
          let lineText = '';
          let lastX = -1;
          for (const item of line.items) {
            if (lastX !== -1) {
              const gap = item.x - lastX;
              const spaceCharWidth = Math.max(item.height * 0.25, 3);
              if (gap > spaceCharWidth) {
                const numSpaces = Math.min(Math.round(gap / spaceCharWidth), 20);
                lineText += ' '.repeat(numSpaces);
              }
            }
            lineText += item.str;
            lastX = item.x + item.width;
          }

          if (lastY !== -1) {
            const verticalGap = lastY - line.y;
            if (verticalGap > lastLineHeight * 1.8) {
              pageText += '\n\n';
            } else {
              pageText += '\n';
            }
          }
          
          pageText += lineText;
          lastY = line.y;
          lastLineHeight = line.height;
        }

        text += `[PAGE ${i}]\n${pageText}\n\n`;
      }

      if (!text.trim()) {
        throw new Error('No readable text layers found in this document. Scanned documents require the OCR tool.');
      }

      setExtractedText(text);
      setSuccess(`Successfully extracted text layers from all ${numPages} page(s)!`);
    } catch (err: any) {
      setError(err.message || 'Error occurred while parsing PDF text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTextFile = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file ? file.name.replace(/\.pdf$/i, '') : 'extracted_text'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setFile(null);
    setNumPages(null);
    setExtractedText('');
    setError(null);
    setSuccess(null);
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
            <FileText size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>
              Extract Text from PDF
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Parse and scrape alphanumeric text layers from PDF documents client-side instantly.
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
              Select a PDF document
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

        {/* Action triggers */}
        {file && numPages && !isProcessing && !extractedText && (
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

            <button
              onClick={runExtraction}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: 'var(--primary-color)', color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              Run Text Extraction
            </button>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="glass-panel" style={{ margin: 0, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
            <ReusableLoading type="spinner" />
            <p style={{ fontWeight: 600, color: 'var(--text-color)', margin: 0 }}>Parsing character layers...</p>
          </div>
        )}

        {/* Result Text Area */}
        {extractedText && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-color)' }}>
                Extracted Text Output
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
              value={extractedText}
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
