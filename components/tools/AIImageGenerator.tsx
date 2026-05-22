'use client';

import React, { useState } from 'react';
import { Sparkles, Download, Image as ImageIcon } from 'lucide-react';
import ReusableLoading from '../ui/ReusableLoading';

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [imageSrc, setImageSrc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setImageSrc('');

    // Pollinations AI provides free dynamic image generation via URL query
    const styleModifiers: Record<string, string> = {
      photorealistic: 'highly detailed photorealistic 8k octane render, cinematic lighting',
      cyberpunk: 'cyberpunk style, glowing neon lights, futuristic city, highly detailed, synthwave',
      anime: 'anime illustration style, vibrant colors, makoto shinkai aesthetic, high resolution',
      oilPainting: 'classical oil painting texture, fine art brushstrokes, dramatic chiaroscuro lighting',
      threeDRender: '3d claymation style render, soft materials, cute aesthetics, blender 3d look'
    };

    const modifier = styleModifiers[style] || '';
    const fullPrompt = `${prompt.trim()}, ${modifier}`;
    
    // Set source which will load the image asynchronously via image element
    setTimeout(() => {
      const targetUrl = `https://image.pollinations.ai/p/${encodeURIComponent(fullPrompt)}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
      setImageSrc(targetUrl);
    }, 1200);
  };

  const handleDownload = async () => {
    if (!imageSrc) return;
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `infinity_canvas_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback
      window.open(imageSrc, '_blank');
    }
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '750px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        AI Canvas Generator
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Convert descriptive natural sentences into stunning high-definition visual graphics in real-time.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'center' }}>
        
        {/* Form Controls */}
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Describe the Canvas Image</label>
            <textarea
              placeholder="e.g. An astronaut riding a horse on Mars during sunset..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="form-textarea"
              rows={4}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Artistic Rendering Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="form-select"
            >
              <option value="photorealistic">📸 Photorealistic (Cinematic lighting, 8K)</option>
              <option value="cyberpunk">🌃 Cyberpunk (Glowing neons, futuristic)</option>
              <option value="anime">🌸 Anime (Vibrant, hand-drawn look)</option>
              <option value="oilPainting">🎨 Classical Oil Painting (Brush stroke texture)</option>
              <option value="threeDRender">🧸 3D Render (Cute clay style, soft shadows)</option>
            </select>
          </div>

          <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
            <Sparkles size={18} /> {loading && !imageSrc ? 'Casting Canvas...' : 'Generate Canvas'}
          </button>
        </form>

        {/* Display Box */}
        <div className="glass-panel" style={{
          margin: 0,
          padding: '15px',
          background: 'rgba(0,0,0,0.01)',
          border: '1px solid var(--glass-border)',
          aspectRatio: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '15px'
        }}>
          {loading && !imageSrc ? (
            <div style={{ width: '100%' }}>
              <ReusableLoading type="skeleton" count={2} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '10px', textAlign: 'center' }}>
                Expanding prompt & styling pixels...
              </div>
            </div>
          ) : imageSrc ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <img
                src={imageSrc}
                alt="AI Generated Art"
                onLoad={() => setLoading(false)}
                style={{
                  width: '100%',
                  height: 'calc(100% - 50px)',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  boxShadow: 'var(--neon-shadow)'
                }}
              />
              <button
                onClick={handleDownload}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '10px', borderRadius: '10px' }}
              >
                <Download size={16} /> Download High-Res JPG
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              <ImageIcon size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Your Canvas Visuals Will Load Here</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
