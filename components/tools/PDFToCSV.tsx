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
      
      const mappedItems = items.map((item: any) => ({
        str: item.str.trim(),
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height,
      })).filter(item => item.str !== '');

      const lines: { y: number; height: number; items: typeof mappedItems }[] = [];
      for (const item of mappedItems) {
        let foundLine = lines.find(line => Math.abs(line.y - item.y) < Math.max(item.height * 0.7, 5));
        if (foundLine) {
          foundLine.items.push(item);
        } else {
          lines.push({
            y: item.y,
            height: item.height,
            items: [item]
          });
        }
      }

      // Sort lines by Y descending (top to bottom)
      lines.sort((a, b) => b.y - a.y);

      // Sort items within each line by X ascending (left to right)
      for (const line of lines) {
        line.items.sort((a, b) => a.x - b.x);
        const currentRow = line.items.map(item => {
          const text = item.str;
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
