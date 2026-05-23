'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Copy, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

const MORSE_MAP: Record<string, string> = {
  A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.',
  H:'....', I:'..', J:'.---', K:'-.-', L:'.-..', M:'--', N:'-.',
  O:'---', P:'.--.', Q:'--.-', R:'.-.', S:'...', T:'-', U:'..-',
  V:'...-', W:'.--', X:'-..-', Y:'-.--', Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
  '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
  '.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--','-':'-....-',
  '/':'-..-.','(':'-.--.',')':'-.--.-',"'":'.--.-.','@':'.--.-.',
  ' ': ' '
};

const REVERSE_MORSE: Record<string, string> = {};
Object.entries(MORSE_MAP).forEach(([k, v]) => {
  if (k !== ' ') REVERSE_MORSE[v] = k;
});

function textToMorse(text: string): string {
  return text.toUpperCase().split('').map(ch => {
    if (ch === ' ') return '/';
    return MORSE_MAP[ch] ?? '?';
  }).join(' ');
}

function morseToText(morse: string): string {
  return morse.split(' / ').map(word =>
    word.split(' ').map(code => REVERSE_MORSE[code] ?? '?').join('')
  ).join(' ');
}

const REFERENCE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

export default function MorseCodeTranslator() {
  const [mode, setMode] = useState<'text-to-morse' | 'morse-to-text'>('text-to-morse');
  const [input, setInput] = useState('HELLO WORLD');
  const [speed, setSpeed] = useState(15); // WPM
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef(false);

  const output = mode === 'text-to-morse' ? textToMorse(input) : morseToText(input);

  // WPM to ms conversion: 1 dit = 1200/wpm ms
  const dit = Math.round(1200 / speed);
  const dah = dit * 3;
  const symbolGap = dit;
  const letterGap = dit * 3;
  const wordGap = dit * 7;

  const playMorse = async () => {
    if (isPlaying) {
      stopRef.current = true;
      setIsPlaying(false);
      return;
    }

    const morseString = mode === 'text-to-morse' ? output : textToMorse(morseToText(output));

    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      setIsPlaying(true);
      stopRef.current = false;

      const playBeep = (duration: number): Promise<void> =>
        new Promise(resolve => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.frequency.setValueAtTime(700, ctx.currentTime);
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.005);
          gainNode.gain.setValueAtTime(0.5, ctx.currentTime + duration / 1000 - 0.005);
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + duration / 1000);
          setTimeout(resolve, duration);
        });

      const sleep = (ms: number): Promise<void> =>
        new Promise(resolve => setTimeout(resolve, ms));

      const morseSignal = mode === 'text-to-morse' ? output : textToMorse(input);
      const tokens = morseSignal.split('');

      for (let i = 0; i < tokens.length; i++) {
        if (stopRef.current) break;
        const ch = tokens[i];
        if (ch === '.') { await playBeep(dit); await sleep(symbolGap); }
        else if (ch === '-') { await playBeep(dah); await sleep(symbolGap); }
        else if (ch === ' ' && tokens[i + 1] === '/') { await sleep(wordGap - symbolGap); }
        else if (ch === '/') { /* handled above */ }
        else if (ch === ' ') { await sleep(letterGap - symbolGap); }
      }

      setIsPlaying(false);
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    stopRef.current = true;
    setIsPlaying(false);
  };

  return (
    <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* Header & Mode Toggle */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>📡 Morse Code Translator</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Translate text ↔ Morse code with audio playback
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
            {(['text-to-morse', 'morse-to-text'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setInput(''); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: mode === m ? 'var(--primary-color)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  transition: 'var(--transition-smooth)',
                }}
              >
                {m === 'text-to-morse' ? 'Text → Morse' : 'Morse → Text'}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
            {mode === 'text-to-morse' ? 'Enter Text' : 'Enter Morse Code (use / for word gap)'}
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'text-to-morse' ? 'Type something…' : '... / .-- --- .-. .-.. -..'}
            rows={3}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              color: 'var(--text-color)',
              fontSize: '0.95rem',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: mode === 'morse-to-text' ? 'monospace' : 'inherit',
            }}
          />
        </div>

        {/* Output */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '12px',
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid var(--glass-border)',
          minHeight: '60px',
          fontFamily: 'monospace',
          fontSize: '1rem',
          letterSpacing: mode === 'text-to-morse' ? '2px' : 'normal',
          color: 'var(--primary-color)',
          wordBreak: 'break-all',
          lineHeight: 1.8,
        }}>
          {output || <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Output will appear here…</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
          {/* Play Button */}
          <button
            onClick={playMorse}
            disabled={!output || output.includes('?')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '12px',
              border: 'none',
              background: isPlaying ? '#FF6B6B' : 'var(--primary-color)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
              animation: isPlaying ? 'pulse 1s ease-in-out infinite' : 'none',
            }}
          >
            {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
            {isPlaying ? 'Stop' : 'Play Audio'}
          </button>

          {/* Copy */}
          <button
            onClick={copyOutput}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              background: copied ? '#4ECDC4' : 'var(--glass-bg)',
              color: copied ? '#fff' : 'var(--text-color)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            <Copy size={16} />
            {copied ? 'Copied!' : 'Copy Output'}
          </button>

          {/* Clear */}
          <button
            onClick={clearAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <RotateCcw size={14} /> Clear
          </button>

          {/* Speed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Speed: <strong>{speed} WPM</strong>
            </label>
            <input
              type="range"
              min={5}
              max={40}
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              style={{ width: '120px', accentColor: 'var(--primary-color)' }}
            />
          </div>
        </div>

        {/* Timing Info */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[['Dit', `${dit}ms`], ['Dah', `${dah}ms`], ['Letter Gap', `${letterGap}ms`], ['Word Gap', `${wordGap}ms`]].map(([label, val]) => (
            <div key={label} style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--glass-border)',
              fontSize: '0.8rem',
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>{label}: </span>
              <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reference Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <button
          onClick={() => setShowRef(!showRef)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-color)',
            fontWeight: 700,
            fontSize: '1rem',
            padding: 0,
          }}
        >
          📖 Morse Code Reference Table
          {showRef ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showRef && (
          <div style={{
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '8px',
          }}>
            {REFERENCE.map(ch => (
              <div key={ch} style={{
                padding: '8px 10px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--glass-border)',
                textAlign: 'center',
              }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-color)' }}>{ch}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--primary-color)', letterSpacing: '2px' }}>
                  {MORSE_MAP[ch]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
