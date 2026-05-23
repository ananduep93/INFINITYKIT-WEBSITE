'use client';

import React from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function WatermarkPDF() {
  const handleWatermark = async (files: File[], textInput?: string) => {
    if (files.length === 0) {
      throw new Error('Please upload a PDF file to watermark.');
    }
    const text = textInput || 'CONFIDENTIAL';

    const file = files[0];
    const fileBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBytes);
    const helveticaFont = await pdf.embedFont(StandardFonts.Helvetica);
    const pages = pdf.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Draw transparent diagonal text
      page.drawText(text, {
        x: width / 2 - 150,
        y: height / 2,
        size: 50,
        font: helveticaFont,
        color: rgb(0.7, 0.7, 0.7),
        opacity: 0.35,
        rotate: degrees(45),
      });
    }

    const watermarkedBytes = await pdf.save();
    const blob = new Blob([watermarkedBytes as any], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      fileName: `watermarked_${file.name}`,
      resultData: `Successfully added watermark "${text}" to all ${pages.length} page(s) of "${file.name}".`
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Watermark PDF Documents
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Protect your documents with a custom text watermark stamped on all pages client-side.
      </p>

      <ToolWorkspace
        toolId="watermarkpdf"
        accept="application/pdf"
        maxFiles={1}
        hasText={true}
        textLabel="Watermark Text"
        textPlaceholder="e.g. CONFIDENTIAL, DRAFT, COPY"
        onProcess={handleWatermark}
        actionButtonText="Apply Watermark"
        instructions={[
          'Upload the PDF document you want to watermark.',
          'Specify the text you wish to overlay on your PDF pages.',
          'Click the "Apply Watermark" button to compile your protected file.'
        ]}
      />
    </div>
  );
}
