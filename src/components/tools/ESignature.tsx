'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Download, Trash2, Pencil, Sparkles } from 'lucide-react';

export default function ESignature() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1D1D1F'); // Defaults to near-black
  const [penWidth, setPenWidth] = useState(3);
  const [isEmpty, setIsEmpty] = useState(true);

  // Set up canvas context and scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI quality scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Initial canvas state
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    
    // Fill canvas with fully transparent background (so PNG download has transparent bg)
    ctx.clearRect(0, 0, rect.width, rect.height);
  }, []);

  // Update canvas properties when options change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  }, [penColor, penWidth]);

  // Handle responsiveness (keep signature relative to bounds on resize)
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Save current content
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
      }
      
      // Resize original canvas
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      
      // Restore content
      ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width / 2, tempCanvas.height / 2);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [penColor, penWidth]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevents touch scrolling while signing
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setIsEmpty(true);
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    // Create a temporary link
    const link = document.createElement('a');
    link.download = `signature_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '750px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        e-Signature Studio
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Draw custom professional electronic signatures securely and download them as high-quality transparent PNGs.
      </p>

      {/* Signature Pad Area */}
      <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            width: '100%',
            height: '320px',
            background: 'var(--glass-bg)',
            border: '2px dashed var(--glass-border)',
            borderRadius: '15px',
            cursor: 'crosshair',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)',
            touchAction: 'none'
          }}
        />
        {isEmpty && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            opacity: 0.5
          }}>
            <Pencil size={32} style={{ marginBottom: '10px', display: 'inline-block' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sign Here (Mouse or Touch)</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        background: 'rgba(0,0,0,0.02)',
        padding: '15px 20px',
        borderRadius: '12px',
        border: '1px solid var(--glass-border)'
      }}>
        
        {/* Colors Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pen Color:</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { color: '#1D1D1F', label: 'Dark Charcoal' },
              { color: '#0052CC', label: 'Classic Blue' },
              { color: '#00A19B', label: 'Primary Teal' },
              { color: '#D32F2F', label: 'Warm Red' }
            ].map((cfg) => (
              <button
                key={cfg.color}
                onClick={() => setPenColor(cfg.color)}
                title={cfg.label}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: cfg.color,
                  border: penColor === cfg.color ? '2px solid var(--text-color)' : '2px solid transparent',
                  cursor: 'pointer',
                  transform: penColor === cfg.color ? 'scale(1.15)' : 'scale(1)',
                  transition: 'var(--transition-smooth)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Thickness Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Width:</span>
          <select
            value={penWidth}
            onChange={(e) => setPenWidth(Number(e.target.value))}
            className="form-select"
            style={{ width: '80px', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <option value={2}>Fine</option>
            <option value={3}>Medium</option>
            <option value={5}>Thick</option>
            <option value={8}>Bold</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={clearCanvas}
            className="btn btn-secondary"
            style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: '20px' }}
          >
            <Trash2 size={16} /> Clear
          </button>
          
          <button
            onClick={downloadSignature}
            disabled={isEmpty}
            className="btn"
            style={{
              padding: '10px 20px',
              fontSize: '0.85rem',
              borderRadius: '20px',
              opacity: isEmpty ? 0.6 : 1,
              cursor: isEmpty ? 'not-allowed' : 'pointer'
            }}
          >
            <Download size={16} /> Save PNG
          </button>
        </div>
      </div>
      
      {/* Privacy Notice Alert */}
      <div style={{
        marginTop: '25px',
        padding: '15px',
        borderRadius: '10px',
        backgroundColor: 'rgba(0, 161, 155, 0.05)',
        border: '1px solid rgba(0, 161, 155, 0.15)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Sparkles size={18} color="var(--primary-color)" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          <strong>Secure client-side operation:</strong> Your signature drawing path, canvas strokes, and generated images remain entirely inside your local browser runtime. Absolutely no signature biometric data is sent to external storage.
        </div>
      </div>
    </div>
  );
}
