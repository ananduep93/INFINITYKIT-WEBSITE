'use client';

import React, { useState, useRef } from 'react';
import { Globe, Upload, RefreshCw, Download, Copy, Check } from 'lucide-react';
import ReusableLoading from '../ui/ReusableLoading';

export default function TranslatePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [targetLang, setTargetLang] = useState('Spanish');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
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
      script.onerror = () => reject(new Error('Failed to load PDF engine.'));
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
    setTranslatedText('');
    setDownloadUrl(null);

    try {
      const pdfjs = await loadPdfJs();
      const arrayBuffer = await uploaded.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setNumPages(pdfDoc.numPages);
    } catch (err: any) {
      setError('Failed to load PDF metadata.');
      setFile(null);
    }
  };

  const runTranslation = async () => {
    if (!file || !numPages) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setTranslatedText('');

    try {
      const pdfjs = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let documentText = '';
      
      // Limit translation scanning to first 5 pages to keep LLM context/quota bounds safe
      const pagesToScan = Math.min(numPages, 5);

      for (let i = 1; i <= pagesToScan; i++) {
        setProgressText(`Extracting text from page ${i}...`);
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        documentText += `[Page ${i}]\n${pageText}\n\n`;
      }

      if (!documentText.trim()) {
        throw new Error('No readable text layers detected in this document.');
      }

      setProgressText(`Sending text to AI translation node for ${targetLang}...`);

      const localOpenaiKey = localStorage.getItem('infinitykit_openai_key') || '';
      const localGeminiKey = localStorage.getItem('infinitykit_gemini_key') || '';

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Translate the following text accurately into ${targetLang}. Keep the layout markers like [Page X] intact. Do not translate the markers, only translate the text below them.`,
          taskType: 'translate',
          context: documentText,
          openaiKey: localOpenaiKey,
          geminiKey: localGeminiKey
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Server error during translation.');
      }

      const resData = await response.json();
      const translated = resData.text;

      setTranslatedText(translated);

      // Now compile translated text into a fresh PDF file using jsPDF
      setProgressText('Compiling translated PDF document...');
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Basic margins and multi-line wrapping
      const pageLines = doc.splitTextToSize(translated, 170);
      let y = 20;
      pageLines.forEach((line: string) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 15, y);
        y += 7;
      });

      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setDownloadUrl(url);

      setSuccess(`PDF successfully translated into ${targetLang}!`);
    } catch (err: any) {
      setError(err.message || 'Error occurred while translating PDF contents.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAll = () => {
    setFile(null);
    setNumPages(null);
    setTranslatedText('');
    setDownloadUrl(null);
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
            <Globe size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>
              Translate PDF Documents
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Translate PDF text content into 20+ languages and recompile to PDF client-side.
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
              Select a PDF file to translate
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 16px' }}>
              Drag and drop your file here, or click to browse local files
            </p>
            <span style={{
              fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px',
              background: 'var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 600
            }}>
              Uses secure AI translation APIs
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

        {/* Configure panels */}
        {file && numPages && !isProcessing && !translatedText && (
          <div className="glass-panel" style={{ margin: 0, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Globe size={32} color="var(--primary-color)" />
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
                Change
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-color)' }}>Select Target Translation Language</label>
              <select
                className="form-select"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
              >
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="German">German (Deutsch)</option>
                <option value="Italian">Italian (Italiano)</option>
                <option value="Portuguese">Portuguese (Português)</option>
                <option value="Malayalam">Malayalam (മലയാളം)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Japanese">Japanese (日本語)</option>
                <option value="Chinese">Chinese (中文)</option>
                <option value="Arabic">Arabic (العربية)</option>
                <option value="Russian">Russian (Русский)</option>
              </select>
            </div>

            <button
              onClick={runTranslation}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: 'var(--primary-color)', color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              Translate Document to {targetLang}
            </button>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="glass-panel" style={{ margin: 0, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
            <ReusableLoading type="spinner" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{progressText}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px' }}>
                Translating text segments locally. Please keep this tab active.
              </p>
            </div>
          </div>
        )}

        {/* Translated output */}
        {translatedText && (
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-color)' }}>
                Translated Content Preview ({targetLang})
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
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={`translated_${targetLang.toLowerCase()}_${file ? file.name : 'doc.pdf'}`}
                    className="btn"
                    style={{
                      padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem',
                      fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <Download size={12} /> Download Translated PDF
                  </a>
                )}
                <button
                  onClick={resetAll}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--glass-border)',
                    background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.78rem',
                    fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Translate Another
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={translatedText}
              rows={12}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px',
                background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)',
                color: 'var(--text-color)', fontFamily: 'sans-serif', fontSize: '0.9rem',
                outline: 'none', resize: 'vertical', lineHeight: 1.6
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
}
