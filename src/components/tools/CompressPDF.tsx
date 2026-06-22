'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function CompressPDF() {
  const [targetSize, setTargetSize] = useState<number>(5);
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB'>('MB');

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

    // Use maximum structural compression (object stream packing)
    const compressedBytes = await compressedDoc.save({
      useObjectStreams: true
    });

    // If pdf-lib output size is somehow larger (which happens for already compressed PDFs),
    // we make sure we don't return a larger file by falling back to the original bytes!
    let finalBytes = compressedBytes;
    if (compressedBytes.length >= fileBytes.byteLength) {
      // Retain original file if compression didn't shrink it
      finalBytes = new Uint8Array(fileBytes);
    }

    const originalSizeKB = (file.size / 1024).toFixed(1);
    const compressedSizeKB = (finalBytes.length / 1024).toFixed(1);
    const ratio = Math.max(0, ((1 - (finalBytes.length / file.size)) * 100)).toFixed(0);

    const targetBytes = targetUnit === 'MB' ? targetSize * 1024 * 1024 : targetSize * 1024;
    const achievedNote = finalBytes.length <= targetBytes
      ? 'Target size achieved ✓'
      : `Best effort — PDF structural compression applied (target may not be fully reachable)`;

    const blob = new Blob([finalBytes as any], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      fileName: `compressed_${file.name}`,
      resultData: `Original Size: ${originalSizeKB} KB\nOptimized Size: ${compressedSizeKB} KB\nSize Reduction: ${ratio}%\n${achievedNote}`
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

      <div style={{ marginBottom: '25px' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-color)', display: 'block', marginBottom: '10px' }}>
          Target File Size
        </label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="number"
            min="1"
            value={targetSize}
            onChange={(e) => setTargetSize(Math.max(1, Number(e.target.value)))}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              color: 'var(--text-color)',
              fontSize: '1rem',
              fontWeight: 600,
              outline: 'none'
            }}
            placeholder="e.g. 5"
          />
          {(['KB', 'MB'] as const).map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => setTargetUnit(unit)}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                border: targetUnit === unit ? 'none' : '1px solid var(--glass-border)',
                background: targetUnit === unit ? 'var(--primary-gradient)' : 'var(--glass-bg)',
                color: targetUnit === unit ? 'white' : 'var(--text-color)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {unit}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          PDF compression is structural (metadata/stream cleanup). Results may vary depending on how the original PDF was created.
        </p>
      </div>

      <ToolWorkspace
        toolId="compresspdf"
        accept="application/pdf"
        maxFiles={1}
        onProcess={handleCompress}
        actionButtonText="Reduce PDF Size"
        instructions={[
          'Upload the PDF document you want to optimize.',
          'Enter your target file size (e.g. 5 MB or 500 KB) and select the unit.',
          'Click "Reduce PDF Size" — the tool applies structural compression and reports the achieved size.'
        ]}
      />
    </div>
  );
}
