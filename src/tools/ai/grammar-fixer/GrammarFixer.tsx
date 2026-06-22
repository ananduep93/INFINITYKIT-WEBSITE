'use client';

import React, { useState } from 'react';
import ToolWorkspace from '../../../components/ui/ToolWorkspace';

export default function GrammarFixer() {
  const [explainLevel, setExplainLevel] = useState('none');

  const handleFixGrammar = async (files: File[], textInput?: string) => {
    if (!textInput?.trim()) {
      throw new Error('Please enter the text containing grammar or spelling errors.');
    }

    const promptText = `Scan the provided text and correct all typos, spelling mistakes, syntax structural errors, and punctuation flaws.
Explain corrections: ${explainLevel === 'all' ? 'Yes, list a short bulleted explanation of what was fixed at the end of the text' : 'No, just return the polished corrected text'}.
Ensure the core style and voice are retained, but with perfect spelling and grammar.`;

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
      fileName: `Corrected_${Date.now()}.txt`,
      resultData: generatedText
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        AI Grammar & Spelling Fixer
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Correct all spelling mistakes, grammatical errors, and sentence structure issues instantly.
      </p>

      <div className="glass-panel" style={{ marginBottom: '25px', padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>Fixer Specifications</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Show Corrections Log</label>
            <select
              value={explainLevel}
              onChange={(e) => setExplainLevel(e.target.value)}
              className="form-select"
              style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              <option value="none">Only Corrected Text (Clean output)</option>
              <option value="all">Include Detailed Explanations Log (Learn the rules)</option>
            </select>
          </div>
        </div>
      </div>

      <ToolWorkspace
        toolId="grammar-fixer"
        accept="*/*"
        maxFiles={0}
        hasText={true}
        textLabel="Original Text with Errors"
        textPlaceholder="e.g. Me and him goes to the office yesterday, but we forgot to brought the keys."
        onProcess={handleFixGrammar}
        actionButtonText="Fix Grammar & Spelling"
        instructions={[
          'Specify whether you want a list of correction explanations appended to the output.',
          'Type or paste your text with errors or drafts inside the prompt space.',
          'Click the "Fix Grammar & Spelling" button to execute and download the corrected copy.'
        ]}
      />
    </div>
  );
}
