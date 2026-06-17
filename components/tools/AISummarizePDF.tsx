'use client';

import React from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';
import { getPdfJs, getTextItems, groupItemsIntoLines, linesToPlainText } from '../../lib/pdfjs';

export default function AISummarizePDF() {
  const handleSummarize = async (files: File[]) => {
    if (files.length === 0) throw new Error('Please upload a PDF file to summarize.');

    const file = files[0];
    let pdfText = '';

    try {
      const pdfjsLib = await getPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      for (let i = 1; i <= Math.min(numPages, 30); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent({ includeMarkedContent: false });
        const items = getTextItems(textContent);
        const lines = groupItemsIntoLines(items);
        const pageText = linesToPlainText(lines);
        pdfText += `[Page ${i}]\n${pageText}\n\n`;
      }
    } catch (err) {
      throw new Error('Failed to parse text from the uploaded PDF document. Make sure it is not corrupted or scanned.');
    }

    if (!pdfText.trim()) {
      throw new Error('Could not extract any readable text from this PDF file.');
    }

    const localOpenaiKey = localStorage.getItem('infinitykit_openai_key') || '';
    const localGeminiKey = localStorage.getItem('infinitykit_gemini_key') || '';

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Provide a structured, executive summary highlighting the main thesis, key points, and final actionable takeaways of this document.',
        taskType: 'summarize',
        context: pdfText,
        openaiKey: localOpenaiKey,
        geminiKey: localGeminiKey
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Server error generating summary. Please try again.');
    }

    const data = await response.json();

    const blob = new Blob([data.text], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      fileName: `${file.name.replace(/\.pdf$/i, '')}_summary.txt`,
      resultData: data.text
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        AI PDF Summarizer
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Extract and summarize long PDF documents instantly into key topics and bullet outline points locally and securely.
      </p>

      <ToolWorkspace
        toolId="ai-summarize-pdf"
        accept="application/pdf"
        maxFiles={1}
        onProcess={handleSummarize}
        actionButtonText="Summarize PDF"
        instructions={[
          'Upload the PDF document you wish to summarize.',
          'Wait for client-side text parsing extraction to complete.',
          'Click "Summarize PDF" to generate the AI summary.'
        ]}
      />
    </div>
  );
}
