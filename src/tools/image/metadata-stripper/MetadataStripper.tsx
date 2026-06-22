'use client';

import React, { useState } from 'react';
import { Upload, ShieldCheck, Download, Trash2, Image as ImageIcon, CheckCircle } from 'lucide-react';

export default function MetadataStripper() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [strippedUrl, setStrippedUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    originalSize: string;
    cleanedSize?: string;
  } | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG or PNG).');
      return;
    }
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStrippedUrl('');
    setFileDetails({
      name: file.name,
      originalSize: formatSize(file.size),
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const stripMetadata = () => {
    if (!selectedFile || !previewUrl) return;

    setLoading(true);

    const img = new Image();
    img.src = previewUrl;

    img.onload = () => {
      // Create off-screen canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setLoading(false);
        alert('Could not initialize image processing canvas.');
        return;
      }

      // Draw image onto canvas. This discards any meta tags/EXIF properties!
      ctx.drawImage(img, 0, 0);

      // Determine output format (default to JPEG for photographic metadata compression)
      const outputType = selectedFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = 0.95; // Retain premium quality

      canvas.toBlob((blob) => {
        if (blob) {
          const stripped = URL.createObjectURL(blob);
          setStrippedUrl(stripped);
          setFileDetails((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              cleanedSize: formatSize(blob.size),
            };
          });
        }
        setLoading(false);
      }, outputType, quality);
    };

    img.onerror = () => {
      setLoading(false);
      alert('Error loading image onto canvas cleaner.');
    };
  };

  const clearAll = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setStrippedUrl('');
    setFileDetails(null);
  };

  const downloadCleanImage = () => {
    if (!strippedUrl || !selectedFile) return;

    const link = document.createElement('a');
    // Append '-stripped' before the file extension
    const dotIndex = selectedFile.name.lastIndexOf('.');
    const cleanName = dotIndex !== -1 
      ? selectedFile.name.substring(0, dotIndex) + '_stripped' + selectedFile.name.substring(dotIndex)
      : selectedFile.name + '_stripped.jpg';

    link.download = cleanName;
    link.href = strippedUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '750px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        EXIF & Metadata Stripper
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Protect your privacy by scrubbing EXIF tags, device information, GPS locations, and camera details from your photos 100% locally.
      </p>

      {/* Upload Zone / Preview Panel */}
      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            border: '2px dashed var(--glass-border)',
            borderRadius: '15px',
            padding: '40px 20px',
            textAlign: 'center',
            background: 'rgba(0,0,0,0.01)',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
          onClick={() => document.getElementById('image-upload-input')?.click()}
        >
          <input
            id="image-upload-input"
            type="file"
            accept="image/jpeg, image/png, image/jpg"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Upload size={40} style={{ color: 'var(--primary-color)', opacity: 0.8, marginBottom: '15px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Drag & Drop Image Here</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>
            Supports JPEG, JPG, and PNG images
          </p>
          <button className="btn btn-secondary" style={{ pointerEvents: 'none' }}>
            Browse Files
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* File summary bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            background: 'rgba(0,0,0,0.02)',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <ImageIcon size={18} color="var(--primary-color)" style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {fileDetails?.name}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                ({fileDetails?.originalSize})
              </span>
            </div>
            <button
              onClick={clearAll}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--error-color)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <Trash2 size={15} /> Remove
            </button>
          </div>

          {/* Double Preview Section (Comparison) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px'
          }}>
            {/* Original Preview */}
            <div style={{ textAlign: 'center' }}>
              <h5 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                Original Image
              </h5>
              <div style={{
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                padding: '10px',
                background: 'var(--glass-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '240px',
                overflow: 'hidden'
              }}>
                <img
                  src={previewUrl}
                  alt="Original preview"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
                />
              </div>
            </div>

            {/* Stripped Clean Image Preview */}
            <div style={{ textAlign: 'center' }}>
              <h5 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px', color: 'var(--primary-color)' }}>
                {strippedUrl ? 'Cleaned Image (Metadata Free)' : 'Processing Preview'}
              </h5>
              <div style={{
                borderRadius: '12px',
                border: strippedUrl ? '2px solid var(--primary-color)' : '1px dashed var(--glass-border)',
                padding: '10px',
                background: 'var(--glass-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '240px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {strippedUrl ? (
                  <img
                    src={strippedUrl}
                    alt="Stripped preview"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
                  />
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '20px' }}>
                    Click "Clean Photo Metadata" below to run local scrubber.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            {!strippedUrl ? (
              <button
                onClick={stripMetadata}
                disabled={loading}
                className="btn"
                style={{ minWidth: '220px' }}
              >
                {loading ? 'Processing...' : (
                  <>
                    <ShieldCheck size={18} /> Clean Photo Metadata
                  </>
                )}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--success-color)',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}>
                  <CheckCircle size={18} /> Cleaned successfully! Local file size: {fileDetails?.cleanedSize}
                </div>
                <button
                  onClick={downloadCleanImage}
                  className="btn"
                  style={{ minWidth: '220px' }}
                >
                  <Download size={18} /> Download Clean Photo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safety Banner */}
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
        <ShieldCheck size={18} color="var(--primary-color)" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          <strong>Privacy Preserved:</strong> All operations occur entirely inside your browser sandbox. The picture is loaded into HTML5 canvas pixels and exported locally, making it mathematically impossible for GPS coordinates, EXIF keywords, or camera IDs to survive.
        </div>
      </div>
    </div>
  );
}
