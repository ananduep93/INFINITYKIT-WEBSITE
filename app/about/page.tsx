'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Shield, Heart, Zap, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '80px auto 40px', padding: '40px 20px' }}>
      
      {/* Header Section */}
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 161, 155, 0.08)', color: 'var(--primary-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '15px' }}>
          <Sparkles size={14} /> Our Mission
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
          About Infinity Kit
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Simplifying your daily digital workflow by gathering secure, high-performance, and client-centric utilities in one beautifully designed workspace.
        </p>
      </header>

      {/* Main Glass Panel */}
      <div className="glass-panel" style={{
        padding: '50px 40px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        
        {/* Intro */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-color)', margin: 0 }}>
            Infinity Kit is an all-in-one platform built to eliminate unnecessary bookmarks, tools tabs, and sluggish extensions. Instead of bouncing between heavy, ad-ridden single-use pages, Infinity Kit serves up an immediate catalog of lightweight calculators, utility tools, productivity sheets, and AI agents.
          </p>
          <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-color)', margin: 0 }}>
            We believe that technology should serve to liberate time, not drain it. That’s why every tool we offer is optimized to load instantaneously, adapt cleanly to touch interfaces, and function with zero friction—no signups required, no speed limiters, and absolute privacy.
          </p>
        </section>

        {/* Bento Grid Features */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginTop: '10px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', padding: '25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(0, 161, 155, 0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
              <Compass size={20} />
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-color)', margin: 0 }}>Our Vision</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
              To establish a persistent, globally accessible utility shell that works offline, resolves calculations in nanoseconds, and dynamically expands based on user feedback.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', padding: '25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(0, 161, 155, 0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-color)', margin: 0 }}>100% Privacy</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
              We prioritize data integrity. Over 95% of our calculations execute in your browser client. Sensitive numbers, texts, or parameters never touch our cloud storage.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', padding: '25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(0, 161, 155, 0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
              <Heart size={20} />
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-color)', margin: 0 }}>Free Forever</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
              Infinity Kit is powered by non-intrusive, secure ad streams, meaning all premium widgets, tools, and calculators remain completely free for our global user base.
            </p>
          </div>
        </section>

        {/* Meets Creators */}
        <section style={{ marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '40px' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            👨‍💻 Meet the Creators
          </h3>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '30px' }}>
            Infinity Kit was conceptualized and coded by a team of passionate developers seeking to build beautiful and incredibly fast utility suites.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            
            <a href="https://www.instagram.com/infinitykit.online" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }} className="creator-card">
                <span style={{ fontSize: '2rem' }}>📸</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--text-color)', fontWeight: 700 }}>Infinity Kit</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Official Page</span>
                </div>
              </div>
            </a>

            <a href="https://www.instagram.com/_akku__zap_" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }} className="creator-card">
                <span style={{ fontSize: '2rem' }}>👨‍💻</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--text-color)', fontWeight: 700 }}>Aswanth EP</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Co-Creator</span>
                </div>
              </div>
            </a>

            <a href="https://www.instagram.com/anandu_ep" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }} className="creator-card">
                <span style={{ fontSize: '2rem' }}>👨‍💻</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--text-color)', fontWeight: 700 }}>Anandu EP</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Co-Creator</span>
                </div>
              </div>
            </a>

          </div>
        </section>

      </div>

      <style jsx>{`
        .creator-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary-color) !important;
          box-shadow: 0 10px 20px rgba(0, 161, 155, 0.08) !important;
        }
      `}</style>

    </div>
  );
}
