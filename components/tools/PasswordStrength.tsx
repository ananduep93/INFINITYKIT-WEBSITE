'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertTriangle, 
  Lock, 
  Clock, 
  Layers, 
  RefreshCw, 
  Sparkles,
  Copy
} from 'lucide-react';

export default function PasswordStrength() {
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Requirements state
  const reqs = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password)
  };

  const reqList = [
    { key: 'length', label: 'At least 8 characters long' },
    { key: 'uppercase', label: 'Contains uppercase letter (A-Z)' },
    { key: 'lowercase', label: 'Contains lowercase letter (a-z)' },
    { key: 'number', label: 'Contains a number (0-9)' },
    { key: 'symbol', label: 'Contains a special symbol (e.g. !@#$)' }
  ];

  // Calculate score (0 to 100)
  const calculateScore = (): number => {
    if (password.length === 0) return 0;

    let baseScore = 0;
    // 15% per criteria met (max 75%)
    Object.values(reqs).forEach(met => {
      if (met) baseScore += 15;
    });

    // Length bonus: 2.5% per character above 8 (max 25%)
    const lengthBonus = Math.max(0, Math.min(25, (password.length - 8) * 2.5));
    
    return Math.min(100, Math.round(baseScore + lengthBonus));
  };

  const score = calculateScore();

  // Get score description and styling
  const getScoreDetails = () => {
    if (password.length === 0) {
      return { 
        label: 'Empty', 
        color: '#7f8c8d', 
        gradient: 'linear-gradient(90deg, #555 0%, #777 100%)', 
        bgLight: 'rgba(255,255,255,0.01)', 
        borderColor: 'var(--glass-border)' 
      };
    }
    if (score <= 30) {
      return { 
        label: 'Very Weak', 
        color: '#e74c3c', 
        gradient: 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)', 
        bgLight: 'rgba(231,76,60,0.06)', 
        borderColor: 'rgba(231,76,60,0.2)' 
      };
    }
    if (score <= 50) {
      return { 
        label: 'Weak', 
        color: '#e67e22', 
        gradient: 'linear-gradient(90deg, #e67e22 0%, #d35400 100%)', 
        bgLight: 'rgba(230,126,34,0.06)', 
        borderColor: 'rgba(230,126,34,0.2)' 
      };
    }
    if (score <= 75) {
      return { 
        label: 'Fairly Strong', 
        color: '#f1c40f', 
        gradient: 'linear-gradient(90deg, #f1c40f 0%, #f39c12 100%)', 
        bgLight: 'rgba(241,196,15,0.06)', 
        borderColor: 'rgba(241,196,15,0.2)' 
      };
    }
    return { 
      label: 'Extremely Secure 🚀', 
      color: '#00A19B', 
      gradient: 'linear-gradient(90deg, var(--primary-color) 0%, #00d2c7 100%)', 
      bgLight: 'rgba(0,161,155,0.06)', 
      borderColor: 'rgba(0,161,155,0.25)' 
    };
  };

  const details = getScoreDetails();

  // Calculate entropy (bits) & crack time
  const calculateEntropy = () => {
    if (!password) return { bits: 0, poolSize: 0 };

    let poolSize = 0;
    if (reqs.lowercase) poolSize += 26;
    if (reqs.uppercase) poolSize += 26;
    if (reqs.number) poolSize += 10;
    if (reqs.symbol) poolSize += 33; // standard keyboard symbols

    if (poolSize === 0) poolSize = 26; // fallback

    const bits = password.length * Math.log2(poolSize);
    return { bits: Math.round(bits), poolSize };
  };

  const { bits, poolSize } = calculateEntropy();

  // Estimate crack time
  // Assuming a sophisticated cluster or botnet doing 10 Billion guesses per second
  const getCrackTime = () => {
    if (!password) return 'N/A';
    
    // total operations to exhaust space is 2^bits
    const attempts = Math.pow(2, bits);
    const hashesPerSecond = 10000000000; // 10 Billion per sec
    const seconds = attempts / hashesPerSecond;

    if (seconds < 0.1) return 'Instantly ⚡';
    if (seconds < 1) return 'Under a second';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    
    const minutes = seconds / 60;
    if (minutes < 60) return `${Math.round(minutes)} minutes`;

    const hours = minutes / 60;
    if (hours < 24) return `${Math.round(hours)} hours`;

    const days = hours / 24;
    if (days < 30) return `${Math.round(days)} days`;

    const months = days / 30;
    if (months < 12) return `${Math.round(months)} months`;

    const years = days / 365;
    if (years < 100) return `${Math.round(years)} years`;

    const centuries = years / 100;
    if (centuries < 1000) return `${Math.round(centuries).toLocaleString()} centuries`;
    
    return 'Centuries (Thoroughly Secure) 🌌';
  };

  // Generate list of tailored suggestions
  const getSuggestions = () => {
    const list: string[] = [];
    
    if (password.length === 0) {
      return ['Enter a password to receive specific security enhancements.'];
    }

    if (password.length < 12) {
      list.push('Make the password longer. 12-16 characters increases crack time exponentially.');
    }
    if (!reqs.uppercase) {
      list.push('Add an uppercase letter (A-Z) to mix the character space.');
    }
    if (!reqs.lowercase) {
      list.push('Include a lowercase letter (a-z).');
    }
    if (!reqs.number) {
      list.push('Incorporate numbers (0-9) to widen permutations.');
    }
    if (!reqs.symbol) {
      list.push('Embed a special symbol (e.g. #, $, %, @, &) to heighten complexity.');
    }

    // Check for common weak patterns
    const commonPatterns = ['123', 'qwerty', 'password', 'admin', 'welcome', 'love', 'football'];
    let containsPattern = false;
    commonPatterns.forEach(pattern => {
      if (password.toLowerCase().includes(pattern)) {
        containsPattern = true;
      }
    });

    if (containsPattern) {
      list.push('Avoid common sequential patterns or simple dictionary phrases like "123" or "password".');
    }

    if (list.length === 0 && password.length >= 12) {
      list.push('Outstanding! Your password meets all cryptographic complexity baselines. Protect it in an offline vault.');
    }

    return list;
  };

  // Password Generator
  const generatePassword = () => {
    const length = 16;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let generated = '';
    
    // Cryptographically secure pseudorandom number generator if available
    const array = new Uint32Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        generated += chars[array[i] % chars.length];
      }
    } else {
      // Fallback
      for (let i = 0; i < length; i++) {
        generated += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    
    setPassword(generated);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Styles
  const inputContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    marginBottom: '20px',
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    border: `1.5px solid ${details.borderColor}`,
    borderRadius: '12px',
    color: 'var(--text-color)',
    padding: '14px 45px 14px 16px',
    fontSize: '1.05rem',
    width: '100%',
    outline: 'none',
    boxShadow: `0 4px 10px rgba(0, 0, 0, 0.1)`,
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
  };

  const btnStyle: React.CSSProperties = {
    background: 'var(--primary-color)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 20px',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'var(--transition-smooth)',
  };

  const outlineBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: 'transparent',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-color)',
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel">
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Shield size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Password Strength Evaluator</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
          Inspect password complexity, estimate brute-force cracking durations, check baseline security rules, and generate high-entropy keys client-side.
        </p>

        {/* Password Input Area */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={labelStyle}>Input Password</label>
            
            {/* Quick Generator */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={generatePassword} 
                style={{ 
                  background: 'rgba(0,161,155,0.06)', 
                  border: '1px solid rgba(0,161,155,0.2)', 
                  borderRadius: '8px', 
                  color: 'var(--primary-color)', 
                  padding: '4px 10px', 
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={12} /> Auto-Generate Key
              </button>
              {password && (
                <button 
                  onClick={copyToClipboard}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text-color)',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copied ? <Check size={12} color="#28a745" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>

          <div style={inputContainerStyle}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter or paste password to evaluate..."
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '15px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Visual Strength Indicator Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Strength Score: <strong style={{ color: details.color }}>{score}%</strong>
            </span>
            <span style={{ 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: '#fff', 
              background: details.color,
              padding: '2px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {details.label}
            </span>
          </div>

          {/* Bar track */}
          <div style={{
            width: '100%',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--glass-border)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${score}%`,
              height: '100%',
              background: details.gradient,
              borderRadius: '6px',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>
        </div>

        {/* Main evaluation panels */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px',
          alignItems: 'start'
        }}>
          
          {/* Checklist of rules */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--primary-color)" /> Checklist Requirements
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reqList.map((r) => {
                const met = reqs[r.key as keyof typeof reqs];
                return (
                  <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: met ? 'rgba(40, 167, 69, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1.5px solid ${met ? '#28a745' : 'var(--glass-border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'var(--transition-smooth)'
                    }}>
                      {met ? <Check size={12} color="#28a745" strokeWidth={3} /> : <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-secondary)' }} />}
                    </div>
                    <span style={{ 
                      fontSize: '0.88rem', 
                      color: met ? 'var(--text-color)' : 'var(--text-secondary)',
                      textDecoration: met ? 'none' : 'none',
                      fontWeight: met ? 600 : 400
                    }}>
                      {r.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crack duration and entropy stats */}
          <div style={{
            background: details.bgLight,
            border: `1px solid ${details.borderColor}`,
            borderRadius: '16px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color={details.color} /> Brute-Force Estimates
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <span style={statLabelStyle}>Approximate Crack Time</span>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: details.color, marginTop: '2px', wordBreak: 'break-all' }}>
                  {getCrackTime()}
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                  Estimated time for a modern computing cluster doing 10 Billion guesses per second to exhaustively search this keyspace.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
                <div>
                  <span style={statLabelStyle}>Entropy Bits</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px', fontFamily: 'monospace' }}>
                    {bits} bits
                  </div>
                </div>
                <div>
                  <span style={statLabelStyle}>Character Pool</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px', fontFamily: 'monospace' }}>
                    {poolSize} unique
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Tailored suggestions box */}
        <div style={{ 
          marginTop: '24px', 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: '16px', 
          padding: '20px' 
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--primary-color)" /> Tailored Security Recommendations
          </h3>
          
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {getSuggestions().map((suggestion, index) => (
              <li key={index} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

const statLabelStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};
