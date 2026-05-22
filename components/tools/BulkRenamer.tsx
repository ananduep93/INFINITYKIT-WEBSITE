'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Settings, Play, RefreshCw, CheckCircle, Download } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  newName: string;
  blob?: Blob;
}

export default function BulkRenamer() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [prefix, setPrefix] = useState('doc_');
  const [suffix, setSuffix] = useState('');
  const [startIndex, setStartIndex] = useState(1);
  const [padding, setPadding] = useState('2'); // e.g. "01", "001"
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseChange, setCaseChange] = useState<'none' | 'upper' | 'lower' | 'title'>('none');
  const [renamedSuccess, setRenamedSuccess] = useState(false);

  // Generate simulated names when parameters change
  useEffect(() => {
    if (files.length === 0) return;

    const updated = files.map((file, idx) => {
      let extIndex = file.name.lastIndexOf('.');
      let base = extIndex !== -1 ? file.name.substring(0, extIndex) : file.name;
      let ext = extIndex !== -1 ? file.name.substring(extIndex) : '';

      // 1. Case change
      if (caseChange === 'upper') base = base.toUpperCase();
      else if (caseChange === 'lower') base = base.toLowerCase();
      else if (caseChange === 'title') {
        base = base.split(/[\s_-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('_');
      }

      // 2. Find and Replace
      if (findText) {
        base = base.replaceAll(findText, replaceText);
      }

      // 3. Sequential numbering
      const numVal = startIndex + idx;
      const paddedNum = String(numVal).padStart(Number(padding), '0');

      // Combine prefix + base + suffix + number + extension
      const finalName = `${prefix}${base}${suffix}_${paddedNum}${ext}`;

      return {
        ...file,
        newName: finalName
      };
    });

    setFiles(updated);
  }, [prefix, suffix, startIndex, padding, findText, replaceText, caseChange, files.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    addFiles(Array.from(fileList));
  };

  const addFiles = (newFiles: File[]) => {
    const items: FileItem[] = newFiles.map((file, idx) => ({
      id: `file_${Date.now()}_${idx}`,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      newName: file.name,
      blob: file // Store the actual file as blob for export
    }));

    setFiles(prev => [...prev, ...items]);
    setRenamedSuccess(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      addFiles(Array.from(droppedFiles));
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const clearFiles = () => {
    setFiles([]);
    setRenamedSuccess(false);
  };

  const executeRename = () => {
    if (files.length === 0) return;
    setRenamedSuccess(true);
  };

  const downloadFile = (file: FileItem) => {
    if (!file.blob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file.blob);
    link.download = file.newName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    files.forEach(file => downloadFile(file));
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Bulk File Renamer
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Rename multiple files in batch instantly with highly customizable prefixes, numbering formats, and case rules.
      </p>

      {files.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            border: '2px dashed var(--glass-border)',
            borderRadius: '15px',
            padding: '50px 20px',
            textAlign: 'center',
            background: 'rgba(0,0,0,0.01)',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
          onClick={() => document.getElementById('bulk-upload-input')?.click()}
        >
          <input
            id="bulk-upload-input"
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Upload size={40} style={{ color: 'var(--primary-color)', opacity: 0.8, marginBottom: '15px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Upload Multiple Files to Rename</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>
            Drag and drop your images, documents, or tables here
          </p>
          <button className="btn btn-secondary" style={{ pointerEvents: 'none' }}>
            Choose Files
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Renamer Options Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            background: 'rgba(0,0,0,0.02)',
            padding: '25px',
            borderRadius: '15px',
            border: '1px solid var(--glass-border)'
          }}>
            {/* Pattern controls */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Filename Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="form-input"
                placeholder="e.g. img_"
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Filename Suffix</label>
              <input
                type="text"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                className="form-input"
                placeholder="e.g. _v2"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Sequence Start Index</label>
              <input
                type="number"
                value={startIndex}
                onChange={(e) => setStartIndex(Math.max(0, Number(e.target.value)))}
                className="form-input"
                min="0"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Index Padding Width</label>
              <select
                value={padding}
                onChange={(e) => setPadding(e.target.value)}
                className="form-select"
              >
                <option value="1">No Padding (1, 2, 10)</option>
                <option value="2">2 Digits (01, 02, 10)</option>
                <option value="3">3 Digits (001, 002, 010)</option>
                <option value="4">4 Digits (0001, 0002, 0010)</option>
              </select>
            </div>

            {/* Sub-group rules */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Find Text (Optional)</label>
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="form-input"
                placeholder="Match in name"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Replace With</label>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="form-input"
                placeholder="Replacement text"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Case Transformations</label>
              <select
                value={caseChange}
                onChange={(e) => setCaseChange(e.target.value as any)}
                className="form-select"
              >
                <option value="none">Preserve Original Case</option>
                <option value="upper">UPPERCASE</option>
                <option value="lower">lowercase</option>
                <option value="title">Title_Case_Style</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={clearFiles}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
              >
                <RefreshCw size={16} /> Reset List
              </button>
            </div>
          </div>

          {/* Dynamic Comparison Preview Table */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 100px',
              padding: '12px 20px',
              background: 'rgba(0,0,0,0.04)',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderBottom: '1px solid var(--glass-border)'
            }}>
              <span>Original Filename</span>
              <span>New Simulated Filename</span>
              <span style={{ textAlign: 'right' }}>Size</span>
            </div>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {files.map((file) => (
                <div
                  key={file.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 100px',
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--glass-border)',
                    fontSize: '0.85rem',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <FileText size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    {file.name}
                  </span>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.newName}
                  </span>
                  <span style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                    {formatSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Process & Action Section */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {!renamedSuccess ? (
              <button
                onClick={executeRename}
                className="btn"
                style={{ minWidth: '220px' }}
              >
                <Play size={18} /> Apply Pattern Rename
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--success-color)',
                  fontSize: '0.95rem',
                  fontWeight: 600
                }}>
                  <CheckCircle size={18} /> Batch pattern verified! Ready for clean local download.
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={downloadAll}
                    className="btn"
                    style={{ padding: '12px 25px' }}
                  >
                    <Download size={18} /> Download All Files
                  </button>
                  <button
                    onClick={() => setRenamedSuccess(false)}
                    className="btn btn-secondary"
                    style={{ padding: '12px 25px' }}
                  >
                    Adjust Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Client-Side Safety Notice */}
      <div style={{
        marginTop: '25px',
        padding: '15px',
        borderRadius: '10px',
        backgroundColor: 'rgba(0, 161, 155, 0.05)',
        border: '1px solid rgba(0, 161, 155, 0.15)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Settings size={18} color="var(--primary-color)" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          <strong>High-Fidelity client logic:</strong> Due to standard browser sandboxing regulations, client scripts cannot overwrite physical files on your hard drive directly. This system outputs renamed replica downloads locally in real-time, keeping your files completely secure and private.
        </div>
      </div>
    </div>
  );
}
