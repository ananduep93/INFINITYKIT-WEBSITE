'use client';

import React from 'react';
import { PDFDocument } from 'pdf-lib';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function SplitPDF() {
  const handleSplit = async (files: File[], textInput?: string) => {
    if (files.length === 0) {
      throw new Error('Please upload a PDF file to split.');
    }
    if (!textInput || !textInput.trim()) {
      throw new Error('Please specify the page range (e.g. 1-3, 5).');
    }

    const file = files[0];
    const fileBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBytes);
    const totalPages = pdf.getPageCount();

    // Parse page ranges, e.g. "1-3, 5" -> [0, 1, 2, 4] (0-indexed)
    const pagesToKeep: number[] = [];
    const ranges = textInput.split(',');

    for (const r of ranges) {
      const trimmed = r.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr.trim(), 10);
        const end = parseInt(endStr.trim(), 10);
        if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
          throw new Error(`Invalid range: ${trimmed}. PDF has ${totalPages} pages.`);
        }
        for (let i = start - 1; i < end; i++) {
          pagesToKeep.push(i);
        }
      } else {
        const page = parseInt(trimmed, 10);
        if (isNaN(page) || page < 1 || page > totalPages) {
          throw new Error(`Invalid page number: ${trimmed}. PDF has ${totalPages} pages.`);
        }
        pagesToKeep.push(page - 1);
      }
    }

    if (pagesToKeep.length === 0) {
      throw new Error('No valid pages selected.');
    }

    const splitPdf = await PDFDocument.create();
    const copiedPages = await splitPdf.copyPages(pdf, pagesToKeep);
    copiedPages.forEach((page) => splitPdf.addPage(page));

    const splitPdfBytes = await splitPdf.save();
    const blob = new Blob([splitPdfBytes as any], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      fileName: `split_${file.name}`,
      resultData: `Successfully extracted ${pagesToKeep.length} pages from "${file.name}" (Total pages: ${totalPages}).`
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Split PDF Pages
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Extract specific pages or page ranges from a PDF document to form a new document locally.
      </p>

      <ToolWorkspace
        toolId="splitpdf"
        accept="application/pdf"
        maxFiles={1}
        hasText={true}
        textLabel="Page Range Selection"
        textPlaceholder="e.g. 1-3, 5, 8-10"
        onProcess={handleSplit}
        actionButtonText="Split PDF"
        instructions={[
          'Upload the PDF document you wish to split.',
          'Specify the pages or page ranges you want to extract (e.g. "1-2, 4" for pages 1, 2 and 4).',
          'Click the "Split PDF" button to process and download.'
        ]}
      />
    </div>
  );
}
