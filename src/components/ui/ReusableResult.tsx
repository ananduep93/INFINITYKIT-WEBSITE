import React, { useState } from 'react';
import { Copy, Download, Share2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReusableResultProps {
  value: string;
  label?: string;
  subValue?: string;
  color?: 'success' | 'warning' | 'error' | 'none';
  copyable?: boolean;
  downloadableFilename?: string;
}

export const ReusableResult: React.FC<ReusableResultProps> = ({
  value,
  label = 'Calculation Result',
  subValue,
  color = 'success',
  copyable = true,
  downloadableFilename = 'infinity_kit_result.txt'
}) => {
  const [copied, setCopied] = useState(false);

  const triggerEffects = () => {
    // 1. Confetti
    if (color === 'success') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00A19B', '#008782', '#4facfe', '#43e97b']
      });
    }

    // 2. Haptic Vibrate
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
  };

  React.useEffect(() => {
    if (value) {
      triggerEffects();
    }
  }, [value]);

  const handleCopy = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadableFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      navigator.share({
        title: label,
        text: `${label}: ${value} \nGenerated via Infinity Kit`,
        url: window.location.href
      }).catch(console.error);
    } else {
      handleCopy();
      alert('Link copied to clipboard for sharing!');
    }
  };

  let borderColor = 'var(--glass-border)';
  let bgGradient = 'rgba(0,0,0,0.01)';
  if (color === 'success') {
    borderColor = 'var(--success-color)';
    bgGradient = 'rgba(40,167,69,0.03)';
  } else if (color === 'error') {
    borderColor = 'var(--error-color)';
    bgGradient = 'rgba(220,53,69,0.03)';
  } else if (color === 'warning') {
    borderColor = 'var(--warning-color)';
    bgGradient = 'rgba(255,193,7,0.03)';
  }

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '24px',
        background: bgGradient,
        marginTop: '25px',
        transition: 'all 0.3s ease',
        animation: 'fadeIn 0.4s ease'
      }}
    >
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        {label}
      </div>

      <div style={{ fontSize: '1.8rem', fontWeight: 800, wordBreak: 'break-all', fontFamily: 'monospace', color: 'var(--text-color)', marginBottom: '8px', lineHeight: '1.2' }}>
        {value}
      </div>

      {subValue && (
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
          {subValue}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
        {copyable && (
          <button
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
        <button
          onClick={handleDownload}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
        >
          <Download size={16} /> Download
        </button>
        <button
          onClick={handleShare}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
        >
          <Share2 size={16} /> Share
        </button>
      </div>
    </div>
  );
};
export default ReusableResult;
