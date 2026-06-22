'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FileImage,
  ArrowRightLeft,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  FolderArchive,
  Heart
} from 'lucide-react';

interface ImageConverterSuiteProps {
  initialMode?: 'png-jpg' | 'png-webp' | 'svg-png' | 'heic-jpg' | 'avif-png';
}

interface ConversionItem {
  id: string;
  file: File;
  status: 'pending' | 'converting' | 'success' | 'failed';
  progress: number;
  outputUrl?: string;
  outputName?: string;
  error?: string;
  originalSize: string;
  convertedSize?: string;
}

export default function ImageConverterSuite({ initialMode = 'png-jpg' }: ImageConverterSuiteProps) {
  const [mode, setMode] = useState(initialMode);
  const [files, setFiles] = useState<ConversionItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>('jpg'); // jpg, png, webp, svg
  const [quality, setQuality] = useState<number>(0.85);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Dynamic CDN Libraries loading state
  const [heicLoaded, setHeicLoaded] = useState(false);
  const [jszipLoaded, setJszipLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mobile check removed - using CSS media queries

  // Load favorites & track history
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favs.includes(`image-converter-${mode}`));

      import('../../../lib/sync').then((m) => {
        m.default.addToHistory(`image-converter-${mode}`);
      });
    }
  }, [mode]);

  // Set default target formats based on active mode preset
  useEffect(() => {
    if (mode === 'png-jpg') setTargetFormat('jpg');
    else if (mode === 'png-webp') setTargetFormat('webp');
    else if (mode === 'svg-png') setTargetFormat('png');
    else if (mode === 'heic-jpg') setTargetFormat('jpg');
    else if (mode === 'avif-png') setTargetFormat('png');
  }, [mode]);

  // Inject CDN scripts for HEIC and JSZip on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Inject heic2any
    if (!(window as any).heic2any && !document.getElementById('heic-script')) {
      const script = document.createElement('script');
      script.id = 'heic-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/heic2any/0.0.4/heic2any.min.js';
      script.async = true;
      script.onload = () => setHeicLoaded(true);
      document.head.appendChild(script);
    } else {
      setHeicLoaded(true);
    }

    // 2. Inject JSZip
    if (!(window as any).JSZip && !document.getElementById('jszip-script')) {
      const script = document.createElement('script');
      script.id = 'jszip-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.async = true;
      script.onload = () => setJszipLoaded(true);
      document.head.appendChild(script);
    } else {
      setJszipLoaded(true);
    }
  }, []);

  const toggleFavorite = () => {
    if (typeof window === 'undefined') return;
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    const key = `image-converter-${mode}`;
    let updated;
    if (isFavorite) {
      updated = favs.filter((id: string) => id !== key);
    } else {
      updated = [...favs, key];
    }
    localStorage.setItem('favorites', JSON.stringify(updated));
    setIsFavorite(!isFavorite);

    import('../../../lib/sync').then((m) => {
      m.default.saveFavorite(key, !isFavorite);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded) return;
    addFilesToQueue(Array.from(uploaded));
  };

  const addFilesToQueue = (fileList: File[]) => {
    const newItems: ConversionItem[] = fileList.map(f => ({
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file: f,
      status: 'pending',
      progress: 0,
      originalSize: (f.size / 1024).toFixed(1)
    }));
    setFiles(prev => [...prev, ...newItems]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearQueue = () => {
    setFiles([]);
  };

  // Run Conversion Pipeline
  const runConversion = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const updatedQueue = [...files];

    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      if (item.status === 'success') continue;

      // Update state to active converting
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'converting' } : f));

      try {
        const { url, ext, size } = await processSingleFile(item.file);
        const outName = `${item.file.name.substring(0, item.file.name.lastIndexOf('.'))}.${ext}`;
        
        setFiles(prev => prev.map(f => f.id === item.id ? {
          ...f,
          status: 'success',
          outputUrl: url,
          outputName: outName,
          convertedSize: size
        } : f));
      } catch (err: any) {
        setFiles(prev => prev.map(f => f.id === item.id ? {
          ...f,
          status: 'failed',
          error: err.message || 'Format conversion failed'
        } : f));
      }
    }

    setIsProcessing(false);

    // Sync action activity
    import('../../../lib/sync').then((m) => {
      m.default.logActivity('Image Converter Suite', `Converted ${files.length} images to ${targetFormat.toUpperCase()} format.`);
    });
  };

  // Process a single graphic file using canvas or external helpers
  const processSingleFile = (file: File): Promise<{ url: string; ext: string; size: string }> => {
    return new Promise(async (resolve, reject) => {
      try {
        let finalBlob: Blob | null = null;
        let mimeType = `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`;

        // HEIC DECODING PATHWAY (Dynamic using heic2any CDN script)
        if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
          if (!(window as any).heic2any) {
            reject(new Error('HEIC library is still loading from CDN. Please wait...'));
            return;
          }

          try {
            const decoded = await (window as any).heic2any({
              blob: file,
              toType: mimeType
            });
            // heic2any can return single blob or array
            finalBlob = Array.isArray(decoded) ? decoded[0] : decoded;
          } catch (e) {
            reject(new Error('HEIC decoder failed to read this file.'));
            return;
          }
        }

        // SVG TO PNG/JPG PATHWAY
        else if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const svgUrl = e.target?.result as string;
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width || 800;
              canvas.height = img.height || 600;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                  if (blob) {
                    resolve({
                      url: URL.createObjectURL(blob),
                      ext: targetFormat,
                      size: (blob.size / 1024).toFixed(1)
                    });
                  } else {
                    reject(new Error('Canvas SVG export failed.'));
                  }
                }, mimeType, quality);
              }
            };
            img.src = svgUrl;
          };
          reader.readAsDataURL(file);
          return;
        }

        // PNG TO SVG WRAPPER PATHWAY
        else if (targetFormat === 'svg') {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = e.target?.result as string;
            const img = new Image();
            img.onload = () => {
              // Wrap raster pixels inside standard SVG coordinates wrapper
              const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}">
                <image width="100%" height="100%" href="${base64}" />
              </svg>`;
              const blob = new Blob([svgString], { type: 'image/svg+xml' });
              resolve({
                url: URL.createObjectURL(blob),
                ext: 'svg',
                size: (blob.size / 1024).toFixed(1)
              });
            };
            img.src = base64;
          };
          reader.readAsDataURL(file);
          return;
        }

        // STANDARD RASTER CONVERSIONS (JPG, PNG, WEBP, AVIF)
        if (!finalBlob) {
          // Read to canvas
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                  if (blob) {
                    resolve({
                      url: URL.createObjectURL(blob),
                      ext: targetFormat,
                      size: (blob.size / 1024).toFixed(1)
                    });
                  } else {
                    reject(new Error('Canvas export failed.'));
                  }
                }, mimeType, quality);
              }
            };
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
          return;
        }

        // Output final HEIC blob URL
        if (finalBlob) {
          resolve({
            url: URL.createObjectURL(finalBlob),
            ext: targetFormat,
            size: (finalBlob.size / 1024).toFixed(1)
          });
        }
      } catch (e: any) {
        reject(e);
      }
    });
  };

  // Download all files as a single consolidated ZIP folder
  const downloadAllAsZip = async () => {
    if (!(window as any).JSZip) {
      alert('ZIP library is still loading from CDN. Please try again in a moment.');
      return;
    }

    const zip = new (window as any).JSZip();
    const successItems = files.filter(f => f.status === 'success' && f.outputUrl);
    
    if (successItems.length === 0) return;

    for (const item of successItems) {
      if (!item.outputUrl || !item.outputName) continue;
      const res = await fetch(item.outputUrl);
      const blob = await res.blob();
      zip.file(item.outputName, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(content);

    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = `converted_images_${Date.now()}.zip`;
    link.click();
  };

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <style>{`
        .image-suite-grid-reverse {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .image-suite-grid-reverse {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ArrowRightLeft size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: 0 }}>Graphics Converter Suite</h2>
        </div>
        <button
          onClick={toggleFavorite}
          style={{
            background: 'transparent',
            border: '1px solid var(--glass-border)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isFavorite ? '#ff4757' : 'var(--text-secondary)'
          }}
        >
          <Heart size={20} fill={isFavorite ? '#ff4757' : 'none'} />
        </button>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
        Batch convert vector graphics and raster files client-side. Supports instant downloads or compressed ZIP packing.
      </p>

      {/* Main Container Grid */}
      <div className="image-suite-grid-reverse">
        
        {/* Left Tuning Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Mode Switch select */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
              Converter pipelines
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="form-input"
            >
              <option value="png-jpg">PNG ↔ JPG converter</option>
              <option value="png-webp">PNG ↔ WEBP converter</option>
              <option value="svg-png">SVG ↔ PNG converter</option>
              <option value="heic-jpg">HEIC ↔ JPG converter</option>
              <option value="avif-png">AVIF ↔ PNG converter</option>
            </select>
          </div>

          {/* Target Export Format Selector */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
              Target Output Format
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['jpg', 'png', 'webp', 'svg'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setTargetFormat(fmt)}
                  style={{
                    flex: '1 0 60px',
                    background: targetFormat === fmt ? 'var(--primary-color)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--glass-border)',
                    padding: '8px',
                    borderRadius: '6px',
                    color: targetFormat === fmt ? '#fff' : 'var(--text-color)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Compression quality factor */}
          {(targetFormat === 'jpg' || targetFormat === 'webp') && (
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Compression Quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={runConversion}
              disabled={isProcessing || files.length === 0}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <ArrowRightLeft size={16} />
                  Convert Queue
                </>
              )}
            </button>

            {files.filter(f => f.status === 'success').length > 0 && (
              <button
                onClick={downloadAllAsZip}
                className="btn-secondary"
                style={{ width: '100%', padding: '10px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <FolderArchive size={16} /> Download all as ZIP
              </button>
            )}
          </div>

        </div>

        {/* Right Batch File Queue List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Drag area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--glass-border)',
              borderRadius: '16px',
              padding: '30px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--glass-bg)',
              transition: 'var(--transition-smooth)'
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) {
                addFilesToQueue(Array.from(e.dataTransfer.files));
              }
            }}
          >
            <Upload size={32} color="var(--primary-color)" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Add Files to Batch Queue</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>
              Drag files or click to browse. Convert up to 20 files simultaneously.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,.heic"
              multiple
              style={{ display: 'none' }}
            />
          </div>

          {/* Queue List */}
          {files.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Queue count: <strong>{files.length}</strong> items
                </span>
                <button
                  onClick={clearQueue}
                  style={{ background: 'none', border: 'none', color: '#ff4757', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Clear Queue
                </button>
              </div>

              <div
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {files.map((item) => (
                  <div
                    key={item.id}
                    className="glass-panel"
                    style={{
                      padding: '12px',
                      margin: 0,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid var(--glass-border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '70%' }}>
                      <FileImage size={18} color="var(--primary-color)" />
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.file.name}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>
                          Size: {item.originalSize} KB
                          {item.convertedSize && ` → Output: ${item.convertedSize} KB`}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.status === 'success' && (
                        <>
                          <CheckCircle size={16} color="#28a745" />
                          <a
                            href={item.outputUrl}
                            download={item.outputName}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--primary-color)',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                          >
                            <Download size={16} />
                          </a>
                        </>
                      )}
                      {item.status === 'failed' && (
                        <>
                          <span title={item.error}>
                            <AlertTriangle size={16} color="#dc3545" />
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#dc3545' }}>Err</span>
                        </>
                      )}
                      {item.status === 'converting' && (
                        <RefreshCw size={14} className="animate-spin" color="var(--primary-color)" />
                      )}
                      {item.status === 'pending' && (
                        <button
                          onClick={() => removeFile(item.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                No files loaded in the converter pipeline queue.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
