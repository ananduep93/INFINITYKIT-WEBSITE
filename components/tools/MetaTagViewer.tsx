'use client';

import React, { useState } from 'react';
import { Search, Copy, Check, AlertTriangle, CheckCircle, XCircle, Info, Globe } from 'lucide-react';

interface MetaResult {
  tag: string;
  value: string | null;
  ideal?: { min?: number; max?: number };
  required?: boolean;
}

interface Section {
  title: string;
  icon: string;
  items: MetaResult[];
}

function extractMeta(html: string): Section[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const getMeta = (attr: string, value: string): string | null => {
    const el = doc.querySelector(`meta[${attr}="${value}"]`);
    return el?.getAttribute('content') ?? null;
  };

  const getLink = (rel: string): string | null => {
    const el = doc.querySelector(`link[rel="${rel}"]`);
    return el?.getAttribute('href') ?? null;
  };

  const title = doc.querySelector('title')?.textContent ?? null;

  return [
    {
      title: 'Essential Tags',
      icon: '📋',
      items: [
        { tag: 'Title Tag', value: title, ideal: { min: 50, max: 60 }, required: true },
        { tag: 'Meta Description', value: getMeta('name', 'description'), ideal: { min: 150, max: 160 }, required: true },
        { tag: 'Meta Keywords', value: getMeta('name', 'keywords') },
        { tag: 'Robots', value: getMeta('name', 'robots') },
        { tag: 'Canonical URL', value: getLink('canonical') },
        { tag: 'Charset', value: doc.querySelector('meta[charset]')?.getAttribute('charset') ?? null },
        { tag: 'Viewport', value: getMeta('name', 'viewport'), required: true },
      ],
    },
    {
      title: 'Open Graph (Facebook)',
      icon: '👥',
      items: [
        { tag: 'og:title', value: getMeta('property', 'og:title'), required: true },
        { tag: 'og:description', value: getMeta('property', 'og:description'), ideal: { min: 60, max: 200 } },
        { tag: 'og:image', value: getMeta('property', 'og:image'), required: true },
        { tag: 'og:url', value: getMeta('property', 'og:url') },
        { tag: 'og:type', value: getMeta('property', 'og:type') },
        { tag: 'og:site_name', value: getMeta('property', 'og:site_name') },
      ],
    },
    {
      title: 'Twitter Card',
      icon: '🐦',
      items: [
        { tag: 'twitter:card', value: getMeta('name', 'twitter:card'), required: true },
        { tag: 'twitter:title', value: getMeta('name', 'twitter:title') },
        { tag: 'twitter:description', value: getMeta('name', 'twitter:description'), ideal: { min: 60, max: 200 } },
        { tag: 'twitter:image', value: getMeta('name', 'twitter:image') },
        { tag: 'twitter:site', value: getMeta('name', 'twitter:site') },
      ],
    },
  ];
}

function computeSEOScore(sections: Section[]): number {
  let total = 0;
  let earned = 0;
  sections.forEach(section => {
    section.items.forEach(item => {
      if (item.required) {
        total += 15;
        if (item.value) {
          earned += 15;
          if (item.ideal) {
            const len = item.value.length;
            if (item.ideal.min && item.ideal.max) {
              if (len >= item.ideal.min && len <= item.ideal.max) earned += 0;
              else if (len > 0) earned -= 3;
            }
          }
        }
      } else {
        total += 5;
        if (item.value) earned += 5;
      }
    });
  });
  return Math.max(0, Math.min(100, Math.round((earned / total) * 100)));
}

const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>InfinityKit - Premium SaaS Tools Platform</title>
  <meta name="description" content="InfinityKit offers 100+ free premium tools for developers, designers, and content creators. PDF tools, image editors, AI writers and more.">
  <meta name="keywords" content="saas tools, free tools, pdf editor, image compressor, ai writer">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://infinitykit.app/">
  <meta property="og:title" content="InfinityKit - 100+ Premium SaaS Tools">
  <meta property="og:description" content="Access 100+ premium tools for free. No signup required.">
  <meta property="og:image" content="https://infinitykit.app/og-image.png">
  <meta property="og:url" content="https://infinitykit.app/">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="InfinityKit">
  <meta name="twitter:description" content="100+ free SaaS tools for everyone.">
