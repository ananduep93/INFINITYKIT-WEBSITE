'use client';

import React from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function PDFToEPUB() {
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

  const handleConvertToEPUB = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a PDF file.');
    }

    const file = files[0];
    const pdfjsLib = await loadPdfJs();
    const JSZip = await loadJSZip();
    const arrayBuffer = await file.arrayBuffer();
    
    // 1. Extract text page by page
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const pagesText: string[] = [];
    const limit = Math.min(numPages, 30); // Ebook pages limit

    for (let i = 1; i <= limit; i++) {
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
            pageText += '<br/><br/>';
          } else {
            pageText += '<br/>';
          }
        }
        
        pageText += lineText;
        lastY = line.y;
        lastLineHeight = line.height;
      }

      pagesText.push(pageText);
    }

    // 2. Build EPUB structure via JSZip
    const zip = new JSZip();
    const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const title = file.name.replace(/\.pdf$/i, '');

    // Add uncompressed mimetype (EPUB requirement)
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    // META-INF/container.xml
    zip.file('META-INF/container.xml', `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

    // Manifest & Spine entries
    let manifestItems = '';
    let spineItems = '';
    let navPoints = '';

    pagesText.forEach((text, index) => {
      const pIdx = index + 1;
      zip.file(`OEBPS/page_${pIdx}.xhtml`, `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Page ${pIdx}</title>
</head>
<body style="font-family: sans-serif; padding: 20px; line-height: 1.5;">
  <h2>Page ${pIdx}</h2>
  <p>${text || '[Empty Page]'}</p>
</body>
</html>`);

      manifestItems += `<item id="page_${pIdx}" href="page_${pIdx}.xhtml" media-type="application/xhtml+xml"/>\n    `;
      spineItems += `<itemref idref="page_${pIdx}"/>\n    `;
      navPoints += `<navPoint id="nav_${pIdx}" playOrder="${pIdx}">
      <navLabel><text>Page ${pIdx}</text></navLabel>
      <content src="page_${pIdx}.xhtml"/>
    </navPoint>\n    `;
    });

    // content.opf
    zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="BookId">urn:uuid:${uuid}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:creator>InfinityKit PDF Ebook Engine</dc:creator>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    ${manifestItems}
  </manifest>
  <spine toc="ncx">
    ${spineItems}
  </spine>
</package>`);

    // toc.ncx
    zip.file('OEBPS/toc.ncx', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD NCX 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${uuid}"/>
    <meta name="dtb:depth" content="1"/>
  </head>
  <docTitle>
    <text>${title}</text>
  </docTitle>
  <navMap>
    ${navPoints}
  </navMap>
</ncx>`);

    const epubBlob = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = URL.createObjectURL(epubBlob);

    return {
      downloadUrl,
      fileName: `${title}.epub`,
      resultData: `Successfully converted "${file.name}" to standard EPUB ebook format with ${limit} pages.`
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Convert PDF to EPUB Ebook
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Convert PDF text flow into a standard, reflowable EPUB book format readable on Apple Books, Kindle, and e-readers.
      </p>

      <ToolWorkspace
        toolId="pdf-to-epub"
        accept="application/pdf"
        maxFiles={1}
        onProcess={handleConvertToEPUB}
        actionButtonText="Convert to EPUB"
        instructions={[
          'Upload your PDF document file.',
          'Wait for client-side paragraph and spine indices to package.',
          'Download the completed reflowable EPUB ebook.'
        ]}
      />
    </div>
  );
}
