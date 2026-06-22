'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, BarChart2, Plus, Download } from 'lucide-react';
import ReusableResult from '../../../components/ui/ReusableResult';

export default function GraphMaker() {
  const [labelsInput, setLabelsInput] = useState('Jan, Feb, Mar, Apr, May');
  const [valuesInput, setValuesInput] = useState('120, 250, 180, 420, 310');
  const [chartType, setChartType] = useState<'bar' | 'column' | 'line'>('column');
  const [showChart, setShowChart] = useState(true);

  const chartData = useMemo(() => {
    const labels = labelsInput.split(',').map((l) => l.trim()).filter(Boolean);
    const values = valuesInput.split(',').map((v) => Number(v.trim())).filter((v) => !isNaN(v));
    
    const len = Math.min(labels.length, values.length);
    const zipped = [];
    let maxValue = 0.1;
    
    for (let i = 0; i < len; i++) {
      zipped.push({ label: labels[i], value: values[i] });
      if (values[i] > maxValue) {
        maxValue = values[i];
      }
    }
    
    return {
      items: zipped,
      maxValue
    };
  }, [labelsInput, valuesInput]);

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '750px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Interactive Graph Maker
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Input comma-separated keys and numbers to compile beautifully clean SVG vector charts natively.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* Form Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>X-Axis Labels (Comma-separated)</label>
            <input
              type="text"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              className="form-input"
              placeholder="e.g. Rent, Food, Bills, Savings"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Y-Axis Values (Comma-separated numbers)</label>
            <input
              type="text"
              value={valuesInput}
              onChange={(e) => setValuesInput(e.target.value)}
              className="form-input"
              placeholder="e.g. 1200, 450, 300, 800"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Visual Chart Style</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className="form-select"
            >
              <option value="column">📊 Vertical Column Chart</option>
              <option value="bar">📉 Horizontal Bar Chart</option>
              <option value="line">📈 Connected Line Graph</option>
            </select>
          </div>
        </div>

        {/* Dynamic SVG Rendering Board */}
        {showChart && chartData.items.length > 0 ? (
          <div className="glass-panel" style={{
            margin: 0,
            padding: '25px 20px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '15px',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                {chartType} chart vector
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                Dynamic Vector
              </span>
            </div>

            {/* SVG Visualizer Box */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: '200px' }}>
              {chartType === 'column' && (
                <svg viewBox="0 0 500 240" style={{ width: '100%', height: '100%' }}>
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="100" x2="480" y2="100" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="180" x2="480" y2="180" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="3 3" />
                  
                  {/* Axes */}
                  <line x1="40" y1="10" x2="40" y2="190" stroke="var(--text-color)" strokeWidth="1.5" />
                  <line x1="40" y1="190" x2="490" y2="190" stroke="var(--text-color)" strokeWidth="1.5" />

                  {/* Render columns */}
                  {chartData.items.map((item, idx) => {
                    const width = 380 / chartData.items.length;
                    const x = 50 + idx * width + (width * 0.1);
                    const colWidth = width * 0.8;
                    const colHeight = (item.value / chartData.maxValue) * 160;
                    const y = 190 - colHeight;

                    return (
                      <g key={idx}>
                        {/* Bar */}
                        <rect
                          x={x}
                          y={y}
                          width={colWidth}
                          height={colHeight}
                          rx="4"
                          fill="var(--primary-color)"
                          opacity="0.85"
                          style={{ transition: 'all 0.3s' }}
                        />
                        {/* Text Value */}
                        <text x={x + colWidth/2} y={y - 8} fontSize="9" fontWeight="700" fill="var(--text-color)" textAnchor="middle">
                          {item.value}
                        </text>
                        {/* Label */}
                        <text x={x + colWidth/2} y="208" fontSize="9" fontWeight="600" fill="var(--text-secondary)" textAnchor="middle">
                          {item.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {chartType === 'bar' && (
                <svg viewBox="0 0 500 240" style={{ width: '100%', height: '100%' }}>
                  {/* Grid Lines */}
                  <line x1="120" y1="10" x2="120" y2="210" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="300" y1="10" x2="300" y2="210" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="480" y1="10" x2="480" y2="210" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Axes */}
                  <line x1="100" y1="10" x2="100" y2="210" stroke="var(--text-color)" strokeWidth="1.5" />
                  <line x1="100" y1="210" x2="490" y2="210" stroke="var(--text-color)" strokeWidth="1.5" />

                  {/* Render bars */}
                  {chartData.items.map((item, idx) => {
                    const height = 190 / chartData.items.length;
                    const y = 15 + idx * height + (height * 0.15);
                    const colHeight = height * 0.7;
                    const colWidth = (item.value / chartData.maxValue) * 350;

                    return (
                      <g key={idx}>
                        {/* Bar */}
                        <rect
                          x="100"
                          y={y}
                          width={colWidth}
                          height={colHeight}
                          rx="4"
                          fill="var(--primary-color)"
                          opacity="0.85"
                          style={{ transition: 'all 0.3s' }}
                        />
                        {/* Text Value */}
                        <text x={100 + colWidth + 10} y={y + colHeight/2 + 3} fontSize="9" fontWeight="700" fill="var(--text-color)" textAnchor="start">
                          {item.value}
                        </text>
                        {/* Label */}
                        <text x="85" y={y + colHeight/2 + 3} fontSize="9" fontWeight="600" fill="var(--text-secondary)" textAnchor="end">
                          {item.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {chartType === 'line' && (
                <svg viewBox="0 0 500 240" style={{ width: '100%', height: '100%' }}>
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="100" x2="480" y2="100" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="180" x2="480" y2="180" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Axes */}
                  <line x1="40" y1="10" x2="40" y2="190" stroke="var(--text-color)" strokeWidth="1.5" />
                  <line x1="40" y1="190" x2="490" y2="190" stroke="var(--text-color)" strokeWidth="1.5" />

                  {/* Coordinates calculation for path */}
                  {(() => {
                    const coords = chartData.items.map((item, idx) => {
                      const width = 380 / (chartData.items.length - 1 || 1);
                      const x = 50 + idx * width;
                      const colHeight = (item.value / chartData.maxValue) * 150;
                      const y = 180 - colHeight;
                      return { x, y, val: item.value, lbl: item.label };
                    });

                    const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

                    return (
                      <>
                        {/* Line Path */}
                        {coords.length > 1 && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="var(--primary-color)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* Nodes and Text */}
                        {coords.map((c, idx) => (
                          <g key={idx}>
                            <circle cx={c.x} cy={c.y} r="5" fill="var(--text-color)" stroke="var(--primary-color)" strokeWidth="2" />
                            <text x={c.x} y={c.y - 10} fontSize="9" fontWeight="700" fill="var(--text-color)" textAnchor="middle">
                              {c.val}
                            </text>
                            <text x={c.x} y="208" fontSize="9" fontWeight="600" fill="var(--text-secondary)" textAnchor="middle">
                              {c.lbl}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No visual charts rendered. Input labels and values to generate.
          </div>
        )}
      </div>
    </div>
  );
}
