'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Wifi, Play, RefreshCw, Clock, TrendingUp, Activity } from 'lucide-react';

interface TestResult {
  timestamp: string;
  downloadMbps: number;
  latencyMs: number;
  quality: string;
}

function quality(mbps: number): { label: string; color: string } {
  if (mbps >= 100) return { label: 'Excellent', color: '#28a745' };
  if (mbps >= 25)  return { label: 'Good', color: '#20c997' };
  if (mbps >= 5)   return { label: 'Fair', color: '#ffc107' };
  return { label: 'Poor', color: '#dc3545' };
}

export default function InternetSpeedTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadMbps, setDownloadMbps] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);
  const [currentPhase, setCurrentPhase] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const runTest = useCallback(async () => {
    setStatus('testing');
    setProgress(0);
    setDownloadMbps(null);
    setLatencyMs(null);

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    try {
      // Phase 1: Latency ping
      setCurrentPhase('Measuring latency…');
      setProgress(10);
      const pingStart = performance.now();
      await fetch('https://www.cloudflare.com/cdn-cgi/trace', { method: 'HEAD', signal, cache: 'no-store', mode: 'no-cors' });
      const pingEnd = performance.now();
      const measuredLatency = Math.round(pingEnd - pingStart);
      setLatencyMs(measuredLatency);
      setProgress(30);

      // Phase 2: Download speed
      setCurrentPhase('Testing download speed…');
      const PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB target
      const urls = [
        `https://speed.cloudflare.com/__down?bytes=${PAYLOAD_SIZE}`,
        `https://httpbin.org/stream-bytes/${PAYLOAD_SIZE}`,
      ];

      let totalBytes = 0;
      let startTime = performance.now();
      let success = false;

      for (const url of urls) {
        try {
          startTime = performance.now();
          const res = await fetch(url, { signal, cache: 'no-store', mode: 'cors' });
          if (!res.ok || !res.body) continue;
          const reader = res.body.getReader();
          totalBytes = 0;
          let done = false;

          while (!done) {
            const { done: d, value } = await reader.read();
            done = d;
            if (value) {
              totalBytes += value.length;
              const elapsed = (performance.now() - startTime) / 1000;
              const mbps = (totalBytes * 8) / (elapsed * 1_000_000);
              setProgress(30 + Math.min(60, Math.round((totalBytes / PAYLOAD_SIZE) * 60)));
              setDownloadMbps(Math.round(mbps * 10) / 10);
            }
          }
          success = true;
          break;
        } catch {
          continue;
        }
      }

      if (!success) {
        // Fallback: measure a small fixed-size image
        const t0 = performance.now();
        await fetch(`https://via.placeholder.com/1500x1500.png?t=${Date.now()}`, { signal, cache: 'no-store', mode: 'no-cors' });
        const elapsed = (performance.now() - t0) / 1000;
        const estimatedBytes = 1_500_000;
        const mbps = (estimatedBytes * 8) / (elapsed * 1_000_000);
        setDownloadMbps(Math.round(mbps * 10) / 10);
      }

      const finalMbps = downloadMbps ?? 0;
      setProgress(100);
      setCurrentPhase('');
      setStatus('done');

      const now = new Date();
      setHistory(prev => [{
        timestamp: now.toLocaleTimeString(),
        downloadMbps: finalMbps,
        latencyMs: measuredLatency,
        quality: quality(finalMbps).label
      }, ...prev].slice(0, 5));

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setCurrentPhase('Test failed. Check your connection.');
      }
      setStatus('idle');
    }
  }, [downloadMbps]);

  const stopTest = () => {
    abortRef.current?.abort();
    setStatus('idle');
    setProgress(0);
    setCurrentPhase('');
  };

  const q = downloadMbps !== null ? quality(downloadMbps) : null;

  const statBox = (label: string, value: string, sub: string, icon: React.ReactNode) => (
    <div style={{
      flex: 1, minWidth: '140px',
      background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
      borderRadius: '16px', padding: '20px', textAlign: 'center'
    }}>
      <div style={{ color: 'var(--primary-color)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-color)', lineHeight: 1.2, marginTop: '4px' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{sub}</div>
    </div>
  );

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Wifi size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Internet Speed Test</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '28px' }}>
          Measure your download speed and latency using live network requests.
        </p>

        {/* Gauge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ position: 'relative', width: '200px', height: '200px' }}>
            <svg viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="80" fill="none" stroke="var(--glass-border)" strokeWidth="14" />
              <circle
                cx="100" cy="100" r="80" fill="none"
                stroke={q ? q.color : 'var(--primary-color)'}
                strokeWidth="14"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', textAlign: 'center'
            }}>
              {downloadMbps !== null ? (
                <>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-color)', lineHeight: 1 }}>{downloadMbps}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Mbps</div>
                  {q && <div style={{ fontSize: '0.78rem', fontWeight: 700, color: q.color, marginTop: '4px' }}>{q.label}</div>}
                </>
              ) : status === 'testing' ? (
                <>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{progress}%</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', maxWidth: '80px', lineHeight: 1.3 }}>{currentPhase}</div>
                </>
              ) : (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ready</div>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', justifyContent: 'center' }}>
          {statBox('Download', downloadMbps !== null ? `${downloadMbps}` : '—', 'Mbps', <TrendingUp size={20} />)}
          {statBox('Latency', latencyMs !== null ? `${latencyMs}` : '—', 'ms ping', <Clock size={20} />)}
          {statBox('Quality', q ? q.label : '—', 'connection', <Activity size={20} />)}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '28px' }}>
          {status !== 'testing' ? (
            <button onClick={runTest} style={{
              background: 'var(--primary-color)', color: '#fff', border: 'none',
              borderRadius: '14px', padding: '14px 40px', fontWeight: 800,
              fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
              transition: 'var(--transition-smooth)'
            }}>
              <Play size={20} /> {status === 'done' ? 'Run Again' : 'Start Test'}
            </button>
          ) : (
            <button onClick={stopTest} style={{
              background: 'rgba(220,53,69,0.1)', color: '#dc3545', border: '1px solid rgba(220,53,69,0.3)',
              borderRadius: '14px', padding: '14px 40px', fontWeight: 700,
              fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <RefreshCw size={18} /> Stop
            </button>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Test History (last 5)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {history.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  borderRadius: '10px', padding: '10px 14px', fontSize: '0.85rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{r.timestamp}</span>
                  <span style={{ fontWeight: 700 }}>{r.downloadMbps} Mbps</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{r.latencyMs}ms</span>
                  <span style={{ fontWeight: 700, color: quality(r.downloadMbps).color }}>{r.quality}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{
          marginTop: '20px', padding: '12px 16px', borderRadius: '10px',
          background: 'rgba(0,161,155,0.05)', border: '1px solid rgba(0,161,155,0.15)',
          fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5
        }}>
          <strong>Note:</strong> Results may vary based on browser throttling, CORS restrictions, and CDN availability. For best accuracy, run multiple tests.
        </div>
      </div>
    </div>
  );
}
