'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Eye, EyeOff, Lock, Server, Info, Search, HelpCircle } from 'lucide-react';

export default function PasswordLeakScanner() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    status: 'idle' | 'safe' | 'leaked' | 'error';
    count?: number;
    errorMsg?: string;
  }>({ status: 'idle' });

  // Native browser client-side SHA-1 hashing (returns uppercase hex string)
  const calculateSHA1 = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setResult({ status: 'idle' });

    try {
      // 1. Calculate SHA-1 client-side
      const sha1Hash = await calculateSHA1(password);
      
      // 2. K-Anonymity Split
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      // 3. Query HaveIBeenPwned Range API
      const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      if (!res.ok) {
        throw new Error('API request failed. Please check your internet connection.');
      }

      const text = await res.text();
      const lines = text.split('\n');

      // 4. Search for matching suffix in the response
      let matchCount = 0;
      for (const line of lines) {
        const [lineSuffix, countStr] = line.trim().split(':');
        if (lineSuffix.toUpperCase() === suffix) {
          matchCount = parseInt(countStr, 10);
          break;
        }
      }

      if (matchCount > 0) {
        setResult({ status: 'leaked', count: matchCount });
      } else {
        setResult({ status: 'safe' });
      }
    } catch (err: any) {
      setResult({ 
        status: 'error', 
        errorMsg: err.message || 'An unexpected error occurred during scanning.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '10px 0', width: '100%' }}>
      {/* Header Panel */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '20px 24px', 
          marginBottom: '20px', 
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            <Lock color="var(--primary-color)" size={24} /> Password Leak Scanner
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '6px 0 0' }}>
            Check if your common passwords have been exposed in public historical database breaches.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Left Panel: Inputs and Scanning */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <form onSubmit={handleScan} className="glass-panel" style={{ padding: '24px', borderRadius: '16px', margin: 0 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px' }}>Scan Password</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                  Enter Password to Evaluate
                </label>
                
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter candidate password"
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-color)',
                      outline: 'none',
                      fontSize: '0.9rem',
                      fontFamily: showPassword ? 'inherit' : 'monospace',
                      letterSpacing: showPassword ? 'normal' : '2px'
                    }}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!password || isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '12px',
                  background: 'var(--primary-color)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: !password || isLoading ? 'not-allowed' : 'pointer',
                  opacity: !password || isLoading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0, 161, 155, 0.2)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {isLoading ? (
                  <>
                    <div 
                      style={{ 
                        width: '14px', 
                        height: '14px', 
                        border: '2px solid rgba(255,255,255,0.3)', 
                        borderTopColor: '#fff', 
                        borderRadius: '50%', 
                        animation: 'spin 0.6s linear infinite' 
                      }} 
                    />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Scan Securely
                  </>
                )}
              </button>
            </div>
            
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </form>

          {/* Privacy Note */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '20px', 
              borderRadius: '16px', 
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Info size={16} color="var(--primary-color)" />
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>Privacy-First Commitment</strong>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Your password is safe. We use **k-anonymity**; only the first 5 characters of your password&apos;s SHA-1 hash are sent to the API. The API never sees your full password or complete hash, keeping it completely private.
            </p>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.015)', padding: '8px 10px', borderRadius: '8px' }}>
              <Server size={12} />
              <span>Full Local Hash: Native Browser crypto.subtle</span>
            </div>
          </div>

        </div>

        {/* Right Panel: Results Display */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {result.status === 'idle' && (
            <div 
              className="glass-panel" 
              style={{ 
                padding: '40px 24px', 
                borderRadius: '16px', 
                textAlign: 'center', 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}
            >
              <HelpCircle size={48} color="var(--text-secondary)" style={{ opacity: 0.4, marginBottom: '16px' }} />
              <h4 style={{ fontWeight: 700, margin: '0 0 6px' }}>Ready to Scan</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, maxWidth: '280px' }}>
                Enter a candidate password on the left to securely evaluate it against billions of leaked records.
              </p>
            </div>
          )}

          {result.status === 'safe' && (
            <div 
              className="glass-panel" 
              style={{ 
                padding: '40px 24px', 
                borderRadius: '16px', 
                textAlign: 'center', 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: 'rgba(16, 185, 129, 0.04)',
                border: '1px solid rgba(16, 185, 129, 0.15)'
              }}
            >
              <div 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'rgba(16, 185, 129, 0.12)', 
                  color: '#10B981', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '20px' 
                }}
              >
                <ShieldCheck size={36} />
              </div>

              <span 
                style={{ 
                  background: '#10B981', 
                  color: '#fff', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: 800, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px' 
                }}
              >
                Safe &amp; Clean
              </span>
              
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '12px 0 8px', color: '#10B981' }}>
                No Leaks Detected
              </h3>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: '1.5', margin: 0, maxWidth: '320px' }}>
                Congratulations! This password has not been detected in any known public data breaches compiled by HaveIBeenPwned. It remains private and strong.
              </p>
            </div>
          )}

          {result.status === 'leaked' && (
            <div 
              className="glass-panel" 
              style={{ 
                padding: '40px 24px', 
                borderRadius: '16px', 
                textAlign: 'center', 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: 'rgba(239, 68, 68, 0.04)',
                border: '1px solid rgba(239, 68, 68, 0.15)'
              }}
            >
              <div 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'rgba(239, 68, 68, 0.12)', 
                  color: '#EF4444', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '20px' 
                }}
              >
                <ShieldAlert size={36} />
              </div>

              <span 
                style={{ 
                  background: '#EF4444', 
                  color: '#fff', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: 800, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px' 
                }}
              >
                Leaked / Compromised
              </span>
              
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '12px 0 8px', color: '#EF4444' }}>
                Exposed in Breaches!
              </h3>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: '1.5', margin: '0 0 16px', maxWidth: '320px' }}>
                This password has been exposed in public database compromises. It was compiled exactly <strong>{result.count?.toLocaleString()} times</strong> in past breaches.
              </p>

              <div 
                style={{ 
                  background: 'rgba(0,0,0,0.015)', 
                  border: '1px solid var(--glass-border)', 
                  padding: '10px 14px', 
                  borderRadius: '10px', 
                  fontSize: '0.75rem', 
                  color: 'var(--text-secondary)',
                  maxWidth: '300px' 
                }}
              >
                ⚠️ <strong>Security Action:</strong> Do not use this password for any account. Create a unique, complex replacement immediately.
              </div>
            </div>
          )}

          {result.status === 'error' && (
            <div 
              className="glass-panel" 
              style={{ 
                padding: '40px 24px', 
                borderRadius: '16px', 
                textAlign: 'center', 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: 'rgba(245, 158, 11, 0.04)',
                border: '1px solid rgba(245, 158, 11, 0.15)'
              }}
            >
              <ShieldAlert size={40} color="#F59E0B" style={{ marginBottom: '16px' }} />
              <h4 style={{ fontWeight: 700, margin: '0 0 6px', color: '#F59E0B' }}>Scanning Failed</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, maxWidth: '280px' }}>
                {result.errorMsg}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
