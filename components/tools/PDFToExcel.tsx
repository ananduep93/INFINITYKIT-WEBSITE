'use client';

import React from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function PDFToExcel() {
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

  const handleConvertToExcel = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a PDF file.');
    }

    const file = files[0];
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    let htmlTable = '<table>';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Coordinate-based line grouping
      const items = textContent.items as any[];
      items.sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);
      
      let currentY = -1;
      let currentRow: string[] = [];

      items.forEach((item) => {
        const y = item.transform[5];
        const text = item.str.trim();
        if (!text) return;

        // Tolerance for same line grouping
        if (currentY === -1 || Math.abs(y - currentY) < 5) {
          currentRow.push(text);
          currentY = y;
        } else {
          // Output previous row
          htmlTable += '<tr>' + currentRow.map(col => `<td>${col}</td>`).join('') + '</tr>';
          currentRow = [text];
          currentY = y;
        }
      });
      if (currentRow.length > 0) {
        htmlTable += '<tr>' + currentRow.map(col => `<td>${col}</td>`).join('') + '</tr>';
      }
    }
    
    htmlTable += '</table>';

    // Package as XLS HTML format readable directly by Excel
    const xlsTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
      <body>${htmlTable}</body>
      </html>
    `;

    const blob = new Blob([xlsTemplate], { type: 'application/vnd.ms-excel' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      fileName: `${file.name.replace(/\.pdf$/i, '')}.xls`,
      resultData: `Successfully extracted grid coordinates and compiled Excel worksheet format with ${numPages} page(s).`
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Convert PDF to Excel (.xls)
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Extract tables and structured coordinate grids from PDF documents into Excel spreadsheets 100% locally.
      </p>

      <ToolWorkspace
        toolId="pdf-to-excel"
        accept="application/pdf"
        maxFiles={1}
        onProcess={handleConvertToExcel}
        actionButtonText="Convert to Excel"
        instructions={[
          'Upload your PDF file containing tabular data tables.',
          'Wait for coordinate text grouping algorithms to map grid cells client-side.',
          'Download the compiled Excel-ready Spreadsheet file.'
        ]}
      />
    </div>
  );
}
