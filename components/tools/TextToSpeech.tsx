'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Copy } from 'lucide-react';

export default function TextToSpeech() {
  const [text, setText] = useState("Welcome to InfinityKit's Text-to-Speech Engine. Type anything here and I'll read it aloud for you with full voice control.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWord, setCurrentWord] = useState(-1);
  const [wordBoundaries, setWordBoundaries] = useState<{word: string; start: number}[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const words = text.split(/(\s+)/);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setVoices(v);
        const eng = v.find(vv => vv.lang.startsWith('en')) || v[0];
        if (eng) setSelectedVoice(eng.name);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Build word boundaries
  useEffect(() => {
    const boundaries: {word: string; start: number}[] = [];
    let idx = 0;
    text.split(' ').forEach(word => {
      if (word) boundaries.push({ word, start: idx });
      idx += word.length + 1;
    });
    setWordBoundaries(boundaries);
  }, [text]);

  const play = () => {
    if (isPaused && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    window.speechSynthesis.cancel();
    setCurrentWord(-1);

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIdx = event.charIndex;
        const idx = wordBoundaries.findIndex((wb, i) => {
          const nextStart = wordBoundaries[i + 1]?.start ?? text.length + 1;
          return wb.start <= charIdx && charIdx < nextStart;
        });
        setCurrentWord(idx);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentWord(-1);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentWord(-1);
  };

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const estDuration = wordCount > 0 ? Math.round((wordCount / (rate * 150)) * 60) : 0;

  const renderHighlightedText = () => {
    if (currentWord < 0) return <span>{text}</span>;
    const parts: React.ReactNode[] = [];
    let charIdx = 0;

    wordBoundaries.forEach((wb, i) => {
      // Add spaces before this word
      if (wb.start > charIdx) {
        parts.push(<span key={`sp-${i}`}>{text.slice(charIdx, wb.start)}</span>);
      }
      const wordEnd = wb.start + wb.word.length;
      parts.push(
        <mark
          key={`w-${i}`}
          style={{
            background: i === currentWord ? 'var(--primary-color)' : 'transparent',
            color: i === currentWord ? '#fff' : 'inherit',
            borderRadius: '4px',
            padding: '0 2px',
            transition: 'background 0.15s',
          }}
        >
          {text.slice(wb.start, wordEnd)}
        </mark>
      );
      charIdx = wordEnd;
    });

    if (charIdx < text.length) {
      parts.push(<span key="tail">{text.slice(charIdx)}</span>);
    }

    return <>{parts}</>;
  };

  const SliderRow = ({ label, value, min, max, step, onChange, displayVal }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ width: '70px', fontSize: '0.82rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: 'var(--primary-color)' }}
      />
      <span style={{ width: '40px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)', textAlign: 'right' }}>
        {displayVal}
      </span>
    </div>
  );

  return (
    <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Text Input */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>🔊 Text-to-Speech Engine</h3>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span>{charCount} chars</span>
            <span>·</span>
            <span>{wordCount} words</span>
            <span>·</span>
            <span>~{estDuration}s</span>
          </div>
        </div>

        <textarea
          value={text}
          onChange={e => { setText(e.target.value); stop(); }}
          placeholder="Type or paste text here..."
          rows={6}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            color: 'var(--text-color)',
            fontSize: '0.95rem',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            lineHeight: 1.7,
          }}
        />

        {/* Word Highlight Preview */}
        {(isSpeaking || isPaused) && (
          <div style={{
            marginTop: '12px',
            padding: '14px',
            borderRadius: '12px',
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--glass-border)',
            fontSize: '0.9rem',
            lineHeight: 1.9,
            color: 'var(--text-color)',
          }}>
            {renderHighlightedText()}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Voice & Playback */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700 }}>🎙 Voice Settings</h4>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Voice</label>
            <select
              value={selectedVoice}
              onChange={e => setSelectedVoice(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-color)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            >
              {voices.map(v => (
                <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
              ))}
              {voices.length === 0 && <option>Loading voices…</option>}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SliderRow label="Rate" value={rate} min={0.5} max={2} step={0.1} onChange={setRate} displayVal={`${rate.toFixed(1)}x`} />
            <SliderRow label="Pitch" value={pitch} min={0} max={2} step={0.1} onChange={setPitch} displayVal={pitch.toFixed(1)} />
            <SliderRow label="Volume" value={volume} min={0} max={1} step={0.05} onChange={setVolume} displayVal={`${Math.round(volume * 100)}%`} />
          </div>
        </div>

        {/* Play Controls */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>⏯ Playback</h4>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={play}
              disabled={!text.trim() || voices.length === 0}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: 'none',
                background: 'var(--primary-color)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isSpeaking ? '0 0 24px var(--primary-color)' : 'none',
                transition: 'var(--transition-smooth)',
              }}
              title={isPaused ? 'Resume' : 'Play'}
            >
              <Play size={26} fill="#fff" />
            </button>

            <button
              onClick={pause}
              disabled={!isSpeaking}
              style={{
                width: '56px',
                height: '56px',
                alignSelf: 'center',
                borderRadius: '50%',
                border: '2px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-color)',
                cursor: isSpeaking ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isSpeaking ? 1 : 0.4,
              }}
              title="Pause"
            >
              <Pause size={22} />
            </button>

            <button
              onClick={stop}
              disabled={!isSpeaking && !isPaused}
              style={{
                width: '56px',
                height: '56px',
                alignSelf: 'center',
                borderRadius: '50%',
                border: '2px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-color)',
                cursor: (isSpeaking || isPaused) ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: (isSpeaking || isPaused) ? 1 : 0.4,
              }}
              title="Stop"
            >
              <Square size={22} />
            </button>
          </div>

          {/* Status */}
          <div style={{
            padding: '8px 20px',
            borderRadius: '20px',
            background: isSpeaking ? 'rgba(0,161,155,0.15)' : isPaused ? 'rgba(255,193,7,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isSpeaking ? 'var(--primary-color)' : isPaused ? '#FFC107' : 'var(--glass-border)'}`,
            fontSize: '0.82rem',
            fontWeight: 600,
            color: isSpeaking ? 'var(--primary-color)' : isPaused ? '#FFC107' : 'var(--text-secondary)',
          }}>
            {isSpeaking ? '▶ Speaking…' : isPaused ? '⏸ Paused' : '⏹ Stopped'}
          </div>
        </div>
      </div>
    </div>
  );
}
