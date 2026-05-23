'use client';

import React, { useState } from 'react';
import { BarChart2, Plus, Trash2, Trophy, RotateCcw, Target, Sliders } from 'lucide-react';

interface Option { id: string; name: string; }
interface Criterion { id: string; name: string; weight: number; }
type ScoreMatrix = Record<string, Record<string, number>>;

export default function ChoiceComparator() {
  const [options, setOptions] = useState<Option[]>([
    { id: 'opt1', name: 'Option A' },
    { id: 'opt2', name: 'Option B' },
  ]);
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: 'cr1', name: 'Price', weight: 3 },
    { id: 'cr2', name: 'Quality', weight: 5 },
    { id: 'cr3', name: 'Speed', weight: 4 },
  ]);
  const [scores, setScores] = useState<ScoreMatrix>({});
  const [results, setResults] = useState<{ id: string; name: string; total: number }[] | null>(null);

  const addOption = () => {
    const id = 'opt_' + Date.now();
    setOptions(p => [...p, { id, name: `Option ${String.fromCharCode(65 + p.length)}` }]);
  };

  const removeOption = (id: string) => {
    setOptions(p => p.filter(o => o.id !== id));
    setResults(null);
  };

  const addCriterion = () => {
    setCriteria(p => [...p, { id: 'cr_' + Date.now(), name: 'New Criterion', weight: 3 }]);
    setResults(null);
  };

  const removeCriterion = (id: string) => {
    setCriteria(p => p.filter(c => c.id !== id));
    setResults(null);
  };

  const setScore = (optId: string, crId: string, val: number) => {
    setScores(p => ({ ...p, [optId]: { ...(p[optId] || {}), [crId]: val } }));
    setResults(null);
  };

  const getScore = (optId: string, crId: string) => scores[optId]?.[crId] ?? 5;

  const calculate = () => {
    const totals = options.map(opt => {
      const total = criteria.reduce((sum, cr) => {
        const s = getScore(opt.id, cr.id);
        return sum + s * cr.weight;
      }, 0);
      return { id: opt.id, name: opt.name, total };
    });
    totals.sort((a, b) => b.total - a.total);
    setResults(totals);
  };

  const reset = () => {
    setScores({});
    setResults(null);
  };

  const maxTotal = results ? Math.max(...results.map(r => r.total)) : 1;

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    borderRadius: '8px', color: 'var(--text-color)', padding: '8px 10px',
    fontSize: '0.88rem', outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  const smallBtn = (onClick: () => void, icon: React.ReactNode, danger = false): React.ReactNode => (
    <button onClick={onClick} style={{
      background: danger ? 'rgba(220,53,69,0.1)' : 'var(--glass-bg)',
      border: `1px solid ${danger ? 'rgba(220,53,69,0.2)' : 'var(--glass-border)'}`,
      borderRadius: '8px', padding: '6px', cursor: 'pointer',
      color: danger ? '#dc3545' : 'var(--text-secondary)',
      display: 'flex', alignItems: 'center', flexShrink: 0
    }}>{icon}</button>
  );

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <BarChart2 size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Choice Matrix Comparator</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
          Score options across weighted criteria to find the best choice objectively.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Options */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Options</label>
              <button onClick={addOption} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={12} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {options.map(o => (
                <div key={o.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input value={o.name} onChange={e => setOptions(p => p.map(x => x.id === o.id ? { ...x, name: e.target.value } : x))} style={inputStyle} />
                  {options.length > 2 && smallBtn(() => removeOption(o.id), <Trash2 size={14} />, true)}
                </div>
              ))}
            </div>
          </div>

          {/* Criteria */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Criteria & Weights</label>
              <button onClick={addCriterion} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={12} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {criteria.map(cr => (
                <div key={cr.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input value={cr.name} onChange={e => setCriteria(p => p.map(x => x.id === cr.id ? { ...x, name: e.target.value } : x))} style={{ ...inputStyle, flex: 1 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '60px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>W:{cr.weight}</span>
                    <input type="range" min={1} max={5} value={cr.weight}
                      onChange={e => setCriteria(p => p.map(x => x.id === cr.id ? { ...x, weight: parseInt(e.target.value) } : x))}
                      style={{ width: '60px', cursor: 'pointer' }}
                    />
                  </div>
                  {criteria.length > 1 && smallBtn(() => removeCriterion(cr.id), <Trash2 size={14} />, true)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Score Matrix */}
        <div style={{ marginBottom: '24px', overflowX: 'auto' }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            <Sliders size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Score Matrix (1–10)
          </div>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '6px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Option / Criterion</th>
                {criteria.map(cr => (
                  <th key={cr.id} style={{ textAlign: 'center', padding: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, minWidth: '90px' }}>
                    {cr.name}<br /><span style={{ color: 'var(--primary-color)', fontSize: '0.7rem' }}>w={cr.weight}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {options.map(opt => (
                <tr key={opt.id}>
                  <td style={{ padding: '6px 8px', fontWeight: 600, fontSize: '0.88rem' }}>{opt.name}</td>
                  {criteria.map(cr => (
                    <td key={cr.id} style={{ padding: '4px 6px', textAlign: 'center' }}>
                      <input
                        type="number" min={1} max={10}
                        value={getScore(opt.id, cr.id)}
                        onChange={e => setScore(opt.id, cr.id, Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                        style={{ ...inputStyle, width: '70px', textAlign: 'center', padding: '6px' }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button onClick={calculate} style={{
            background: 'var(--primary-color)', color: '#fff', border: 'none',
            borderRadius: '12px', padding: '12px 28px', fontWeight: 700,
            fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center'
          }}>
            <Target size={18} /> Calculate Rankings
          </button>
          <button onClick={reset} style={{
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            borderRadius: '12px', padding: '12px 20px', fontWeight: 600,
            fontSize: '0.88rem', cursor: 'pointer', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {/* Results */}
        {results && (
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
              📊 Ranked Results
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.map((r, i) => (
                <div key={r.id} style={{
                  background: i === 0 ? 'rgba(0,161,155,0.06)' : 'var(--glass-bg)',
                  border: `1px solid ${i === 0 ? 'rgba(0,161,155,0.25)' : 'var(--glass-border)'}`,
                  borderRadius: '14px', padding: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {i === 0 && <Trophy size={20} color="#ffc107" />}
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>#{i + 1} — {r.name}</span>
                    </div>
                    <span style={{ fontWeight: 900, fontSize: '1.1rem', color: i === 0 ? 'var(--primary-color)' : 'var(--text-color)' }}>
                      {r.total.toFixed(1)} pts
                    </span>
                  </div>
                  <div style={{ background: 'var(--glass-bg)', borderRadius: '20px', height: '10px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '20px',
                      background: i === 0 ? 'var(--primary-color)' : 'var(--glass-border)',
                      width: `${(r.total / maxTotal) * 100}%`,
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {((r.total / maxTotal) * 100).toFixed(1)}% of max score
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
