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
    
    // 2. Generate Docx using 'docx' library client-side
    const { Document, Packer, Paragraph, TextRun, PageBreak } = await import('docx');

    const children: any[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items as any[];

      // Group items on this page into lines using Y coordinate tolerance
      const mappedItems = items.map((item: any) => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height,
      }));

      const lines: { y: number; height: number; items: typeof mappedItems }[] = [];
      for (const item of mappedItems) {
        let foundLine = lines.find(line => Math.abs(line.y - item.y) < Math.max(item.height * 0.7, 4));
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
      }

      // Add a visual page indicator in the Word document
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `--- Page ${i} ---`,
              bold: true,
              size: 24,
            }),
          ],
        })
      );
      children.push(new Paragraph({ text: '' })); // Spacing

      // Build paragraphs from lines
      let currentParagraphRuns: any[] = [];
      let lastY = -1;
      let lastLineHeight = 12;

      for (let l = 0; l < lines.length; l++) {
        const line = lines[l];
        let lineText = '';
        let lastX = -1;
        let maxItemHeight = line.height;

        for (const item of line.items) {
          if (lastX !== -1) {
            const gap = item.x - lastX;
            // Estimate spaces to add based on average character width
            const spaceCharWidth = Math.max(item.height * 0.25, 3);
            if (gap > spaceCharWidth) {
              const numSpaces = Math.min(Math.round(gap / spaceCharWidth), 20);
              lineText += ' '.repeat(numSpaces);
            }
          }
          lineText += item.str;
          lastX = item.x + item.width;
          if (item.height > maxItemHeight) {
            maxItemHeight = item.height;
          }
        }

        // Determine if we should start a new paragraph
        if (lastY !== -1) {
          const verticalGap = lastY - line.y;
          // If vertical gap is larger than 1.8x line height, start a new paragraph
          if (verticalGap > lastLineHeight * 1.8) {
            if (currentParagraphRuns.length > 0) {
              children.push(new Paragraph({ children: currentParagraphRuns }));
              currentParagraphRuns = [];
            }
            // Add blank paragraphs for proportional vertical spacing
            const emptyParagraphsCount = Math.min(Math.floor(verticalGap / (lastLineHeight * 2.5)), 4);
            for (let ep = 0; ep < emptyParagraphsCount; ep++) {
              children.push(new Paragraph({ text: '' }));
            }
          } else {
            // Append line break to keep it in the same paragraph
            currentParagraphRuns.push(new TextRun({ break: 1 }));
          }
        }

        // Add line text
        const docxSize = Math.round(maxItemHeight * 2);
        currentParagraphRuns.push(
          new TextRun({
            text: lineText,
            size: docxSize > 0 ? docxSize : 22,
          })
        );

        lastY = line.y;
        lastLineHeight = maxItemHeight;
      }

      if (currentParagraphRuns.length > 0) {
        children.push(new Paragraph({ children: currentParagraphRuns }));
      }

      // Add a page break at the end of each page, except the last one
      if (i < numPages) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      }
    }

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
