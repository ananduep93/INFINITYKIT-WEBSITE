'use client';

import React, { useState } from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function FAQGenerator() {
  const [numFaqs, setNumFaqs] = useState(5);
  const [format, setFormat] = useState('plain');

  const handleGenerateFaq = async (files: File[], contextInput?: string) => {
    if (!contextInput?.trim()) {
      throw new Error('Please enter a product, service, or topic description.');
    }

    const promptText = `Generate exactly ${numFaqs} frequently asked questions (FAQs) with detailed, professional, and clear answers based on the topic.
Format style: ${format === 'schema' ? 'FAQPage JSON-LD Schema markup alongside clean text output' : 'Clean readable Q&A text format'}.`;

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptText,
        taskType: 'chat',
        context: `Topic/Product/Service Details:\n${contextInput}`
      })
    });

    if (!response.ok) {
      throw new Error('Communication failure with AI servers.');
    }

    const data = await response.json();
    const generatedText = data.text || '';

    // Create local downloadable text file
    const blob = new Blob([generatedText], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      fileName: `FAQ_${contextInput.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.txt`,
      resultData: generatedText
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        AI FAQ Generator
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Generate frequently asked questions (FAQs) and answers for your website, landing page, or product docs instantly.
      </p>

      <div className="glass-panel" style={{ marginBottom: '25px', padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>FAQ Options</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Number of FAQs</label>
            <select
              value={numFaqs}
              onChange={(e) => setNumFaqs(Number(e.target.value))}
              className="form-select"
              style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              <option value={3}>3 FAQs (Quick summary)</option>
              <option value={5}>5 FAQs (Standard setup)</option>
              <option value={10}>10 FAQs (Comprehensive list)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Output Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="form-select"
              style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              <option value="plain">Plain Readable Text Q&A</option>
              <option value="schema">Q&A Text + SEO JSON-LD FAQ Schema</option>
            </select>
          </div>
        </div>
      </div>

      <ToolWorkspace
        toolId="faq-generator"
        accept="*/*"
        maxFiles={0}
        hasText={true}
        textLabel="Product, Service, or Topic Details"
        textPlaceholder="e.g. A fast cloud backup service that automatically schedules secure backups every 6 hours and uses end-to-end encryption."
        onProcess={handleGenerateFaq}
        actionButtonText="Generate FAQs"
        instructions={[
          'Select the desired FAQs count and format layout.',
          'Describe the product, service, or theme for which you require FAQs in the prompt workspace.',
          'Click the "Generate FAQs" button to request advanced question formulation and download your document.'
        ]}
      />
    </div>
  );
}
