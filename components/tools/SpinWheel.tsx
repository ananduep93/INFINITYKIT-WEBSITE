'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

const COLORS = [
  '#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7',
  '#DDA0DD','#98D8C8','#F7DC6F','#BB8FCE','#85C1E9',
  '#F1948A','#82E0AA','#F8C471','#AED6F1','#A9DFBF',
];

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export default function SpinWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [items, setItems] = useState<string[]>(['Pizza', 'Sushi', 'Burgers', 'Tacos', 'Pasta']);
  const [inputVal, setInputVal] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const currentAngleRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(cx, cy) - 10;
    const arc = (2 * Math.PI) / items.length;

    ctx.clearRect(0, 0, W, H);

    // Draw shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.restore();

    items.forEach((item, i) => {
      const startAngle = angle + i * arc;
      const endAngle = startAngle + arc;

      // Segment
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(11, Math.min(16, 200 / items.length))}px 'Outfit', sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      const label = item.length > 12 ? item.slice(0, 11) + '…' : item;
      ctx.fillText(label, radius - 16, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pointer (top)
    ctx.save();
    ctx.translate(cx, 8);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-14, -22);
    ctx.lineTo(14, -22);
    ctx.closePath();
    ctx.fillStyle = '#FF6B6B';
    ctx.shadowColor = 'rgba(255,107,107,0.6)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
  }, [items]);

  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [drawWheel]);

  const addItem = () => {
    const trimmed = inputVal.trim();
    if (trimmed && !items.includes(trimmed)) {
      setItems(prev => [...prev, trimmed]);
      setInputVal('');
    }
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const spin = () => {
    if (isSpinning || items.length < 2) return;
    setWinner(null);
    setShowModal(false);
    setIsSpinning(true);

    const totalSpins = 5 + Math.random() * 5;
    const totalAngle = totalSpins * 2 * Math.PI;
    const duration = 4000 + Math.random() * 1500;
    const startAngle = currentAngleRef.current;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const currentAngle = startAngle + totalAngle * eased;
      currentAngleRef.current = currentAngle;
      drawWheel(currentAngle);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);

        const arc = (2 * Math.PI) / items.length;
        // Pointer is at top (−π/2), normalize
        const normalizedAngle = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const pointerAngle = (2 * Math.PI - normalizedAngle + (3 * Math.PI / 2)) % (2 * Math.PI);
        const winIndex = Math.floor(pointerAngle / arc) % items.length;
        const winnerName = items[winIndex];
        setWinner(winnerName);
        setShowModal(true);

        confetti({
          particleCount: 200,
          spread: 80,
          origin: { y: 0.5 },
          colors: COLORS,
        });
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addItem();
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <style>{`
        @keyframes modalPop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes winnerGlow { 0%,100% { box-shadow: 0 0 20px var(--primary-color); } 50% { box-shadow: 0 0 50px var(--primary-color); } }
        @keyframes spinBtn { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Left: Items Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
            🎯 Wheel Items
          </h3>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add an item..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-color)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            <button
              onClick={addItem}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--primary-color)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {items.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--glass-border)',
              }}>
                <span style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: COLORS[i % COLORS.length],
                  flexShrink: 0,
                }} />
                <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-color)' }}>{item}</span>
                <button
                  onClick={() => removeItem(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {items.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                Add at least 2 items to spin!
              </p>
            )}
          </div>

          <button
            onClick={() => setItems([])}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '8px',
              borderRadius: '10px',
              border: '1px solid var(--glass-border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.85rem',
            }}
          >
            <RotateCcw size={14} /> Clear All
          </button>
        </div>

        {/* Right: Wheel Panel */}
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
            🎡 Spin the Wheel
          </h3>

          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            style={{
              maxWidth: '100%',
              borderRadius: '50%',
              cursor: items.length >= 2 && !isSpinning ? 'pointer' : 'default',
            }}
            onClick={spin}
          />

          <button
            onClick={spin}
            disabled={isSpinning || items.length < 2}
            style={{
              marginTop: '20px',
              padding: '14px 40px',
              borderRadius: '30px',
              border: 'none',
              background: items.length >= 2 ? 'var(--primary-color)' : 'var(--glass-border)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: items.length >= 2 && !isSpinning ? 'pointer' : 'not-allowed',
              animation: !isSpinning && items.length >= 2 ? 'spinBtn 2s ease-in-out infinite' : 'none',
              transition: 'var(--transition-smooth)',
            }}
          >
            {isSpinning ? '🌀 Spinning…' : '🎰 SPIN!'}
          </button>

          {items.length < 2 && (
            <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Add at least 2 items to spin
            </p>
          )}
        </div>
      </div>

      {/* Winner Modal */}
      {showModal && winner && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--glass-bg)',
              border: '2px solid var(--primary-color)',
              borderRadius: '24px',
              padding: '48px 60px',
              textAlign: 'center',
              animation: 'modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animationFillMode: 'winnerGlow 2s ease-in-out infinite',
            }}
          >
            <Trophy size={52} color="#FFD700" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>🎉 The wheel has chosen…</p>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--primary-color)', margin: '0 0 24px' }}>
              {winner}
            </h2>
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: '12px 32px',
                borderRadius: '20px',
                border: 'none',
                background: 'var(--primary-color)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Awesome! 🙌
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
