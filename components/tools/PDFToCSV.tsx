'use client';

import React from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function PDFToCSV() {
  const loadPdfJs = () => {
    return new Promise<any>((resolve, reject) => {
      if (typeof window === 'undefined') return reject(new Error('Browser environment required.'));
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js engine.'));
      document.head.appendChild(script);
    });
  };

  const handleConvertToCSV = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a PDF file.');
    }

    const file = files[0];
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    let csvContent = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const items = textContent.items as any[];
      // Sort vertically then horizontally
      items.sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);
      
      let currentY = -1;
      let currentRow: string[] = [];

      items.forEach((item) => {
        const y = item.transform[5];
        const text = item.str.trim();
        if (!text) return;

        if (currentY === -1 || Math.abs(y - currentY) < 5) {
          // Escape commas in fields
          const escaped = text.includes(',') ? `"${text.replace(/"/g, '""')}"` : text;
          currentRow.push(escaped);
          currentY = y;
        } else {
          csvContent += currentRow.join(',') + '\n';
          const escaped = text.includes(',') ? `"${text.replace(/"/g, '""')}"` : text;
          currentRow = [escaped];
          currentY = y;
        }
      });
      if (currentRow.length > 0) {
        csvContent += currentRow.join(',') + '\n';
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
