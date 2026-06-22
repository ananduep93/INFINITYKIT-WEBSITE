'use client';

import React, { useState } from 'react';
import { Sparkles, AlignLeft } from 'lucide-react';
import ReusableResult from '../../../components/ui/ReusableResult';
import ReusableLoading from '../../../components/ui/ReusableLoading';

export default function AISummarizer() {
  const [text, setText] = useState('');
  const [length, setLength] = useState('medium');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setResult('');

    try {
      const localOpenaiKey = localStorage.getItem('infinitykit_openai_key') || '';
      const localGeminiKey = localStorage.getItem('infinitykit_gemini_key') || '';

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Distill the text into a ${length} summary. Present the key findings as structured bullet points.`,
          taskType: 'summarize',
          context: text,
          openaiKey: localOpenaiKey,
          geminiKey: localGeminiKey
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Error generating summary.');
      }
      setResult(resData.text || 'Error generating summary.');
    } catch (e: any) {
      setResult(e.message || 'Communication failure with AI servers.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '750px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        AI Summarizer Engine
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Synthesize long articles, reports, or text files into crisp and structured outlines instantly.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Original Document</label>
          <textarea
            placeholder="Paste your long-form text or documents here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="form-textarea"
            rows={7}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Summary Detail Level</label>
          <select
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="form-select"
          >
            <option value="short">⚡ Quick Summary (Short, 3 core bullets)</option>
            <option value="medium">📝 Standard Synthesis (Medium detail, 5 bullets)</option>
            <option value="long">🔍 Deep Analysis (Long detail, thorough breakdowns)</option>
          </select>
        </div>

        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          <Sparkles size={18} /> {loading ? 'Summarizing Document...' : 'Generate Outline'}
        </button>
      </form>

      {loading && (
        <div style={{ marginTop: '25px' }}>
          <ReusableLoading type="skeleton" count={3} />
        </div>
      )}

      {result && (
        <div style={{ marginTop: '25px' }}>
          <ReusableResult
            label="Cohesive Outline"
            value={result}
            color="success"
            downloadableFilename="document_summary.txt"
          />
        </div>
      )}
    </div>
  );
}
