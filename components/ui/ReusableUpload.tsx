import React, { useState, useRef } from 'react';
import { Upload, File, X, Image as ImageIcon } from 'lucide-react';

interface ReusableUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export const ReusableUpload: React.FC<ReusableUploadProps> = ({
  onFileSelect,
  accept = '*/*',
  maxSizeMB = 10,
  label = 'Drag and drop your file here, or click to browse'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{
        border: dragActive ? '2px dashed var(--primary-color)' : '2px dashed var(--glass-border)',
        borderRadius: '12px',
        padding: '30px 20px',
        textAlign: 'center',
        background: dragActive ? 'rgba(0, 161, 155, 0.05)' : 'rgba(0, 0, 0, 0.01)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      {selectedFile ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', objectFit: 'contain' }}
            />
          ) : (
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(0,161,155,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                color: 'var(--primary-color)'
              }}
            >
              <File size={30} />
            </div>
          )}

          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{selectedFile.name}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </div>

          <button
            onClick={clearFile}
            style={{
              marginTop: '10px',
              padding: '6px 12px',
              background: 'rgba(220,53,69,0.1)',
              color: 'var(--error-color)',
              border: 'none',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <X size={14} /> Remove File
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(0, 161, 155, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-color)'
            }}
          >
            <Upload size={28} />
          </div>
          <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-color)' }}>{label}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Supports files up to {maxSizeMB}MB
          </p>
        </div>
      )}
    </div>
  );
};
export default ReusableUpload;
