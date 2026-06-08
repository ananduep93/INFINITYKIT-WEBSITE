'use client';

import React, { useState } from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function AIHumanizer() {
  const [humanizeIntensity, setHumanizeIntensity] = useState('high');

  const handleHumanize = async (files: File[], textInput?: string) => {
    if (!textInput?.trim()) {
      throw new Error('Please enter the AI-generated text you wish to humanize.');
    }

    const promptText = `Rewrite the provided AI-generated text to make it sound completely human, organic, and natural.
Intensity settings: ${humanizeIntensity === 'high' ? 'High structural variance (maximum vocabulary variety, custom sentence lengths)' : 'Medium variance (smooth flow, natural voice)'}.
Rules to strictly follow:
1. Avoid typical AI sentence structures, repetitive transition words (e.g., "moreover", "testament", "delve"), and predictive phrases.
2. Vary sentence length (alternate very short and medium sentences) to create highly organic readability flow (burstiness).
3. Use common but highly descriptive phrasing appropriate for an experienced human writer.
4. Do NOT change facts, statistics, or the main theme of the input.`;

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
      fileName: `Humanized_${Date.now()}.txt`,
      resultData: generatedText
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        AI Text Humanizer
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Convert robotic or AI-generated copy into highly natural, organic, human-sounding text.
      </p>

      <div className="glass-panel" style={{ marginBottom: '25px', padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>Humanizing Settings</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Humanize Mode</label>
            <select
              value={humanizeIntensity}
              onChange={(e) => setHumanizeIntensity(e.target.value)}
              className="form-select"
              style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              <option value="medium">Balanced (Natural adjustments while retaining tone)</option>
              <option value="high">Max Humanize (Highest structural variance & phrase shifts)</option>
            </select>
          </div>
        </div>
      </div>

      <ToolWorkspace
        toolId="ai-humanizer"
        accept="*/*"
        maxFiles={0}
        hasText={true}
        textLabel="Robotic / AI-Generated Text"
        textPlaceholder="Paste the AI-generated essay, report, or marketing copy here..."
        onProcess={handleHumanize}
        actionButtonText="Humanize Copy"
        instructions={[
          'Select your humanization mode configuration from the dropdown above.',
          'Paste the robotic AI text draft you wish to adjust into the workspace area.',
          'Click the "Humanize Copy" button to reconstruct the text with organic voice rhythms.'
        ]}
      />
    </div>
  );
}
