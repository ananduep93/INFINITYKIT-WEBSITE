'use client';

import React, { useState, useRef } from 'react';
import { Upload, Copy, Check, FileCode, Sliders, Palette, RefreshCw, Download, Image as ImageIcon } from 'lucide-react';

interface PaletteColor {
  hex: string;
  rgb: string;
  rgbObj: {
    r: number;
    g: number;
    b: number;
  };
}

export default function ColorPaletteGenerator() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');
    setPalette([]);
    setCopiedIndex(null);
    setCopiedText(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageSrc(e.target.result as string);
        generatePaletteFromSrc(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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

  const generatePaletteFromSrc = (src: string) => {
    setIsProcessing(true);
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const extracted = extractColors(img);
      setPalette(extracted);
      setIsProcessing(false);
    };
    img.onerror = () => {
      setIsProcessing(false);
      alert('Failed to load image.');
    };
  };

  const extractColors = (imgElement: HTMLImageElement): PaletteColor[] => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return [];

    // Scale down image to 100x100 for high performance color extraction
    const size = 100;
    canvas.width = size;
    canvas.height = size;
    context.drawImage(imgElement, 0, 0, size, size);

    const imgData = context.getImageData(0, 0, size, size);
    const data = imgData.data;
    const pixels: [number, number, number][] = [];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Ignore transparent pixels
      if (a >= 125) {
        pixels.push([r, g, b]);
      }
    }

    interface Cluster {
      rSum: number;
      gSum: number;
      bSum: number;
      count: number;
    }

    const clusters: Cluster[] = [];
    const distanceThreshold = 55; // Distance threshold for grouping similar colors

    for (const pixel of pixels) {
      const [pr, pg, pb] = pixel;
      let found = false;

      for (const cluster of clusters) {
        const cr = cluster.rSum / cluster.count;
        const cg = cluster.gSum / cluster.count;
        const cb = cluster.bSum / cluster.count;

        const dist = Math.sqrt(
          Math.pow(pr - cr, 2) +
          Math.pow(pg - cg, 2) +
          Math.pow(pb - cb, 2)
        );

        if (dist < distanceThreshold) {
          cluster.rSum += pr;
          cluster.gSum += pg;
          cluster.bSum += pb;
          cluster.count += 1;
          found = true;
          break;
        }
      }

      if (!found) {
        clusters.push({
          rSum: pr,
          gSum: pg,
          bSum: pb,
          count: 1
        });
      }
    }

    // Sort by color dominance (pixel count)
    clusters.sort((a, b) => b.count - a.count);

    // Keep top 6 colors
    const topClusters = clusters.slice(0, 6);

    // Grayscale fallback / padding if less than 6 clusters extracted
    const grayscales = [
      { r: 245, g: 247, b: 250 },
      { r: 26, g: 32, b: 44 },
      { r: 113, g: 128, b: 150 },
      { r: 203, g: 213, b: 224 },
      { r: 74, g: 85, b: 104 },
      { r: 226, g: 232, b: 240 }
    ];

    let padIdx = 0;
    while (topClusters.length < 6) {
      const filler = grayscales[padIdx % grayscales.length];
      topClusters.push({
        rSum: filler.r,
        gSum: filler.g,
        bSum: filler.b,
        count: 1
      });
      padIdx++;
    }

    const componentToHex = (c: number) => {
      const hex = Math.round(c).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    const rgbToHex = (r: number, g: number, b: number) => {
      return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };

    return topClusters.map(c => {
      const r = Math.round(c.rSum / c.count);
      const g = Math.round(c.gSum / c.count);
      const b = Math.round(c.bSum / c.count);
      return {
        hex: rgbToHex(r, g, b).toUpperCase(),
        rgb: `rgb(${r}, ${g}, ${b})`,
        rgbObj: { r, g, b }
      };
    });
  };

  const copyToClipboard = (text: string, index: number | null = null) => {
    navigator.clipboard.writeText(text);
    if (index !== null) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  const copyCSSVariables = () => {
    if (palette.length === 0) return;
    const variables = palette.map((color, index) => `  --color-${index + 1}: ${color.hex};`).join('\n');
    const cssBlock = `:root {\n${variables}\n}`;
    copyToClipboard(cssBlock);
  };

  const copyTailwind = () => {
    if (palette.length === 0) return;
    const config = palette.map((color, index) => `        'color-${index + 1}': '${color.hex}',`).join('\n');
    const tailwindBlock = `colors: {\n${config}\n}`;
    copyToClipboard(tailwindBlock);
  };

  const downloadPaletteImage = () => {
    if (palette.length === 0) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Palette PNG dimensions
    canvas.width = 800;
    canvas.height = 400;

    // Draw background
    ctx.fillStyle = '#11141a';
    ctx.fillRect(0, 0, 800, 400);

    // Draw swatches
    const swatchWidth = 800 / palette.length;
    palette.forEach((color, i) => {
      ctx.fillStyle = color.hex;
      ctx.fillRect(i * swatchWidth, 0, swatchWidth, 280);

      // Draw color details text below swatches
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(color.hex, i * swatchWidth + 20, 320);

      ctx.fillStyle = '#8a94a6';
      ctx.font = '12px sans-serif';
      ctx.fillText(color.rgb, i * swatchWidth + 20, 345);

      ctx.fillStyle = '#566175';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Color ${i + 1}`, i * swatchWidth + 20, 370);
    });

    // Download triggers
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `palette_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setImageSrc(null);
    setFileName('');
    setFileSize('');
    setPalette([]);
    setCopiedIndex(null);
    setCopiedText(null);
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
            <Palette size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>
              Color Palette Generator
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Extract gorgeous, dominant color schemes instantly from any image or brand photo.
            </p>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '24px 0' }} />

        {/* Upload State */}
        {!imageSrc && (
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
              Upload a photograph
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 16px' }}>
              Drag & drop JPEG, PNG, or WebP here, or click to browse
            </p>
            <span style={{
              fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px',
              background: 'var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 600
            }}>
              Supports SVG, JPEG, PNG, WebP
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <RefreshCw size={36} color="var(--primary-color)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-color)', margin: 0 }}>Quantizing pixels...</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Extracting top 6 dominant colors</p>
          </div>
        )}

        {/* Results Panel */}
        {imageSrc && palette.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Top row: Image preview & Palette visualization */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* Image Details Card */}
              <div style={{
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center'
              }}>
                <div style={{
                  position: 'relative', width: '100%', height: '220px', borderRadius: '12px',
                  overflow: 'hidden', border: '1px solid var(--glass-border)', background: '#181b22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <img
                    src={imageSrc}
                    alt="Uploaded Color Source"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                  <div style={{ minWidth: 0, marginRight: '12px' }}>
                    <div style={{
                      fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-color)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {fileName}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{fileSize}</div>
                  </div>
                  <button
                    onClick={resetAll}
                    style={{
                      background: 'none', border: '1px solid var(--glass-border)', cursor: 'pointer',
                      color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center',
                      gap: '4px', padding: '6px 12px', borderRadius: '8px', transition: 'var(--transition-smooth)'
                    }}
                  >
                    <RefreshCw size={14} /> Reset
                  </button>
                </div>
              </div>

              {/* Combined Color strip */}
              <div style={{
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column'
              }}>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-color)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders size={16} color="var(--primary-color)" /> Harmonious Range
                </label>
                <div style={{
                  display: 'flex', flex: 1, borderRadius: '12px', overflow: 'hidden',
                  height: '180px', border: '1px solid var(--glass-border)'
                }}>
                  {palette.map((color, idx) => (
                    <div
                      key={idx}
                      onClick={() => copyToClipboard(color.hex, idx)}
                      style={{
                        flex: 1, background: color.hex, cursor: 'pointer',
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                        paddingBottom: '14px', position: 'relative', transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scaleY(1.04)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                      title={`Click to copy: ${color.hex}`}
                    >
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 800, color: '#fff',
                        textShadow: '0 1px 4px rgba(0,0,0,0.6)', background: 'rgba(0,0,0,0.3)',
                        padding: '2px 6px', borderRadius: '6px'
                      }}>
                        {copiedIndex === idx ? 'Copied!' : color.hex}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Hover blocks to preview details. Click a block to copy hex color.
                </div>
              </div>

            </div>

            {/* Individual Swatch Grid */}
            <div>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
                Extracted Swatches
              </h3>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '16px'
              }}>
                {palette.map((color, idx) => (
                  <div
                    key={idx}
                    className="glass-panel"
                    style={{
                      padding: '10px', display: 'flex', flexDirection: 'column',
                      borderRadius: '12px', border: '1px solid var(--glass-border)',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      width: '100%', height: '70px', borderRadius: '8px',
                      background: color.hex, border: '1px solid rgba(255,255,255,0.08)',
                      marginBottom: '8px'
                    }} />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-color)' }}>
                        {color.hex}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {color.rgb}
                      </span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(color.hex, idx)}
                      style={{
                        position: 'absolute', top: '14px', right: '14px',
                        background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%',
                        width: '26px', height: '26px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#fff', cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                      title="Copy HEX"
                    >
                      {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Export Code Buttons */}
            <div style={{
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileCode size={16} color="var(--primary-color)" /> Developer Exports
                </span>
                {copiedText && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary-color)', fontWeight: 700 }}>
                    Copied variables to clipboard!
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={copyCSSVariables}
                  style={{
                    padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--glass-border)',
                    background: 'transparent', color: 'var(--text-color)', fontSize: '0.8rem',
                    fontWeight: 700, cursor: 'pointer', transition: 'var(--transition-smooth)',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Copy size={14} /> Copy CSS Variables
                </button>
                <button
                  onClick={copyTailwind}
                  style={{
                    padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--glass-border)',
                    background: 'transparent', color: 'var(--text-color)', fontSize: '0.8rem',
                    fontWeight: 700, cursor: 'pointer', transition: 'var(--transition-smooth)',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Copy size={14} /> Copy Tailwind Config
                </button>
                <button
                  onClick={downloadPaletteImage}
                  style={{
                    padding: '10px 18px', borderRadius: '8px', border: 'none',
                    background: 'var(--primary-color)', color: '#fff', fontSize: '0.8rem',
                    fontWeight: 700, cursor: 'pointer', transition: 'var(--transition-smooth)',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Download size={14} /> Download Palette PNG
                </button>
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
