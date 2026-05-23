'use client';

import React, { useState } from 'react';
import { Copy, Check, Sliders, Palette, Eye } from 'lucide-react';

const BACKGROUNDS = [
  { label: 'Purple Gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { label: 'Ocean Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { label: 'Aurora', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { label: 'Emerald', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { label: 'Midnight', value: 'linear-gradient(135deg, #0c0c1d 0%, #111132 50%, #0c0c1d 100%)' },
  { label: 'Amber', value: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
  { label: 'Rose Quartz', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { label: 'Dark Mesh', value: 'radial-gradient(circle at 20% 80%, #120078 0%, #000 50%), radial-gradient(circle at 80% 10%, #1a0050 0%, transparent 50%)' },
];

export default function GlassmorphicGenerator() {
  const [blur, setBlur] = useState(12);
  const [opacity, setOpacity] = useState(0.15);
  const [borderOpacity, setBorderOpacity] = useState(0.3);
  const [borderRadius, setBorderRadius] = useState(20);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [bgIndex, setBgIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const glassBg = `rgba(${parseInt(bgColor.slice(1, 3), 16)}, ${parseInt(bgColor.slice(3, 5), 16)}, ${parseInt(bgColor.slice(5, 7), 16)}, ${opacity.toFixed(2)})`;
  const glassCSS = `/* Glassmorphism Card */
.glass-card {
  background: ${glassBg};
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  border: 1px solid rgba(${parseInt(bgColor.slice(1, 3), 16)}, ${parseInt(bgColor.slice(3, 5), 16)}, ${parseInt(bgColor.slice(5, 7), 16)}, ${borderOpacity.toFixed(2)});
  border-radius: ${borderRadius}px;
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(glassCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SliderRow = ({
    label, value, min, max, step = 1, unit, onChange
  }: {
    label: string; value: number; min: number; max: number; step?: number; unit: string;
    onChange: (v: number) => void;
  }) => (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>
        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary-color)', minWidth: '60px', textAlign: 'right' }}>
          {step < 1 ? value.toFixed(2) : value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer', height: '4px' }}
      />
    </div>
  );

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel" style={{ maxWidth: '960px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
          Glassmorphic CSS Generator
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
          Fine-tune and export premium glass-effect CSS with a live preview.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Controls */}
          <div>
            <div className="glass-panel" style={{ margin: 0, padding: '22px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} style={{ color: 'var(--primary-color)' }} /> Adjustments
              </h3>

              <SliderRow label="Blur Intensity" value={blur} min={0} max={40} unit="px" onChange={setBlur} />
              <SliderRow label="Background Opacity" value={opacity} min={0} max={1} step={0.01} unit="" onChange={setOpacity} />
              <SliderRow label="Border Opacity" value={borderOpacity} min={0} max={1} step={0.01} unit="" onChange={setBorderOpacity} />
              <SliderRow label="Border Radius" value={borderRadius} min={0} max={40} unit="px" onChange={setBorderRadius} />

              {/* Color Picker */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  <Palette size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  Glass Color
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    style={{ width: '48px', height: '40px', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'none', cursor: 'pointer', padding: '2px' }}
                  />
                  <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 600 }}>{bgColor.toUpperCase()}</span>
                </div>
              </div>

              {/* Background Selector */}
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                  Preview Background
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {BACKGROUNDS.map((bg, i) => (
                    <button
                      key={i}
                      onClick={() => setBgIndex(i)}
                      title={bg.label}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: '10px',
                        background: bg.value,
                        border: bgIndex === i ? '2px solid var(--primary-color)' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'transform 0.15s',
                        boxShadow: bgIndex === i ? '0 0 0 2px rgba(255,255,255,0.2)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview + Code */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Live Preview */}
            <div style={{
              background: BACKGROUNDS[bgIndex].value,
              borderRadius: '16px',
              padding: '40px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '220px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Decorative blobs */}
              <div style={{ position: 'absolute', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', top: '-30px', right: '-20px', filter: 'blur(20px)' }} />
              <div style={{ position: 'absolute', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', bottom: '-10px', left: '20px', filter: 'blur(15px)' }} />

              <div style={{
                background: glassBg,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                border: `1px solid rgba(${parseInt(bgColor.slice(1, 3), 16)}, ${parseInt(bgColor.slice(3, 5), 16)}, ${parseInt(bgColor.slice(5, 7), 16)}, ${borderOpacity.toFixed(2)})`,
                borderRadius: `${borderRadius}px`,
                padding: '24px 28px',
                textAlign: 'center',
                maxWidth: '240px',
                zIndex: 1,
              }}>
                <Eye size={22} style={{ marginBottom: '8px', color: '#fff', opacity: 0.9 }} />
                <p style={{ fontWeight: 700, fontSize: '1.05rem', margin: '0 0 6px', color: '#fff' }}>Glass Card</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Live preview of your glass effect</p>
              </div>
            </div>

            {/* Generated CSS */}
            <div className="glass-panel" style={{ margin: 0, padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Generated CSS</h3>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                  onClick={handleCopy}
                >
                  {copied ? <Check size={13} color="#28a745" /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy CSS'}
                </button>
              </div>
              <pre style={{
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                background: 'rgba(0,0,0,0.25)',
                borderRadius: '10px',
                padding: '14px',
                margin: 0,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                lineHeight: 1.6,
                color: 'var(--text-color)',
                border: '1px solid var(--glass-border)',
              }}>
                {glassCSS}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
