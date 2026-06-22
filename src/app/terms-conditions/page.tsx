'use client';

import React from 'react';
import { Scale, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export default function TermsConditionsPage() {
  return (
    <div style={{ maxWidth: '850px', margin: '80px auto 40px', padding: '40px 20px' }}>
      
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '2.5rem',
          fontWeight: 800,
          color: 'var(--text-color)',
          marginBottom: '10px'
        }}>
          Terms & Conditions
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Last Updated: May 8, 2026
        </p>
      </header>

      {/* Main Glass Panel */}
      <div className="glass-panel" style={{
        padding: '45px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '35px'
      }}>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Scale size={22} /> 1. Acceptance of Terms
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            By entering, browsing, or executing scripts inside Infinity Kit, you declare that you have read, understood, and agreed to be fully bound by these Terms & Conditions. If you disagree with any segment of these clauses, please immediately exit the site and terminate your interactions with our web utilities.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={22} /> 2. Fair Usage Policy
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            Infinity Kit provides its widgets, trackers, calculations, and AI features to help users manage tasks responsibly. You agree to use these features solely for legal, ethical, and personal purposes. You agree not to attempt to inject scrapers, deploy DDoS attacks, bypass rate-limiters, or disrupt client scripts on our domain.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={22} /> 3. Calculation & Output Guarantees
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            All calculations, translations, financial charts, and conversions provided on this site are presented "as-is". While our engineering team works diligently to maintain 100% correct configurations, Infinity Kit makes no warranties regarding the absolute correctness of results. 
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            Critical actions involving healthcare coordinates, structural formulas, or investments should always be verified independently by licensed professionals.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={22} /> 4. Intellectual Assets
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            The brand names, bento styles, layouts, visual configurations, logos, icons, and software registry code are protected by global intellectual property regulations and belong exclusively to Infinity Kit and its creators. You may not republish, distribute, mirror, or repackage our assets for commercial gains without explicit written consent from the team.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            ⚖️ 5. Limitation of Liability
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            In no event shall Infinity Kit or its developers be held liable for any direct, indirect, incidental, punitive, or consequential damages resulting from browser crashes, file losses, sync mismatches, or mathematical inaccuracies encountered while using our platform.
          </p>
        </section>

      </div>

    </div>
  );
}
