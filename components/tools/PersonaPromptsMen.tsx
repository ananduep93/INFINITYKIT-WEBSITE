'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Dumbbell,
  DollarSign,
  Brain,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Trash2,
  Plus,
  ArrowRight,
  BookmarkPlus
} from 'lucide-react';
import ReusableResult from '../ui/ReusableResult';
import ReusableLoading from '../ui/ReusableLoading';
import { syncService } from '../../lib/sync';

// Pre-built premium prompts for Men
const PREBUILT_PROMPTS = {
  career: [
    {
      title: "Executive Salary & Promotion Pitch",
      prompt: "Draft a highly professional, assertive email requesting a salary review or promotion after delivering a major project ahead of schedule and under budget. The tone should be objective, data-driven, and confident, emphasizing the measurable business impact, ROI, and future leadership alignment."
    },
    {
      title: "Situation-Complication-Resolution Pitch",
      prompt: "Design a persuasive 5-minute pitch framework to propose a new strategic initiative to the executive team. Structure the pitch using the Situation-Complication-Resolution (SCR) framework, focusing on market opportunity, risk mitigation, and scaling operations."
    },
    {
      title: "30-Second Executive Elevator Pitch",
      prompt: "Craft a compelling 30-second elevator pitch for a senior networking event. Highlight 10 years of cross-functional experience, a key achievement in team optimization, and a clear call-to-action regarding industry partnership opportunities."
    },
    {
      title: "Boardroom Conflict Resolution Script",
      prompt: "Provide a step-by-step dialogue script for resolving a high-stakes disagreement with a peer department head. Ensure the communication remains collaborative, focuses on shared organizational goals, and avoids defensive language."
    },
    {
      title: "3-Year Strategic Vision Memo",
      prompt: "Write a comprehensive executive summary outlining a 3-year technology and operational scaling roadmap for an enterprise division. Use strong action verbs, concise bullet points, and high-level KPIs."
    },
    {
      title: "High-Value Vendor Negotiation Guide",
      prompt: "Outline a tactical guide for negotiating high-value contract terms with external vendors, including techniques for managing anchoring biases, defining BATNA, and setting win-win concessions."
    }
  ],
  fitness: [
    {
      title: "4-Day Hypertrophy Workout Split",
      prompt: "Design a scientifically backed 4-day upper/lower hypertrophy workout split targeting maximum muscle protein synthesis. Include exercises, sets, reps, rest intervals, and progressive overload rules for a 12-week block."
    },
    {
      title: "10% Fat Loss & Muscle Retention Plan",
      prompt: "Formulate a personalized nutrition and supplementation plan for a 180-pound male aiming to shed body fat down to 10% while fully preserving lean muscle mass. Detail macronutrient ratios, timing, and hydration."
    },
    {
      title: "High-Protein 3-Hour Meal Prep Protocol",
      prompt: "Construct a 7-day high-protein meal prep routine requiring under 3 hours of total cooking time. Focus on clean ingredients, budget-friendliness, accurate caloric targets, and diverse flavoring profiles."
    },
    {
      title: "Desk Job Athletic Mobility Routine",
      prompt: "Create a comprehensive 15-minute daily dynamic mobility and joint-health routine designed to counteract a sedentary desk job, focusing on thoracic spine extension, hip flexors, and ankle mobility."
    },
    {
      title: "Advanced Compound Lift Strength Cycle",
      prompt: "Develop an advanced 8-week compound movement strength cycle (Squat, Bench, Deadlift, Overhead Press) based on percentage-based training (RPE) and autoregulation."
    },
    {
      title: "Active Recovery & Sleep Optimization",
      prompt: "Write a detail-oriented active recovery guide for high-stress training weeks. Include sleep hygiene optimizations, cold/heat exposure parameters, and zone-2 cardio target thresholds."
    }
  ],
  finance: [
    {
      title: "Asset Allocation Blueprint",
      prompt: "Create a strategic asset allocation plan for a 30-year-old high earner looking to achieve financial independence. Detail allocations across low-cost index funds, real estate, cash reserves, and speculative assets, with rebalancing rules."
    },
    {
      title: "90-Day SaaS Side Hustle Strategy",
      prompt: "Construct a step-by-step launch strategy to build, validate, and launch a micro-SaaS product or digital service to $2,000/month in recurring revenue within 90 days, utilizing low-code tools."
    },
    {
      title: "Personal Income Tax Minimization Checklist",
      prompt: "Develop an advanced, legally compliant checklist for reducing annual personal income tax liabilities through retirement accounts, health savings accounts, real estate deductions, and charitable contributions."
    },
    {
      title: "Debt Avalanche Repayment Roadmap",
      prompt: "Formulate a comprehensive debt repayment roadmap utilizing both the Debt Avalanche and Debt Snowball methodologies. Include psychological tips, cash flow optimization, and bank negotiation tips."
    },
    {
      title: "Real Estate Property Rental Evaluator",
      prompt: "Provide a detailed step-by-step framework to calculate cash-on-cash return, capitalization rate (Cap Rate), net operating income (NOI), and debt service coverage ratio (DSCR) for a residential rental property."
    },
    {
      title: "Early-Stage Startup Angel Investment Guide",
      prompt: "Outline a comprehensive framework for evaluating early-stage startup investments, focusing on founder credentials, market size, product-market fit, cap table health, and risk factors."
    }
  ],
  mindset: [
    {
      title: "Stoic Morning Reflection Routine",
      prompt: "Draft a highly structured, reflective Stoic morning routine, incorporating Marcus Aurelius's teachings on control, gratitude, obstacle-as-opportunity, and preparing for difficult interactions."
    },
    {
      title: "Cognitive Reframing Resilience Guide",
      prompt: "Create a cognitive behavioral reframing guide to handle high-stress business decisions. Outline techniques to separate objective facts from anxiety-driven interpretations, and set clear actionable steps."
    },
    {
      title: "4-Hour Deep Work Focus Block Planner",
      prompt: "Formulate an optimal daily structure for executing 4 hours of uninterrupted, distraction-free deep work. Detail environment design, digital app blocking, physiological anchors, and focus-rest cycles."
    },
    {
      title: "Habit Loop Habit Replacement Strategy",
      prompt: "Design a blueprint to successfully break a negative habitual behavior (such as doom-scrolling or late-night snacking) and seamlessly replace it with a productive, high-ROI routine using queue-craving-response-reward styling."
    },
    {
      title: "Tim Ferriss Fear-Setting Worksheet",
      prompt: "Construct a comprehensive fear-setting worksheet based on Tim Ferriss's model: defining worst-case scenarios, outlining preventative measures, and estimating the cost of inaction."
    },
    {
      title: "10-Year Life Pillars Vision Exercise",
      prompt: "Create a structured exercise to define life goals across 5 pillars (Health, Wealth, Career, Relationships, Purpose) over a 10-year horizon, translating them into quarterly key results."
    }
  ],
  dating: [
    {
      title: "Active Listening & Connection Manual",
      prompt: "Develop a practical guide to mastering active listening and empathetic dialogue in personal relationships. Include conversational loops, validation strategies, and verbal prompts to deepen connection."
    },
    {
      title: "Intimate Relationship De-escalation Protocol",
      prompt: "Draft a conflict resolution roadmap for intimate relationships. Use 'I' statements, emotional regulation techniques, and mutual understanding checkpoints to resolve disagreements without resentment."
    },
    {
      title: "Charismatic Social Storytelling Framework",
      prompt: "Design a storytelling framework for social settings that structures personal anecdotes to maximize engagement, suspense, and emotional resonance. Include delivery tips and voice modulation rules."
    },
    {
      title: "Personal Boundaries Assertiveness Guide",
      prompt: "Create a series of polite yet firm verbal responses for setting strong personal boundaries with intrusive family members or friends, balancing respect with unwavering self-worth."
    },
    {
      title: "Social Anxiety Grounding Protocol",
      prompt: "Provide a practical, step-by-step cognitive-behavioral exposure guide to overcome social anxiety in networking or social gatherings, including grounding exercises and conversation starters."
    },
    {
      title: "15 High-Quality Deep Connection Questions",
      prompt: "Compile a list of 15 high-quality, open-ended discussion questions designed to bypass superficial small talk and foster deep emotional intimacy, intellectual curiosity, and vulnerability."
    }
  ]
};

