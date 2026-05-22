'use client';

import React, { useState } from 'react';
import { Code, Copy, Check, Trash2, FileCode, Play, Sparkles } from 'lucide-react';

export default function JSONToTS() {
  const [jsonInput, setJsonInput] = useState('{\n  "id": 101,\n  "name": "Infinity Kit Premium",\n  "active": true,\n  "tags": ["utility", "web", "ai"],\n  "metrics": {\n    "views": 4520,\n    "rating": 4.9\n  },\n  "releases": [\n    {\n      "version": "1.0.0",\n      "date": "2026-05-22"\n    }\n  ]\n}');
  const [tsOutput, setTsOutput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const inferType = (val: any, keyName: string, interfaces: { name: string; body: string }[]): string => {
    if (val === null) return 'any';
    if (typeof val === 'string') return 'string';
    if (typeof val === 'number') return 'number';
    if (typeof val === 'boolean') return 'boolean';

    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      const sample = val[0];
      const sampleType = inferType(sample, keyName, interfaces);
      
      // If it's a nested object array, we create a plural-stripped custom interface name
      if (typeof sample === 'object' && sample !== null) {
        const singularName = capitalize(keyName.replace(/s$/, '')) + 'Item';
        buildInterface(sample, singularName, interfaces);
        return `${singularName}[]`;
      }
      return `${sampleType}[]`;
    }

    if (typeof val === 'object') {
      const customName = capitalize(keyName);
      buildInterface(val, customName, interfaces);
      return customName;
    }

    return 'any';
  };

  const buildInterface = (obj: Record<string, any>, name: string, interfaces: { name: string; body: string }[]) => {
    // Avoid double creation of same-named interfaces
    if (interfaces.some(i => i.name === name)) return;

    let body = `export interface ${name} {\n`;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const inferred = inferType(value, key, interfaces);
        body += `  ${key}: ${inferred};\n`;
      }
    }
    body += `}`;
    
    interfaces.push({ name, body });
  };

  const handleConvert = () => {
    setErrorMsg('');
    setTsOutput('');
    try {
      const parsed = JSON.parse(jsonInput.trim());
      if (typeof parsed !== 'object' || parsed === null) {
        setErrorMsg('Input must be a valid JSON object or array of objects.');
        return;
      }

      const collectedInterfaces: { name: string; body: string }[] = [];
      
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          setErrorMsg('Array is empty, could not infer structural interfaces.');
          return;
        }
        buildInterface(parsed[0], 'RootObject', collectedInterfaces);
      } else {
        buildInterface(parsed, 'RootObject', collectedInterfaces);
      }

      // Reverse so dependencies appear before the root structure
      const rendered = collectedInterfaces
        .map(item => item.body)
        .reverse()
        .join('\n\n');

      setTsOutput(rendered);
    } catch (e: any) {
      setErrorMsg(`Invalid JSON Syntax: ${e.message}`);
    }
  };

  const formatJson = () => {
    setErrorMsg('');
    try {
      const parsed = JSON.parse(jsonInput.trim());
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch (e: any) {
      setErrorMsg(`Format Error: ${e.message}`);
    }
  };

  const handleCopy = () => {
    if (!tsOutput) return;
    navigator.clipboard.writeText(tsOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setJsonInput('');
    setTsOutput('');
    setErrorMsg('');
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        JSON to TypeScript Converter
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Convert complex, deeply nested JSON configurations instantly into clean, fully-typed TypeScript interface maps 100% locally.
      </p>

      {/* Code Editor Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* JSON input panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Code size={16} color="var(--primary-color)" /> JSON Input
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={formatJson}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '5px' }}
              >
                Beautify
              </button>
              <button
                onClick={clearAll}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={13} /> Clear
              </button>
            </div>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON configuration here..."
            style={{
              width: '100%',
              height: '350px',
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '0.85rem',
              lineHeight: 1.5,
              padding: '15px',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.03)',
              border: '1px solid var(--glass-border)',
              outline: 'none',
              color: 'var(--text-color)',
              resize: 'vertical'
            }}
          />
        </div>

        {/* TypeScript output panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileCode size={16} color="var(--primary-color)" /> TypeScript Interfaces
            </span>
            {tsOutput && (
              <button
                onClick={handleCopy}
                className="btn btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {copied ? <Check size={12} color="var(--success-color)" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <textarea
              readOnly
              value={tsOutput}
              placeholder="TypeScript interfaces will generate here..."
              style={{
                width: '100%',
                height: '350px',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '0.85rem',
                lineHeight: 1.5,
                padding: '15px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.01)',
                border: '1px dashed var(--glass-border)',
                outline: 'none',
                color: 'var(--primary-color)',
                fontWeight: 600,
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 18px',
          borderRadius: '8px',
          backgroundColor: 'rgba(220, 53, 69, 0.05)',
          border: '1px solid rgba(220, 53, 69, 0.15)',
          color: 'var(--error-color)',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          {errorMsg}
        </div>
      )}

      {/* Generate trigger */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleConvert}
          className="btn"
          style={{ minWidth: '220px' }}
        >
          <Play size={18} /> Generate Interfaces
        </button>
      </div>

      {/* Interactive tip */}
      <div style={{
        marginTop: '25px',
        padding: '15px',
        borderRadius: '10px',
        backgroundColor: 'rgba(0, 161, 155, 0.05)',
        border: '1px solid rgba(0, 161, 155, 0.15)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Sparkles size={18} color="var(--primary-color)" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          <strong>Advanced Parsing Engine:</strong> Our type inferrer automatically matches JSON arrays, resolves sub-configurations into modular nested TypeScript interface classes, mappings, and strips trailing plural structures for readable naming.
        </div>
      </div>
    </div>
  );
}
