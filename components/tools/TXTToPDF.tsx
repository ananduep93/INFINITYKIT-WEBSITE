'use client';

import React from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function TXTToPDF() {
  const handleConvertToPDF = async (files: File[], textInput?: string) => {
    let plainText = '';
    let docName = 'infinitykit_text_export.pdf';

    if (files.length > 0) {
      const file = files[0];
      plainText = await file.text();
      docName = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
    } else if (textInput && textInput.trim()) {
      plainText = textInput;
    } else {
      throw new Error('Please upload a TXT file or enter plain text in the prompt box.');
    }

    if (!plainText.trim()) {
      throw new Error('Text input cannot be empty.');
    }

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageLines = doc.splitTextToSize(plainText, 175);
    
    let y = 20;
    pageLines.forEach((line: string) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 15, y);
      y += 7;
    });

    const pdfBlob = doc.output('blob');
    const downloadUrl = URL.createObjectURL(pdfBlob);

    return {
      downloadUrl,
      fileName: docName,
      resultData: `Successfully compiled plaintext characters to a ${doc.getNumberOfPages()} page PDF document.`
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Convert Text to PDF
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Convert plain text files (.txt) or typed paragraphs into structured, printable PDF files locally in your browser.
      </p>

      <ToolWorkspace
        toolId="txt-to-pdf"
        accept=".txt"
        maxFiles={1}
        hasText={true}
        textLabel="Or Enter Plain Text"
        textPlaceholder="Type or paste document text contents here..."
        onProcess={handleConvertToPDF}
        actionButtonText="Convert to PDF"
        instructions={[
          'Upload a TXT file OR type/paste text directly into the input container.',
          'Wait for client-side compiler engines to format paragraph wrapping boundaries.',
          'Download the completed PDF document.'
        ]}
      />
    </div>
  );
}
