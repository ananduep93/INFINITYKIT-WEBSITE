'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export default function FocusTimer() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getModeTime = (newMode: TimerMode) => {
    switch (newMode) {
      case 'work': return 25 * 60;
      case 'shortBreak': return 5 * 60;
      case 'longBreak': return 15 * 60;
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(getModeTime(newMode));
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            
            // Trigger alarm/confetti
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });

            // Try to play browser beep
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
              gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + 1.2);
            } catch (e) {}

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getModeTime(mode));
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Progress Bar calculation
  const totalDuration = getModeTime(mode);
  const percentLeft = (timeLeft / totalDuration) * 100;

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '500px', textAlign: 'center', padding: '40px 30px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Focus Timer
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Boost productivity using the Pomodoro technique. Fully offline secure clock.
      </p>

      {/* Mode Selectors */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '35px' }}>
        {(['work', 'shortBreak', 'longBreak'] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: '1px solid var(--glass-border)',
              background: mode === m ? 'var(--primary-gradient)' : 'var(--glass-bg)',
              color: mode === m ? 'white' : 'var(--text-color)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'var(--transition-smooth)'
            }}
          >
            {m === 'work' ? '🎯 Focus' : m === 'shortBreak' ? '☕ Short Break' : '🌴 Long Break'}
          </button>
        ))}
      </div>

      {/* Circle Progress Timer Visual */}
      <div style={{
        position: 'relative',
        width: '220px',
        height: '220px',
        margin: '0 auto 35px',
        borderRadius: '50%',
        background: 'rgba(0,161,155,0.04)',
        border: '6px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: isRunning ? 'var(--neon-shadow)' : 'none',
        transition: 'var(--transition-smooth)'
      }}>
        {/* Progress Circle Layer */}
        <div style={{
          position: 'absolute',
          top: '-6px',
          left: '-6px',
          right: '-6px',
          bottom: '-6px',
          borderRadius: '50%',
          border: '6px solid var(--primary-color)',
          clipPath: `polygon(50% 50%, 50% 0%, ${percentLeft >= 12.5 ? '100% 0%,' : ''} ${percentLeft >= 37.5 ? '100% 100%,' : ''} ${percentLeft >= 62.5 ? '0% 100%,' : ''} ${percentLeft >= 87.5 ? '0% 0%,' : ''} 50% 0%)`,
          opacity: 0.85,
          transition: 'all 0.3s linear'
        }} />

        <div style={{
          fontSize: '3.2rem',
          fontWeight: 800,
          fontFamily: "'Outfit', sans-serif",
          color: 'var(--text-color)',
          letterSpacing: '1px'
        }}>
          {formatTime(timeLeft)}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--primary-color)',
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '1px',
          marginTop: '4px'
        }}>
          {mode === 'work' ? 'Focus Session' : 'Relax & Recharge'}
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button
          onClick={handleToggle}
          className="btn"
          style={{
            padding: '14px 40px',
            borderRadius: '30px',
            minWidth: '150px'
          }}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button
          onClick={handleReset}
          className="btn btn-secondary"
          style={{
            padding: '14px',
            borderRadius: '50%',
            aspectRatio: '1'
          }}
          title="Reset clock"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}
