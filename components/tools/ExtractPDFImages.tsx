'use client';

import React, { useState, useRef } from 'react';
import { Image, Upload, Download, FileImage, AlertCircle, CheckCircle } from 'lucide-react';
import ReusableLoading from '../ui/ReusableLoading';
import { getPdfJs } from '../../lib/pdfjs';

interface ExtractedImageItem {
  id: string;
  pageNum: number;
  dataUrl: string;
  width: number;
  height: number;
  format: 'png' | 'jpeg';
}

export default function ExtractPDFImages() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedImages, setExtractedImages] = useState<ExtractedImageItem[]>([]);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  // 0 = no limit (all pages)
  const [maxPages, setMaxPages] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic JSZip loader — switched to jsdelivr CDN
  const loadJSZip = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).JSZip) {
        resolve((window as any).JSZip);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
      script.onload = () => resolve((window as any).JSZip);
      script.onerror = () => reject(new Error('Failed to load ZIP compressor.'));
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
    setExtractedImages([]);

    try {
      const pdfjs = await getPdfJs();
      const arrayBuffer = await uploaded.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setNumPages(pdfDoc.numPages);
    } catch (err: any) {
      setError('Failed to parse PDF document.');
      setFile(null);
    }
  };

  const runExtraction = async () => {
    if (!file || !numPages) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setExtractedImages([]);

    try {
      const pdfjs = await getPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      const imagesList: ExtractedImageItem[] = [];

      const pagesToScan = maxPages > 0 ? Math.min(numPages, maxPages) : numPages;

      for (let i = 1; i <= pagesToScan; i++) {
        setProgressText(`Scanning page ${i} of ${pagesToScan}...`);
        const page = await pdfDoc.getPage(i);
        const operatorList = await page.getOperatorList();

        for (let j = 0; j < operatorList.fnArray.length; j++) {
          const fn = operatorList.fnArray[j];
          const isInline = fn === pdfjs.OPS.paintInlineImageXObject;
          const isImageOp = 
            fn === pdfjs.OPS.paintImageXObject || 
            fn === pdfjs.OPS.paintImageMaskXObject ||
            (pdfjs.OPS.paintJpegXObject && fn === pdfjs.OPS.paintJpegXObject);

          if (isImageOp || isInline) {
            let img: any = null;

            if (isInline) {
              img = operatorList.argsArray[j][0];
            } else {
              const imgKey = operatorList.argsArray[j][0];
              
              // 1. Try page.objs.get
              img = await new Promise<any>((resolve) => {
                let resolved = false;
                const timer = setTimeout(() => {
                  if (!resolved) {
                    resolved = true;
                    resolve(null);
                  }
                }, 1000);
                
                page.objs.get(imgKey, (obj: any) => {
                  if (!resolved) {
                    resolved = true;
                    clearTimeout(timer);
                    resolve(obj);
                  }
                });
              });

              // 2. Fallback to page.commonObjs.get
              if (!img && page.commonObjs) {
                img = await new Promise<any>((resolve) => {
                  let resolved = false;
                  const timer = setTimeout(() => {
                    if (!resolved) {
                      resolved = true;
                      resolve(null);
                    }
                  }, 1000);
                  
                  page.commonObjs.get(imgKey, (obj: any) => {
                    if (!resolved) {
                      resolved = true;
                      clearTimeout(timer);
                      resolve(obj);
                    }
                  });
                });
              }
            }

            if (img && img.width && img.height) {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');

              if (ctx) {
                let hasDrawn = false;
                const drawable = img.bitmap || img.image || img;
                
                if (
                  drawable instanceof HTMLImageElement || 
                  drawable instanceof ImageBitmap || 
                  (typeof HTMLCanvasElement !== 'undefined' && drawable instanceof HTMLCanvasElement)
                ) {
                  ctx.drawImage(drawable, 0, 0);
                  hasDrawn = true;
                } else if (img.data) {
                  const imgData = ctx.createImageData(img.width, img.height);
                  const dataLength = img.data.length;

                  if (dataLength === img.width * img.height * 3) {
                    // RGB
                    let srcIdx = 0;
                    let dstIdx = 0;
                    const limit = img.width * img.height;
                    for (let k = 0; k < limit; k++) {
                      imgData.data[dstIdx] = img.data[srcIdx];       // R
                      imgData.data[dstIdx + 1] = img.data[srcIdx + 1]; // G
                      imgData.data[dstIdx + 2] = img.data[srcIdx + 2]; // B
                      imgData.data[dstIdx + 3] = 255;                  // A
                      srcIdx += 3;
                      dstIdx += 4;
                    }
                    ctx.putImageData(imgData, 0, 0);
                    hasDrawn = true;
                  } else if (dataLength === img.width * img.height) {
                    // Grayscale
                    let srcIdx = 0;
                    let dstIdx = 0;
                    const limit = img.width * img.height;
                    for (let k = 0; k < limit; k++) {
                      const val = img.data[srcIdx];
                      imgData.data[dstIdx] = val;       // R
                      imgData.data[dstIdx + 1] = val;   // G
                      imgData.data[dstIdx + 2] = val;   // B
                      imgData.data[dstIdx + 3] = 255;   // A
                      srcIdx++;
                      dstIdx += 4;
                    }
                    ctx.putImageData(imgData, 0, 0);
                    hasDrawn = true;
                  } else if (dataLength === img.width * img.height * 4) {
                    // RGBA
                    imgData.data.set(img.data);
                    ctx.putImageData(imgData, 0, 0);
                    hasDrawn = true;
                  }
                }

                if (hasDrawn) {
                  const dataUrl = canvas.toDataURL('image/png');
                  imagesList.push({
                    id: `img_${i}_${j}_${Date.now()}`,
                    pageNum: i,
                    dataUrl,
                    width: img.width,
                    height: img.height,
                    format: 'png'
                  });
                }
              }
            }
          }
        }
      }

      setExtractedImages(imagesList);
      if (imagesList.length === 0) {
        setError('No embedded raster images could be detected in this PDF. It may contain vector path graphics instead.');
      } else {
        setSuccess(`Successfully extracted ${imagesList.length} native images from the document!`);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while scanning PDF image assets.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (img: ExtractedImageItem, idx: number) => {
    const link = document.createElement('a');
    link.href = img.dataUrl;
    link.download = `extracted_page_${img.pageNum}_asset_${idx + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    if (extractedImages.length === 0) return;
    setZipLoading(true);
    try {
      const JSZip = await loadJSZip();
      const zip = new JSZip();

      extractedImages.forEach((img, idx) => {
        const base64Data = img.dataUrl.split(',')[1];
        zip.file(`extracted_page_${img.pageNum}_asset_${idx + 1}.png`, base64Data, { base64: true });
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `extracted_pdf_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setError('ZIP compression failed. Please download images individually.');
    } finally {
      setZipLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setNumPages(null);
    setExtractedImages([]);
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
            <Image size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>
              Extract Images from PDF
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Scan and extract high-resolution embedded graphics and photos from PDF files client-side.
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

        {/* Action Triggers */}
        {file && numPages && !isProcessing && extractedImages.length === 0 && (
          <div className="glass-panel" style={{ margin: 0, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <FileImage size={32} color="var(--primary-color)" />
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
                Change File
              </button>
            </div>

            {/* Page limit selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pages to Scan
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
                <option value={25}>First 25 pages</option>
                <option value={50}>First 50 pages</option>
                <option value={100}>First 100 pages</option>
              </select>
            </div>

            <button
              onClick={runExtraction}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: 'var(--primary-color)', color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              Scan &amp; Extract Embedded Photos
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
                Analyzing graphic objects. Please wait...
              </p>
            </div>
          </div>
        )}

        {/* Extracted Images Grid view */}
        {extractedImages.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
                  Extracted Images ({extractedImages.length})
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={downloadAllAsZip}
                  disabled={zipLoading}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    background: 'var(--primary-color)', color: '#fff', fontWeight: 700,
                    fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {zipLoading ? 'Compressing...' : 'Download All as ZIP'}
                </button>
                <button
                  onClick={resetAll}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)',
                    background: 'transparent', color: 'var(--text-color)', fontWeight: 700,
                    fontSize: '0.8rem', cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '16px'
            }}>
              {extractedImages.map((img, idx) => (
                <div
                  key={img.id}
                  style={{
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                    borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column'
                  }}
                >
                  <div style={{
                    width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <img
                      src={img.dataUrl}
                      alt={`Extracted asset ${idx + 1}`}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Asset #{idx + 1} (Page {img.pageNum})
                    </span>
                    <button
                      onClick={() => downloadImage(img, idx)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--primary-color)',
                        cursor: 'pointer', padding: '4px'
                      }}
                      title="Download image"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
