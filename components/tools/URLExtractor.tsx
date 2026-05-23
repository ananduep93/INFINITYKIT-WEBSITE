'use client';

import React, { useState } from 'react';
import { Link, Copy, Check, Trash2, Plus, Globe, Hash, ChevronRight, RefreshCw } from 'lucide-react';

interface Param {
  key: string;
  value: string;
  decoded: string;
}

interface ParsedURL {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  hash: string;
  params: Param[];
  origin: string;
}

function parseURL(raw: string): ParsedURL | null {
  try {
    const url = new URL(raw.trim().startsWith('http') ? raw.trim() : `https://${raw.trim()}`);
    const params: Param[] = [];
    url.searchParams.forEach((value, key) => {
      params.push({ key, value, decoded: decodeURIComponent(value) });
    });
    return {
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      hash: url.hash.replace('#', ''),
      params,
      origin: url.origin,
    };
  } catch {
    return null;
  }
}

function buildURL(base: string, params: Param[]): string {
  try {
    const baseUrl = base.trim().startsWith('http') ? base.trim() : `https://${base.trim()}`;
    const url = new URL(baseUrl);
    url.search = '';
    params.forEach(p => {
      if (p.key.trim()) url.searchParams.append(p.key.trim(), p.value);
    });
    return url.toString();
  } catch {
    return '';
  }
}

