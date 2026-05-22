'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Download, Sparkles, Check, FileCode, Plus, Trash } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export default function SchemaGenerator() {
  const [schemaType, setSchemaType] = useState<'faq' | 'article' | 'localbusiness'>('faq');
  const [copied, setCopied] = useState(false);
  const [generatedSchema, setGeneratedSchema] = useState('');

  // Form states
  // FAQ fields
  const [faqs, setFaqs] = useState<FaqItem[]>([
    { q: 'What is InfinityKit?', a: 'InfinityKit is a premium Next.js local-first utility platform containing 80+ structural web tools.' },
    { q: 'Are my uploaded documents safe?', a: 'Yes! All file conversions, watermarks, and audio decodings happen completely client-side in your local browser sandbox.' }
  ]);

  // Article fields
  const [headline, setHeadline] = useState('Next.js App Router Native Architectures Explained');
  const [authorName, setAuthorName] = useState('Anand Dev');
  const [publisherName, setPublisherName] = useState('InfinityKit Media');
  const [imageUrl, setImageUrl] = useState('https://infinitykit.online/assets/hero.png');

  // Local Business fields
  const [businessName, setBusinessName] = useState('Web Infinity LLC');
  const [businessPhone, setBusinessPhone] = useState('+1-800-555-0199');
  const [businessStreet, setBusinessStreet] = useState('100 Silicon Boulevard');
  const [businessCity, setBusinessCity] = useState('San Francisco');
  const [businessZip, setBusinessZip] = useState('94107');

  // Trigger schema compilation updates whenever fields alter
  useEffect(() => {
    let schemaObj: any = {};

    if (schemaType === 'faq') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(item => ({
          '@type': 'Question',
          'name': item.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': item.a
          }
        }))
      };
    } else if (schemaType === 'article') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        'headline': headline,
        'image': [imageUrl],
        'datePublished': new Date().toISOString().substring(0, 10),
        'author': {
          '@type': 'Person',
          'name': authorName
        },
        'publisher': {
          '@type': 'Organization',
          'name': publisherName,
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://infinitykit.online/logo.png'
          }
        }
      };
    } else if (schemaType === 'localbusiness') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': businessName,
        'image': 'https://infinitykit.online/logo.png',
        'telephone': businessPhone,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': businessStreet,
          'addressLocality': businessCity,
          'postalCode': businessZip,
          'addressCountry': 'US'
        }
      };
    }

    const scriptBlock = `<\${'script'} type="application/ld+json">\n${JSON.stringify(schemaObj, null, 2)}\n</\${'script'}>`;
    setGeneratedSchema(scriptBlock);
  }, [schemaType, faqs, headline, authorName, publisherName, imageUrl, businessName, businessPhone, businessStreet, businessCity, businessZip]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedSchema], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schema_${schemaType}_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // FAQ Array modifiers
  const handleUpdateFaq = (idx: number, key: 'q' | 'a', val: string) => {
    setFaqs(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: val };
      return copy;
    });
  };

  const handleAddFaq = () => {
    setFaqs(prev => [...prev, { q: 'New question label', a: 'Answer description block.' }]);
  };

  const handleRemoveFaq = (idx: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        JSON-LD Schema Generator
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Generate structured microdata schemas to boost your SEO snippet rankings across major search engines.
      </p>

      {/* Structured Category Tab Selector */}
      <div className="glass-panel" style={{ marginBottom: '25px', padding: '15px' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>Select Schema Type</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={() => setSchemaType('faq')}
            className={`btn ${schemaType === 'faq' ? '' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '8px 16px', border: 'none' }}
          >
            ❓ FAQ Schema page
          </button>
          <button
            onClick={() => setSchemaType('article')}
            className={`btn ${schemaType === 'article' ? '' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '8px 16px', border: 'none' }}
          >
            📰 News/Blog Article
          </button>
          <button
            onClick={() => setSchemaType('localbusiness')}
            className={`btn ${schemaType === 'localbusiness' ? '' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '8px 16px', border: 'none' }}
          >
            🏠 Local Business Info
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'stretch' }}>
        
        {/* Schema Fields Editor Column */}
        <div className="glass-panel" style={{ margin: 0, padding: '25px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>Schema Specifications</h3>

          {/* FAQ Inputs */}
          {schemaType === 'faq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  position: 'relative'
                }}>
                  <button
                    onClick={() => handleRemoveFaq(idx)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#dc3545'
                    }}
                    title="Remove question block"
                  >
                    <Trash size={14} />
                  </button>

                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Question #{idx + 1}</label>
                    <input
                      type="text"
                      value={faq.q}
                      onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Answer</label>
                    <textarea
                      value={faq.a}
                      onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                      className="form-textarea"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              <button onClick={handleAddFaq} className="btn btn-secondary" style={{ fontSize: '0.8rem', width: '100%' }}>
                <Plus size={14} style={{ display: 'inline', marginRight: '4px' }} /> Add Question Entity
              </button>
            </div>
          )}

          {/* Article Inputs */}
          {schemaType === 'article' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Article Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Author Person Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Publisher Company</label>
                <input
                  type="text"
                  value={publisherName}
                  onChange={(e) => setPublisherName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Feature Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* Local Business Inputs */}
          {schemaType === 'localbusiness' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Vocal Helpline Phone</label>
                <input
                  type="tel"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Street Address</label>
                <input
                  type="text"
                  value={businessStreet}
                  onChange={(e) => setBusinessStreet(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>City Location</label>
                  <input
                    type="text"
                    value={businessCity}
                    onChange={(e) => setBusinessCity(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Zip/Postal Code</label>
                  <input
                    type="text"
                    value={businessZip}
                    onChange={(e) => setBusinessZip(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Schema Code Render Column */}
        <div className="glass-panel" style={{ margin: 0, padding: '25px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode size={18} color="var(--primary-color)" /> Generated JSON-LD
            </h3>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCopy}
                className="btn btn-secondary"
                style={{ padding: '6px', borderRadius: '8px' }}
                title="Copy Script Block"
              >
                {copied ? <Check size={14} color="#28a745" /> : <Copy size={14} />}
              </button>
              <button
                onClick={handleDownload}
                className="btn btn-secondary"
                style={{ padding: '6px', borderRadius: '8px' }}
                title="Download Script Tag"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={generatedSchema}
            className="form-textarea"
            style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              minHeight: '280px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--glass-border)'
            }}
          />

          <div style={{
            marginTop: '15px',
            padding: '12px 15px',
            background: 'rgba(0,161,155,0.04)',
            borderRadius: '10px',
            borderLeft: '4px solid var(--primary-color)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4
          }}>
            🚀 **Search Engine Optimized:** Embed this &lt;script&gt; block directly inside your web page's HTML &lt;head&gt; tags to establish visual rich result structures on Google Search.
          </div>
        </div>
      </div>
    </div>
  );
}
