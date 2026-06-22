'use client';

import React, { useState } from 'react';
import { Copy, Download, RefreshCw, AlertTriangle, Check, Code, Eye, Minimize2 } from 'lucide-react';

// Lightweight, high-performance recursive JSON tree viewer node
interface JSONNodeProps {
  name: string | number;
  value: any;
  isLast: boolean;
  depth: number;
}

function JSONTreeNode({ name, value, isLast, depth }: JSONNodeProps) {
  const [collapsed, setCollapsed] = useState(false);

  const getIndent = () => '  '.repeat(depth);

  if (value === null) {
    return (
      <div style={{ marginLeft: `${depth * 15}px`, fontSize: '0.85rem', fontFamily: 'monospace', lineHeight: 1.5 }}>
        <span style={{ color: '#00d2c4' }}>"{name}"</span>: <span style={{ color: '#888' }}>null</span>{!isLast && ','}
      </div>
    );
  }

  const type = typeof value;

  if (type === 'object') {
    const isArray = Array.isArray(value);
    const keys = Object.keys(value);
    const bracketOpen = isArray ? '[' : '{';
    const bracketClose = isArray ? ']' : '}';

    if (keys.length === 0) {
      return (
        <div style={{ marginLeft: `${depth * 15}px`, fontSize: '0.85rem', fontFamily: 'monospace', lineHeight: 1.5 }}>
          <span style={{ color: '#00d2c4' }}>"{name}"</span>: {bracketOpen}{bracketClose}{!isLast && ','}
        </div>
      );
    }

    return (
      <div style={{ marginLeft: `${depth * 15}px`, fontSize: '0.85rem', fontFamily: 'monospace', lineHeight: 1.5 }}>
        <span
          onClick={() => setCollapsed(!collapsed)}
          style={{ cursor: 'pointer', userSelect: 'none', color: '#00d2c4', fontWeight: 600 }}
        >
          {collapsed ? '▶' : '▼'} "{name}"
        </span>: {bracketOpen}
        
        {!collapsed && (
          <div style={{ borderLeft: '1px dashed rgba(255,255,255,0.1)', marginLeft: '10px' }}>
            {keys.map((key, idx) => (
              <JSONTreeNode
                key={key}
                name={key}
                value={value[key]}
                isLast={idx === keys.length - 1}
                depth={1}
              />
            ))}
          </div>
        )}
        
        {collapsed && <span style={{ color: '#888', fontSize: '0.75rem' }}> ...{keys.length} items... </span>}
        <span style={{ marginLeft: collapsed ? 0 : `${depth * 15}px` }}>{bracketClose}</span>{!isLast && ','}
      </div>
    );
  }

  // Primitive Types
  let valueSpan = null;
  if (type === 'string') {
    valueSpan = <span style={{ color: '#ec4899' }}>"{value}"</span>;
  } else if (type === 'number') {
    valueSpan = <span style={{ color: '#3b82f6' }}>{value}</span>;
  } else if (type === 'boolean') {
    valueSpan = <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{String(value)}</span>;
  }

  return (
    <div style={{ marginLeft: `${depth * 15}px`, fontSize: '0.85rem', fontFamily: 'monospace', lineHeight: 1.5 }}>
      <span style={{ color: '#00d2c4' }}>"{name}"</span>: {valueSpan}{!isLast && ','}
    </div>
  );
}

