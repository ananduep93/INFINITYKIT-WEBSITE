'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ChevronRight, 
  Star, 
  AlertTriangle, 
  RefreshCw, 
  HelpCircle, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  KeyRound, 
  Lightbulb, 
  History, 
  Zap, 
  Sparkles,
  Play,
  RotateCcw
} from 'lucide-react';
import { getToolById, getCategoryById, tools, mapCategoryToPath } from '../../../config/tools';
import { toolsRegistry } from '../../../components/tools';
import { useSync } from '../../../hooks/useSync';
import ReusableResult from '../../../components/ui/ReusableResult';
import ToolSkeleton from '../../../components/ui/ToolSkeleton';

interface ToolClientProps {
  toolId: string;
}

export default function ToolClient({ toolId }: ToolClientProps) {
  const { favorites, recentTools, toggleFavorite, addRecent } = useSync();

  const tool = useMemo(() => {
    return getToolById(toolId);
  }, [toolId]);

  const category = useMemo(() => {
    return tool ? getCategoryById(tool.category) : undefined;
  }, [tool]);

  // Dynamic Related Tools (Internal Linking)
  const relatedTools = useMemo(() => {
    if (!tool) return [];
    return tools
      .filter((t) => t.category === tool.category && t.id !== tool.id)
      .slice(0, 3);
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
      }, 500);
    }
  };

  const isFavorite = favorites.includes(tool.id);

  // Custom component mapping
  const CustomComponent = tool.type === 'custom'
    ? (tool.componentName ? (toolsRegistry[tool.componentName] || toolsRegistry[tool.id]) : toolsRegistry.LegacyToolBridge) || toolsRegistry.LegacyToolBridge
    : null;

  // AI Suggestions mapping
  const aiSuggestions = useMemo(() => {
    switch (tool.id) {
      case 'bmicalculator':
        return [
          "Incorporate a daily calorie calculation schedule to match your weight adjustments.",
          "Use the Savings Planner to outline fitness budgets and nutritious meal preparation."
        ];
      case 'todolist':
        return [
          "Sync tasks list to Firestore cloud databases under settings for reliable data backups.",
          "Coordinate study targets by launching the Pomodoro Study Focus Timer."
        ];
      case 'notes':
        return [
          "Encrypt highly sensitive outlines locally using our secure Quick Notes vault.",
          "Utilize Note Shredder to write temporary self-destructing text blocks securely."
        ];
      case 'chatbot':
        return [
          "Input: 'Draft a clean glassmorphism card component using HSL colors.'",
          "Try: 'Explain the benefits of decentralized local-first in-browser computations.'"
        ];
      case 'equationsolver':
        return [
          "Vary decimal parameter coefficients dynamically to visualize parabola vertex shifts.",
          "Export parabola canvas plots as high-resolution PDF blueprints."
        ];
      case 'passwordstrength':
        return [
          "Build credentials of 16+ symbols, avoiding recognizable dictionary words.",
          "Test your generated password against databases using HaveIBeenPwned Scanner."
        ];
      case 'text-improver':
      case 'ai-humanizer':
      case 'grammar-fixer':
        return [
          "Connect your Google Gemini API Key in Settings to unlock live generative AI models.",
          "Paraphrase sections using the AI Content Paraphraser/Rewriter for organic flow."
        ];
      default:
        return [
          "Bookmark this utility to access it instantly from your Homepage Dashboard.",
          "Sync local settings and operations history to secure cloud database platforms."
        ];
    }
  }, [tool.id]);

  // Recents listing (Top 3 recently used excluding current tool)
  const recentList = useMemo(() => {
    return recentTools
      .filter((t) => t.id !== tool.id)
      .slice(0, 3);
  }, [recentTools, tool.id]);

  return (
    <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '10px 0 60px' }}>
      
      {/* Semantic Breadcrumbs navigation */}
      <nav 
        aria-label="Breadcrumb"
        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px' }}
      >
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={12} />
        {category && (
          <>
            <Link href={`/${mapCategoryToPath(category.id)}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {category.name}
            </Link>
            <ChevronRight size={12} />
          </>
        )}
        <span style={{ color: 'var(--text-color)', fontWeight: 500 }} aria-current="page">{tool.name}</span>
      </nav>

      {/* Dynamic Workspace Header Ribbon */}
      <header className="glass-panel" style={{ margin: '0 0 30px 0', padding: '24px 30px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2.2rem', background: 'rgba(0,161,155,0.06)', width: '54px', height: '54px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {tool.icon}
          </span>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-color)', margin: 0 }}>
              {tool.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', margin: '4px 0 0 0' }}>
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
            padding: '10px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,161,155,0.04)',
            transition: 'var(--transition-smooth)'
          }}
          title={isFavorite ? 'Remove from bookmarks' : 'Add to bookmarks'}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star size={18} fill={isFavorite ? 'var(--primary-color)' : 'none'} />
        </button>
      </header>

      {/* ====================================================
          PREMIUM RESPONSIVE WORKSPACE CONTAINER
          ==================================================== */}
      {tool.type === 'custom' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
          {/* Full-width custom app container */}
          <div style={{ width: '100%', minWidth: 0 }}>
            {CustomComponent && (
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
            )}
          </div>
          
          {/* Metadata & Ecosystem Panels Grid underneath the app */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', width: '100%' }}>
            {/* AI Suggestions Box */}
            <div className="glass-panel" style={{ margin: 0, padding: '24px', background: 'rgba(0, 161, 155, 0.03)', border: '1px solid rgba(0, 161, 155, 0.15)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-color)', margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--primary-color)" /> AI Suggestions
              </h3>
              <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {aiSuggestions.map((sug, idx) => (
                  <li key={idx} style={{ position: 'relative' }}>{sug}</li>
                ))}
              </ul>
            </div>

            {/* Related Tools Box */}
            {relatedTools.length > 0 && (
              <div className="glass-panel" style={{ margin: 0, padding: '24px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-color)', margin: '0 0 15px' }}>
                  Related Utilities
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {relatedTools.map((t) => (
                    <Link 
                      href={`/${mapCategoryToPath(t.category)}/${t.id}`} 
                      key={t.id}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div 
                        style={{ 
                          padding: '12px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.01)', transition: 'all 0.25s ease-in-out'
                        }}
                        className="related-item-row"
                      >
                        <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</h4>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Secure Sandbox Badge */}
            <div className="glass-panel" style={{ margin: 0, padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="var(--success-color)" /> Browser Sandboxed
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                Calculations occur locally within client browser sandbox nodes. No details or credentials ever leave your physical device.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="workspace-three-column-grid" style={{ display: 'grid', gap: '24px', alignItems: 'flex-start', gridTemplateColumns: '320px 1fr 300px' }}>
          {/* ==================== LEFT COLUMN: Parameters / Uploads ==================== */}
          <div className="workspace-column-left" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {tool.inputs && (
              <form onSubmit={handleCalculate} className="glass-panel" style={{ margin: 0, padding: '24px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
                  <Cpu size={16} color="var(--primary-color)" /> Parameter Settings
                </h3>

                {tool.inputs.map((input) => (
                  <div key={input.id} className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '6px', color: 'var(--text-color)' }}>
                      {input.label}
                    </label>
                    
                    {input.type === 'select' && input.options ? (
                      <select
                        value={formValues[input.id] || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        className="form-select"
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-color)', outline: 'none'
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
                          width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-color)', outline: 'none', resize: 'vertical'
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
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', minWidth: '30px', textAlign: 'right', color: 'var(--text-color)' }}>
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
                          width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-color)', outline: 'none'
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
                      <RefreshCw size={14} style={{ animation: 'spin-calc-sec 1s linear infinite' }} />
                      Computing...
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="white" />
                      Calculate Results
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Secure Sandbox Badge */}
            <div className="glass-panel" style={{ margin: 0, padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="var(--success-color)" /> Browser Sandboxed
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                Calculations occur locally within client browser sandbox nodes. No details or credentials ever leave your physical device.
              </p>
            </div>
          </div>

          {/* ==================== CENTER COLUMN: Workspace / Results ==================== */}
          <div className="workspace-column-center" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {tool.inputs ? (
              <div>
                {isCalculating ? (
                  <div className="glass-panel" style={{ margin: 0, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        border: '3px solid var(--glass-border)',
                        borderTopColor: 'var(--primary-color)',
                        borderRadius: '50%',
                        animation: 'loading-spin-sec 0.8s linear infinite',
                        marginBottom: '16px'
                      }}
                    />
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-color)', margin: 0 }}>Computing Parameters...</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '6px', lineHeight: 1.4 }}>
                      Running lightning-fast in-browser secure compilation algorithms.
                    </p>
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
                  <div className="glass-panel" style={{ margin: 0, padding: '50px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', borderStyle: 'dashed', borderColor: 'rgba(0,161,155,0.2)' }}>
                    <AlertTriangle size={28} style={{ color: 'var(--primary-color)', marginBottom: '12px', opacity: 0.7 }} />
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-color)', margin: 0 }}>Awaiting Parameters</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '6px', lineHeight: 1.4 }}>
                      Input valid figures into the parameter fields and trigger calculations to compile results instantly.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 30px' }}>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Failed to initialize tool. Configuration error.</p>
              </div>
            )}

            {/* Usage Guide Accordion FAQs */}
            {tool.faq && tool.faq.length > 0 && (
              <div className="glass-panel" style={{ margin: 0, padding: '24px' }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.05rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-color)', marginTop: 0 }}>
                  <HelpCircle size={18} color="var(--primary-color)" /> Frequently Asked Questions
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tool.faq.map((item, index) => (
                    <div
                      key={index}
                      style={{ 
                        borderRadius: '10px',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(0,0,0,0.01)',
                        overflow: 'hidden'
                      }}
                    >
                      <button
                        onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                        style={{
                          width: '100%', padding: '14px 20px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-color)'
                        }}
                        aria-expanded={activeFaq === index}
                      >
                        <span>{item.question}</span>
                        <span style={{ 
                          transform: activeFaq === index ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', fontSize: '0.75rem', color: 'var(--primary-color)'
                        }}>▼</span>
                      </button>
                      <div
                        style={{
                          maxHeight: activeFaq === index ? '200px' : '0px',
                          padding: activeFaq === index ? '0 20px 14px' : '0 20px',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          overflow: 'hidden',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5
                        }}
                      >
                        {item.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ==================== RIGHT COLUMN: Ecosystem Intelligence ==================== */}
          <div className="workspace-column-right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* AI Suggestions Box */}
            <div className="glass-panel" style={{ margin: 0, padding: '24px', background: 'rgba(0, 161, 155, 0.03)', border: '1px solid rgba(0, 161, 155, 0.15)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-color)', margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--primary-color)" /> AI Suggestions
              </h3>
              <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {aiSuggestions.map((sug, idx) => (
                  <li key={idx} style={{ position: 'relative' }}>{sug}</li>
                ))}
              </ul>
            </div>

            {/* Related Tools Box */}
            {relatedTools.length > 0 && (
              <div className="glass-panel" style={{ margin: 0, padding: '24px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-color)', margin: '0 0 15px' }}>
                  Related Utilities
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {relatedTools.map((t) => (
                    <Link 
                      href={`/${mapCategoryToPath(t.category)}/${t.id}`} 
                      key={t.id}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div 
                        style={{ 
                          padding: '12px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.01)', transition: 'all 0.25s ease-in-out'
                        }}
                        className="related-item-row"
                      >
                        <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</h4>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recents list */}
            {recentList.length > 0 && (
              <div className="glass-panel" style={{ margin: 0, padding: '24px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-color)', margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={15} color="var(--primary-color)" /> Recently Visited
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentList.map((t) => (
                    <Link 
                      href={`/tools`} 
                      key={t.id}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--primary-color)' }}>➔</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>{t.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* HTML standard style blocks avoiding SWC compiler styled-jsx plugin conflicts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1140px) {
          .workspace-three-column-grid {
            grid-template-columns: 1fr 300px !important;
          }
          .workspace-column-left {
            grid-column: span 2;
          }
        }

        @media (max-width: 768px) {
          .workspace-three-column-grid {
            grid-template-columns: 1fr !important;
          }
          .workspace-column-left,
          .workspace-column-right {
            grid-column: span 1 !important;
          }
        }

        @keyframes spin-calc-sec {
          to { transform: rotate(360deg); }
        }

        @keyframes loading-spin-sec {
          to { transform: rotate(360deg); }
        }

        .related-item-row:hover {
          border-color: rgba(0, 161, 155, 0.3) !important;
          transform: translateY(-1px) !important;
        }
      `}} />
    </div>
  );
}
