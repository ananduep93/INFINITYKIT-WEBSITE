'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Ruler, MapPin, RefreshCw } from 'lucide-react';

interface Point { x: number; y: number; z?: number; }

function euclidean2D(a: Point, b: Point) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

function euclidean3D(a: Point, b: Point) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2) + Math.pow((b.z || 0) - (a.z || 0), 2));
}

function manhattan(a: Point, b: Point) {
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

function midpoint(a: Point, b: Point) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export default function DistanceCalculator() {
  const [mode3D, setMode3D] = useState(false);
  const [ax, setAx] = useState('2');
  const [ay, setAy] = useState('3');
  const [az, setAz] = useState('0');
  const [bx, setBx] = useState('8');
  const [by, setBy] = useState('7');
  const [bz, setBz] = useState('4');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pA: Point = { x: parseFloat(ax) || 0, y: parseFloat(ay) || 0, z: parseFloat(az) || 0 };
  const pB: Point = { x: parseFloat(bx) || 0, y: parseFloat(by) || 0, z: parseFloat(bz) || 0 };

  const eucDist = mode3D ? euclidean3D(pA, pB) : euclidean2D(pA, pB);
  const manhDist = manhattan(pA, pB);
  const mid = midpoint(pA, pB);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Coordinate range
    const allX = [pA.x, pB.x];
    const allY = [pA.y, pB.y];
    const pad = 40;
    const rangeX = Math.max(Math.abs(pB.x - pA.x), 10);
    const rangeY = Math.max(Math.abs(pB.y - pA.y), 10);
    const scale = Math.min((W - 2 * pad) / rangeX, (H - 2 * pad) / rangeY) * 0.7;

    const cx = W / 2;
    const cy = H / 2;
    const midX = (pA.x + pB.x) / 2;
    const midY = (pA.y + pB.y) / 2;

    const toCanvas = (p: { x: number; y: number }) => ({
      x: cx + (p.x - midX) * scale,
      y: cy - (p.y - midY) * scale,
    });

    const cA = toCanvas(pA);
    const cB = toCanvas(pB);
    const cMid = toCanvas(mid);

    // Grid lines
    ctx.strokeStyle = 'rgba(128,128,128,0.12)';
    ctx.lineWidth = 1;
    for (let gx = -20; gx <= 20; gx++) {
      const px = cx + (gx - midX) * scale;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    }
    for (let gy = -20; gy <= 20; gy++) {
      const py = cy - (gy - midY) * scale;
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(128,128,128,0.35)';
    ctx.lineWidth = 1.5;
    const axisY = cy + midY * scale;
    const axisX = cx - midX * scale;
    ctx.beginPath(); ctx.moveTo(0, axisY); ctx.lineTo(W, axisY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(axisX, 0); ctx.lineTo(axisX, H); ctx.stroke();

    // Line between points
    ctx.strokeStyle = '#00a19b';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([7, 4]);
    ctx.beginPath();
    ctx.moveTo(cA.x, cA.y);
    ctx.lineTo(cB.x, cB.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Manhattan path
    ctx.strokeStyle = 'rgba(255,193,7,0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cA.x, cA.y);
    ctx.lineTo(cB.x, cA.y);
    ctx.lineTo(cB.x, cB.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Point A
    ctx.fillStyle = '#28a745';
    ctx.beginPath(); ctx.arc(cA.x, cA.y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('A', cA.x, cA.y);

    // Point B
    ctx.fillStyle = '#dc3545';
    ctx.beginPath(); ctx.arc(cB.x, cB.y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('B', cB.x, cB.y);

    // Midpoint
    ctx.fillStyle = '#00a19b';
    ctx.beginPath(); ctx.arc(cMid.x, cMid.y, 5, 0, Math.PI * 2); ctx.fill();

    // Labels
    ctx.fillStyle = '#28a745';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`A(${pA.x}, ${pA.y})`, cA.x + 12, cA.y - 12);
    ctx.fillStyle = '#dc3545';
    ctx.fillText(`B(${pB.x}, ${pB.y})`, cB.x + 12, cB.y - 12);

  }, [pA.x, pA.y, pB.x, pB.y, mid.x, mid.y]);

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    borderRadius: '10px', color: 'var(--text-color)', padding: '10px 14px',
    fontSize: '0.95rem', width: '100%', outline: 'none', boxSizing: 'border-box',
    textAlign: 'center',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px'
  };

  const resultCard = (label: string, value: string, formula: string, color = 'var(--primary-color)') => (
    <div style={{
      background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
      borderRadius: '14px', padding: '16px', flex: 1, minWidth: '160px'
    }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px', fontFamily: 'monospace' }}>{formula}</div>
    </div>
  );

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Ruler size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Distance Calculator</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
          Euclidean, Manhattan distances and midpoint with visual grid.
        </p>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--glass-bg)', borderRadius: '10px', padding: '4px', border: '1px solid var(--glass-border)', width: 'fit-content', marginBottom: '24px' }}>
          {(['2D', '3D'] as const).map(m => (
            <button key={m} onClick={() => setMode3D(m === '3D')} style={{
              background: (mode3D ? '3D' : '2D') === m ? 'var(--primary-color)' : 'transparent',
              color: (mode3D ? '3D' : '2D') === m ? '#fff' : 'var(--text-secondary)',
              border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: 700,
              cursor: 'pointer', transition: 'var(--transition-smooth)'
            }}>{m}</button>
          ))}
        </div>

        {/* Point inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(40,167,69,0.05)', border: '1px solid rgba(40,167,69,0.2)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <MapPin size={16} color="#28a745" />
              <span style={{ fontWeight: 700, color: '#28a745' }}>Point A</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: mode3D ? '1fr 1fr 1fr' : '1fr 1fr', gap: '10px' }}>
              <div><label style={labelStyle}>X₁</label><input type="number" value={ax} onChange={e => setAx(e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Y₁</label><input type="number" value={ay} onChange={e => setAy(e.target.value)} style={inputStyle} /></div>
              {mode3D && <div><label style={labelStyle}>Z₁</label><input type="number" value={az} onChange={e => setAz(e.target.value)} style={inputStyle} /></div>}
            </div>
          </div>
          <div style={{ background: 'rgba(220,53,69,0.05)', border: '1px solid rgba(220,53,69,0.2)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <MapPin size={16} color="#dc3545" />
              <span style={{ fontWeight: 700, color: '#dc3545' }}>Point B</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: mode3D ? '1fr 1fr 1fr' : '1fr 1fr', gap: '10px' }}>
              <div><label style={labelStyle}>X₂</label><input type="number" value={bx} onChange={e => setBx(e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Y₂</label><input type="number" value={by} onChange={e => setBy(e.target.value)} style={inputStyle} /></div>
              {mode3D && <div><label style={labelStyle}>Z₂</label><input type="number" value={bz} onChange={e => setBz(e.target.value)} style={inputStyle} /></div>}
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {resultCard(
            mode3D ? '3D Euclidean Distance' : '2D Euclidean Distance',
            eucDist.toFixed(4),
            mode3D
              ? `√((${pB.x}-${pA.x})²+(${pB.y}-${pA.y})²+(${(pB.z||0)}-${(pA.z||0)})²)`
              : `√((${pB.x}-${pA.x})²+(${pB.y}-${pA.y})²)`
          )}
          {!mode3D && resultCard(
            'Manhattan Distance',
            manhDist.toFixed(4),
            `|${pB.x}-${pA.x}| + |${pB.y}-${pA.y}|`,
            '#ffc107'
          )}
          {resultCard(
            'Midpoint',
            `(${mid.x.toFixed(2)}, ${mid.y.toFixed(2)})`,
            `((${pA.x}+${pB.x})/2, (${pA.y}+${pB.y})/2)`,
            '#6f42c1'
          )}
        </div>

        {/* Canvas */}
        {!mode3D && (
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Visual Grid
            </div>
            <canvas ref={canvasRef} width={540} height={300} style={{
              width: '100%', maxWidth: '540px', height: 'auto',
              borderRadius: '14px', border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)', display: 'block'
            }} />
            <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span>🟢 Point A</span>
              <span>🔴 Point B</span>
              <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>— Euclidean path</span>
              <span style={{ color: '#ffc107', fontWeight: 700 }}>- - Manhattan path</span>
            </div>
          </div>
        )}

        {mode3D && (
          <div style={{ padding: '16px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>3D Formula:</strong> d = √((x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²) = {eucDist.toFixed(6)}
          </div>
        )}
      </div>
    </div>
  );
}