export default function JSONFormatter() {
  const [jsonInput, setJsonInput] = useState('{\n  "name": "InfinityKit",\n  "version": "2.0.0",\n  "features": [\n    "PDF Tools",\n    "Image Processing",\n    "AI Copywriting"\n  ],\n  "active": true,\n  "stats": {\n    "conversions": 14890,\n    "uptime": 0.999\n  }\n}');
  const [formattedJson, setFormattedJson] = useState('');
  const [parsedObject, setParsedObject] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'tree'>('text');

  const handleFormat = (indentSpaces: number) => {
    try {
      setErrorMsg('');
      const parsed = JSON.parse(jsonInput);
      setParsedObject(parsed);
      const out = JSON.stringify(parsed, null, indentSpaces);
      setFormattedJson(out);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON format structure.');
      setParsedObject(null);
      setFormattedJson('');
    }
  };

  const handleMinify = () => {
    try {
      setErrorMsg('');
      const parsed = JSON.parse(jsonInput);
      setParsedObject(parsed);
      const out = JSON.stringify(parsed);
      setFormattedJson(out);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON format structure.');
      setParsedObject(null);
      setFormattedJson('');
    }
  };

  const handleCopy = () => {
    const textToCopy = formattedJson || jsonInput;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const data = formattedJson || jsonInput;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `infinitykit_formatted_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    setJsonInput(JSON.stringify({
      title: "InfinityKit SaaS Framework",
      categories: ["Audio Tools", "Video Tools", "Developer Suite", "AI Writers"],
      limits: {
        maxUploadMB: 50,
        requestsPerHour: 100
      },
      verified: true
    }, null, 2));
    setErrorMsg('');
    setParsedObject(null);
    setFormattedJson('');
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        JSON Editor & Code Formatter
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Prettify, validate, parse, and analyze raw JSON data into clean collapsible visual tree views.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'stretch' }}>
        
        {/* Editor Input Block */}
        <div className="glass-panel" style={{ margin: 0, padding: '25px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Raw Input Code</h3>
            <button
              onClick={loadSample}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Load Sample JSON
            </button>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="form-textarea"
            style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              minHeight: '260px',
              background: 'rgba(0,0,0,0.15)',
              border: '1px solid var(--glass-border)'
            }}
            placeholder="Paste your unformatted JSON here..."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '15px' }}>
            <button onClick={() => handleFormat(2)} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '10px 5px' }}>
              Format 2 Spaces
            </button>
            <button onClick={() => handleFormat(4)} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '10px 5px' }}>
              Format 4 Spaces
            </button>
            <button onClick={handleMinify} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '10px 5px' }}>
              Minify Block
            </button>
          </div>
        </div>

        {/* Visualized Output Block */}
        <div className="glass-panel" style={{ margin: 0, padding: '25px', display: 'flex', flexDirection: 'column' }}>
          
          {/* Format Tab Selectors */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '5px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '4px' }}>
              <button
                onClick={() => setActiveTab('text')}
                className={`btn ${activeTab === 'text' ? '' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '6px 12px', border: 'none' }}
              >
                <Code size={12} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Prettified
              </button>
              <button
                onClick={() => {
                  setActiveTab('tree');
                  if (!parsedObject) {
                    try {
                      setParsedObject(JSON.parse(jsonInput));
                    } catch (e) {}
                  }
                }}
                className={`btn ${activeTab === 'tree' ? '' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '6px 12px', border: 'none' }}
              >
                <Eye size={12} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Tree Explorer
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCopy}
                className="btn btn-secondary"
                style={{ padding: '6px', borderRadius: '8px' }}
                title="Copy structured code"
              >
                {copied ? <Check size={14} color="#28a745" /> : <Copy size={14} />}
              </button>
              <button
                onClick={handleDownload}
                className="btn btn-secondary"
                style={{ padding: '6px', borderRadius: '8px' }}
                title="Download JSON File"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* Error Alert Display */}
          {errorMsg ? (
            <div style={{
              background: 'rgba(220,53,69,0.1)',
              border: '1px solid rgba(220,53,69,0.2)',
              borderRadius: '10px',
              padding: '12px 15px',
              color: '#dc3545',
              fontSize: '0.8rem',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              lineHeight: 1.4,
              flex: 1
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>JSON Parsing Error:</strong>
                <div>{errorMsg}</div>
              </div>
            </div>
          ) : activeTab === 'tree' && parsedObject ? (
            <div style={{
              flex: 1,
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '12px',
              padding: '15px',
              overflowY: 'auto',
              maxHeight: '320px',
              border: '1px solid var(--glass-border)'
            }}>
              <JSONTreeNode name="root" value={parsedObject} isLast={true} depth={0} />
            </div>
          ) : (
            <textarea
              readOnly
              value={formattedJson || 'Awaiting valid JSON format computations...'}
              className="form-textarea"
              style={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                minHeight: '260px',
                background: 'rgba(0,0,0,0.2)',
                color: formattedJson ? 'var(--text-color)' : 'var(--text-secondary)',
                border: '1px solid var(--glass-border)'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
