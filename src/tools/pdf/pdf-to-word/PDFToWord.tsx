'use client';

import React, { useState } from 'react';
import ToolWorkspace from '../../../components/ui/ToolWorkspace';
import { convertPdfToWord } from '../../../lib/pdfToWordEngine';

export default function PDFToWord() {
  const [progress, setProgress] = useState<string>('');
  const [useOcr, setUseOcr] = useState<boolean>(false);

  const handleConvertToWord = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a PDF file.');
    }

    setProgress('Initializing Advanced Conversion Engine...');

    try {
      const result = await convertPdfToWord({
        file: files[0],
        useOcr,
        onProgress: (msg) => setProgress(msg)
      });
      setProgress('');
      return result;
    } catch (e: any) {
      setProgress('');
      throw new Error(`Conversion failed: ${e.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Advanced PDF to Word (.docx)
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
        High-fidelity layout reconstruction using advanced block grouping and optional OCR scanning.
      </p>

      <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input 
          type="checkbox" 
          id="useOcrToggle" 
          checked={useOcr} 
          onChange={(e) => setUseOcr(e.target.checked)}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
        <label htmlFor="useOcrToggle" style={{ fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-color)' }}>
          <strong>Enable OCR for scanned pages</strong> <br/>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(Intensive process, takes longer)</span>
        </label>
      </div>

      {progress && (
        <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginBottom: '12px', fontStyle: 'italic' }}>
          {progress}
        </p>
      )}

      <ToolWorkspace
        toolId="pdf-to-word"
        accept="application/pdf"
        maxFiles={1}
        onProcess={handleConvertToWord}
        actionButtonText="Convert to Word"
        instructions={[
          'Upload your PDF document.',
          'Our engine reconstructs tables, images, and text formats locally.',
          'Download your heavily preserved Word document.',
        ]}
      />
    </div>
  );
}
