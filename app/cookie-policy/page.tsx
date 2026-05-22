'use client';

import React from 'react';
import { Info, HelpCircle, Shield, CheckCircle } from 'lucide-react';

export default function CookiePolicyPage() {
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
          Cookie Policy
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Last Updated: May 13, 2026
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
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            This Cookie Policy explains exactly how Infinity Kit ("we", "us", or "our") deploys cookies and related browser storage tokens to recognize users during site navigation. It explains what these technologies are, why we use them, and your complete rights to limit or opt out of them.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Info size={22} /> What are Cookies?
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            Cookies are light metadata packets placed on your computer or mobile client by web browser engines when visiting domains. Cookies are widely implemented to coordinate UI preferences, remember settings, and aggregate general usage stats.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={22} /> Why We Use Cookies
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            We implement both first-party keys and third-party scripts to optimize your user experience:
          </p>
          <ul style={{ margin: '5px 0 10px 20px', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-color)', opacity: 0.95 }}>
              <strong>Essential Storage:</strong> These are required to save theme preferences, language units, or keep your auth status synchronized. If you reject them, core settings (like dark mode state) will reset on refresh.
            </li>
            <li style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-color)', opacity: 0.95 }}>
              <strong>Analytics Tokens:</strong> These track anonymous user routes to help our developers identify high-demand tools and improve platform layout scaling.
            </li>
            <li style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-color)', opacity: 0.95 }}>
              <strong>Marketing & AdSense Cookies:</strong> These help partners serve relevant, non-intrusive promotional tiles and prevent identical ads from repeating constantly.
            </li>
          </ul>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={22} /> Controlling Cookies
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            You maintain absolute rights to choose whether to accept or decline cookies. Most modern web browsers allow you to manage cookie parameters dynamically inside the Settings or Privacy controls. Disabling cookies will not block your access to Infinity Kit, though minor UI customizations might reset between sessions.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={22} /> Further Information
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-color)', margin: 0, opacity: 0.95 }}>
            For additional questions regarding our cookie structures or tracking systems, please feel free to send a note to our team through our official <a href="/contact" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>Contact Page</a>.
          </p>
        </section>

      </div>

    </div>
  );
}
