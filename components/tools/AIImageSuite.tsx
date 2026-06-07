'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  Download,
  Image,
  RefreshCw,
  Sliders,
  Share2,
  Trash2,
  ExternalLink,
  HelpCircle,
  Key
} from 'lucide-react';

interface AIImageSuiteProps {
  initialPreset?: 'general' | 'art' | 'avatar' | 'headshot' | 'logo' | 'wallpaper' | 'poster';
}

interface SavedGeneration {
  id: string;
  prompt: string;
  preset: string;
  url: string;
  timestamp: string;
  aspect: string;
}

export default function AIImageSuite({ initialPreset = 'general' }: AIImageSuiteProps) {
  const [preset, setPreset] = useState(initialPreset);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('flux'); // flux, turbo
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1000000));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  
  // Custom Styles selector based on preset
  const [selectedStyle, setSelectedStyle] = useState<string>('none');
  const [openaiKey, setOpenaiKey] = useState<string>('');
  const [useOpenAI, setUseOpenAI] = useState<boolean>(false);

  const saveOpenaiKey = (val: string) => {
    setOpenaiKey(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('infinitykit_openai_key', val);
      const savedSettings = JSON.parse(localStorage.getItem('infinityKitSettings') || '{}');
      savedSettings.openaiKey = val;
      localStorage.setItem('infinityKitSettings', JSON.stringify(savedSettings));
    }
  };
  
  const [history, setHistory] = useState<SavedGeneration[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Mobile check removed - using CSS media queries

  // Sync settings and history from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Sync OpenAI Settings Key
      const savedSettings = JSON.parse(localStorage.getItem('infinityKitSettings') || '{}');
      const globalOpenaiKey = localStorage.getItem('infinitykit_openai_key') || savedSettings.openaiKey || '';
      if (globalOpenaiKey) {
        setOpenaiKey(globalOpenaiKey);
        setUseOpenAI(true);
      }

      // 2. Load Generation History
      const savedHistory = JSON.parse(localStorage.getItem('infinitykit_ai_images') || '[]');
      setHistory(savedHistory);

      // 3. Favorites state
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favs.includes(`ai-${preset}-generator`));

      // 4. Track history access
      import('../../lib/sync').then((m) => {
        m.default.addToHistory(`ai-${preset}-generator`);
      });
    }
  }, [preset]);

  const toggleFavorite = () => {
    if (typeof window === 'undefined') return;
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favKey = `ai-${preset}-generator`;
    let updated;
    if (isFavorite) {
      updated = favs.filter((id: string) => id !== favKey);
    } else {
      updated = [...favs, favKey];
    }
    localStorage.setItem('favorites', JSON.stringify(updated));
    setIsFavorite(!isFavorite);
    
    import('../../lib/sync').then((m) => {
      m.default.saveFavorite(favKey, !isFavorite);
    });
  };

  // Helper styles categories mapping
  const presetsInfo: Record<string, { title: string; desc: string; styles: { label: string; suffix: string }[] }> = {
    general: {
      title: 'AI Image Generator',
      desc: 'Create highly detailed graphics using direct prompt translation.',
      styles: [
        { label: 'None', suffix: '' },
        { label: 'Photorealistic', suffix: ', photographic style, highly detailed, 8k resolution, cinematic lighting' },
        { label: '3D Render', suffix: ', unreal engine 5 render, highly detailed, raytracing, octanerender' }
      ]
    },
    art: {
      title: 'AI Art Generator',
      desc: 'Synthesize standard text inputs into specific expressive art styles.',
      styles: [
        { label: 'Impressionism', suffix: ', impressionist painting, visible brushstrokes, oil on canvas, textured' },
        { label: 'Cyberpunk', suffix: ', cyberpunk digital art style, glowing neon lights, futuristic cityscape' },
        { label: 'Watercolor', suffix: ', watercolor illustration, soft pastels, ink washes, splash drips' },
        { label: 'Ukiyo-e', suffix: ', traditional Japanese woodblock print, ukiyo-e style, clean lines, vintage paper texture' },
        { label: 'Charcoal Sketch', suffix: ', charcoal pencil sketch drawing, monochrome, textured shading' }
      ]
    },
    avatar: {
      title: 'AI Avatar Generator',
      desc: 'Generate custom futuristic or cartoon headshot avatars.',
      styles: [
        { label: '3D Cartoon', suffix: ', cute 3D cartoon avatar, Disney Pixar style, friendly expression, solid background' },
        { label: 'Pixel Art', suffix: ', 8-bit retro pixel art avatar, isometric design, clean retro game style' },
        { label: 'Sci-Fi Cyborg', suffix: ', sci-fi cyborg avatar, glowing cybernetic eye implants, metallic accents' },
        { label: 'Vector Minimalist', suffix: ', flat minimalist vector graphic, avatar icon design, circular boundary' }
      ]
    },
    headshot: {
      title: 'AI Headshot Generator',
      desc: 'Synthesize LinkedIn or studio-grade professional profiles.',
      styles: [
        { label: 'LinkedIn Suit', suffix: ', corporate professional business suit, neutral gray studio background, office lighting' },
        { label: 'Casual Studio', suffix: ', casual headshot portrait, warm studio portrait lighting, shallow depth of field' },
        { label: 'Executive Portrait', suffix: ', executive editorial profile, professional corporate portrait photography' }
      ]
    },
    logo: {
      title: 'AI Logo Generator',
      desc: 'Create modern branding emblems and badges.',
      styles: [
        { label: 'Minimalist Glyph', suffix: ', minimalist clean logo glyph symbol, flat flat design, white vector background' },
        { label: 'Badge Emblem', suffix: ', retro circular badge emblem logo, clean contours, high-contrast colors' },
        { label: 'Tech Mascot', suffix: ', modern clean tech corporate mascot logo, bold lines, solid dark background' }
      ]
    },
    wallpaper: {
      title: 'AI Wallpaper Generator',
      desc: 'Generate wide high-resolution desktop or landscape backgrounds.',
      styles: [
        { label: 'Fantasy Landscape', suffix: ', mystical fantasy mountains, glowing streams, nebula star night sky, wallpaper' },
        { label: 'Ambient Minimalist', suffix: ', dark ambient minimalist desktop background wallpaper, abstract fluid waves' },
        { label: 'Retro Neon Synthwave', suffix: ', neon synthwave sunset wallpaper grid road, palm trees silhouette' }
      ]
    },
    poster: {
      title: 'AI Poster Generator',
      desc: 'Design beautiful, vertical poster graphic assets.',
      styles: [
        { label: 'Vintage Art Deco', suffix: ', vintage retro Art Deco style travel poster, clean typographic framing' },
        { label: 'Bauhaus Modern', suffix: ', geometric abstract Bauhaus poster design, primary colors, typography mockup' },
        { label: 'Minimalist Film Noir', suffix: ', minimalist film noir movie poster design, heavy shadows, high contrast silhouette' }
      ]
    }
  };

  const currentInfo = presetsInfo[preset] || presetsInfo.general;

  // Build full enhanced prompt
  const getFullPrompt = (): string => {
    let base = prompt.trim();
    if (!base) return '';

    // Aspect helpers
    if (preset === 'wallpaper') {
      base += ', ultra-wide aspect landscape';
    } else if (preset === 'poster') {
      base += ', vertical portrait graphic poster';
    } else if (preset === 'avatar') {
      base += ', isolated portrait profile photo';
    } else if (preset === 'logo') {
      base += ', flat isolated white background logo';
    }

    // Selected style suffix
    const styleObj = currentInfo.styles.find(s => s.label === selectedStyle);
    if (styleObj && styleObj.suffix) {
      base += styleObj.suffix;
    }

    return base;
  };

  // Generate Image Action
  const generateImage = async () => {
    const fullPrompt = getFullPrompt();
    if (!fullPrompt) return;

    setIsGenerating(true);
    setGeneratedUrl(null);

    // Calculate dimensions
    let w = 512;
    let h = 512;
    if (aspectRatio === '16:9') { w = 768; h = 432; }
    else if (aspectRatio === '4:3') { w = 640; h = 480; }
    else if (aspectRatio === '9:16') { w = 432; h = 768; }

    try {
      if (useOpenAI && openaiKey) {
        // OpenAI DALL-E 3 Call
        const res = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: fullPrompt,
            n: 1,
            size: '1024x1024' // OpenAI expects square ratios
          })
        });

        if (!res.ok) {
          throw new Error('OpenAI Image API failed or key has expired.');
        }

        const data = await res.json();
        const finalUrl = data.data?.[0]?.url;
        if (finalUrl) {
          // Download or set directly
          setGeneratedUrl(finalUrl);
          saveToHistoryList(prompt, finalUrl);
        }
      } else {
        // Free Pollinations Flux Call (fully client side!)
        // Pollinations supports seed caching
        const finalPromptUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${w}&height=${h}&seed=${seed}&nologo=true&enhance=true&model=${model}`;
        
        // Pre-fetch/cache image loading
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setGeneratedUrl(finalPromptUrl);
          saveToHistoryList(prompt, finalPromptUrl);
          setIsGenerating(false);
        };
        img.onerror = () => {
          // Fallback direct url loading
          setGeneratedUrl(finalPromptUrl);
          setIsGenerating(false);
        };
        img.src = finalPromptUrl;
        return; // Don't turn off isGenerating until image onload finishes
      }
    } catch (err: any) {
      alert(err.message || 'Generation failed.');
    } finally {
      if (useOpenAI) setIsGenerating(false);
    }
  };

  const saveToHistoryList = (originalPrompt: string, url: string) => {
    const item: SavedGeneration = {
      id: `ai-${Date.now()}`,
      prompt: originalPrompt,
      preset: preset,
      url: url,
      timestamp: new Date().toLocaleTimeString(),
      aspect: aspectRatio
    };

    const nextHistory = [item, ...history].slice(0, 15);
    setHistory(nextHistory);
    localStorage.setItem('infinitykit_ai_images', JSON.stringify(nextHistory));

    // Sync to Supabase user_data
    import('../../lib/sync').then((m) => {
      m.default.saveData('infinitykit_ai_images', nextHistory);
      m.default.logActivity(`${currentInfo.title}`, `Generated AI image: "${originalPrompt}" using preset: ${preset}`);
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('infinitykit_ai_images');
    import('../../lib/sync').then((m) => {
      m.default.saveData('infinitykit_ai_images', []);
    });
  };

  const downloadImage = async (urlToDownload: string, name: string) => {
    try {
      const response = await fetch(urlToDownload);
      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = localUrl;
      link.download = `ai_${name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      // Fallback open in new window
      window.open(urlToDownload, '_blank');
    }
  };

  // Cross-suite routing: sends generated image directly to Visual Editor
  const sendToEditor = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('infinitykit_edit_target', reader.result as string);
          window.location.href = '/image-tools/crop-image';
        }
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      alert('Failed to send image data to editor.');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <style>{`
        .image-suite-grid-reverse {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          align-items: start;
        }
        .image-suite-preview-container-fixed {
          background: #0a0a0c;
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        @media (max-width: 1024px) {
          .image-suite-grid-reverse {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .image-suite-preview-container-fixed {
            height: 320px !important;
          }
        }
      `}</style>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: 0 }}>{currentInfo.title}</h2>
        </div>
        <button
          onClick={toggleFavorite}
          style={{
            background: 'transparent',
            border: '1px solid var(--glass-border)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isFavorite ? '#ff4757' : 'var(--text-secondary)'
          }}
        >
          <Heart size={20} fill={isFavorite ? '#ff4757' : 'none'} />
        </button>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
        {currentInfo.desc} Powered by Flux and OpenAI models.
      </p>

      <div className="image-suite-grid-reverse">
        
        {/* Left Side: Creation Settings Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Preset styles switches */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
              Engine preset selection
            </label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as any)}
              className="form-input"
              style={{ textTransform: 'capitalize' }}
            >
              {Object.keys(presetsInfo).map(p => (
                <option key={p} value={p}>{p === 'general' ? 'standard generator' : `${p} generator`}</option>
              ))}
            </select>
          </div>

          {/* Prompt text area */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
              Write Prompt Details
            </label>
            <textarea
              className="form-input"
              style={{ minHeight: '100px', fontSize: '0.9rem' }}
              placeholder="e.g. A serene glass greenhouse on a rain-drenched hill, neon lights glowing from inside..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* Selection style preset */}
          {currentInfo.styles.length > 0 && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                Select Style Overlay
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {currentInfo.styles.map(style => (
                  <button
                    key={style.label}
                    onClick={() => setSelectedStyle(style.label)}
                    style={{
                      background: selectedStyle === style.label ? 'var(--primary-color)' : 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--glass-border)',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      color: selectedStyle === style.label ? '#fff' : 'var(--text-color)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Model options */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
              Aspect Ratio
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['1:1', '16:9', '4:3', '9:16'].map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  style={{
                    flex: 1,
                    background: aspectRatio === ratio ? 'var(--primary-color)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--glass-border)',
                    padding: '8px 4px',
                    borderRadius: '6px',
                    color: aspectRatio === ratio ? '#fff' : 'var(--text-color)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Seed and custom parameters */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Seed parameter</label>
              <button
                onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Randomize
              </button>
            </div>
            <input
              type="number"
              className="form-input"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
            />
          </div>

          {/* OpenAI Key trigger options */}
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.01)'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={useOpenAI}
                onChange={(e) => setUseOpenAI(e.target.checked)}
              />
              Use DALL-E 3 (OpenAI Key)
            </label>
            {useOpenAI && (
              <input
                type="password"
                className="form-input"
                style={{ marginTop: '8px', fontSize: '0.8rem' }}
                placeholder="Paste API Key (sk-...)"
                value={openaiKey}
                onChange={(e) => saveOpenaiKey(e.target.value)}
              />
            )}
          </div>

          <button
            onClick={generateImage}
            disabled={isGenerating || !prompt}
            style={{
              width: '100%',
              background: 'var(--primary-color)',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              opacity: isGenerating || !prompt ? 0.6 : 1
            }}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Synthesizing Pixels...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate AI Image
              </>
            )}
          </button>

        </div>

        {/* Right Side: Generation Canvas Area and History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Visual Display */}
          <div className="image-suite-preview-container-fixed">
            {isGenerating ? (
              <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Generating model layers...
                </p>
              </div>
            ) : generatedUrl ? (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <img
                  src={generatedUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                  alt="AI Generated Output"
                />

                {/* Controls Overlay Hover */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(10, 10, 12, 0.85)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '30px',
                    padding: '6px 16px',
                    display: 'flex',
                    gap: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <button
                    onClick={() => downloadImage(generatedUrl, prompt)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                  >
                    <Download size={14} /> Download
                  </button>
                  <div style={{ width: '1px', background: 'var(--glass-border)' }} />
                  <button
                    onClick={() => sendToEditor(generatedUrl)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                  >
                    <ExternalLink size={14} /> Edit Image
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Image size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: '0.85rem', margin: 0 }}>
                  Generated assets will render here.
                </p>
              </div>
            )}
          </div>

          {/* History Section */}
          {history.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Recent Generations</h3>
                <button
                  onClick={clearHistory}
                  style={{ background: 'none', border: 'none', color: '#ff4757', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={12} /> Clear History
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                {history.map((item, idx) => (
                  <div
                    key={item.id}
                    className="glass-panel"
                    style={{
                      padding: '6px',
                      cursor: 'pointer',
                      position: 'relative',
                      border: '1px solid var(--glass-border)'
                    }}
                  >
                    <div style={{ height: '90px', borderRadius: '6px', overflow: 'hidden', background: '#000', marginBottom: '6px' }}>
                      <img
                        src={item.url}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        alt="Thumbnail"
                        onClick={() => setGeneratedUrl(item.url)}
                      />
                    </div>
                    <p style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-color)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }} title={item.prompt}>
                      {item.prompt}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <button
                        onClick={() => downloadImage(item.url, item.prompt)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px' }}
                        title="Download"
                      >
                        <Download size={10} />
                      </button>
                      <button
                        onClick={() => sendToEditor(item.url)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: '2px' }}
                        title="Edit in Suite"
                      >
                        <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
