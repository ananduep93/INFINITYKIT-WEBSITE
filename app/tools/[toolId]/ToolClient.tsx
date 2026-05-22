'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Star, AlertTriangle, RefreshCw, HelpCircle, Check, ArrowRight, ShieldCheck, Cpu, KeyRound } from 'lucide-react';
import { getToolById, getCategoryById, ToolDefinition, tools } from '../../../config/tools';
import { toolsRegistry } from '../../../components/tools';
import { useSync } from '../../../hooks/useSync';
import ReusableResult from '../../../components/ui/ReusableResult';
import ToolSkeleton from '../../../components/ui/ToolSkeleton';

interface ToolClientProps {
  toolId: string;
}

export default function ToolClient({ toolId }: ToolClientProps) {
  const { favorites, toggleFavorite, addRecent } = useSync();

  const tool = useMemo(() => {
    return getToolById(toolId);
  }, [toolId]);

  const category = useMemo(() => {
    return tool ? getCategoryById(tool.category) : undefined;
  }, [tool]);

  // Dynamic Related Tools (Internal Linking System)
  const relatedTools = useMemo(() => {
    if (!tool) return [];
    return tools
      .filter((t) => t.category === tool.category && t.id !== tool.id)
      .slice(0, 4);
  }, [tool]);

  // Form inputs state
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize form default values
  useEffect(() => {
    if (tool && tool.inputs) {
      const defaults: Record<string, any> = {};
      tool.inputs.forEach((input) => {
        defaults[input.id] = input.defaultValue !== undefined ? input.defaultValue : '';
      });
      setFormValues(defaults);
      setCalculationResult(null);
      setIsCalculating(false);
    }
  }, [tool]);

  // Add tool to recents list on mount
  useEffect(() => {
    if (tool) {
      addRecent(tool.id, tool.name);
    }
  }, [tool, addRecent]);

  if (!tool) {
    notFound();
  }

  const handleInputChange = (id: string, val: any) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: val
    }));
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (tool.calculate) {
      setIsCalculating(true);
      setCalculationResult(null);
      
      setTimeout(() => {
        const res = tool.calculate!(formValues);
        setCalculationResult(res);
        setIsCalculating(false);

        // Increment total conversions stat locally
        if (typeof window !== 'undefined') {
          const current = Number(localStorage.getItem('totalConversions') || '1284');
          localStorage.setItem('totalConversions', String(current + 1));
        }
      }, 500); // 500ms beautiful premium calculated loading time
    }
  };

  const isFavorite = favorites.includes(tool.id);

  // Custom component mapping
  const CustomComponent = tool.type === 'custom'
    ? (tool.componentName ? (toolsRegistry[tool.componentName] || toolsRegistry[tool.id]) : toolsRegistry.LegacyToolBridge) || toolsRegistry.LegacyToolBridge
    : null;

  // Breadcrumb List Schema
  const breadcrumbSchema = useMemo(() => {
    if (!category) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://infinitykit.online'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': category.name,
          'item': `https://infinitykit.online/categories/${category.id}`
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': tool.name,
          'item': `https://infinitykit.online/tools/${tool.id}`
        }
      ]
    };
  }, [tool, category]);

  // Software Application Schema
  const softwareSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': tool.name,
      'operatingSystem': 'All',
      'applicationCategory': category ? category.name : 'Utility',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'description': tool.seoDescription || tool.description
    };
  }, [tool, category]);

  // FAQ Schema
  const faqSchema = useMemo(() => {
    if (!tool.faq || tool.faq.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': tool.faq.map((item) => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer
        }
      }))
    };
  }, [tool]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 60px' }}>
      {/* Inject Page-Specific JSON-LD Schemas */}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Semantic Breadcrumbs navigation */}
      <nav 
        aria-label="Breadcrumb"
        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}
      >
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={12} />
        {category && (
          <>
            <Link href={`/categories/${category.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {category.name}
            </Link>
            <ChevronRight size={12} />
          </>
        )}
        <span style={{ color: 'var(--text-color)', fontWeight: 500 }} aria-current="page">{tool.name}</span>
      </nav>

      {/* Structured Tool Header Layout using semantic tags */}
      <header className="glass-panel" style={{ margin: '0 0 35px 0', padding: '25px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2.5rem', background: 'rgba(0,161,155,0.06)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {tool.icon}
          </span>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, color: 'var(--text-color)', margin: 0 }}>
              {tool.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px', lineHeight: 1.4, margin: '4px 0 0 0' }}>
              {tool.description}
            </p>
          </div>
        </div>

        {/* Favorite star trigger */}
        <button
          onClick={() => toggleFavorite(tool.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: isFavorite ? 'var(--primary-color)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,161,155,0.04)',
            transition: 'var(--transition-smooth)'
          }}
          title={isFavorite ? 'Remove from bookmarks' : 'Add to bookmarks'}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star size={20} fill={isFavorite ? 'var(--primary-color)' : 'none'} />
        </button>
      </header>

      {/* Main workspace section */}
      <section aria-label="Tool Workspace" style={{ marginBottom: '40px' }}>
        {tool.type === 'custom' && CustomComponent ? (
          <Suspense fallback={<ToolSkeleton />}>
            <CustomComponent 
              toolId={tool.id}
              defaultView={
                tool.id === 'expenseadd' ? 'add' : 
                tool.id === 'expenselist' ? 'list' : 
                tool.id === 'budgettracker' ? 'budget' : 
                tool.id === 'expenseanalytics' ? 'analytics' : 'add'
              } 
            />
          </Suspense>
        ) : tool.type === 'simple' && tool.inputs ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '35px', alignItems: 'flex-start' }}>
            
            {/* Form calculations inputs panel */}
            <form onSubmit={handleCalculate} className="glass-panel" style={{ margin: 0, padding: '30px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
                <RefreshCw size={18} color="var(--primary-color)" /> Parameter Fields
              </h2>

              {tool.inputs.map((input) => (
                <div key={input.id} className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-color)' }}>
                    {input.label}
                  </label>
                  
                  {input.type === 'select' && input.options ? (
                    <select
                      value={formValues[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="form-select"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-color)',
                        outline: 'none'
                      }}
                    >
                      {input.options.map((opt) => (
                        <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : input.type === 'textarea' ? (
                    <textarea
                      placeholder={input.placeholder}
                      value={formValues[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="form-textarea"
                      rows={4}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-color)',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  ) : input.type === 'range' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <input
                        type="range"
                        min={input.min || 0}
                        max={input.max || 100}
                        step={input.step || 1}
                        value={formValues[input.id] || input.min || 0}
                        onChange={(e) => handleInputChange(input.id, Number(e.target.value))}
                        style={{ flex: 1, accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                      />
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', minWidth: '30px', textAlign: 'right', color: 'var(--text-color)' }}>
                        {formValues[input.id]}
                      </span>
                    </div>
                  ) : (
                    <input
                      type={input.type}
                      placeholder={input.placeholder}
                      value={formValues[input.id] !== undefined ? formValues[input.id] : ''}
                      onChange={(e) => handleInputChange(input.id, input.type === 'number' ? Number(e.target.value) : e.target.value)}
                      className="form-input"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-color)',
                        outline: 'none'
                      }}
                    />
                  )}
                </div>
              ))}

              <button 
                type="submit" 
                className="btn" 
                style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <RefreshCw size={16} style={{ animation: 'spin-calc 1s linear infinite' }} />
                    Computing...
                  </>
                ) : (
                  'Calculate Results'
                )}
                <style jsx>{`
                  @keyframes spin-calc {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </button>
            </form>

            {/* Results display panel */}
            <div>
              {isCalculating ? (
                <div className="glass-panel" style={{ margin: 0, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid var(--glass-border)',
                      borderTopColor: 'var(--primary-color)',
                      borderRadius: '50%',
                      animation: 'loading-spin 0.8s linear infinite',
                      marginBottom: '16px'
                    }}
                  />
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-color)', margin: 0 }}>Computing Parameters...</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '6px', lineHeight: 1.4 }}>
                    Running lightning-fast in-browser secure compilation algorithms.
                  </p>
                  <style jsx>{`
                    @keyframes loading-spin {
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : calculationResult ? (
                <ReusableResult
                  value={calculationResult.mainValue}
                  subValue={calculationResult.subValue}
                  color={calculationResult.color}
                  copyable={calculationResult.copyable}
                  label={`${tool.name} Result`}
                />
              ) : (
                <div className="glass-panel" style={{ margin: 0, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', borderStyle: 'dashed' }}>
                  <AlertTriangle size={32} style={{ color: 'var(--primary-color)', marginBottom: '12px', opacity: 0.7 }} />
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-color)', margin: 0 }}>Awaiting Parameters</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '6px', lineHeight: 1.4, margin: '6px 0 0 0' }}>
                    Input valid figures into the parameter fields and trigger calculations to compile results instantly.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 30px' }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Failed to initialize tool. Configuration error.</p>
          </div>
        )}
      </section>

      {/* Semantic instructions and features section (Long-form SEO content) */}
      <section className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }} aria-label="Usage Guide & Core Security">
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 800, marginTop: 0, marginBottom: '20px', color: 'var(--text-color)' }}>
          Detailed Guide: How to Use {tool.name}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px' }}>
              <Cpu size={18} /> Step-by-Step Instructions
            </h3>
            <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li style={{ marginBottom: '8px' }}>Locate the <strong>Parameter Fields</strong> form panel on the tool dashboard workspace.</li>
              <li style={{ marginBottom: '8px' }}>Fill in all the required input fields with your specific measurements or credentials.</li>
              <li style={{ marginBottom: '8px' }}>Click the <strong>Calculate Results</strong> button to trigger the browser calculations.</li>
              <li style={{ marginBottom: '8px' }}>View your instant results inside the right-hand panel, where you can easily copy findings with one click.</li>
            </ol>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px' }}>
              <ShieldCheck size={18} /> Absolute Client-Side Security
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Unlike ordinary web utilities that process calculations in the cloud, InfinityKit is built entirely on serverless, client-side React architecture. Your raw input numbers, text blocks, and calculations never leave your computer. This gives you 100% data safety, complete browser privacy, and zero server tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Performance Markers */}
      <section className="tool-info-section" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }} aria-label="Trust Markers">
        <div className="info-card" style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
          <div className="card-icon" style={{ fontSize: '1.8rem', marginBottom: '10px' }}>🔒</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-color)' }}>100% Secure Client-Side Privacy</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Your values and parameters are processed completely client-side in your local browser workspace. We never upload your personal entries to external cloud databases.
          </p>
        </div>

        <div className="info-card" style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
          <div className="card-icon" style={{ fontSize: '1.8rem', marginBottom: '10px' }}>⚡</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-color)' }}>Instant Fluid Computations</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Calculated in microseconds using high-performance lightweight algorithms. Bookmark this service for lightning-fast offline-supported utilities.
          </p>
        </div>
      </section>

      {/* FAQ Accordion Template */}
      {tool.faq && tool.faq.length > 0 && (
        <section style={{ marginTop: '50px' }} aria-label="FAQ">
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.6rem', fontWeight: 800, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-color)' }}>
            <HelpCircle size={22} color="var(--primary-color)" /> Frequently Asked Questions
          </h2>

          <div className="faq-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {tool.faq.map((item, index) => (
              <div
                key={index}
                className={`faq-item ${activeFaq === index ? 'active' : ''}`}
                style={{ 
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease' 
                }}
              >
                <button
                  className="faq-question"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: 'var(--text-color)'
                  }}
                  aria-expanded={activeFaq === index}
                >
                  <span>{item.question}</span>
                  <span style={{ 
                    transform: activeFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    fontSize: '0.8rem',
                    color: 'var(--primary-color)'
                  }}>▼</span>
                </button>
                <div
                  className="faq-answer"
                  style={{
                    maxHeight: activeFaq === index ? '200px' : '0px',
                    padding: activeFaq === index ? '0 24px 20px' : '0 24px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6
                  }}
                >
                  {item.answer}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Related Tools Tray (Internal Linking System) */}
      {relatedTools.length > 0 && (
        <section style={{ marginTop: '60px', borderTop: '1px solid var(--glass-border)', paddingTop: '40px' }} aria-label="Related Utilities">
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', color: 'var(--text-color)' }}>
            Other Popular Utilities in {category?.name || 'this Category'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {relatedTools.map((t) => (
              <Link 
                href={`/tools/${t.id}`} 
                key={t.id}
                style={{ textDecoration: 'none' }}
              >
                <div 
                  className="glass-panel" 
                  style={{ 
                    margin: 0, 
                    padding: '20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px',
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.25s ease, border-color 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'rgba(0,161,155,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>{t.icon}</span>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-color)' }}>
                    {t.name}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {t.description.length > 60 ? `${t.description.slice(0, 60)}...` : t.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
