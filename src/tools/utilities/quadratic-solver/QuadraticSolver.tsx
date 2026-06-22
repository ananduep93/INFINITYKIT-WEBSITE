'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  HelpCircle, 
  RefreshCw, 
  Compass, 
  BookOpen, 
  Maximize2,
  Minimize2
} from 'lucide-react';

export default function QuadraticSolver() {
  const [aStr, setAStr] = useState<string>('1');
  const [bStr, setBStr] = useState<string>('-5');
  const [cStr, setCStr] = useState<string>('6');
  
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(-5);
  const [c, setC] = useState<number>(6);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync inputs
  useEffect(() => {
    const parsedA = parseFloat(aStr);
    const parsedB = parseFloat(bStr);
    const parsedC = parseFloat(cStr);

    setA(isNaN(parsedA) ? 0 : parsedA);
    setB(isNaN(parsedB) ? 0 : parsedB);
    setC(isNaN(parsedC) ? 0 : parsedC);
  }, [aStr, bStr, cStr]);

  // Solver calculations
  const isLinear = a === 0;
  const discriminant = b * b - 4 * a * c;
  
  // Roots
  let rootsType: 'two-real' | 'one-real' | 'complex' | 'linear' | 'invalid' = 'two-real';
  let root1Str = '';
  let root2Str = '';
  let root1Val: number | null = null;
  let root2Val: number | null = null;

  if (isLinear) {
    if (b !== 0) {
      rootsType = 'linear';
      const rootVal = -c / b;
      root1Str = rootVal.toFixed(4);
      root1Val = rootVal;
    } else {
      rootsType = 'invalid';
    }
  } else {
    if (discriminant > 0) {
      rootsType = 'two-real';
      const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      root1Val = r1;
      root2Val = r2;
      root1Str = r1.toLocaleString(undefined, { maximumFractionDigits: 4 });
      root2Str = r2.toLocaleString(undefined, { maximumFractionDigits: 4 });
    } else if (discriminant === 0) {
      rootsType = 'one-real';
      const r = -b / (2 * a);
      root1Val = r;
      root1Str = r.toLocaleString(undefined, { maximumFractionDigits: 4 });
    } else {
      rootsType = 'complex';
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-discriminant) / (2 * a);
      
      const realStr = realPart.toLocaleString(undefined, { maximumFractionDigits: 4 });
      const imagStr = Math.abs(imagPart).toLocaleString(undefined, { maximumFractionDigits: 4 });
      
      root1Str = `${realStr} + ${imagStr}i`;
      root2Str = `${realStr} - ${imagStr}i`;
    }
  }

  // Vertex
  const vertexX = isLinear ? 0 : -b / (2 * a);
  const vertexY = isLinear ? c : a * vertexX * vertexX + b * vertexX + c;

  // y-intercept
  const yIntercept = c;

  // Redraw parabola on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI screens
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0c1524'; // beautiful dark background
    ctx.fillRect(0, 0, width, height);

    if (a === 0 && b === 0) {
      // Draw flat line at y = c
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.font = '12px sans-serif';
      ctx.fillText('Invalid quadratic equation (a = b = 0)', 20, 30);
      return;
    }

    // Graph plotting bounds
    let xMin = -10;
    let xMax = 10;
    
    // Auto-scale depending on vertex and roots
    if (!isLinear) {
      let r = 5; // Default domain radius around vertex
      if (rootsType === 'two-real' && root1Val !== null && root2Val !== null) {
        const dist = Math.abs(root1Val - root2Val);
        r = Math.max(3, dist * 1.2);
      }
      xMin = vertexX - r;
      xMax = vertexX + r;
    } else {
      // Linear
      const rootVal = root1Val || 0;
      xMin = rootVal - 5;
      xMax = rootVal + 5;
    }

    // Find y bounds
    const yAtMin = a * xMin * xMin + b * xMin + c;
    const yAtMax = a * xMax * xMax + b * xMax + c;
    const yVals = [yAtMin, yAtMax];
    if (!isLinear) yVals.push(vertexY);
    
    let yMin = Math.min(...yVals);
    let yMax = Math.max(...yVals);
    
    // Add vertical padding
    let yRange = yMax - yMin;
    if (yRange === 0) yRange = 10;
    
    let yBottom = yMin - 0.2 * yRange;
    let yTop = yMax + 0.2 * yRange;

    // Ensure we include y = 0 and x = 0 grids if possible
    if (yBottom > -1) yBottom = -1;
    if (yTop < 1) yTop = 1;
    if (xMin > -1) xMin = -1;
    if (xMax < 1) xMax = 1;

    const padding = 40;

    // Coordinate mapping functions
    const toPixelX = (xVal: number) => {
      return padding + ((xVal - xMin) / (xMax - xMin)) * (width - 2 * padding);
    };

    const toPixelY = (yVal: number) => {
      return height - padding - ((yVal - yBottom) / (yTop - yBottom)) * (height - 2 * padding);
    };

    // Draw Grid Lines & Numbers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '10px monospace';

    // X-Grid
    const xStep = Math.max(0.1, Math.round((xMax - xMin) / 8 * 10) / 10);
    const xStart = Math.floor(xMin / xStep) * xStep;
    for (let xG = xStart; xG <= xMax; xG += xStep) {
      const px = toPixelX(xG);
      ctx.beginPath();
      ctx.moveTo(px, padding);
      ctx.lineTo(px, height - padding);
      ctx.stroke();

      // Label
      if (Math.abs(xG) > 0.001) {
        ctx.fillText(xG.toFixed(1), px - 10, height - padding + 15);
      }
    }

    // Y-Grid
    const yStep = Math.max(0.1, Math.round((yTop - yBottom) / 8 * 10) / 10);
    const yStart = Math.floor(yBottom / yStep) * yStep;
    for (let yG = yStart; yG <= yTop; yG += yStep) {
      const py = toPixelY(yG);
      ctx.beginPath();
      ctx.moveTo(padding, py);
      ctx.lineTo(width - padding, py);
      ctx.stroke();

      // Label
      if (Math.abs(yG) > 0.001) {
        ctx.fillText(yG.toFixed(1), padding - 30, py + 4);
      }
    }

    // Draw Axes (X-axis at y=0, Y-axis at x=0)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;

    // X Axis
    if (yBottom <= 0 && yTop >= 0) {
      const yZeroPy = toPixelY(0);
      ctx.beginPath();
      ctx.moveTo(padding, yZeroPy);
      ctx.lineTo(width - padding, yZeroPy);
      ctx.stroke();
      ctx.fillText('x', width - padding + 8, yZeroPy + 4);
    }

    // Y Axis
    if (xMin <= 0 && xMax >= 0) {
      const xZeroPx = toPixelX(0);
      ctx.beginPath();
      ctx.moveTo(xZeroPx, padding);
      ctx.lineTo(xZeroPx, height - padding);
      ctx.stroke();
      ctx.fillText('y', xZeroPx - 4, padding - 8);
    }

    // Plot Parabola Curve
    ctx.strokeStyle = '#00A19B'; // Premium primary color
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const currX = xMin + (i / steps) * (xMax - xMin);
      const currY = a * currX * currX + b * currX + c;
      const px = toPixelX(currX);
      const py = toPixelY(currY);

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        // Prevent drawing outside the canvas bounding box
        if (py >= padding && py <= height - padding) {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();

    // Draw markers for special points
    const drawMarker = (xVal: number, yVal: number, color: string, label: string) => {
      const px = toPixelX(xVal);
      const py = toPixelY(yVal);

      if (px < padding || px > width - padding || py < padding || py > height - padding) {
        return; // Don't draw points out of canvas bounds
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Label shadow background
      ctx.fillStyle = 'rgba(12, 21, 36, 0.85)';
      const text = `${label} (${xVal.toFixed(2)}, ${yVal.toFixed(2)})`;
      const textWidth = ctx.measureText(text).width;
      ctx.fillRect(px + 10, py - 12, textWidth + 8, 16);

      // Label text
      ctx.fillStyle = color;
      ctx.font = 'bold 9px monospace';
      ctx.fillText(text, px + 14, py - 1);
    };

    // 1. Vertex Marker (if not linear)
    if (!isLinear) {
      drawMarker(vertexX, vertexY, '#e67e22', 'Vertex');
    }

    // 2. Y-Intercept
    drawMarker(0, yIntercept, '#9b59b6', 'y-Int');

    // 3. Roots Markers
    if (rootsType === 'two-real' && root1Val !== null && root2Val !== null) {
      drawMarker(root1Val, 0, '#2ecc71', 'Root 1');
      drawMarker(root2Val, 0, '#2ecc71', 'Root 2');
    } else if (rootsType === 'one-real' && root1Val !== null) {
      drawMarker(root1Val, 0, '#2ecc71', 'Double Root');
    } else if (rootsType === 'linear' && root1Val !== null) {
      drawMarker(root1Val, 0, '#2ecc71', 'Root');
    }

  }, [a, b, c, rootsType, root1Val, root2Val, vertexX, vertexY, yIntercept, isLinear]);

  // Styles
  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '10px',
    color: 'var(--text-color)',
    padding: '10px 14px',
    fontSize: '1rem',
    width: '100%',
    textAlign: 'center',
    outline: 'none',
    transition: 'var(--transition-smooth)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'center',
  };

  const btnStyle: React.CSSProperties = {
    background: 'var(--primary-color)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'var(--transition-smooth)',
  };

  // Step calculations helpers for breakdown
  const getDiscriminantBreakdown = () => {
    const term1 = b * b;
    const term2 = 4 * a * c;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div>
          <code>D = b² - 4ac</code>
        </div>
        <div>
          <code>D = ({b})² - 4({a})({c})</code>
        </div>
        <div>
          <code>D = {term1} - ({term2})</code>
        </div>
        <div>
          <code>D = {discriminant}</code>
        </div>
      </div>
    );
  };

  const getRootsBreakdown = () => {
    if (isLinear) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>This is a linear equation (a = 0):</div>
          <code>bx + c = 0 &rArr; {b}x + {c} = 0</code>
          <code>x = -c / b &rArr; x = -({c}) / {b}</code>
          <code>x = {root1Str}</code>
        </div>
      );
    }

    if (discriminant > 0) {
      const sqrtD = Math.sqrt(discriminant).toFixed(4);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>Since D &gt; 0, the equation has <strong>two distinct real roots</strong>:</div>
          <code>x = (-b &plusmn; &radic;D) / 2a</code>
          <code>x = (-({b}) &plusmn; &radic;{discriminant}) / 2({a})</code>
          <code>x = ({ -b } &plusmn; {sqrtD}) / {2 * a}</code>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
            <div>
              <code>x₁ = ({ -b } + {sqrtD}) / {2 * a}</code>
              <br />
              <code>x₁ = {root1Str}</code>
            </div>
            <div>
              <code>x₂ = ({ -b } - {sqrtD}) / {2 * a}</code>
              <br />
              <code>x₂ = {root2Str}</code>
            </div>
          </div>
        </div>
      );
    } else if (discriminant === 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>Since D = 0, the equation has <strong>one double real root</strong>:</div>
          <code>x = -b / 2a</code>
          <code>x = -({b}) / 2({a})</code>
          <code>x = { -b } / {2 * a}</code>
          <code>x = {root1Str}</code>
        </div>
      );
    } else {
      const absD = Math.abs(discriminant);
      const sqrtAbsD = Math.sqrt(absD).toFixed(4);
      const realPart = (-b / (2 * a)).toFixed(4);
      const imagPart = (Math.sqrt(absD) / (2 * a)).toFixed(4);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>Since D &lt; 0, the equation has <strong>two complex (conjugate) roots</strong>:</div>
          <code>x = (-b &plusmn; i&radic;|D|) / 2a</code>
          <code>x = (-({b}) &plusmn; i&radic;{absD}) / 2({a})</code>
          <code>x = ({ -b } &plusmn; {sqrtAbsD}i) / {2 * a}</code>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
            <div>
              <code>x₁ = {realPart} + {imagPart}i</code>
            </div>
            <div>
              <code>x₂ = {realPart} - {imagPart}i</code>
            </div>
          </div>
        </div>
      );
    }
  };

  const getVertexBreakdown = () => {
    if (isLinear) return <div>Linear equations do not have a vertex/turning point.</div>;
    const term1 = -b;
    const term2 = 2 * a;
    const yValFormula = `y = ${a}(${vertexX.toFixed(4)})² + (${b})(${vertexX.toFixed(4)}) + ${c}`;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div>The vertex (turning point) coordinate (h, k) is calculated as:</div>
        <code>h = -b / 2a &rArr; -({b}) / 2({a}) = {term1} / {term2} = {vertexX.toFixed(4)}</code>
        <code>k = f(h) &rArr; {yValFormula} = {vertexY.toFixed(4)}</code>
        <div style={{ marginTop: '4px' }}>
          Vertex Coordinate: <strong>({vertexX.toFixed(4)}, {vertexY.toFixed(4)})</strong>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel">
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Compass size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Quadratic Parabola Solver</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
          Solve standard second-degree equations (ax² + bx + c = 0) instantly. Explore real and complex roots, step-by-step mathematical derivations, and a dynamic plot layout.
        </p>

        {/* Inputs */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '16px', 
          marginBottom: '24px',
          background: 'var(--glass-bg)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid var(--glass-border)'
        }}>
          <div>
            <label style={inputLabelStyle('var(--primary-color)')}>Coefficient a (x²)</label>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={aStr} 
                onChange={(e) => setAStr(e.target.value)} 
                style={inputStyle}
                placeholder="a"
              />
            </div>
          </div>
          <div>
            <label style={inputLabelStyle('#9b59b6')}>Coefficient b (x)</label>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={bStr} 
                onChange={(e) => setBStr(e.target.value)} 
                style={inputStyle}
                placeholder="b"
              />
            </div>
          </div>
          <div>
            <label style={inputLabelStyle('#e67e22')}>Constant c</label>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={cStr} 
                onChange={(e) => setCStr(e.target.value)} 
                style={inputStyle}
                placeholder="c"
              />
            </div>
          </div>
        </div>

        {/* Invalid input alert */}
        {a === 0 && b === 0 && (
          <div style={{
            background: 'rgba(220,53,69,0.06)',
            border: '1px solid rgba(220,53,69,0.2)',
            borderRadius: '12px',
            padding: '12px 18px',
            color: '#dc3545',
            fontSize: '0.85rem',
            marginBottom: '24px',
            fontWeight: 600
          }}>
            ⚠️ Both "a" and "b" coefficients are zero. The formula cannot be solved.
          </div>
        )}

        {/* Equations Representation */}
        <div style={{ 
          textAlign: 'center', 
          fontSize: '1.4rem', 
          fontWeight: 700, 
          fontFamily: 'monospace', 
          marginBottom: '28px',
          color: 'var(--text-color)',
          background: 'var(--glass-bg)',
          padding: '14px',
          borderRadius: '12px',
          border: '1px solid var(--glass-border)',
        }}>
          {aStr || '0'}x² {Number(bStr) >= 0 ? `+ ${bStr || '0'}` : `- ${Math.abs(Number(bStr) || 0)}`}x {Number(cStr) >= 0 ? `+ ${cStr || '0'}` : `- ${Math.abs(Number(cStr) || 0)}`} = 0
        </div>

        {/* Interactive Layout (Canvas + Roots breakdown) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '24px',
          alignItems: 'start'
        }}>
          
          {/* Canvas Wrapper */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '10px' 
            }}>
              <span style={sectionHeaderStyle}><Compass size={18} /> Interactive Parabola Curve Plot</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Auto-scaled around key points
              </span>
            </div>
            
            <div style={{ 
              borderRadius: '16px', 
              overflow: 'hidden', 
              border: '1px solid var(--glass-border)',
              position: 'relative',
              background: '#0c1524'
            }}>
              <canvas 
                ref={canvasRef} 
                style={{ 
                  width: '100%', 
                  height: '350px', 
                  display: 'block' 
                }} 
              />
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Discriminant */}
            <div style={metricCardStyle('rgba(255, 255, 255, 0.02)')}>
              <span style={labelStyle}>Discriminant (D = b² - 4ac)</span>
              <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '4px', fontFamily: 'monospace' }}>
                {isLinear ? 'N/A (Linear)' : discriminant}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {isLinear ? 'Linear equation' : discriminant > 0 ? '🟢 2 Distinct Real Roots' : discriminant === 0 ? '🟡 1 Double Real Root' : '🔴 2 Complex Roots'}
              </span>
            </div>

            {/* Root 1 */}
            <div style={metricCardStyle('rgba(0, 161, 155, 0.05)', 'rgba(0, 161, 155, 0.2)')}>
              <span style={{ ...labelStyle, color: 'var(--primary-color)' }}>{rootsType === 'complex' ? 'Complex Root 1' : 'Root x₁'}</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, marginTop: '8px', color: 'var(--primary-color)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {rootsType === 'invalid' ? 'No solution' : root1Str || '0'}
              </div>
            </div>

            {/* Root 2 */}
            <div style={metricCardStyle(rootsType === 'complex' || rootsType === 'two-real' ? 'rgba(0, 161, 155, 0.05)' : 'rgba(255,255,255,0.01)', rootsType === 'complex' || rootsType === 'two-real' ? 'rgba(0, 161, 155, 0.2)' : 'var(--glass-border)')}>
              <span style={{ ...labelStyle, color: rootsType === 'complex' || rootsType === 'two-real' ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                {rootsType === 'complex' ? 'Complex Root 2' : 'Root x₂'}
              </span>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, marginTop: '8px', color: rootsType === 'complex' || rootsType === 'two-real' ? 'var(--primary-color)' : 'var(--text-secondary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {rootsType === 'two-real' || rootsType === 'complex' ? root2Str : 'None'}
              </div>
            </div>
          </div>

          {/* Step-by-Step Breakdown */}
          {rootsType !== 'invalid' && (
            <div style={{ 
              marginTop: '12px',
              borderTop: '1px solid var(--glass-border)',
              paddingTop: '24px'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="var(--primary-color)" /> Detailed Mathematical Breakdown
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {/* Discriminant Steps */}
                {!isLinear && (
                  <div style={breakdownSectionStyle}>
                    <div style={breakdownTitleStyle}>Step 1: Compute the Discriminant</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>
                      {getDiscriminantBreakdown()}
                    </div>
                  </div>
                )}

                {/* Roots Steps */}
                <div style={breakdownSectionStyle}>
                  <div style={breakdownTitleStyle}>{isLinear ? 'Step 1: Solve Linear Equation' : 'Step 2: Solve for Quadratic Roots'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>
                    {getRootsBreakdown()}
                  </div>
                </div>

                {/* Vertex Steps */}
                {!isLinear && (
                  <div style={breakdownSectionStyle}>
                    <div style={breakdownTitleStyle}>Step 3: Vertex (Extremum) Calculation</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>
                      {getVertexBreakdown()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

// Sub-component styled templates
const inputLabelStyle = (color: string): React.CSSProperties => ({
  fontSize: '0.8rem',
  fontWeight: 700,
  color: color,
  marginBottom: '6px',
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  textAlign: 'center',
});

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 700,
  color: 'var(--text-color)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const metricCardStyle = (bgColor: string, borderColor: string = 'var(--glass-border)'): React.CSSProperties => ({
  padding: '18px',
  borderRadius: '14px',
  background: bgColor,
  border: `1px solid ${borderColor}`,
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const breakdownSectionStyle: React.CSSProperties = {
  background: 'var(--glass-bg)',
  border: '1px solid var(--glass-border)',
  borderRadius: '12px',
  padding: '18px',
};

const breakdownTitleStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: '0.9rem',
  color: 'var(--primary-color)',
  marginBottom: '12px',
  borderBottom: '1px solid var(--glass-border)',
  paddingBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};
