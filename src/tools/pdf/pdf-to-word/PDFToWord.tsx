'use client';

import React, { useState } from 'react';
import ToolWorkspace from '../../../components/ui/ToolWorkspace';
import { convertPdfToWord, ConversionMode } from '../../../lib/pdfToWordEngine';

export default function PDFToWord() {
  const [progress, setProgress] = useState<string>('');
  const [mode, setMode] = useState<ConversionMode>('visual');
  const [useOcr, setUseOcr] = useState<boolean>(false);

  const handleConvertToWord = async (files: File[]) => {
    if (files.length === 0) throw new Error('Please upload a PDF file.');

    setProgress('Initializing conversion engine…');
    try {
      const result = await convertPdfToWord({
        file: files[0],
        mode,
        useOcr,
        onProgress: (msg) => setProgress(msg),
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
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
        Convert your PDF to a Word document. Choose between pixel-perfect visual output or editable text.
      </p>

      {/* Mode selector */}
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-color)' }}>
          Conversion Mode
        </p>

        {/* Visual fidelity option */}
        <label
          htmlFor="modeVisual"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer',
            padding: '12px 16px', borderRadius: '10px',
            border: `2px solid ${mode === 'visual' ? 'var(--accent)' : 'var(--border-color, rgba(255,255,255,0.1))'}`,
            background: mode === 'visual' ? 'rgba(var(--accent-rgb, 99,102,241), 0.08)' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          <input
            type="radio"
            id="modeVisual"
            name="conversionMode"
            value="visual"
            checked={mode === 'visual'}
            onChange={() => setMode('visual')}
            style={{ marginTop: '3px', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-color)' }}>
              🖼️ Visual Fidelity (Recommended)
            </span>
            <br />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Each page is rendered as a high-resolution image. Looks identical to the original PDF.
              Text is not editable but layout is perfectly preserved.
            </span>
          </div>
        </label>

        {/* Editable text option */}
        <label
          htmlFor="modeEditable"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer',
            padding: '12px 16px', borderRadius: '10px',
            border: `2px solid ${mode === 'editable' ? 'var(--accent)' : 'var(--border-color, rgba(255,255,255,0.1))'}`,
            background: mode === 'editable' ? 'rgba(var(--accent-rgb, 99,102,241), 0.08)' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          <input
            type="radio"
            id="modeEditable"
            name="conversionMode"
            value="editable"
            checked={mode === 'editable'}
            onChange={() => setMode('editable')}
            style={{ marginTop: '3px', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-color)' }}>
              ✏️ Editable Text
            </span>
            <br />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Text, headings, tables and images are extracted and reconstructed.
              Content is editable but complex layouts may not match exactly.
            </span>
          </div>
        </label>

        {/* OCR toggle — only shown in editable mode */}
        {mode === 'editable' && (
          <label
            htmlFor="useOcrToggle"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
              padding: '10px 16px', marginLeft: '16px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            <input
              type="checkbox"
              id="useOcrToggle"
              checked={useOcr}
              onChange={(e) => setUseOcr(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
            />
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)' }}>
                Enable OCR for scanned pages
              </span>
              <br />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Use when the PDF is a scan or contains no selectable text. Takes longer.
              </span>
            </div>
          </label>
        )}
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
          mode === 'visual'
            ? 'Visual mode: each page is rendered as a high-res image — looks identical to the PDF.'
            : 'Editable mode: text, headings, images and tables are extracted and reconstructed.',
          'Upload your PDF and click Convert to Word.',
          'Download your Word document instantly.',
        ]}
      />
    </div>
  );
}
