'use client';

import React from 'react';
import { ShieldAlert, Eye, Lock, Globe, HardDrive } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          Privacy Policy
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
            <Eye size={22} /> Our Commitment to Privacy
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            Your privacy is our number one priority. Infinity Kit is engineered to be a secure, transparent, and completely user-friendly utility platform. This Privacy Policy details precisely how we handle and protect information when you navigate our site and execute our tools.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={22} /> Sandbox Browser-Side Data Processing
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            Infinity Kit is architected with a strict <strong>Privacy-First</strong> philosophy. The vast majority of our digital converters, math calculators, and document widgets process inputs entirely in your local browser sandbox. 
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            This means that your calculations, sensitive file strings, notes, and metrics happen inside your browser client memory and are never uploaded to our remote database servers. For instance, the Expense Tracker and Todo List widgets use local storage keys to synchronize lists directly in your browser. We do not have access to your personal or financial data unless you explicitly log in and authorize cloud sync.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={22} /> Google AdSense & Cookies
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            We serve non-intrusive Google AdSense streams to sustain our free platform. Google, as a third-party partner, implements cookie tracking to coordinate advertisement listings based on standard user browser interest clusters.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            You maintain full rights to opt out of personalized advertisements by configuring your parameters directly at the <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>Google Ads Settings</a> page, or by disabling cookie options in your web browser preferences.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HardDrive size={22} /> Automated Log Diagnostics
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            Similar to standard production websites, Infinity Kit records non-identifiable client requests inside system log files. This aggregate metadata includes internet protocol (IP) structures, browser layout engines, system operating versions, referencing links, and navigation clickstreams. We utilize this log data exclusively to track traffic densities, protect the platform against botnet intrusions, and diagnose platform performance issues.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={22} /> Contact Privacy Team
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            If you seek clarifications regarding our security compliance, local sandbox parameters, or data processing behaviors, feel free to email our privacy lead anytime at: <a href="mailto:infinitykit24@gmail.com" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 700 }}>infinitykit24@gmail.com</a>.
          </p>
        </section>

      </div>

    </div>
  );
}
