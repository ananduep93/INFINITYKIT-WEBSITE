'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import ReusableResult from '../ui/ReusableResult';
import ReusableLoading from '../ui/ReusableLoading';

export default function AITextImprover() {
  const [text, setText] = useState('');
  const [tone, setTone] = useState('professional');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Enhance this text to have a ${tone} tone. Improve grammar, vocabulary, spelling, and sentence flow.`,
          taskType: 'improve',
          context: text
        })
      });

      const resData = await response.json();
      setResult(resData.text || 'Error polishing document.');
    } catch (e) {
      setResult('Communication failure with AI servers.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '750px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        AI Text Polisher
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Instantly proofread and polish sentences, essays, or documentation with specialized persona styles.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Original Document</label>
          <textarea
            placeholder="Type or paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="form-textarea"
            rows={6}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Desired Persona / Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="form-select"
          >
            <option value="professional">👔 Executive / Professional (Polished and articulate)</option>
            <option value="conversational">💬 Casual / Conversational (Friendly and engaging)</option>
            <option value="academic">🎓 Scholarly / Academic (Formal and authoritative)</option>
            <option value="creative">✨ Creative / Vivid (Expressive and narrative-driven)</option>
          </select>
        </div>

        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          <Sparkles size={18} /> {loading ? 'Polishing Text...' : 'Enhance Text'}
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
            label="Enhanced Document"
            value={result}
            color="success"
            downloadableFilename="improved_document.txt"
          />
        </div>
      )}
    </div>
  );
}