</head>
<body></body>
</html>`;

export default function MetaTagViewer() {
  const [mode, setMode] = useState<'html' | 'url'>('html');
  const [htmlInput, setHtmlInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const handleAnalyze = () => {
    const html = htmlInput.trim();
    if (!html) { setError('Please paste HTML code first.'); return; }
    if (!html.includes('<') && !html.includes('html')) { setError('Input does not look like HTML.'); return; }
    setError('');
    try {
      const result = extractMeta(html);
      setSections(result);
      setSeoScore(computeSEOScore(result));
    } catch {
      setError('Failed to parse HTML. Please check the markup.');
    }
  };

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const getStatus = (item: MetaResult): 'pass' | 'warn' | 'fail' => {
    if (!item.value) return item.required ? 'fail' : 'warn';
    if (item.ideal) {
      const len = item.value.length;
      if (item.ideal.min && item.ideal.max) {
        if (len < item.ideal.min || len > item.ideal.max) return 'warn';
      }
    }
    return 'pass';
  };

  const StatusIcon = ({ status }: { status: 'pass' | 'warn' | 'fail' }) => {
    if (status === 'pass') return <CheckCircle size={16} color="#28a745" />;
    if (status === 'warn') return <AlertTriangle size={16} color="#ffc107" />;
    return <XCircle size={16} color="#dc3545" />;
  };

  const scoreColor = seoScore === null ? '#888' : seoScore >= 80 ? '#28a745' : seoScore >= 50 ? '#ffc107' : '#dc3545';

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
              Meta Tag Inspector & SEO Auditor
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
              Analyze HTML meta tags for SEO completeness and social sharing readiness.
            </p>
          </div>
          {seoScore !== null && (
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '12px 20px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>SEO Score</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{seoScore}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>out of 100</div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
            <button
              onClick={() => setMode('html')}
              className={`btn ${mode === 'html' ? '' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '6px 16px', border: 'none' }}
            >📄 Paste HTML</button>
            <button
              onClick={() => setMode('url')}
              className={`btn ${mode === 'url' ? '' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '6px 16px', border: 'none' }}
            ><Globe size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />URL</button>
          </div>

          {mode === 'html' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea
                value={htmlInput}
                onChange={e => { setHtmlInput(e.target.value); setError(''); }}
                className="form-textarea"
                placeholder="Paste full HTML source code here (Ctrl+U on any webpage to get source)..."
                style={{ minHeight: '180px', fontFamily: 'monospace', fontSize: '0.81rem', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn" style={{ flex: 1, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={handleAnalyze}>
                  <Search size={15} /> Analyze Meta Tags
                </button>
                <button className="btn btn-secondary" style={{ fontSize: '0.82rem' }} onClick={() => { setHtmlInput(SAMPLE_HTML); setSections([]); setSeoScore(null); setError(''); }}>
                  Load Sample
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '20px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
              <Globe size={28} style={{ color: 'var(--text-secondary)', marginBottom: '10px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                URL fetching is blocked by CORS in browsers.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Please use <strong>View Source (Ctrl+U)</strong> on the target page and paste the HTML below.
              </p>
              <button className="btn btn-secondary" style={{ marginTop: '12px', fontSize: '0.82rem' }} onClick={() => setMode('html')}>
                Switch to Paste HTML
              </button>
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.25)', borderRadius: '10px', padding: '10px 14px', color: '#e05565', fontSize: '0.84rem', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        {/* Results */}
        {sections.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sections.map((section, si) => (
              <div key={si} className="glass-panel" style={{ margin: 0, padding: '18px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
                  {section.icon} {section.title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {section.items.map((item, ii) => {
                    const status = getStatus(item);
                    const len = item.value?.length ?? 0;
                    return (
                      <div key={ii} style={{
                        display: 'grid',
                        gridTemplateColumns: '28px 150px 1fr auto',
                        gap: '10px',
                        alignItems: 'center',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '10px',
                        border: `1px solid ${status === 'fail' ? 'rgba(220,53,69,0.2)' : status === 'warn' ? 'rgba(255,193,7,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                        <StatusIcon status={status} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{item.tag}</span>
                        <div style={{ minWidth: 0 }}>
                          {item.value ? (
                            <>
                              <p style={{ fontSize: '0.83rem', margin: 0, wordBreak: 'break-all', lineHeight: 1.4 }}>{item.value}</p>
                              {item.ideal && (
                                <span style={{
                                  fontSize: '0.72rem',
                                  color: (item.ideal.min && item.ideal.max && (len < item.ideal.min || len > item.ideal.max)) ? '#ffc107' : '#28a745',
                                  display: 'block',
                                  marginTop: '2px',
                                }}>
                                  {len} chars {item.ideal.min && item.ideal.max ? `(ideal: ${item.ideal.min}–${item.ideal.max})` : ''}
                                </span>
                              )}
                            </>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: status === 'fail' ? '#e05565' : 'var(--text-secondary)', fontStyle: 'italic' }}>
                              {item.required ? '⚠ Missing (required for SEO)' : 'Not found'}
                            </span>
                          )}
                        </div>
                        {item.value && (
                          <button
                            onClick={() => handleCopy(item.value!, `${si}-${ii}`)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', flexShrink: 0 }}
                          >
                            {copiedKey === `${si}-${ii}` ? <Check size={13} color="#28a745" /> : <Copy size={13} />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
              {[
                { icon: <CheckCircle size={14} color="#28a745" />, label: 'Pass — tag found and within ideal length' },
                { icon: <AlertTriangle size={14} color="#ffc107" />, label: 'Warning — present but suboptimal length' },
                { icon: <XCircle size={14} color="#dc3545" />, label: 'Fail — required tag missing' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  {l.icon} {l.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
