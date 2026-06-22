'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Upload, RefreshCw, Trash2, RotateCw, Copy, Crop, 
  ArrowLeft, ArrowRight, Download, Plus, Check, Scissors, Layers 
} from 'lucide-react';
import ReusableLoading from '../../../components/ui/ReusableLoading';
import { getPdfJs } from '../../../lib/pdfjs';

interface PDFPageItem {
  id: string;
  file: File;
  fileName: string;
  pageIndex: number; // 0-indexed original page
  rotation: number;  // 0, 90, 180, 270 degrees relative
  thumbnailUrl: string;
  originalPageNumber: number; // 1-indexed for display
  selected: boolean; // For split/extraction
  crop?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

interface PDFPageEditorProps {
  initialMode?: 'merge' | 'split' | 'edit' | 'rotate' | 'crop';
}

export default function PDFPageEditor({ initialMode = 'edit' }: PDFPageEditorProps) {
  const [pages, setPages] = useState<PDFPageItem[]>([]);
  const [filesList, setFilesList] = useState<File[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<'merge' | 'split' | 'edit' | 'rotate' | 'crop'>(initialMode);
  
  // Crop modal state
  const [croppingPage, setCroppingPage] = useState<PDFPageItem | null>(null);
  const [cropMargins, setCropMargins] = useState({ left: 10, top: 10, right: 10, bottom: 10 });

  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleUpload = async (incomingFiles: File[]) => {
    setError(null);
    setSuccess(null);
    setIsParsing(true);

    try {
      const pdfjs = await getPdfJs();
      const newPagesList: PDFPageItem[] = [...pages];

      for (const file of incomingFiles) {
        if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
          continue;
        }

        const buffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: buffer });
        const pdfDoc = await loadingTask.promise;
        const pageCount = pdfDoc.numPages;

        for (let i = 0; i < pageCount; i++) {
          const page = await pdfDoc.getPage(i + 1);
          // Render low-res thumbnail
          const viewport = page.getViewport({ scale: 0.25 });
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

          const id = `${file.name}_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          newPagesList.push({
            id,
            file,
            fileName: file.name,
            pageIndex: i,
            rotation: 0,
            thumbnailUrl: canvas.toDataURL('image/jpeg', 0.7),
            originalPageNumber: i + 1,
            selected: true
          });
        }
      }

      setPages(newPagesList);
      setFilesList(prev => [...prev, ...incomingFiles]);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading PDF document pages.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(Array.from(e.target.files));
    }
  };

  // Page level editing operations
  const rotatePage = (id: string) => {
    setPages(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, rotation: (p.rotation + 90) % 360 };
      }
      return p;
    }));
  };

  const deletePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
  };

  const duplicatePage = (id: string, index: number) => {
    const pageToDuplicate = pages.find(p => p.id === id);
    if (!pageToDuplicate) return;

    const newPage: PDFPageItem = {
      ...pageToDuplicate,
      id: `${pageToDuplicate.id}_copy_${Date.now()}`,
      originalPageNumber: pageToDuplicate.originalPageNumber
    };

    setPages(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, newPage);
      return copy;
    });
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === pages.length - 1) return;

    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    setPages(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const toggleSelectPage = (id: string) => {
    setPages(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, selected: !p.selected };
      }
      return p;
    }));
  };

  // Open Crop Editor Modal
  const openCropper = (page: PDFPageItem) => {
    setCroppingPage(page);
    if (page.crop) {
      setCropMargins({ ...page.crop });
    } else {
      setCropMargins({ left: 10, top: 10, right: 10, bottom: 10 });
    }
  };

  const saveCrop = () => {
    if (!croppingPage) return;
    setPages(prev => prev.map(p => {
      if (p.id === croppingPage.id) {
        return { ...p, crop: { ...cropMargins } };
      }
      return p;
    }));
    setCroppingPage(null);
  };

  // Save the manipulated PDF Document
  const saveDocument = async () => {
    setError(null);
    setSuccess(null);

    const pagesToCompile = mode === 'split' ? pages.filter(p => p.selected) : pages;
    
    if (pagesToCompile.length === 0) {
      setError('Please select at least one page to save.');
      return;
    }

    setIsSaving(true);
    setSaveProgress(10);

    try {
      // Lazy load pdf-lib from standard Next package we installed
      const { PDFDocument, degrees } = await import('pdf-lib');
      setSaveProgress(30);

      const outputDoc = await PDFDocument.create();
      
      // Keep track of loaded source documents to avoid reloading the same file multiple times
      const loadedDocsCache: Record<string, any> = {};

      let index = 0;
      for (const pageItem of pagesToCompile) {
        let srcDoc = loadedDocsCache[pageItem.fileName];
        if (!srcDoc) {
          const fileBytes = await pageItem.file.arrayBuffer();
          srcDoc = await PDFDocument.load(fileBytes);
          loadedDocsCache[pageItem.fileName] = srcDoc;
        }

        const [copiedPage] = await outputDoc.copyPages(srcDoc, [pageItem.pageIndex]);

        // Apply Rotation relative to current rotation
        if (pageItem.rotation > 0) {
          copiedPage.setRotation(degrees(pageItem.rotation));
        }

        // Apply Crop Box
        if (pageItem.crop) {
          const { width, height } = copiedPage.getSize();
          const leftMarg = (pageItem.crop.left / 100) * width;
          const rightMarg = (pageItem.crop.right / 100) * width;
          const topMarg = (pageItem.crop.top / 100) * height;
          const bottomMarg = (pageItem.crop.bottom / 100) * height;

          copiedPage.setCropBox(
            leftMarg,
            bottomMarg,
            width - leftMarg - rightMarg,
            height - topMarg - bottomMarg
          );
        }

        outputDoc.addPage(copiedPage);
        index++;
        setSaveProgress(Math.min(90, 30 + Math.floor((index / pagesToCompile.length) * 60)));
      }

      const mergedPdfBytes = await outputDoc.save();
      setSaveProgress(95);

      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      // Determine output name
      let outName = 'infinitykit_edited.pdf';
      if (mode === 'merge') {
        outName = `merged_${Date.now()}.pdf`;
      } else if (mode === 'split') {
        outName = `split_${pagesToCompile[0].fileName}`;
      } else {
        outName = `edited_${pagesToCompile[0].fileName}`;
      }

      setSaveProgress(100);
      setSuccess('PDF successfully processed and compiled in browser!');
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      setError(err.message || 'Failed to compile and build the new PDF document.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetAll = () => {
    setPages([]);
    setFilesList([]);
    setError(null);
    setSuccess(null);
    setSaveProgress(0);
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary-color) 0%, #007a75 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Layers size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>
                Visual PDF Editor & Workspace
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                Rearrange, split, merge, crop, duplicate, and rotate document pages 100% locally.
              </p>
            </div>
          </div>

          {pages.length > 0 && (
            <div style={{ display: 'flex', background: 'var(--glass-border)', padding: '4px', borderRadius: '10px', gap: '4px' }}>
              {(['edit', 'merge', 'split', 'rotate', 'crop'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: 'none',
                    background: mode === m ? 'var(--primary-color)' : 'transparent',
                    color: mode === m ? '#fff' : 'var(--text-color)',
                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                    textTransform: 'uppercase', transition: 'all 0.2s'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
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
        {pages.length === 0 && !isParsing && (
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
              Upload one or more PDF files to begin editing
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 16px' }}>
              Drag and drop PDF files here, or click to browse files
            </p>
            <span style={{
              fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px',
              background: 'var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 600
            }}>
              Supports multiple files · Zero server tracking
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Loading parses */}
        {isParsing && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <ReusableLoading type="spinner" />
            <p style={{ fontWeight: 600, color: 'var(--text-color)', margin: '14px 0 0' }}>Rendering Page Previews...</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Extracting PDF structures in-browser</p>
          </div>
        )}

        {/* Editor Workspace View */}
        {pages.length > 0 && !isParsing && (
          <div>
            {/* Action Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)', fontWeight: 700,
                    fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Plus size={14} /> Add PDF File
                </button>
                <button
                  onClick={resetAll}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)',
                    background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700,
                    fontSize: '0.82rem', cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {mode === 'split' && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Selected: {pages.filter(p => p.selected).length} of {pages.length} pages
                  </span>
                )}
                <button
                  onClick={saveDocument}
                  disabled={isSaving}
                  style={{
                    padding: '10px 20px', borderRadius: '8px', border: 'none',
                    background: 'var(--primary-color)', color: '#fff', fontWeight: 800,
                    fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  {isSaving ? (
                    `Saving (${saveProgress}%)`
                  ) : (
                    <>
                      <Download size={15} /> 
                      {mode === 'merge' ? 'Merge & Save PDF' : mode === 'split' ? 'Extract Selected Pages' : 'Save PDF Document'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Thumbnail Grid Container */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '20px',
              background: 'rgba(0,0,0,0.15)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              maxHeight: '600px',
              overflowY: 'auto'
            }}>
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  style={{
                    background: 'var(--glass-bg)',
                    border: page.selected && mode === 'split' ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.2s',
                    opacity: page.selected || mode !== 'split' ? 1 : 0.55
                  }}
                >
                  {/* Visual Page Info Box */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', background: 'var(--glass-border)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100px' }}>
                      {page.fileName}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-color)' }}>
                      Page {page.originalPageNumber}
                    </span>
                  </div>

                  {/* Thumbnail Rendering Frame */}
                  <div 
                    onClick={() => mode === 'split' && toggleSelectPage(page.id)}
                    style={{
                      height: '190px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--glass-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: mode === 'split' ? 'pointer' : 'default'
                    }}
                  >
                    <img
                      src={page.thumbnailUrl}
                      alt={`Page ${page.originalPageNumber}`}
                      style={{
                        maxWidth: '90%',
                        maxHeight: '90%',
                        objectFit: 'contain',
                        transform: `rotate(${page.rotation}deg)`,
                        transition: 'transform 0.2s ease'
                      }}
                    />

                    {/* Checkbox overlay for split selection */}
                    {mode === 'split' && (
                      <div style={{
                        position: 'absolute', top: '8px', right: '8px',
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: page.selected ? 'var(--primary-color)' : 'rgba(0,0,0,0.5)',
                        border: '1px solid #fff', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#fff'
                      }}>
                        {page.selected && <Check size={12} strokeWidth={3} />}
                      </div>
                    )}

                    {/* Crop markers overlay preview */}
                    {page.crop && (
                      <div style={{
                        position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%',
                        border: '1.5px dashed var(--primary-color)', background: 'rgba(0,161,155,0.08)',
                        pointerEvents: 'none'
                      }} />
                    )}
                  </div>

                  {/* Page Manipulation Overlay Buttons */}
                  {mode !== 'split' && (
                    <div style={{
                      marginTop: '10px', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', gap: '4px'
                    }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                          onClick={() => rotatePage(page.id)}
                          title="Rotate 90° Clockwise"
                          style={{
                            background: 'none', border: 'none', color: 'var(--text-secondary)',
                            cursor: 'pointer', padding: '5px', borderRadius: '4px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                          <RotateCw size={14} />
                        </button>
                        <button
                          onClick={() => duplicatePage(page.id, index)}
                          title="Duplicate Page"
                          style={{
                            background: 'none', border: 'none', color: 'var(--text-secondary)',
                            cursor: 'pointer', padding: '5px', borderRadius: '4px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => openCropper(page)}
                          title="Crop Page Margins"
                          style={{
                            background: 'none', border: 'none', color: 'var(--text-secondary)',
                            cursor: 'pointer', padding: '5px', borderRadius: '4px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                          <Crop size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <button
                          onClick={() => movePage(index, 'left')}
                          disabled={index === 0}
                          style={{
                            background: 'none', border: 'none', color: 'var(--text-secondary)',
                            cursor: index === 0 ? 'not-allowed' : 'pointer', padding: '5px', opacity: index === 0 ? 0.3 : 1
                          }}
                        >
                          <ArrowLeft size={14} />
                        </button>
                        <button
                          onClick={() => movePage(index, 'right')}
                          disabled={index === pages.length - 1}
                          style={{
                            background: 'none', border: 'none', color: 'var(--text-secondary)',
                            cursor: index === pages.length - 1 ? 'not-allowed' : 'pointer', padding: '5px', opacity: index === pages.length - 1 ? 0.3 : 1
                          }}
                        >
                          <ArrowRight size={14} />
                        </button>
                        <button
                          onClick={() => deletePage(page.id)}
                          title="Delete Page"
                          style={{
                            background: 'none', border: 'none', color: '#dc3545',
                            cursor: 'pointer', padding: '5px', borderRadius: '4px'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Grid Index Position (Visual layout helper) */}
                  <div style={{
                    position: 'absolute', bottom: '6px', left: '6px', pointerEvents: 'none',
                    fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-secondary)',
                    background: 'var(--glass-bg)', padding: '2px 5px', borderRadius: '3px'
                  }}>
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual Crop Margins Editor Modal */}
        {croppingPage && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <div className="glass-panel" style={{
              maxWidth: '500px', width: '100%', padding: '24px', margin: 0,
              display: 'flex', flexDirection: 'column', gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Adjust Crop Margins (%)</h3>
              
              <div style={{
                height: '240px', background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px', border: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
              }}>
                <img
                  src={croppingPage.thumbnailUrl}
                  alt="Crop preview"
                  style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
                />
                {/* Visual Crop Box overlay */}
                <div style={{
                  position: 'absolute',
                  top: `${cropMargins.top}%`,
                  left: `${cropMargins.left}%`,
                  right: `${cropMargins.right}%`,
                  bottom: `${cropMargins.bottom}%`,
                  border: '2px dashed var(--primary-color)',
                  background: 'rgba(0,161,155,0.12)'
                }} />
              </div>

              {/* Slider Inputs for Margins */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Top Margin</span>
                    <span>{cropMargins.top}%</span>
                  </div>
                  <input
                    type="range" min="0" max="45" value={cropMargins.top}
                    onChange={(e) => setCropMargins(prev => ({ ...prev, top: parseInt(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Bottom Margin</span>
                    <span>{cropMargins.bottom}%</span>
                  </div>
                  <input
                    type="range" min="0" max="45" value={cropMargins.bottom}
                    onChange={(e) => setCropMargins(prev => ({ ...prev, bottom: parseInt(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Left Margin</span>
                    <span>{cropMargins.left}%</span>
                  </div>
                  <input
                    type="range" min="0" max="45" value={cropMargins.left}
                    onChange={(e) => setCropMargins(prev => ({ ...prev, left: parseInt(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Right Margin</span>
                    <span>{cropMargins.right}%</span>
                  </div>
                  <input
                    type="range" min="0" max="45" value={cropMargins.right}
                    onChange={(e) => setCropMargins(prev => ({ ...prev, right: parseInt(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Crop Controls */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setCroppingPage(null)}
                  style={{
                    padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--glass-border)',
                    background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveCrop}
                  style={{
                    padding: '8px 16px', borderRadius: '6px', border: 'none',
                    background: 'var(--primary-color)', color: '#fff', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Apply Crop Box
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
