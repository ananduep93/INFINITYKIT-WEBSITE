'use client';

import React, { useState } from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function BlogGenerator() {
  const [tone, setTone] = useState('engaging');
  const [includeCta, setIncludeCta] = useState('yes');
  const [niche, setNiche] = useState('technology');

  const handleGenerateBlog = async (files: File[], topicInput?: string) => {
    if (!topicInput?.trim()) {
      throw new Error('Please enter a blog topic or outline ideas.');
    }

    const promptText = `Generate a highly engaging, readable blog post for the ${niche} niche.
Tone of voice: ${tone}.
Include Call to Action (CTA) at the end: ${includeCta === 'yes' ? 'Yes, craft a compelling call to action' : 'No'}.
Ensure it has a catchy header, bullet points where appropriate for readability, and a friendly, shareable structure.`;

    const localOpenaiKey = localStorage.getItem('infinitykit_openai_key') || '';
    const localGeminiKey = localStorage.getItem('infinitykit_gemini_key') || '';

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptText,
        taskType: 'chat',
        context: `Blog Post Niche/Topic:\n${topicInput}`,
        openaiKey: localOpenaiKey,
        geminiKey: localGeminiKey
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Communication failure with AI servers.');
    }

    const data = await response.json();
    const generatedText = data.text || '';

    // Create local downloadable text file
    const blob = new Blob([generatedText], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      fileName: `Blog_${topicInput.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.txt`,
      resultData: generatedText
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        AI Blog Post Generator
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Draft friendly, shareable, and engaging blog posts tailored to your exact niche and audience.
      </p>

      <div className="glass-panel" style={{ marginBottom: '25px', padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>Blog Configuration</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Blog Niche</label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="form-select"
              style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              <option value="technology">Technology & SaaS</option>
              <option value="lifestyle">Lifestyle & Wellness</option>
              <option value="business">Business & Finance</option>
              <option value="marketing">Marketing & Branding</option>
              <option value="travel">Travel & Adventure</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Tone of Voice</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="form-select"
              style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              <option value="engaging">Engaging & Friendly</option>
              <option value="conversational">Casual & Conversational</option>
              <option value="professional">Professional & Informative</option>
              <option value="creative">Humorous & Creative</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Include Call to Action (CTA)</label>
            <select
              value={includeCta}
              onChange={(e) => setIncludeCta(e.target.value)}
              className="form-select"
              style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              <option value="yes">Yes (E.g. Subscribe, Comment, Share)</option>
              <option value="no">No CTA</option>
            </select>
          </div>
        </div>
      </div>

      <ToolWorkspace
        toolId="blog-generator"
        accept="*/*"
        maxFiles={0}
        hasText={true}
        textLabel="Blog Post Topic & Key Elements"
        textPlaceholder="e.g. 5 simple time-management tips for remote designers to prevent burnout."
        onProcess={handleGenerateBlog}
        actionButtonText="Generate Blog Post"
        instructions={[
          'Select the niche category, desired tone, and whether to build an ending CTA.',
          'Summarize the topic and main points you wish to address inside the text workspace.',
          'Click the "Generate Blog Post" button to execute and download the completed article draft.'
        ]}
      />
    </div>
  );
}
