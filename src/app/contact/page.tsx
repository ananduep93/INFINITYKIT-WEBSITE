'use client';

import React from 'react';
import { Mail, Instagram, Linkedin, Github, MessageSquare, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '80px auto 40px', padding: '40px 20px' }}>
      
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 161, 155, 0.08)', color: 'var(--primary-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '15px' }}>
          <MessageSquare size={14} /> Get in Touch
        </div>
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, var(--text-color) 30%, var(--primary-color) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '15px',
          letterSpacing: '-1px'
        }}>
          Contact Us
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          maxWidth: '550px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Have suggestions, feature requests, or spotted a bug? Reach out to the Infinity Kit team directly!
        </p>
      </header>

      {/* Glass Panel */}
      <div className="glass-panel" style={{
        padding: '50px 40px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.04)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px'
      }}>
        
        <p style={{ fontSize: '1.15rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, maxWidth: '600px' }}>
          We love hearing from our users. Whether you want to suggest a new calculator, suggest a text utility, report a calculation mismatch, or ask about our privacy configurations, we are all ears.
        </p>

        {/* Email Support Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 161, 155, 0.04) 0%, rgba(0, 161, 155, 0.1) 100%)',
          border: '1px solid rgba(0, 161, 155, 0.2)',
          borderRadius: '20px',
          padding: '30px',
          width: '100%',
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px',
          margin: '10px 0'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'var(--primary-color)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 20px rgba(0, 161, 155, 0.25)'
          }}>
            <Mail size={22} />
          </div>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Direct Support</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Expect a personal response within 24-48 hours.
          </p>
          <a href="mailto:infinitykit24@gmail.com" style={{
            display: 'inline-block',
            background: 'var(--primary-color)',
            color: 'white',
            padding: '12px 28px',
            borderRadius: '30px',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '1rem',
            transition: 'all 0.2s',
            boxShadow: '0 6px 15px rgba(0, 161, 155, 0.2)'
          }} className="action-btn">
            infinitykit24@gmail.com
          </a>
        </div>

        {/* Info Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 193, 7, 0.05)', border: '1px solid rgba(255, 193, 7, 0.15)', padding: '12px 20px', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-color)', maxWidth: '500px' }}>
          <AlertCircle size={16} style={{ color: '#ffb300', flexShrink: 0 }} />
          <span style={{ textAlign: 'left', opacity: 0.9 }}>
            Please write the tool ID or name in your email header to help us route your request to the right developer instantly! ⚡
          </span>
        </div>

        {/* Social bento cards */}
        <div style={{ marginTop: '20px', width: '100%' }}>
          <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Follow our progress
          </h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            
            <a href="https://www.instagram.com/infinitykit.online" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div className="social-tile" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '12px 24px', borderRadius: '30px', color: 'var(--text-color)', fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.2s' }}>
                <Instagram size={18} color="#E1306C" /> Instagram
              </div>
            </a>

            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div className="social-tile" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '12px 24px', borderRadius: '30px', color: 'var(--text-color)', fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.2s' }}>
                <Linkedin size={18} color="#0077B5" /> LinkedIn
              </div>
            </a>

            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div className="social-tile" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '12px 24px', borderRadius: '30px', color: 'var(--text-color)', fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.2s' }}>
                <Github size={18} /> GitHub
              </div>
            </a>

          </div>
        </div>

      </div>

      <style jsx>{`
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 161, 155, 0.3) !important;
        }
        .social-tile:hover {
          border-color: var(--primary-color) !important;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 161, 155, 0.05) !important;
        }
      `}</style>

    </div>
  );
}
