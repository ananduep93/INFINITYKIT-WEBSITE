'use client';

import React from 'react';
import ToolWorkspace from '../../../components/ui/ToolWorkspace';

export default function EPUBToPDF() {
  const loadJSZip = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).JSZip) {
        resolve((window as any).JSZip);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => resolve((window as any).JSZip);
      script.onerror = () => reject(new Error('Failed to load ZIP compressor.'));
      document.body.appendChild(script);
    });
  };

  const handleConvertToPDF = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload an EPUB file.');
    }

    const file = files[0];
    const JSZip = await loadJSZip();
    const arrayBuffer = await file.arrayBuffer();

    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Find all xhtml files inside zip
    const xhtmlFiles = Object.keys(zip.files).filter(
      (path) => path.endsWith('.xhtml') || path.endsWith('.html')
    );

    if (xhtmlFiles.length === 0) {
      throw new Error('No XHTML page files could be detected inside this EPUB archive.');
    }

    // Sort files alphabetically to preserve book structure order
    xhtmlFiles.sort();

    let fullPlaintext = '';

    for (const path of xhtmlFiles) {
      const content = await zip.files[path].async('string');
      // Simple parser to extract raw text content from html tags
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const text = tempDiv.innerText || tempDiv.textContent || '';
      fullPlaintext += `\n\n--- Page Section ---\n\n` + text.trim();
    }

    if (!fullPlaintext.trim()) {
      throw new Error('No readable text content found in EPUB.');
    }

    // Compile text to PDF using jsPDF
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageLines = doc.splitTextToSize(fullPlaintext, 175);
    
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
      fileName: `${file.name.replace(/\.epub$/i, '')}.pdf`,
      resultData: `Successfully parsed ${xhtmlFiles.length} xhtml sections from EPUB and compiled into a ${doc.getNumberOfPages()} page PDF document.`
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Convert EPUB Ebook to PDF
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Decompress EPUB archives, extract formatted XHTML content streams, and render to PDF pages 100% locally.
      </p>

      <ToolWorkspace
        toolId="epub-to-pdf"
        accept=".epub"
        maxFiles={1}
        onProcess={handleConvertToPDF}
        actionButtonText="Convert to PDF"
        instructions={[
          'Upload your EPUB ebook file.',
          'Wait for client-side archive decompression and section parsing.',
          'Download the compiled PDF document.'
        ]}
      />
    </div>
  );
}
