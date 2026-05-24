'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ToolPageError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dynamic Tool Page Failure:', error);
  }, [error]);

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '80px auto', padding: '40px', textAlign: 'center', fontFamily: "'Outfit', sans-serif" }}>
      <AlertTriangle size={48} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-color)', margin: '0 0 8px' }}>Workspace Error</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 24px', lineHeight: 1.5 }}>
        An unexpected exception occurred inside this browser sandbox. Reset the session or retry to restore workspace state.
      </p>
      <button 
        onClick={() => reset()} 
        className="btn"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
      >
        <RefreshCw size={16} /> Retry Session
      </button>
    </div>
  );
}
