'use client';

import React from 'react';
import Tesseract from 'tesseract.js';
import ToolWorkspace from '../../../components/ui/ToolWorkspace';

export default function OCRImage() {
  const handleOCR = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload an image to run OCR.');
    }

    const file = files[0];
    
    // Run client-side Tesseract OCR recognition
    const result = await Tesseract.recognize(
      file,
      'eng',
      {
        logger: (m) => console.log('Tesseract Progress:', m)
      }
    );

    const extractedText = result.data.text;
    if (!extractedText.trim()) {
      throw new Error('No readable text could be identified in the uploaded image.');
    }

    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      fileName: `ocr_text_${Date.now()}.txt`,
      resultData: extractedText
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Optical Character Recognition (OCR) Image Scanner
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Extract typed or handwritten alphanumeric text from any uploaded image completely local-first.
      </p>

      <ToolWorkspace
        toolId="ocrimage"
        accept="image/*"
        maxFiles={1}
        onProcess={handleOCR}
        actionButtonText="Scrape Text from Image"
        instructions={[
          'Upload any high-quality image containing text characters (supports PNG, JPG, or WebP).',
          'Ensure the text inside is oriented upright and readable.',
          'Click the "Scrape Text from Image" button to run AI text extraction.'
        ]}
      />
    </div>
  );
}
