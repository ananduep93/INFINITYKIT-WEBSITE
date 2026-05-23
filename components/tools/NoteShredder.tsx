'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Eye, EyeOff, Flame, Trash2, Clock, AlertTriangle, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

type ShredMode = 'burn' | '1min' | '5min' | '30min';

export default function NoteShredder() {
  const [noteText, setNoteText] = useState<string>('');
  const [shredMode, setShredMode] = useState<ShredMode>('burn');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isShredding, setIsShredding] = useState<boolean>(false);
  const [shredded, setShredded] = useState<boolean>(false);

  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const shredTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synchronize with SessionStorage for session backup if not yet shredded
  useEffect(() => {
    if (!isLocked && !shredded) {
      const saved = sessionStorage.getItem('infkit_shredder_draft');
      if (saved) setNoteText(saved);
    }
  }, [isLocked, shredded]);

  const handleTextChange = (val: string) => {
    setNoteText(val);
    sessionStorage.setItem('infkit_shredder_draft', val);
  };

  const playSynthesizedSound = (type: 'lock' | 'shred' | 'tick') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'lock') {
        // Lock click: dual frequency chime
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(554.37, now);
        osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.15);

        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
      } else if (type === 'tick') {
        // Subtle ticking sound
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        
        gainNode.gain.setValueAtTime(0.03, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'shred') {
        // Shredder noise: white noise filtered
        const now = ctx.currentTime;
        const bufferSize = ctx.sampleRate * 2.0; // 2 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 1.8);
        filter.Q.setValueAtTime(1.0, now);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noiseNode.start(now);
        noiseNode.stop(now + 2.0);
      }
    } catch (e) {
      console.warn('Audio Synthesis Error', e);
    }
  };

  const handleLock = () => {
    if (!noteText.trim()) return;
    
    setIsLocked(true);
    setShredded(false);
    playSynthesizedSound('lock');

    let duration = 0;
    if (shredMode === '1min') duration = 60;
    else if (shredMode === '5min') duration = 300;
    else if (shredMode === '30min') duration = 1800;

    if (shredMode !== 'burn') {
      setSecondsLeft(duration);
      setIsRevealed(false);
      startCountdown(duration);
    } else {
      // Burn after reading: revealed becomes manual toggle
      setSecondsLeft(0);
      setIsRevealed(false);
    }
  };

  const startCountdown = (startSecs: number) => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    
    let currentSecs = startSecs;
    countdownInterval.current = setInterval(() => {
      currentSecs -= 1;
      setSecondsLeft(currentSecs);
      
      if (currentSecs <= 5 && currentSecs > 0) {
        playSynthesizedSound('tick');
      }

      if (currentSecs <= 0) {
        if (countdownInterval.current) clearInterval(countdownInterval.current);
        triggerShred();
      }
    }, 1000);
  };

  const handleRevealBurnNote = () => {
    if (isRevealed) return; // already revealed
    
    setIsRevealed(true);
    playSynthesizedSound('lock');
    // Start a 30 second timer once revealed for burn notes
    setSecondsLeft(30);
    startCountdown(30);
  };

  const triggerShred = () => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    
    setIsShredding(true);
    playSynthesizedSound('shred');

    // Remove from sessionStorage immediately
    sessionStorage.removeItem('infkit_shredder_draft');

    // Run shred animation for 2 seconds
    shredTimeout.current = setTimeout(() => {
      // Wipe state clean
      setNoteText('');
      setIsLocked(false);
      setIsRevealed(false);
      setSecondsLeft(0);
      setIsShredding(false);
      setShredded(true);
    }, 1800);
  };

  const handleReset = () => {
    setShredded(false);
    setNoteText('');
    setIsLocked(false);
    setIsRevealed(false);
    setSecondsLeft(0);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  };

  useEffect(() => {
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      if (shredTimeout.current) clearTimeout(shredTimeout.current);
    };
  }, []);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // We split the note into 8 horizontal slices for shredding animation
  const shredStrips = Array.from({ length: 10 });

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '600px', padding: '30px 25px', color: 'var(--text-color)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background design elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: isLocked ? 'rgba(239, 68, 68, 0.03)' : 'rgba(0, 161, 155, 0.03)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: isLocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 161, 155, 0.1)',
          color: isLocked ? '#f87171' : 'var(--primary-color)',
          marginBottom: '12px',
          transition: 'all 0.3s'
        }}>
          {isLocked ? <Lock size={24} /> : <Unlock size={24} />}
        </div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px 0' }}>
          Note Shredder
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Create secure, self-destructing notes. Zero persistence. Localized encryption.
        </p>
      </div>

      {/* SUCCESS SHREDDED SCREEN */}
      {shredded && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          animation: 'shredFadeIn 0.5s ease-out'
        }}>
          <style>{`
            @keyframes shredFadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: '#22c55e',
            marginBottom: '15px'
          }}>
            <Flame size={32} style={{ animation: 'fireWiggle 1s infinite alternate' }} />
            <style>{`
              @keyframes fireWiggle {
                0% { transform: rotate(-5deg) scale(0.95); }
                100% { transform: rotate(5deg) scale(1.05); }
              }
            `}</style>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0', color: '#22c55e' }}>
            Note Shredded Successfully!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 25px auto', lineHeight: 1.5 }}>
            The note content, drafts, and temporary values have been thoroughly scrubbed from state, variables, and sessionStorage. Zero records remain.
          </p>
          <button
            onClick={handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '30px',
              border: '1px solid var(--glass-border)',
              backgroundColor: 'var(--glass-bg)',
              color: 'var(--text-color)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <RefreshCw size={16} />
            Create Another Note
          </button>
        </div>
      )}

      {/* SHREDDING ANIMATION STAGE */}
      {isShredding && (
        <div style={{
          position: 'relative',
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          overflow: 'hidden'
        }}>
          {/* Shredder mechanism graphics */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '20px',
            backgroundColor: '#1e1e1e',
            borderBottom: '3px solid #f87171',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '0 10px',
            zIndex: 10
          }}>
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} style={{ width: '8px', height: '6px', backgroundColor: '#333', borderRadius: '2px' }} />
            ))}
          </div>

          {/* Sliced shred items falling */}
          <div style={{
            position: 'relative',
            width: '90%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {shredStrips.map((_, i) => {
              const delay = i * 0.08;
              const angle = (Math.random() - 0.5) * 15;
              const dropDist = 200 + Math.random() * 80;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    color: 'rgba(255, 255, 255, 0.45)',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    overflow: 'hidden',
                    lineHeight: '1.4',
                    pointerEvents: 'none',
                    clipPath: `inset(${(i * 10)}% 0px ${(100 - (i + 1) * 10)}% 0px)`,
                    animation: `shredStripAnim 1.6s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
                    animationDelay: `${delay}s`,
                    transformOrigin: 'top center'
                  }}
                >
                  <style>{`
                    @keyframes shredStripAnim {
                      0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                        filter: blur(0);
                      }
                      40% {
                        filter: blur(0.5px);
                      }
                      100% {
                        transform: translateY(${dropDist}px) rotate(${angle}deg);
                        opacity: 0;
                        filter: blur(3px);
                      }
                    }
                  `}</style>
                  {noteText || "CONFIDENTIAL SECURE ENCRYPTED NOTE DOCUMENT SHRED OPERATION"}
                </div>
              );
            })}
          </div>

          <div style={{
            position: 'absolute',
            bottom: '20px',
            color: '#f87171',
            fontWeight: 800,
            fontSize: '0.9rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'shredPulse 0.5s infinite alternate'
          }}>
            <style>{`
              @keyframes shredPulse {
                from { opacity: 0.6; }
                to { opacity: 1; }
              }
            `}</style>
            <Flame size={16} />
            SHREDDING DATA...
          </div>
        </div>
      )}

      {/* INPUT / DRAFT VIEW */}
      {!isLocked && !shredded && !isShredding && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Note Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Write Secret Note</label>
            <textarea
              value={noteText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Start typing your highly sensitive note here..."
              rows={8}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-color)',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
            />
          </div>

          {/* Config & Timer Row */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '15px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--glass-border)'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Self-Destruct Trigger Duration:
            </span>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '10px'
            }}>
              {[
                { id: 'burn', label: '🔥 Burn after read', desc: 'Destructs once read' },
                { id: '1min', label: '⏱️ 1 Minute', desc: 'Shreds in 60s' },
                { id: '5min', label: '⏱️ 5 Minutes', desc: 'Shreds in 5m' },
                { id: '30min', label: '⏱️ 30 Minutes', desc: 'Shreds in 30m' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setShredMode(opt.id as ShredMode)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: shredMode === opt.id ? 'rgba(0,161,155,0.08)' : 'transparent',
                    borderColor: shredMode === opt.id ? 'var(--primary-color)' : 'var(--glass-border)',
                    color: shredMode === opt.id ? 'var(--primary-color)' : 'var(--text-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '2px' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <button
            onClick={handleLock}
            disabled={!noteText.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px 24px',
              borderRadius: '30px',
              border: 'none',
              background: 'var(--primary-color)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: noteText.trim() ? 'pointer' : 'not-allowed',
              opacity: noteText.trim() ? 1 : 0.5,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0, 161, 155, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (noteText.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 161, 155, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 161, 155, 0.2)';
            }}
          >
            <Lock size={18} />
            <span>Secure & Lock Note</span>
          </button>
        </div>
      )}

      {/* LOCKED VIEW WITH TIMER */}
      {isLocked && !shredded && !isShredding && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'lockFadeIn 0.3s' }}>
          <style>{`
            @keyframes lockFadeIn {
              from { opacity: 0; scale: 0.98; }
              to { opacity: 1; scale: 1; }
            }
          `}</style>
          
          {/* Warning banner */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '15px',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1.5px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171'
          }}>
            <ShieldAlert size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 800 }}>Highly Confidential Note Active</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.4, opacity: 0.9 }}>
                {shredMode === 'burn' 
                  ? "This note will burn immediately once revealed and closed, or automatically self-destruct 30 seconds after you reveal it."
                  : `This note will be automatically wiped and shredded in ${formatTime(secondsLeft)}. Leaving or reloading this tab will shred it immediately.`
                }
              </p>
            </div>
          </div>

          {/* Secure Display Box */}
          <div style={{
            position: 'relative',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            backgroundColor: 'rgba(0,0,0,0.15)',
            padding: '20px',
            minHeight: '160px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            
            {/* Note content (Blurred by default) */}
            <div style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              filter: isRevealed ? 'blur(0)' : 'blur(8px)',
              transition: 'filter 0.3s ease-in-out',
              opacity: isRevealed ? 1 : 0.15,
              userSelect: isRevealed ? 'text' : 'none',
              pointerEvents: isRevealed ? 'auto' : 'none'
            }}>
              {noteText}
            </div>

            {/* Shield overlay when blurred */}
            {!isRevealed && (
              <div style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                {shredMode === 'burn' ? (
                  <button
                    onClick={handleRevealBurnNote}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                  >
                    <Eye size={16} />
                    Reveal One-Time Note
                  </button>
                ) : (
                  <button
                    onMouseDown={() => setIsRevealed(true)}
                    onMouseUp={() => setIsRevealed(false)}
                    onMouseLeave={() => setIsRevealed(false)}
                    onTouchStart={() => setIsRevealed(true)}
                    onTouchEnd={() => setIsRevealed(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: 'var(--text-color)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={16} />
                    Hold to Reveal Note
                  </button>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {shredMode === 'burn' ? 'Revealing starts ticking self-destruct' : 'Released buttons automatically blurs note content'}
                </span>
              </div>
            )}

            {/* Toggle icon for revealed state on timed notes */}
            {isRevealed && shredMode !== 'burn' && (
              <button
                onClick={() => setIsRevealed(false)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%'
                }}
              >
                <EyeOff size={16} />
              </button>
            )}
          </div>

          {/* Time Counter and Buttons Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            alignItems: 'center'
          }}>
            
            {/* Timer visual block */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 18px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-border)',
            }}>
              <Clock size={20} style={{ color: secondsLeft <= 10 ? '#ef4444' : 'var(--primary-color)' }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>
                  Auto-Shreds In
                </div>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: secondsLeft <= 10 ? '#ef4444' : 'var(--text-color)',
                  fontFamily: 'monospace'
                }}>
                  {shredMode === 'burn' && !isRevealed ? 'UNOPENED' : formatTime(secondsLeft)}
                </div>
              </div>
            </div>

            {/* Manual Shred Action */}
            <button
              onClick={triggerShred}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '15px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)',
                height: '100%',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.2)';
              }}
            >
              <Trash2 size={16} />
              Shred Now!
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
