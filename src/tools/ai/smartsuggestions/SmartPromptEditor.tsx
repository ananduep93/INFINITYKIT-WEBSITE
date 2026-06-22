'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  CheckSquare,
  Square,
  Copy,
  Check,
  ChevronRight,
  RefreshCw,
  Zap,
  Info,
  Maximize2,
  FileText
} from 'lucide-react';
import ReusableLoading from '../../../components/ui/ReusableLoading';

// Standard rough presets to let the user play with immediately
const PRESETS = {
  creative: {
    label: "Creative Writing",
    rough: "write a story about an old space explorer who finds a forgotten probe from earth.",
    category: "Creative Writing & Narrative Design"
  },
  coding: {
    label: "Coding & Scripting",
    rough: "write a react hook that handles dark mode preference and saves to local storage.",
    category: "Software Engineering & Technical Architecture"
  },
  seo: {
    label: "SEO Content",
    rough: "make a blog post about organic coffee beans and why they are better than regular ones.",
    category: "SEO Copywriting & Content Marketing"
  },
  business: {
    label: "Business Communication",
    rough: "draft an email explaining a project delay to the client because of API database issues.",
    category: "Corporate Communications & Stakeholder Relations"
  },
  marketing: {
    label: "Marketing Ads",
    rough: "create three Facebook ad headlines and hooks for a premium productivity SaaS.",
    category: "Direct Response Copywriting & Ad Strategy"
  },
  general: {
    label: "General Inquiry",
    rough: "explain quantum computing in simple terms so my teenage nephew can understand it.",
    category: "Educational Pedagogy & Technical Simplification"
  }
};

type PresetKey = 'creative' | 'coding' | 'seo' | 'business' | 'marketing' | 'general';

