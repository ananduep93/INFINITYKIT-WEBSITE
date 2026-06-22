'use client';

import React from 'react';
import ToolWorkspace from '../../../components/ui/ToolWorkspace';
import { getPdfJs, getTextItems, groupItemsIntoLines } from '../../../lib/pdfjs';

export default function PDFToCSV() {
  const handleConvertToCSV = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a PDF file.');
    }

    const file = files[0];
    const pdfjsLib = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    let csvContent = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const items = getTextItems(textContent).filter(item => item.str.trim() !== '');
      const lines = groupItemsIntoLines(items);

      for (const line of lines) {
        const currentRow = line.items.map(item => {
          const text = item.str.trim();
          return text.includes(',') ? `"${text.replace(/"/g, '""')}"` : text;
        });
        if (currentRow.length > 0) {
          csvContent += currentRow.join(',') + '\n';
        }
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      fileName: `${file.name.replace(/\.pdf$/i, '')}.csv`,
      resultData: csvContent
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Convert PDF to CSV (.csv)
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Parse rows and cells from PDF page tables and export structured Comma-Separated Values 100% locally.
      </p>

      <ToolWorkspace
        toolId="pdf-to-csv"
        accept="application/pdf"
        maxFiles={1}
        onProcess={handleConvertToCSV}
        actionButtonText="Convert to CSV"
        instructions={[
          'Upload the PDF file containing table grids.',
          'Wait for client-side sorting and row-joining blocks to complete.',
          'Download the parsed CSV data directly.'
        ]}
      />
    </div>
  );
}
