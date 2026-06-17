'use client';

import React, { useState, useRef } from 'react';
import { FileDown, Upload, FileText, CheckCircle, AlertCircle, Loader2, RefreshCw, Grid, Download, Eye, Layers } from 'lucide-react';
import { getPdfJs } from '../../lib/pdfjs';

interface ExtractedPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export default function PDFToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pageRangeMode, setPageRangeMode] = useState<'all' | 'custom'>('all');
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [extractedPages, setExtractedPages] = useState<ExtractedPage[]>([]);
  const [previewPage, setPreviewPage] = useState<ExtractedPage | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [scale, setScale] = useState(2.0); // 2.0 ≈ 150 DPI


  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfDocRef = useRef<any>(null);

  const loadJSZip = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).JSZip) {
        resolve((window as any).JSZip);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => resolve((window as any).JSZip);
      script.onerror = () => reject(new Error('Failed to load ZIP library.'));
      document.body.appendChild(script);
    });
  };

  const handleFile = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    setExtractedPages([]);
    setNumPages(null);
    setIsParsing(true);

    try {
      const pdfjsLib = await getPdfJs();
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);
      setStartPage(1);
      setEndPage(pdf.numPages);
    } catch (err: any) {
      setError(err.message || 'Failed to parse PDF document. It may be corrupted or password-protected.');
      setFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!pdfDocRef.current || !numPages) return;
    setError(null);
    setSuccess(null);
    setIsExtracting(true);

    const s = pageRangeMode === 'all' ? 1 : Math.max(1, startPage);
    const e = pageRangeMode === 'all' ? numPages : Math.min(numPages, endPage);

    if (s > e) {
      setError('Start page cannot be greater than end page.');
      setIsExtracting(false);
      return;
    }

    try {
      const pagesArray: ExtractedPage[] = [];
      
      for (let pageNum = s; pageNum <= e; pageNum++) {
        const page = await pdfDocRef.current.getPage(pageNum);
        // Using chosen resolution scale
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not create 2D canvas context');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        const dataUrl = canvas.toDataURL('image/png');
        pagesArray.push({
          pageNumber: pageNum,
          dataUrl,
          width: viewport.width,
          height: viewport.height
        });
      }
      
      setExtractedPages(pagesArray);
      setSuccess(`Successfully extracted ${pagesArray.length} page${pagesArray.length > 1 ? 's' : ''} to high-resolution PNG.`);
    } catch (err: any) {
      setError(err.message || 'Error occurred while rendering PDF pages.');
    } finally {
      setIsExtracting(false);
    }
  };

  const downloadSinglePage = (page: ExtractedPage) => {
    const link = document.createElement('a');
    link.href = page.dataUrl;
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'pdf_page';
    link.download = `${baseName}_page_${page.pageNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    if (extractedPages.length === 0) return;
    setZipLoading(true);
    setError(null);
    try {
      const JSZip = await loadJSZip();
      const zip = new JSZip();
      
      extractedPages.forEach((page) => {
        // Remove data URL prefix
        const base64Data = page.dataUrl.split(',')[1];
        const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'pdf_page';
        zip.file(`${baseName}_page_${page.pageNumber}.png`, base64Data, { base64: true });
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(content);
      const zipName = file ? file.name.replace(/\.[^/.]+$/, '') : 'extracted_pages';
      downloadLink.download = `${zipName}_images.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setSuccess('ZIP file downloaded successfully!');
    } catch (err: any) {
      setError('ZIP compression failed. Downloading pages individually instead.');
      // Fallback: download one by one
      extractedPages.forEach(p => downloadSinglePage(p));
    } finally {
      setZipLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setNumPages(null);
    setExtractedPages([]);
    setPreviewPage(null);
    setError(null);
    setSuccess(null);
    pdfDocRef.current = null;
  };

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
            <Layers size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>
              PDF to Image Converter
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Convert and extract high-resolution PNG image pages from your PDF documents — 100% locally.
            </p>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '24px 0' }} />

        {/* Error / Success Display */}
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

        {/* Upload Zone */}
        {!file && !isParsing && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--primary-color)' : 'var(--glass-border)'}`,
              borderRadius: '16px', padding: '54px 24px', textAlign: 'center',
              cursor: 'pointer', transition: 'var(--transition-smooth)',
              background: isDragging ? 'rgba(0,161,155,0.06)' : 'transparent',
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
              Max file size 50MB
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Parsing Loader */}
        {isParsing && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader2 size={36} color="var(--primary-color)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-color)', margin: 0 }}>Reading PDF structure...</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Analyzing pages client-side</p>
          </div>
        )}

        {/* PDF Settings Panel */}
        {file && numPages && extractedPages.length === 0 && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <FileText size={32} color="var(--primary-color)" />
              <div style={{ minWidth: 0, flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Size: {(file.size / 1024 / 1024).toFixed(2)} MB &nbsp;·&nbsp; Total Pages: {numPages}
                </p>
              </div>
              <button
                onClick={resetAll}
                style={{
                  background: 'none', border: '1px solid var(--glass-border)', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center',
                  gap: '6px', padding: '6px 12px', borderRadius: '8px', transition: 'var(--transition-smooth)'
                }}
              >
                <RefreshCw size={14} /> Change File
              </button>
            </div>

            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '18px 0' }} />

            {/* Page Range Selectors */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-color)', marginBottom: '10px' }}>
                Page Selection Mode
              </label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setPageRangeMode('all')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid',
                    borderColor: pageRangeMode === 'all' ? 'var(--primary-color)' : 'var(--glass-border)',
                    background: pageRangeMode === 'all' ? 'var(--primary-color)' : 'transparent',
                    color: pageRangeMode === 'all' ? '#fff' : 'var(--text-color)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition-smooth)'
                  }}
                >
                  Extract All ({numPages} Pages)
                </button>
                <button
                  type="button"
                  onClick={() => setPageRangeMode('custom')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid',
                    borderColor: pageRangeMode === 'custom' ? 'var(--primary-color)' : 'var(--glass-border)',
                    background: pageRangeMode === 'custom' ? 'var(--primary-color)' : 'transparent',
                    color: pageRangeMode === 'custom' ? '#fff' : 'var(--text-color)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition-smooth)'
                  }}
                >
                  Custom Page Range
                </button>
              </div>

              {pageRangeMode === 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--glass-bg)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>From Page</label>
                    <input
                      type="number"
                      min={1}
                      max={numPages}
                      value={startPage}
                      onChange={(e) => setStartPage(Math.max(1, Math.min(numPages, parseInt(e.target.value) || 1)))}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)',
                        background: 'transparent', color: 'var(--text-color)', fontWeight: 600, fontSize: '0.85rem'
                      }}
                    />
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '16px' }}>to</div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>To Page</label>
                    <input
                      type="number"
                      min={startPage}
                      max={numPages}
                      value={endPage}
                      onChange={(e) => setEndPage(Math.max(startPage, Math.min(numPages, parseInt(e.target.value) || numPages)))}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)',
                        background: 'transparent', color: 'var(--text-color)', fontWeight: 600, fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Resolution/DPI Selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Output Resolution
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Standard (72 DPI)', val: 1.0 },
                  { label: 'High (150 DPI)', val: 2.0 },
                  { label: 'Ultra (300 DPI)', val: 4.0 }
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setScale(opt.val)}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: '10px', border: '1px solid',
                      borderColor: scale === opt.val ? 'var(--primary-color)' : 'var(--glass-border)',
                      background: scale === opt.val ? 'var(--primary-color)' : 'transparent',
                      color: scale === opt.val ? '#fff' : 'var(--text-color)',
                      fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'var(--transition-smooth)'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExtract}
              disabled={isExtracting}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: 'var(--primary-color)', color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                cursor: isExtracting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px', transition: 'var(--transition-smooth)'
              }}
            >
              {isExtracting ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Rendering PDF Pages...</>
              ) : (
                <><Grid size={18} /> Convert Selected Pages to Images</>
              )}
            </button>
          </div>
        )}

        {/* Extracted Images Display */}
        {extractedPages.length > 0 && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: '0 0 2px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
                  Extracted Pages ({extractedPages.length})
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  PNG Format · Rendered with High-Quality Scale
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={downloadAllAsZip}
                  disabled={zipLoading}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    background: 'var(--primary-color)', color: '#fff', fontWeight: 700,
                    fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {zipLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FileDown size={14} />}
                  Download All as ZIP
                </button>
                <button
                  onClick={resetAll}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)',
                    background: 'transparent', color: 'var(--text-color)', fontWeight: 700,
                    fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <RefreshCw size={14} /> Clear / Convert New
                </button>
              </div>
            </div>

            {/* Grid layout for images */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: '16px', marginBottom: '24px'
            }}>
              {extractedPages.map((page) => (
                <div
                  key={page.pageNumber}
                  style={{
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                    borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column',
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  <div style={{
                    width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                  }}>
                    <img
                      src={page.dataUrl}
                      alt={`Page ${page.pageNumber}`}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(0,0,0,0.5)', opacity: 0, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px', transition: 'opacity 0.2s ease', cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
                    onClick={() => setPreviewPage(page)}
                    >
                      <button
                        title="Quick Preview"
                        style={{
                          width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                          background: 'rgba(255,255,255,0.9)', color: '#111', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                  <div style={{
                    marginTop: '10px', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-color)' }}>
                      Page {page.pageNumber}
                    </span>
                    <button
                      onClick={() => downloadSinglePage(page)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--primary-color)',
                        cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center'
                      }}
                      title="Download Page PNG"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Image Preview Modal */}
        {previewPage && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}
          onClick={() => setPreviewPage(null)}
          >
            <div style={{
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              borderRadius: '16px', padding: '16px', maxWidth: '90%', maxHeight: '90%',
              display: 'flex', flexDirection: 'column', position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-color)' }}>
                  Preview: Page {previewPage.pageNumber}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => downloadSinglePage(previewPage)}
                    style={{
                      background: 'var(--primary-color)', color: '#fff', border: 'none',
                      borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem',
                      fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <Download size={12} /> Download
                  </button>
                  <button
                    onClick={() => setPreviewPage(null)}
                    style={{
                      background: 'rgba(255,255,255,0.06)', color: 'var(--text-color)', border: '1px solid var(--glass-border)',
                      borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem',
                      fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
              <div style={{
                overflow: 'auto', display: 'flex', justifyContent: 'center',
                alignItems: 'center', maxHeight: '70vh'
              }}>
                <img
                  src={previewPage.dataUrl}
                  alt={`Page ${previewPage.pageNumber} High Res`}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '6px' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
