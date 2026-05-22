'use client';

import React from 'react';
import { PDFDocument } from 'pdf-lib';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function MergePDF() {
  const handleMerge = async (files: File[]) => {
    if (files.length < 2) {
      throw new Error('Please select at least 2 PDF files to merge.');
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const fileBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      fileName: `merged_${Date.now()}.pdf`,
      resultData: `Successfully merged ${files.length} PDFs into a single file.`
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Merge PDF Documents
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Combine multiple PDF files in any order you choose into a single cohesive document local-first.
      </p>

      <ToolWorkspace
        toolId="mergepdf"
        accept="application/pdf"
        maxFiles={10}
        onProcess={handleMerge}
        actionButtonText="Merge PDFs"
        instructions={[
          'Select or drag & drop two or more PDF files.',
          'Arrange files in the queue in the order you wish to merge them.',
          'Click the "Merge PDFs" button to compile them locally.'
        ]}
      />
    </div>
  );
}
