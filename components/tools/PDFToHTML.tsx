'use client';

import React from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function PDFToHTML() {
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

  const handleConvertToHTML = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a PDF file.');
    }

    const file = files[0];
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    let htmlPages = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items as any[];
      
      // Sort items by vertical position top-to-bottom
      items.sort((a, b) => b.transform[5] - a.transform[5]);

      let pageHtml = `<div class="pdf-page" style="margin: 20px auto; padding: 30px; max-width: 800px; background: #ffffff; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); font-family: sans-serif; line-height: 1.6;">`;
      pageHtml += `<h3 style="margin-top:0; color:#555; border-bottom:1px solid #eee; padding-bottom:8px;">Page ${i}</h3>`;

      let currentY = -1;
      let paragraphText = '';

      items.forEach((item) => {
        const text = item.str.trim();
        if (!text) return;

        const y = item.transform[5];
        if (currentY === -1 || Math.abs(y - currentY) < 12) {
          paragraphText += ' ' + text;
          currentY = y;
        } else {
          pageHtml += `<p style="margin: 0 0 10px 0; color:#333; font-size:15px;">${paragraphText}</p>`;
          paragraphText = text;
          currentY = y;
        }
      });

      if (paragraphText) {
        pageHtml += `<p style="margin: 0 0 10px 0; color:#333; font-size:15px;">${paragraphText}</p>`;
      }

      pageHtml += `</div>`;
      htmlPages += pageHtml;
    }

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Converted Document - ${file.name}</title>
        <style>
          body { background: #f3f4f6; margin: 0; padding: 20px; }
          .pdf-page p { font-size: 15px; text-align: justify; }
        </style>
      </head>
      <body>
        <div style="text-align:center; margin-bottom: 20px;">
          <h2 style="font-family:sans-serif; color:#444;">${file.name}</h2>
          <p style="font-family:sans-serif; color:#888; font-size:12px;">Converted by InfinityKit Local Sandbox Converter</p>
        </div>
        ${htmlPages}
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      fileName: `${file.name.replace(/\.pdf$/i, '')}.html`,
      resultData: fullHtml
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Convert PDF to HTML Webpage
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Map document character structures and output formatted, clean, responsive HTML web pages 100% locally.
      </p>

      <ToolWorkspace
        toolId="pdf-to-html"
        accept="application/pdf"
        maxFiles={1}
        onProcess={handleConvertToHTML}
        actionButtonText="Convert to HTML"
        instructions={[
          'Select the PDF file you want to publish as a web page.',
          'Wait for browser-side mapping structures to build paragraphs.',
          'Download the completed single HTML index file.'
        ]}
      />
    </div>
  );
}
