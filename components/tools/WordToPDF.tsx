'use client';

import React from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function WordToPDF() {
  const handleConvertToPDF = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a Word file.');
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();

    // 1. Extract text from docx using mammoth
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    if (!text.trim()) {
      throw new Error('No readable text content found in the Word file.');
    }

    // 2. Format paragraphs and render PDF page layouts using jsPDF
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Set properties
    doc.setProperties({
      title: file.name.replace(/\.[^/.]+$/, ''),
      creator: 'InfinityKit'
    });

    const pageLines = doc.splitTextToSize(text, 175);
    
    let y = 20;
    pageLines.forEach((line: string) => {
      // Handle page overflow
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
      fileName: `${file.name.replace(/\.(docx|doc)$/i, '')}.pdf`,
      resultData: `Successfully converted "${file.name}" to PDF document layout with ${doc.getNumberOfPages()} page(s).`
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Convert Word to PDF (.docx)
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Parse Microsoft Word documents locally and compile clean paginated PDF files in-browser.
      </p>

      <ToolWorkspace
        toolId="word-to-pdf"
        accept=".docx,.doc"
        maxFiles={1}
        onProcess={handleConvertToPDF}
        actionButtonText="Convert to PDF"
        instructions={[
          'Upload your Word (.docx) document.',
          'Wait for client-side text parsing and styling grids to initialize.',
          'Download the compiled high-quality PDF document.'
        ]}
      />
    </div>
  );
}