type CategoryKey = 'career' | 'fitness' | 'finance' | 'mindset' | 'dating' | 'bookmarks';

interface CustomPrompt {
  id: string;
  title: string;
  prompt: string;
  category: string;
}

export default function PersonaPromptsMen() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('career');
  const [selectedPromptText, setSelectedPromptText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [bookmarks, setBookmarks] = useState<CustomPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  // Load custom bookmarks on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      syncService.getData('infinitykit_custom_prompts_men').then(data => {
        if (data) {
          try {
            setBookmarks(typeof data === 'string' ? JSON.parse(data) : data);
          } catch (e) {
            console.error("Error loading bookmarks:", e);
          }
        }
      });
    }
  }, []);

  // Initialize textarea with first prompt of career category
  useEffect(() => {
    if (PREBUILT_PROMPTS.career.length > 0) {
      setSelectedPromptText(PREBUILT_PROMPTS.career[0].prompt);
    }
  }, []);

  const handleSelectPrompt = (text: string) => {
    setSelectedPromptText(text);
    setResult('');
  };

  const handleSaveBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromptText.trim() || !customTitle.trim()) return;

    const newBookmark: CustomPrompt = {
      id: Date.now().toString(),
      title: customTitle.trim(),
      prompt: selectedPromptText.trim(),
      category: activeCategory
    };

    const updated = [newBookmark, ...bookmarks];
    setBookmarks(updated);
    syncService.saveData('infinitykit_custom_prompts_men', updated);
    setCustomTitle('');
    setIsBookmarking(false);
  };

  const handleDeleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    syncService.saveData('infinitykit_custom_prompts_men', updated);
    if (activeCategory === 'bookmarks' && updated.length === 0) {
      setActiveCategory('career');
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedPromptText.trim() || loading) return;

    setLoading(true);
    setResult('');

    try {
      const localOpenaiKey = localStorage.getItem('infinitykit_openai_key') || '';
      const localGeminiKey = localStorage.getItem('infinitykit_gemini_key') || '';

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: selectedPromptText,
          taskType: 'chat',
          openaiKey: localOpenaiKey,
          geminiKey: localGeminiKey
        })
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.text || 'Error generating AI content.');
      } else {
        setResult(data.error || 'Server error occurred during content generation.');
      }
    } catch (e) {
      setResult('Failed to communicate with AI servers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getActivePrompts = () => {
    if (activeCategory === 'bookmarks') {
      return bookmarks;
    }
    return PREBUILT_PROMPTS[activeCategory] || [];
  };

  return (
    <div style={{ padding: '10px 0', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ marginBottom: '25px', padding: '24px' }}>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-color)', marginBottom: '8px' }}>
          Men's Persona Prompts
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
          Access premium, highly descriptive prompts designed for high-value execution in leadership, fitness, finance, and mindset. Customize parameters, bookmark your templates, and invoke generation instantly.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }} className="responsive-split">
        {/* Left Side: Categories & Prompt list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Category Navigation Cards */}
          <div className="glass-panel" style={{ padding: '15px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px', paddingLeft: '5px' }}>
              Categories
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                onClick={() => setActiveCategory('career')}
                style={{ ...categoryButtonStyle, background: activeCategory === 'career' ? 'rgba(0, 161, 155, 0.1)' : 'transparent', color: activeCategory === 'career' ? 'var(--primary-color)' : 'var(--text-color)' }}
              >
                <Briefcase size={16} color={activeCategory === 'career' ? '#00A19B' : 'currentColor'} />
                <span>Career & Leadership</span>
              </button>

              <button
                onClick={() => setActiveCategory('fitness')}
                style={{ ...categoryButtonStyle, background: activeCategory === 'fitness' ? 'rgba(0, 161, 155, 0.1)' : 'transparent', color: activeCategory === 'fitness' ? 'var(--primary-color)' : 'var(--text-color)' }}
              >
                <Dumbbell size={16} color={activeCategory === 'fitness' ? '#00A19B' : 'currentColor'} />
                <span>Fitness & Muscle</span>
              </button>

              <button
                onClick={() => setActiveCategory('finance')}
                style={{ ...categoryButtonStyle, background: activeCategory === 'finance' ? 'rgba(0, 161, 155, 0.1)' : 'transparent', color: activeCategory === 'finance' ? 'var(--primary-color)' : 'var(--text-color)' }}
              >
                <DollarSign size={16} color={activeCategory === 'finance' ? '#00A19B' : 'currentColor'} />
                <span>Personal Finance</span>
              </button>

              <button
                onClick={() => setActiveCategory('mindset')}
                style={{ ...categoryButtonStyle, background: activeCategory === 'mindset' ? 'rgba(0, 161, 155, 0.1)' : 'transparent', color: activeCategory === 'mindset' ? 'var(--primary-color)' : 'var(--text-color)' }}
              >
                <Brain size={16} color={activeCategory === 'mindset' ? '#00A19B' : 'currentColor'} />
                <span>Stoic Mindset</span>
              </button>

              <button
                onClick={() => setActiveCategory('dating')}
                style={{ ...categoryButtonStyle, background: activeCategory === 'dating' ? 'rgba(0, 161, 155, 0.1)' : 'transparent', color: activeCategory === 'dating' ? 'var(--primary-color)' : 'var(--text-color)' }}
              >
                <MessageSquare size={16} color={activeCategory === 'dating' ? '#00A19B' : 'currentColor'} />
                <span>Dating & Comm</span>
              </button>

              <button
                onClick={() => setActiveCategory('bookmarks')}
                style={{ ...categoryButtonStyle, background: activeCategory === 'bookmarks' ? 'rgba(0, 161, 155, 0.1)' : 'transparent', color: activeCategory === 'bookmarks' ? 'var(--primary-color)' : 'var(--text-color)' }}
                disabled={bookmarks.length === 0}
              >
                <Bookmark size={16} color={activeCategory === 'bookmarks' ? '#00A19B' : 'currentColor'} />
                <span>My Bookmarks ({bookmarks.length})</span>
              </button>
            </div>
          </div>

          {/* List of Prompts inside Category */}
          <div className="glass-panel" style={{ padding: '15px', flexGrow: 1, minHeight: '300px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px', paddingLeft: '5px' }}>
              Prompts List
            </div>
            {getActivePrompts().length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No custom bookmarked prompts. Use the 'Save to Bookmarks' feature on the right!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {getActivePrompts().map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectPrompt(p.prompt)}
                    style={promptItemStyle}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                      {activeCategory === 'bookmarks' && (
                        <button
                          onClick={(e) => handleDeleteBookmark((p as CustomPrompt).id, e)}
                          style={deleteButtonStyle}
                          title="Remove bookmark"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textOverflow: 'ellipsis', lineHeight: '1.4' }}>
                      {p.prompt}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Editable Area, Trigger actions, Outputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-color)' }}>
                Prompt Workspace
              </div>
              <button
                onClick={() => setIsBookmarking(true)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <BookmarkPlus size={16} /> Bookmark Current
              </button>
            </div>

            {/* Quick Bookmark Input Panel */}
            {isBookmarking && (
              <form onSubmit={handleSaveBookmark} style={bookmarkFormStyle}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Save Custom Prompt</div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Enter prompt template title..."
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    required
                    className="form-textarea"
                    style={{ flexGrow: 1, padding: '8px 12px', height: '38px', marginBottom: 0 }}
                  />
                  <button type="submit" className="btn" style={{ padding: '0 16px', height: '38px', fontSize: '0.85rem' }}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setIsBookmarking(false); setCustomTitle(''); }}
                    style={{ padding: '0 16px', height: '38px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <textarea
                value={selectedPromptText}
                onChange={(e) => setSelectedPromptText(e.target.value)}
                placeholder="Select a template or type your custom prompt here..."
                rows={9}
                className="form-textarea"
                style={{ fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: '1.5', padding: '16px' }}
              />
            </div>

            <button
              onClick={handleGenerateAI}
              className="btn"
              disabled={loading || !selectedPromptText.trim()}
              style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
            >
              <Sparkles size={18} />
              {loading ? 'AI Model Generating Content...' : 'Generate AI Content'}
            </button>
          </div>

          {/* Loading view */}
          {loading && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase' }}>
                Executing Prompt via Gemini Model
              </div>
              <ReusableLoading type="skeleton" count={4} />
            </div>
          )}

          {/* Results Display */}
          {result && !loading && (
            <ReusableResult
              label="Executed Content Output"
              value={result}
              color="success"
              downloadableFilename="men_persona_prompt_output.txt"
            />
          )}
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
            grid-template-columns: 300px 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// Inline Styles
const categoryButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: 'none',
  textAlign: 'left',
  fontSize: '0.88rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  outline: 'none',
};

const promptItemStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid var(--glass-border)',
  background: 'rgba(255,255,255,0.01)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textAlign: 'left',
};

const deleteButtonStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: 'rgba(220,53,69,0.7)',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
};

const bookmarkFormStyle: React.CSSProperties = {
  background: 'rgba(0, 161, 155, 0.03)',
  border: '1px solid var(--primary-color)',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '20px',
  animation: 'fadeIn 0.3s ease'
};
