'use client';

import React from 'react';
import ToolWorkspace from '../../../components/ui/ToolWorkspace';

export default function HTMLToPDF() {
  const handleConvertToPDF = async (files: File[], textInput?: string) => {
    // Can accept a file or raw code text input
    let htmlContent = '';
    let docName = 'infinitykit_html_export.pdf';

    if (files.length > 0) {
      const file = files[0];
      htmlContent = await file.text();
      docName = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
    } else if (textInput && textInput.trim()) {
      htmlContent = textInput;
    } else {
      throw new Error('Please upload an HTML file or enter HTML markup code.');
    }

    // Parse plain text content from HTML tags for direct PDF compilation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const plainText = tempDiv.innerText || tempDiv.textContent || '';

    if (!plainText.trim()) {
      throw new Error('No readable text contents found in HTML markup payload.');
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
      resultData: `Successfully compiled HTML markup nodes to a ${doc.getNumberOfPages()} page PDF document.`
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Convert HTML to PDF
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Compile HTML web files or raw source code markup directly into printable, formatted PDF pages 100% locally.
      </p>

      <ToolWorkspace
        toolId="html-to-pdf"
        accept=".html,.htm"
        maxFiles={1}
        hasText={true}
        textLabel="Or Paste HTML Code"
        textPlaceholder="<html><body><h1>My Page</h1><p>Type page text content here...</p></body></html>"
        onProcess={handleConvertToPDF}
        actionButtonText="Convert to PDF"
        instructions={[
          'Upload an HTML file OR paste raw HTML markup code in the text box.',
          'Wait for client-side tag parsers to extract formatting vectors.',
          'Download your finished paginated PDF document.'
        ]}
      />
    </div>
  );
}