export default function URLExtractor() {
  const [input, setInput] = useState('https://example.com/search?q=infinitykit&page=2&sort=desc&lang=en#results');
  const [parsed, setParsed] = useState<ParsedURL | null>(null);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [editableParams, setEditableParams] = useState<Param[]>([]);
  const [builtURL, setBuiltURL] = useState('');
  const [builtCopied, setBuiltCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'inspect' | 'build'>('inspect');

  const handleParse = () => {
    const result = parseURL(input);
    if (!result) {
      setError('Invalid URL. Please check the format.');
      setParsed(null);
    } else {
      setError('');
      setParsed(result);
      setEditableParams(result.params.map(p => ({ ...p })));
    }
  };

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleAddParam = () => {
    setEditableParams(prev => [...prev, { key: '', value: '', decoded: '' }]);
  };

  const handleEditParam = (idx: number, field: keyof Param, value: string) => {
    setEditableParams(prev => prev.map((p, i) => {
      if (i !== idx) return p;
      const updated = { ...p, [field]: value };
      if (field === 'value') updated.decoded = decodeURIComponent(value);
      return updated;
    }));
  };

  const handleRemoveParam = (idx: number) => {
    setEditableParams(prev => prev.filter((_, i) => i !== idx));
  };

  const handleBuild = () => {
    const baseURL = parsed?.origin + (parsed?.pathname || '/');
    const result = buildURL(baseURL, editableParams);
    setBuiltURL(result);
  };

  const handleBuiltCopy = () => {
    navigator.clipboard.writeText(builtURL);
    setBuiltCopied(true);
    setTimeout(() => setBuiltCopied(false), 2000);
  };

  const InfoRow = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 14px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '10px',
      marginBottom: '8px',
    }}>
      {icon && <span style={{ color: 'var(--primary-color)', flexShrink: 0 }}>{icon}</span>}
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', minWidth: '90px', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }}>{value || <em style={{ opacity: 0.4 }}>empty</em>}</span>
      {value && (
        <button
          onClick={() => handleCopy(value, label)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}
        >
          {copiedKey === label ? <Check size={13} color="#28a745" /> : <Copy size={13} />}
        </button>
      )}
    </div>
  );

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
          URL Query Parameter Extractor
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Decode, inspect, and reconstruct URL components and query parameters.
        </p>

        {/* URL Input */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 360px' }}>
            <Link size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setParsed(null); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleParse()}
              placeholder="https://example.com/page?key=value&other=123"
              className="form-input"
              style={{ paddingLeft: '40px', width: '100%', fontFamily: 'monospace', fontSize: '0.84rem' }}
            />
          </div>
          <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }} onClick={handleParse}>
            <Globe size={15} /> Parse URL
          </button>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => { setInput(''); setParsed(null); setError(''); setBuiltURL(''); }}>
            <Trash2 size={14} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.25)', borderRadius: '10px', padding: '12px 16px', color: '#e05565', fontSize: '0.85rem', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {parsed && (
          <>
            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
              {(['inspect', 'build'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`btn ${activeTab === tab ? '' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', padding: '7px 18px', textTransform: 'capitalize', border: 'none' }}
                >
                  {tab === 'inspect' ? '🔍 Inspect' : '🔧 Build URL'}
                </button>
              ))}
            </div>

            {activeTab === 'inspect' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {/* URL Structure */}
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    URL Structure
                  </h3>
                  <InfoRow label="Protocol" value={parsed.protocol} icon={<Globe size={14} />} />
                  <InfoRow label="Hostname" value={parsed.hostname} icon={<ChevronRight size={14} />} />
                  <InfoRow label="Port" value={parsed.port} icon={<Hash size={14} />} />
                  <InfoRow label="Pathname" value={parsed.pathname} icon={<ChevronRight size={14} />} />
                  <InfoRow label="Hash / Fragment" value={parsed.hash} icon={<Hash size={14} />} />
                </div>

                {/* Query Params */}
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Query Parameters ({parsed.params.length})
                  </h3>
                  {parsed.params.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                      No query parameters found.
                    </div>
                  ) : (
                    <div style={{ borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '9px 12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--glass-border)' }}>Key</th>
                            <th style={{ padding: '9px 12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--glass-border)' }}>Raw Value</th>
                            <th style={{ padding: '9px 12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--glass-border)' }}>Decoded</th>
                            <th style={{ padding: '9px 12px', borderBottom: '1px solid var(--glass-border)', width: '36px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsed.params.map((p, i) => (
                            <tr key={i} style={{ borderBottom: i < parsed.params.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                              <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: 'var(--primary-color)', fontWeight: 600 }}>{p.key}</td>
                              <td style={{ padding: '9px 12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{p.value}</td>
                              <td style={{ padding: '9px 12px', fontFamily: 'monospace', wordBreak: 'break-all', color: '#28a745' }}>{p.decoded}</td>
                              <td style={{ padding: '9px 12px' }}>
                                <button
                                  onClick={() => handleCopy(p.decoded, `param-${i}`)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                >
                                  {copiedKey === `param-${i}` ? <Check size={13} color="#28a745" /> : <Copy size={13} />}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'build' && (
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Edit Parameters & Reconstruct URL
                </h3>
                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {editableParams.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        value={p.key}
                        onChange={e => handleEditParam(i, 'key', e.target.value)}
                        placeholder="key"
                        style={{ flex: '1 1 100px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-color)', fontSize: '0.84rem', outline: 'none', fontFamily: 'monospace' }}
                      />
                      <span style={{ color: 'var(--text-secondary)' }}>=</span>
                      <input
                        value={p.value}
                        onChange={e => handleEditParam(i, 'value', e.target.value)}
                        placeholder="value"
                        style={{ flex: '2 1 160px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-color)', fontSize: '0.84rem', outline: 'none', fontFamily: 'monospace' }}
                      />
                      <button onClick={() => handleRemoveParam(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', padding: '4px' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleAddParam}>
                    <Plus size={14} /> Add Parameter
                  </button>
                  <button className="btn" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleBuild}>
                    <RefreshCw size={14} /> Build URL
                  </button>
                </div>
                {builtURL && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--glass-border)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <code style={{ fontSize: '0.83rem', flex: 1, wordBreak: 'break-all', lineHeight: 1.6, fontFamily: 'monospace', color: 'var(--primary-color)' }}>{builtURL}</code>
                    <button onClick={handleBuiltCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 }}>
                      {builtCopied ? <Check size={15} color="#28a745" /> : <Copy size={15} />}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
