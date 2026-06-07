'use client';

import React, { useState } from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function ArticleWriter() {
  const [articleLength, setArticleLength] = useState('medium');
  const [audience, setAudience] = useState('general');
  const [seoKeywords, setSeoKeywords] = useState('');

  const handleGenerateArticle = async (files: File[], topicInput?: string) => {
    if (!topicInput?.trim()) {
      throw new Error('Please enter an article topic or key outline.');
    }

    const promptText = `Write a high-quality ${articleLength} article on the specified topic.
Target Audience: ${audience}.
SEO Keywords to naturally include: ${seoKeywords || 'None specified'}.
Structure the article with a catchy headline, engaging introduction, informative subheadings, and a strong conclusion.`;

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptText,
        taskType: 'chat',
        context: `Article Topic/Outline:\n${topicInput}`
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
      fileName: `Article_${topicInput.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.txt`,
      resultData: generatedText
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        AI Article Writer
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Draft SEO-optimized articles, news pieces, and journalistic columns instantly with highly engaging headlines.
      </p>

      <div className="glass-panel" style={{ marginBottom: '25px', padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>Article Specifications</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Article Length</label>
            <select
              value={articleLength}
              onChange={(e) => setArticleLength(e.target.value)}
              className="form-select"
              style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              <option value="short">Short (300-500 words)</option>
              <option value="medium">Medium (600-900 words)</option>
              <option value="long">Long (1000-1500 words)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Target Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="form-select"
              style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              <option value="general">General Public</option>
              <option value="tech">Tech-savvy / Developers</option>
              <option value="business">Business Professionals / B2B</option>
              <option value="academic">Students & Researchers</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>SEO Keywords (Optional)</label>
            <input
              type="text"
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              placeholder="e.g. cloud computing, devops, efficiency"
              style={{
                width: '100%',
                padding: '10px 15px',
                borderRadius: '10px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-color)',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>
      </div>

      <ToolWorkspace
        toolId="article-writer"
        accept="*/*"
        maxFiles={0}
        hasText={true}
        textLabel="Article Topic & Core Outlines"
        textPlaceholder="e.g. The benefits of moving to containerized cloud architectures for modern e-commerce startups."
        onProcess={handleGenerateArticle}
        actionButtonText="Generate Article"
        instructions={[
          'Adjust the length, target audience, and add relevant SEO keyword strings above.',
          'State the main topic or general notes for your article inside the context box.',
          'Click the "Generate Article" button to begin client-first drafting and export the text.'
        ]}
      />
    </div>
  );
}
