'use client';

import React, { useState } from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';
import { getPdfJs, getTextItems, groupItemsIntoLines } from '../../lib/pdfjs';

export default function PDFToWord() {
  const [progress, setProgress] = useState<string>('');

  const handleConvertToWord = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a PDF file.');
    }

    const file = files[0];
    setProgress('Loading PDF engine…');

    // 1. Parse PDF with shared utility (pdfjs-dist, no CDN script injection)
    const pdfjsLib = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages: number = pdf.numPages;

    // 2. Load docx library
    const { Document, Packer, Paragraph, TextRun, PageBreak, HeadingLevel } = await import('docx');

    const children: any[] = [];

    for (let i = 1; i <= numPages; i++) {
      setProgress(`Converting page ${i} of ${numPages}…`);

      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Use shared helpers — correctly filters TextMarkedContent in v6+
      const items = getTextItems(textContent);
      const lines = groupItemsIntoLines(items);

      // Visual page separator
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `— Page ${i} —`,
              bold: true,
              size: 24,
            }),
          ],
        })
      );
      children.push(new Paragraph({ text: '' }));

      // Build paragraphs from lines
      let currentParagraphRuns: any[] = [];
      let lastY = -1;
      let lastLineHeight = 12;

      for (let l = 0; l < lines.length; l++) {
        const line = lines[l];

        // Compute max height and dominant fontName for this line
        let maxItemHeight = 0;
        let dominantFont = '';
        for (const item of line.items) {
          if (item.height > maxItemHeight) {
            maxItemHeight = item.height;
            dominantFont = item.fontName ?? '';
          }
        }
        if (maxItemHeight === 0) maxItemHeight = lastLineHeight;

        // Detect bold via fontName
        const isBold = /bold/i.test(dominantFont);

        // Detect heading via font height (> 14pt in PDF units ≈ heading)
        const isHeading = maxItemHeight > 14;

        // Build line text with proportional space gaps between items
        let lineText = '';
        let lastX = -1;
        for (const item of line.items) {
          const x = item.transform[4];
          if (lastX !== -1) {
            const gap = x - lastX;
            const spaceWidth = Math.max(item.height * 0.25, 3);
            if (gap > spaceWidth) {
              const numSpaces = Math.min(Math.round(gap / spaceWidth), 20);
              lineText += ' '.repeat(numSpaces);
            }
          }
          lineText += item.str;
          lastX = x + item.width;
        }

        // Decide paragraph break vs line break
        if (lastY !== -1) {
          const verticalGap = lastY - line.y;
          const isParagraphBreak = verticalGap > lastLineHeight * 1.8;

          if (isParagraphBreak) {
            if (currentParagraphRuns.length > 0) {
              children.push(new Paragraph({ children: currentParagraphRuns }));
              currentParagraphRuns = [];
            }
            // Add proportional blank paragraphs for large gaps
            const blanks = Math.min(Math.floor(verticalGap / (lastLineHeight * 2.5)), 3);
            for (let b = 0; b < blanks; b++) {
              children.push(new Paragraph({ text: '' }));
            }
          } else {
            // Same paragraph — soft line break
            currentParagraphRuns.push(new TextRun({ break: 1 }));
          }
        }

        // Proportional font size: PDF pt → DOCX half-points (×2)
        const docxSize = Math.round(maxItemHeight * 2);
        const safeFontSize = docxSize > 0 ? docxSize : 22;

        if (isHeading) {
          // Flush any accumulated runs before inserting a heading paragraph
          if (currentParagraphRuns.length > 0) {
            children.push(new Paragraph({ children: currentParagraphRuns }));
            currentParagraphRuns = [];
          }
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: lineText,
                  bold: true,
                  size: safeFontSize + 4, // slightly larger for headings
                }),
              ],
            })
          );
        } else {
          currentParagraphRuns.push(
            new TextRun({
              text: lineText,
              bold: isBold,
              size: safeFontSize,
            })
          );
        }

        lastY = line.y;
        lastLineHeight = maxItemHeight;
      }

      if (currentParagraphRuns.length > 0) {
        children.push(new Paragraph({ children: currentParagraphRuns }));
      }

      // Page break between pages (not after the last page)
      if (i < numPages) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      }
    }

    setProgress('Packaging Word document…');

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

    setProgress('');

    return {
      downloadUrl,
      fileName: `${file.name.replace(/\.pdf$/i, '')}.docx`,
      resultData: `Successfully converted "${file.name}" to Microsoft Word format — ${numPages} page(s).`,
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

      {progress && (
        <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginBottom: '12px', fontStyle: 'italic' }}>
          {progress}
        </p>
      )}

      <ToolWorkspace
        toolId="pdf-to-word"
        accept="application/pdf"
        maxFiles={1}
        onProcess={handleConvertToWord}
        actionButtonText="Convert to Word"
        instructions={[
          'Upload the PDF document you want to edit in Microsoft Word.',
          'Wait for client-side character scanning and structure mapping to compile.',
          'Download your finished fully editable Word (.docx) document.',
        ]}
      />
    </div>
  );
}
