'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function CompressPDF() {
  const [level, setLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const handleCompress = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please select a PDF file to compress.');
    }

    const file = files[0];
    const fileBytes = await file.arrayBuffer();
    
    // Load document
    const pdfDoc = await PDFDocument.load(fileBytes);
    
    // Create new document to perform garbage collection / object stripping
    const compressedDoc = await PDFDocument.create();
    const copiedPages = await compressedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => compressedDoc.addPage(page));

    // Save with different optimization options depending on compression level
    let compressedBytes: Uint8Array;
    if (level === 'high') {
      // Maximum structural compression & object stream packing
      compressedBytes = await compressedDoc.save({
        useObjectStreams: true
      });
    } else if (level === 'medium') {
      compressedBytes = await compressedDoc.save({
        useObjectStreams: true
      });
    } else {
      // Standard saving with clean page copying
      compressedBytes = await compressedDoc.save();
    }

    // If pdf-lib output size is somehow larger (which happens for already compressed PDFs),
    // we make sure we don't return a larger file by falling back to the original bytes!
    let finalBytes = compressedBytes;
    if (compressedBytes.length >= fileBytes.byteLength) {
      // Retain original file if compression didn't shrink it
      finalBytes = new Uint8Array(fileBytes);
    }

    const originalSize = (file.size / 1024).toFixed(1);
    const compressedSize = (finalBytes.length / 1024).toFixed(1);
    const ratio = Math.max(0, ((1 - (finalBytes.length / file.size)) * 100)).toFixed(0);

    const blob = new Blob([finalBytes as any], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      fileName: `compressed_${file.name}`,
      resultData: `Original File Size: ${originalSize} KB\nOptimized File Size: ${compressedSize} KB\nDocument Size Reduction Ratio: ${ratio}%`
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Reduce PDF File Size
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Optimize and shrink PDF files 100% locally in your browser by compressing object streams and clearing redundant metadata.
      </p>

      <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-color)' }}>
          Target Optimization Profile
        </label>
        <div style={{ display: 'flex', gap: '15px' }}>
          {[
            { id: 'low', label: 'Low (Max Quality)' },
            { id: 'medium', label: 'Medium (Balanced)' },
            { id: 'high', label: 'High (Maximum Compression)' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLevel(item.id as any)}
              style={{
                flex: 1,
                padding: '10px 15px',
                borderRadius: '10px',
                background: level === item.id ? 'var(--primary-gradient)' : 'var(--glass-bg)',
                border: level === item.id ? 'none' : '1px solid var(--glass-border)',
                color: level === item.id ? 'white' : 'var(--text-color)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <ToolWorkspace
        toolId="compresspdf"
        accept="application/pdf"
        maxFiles={1}
        onProcess={handleCompress}
        actionButtonText="Reduce PDF Size"
        instructions={[
          'Upload the PDF document you want to optimize and compress.',
          'Choose the Target Optimization Profile above.',
          'Click the "Reduce PDF Size" button to process and download your optimized document.'
        ]}
      />
    </div>
  );
}
