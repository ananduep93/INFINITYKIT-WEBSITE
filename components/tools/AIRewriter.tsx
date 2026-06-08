'use client';

import React, { useState } from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function AIRewriter() {
  const [rewriteStyle, setRewriteStyle] = useState('paraphrase');
  const [tone, setTone] = useState('professional');

  const handleRewrite = async (files: File[], textInput?: string) => {
    if (!textInput?.trim()) {
      throw new Error('Please enter the text you wish to rewrite.');
    }

    const promptText = `Rewrite the provided text using the following configuration:
Objective: ${rewriteStyle === 'paraphrase' ? 'Paraphrase and structure cleanly' : rewriteStyle === 'simplify' ? 'Simplify vocabulary and sentences' : rewriteStyle === 'expand' ? 'Expand and elaborate with supportive details' : 'Elevate and refine vocabulary'}.
Tone: ${tone}.
Maintain the original meaning, but completely update phrasing and structure for clarity and impact.`;

    const localOpenaiKey = localStorage.getItem('infinitykit_openai_key') || '';
    const localGeminiKey = localStorage.getItem('infinitykit_gemini_key') || '';

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptText,
        taskType: 'improve',
        context: textInput,
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
      fileName: `Rewritten_${Date.now()}.txt`,
      resultData: generatedText
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        AI Content Rewriter
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Rewrite, paraphrase, expand, or simplify any content locally using advanced machine learning models.
      </p>

      <div className="glass-panel" style={{ marginBottom: '25px', padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>Rewrite Settings</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Rewrite Objective</label>
            <select
              value={rewriteStyle}
              onChange={(e) => setRewriteStyle(e.target.value)}
              className="form-select"
              style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              <option value="paraphrase">Paraphrase & Restructure</option>
              <option value="simplify">Simplify & Make Concise</option>
              <option value="expand">Expand & Elaborate</option>
              <option value="elevate">Elevate Vocabulary & Style</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Target Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="form-select"
              style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              <option value="professional">Professional & Corporate</option>
              <option value="casual">Casual & Conversational</option>
              <option value="academic">Academic & Formal</option>
              <option value="persuasive">Persuasive & Marketing</option>
            </select>
          </div>
        </div>
      </div>

      <ToolWorkspace
        toolId="ai-rewriter"
        accept="*/*"
        maxFiles={0}
        hasText={true}
        textLabel="Original Text to Rewrite"
        textPlaceholder="Type or paste the sentences, paragraphs, or copy you want to rewrite here..."
        onProcess={handleRewrite}
        actionButtonText="Rewrite Text"
        instructions={[
          'Choose your rewrite objective and target tone using selectors above.',
          'Type or paste your original content inside the text workspace.',
          'Click the "Rewrite Text" button to start the AI paraphrasing and download your rewritten output.'
        ]}
      />
    </div>
  );
}
