'use client';

import React from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function PDFToTXT() {
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

  const handleConvertToTXT = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a PDF file.');
    }

    const file = files[0];
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items as any[];

      // Group into lines based on Y coordinate with tolerance
      const mappedItems = items.map((item: any) => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height
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

      // Sort lines from top to bottom (Y descending)
      lines.sort((a, b) => b.y - a.y);

      // Sort items within each line by X ascending (left to right)
      for (const line of lines) {
        line.items.sort((a, b) => a.x - b.x);
      }

      let pageText = '';
      let lastY = -1;
      let lastLineHeight = 12;

      for (const line of lines) {
        let lineText = '';
        let lastX = -1;
        for (const item of line.items) {
          if (lastX !== -1) {
            const gap = item.x - lastX;
            const spaceCharWidth = Math.max(item.height * 0.25, 3);
            if (gap > spaceCharWidth) {
              const numSpaces = Math.min(Math.round(gap / spaceCharWidth), 20);
              lineText += ' '.repeat(numSpaces);
            }
          }
          lineText += item.str;
          lastX = item.x + item.width;
        }

        if (lastY !== -1) {
          const verticalGap = lastY - line.y;
          if (verticalGap > lastLineHeight * 1.8) {
            pageText += '\n\n';
          } else {
            pageText += '\n';
          }
        }
        
        pageText += lineText;
        lastY = line.y;
        lastLineHeight = line.height;
      }

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
