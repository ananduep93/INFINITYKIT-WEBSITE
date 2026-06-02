'use client';

import React from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function PDFToWord() {
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

  const handleConvertToWord = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a PDF file.');
    }

    const file = files[0];
    
    // 1. Parse text from PDF.js
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    const pagesText: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      pagesText.push(pageText);
    }

    // 2. Generate Docx using 'docx' library client-side
    const { Document, Packer, Paragraph, TextRun, PageBreak } = await import('docx');

    const children: any[] = [];
    pagesText.forEach((text, index) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `--- Page ${index + 1} ---`,
              bold: true,
              size: 24,
            }),
          ],
        })
      );
      children.push(new Paragraph({ text: '' })); // Spacing

      // Split text into paragraphs by visual segments if any, or just add
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: text || '[Empty Page]',
              size: 22,
            }),
          ],
        })
      );

      // Add page break if it's not the last page
      if (index < pagesText.length - 1) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      }
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    const docBlob = await Packer.toBlob(doc);
    const downloadUrl = URL.createObjectURL(docBlob);

    return {
      downloadUrl,
      fileName: `${file.name.replace(/\.pdf$/i, '')}.docx`,
      resultData: `Successfully converted "${file.name}" to Microsoft Word docx format containing ${numPages} page(s).`
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Convert PDF to Word (.docx)
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Scrape text layouts and compile them into fully editable Microsoft Word documents 100% locally.
      </p>

      <ToolWorkspace
        toolId="pdf-to-word"
        accept="application/pdf"
        maxFiles={1}
        onProcess={handleConvertToWord}
        actionButtonText="Convert to Word"
        instructions={[
          'Upload the PDF document you want to edit in Microsoft Word.',
          'Wait for client-side character scanning and structure mapping to compile.',
          'Download your finished fully editable Word (.docx) document.'
        ]}
      />
    </div>
  );
}
