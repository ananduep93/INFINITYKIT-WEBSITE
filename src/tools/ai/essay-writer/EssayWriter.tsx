'use client';

import React, { useState } from 'react';
import { PenTool } from 'lucide-react';
import ToolWorkspace from '../../../components/ui/ToolWorkspace';

export default function EssayWriter() {
  const [essayType, setEssayType] = useState('argumentative');
  const [academicLevel, setAcademicLevel] = useState('university');
  const [tone, setTone] = useState('academic');

  const handleGenerateEssay = async (files: File[], topicInput?: string) => {
    if (!topicInput?.trim()) {
      throw new Error('Please enter an essay topic or description.');
    }

    const localOpenaiKey = localStorage.getItem('infinitykit_openai_key') || '';
    const localGeminiKey = localStorage.getItem('infinitykit_gemini_key') || '';

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Write a high-quality ${essayType} essay appropriate for ${academicLevel} level. The tone should be ${tone}. Ensure it has a strong introduction, structured body paragraphs with evidence/arguments, and a cohesive conclusion.`,
        taskType: 'chat',
        context: `Essay Topic:\n${topicInput}`,
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
      fileName: `Essay_${topicInput.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.txt`,
      resultData: generatedText
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        AI Essay Writer
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Generate well-structured, professional academic essays instantly using advanced AI language models.
      </p>

      <div className="glass-panel" style={{ marginBottom: '25px', padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>Essay Structure Options</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Essay Type</label>
            <select
              value={essayType}
              onChange={(e) => setEssayType(e.target.value)}
              className="form-select"
              style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              <option value="argumentative">Argumentative (Propose & defend a thesis)</option>
              <option value="persuasive">Persuasive (Convince the reader)</option>
              <option value="expository">Expository (Explain a topic clearly)</option>
              <option value="narrative">Narrative (Tell a story/reflection)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Academic Level</label>
            <select
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value)}
              className="form-select"
              style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              <option value="highschool">High School</option>
              <option value="college">College / Undergraduate</option>
              <option value="university">University (Advanced)</option>
              <option value="phd">Doctorate / Professional</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Tone & Voice</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="form-select"
              style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              <option value="academic">Academic & Formal</option>
              <option value="analytical">Critical & Analytical</option>
              <option value="engaging">Creative & Engaging</option>
              <option value="informative">Objective & Informative</option>
            </select>
          </div>
        </div>
      </div>

      <ToolWorkspace
        toolId="essay-writer"
        accept="*/*"
        maxFiles={0}
        hasText={true}
        textLabel="Essay Topic & Instructions"
        textPlaceholder="e.g. Discuss the social and economic consequences of artificial intelligence on future job markets."
        onProcess={handleGenerateEssay}
        actionButtonText="Generate Essay"
        instructions={[
          'Adjust the essay type, academic level, and desired tone using the selectors above.',
          'Type or paste your main topic, question, or key prompts in the input area.',
          'Click the "Generate Essay" button to request advanced drafting and download the outline document.'
        ]}
      />
    </div>
  );
}
