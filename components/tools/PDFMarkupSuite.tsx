'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, Upload, RefreshCw, Download, 
  Settings, Type, Hash, Stamp, Layout 
} from 'lucide-react';
import ReusableLoading from '../ui/ReusableLoading';

interface PDFMarkupSuiteProps {
  initialTool?: 'watermark' | 'headerfooter' | 'pagenumbers' | 'addtext';
}

export default function PDFMarkupSuite({ initialTool = 'watermark' }: PDFMarkupSuiteProps) {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [activeTool, setActiveTool] = useState<'watermark' | 'headerfooter' | 'pagenumbers' | 'addtext'>(initialTool);
  const [previewPageUrl, setPreviewPageUrl] = useState<string | null>(null);

  // 1. Watermark Settings
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkSize, setWatermarkSize] = useState(50);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [watermarkColor, setWatermarkColor] = useState('#777777');
  const [watermarkRotation, setWatermarkRotation] = useState(45);

  // 2. Header / Footer Settings
  const [headerText, setHeaderText] = useState('InfinityKit Document');
  const [footerText, setFooterText] = useState('All Rights Reserved');
  const [marginSize, setMarginSize] = useState(30);
  const [hfFontSize, setHfFontSize] = useState(10);
  const [hfColor, setHfColor] = useState('#555555');

  // 3. Page Numbers Settings
  const [pnPosition, setPnPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'>('bottom-center');
  const [pnStartNum, setPnStartNum] = useState(1);
  const [pnFontSize, setPnFontSize] = useState(10);
  const [pnFormat, setPnFormat] = useState('Page {x} of {y}');

  // 4. Custom Text Overlay Settings
  const [customText, setCustomText] = useState('Approved by InfinityKit');
  const [customX, setCustomX] = useState(50); // percentage
  const [customY, setCustomY] = useState(50); // percentage
  const [customSize, setCustomSize] = useState(16);
  const [customColor, setCustomColor] = useState('#000000');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfBytesRef = useRef<Uint8Array | null>(null);

  // Dynamic PDFJS loader
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
      script.onerror = () => reject(new Error('Failed to load PDF viewer engine.'));
      document.body.appendChild(script);
    });
  };

  const generatePreview = async (bytes: Uint8Array) => {
    try {
      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({ data: bytes });
      const pdfDoc = await loadingTask.promise;
      const page = await pdfDoc.getPage(1);
      
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      
      if (context) {
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        setPreviewPageUrl(canvas.toDataURL('image/jpeg', 0.85));
      }
    } catch (err) {
      console.error('Error rendering preview:', err);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFile = e.target.files[0];
    
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    setIsParsing(true);

    try {
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      pdfBytesRef.current = bytes;

      const pdfjs = await loadPdfJs();
      const pdfDoc = await pdfjs.getDocument({ data: bytes }).promise;
      setNumPages(pdfDoc.numPages);

      await generatePreview(bytes);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading PDF metadata.');
      setFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  // Convert Hex string color to RGB {r, g, b} decimals
  const hexToRgbRatio = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return { r: isNaN(r) ? 0 : r, g: isNaN(g) ? 0 : g, b: isNaN(b) ? 0 : b };
  };

  const applyMarkup = async () => {
    if (!pdfBytesRef.current || !file) return;
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    setSaveProgress(20);

    try {
      const { PDFDocument, rgb, StandardFonts, degrees } = await import('pdf-lib');
      setSaveProgress(40);

      const pdfDoc = await PDFDocument.load(pdfBytesRef.current);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      setSaveProgress(60);

      // Perform markup processing page-by-page
      pages.forEach((page, index) => {
        const { width, height } = page.getSize();

        // 1. Apply Watermark Overlay
        if (activeTool === 'watermark') {
          const { r, g, b } = hexToRgbRatio(watermarkColor);
          page.drawText(watermarkText, {
            x: width / 2 - (watermarkText.length * watermarkSize * 0.28),
            y: height / 2 - (watermarkSize * 0.35),
            size: watermarkSize,
            font: font,
            color: rgb(r, g, b),
            opacity: watermarkOpacity,
            rotate: degrees(watermarkRotation)
          });
        }

        // 2. Apply Header & Footer Overlays
        if (activeTool === 'headerfooter') {
          const { r, g, b } = hexToRgbRatio(hfColor);
          if (headerText) {
            page.drawText(headerText, {
              x: width / 2 - (headerText.length * hfFontSize * 0.28),
              y: height - marginSize,
              size: hfFontSize,
              font: font,
              color: rgb(r, g, b)
            });
          }
          if (footerText) {
            page.drawText(footerText, {
              x: width / 2 - (footerText.length * hfFontSize * 0.28),
              y: marginSize,
              size: hfFontSize,
              font: font,
              color: rgb(r, g, b)
            });
          }
        }

        // 3. Apply Page Number Overlays
        if (activeTool === 'pagenumbers') {
          const { r, g, b } = hexToRgbRatio(hfColor); // reuse same color or grey
          const currPageNumber = pnStartNum + index;
          const displayStr = pnFormat
            .replace('{x}', currPageNumber.toString())
            .replace('{y}', totalPages.toString());

          let drawX = width / 2 - (displayStr.length * pnFontSize * 0.28);
          let drawY = marginSize;

          if (pnPosition.includes('left')) drawX = marginSize;
          if (pnPosition.includes('right')) drawX = width - marginSize - (displayStr.length * pnFontSize * 0.55);
          if (pnPosition.includes('top')) drawY = height - marginSize;

          page.drawText(displayStr, {
            x: drawX,
            y: drawY,
            size: pnFontSize,
            font: font,
            color: rgb(r, g, b)
          });
        }

        // 4. Apply Custom Custom Text Overlays
        if (activeTool === 'addtext') {
          const { r, g, b } = hexToRgbRatio(customColor);
          const drawX = (customX / 100) * width;
          const drawY = (customY / 100) * height;

          page.drawText(customText, {
            x: drawX,
            y: drawY,
            size: customSize,
            font: font,
            color: rgb(r, g, b)
          });
        }
      });

      setSaveProgress(85);
      const markedBytes = await pdfDoc.save();
      setSaveProgress(95);

      const blob = new Blob([markedBytes as any], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      setSaveProgress(100);
      setSuccess(`PDF markup successfully compiled client-side!`);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${activeTool}_markup_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Re-render preview with overlays
      await generatePreview(markedBytes);

    } catch (err: any) {
      setError(err.message || 'Error occurred while saving modifications.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setNumPages(null);
    setPreviewPageUrl(null);
    setError(null);
    setSuccess(null);
    pdfBytesRef.current = null;
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, #007a75 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Stamp size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>
              PDF Annotation & Stamp Suite
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Stamp text watermarks, custom margins, headers/footers, page numbers, or visual text blocks 100% locally.
            </p>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '24px 0' }} />

        {/* Status Alerts */}
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

        {/* Upload Zone */}
        {!file && !isParsing && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--glass-border)',
              borderRadius: '16px', padding: '60px 24px', textAlign: 'center',
              cursor: 'pointer', transition: 'var(--transition-smooth)',
            }}
          >
            <Upload size={44} color="var(--primary-color)" style={{ marginBottom: '14px' }} />
            <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0 0 6px', color: 'var(--text-color)' }}>
              Select a PDF document to format
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 16px' }}>
              Drag and drop your file here, or click to browse local files
            </p>
            <span style={{
              fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px',
              background: 'var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 600
            }}>
              Max size 50MB · Safe & private
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

        {/* Parsing Loader */}
        {isParsing && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <ReusableLoading type="spinner" />
            <p style={{ fontWeight: 600, color: 'var(--text-color)', margin: '14px 0 0' }}>Reading PDF structure...</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Pre-rendering page layout preview</p>
          </div>
        )}

        {/* Main Workspaces Layout */}
        {file && numPages && !isParsing && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'flex-start' }}>
            
            {/* Options Left sidebar */}
            <div className="glass-panel" style={{ margin: 0, padding: '24px' }}>
              {/* Tool tabs */}
              <div style={{ display: 'flex', background: 'var(--glass-border)', padding: '4px', borderRadius: '8px', gap: '4px', marginBottom: '24px' }}>
                <button
                  onClick={() => setActiveTool('watermark')}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: '6px', border: 'none',
                    background: activeTool === 'watermark' ? 'var(--primary-color)' : 'transparent',
                    color: activeTool === 'watermark' ? '#fff' : 'var(--text-color)',
                    fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Stamp size={14} /> Watermark
                </button>
                <button
                  onClick={() => setActiveTool('headerfooter')}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: '6px', border: 'none',
                    background: activeTool === 'headerfooter' ? 'var(--primary-color)' : 'transparent',
                    color: activeTool === 'headerfooter' ? '#fff' : 'var(--text-color)',
                    fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Layout size={14} /> Headers
                </button>
                <button
                  onClick={() => setActiveTool('pagenumbers')}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: '6px', border: 'none',
                    background: activeTool === 'pagenumbers' ? 'var(--primary-color)' : 'transparent',
                    color: activeTool === 'pagenumbers' ? '#fff' : 'var(--text-color)',
                    fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Hash size={14} /> Numbers
                </button>
                <button
                  onClick={() => setActiveTool('addtext')}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: '6px', border: 'none',
                    background: activeTool === 'addtext' ? 'var(--primary-color)' : 'transparent',
                    color: activeTool === 'addtext' ? '#fff' : 'var(--text-color)',
                    fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Type size={14} /> Add Text
                </button>
              </div>

              {/* Dynamic Parameter Settings Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minHeight: '260px' }}>
                
                {/* 1. Watermark Settings */}
                {activeTool === 'watermark' && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Watermark Overlay Text</label>
                      <input
                        type="text" className="form-input" value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="e.g. CONFIDENTIAL"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Font Size ({watermarkSize}px)</label>
                        <input
                          type="range" min="12" max="100" value={watermarkSize}
                          onChange={(e) => setWatermarkSize(parseInt(e.target.value))}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Rotation ({watermarkRotation}°)</label>
                        <input
                          type="range" min="0" max="360" value={watermarkRotation}
                          onChange={(e) => setWatermarkRotation(parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Opacity ({Math.floor(watermarkOpacity * 100)}%)</label>
                        <input
                          type="range" min="0.05" max="1.0" step="0.05" value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Overlay Color</label>
                        <input
                          type="color" value={watermarkColor}
                          onChange={(e) => setWatermarkColor(e.target.value)}
                          style={{ width: '100%', height: '36px', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 2. Header Footer Settings */}
                {activeTool === 'headerfooter' && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Header Text (Top Centered)</label>
                      <input
                        type="text" className="form-input" value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        placeholder="Leave empty to skip..."
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Footer Text (Bottom Centered)</label>
                      <input
                        type="text" className="form-input" value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        placeholder="Leave empty to skip..."
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Margin Dist ({marginSize}px)</label>
                        <input
                          type="range" min="15" max="80" value={marginSize}
                          onChange={(e) => setMarginSize(parseInt(e.target.value))}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Color</label>
                        <input
                          type="color" value={hfColor}
                          onChange={(e) => setHfColor(e.target.value)}
                          style={{ width: '100%', height: '36px', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 3. Page Numbers Settings */}
                {activeTool === 'pagenumbers' && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Position Placement</label>
                      <select
                        className="form-select" value={pnPosition}
                        onChange={(e) => setPnPosition(e.target.value as any)}
                      >
                        <option value="bottom-center">Bottom Centered</option>
                        <option value="bottom-right">Bottom Right Corner</option>
                        <option value="bottom-left">Bottom Left Corner</option>
                        <option value="top-center">Top Centered</option>
                        <option value="top-right">Top Right Corner</option>
                        <option value="top-left">Top Left Corner</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Number Layout Format</label>
                      <input
                        type="text" className="form-input" value={pnFormat}
                        onChange={(e) => setPnFormat(e.target.value)}
                        placeholder="Page {x} of {y}"
                      />
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Use &#123;x&#125; for page # and &#123;y&#125; for total count.</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Start Number</label>
                        <input
                          type="number" className="form-input" min="1" value={pnStartNum}
                          onChange={(e) => setPnStartNum(Math.max(1, parseInt(e.target.value) || 1))}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Font Size ({pnFontSize}px)</label>
                        <input
                          type="range" min="8" max="24" value={pnFontSize}
                          onChange={(e) => setPnFontSize(parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 4. Custom Text Settings */}
                {activeTool === 'addtext' && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Add Overlay Text Label</label>
                      <input
                        type="text" className="form-input" value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Type text overlay..."
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Horizontal X ({customX}%)</label>
                        <input
                          type="range" min="0" max="95" value={customX}
                          onChange={(e) => setCustomX(parseInt(e.target.value))}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Vertical Y ({customY}%)</label>
                        <input
                          type="range" min="0" max="95" value={customY}
                          onChange={(e) => setCustomY(parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Font Size</label>
                        <input
                          type="range" min="8" max="72" value={customSize}
                          onChange={(e) => setCustomSize(parseInt(e.target.value))}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Color</label>
                        <input
                          type="color" value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          style={{ width: '100%', height: '36px', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Workspace Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
                <button
                  onClick={applyMarkup}
                  disabled={isSaving}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                    background: 'var(--primary-color)', color: '#fff', fontWeight: 800, fontSize: '0.9rem',
                    cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px'
                  }}
                >
                  {isSaving ? `Processing (${saveProgress}%)` : <><Download size={16} /> Compile & Download PDF</>}
                </button>
                
                <button
                  onClick={resetAll}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)',
                    background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.82rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <RefreshCw size={14} /> Reset Workspace
                </button>
              </div>

            </div>

            {/* Document Live Preview Right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-color)' }}>
                  Interactive Layout Preview (Page 1)
                </h4>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Total Pages: {numPages}
                </span>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '16px',
                border: '1px solid var(--glass-border)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '380px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {previewPageUrl ? (
                  <div style={{ position: 'relative', maxWidth: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', borderRadius: '6px', overflow: 'hidden' }}>
                    <img
                      src={previewPageUrl}
                      alt="Live markup preview"
                      style={{ display: 'block', maxWidth: '100%', height: 'auto', objectFit: 'contain' }}
                    />
                    
                    {/* Visual Overlay simulators in client-side preview for better feedback! */}
                    {activeTool === 'watermark' && watermarkText && (
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: `translate(-50%, -50%) rotate(-${watermarkRotation}deg)`,
                        fontSize: `${watermarkSize * 0.5}px`, color: watermarkColor,
                        opacity: watermarkOpacity, fontWeight: 800, fontFamily: 'sans-serif',
                        pointerEvents: 'none', whiteSpace: 'nowrap'
                      }}>
                        {watermarkText}
                      </div>
                    )}

                    {activeTool === 'headerfooter' && headerText && (
                      <div style={{
                        position: 'absolute', top: `${marginSize * 0.5}px`, left: '50%',
                        transform: 'translateX(-50%)', fontSize: `${hfFontSize * 0.8}px`,
                        color: hfColor, opacity: 0.8, pointerEvents: 'none'
                      }}>
                        {headerText}
                      </div>
                    )}

                    {activeTool === 'headerfooter' && footerText && (
                      <div style={{
                        position: 'absolute', bottom: `${marginSize * 0.5}px`, left: '50%',
                        transform: 'translateX(-50%)', fontSize: `${hfFontSize * 0.8}px`,
                        color: hfColor, opacity: 0.8, pointerEvents: 'none'
                      }}>
                        {footerText}
                      </div>
                    )}

                    {activeTool === 'pagenumbers' && (
                      <div style={{
                        position: 'absolute',
                        bottom: pnPosition.includes('bottom') ? `${marginSize * 0.5}px` : 'auto',
                        top: pnPosition.includes('top') ? `${marginSize * 0.5}px` : 'auto',
                        left: pnPosition.includes('left') ? `${marginSize * 0.5}px` : pnPosition.includes('center') ? '50%' : 'auto',
                        right: pnPosition.includes('right') ? `${marginSize * 0.5}px` : 'auto',
                        transform: pnPosition.includes('center') ? 'translateX(-50%)' : 'none',
                        fontSize: `${pnFontSize * 0.8}px`, color: '#555555', opacity: 0.8, pointerEvents: 'none'
                      }}>
                        {pnFormat.replace('{x}', pnStartNum.toString()).replace('{y}', numPages.toString())}
                      </div>
                    )}

                    {activeTool === 'addtext' && customText && (
                      <div style={{
                        position: 'absolute',
                        left: `${customX}%`,
                        top: `${100 - customY}%`,
                        fontSize: `${customSize * 0.6}px`, color: customColor,
                        fontWeight: 700, pointerEvents: 'none'
                      }}>
                        {customText}
                      </div>
                    )}

                  </div>
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No preview available</div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