export default function SmartPromptEditor() {
  const [preset, setPreset] = useState<PresetKey>('general');
  const [roughPrompt, setRoughPrompt] = useState(PRESETS.general.rough);
  
  // Constraints checkboxes
  const [constraints, setConstraints] = useState({
    definePersona: true,
    addConstraints: true,
    includeFormat: true,
    fewShot: false
  });

  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedRough, setCopiedRough] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'compare' | 'diff'>('compare');

  const handleSelectPreset = (key: PresetKey) => {
    setPreset(key);
    setRoughPrompt(PRESETS[key].rough);
    setEnhancedPrompt('');
  };

  const toggleCheckbox = (key: keyof typeof constraints) => {
    setConstraints(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Dynamically synthesizes a highly realistic smart prompt for demo mode
  const getMockEnhancedPrompt = (catKey: PresetKey, rough: string) => {
    const catLabel = PRESETS[catKey].category;
    
    return `### SYSTEM ROLE & INSTRUCTION SET
You are a world-class authority in ${catLabel}, possessing over 15 years of industry-leading expertise in crafting optimal solutions, engaging content, and highly robust specifications.

### CORE TASK DESCRIPTION
Your directive is to execute the following core instruction with exceptional attention to detail:
"${rough || 'Generate optimized assets based on inputs'}"

### STRATEGIC CONSTRAINTS & ACCURACY RULES
${constraints.addConstraints ? `1. ELIMINATE REDUNDANCY: Do not use corporate fluff, repetitive intros, or generic buzzwords.
2. ABSOLUTE CLARITY: Maintain logical parameters. If a fact is unverified, state the variance rather than inventing values.
3. CONTEXT INTEGRITY: Ensure the target audience level is perfectly calibrated. Avoid jargon unless technical context demands it.` : '1. Maintain absolute accuracy, logical consistency, and elite-grade standards throughout execution.'}

### REQUIRED OUTPUT STRUCTURE
${constraints.includeFormat ? `Ensure the response is formatted using clean, semantically correct Markdown structure:
- Use H2 (##) and H3 (###) headers for main sections.
- Bullet points must follow a parallel grammatical structure (start with action verbs).
- Enclose code snippets, formulas, or checklists in structured markdown code blocks or quotes.` : 'Deliver the response in a highly readable, professionally formatted outline.'}

### FEW-SHOT CONTEXT TEMPLATES
${constraints.fewShot ? `[Sample Scenario / Input]
"Request Details: Focus on rapid performance, ease of use, and premium styling."

[Target Ideal Output]
"Optimized output demonstrating proper structure, concise delivery, and exact adherence to constraints."
---` : 'Execute directly based on structural definitions provided. Maintain a direct, high-utility output flow.'}
`;
  };

  const handleEnhancePrompt = async () => {
    if (!roughPrompt.trim() || loading) return;

    setLoading(true);
    setEnhancedPrompt('');

    // Prepare optimized instructions payload for AI route
    const promptPayload = `
Enhance the following rough prompt into a highly detailed, professional-grade AI system prompt.
Category/Domain: ${PRESETS[preset].category}

Checkboxes Selected (Please integrate these elements dynamically into the prompt):
${constraints.definePersona ? '- DEFINE AN EXPERT PERSONA: Declare a specialized role, background, credentials, and conversational tone.' : ''}
${constraints.addConstraints ? '- ENFORCE STRICT CONSTRAINTS: Detail explicit rules on what the AI must NOT do, limitations, boundary checks, and accuracy rules.' : ''}
${constraints.includeFormat ? '- SPECIFY OUTPUT FORMATTING: Provide a markdown skeleton, headings, bullet-point specifications, or JSON structures if appropriate.' : ''}
${constraints.fewShot ? '- PROVIDE FEW-SHOT TEMPLATES: Include a sample mock input and structured ideal output placeholder.' : ''}

Original Rough Prompt to optimize:
"${roughPrompt}"

Please respond ONLY with the newly generated final prompt. Do not include conversational remarks, introduction, or wrap-up outside the prompt block itself.
`;

    try {
      const localOpenaiKey = localStorage.getItem('infinitykit_openai_key') || '';
      const localGeminiKey = localStorage.getItem('infinitykit_gemini_key') || '';

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptPayload,
          taskType: 'improve',
          context: roughPrompt,
          openaiKey: localOpenaiKey,
          geminiKey: localGeminiKey
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.demo) {
          // If in Demo Mode (no API key), synthesize a premium tailored mock prompt
          // instead of the dry default demo sentence.
          const tailoredMock = getMockEnhancedPrompt(preset, roughPrompt);
          setEnhancedPrompt(tailoredMock);
        } else {
          setEnhancedPrompt(data.text || 'Error polishing prompt.');
        }
      } else {
        setEnhancedPrompt(data.error || 'Server error occurred during prompt improvement.');
      }
    } catch (e) {
      setEnhancedPrompt('Failed to communicate with AI servers. Switched to offline enhancement engine.');
      setTimeout(() => {
        setEnhancedPrompt(getMockEnhancedPrompt(preset, roughPrompt));
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, isRough = false) => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(text);
    if (isRough) {
      setCopiedRough(true);
      setTimeout(() => setCopiedRough(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Split lines to calculate diff highlights
  const renderVisualDiff = () => {
    if (!enhancedPrompt) return null;

    const originalLines = roughPrompt.split('\n');
    const enhancedLines = enhancedPrompt.split('\n');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ padding: '12px 18px', background: 'rgba(220, 53, 69, 0.05)', borderLeft: '4px solid #dc3545', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#dc3545', textTransform: 'uppercase', marginBottom: '6px' }}>
            Removed / Rough Context Baseline (Before)
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            - {roughPrompt}
          </div>
        </div>

        <div style={{ padding: '12px 18px', background: 'rgba(40, 167, 69, 0.05)', borderLeft: '4px solid #28a745', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#28a745', textTransform: 'uppercase', marginBottom: '6px' }}>
            Added Structure & Prompt Enhancements (After)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {enhancedLines.map((line, i) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={i} style={{ height: '8px' }} />;
              
              // Highlight sections that AI added
              let isHighlighted = false;
              if (constraints.definePersona && trimmed.includes('SYSTEM ROLE')) isHighlighted = true;
              if (constraints.addConstraints && trimmed.includes('CONSTRAINTS')) isHighlighted = true;
              if (constraints.includeFormat && trimmed.includes('REQUIRED OUTPUT')) isHighlighted = true;
              if (constraints.fewShot && trimmed.includes('FEW-SHOT')) isHighlighted = true;

              return (
                <div
                  key={i}
                  style={{
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    padding: isHighlighted ? '2px 6px' : '0',
                    background: isHighlighted ? 'rgba(0, 161, 155, 0.15)' : 'transparent',
                    borderRadius: '4px',
                    color: isHighlighted ? 'var(--text-color)' : 'var(--text-secondary)'
                  }}
                >
                  + {line}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '10px 0', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Tool Header */}
      <div className="glass-panel" style={{ marginBottom: '25px', padding: '24px' }}>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-color)', marginBottom: '8px' }}>
          Smart AI Prompt Enhancer
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
          Expand short, simple ideas into hyper-performant AI directives. Choose a domain category, toggle structured constraints, define a targeted expert persona, and let the optimizer construct an elegant prompt template.
        </p>
      </div>

      {/* Preset Selector Bar */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '25px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginRight: '10px' }}>
          Quick Presets:
        </span>
        {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
          <button
            key={key}
            onClick={() => handleSelectPreset(key)}
            className="btn btn-secondary"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: preset === key ? 'rgba(0, 161, 155, 0.1)' : 'transparent',
              borderColor: preset === key ? 'var(--primary-color)' : 'var(--glass-border)',
              color: preset === key ? 'var(--primary-color)' : 'var(--text-color)'
            }}
          >
            {PRESETS[key].label}
          </button>
        ))}
      </div>

      {/* Main Dual-Pane layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }} className="responsive-split">
        
        {/* Left Pane: Rough input & Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--primary-color)" />
                <span>Rough Prompt (Before)</span>
              </div>
              <button
                onClick={() => handleCopy(roughPrompt, true)}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                title="Copy rough prompt"
              >
                {copiedRough ? <Check size={12} /> : <Copy size={12} />}
                <span style={{ marginLeft: '4px' }}>{copiedRough ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="form-group" style={{ flexGrow: 1, marginBottom: '20px' }}>
              <textarea
                value={roughPrompt}
                onChange={(e) => { setRoughPrompt(e.target.value); setEnhancedPrompt(''); }}
                placeholder="Type your brief, unoptimized idea here..."
                rows={8}
                className="form-textarea"
                style={{ height: '100%', minHeight: '180px', fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: '1.5', padding: '14px' }}
              />
            </div>

            {/* Smart Enhancements Checkbox Pane */}
            <div style={{ border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '16px', background: 'rgba(0,0,0,0.01)', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} /> Options & Constraints
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid-mobile">
                <div onClick={() => toggleCheckbox('definePersona')} style={checkboxRowStyle}>
                  {constraints.definePersona ? <CheckSquare size={16} color="#00A19B" /> : <Square size={16} color="var(--text-secondary)" />}
                  <span style={checkboxLabelStyle}>Expert Persona/Role</span>
                </div>

                <div onClick={() => toggleCheckbox('addConstraints')} style={checkboxRowStyle}>
                  {constraints.addConstraints ? <CheckSquare size={16} color="#00A19B" /> : <Square size={16} color="var(--text-secondary)" />}
                  <span style={checkboxLabelStyle}>Negative Constraints</span>
                </div>

                <div onClick={() => toggleCheckbox('includeFormat')} style={checkboxRowStyle}>
                  {constraints.includeFormat ? <CheckSquare size={16} color="#00A19B" /> : <Square size={16} color="var(--text-secondary)" />}
                  <span style={checkboxLabelStyle}>Formatting Spec</span>
                </div>

                <div onClick={() => toggleCheckbox('fewShot')} style={checkboxRowStyle}>
                  {constraints.fewShot ? <CheckSquare size={16} color="#00A19B" /> : <Square size={16} color="var(--text-secondary)" />}
                  <span style={checkboxLabelStyle}>Few-Shot Placeholders</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleEnhancePrompt}
              className="btn"
              disabled={loading || !roughPrompt.trim()}
              style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
            >
              <Sparkles size={18} />
              {loading ? 'AI Rewriter Enhancing Prompt...' : 'Enhance Prompt'}
            </button>
          </div>
        </div>

        {/* Right Pane: Smart Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
            
            {/* Output Panel Header & Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#FFD700" />
                <span>Smart Prompt (After)</span>
              </div>

              {enhancedPrompt && (
                <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.02)', padding: '3px', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                  <button
                    onClick={() => setViewMode('compare')}
                    style={{ ...tabStyle, background: viewMode === 'compare' ? 'rgba(0, 161, 155, 0.1)' : 'transparent', color: viewMode === 'compare' ? 'var(--primary-color)' : 'var(--text-color)' }}
                  >
                    Workspace
                  </button>
                  <button
                    onClick={() => setViewMode('diff')}
                    style={{ ...tabStyle, background: viewMode === 'diff' ? 'rgba(0, 161, 155, 0.1)' : 'transparent', color: viewMode === 'diff' ? 'var(--primary-color)' : 'var(--text-color)' }}
                  >
                    Visual Diff
                  </button>
                </div>
              )}
            </div>

            {/* Loading Skeleton */}
            {loading && (
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', textAlign: 'center' }}>
                  Injecting constraints and expanding directives
                </div>
                <ReusableLoading type="skeleton" count={4} />
              </div>
            )}

            {/* Empty Output Baseline */}
            {!enhancedPrompt && !loading && (
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '40px 10px', border: '2px dashed var(--glass-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)' }}>
                <Info size={36} style={{ opacity: 0.5, marginBottom: '12px' }} />
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px', color: 'var(--text-color)' }}>No Enhanced Prompt Yet</div>
                <div style={{ fontSize: '0.82rem', textAlign: 'center', maxWidth: '280px', lineHeight: '1.4' }}>
                  Load a preset or write a rough query, check your constraints, and click the "Enhance Prompt" button to invoke AI.
                </div>
              </div>
            )}

            {/* Enhanced Prompt Display */}
            {enhancedPrompt && !loading && (
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {viewMode === 'compare' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ position: 'relative', flexGrow: 1 }}>
                      <textarea
                        readOnly
                        value={enhancedPrompt}
                        rows={12}
                        className="form-textarea"
                        style={{
                          height: '100%',
                          minHeight: '280px',
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          lineHeight: '1.5',
                          padding: '16px',
                          background: 'rgba(0, 161, 155, 0.01)',
                          borderColor: 'var(--primary-color)'
                        }}
                      />
                      <button
                        onClick={() => handleCopy(enhancedPrompt)}
                        className="btn"
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy Enhanced'}
                      </button>
                    </div>
                    
                    <div style={{ marginTop: '15px', padding: '12px', borderRadius: '8px', background: 'rgba(0, 161, 155, 0.05)', border: '1px solid rgba(0, 161, 155, 0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap size={14} color="#00A19B" />
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-color)', lineHeight: '1.4' }}>
                        This optimized template was generated by rewriting your rough request, incorporating exact guidelines for formatting and boundaries.
                      </span>
                    </div>
                  </div>
                ) : (
                  renderVisualDiff()
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        .responsive-split {
          display: grid;
          grid-template-columns: 1fr;
          gap: 25px;
        }
        @media(min-width: 992px) {
          .responsive-split {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        .grid-mobile {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media(max-width: 576px) {
          .grid-mobile {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// Inline Styles
const checkboxRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 12px',
  borderRadius: '6px',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid var(--glass-border)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  userSelect: 'none'
};

const checkboxLabelStyle: React.CSSProperties = {
  fontSize: '0.82rem',
  fontWeight: 600,
  color: 'var(--text-color)',
};

const tabStyle: React.CSSProperties = {
  border: 'none',
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '0.78rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  outline: 'none'
};
