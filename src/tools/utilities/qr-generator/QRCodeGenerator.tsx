'use client';

import React, { useState } from 'react';
import { Download, Sparkles, QrCode } from 'lucide-react';
import ReusableLoading from '../../../components/ui/ReusableLoading';

export default function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [size, setSize] = useState('250');
  const [color, setColor] = useState('000000');
  const [bgColor, setBgColor] = useState('ffffff');
  const [qrSrc, setQrSrc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setQrSrc('');

    // QR Server API: free dynamic QR generator
    setTimeout(() => {
      const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${color}&ecc=M&margin=1&bgcolor=${bgColor}`;
      setQrSrc(src);
    }, 500);
  };

  const handleDownload = async () => {
    if (!qrSrc) return;
    try {
      const response = await fetch(qrSrc);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `infinity_qr_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(qrSrc, '_blank');
    }
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '750px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Dynamic QR Engine
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Create instantly scannable codes for links, text, or contacts with fully customized colors.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'center' }}>
        
        {/* Form Controls */}
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>QR Code Data (URL or Text)</label>
            <input
              type="text"
              placeholder="e.g. https://google.com"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Size (Pixels)</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="form-select"
            >
              <option value="150">150 x 150 (Compact)</option>
              <option value="250">250 x 250 (Medium)</option>
              <option value="500">500 x 500 (High Definition)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Foreground Color</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="form-select"
              >
                <option value="000000">⬛ Black</option>
                <option value="00A19B">🐳 Primary Teal</option>
                <option value="dc3545">🔴 Red</option>
                <option value="28a745">🟢 Green</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Background Color</label>
              <select
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="form-select"
              >
                <option value="ffffff">⬜ White</option>
                <option value="E4DDD3">👝 Cream Warm</option>
                <option value="f5f1eb">📂 Off White</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn" style={{ width: '100%' }}>
            <Sparkles size={18} /> Generate QR Code
          </button>
        </form>

        {/* QR Code Display Card */}
        <div className="glass-panel" style={{
          margin: 0,
          padding: '25px',
          background: 'rgba(0,0,0,0.01)',
          border: '1px solid var(--glass-border)',
          aspectRatio: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '15px'
        }}>
          {loading && !qrSrc ? (
            <ReusableLoading type="skeleton" count={2} />
          ) : qrSrc ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <img
                src={qrSrc}
                alt="Dynamic QR Code"
                onLoad={() => setLoading(false)}
                style={{
                  maxWidth: '180px',
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '10px',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--neon-shadow)',
                  background: 'white',
                  padding: '8px'
                }}
              />
              <button
                onClick={handleDownload}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '10px', borderRadius: '10px', fontSize: '0.85rem' }}
              >
                <Download size={16} /> Download PNG
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              <QrCode size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Your Scannable QR Will Load Here</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
