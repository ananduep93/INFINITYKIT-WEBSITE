'use client';

import React from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';
import { getPdfJs, getTextItems, groupItemsIntoLines, linesToPlainText } from '../../lib/pdfjs';

export default function PDFToTXT() {
  const handleConvertToTXT = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a PDF file.');
    }

    const file = files[0];
    const pdfjsLib = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const items = getTextItems(textContent);
      const lines = groupItemsIntoLines(items);
      const pageText = linesToPlainText(lines);

      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    if (!fullText.trim()) {
      throw new Error('No readable text layers found in PDF.');
    }

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      fileName: `${file.name.replace(/\.pdf$/i, '')}.txt`,
      resultData: fullText
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Convert PDF to Plain Text (.txt)
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Scrape text characters from all PDF document page levels and download as raw TXT 100% locally.
      </p>

      <ToolWorkspace
        toolId="pdf-to-txt"
        accept="application/pdf"
        maxFiles={1}
        onProcess={handleConvertToTXT}
        actionButtonText="Convert to Text"
        instructions={[
          'Upload your PDF file.',
          'Wait for client-side text extractor modules to parse all page layouts.',
          'Download the completed plain text file.'
        ]}
      />
    </div>
  );
}
