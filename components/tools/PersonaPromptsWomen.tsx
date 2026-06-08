'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Trash2,
  BookmarkPlus,
  Heart,
  Gem,
  Coins,
  Sun
} from 'lucide-react';
import ReusableResult from '../ui/ReusableResult';
import ReusableLoading from '../ui/ReusableLoading';
import { syncService } from '../../lib/sync';

// Pre-built premium prompts for Women
const PREBUILT_PROMPTS = {
  career: [
    {
      title: "Executive Promotion & Authority Pitch",
      prompt: "Draft an executive-level promotion and compensation pitch highlighting leadership milestones, revenue impact, and team development initiatives. The tone should be highly authoritative, data-backed, and confident."
    },
    {
      title: "Reclaiming the Floor Boardroom Script",
      prompt: "Create a tactical script for addressing interrupters, reclaiming credit for ideas, and speaking with unwavering authority in high-stakes boardroom environments."
    },
    {
      title: "Executive Sponsorship Network Matrix",
      prompt: "Outline a comprehensive networking strategy for securing sponsorships and mentorships with executive-level leaders in male-dominated industries."
    },
    {
      title: "Professional Speaking Engagement Bio",
      prompt: "Craft a compelling, highly professional executive bio (250 words) suitable for panel speaking engagements, company websites, and industry publications, highlighting authority and expertise."
    },
    {
      title: "Counter-Offering Salary Anchor Script",
      prompt: "Develop a complete negotiation script for counter-offering a job offer, including how to handle lowball anchors, request flexible options, and present total compensation expectations."
    },
    {
      title: "Resolving Workplace Power Dynamics",
      prompt: "Write a collaborative, professional framework for resolving power dynamics disagreements or credit-sharing issues with a direct peer, preserving collaborative alliances."
    }
  ],
  beauty: [
    {
      title: "Anti-Aging Skincare Formula",
      prompt: "Construct a dermatologist-inspired skincare routine targeting fine lines, hyperpigmentation, and collagen production. Include morning and evening active ingredients (Retinol, Vitamin C, Niacinamide, Hyaluronic Acid) and usage precautions."
    },
    {
      title: "Glass Skin Glow & Barrier Repair Plan",
      prompt: "Create a comprehensive skincare and hydration protocol to achieve a natural, radiant, dewy complexion. Focus on barrier repair, hydration layering, and gut-health correlations."
    },
    {
      title: "4-Night Active Skin Cycling Schedule",
      prompt: "Design a highly structured 4-night 'skin cycling' routine (Exfoliation night, Retinoid night, and two Recovery nights) to maximize active ingredient efficacy while minimizing irritation."
    },
    {
      title: "HD Occasion Makeup Application",
      prompt: "Draft a step-by-step professional makeup application routine designed to look flawless under camera flashes, stage lighting, and professional photography, with product types and setting steps."
    },
    {
      title: "Scalp Wellness & Density Restoration Plan",
      prompt: "Develop a holistic 6-month hair restoration plan targeting scalp wellness, density, and follicle strength, addressing heat damage and styling stressors."
    },
    {
      title: "Transitioning to Clean Non-Toxic Beauty",
      prompt: "Construct a guide for transitioning to a completely clean, non-toxic beauty and personal care routine. Identify specific endocrine disruptors to avoid and suggest natural alternatives."
    }
  ],
  finance: [
    {
      title: "Index Fund & ETF Wealth Portfolio",
      prompt: "Design a comprehensive long-term investment strategy using low-cost index funds and global ETFs, specifically structured for a female professional aiming for financial independence. Include compound interest projections."
    },
    {
      title: "Semi-Passive Skill Monetization Strategy",
      prompt: "Create a launch plan for monetizing a specialized skill (e.g., consulting, online tutoring, design) to generate $3,000/month in passive/semi-passive income within 120 days, utilizing digital marketing."
    },
    {
      title: "Lifestyle-Compatible Aggressive Budgeting",
      prompt: "Formulate a personalized budgeting blueprint (such as the 50/30/20 rule, modified for aggressive investing) that balances high savings rates with personal lifestyle, travel, and wellness."
    },
    {
      title: "Respectful Pre-nuptial Agreement Conversation",
      prompt: "Draft a highly professional, respectful guide on how to approach pre-nuptial planning and financial asset protection conversations with a partner, emphasizing mutual security and clarity."
    },
    {
      title: "Cash-Flowing Rental Investment Blueprint",
      prompt: "Provide a step-by-step investment manual on how to buy, manage, and scale a cash-flowing residential rental property to generate secondary passive income streams."
    },
    {
      title: "Generational Trust & Wealth Inheritance Guide",
      prompt: "Construct a structural wealth transition and estate planning guide, detailing trusts, wills, custodian accounts, and financial literacy strategies for children."
    }
  ],
  wellness: [
    {
      title: "Menstrual Cycle Syncing & Nutrition Guide",
      prompt: "Formulate a holistic nutrition and lifestyle guide designed to support menstrual cycle syncing (follicular, ovulatory, luteal, and menstrual phases), optimizing energy, mood, and workouts."
    },
    {
      title: "30-Day Occupational Burnout Recovery Protocol",
      prompt: "Create a 30-day somatic and psychological nervous system deregulation plan to recover from chronic occupational burnout, prioritizing sleep quality, mindfulness, and sensory reduction."
    },
    {
      title: "20-Minute Somatic Morning Grounding",
      prompt: "Design a beautiful 20-minute morning wellness routine that combines breathwork, progressive muscle relaxation, journaling, and mindful movement to set a calm, centered intention for the day."
    },
    {
      title: "Gut Microbiome Optimization & Bloat Prevention",
      prompt: "Develop a comprehensive, food-first gut microbiome optimization guide detailing prebiotic/probiotic foods, lifestyle triggers (stress, sleep), and dietary additions to combat bloating and fatigue."
    },
    {
      title: "Somatic Hip & Shoulder Tension Release Routine",
      prompt: "Craft a detailed somatic exercise guide targeting physical tension storage in the hips and shoulders, linking emotional release with breathwork and dynamic stretching."
    },
    {
      title: "Sleep Sanctuary & Melatonin Optimization Protocol",
      prompt: "Draft a complete physiological and environmental guide to build the ultimate sleep sanctuary. Include wind-down routines, melatonin optimization, and temperature controls."
    }
  ],
  dating: [
    {
      title: "Non-Defensive Conscious Communication Blueprint",
      prompt: "Draft a communication manual for expressing deep emotional needs and feelings to a partner in a way that minimizes defensiveness, using non-violent communication structures."
    },
    {
      title: "Anxious-to-Secure Attachment Coaching Guide",
      prompt: "Develop a self-coaching guide to shift from an anxious or avoidant attachment pattern toward secure attachment in romantic relationships, featuring somatic grounding prompts."
    },
    {
      title: "Setting Strong Boundaries with In-Laws & Parents",
      prompt: "Provide a script and tactical advice for establishing healthy, firm boundaries with overbearing in-laws or parents regarding life choices, child-rearing, or financial decisions."
    },
    {
      title: "Value-Aligned Dating Selectivity Matrix",
      prompt: "Construct an analytical yet intuitive dating checklist based on core values, emotional maturity, long-term compatibility, and relationship readiness to evaluate potential partners."
    },
    {
      title: "Cultivating Deep Adult Female Friendships",
      prompt: "Write a guide on how to cultivate deep, mutually supportive, high-value adult female friendships, including handling friendship drift, setting time priorities, and resolving conflicts."
    },
    {
      title: "Sustained Emotional Intimacy Couples Rituals",
      prompt: "Design a series of weekly, monthly, and annual connection rituals for couples to sustain emotional intimacy, romance, and alignment, even during busy career phases."
    }
  ]
};

type CategoryKey = 'career' | 'beauty' | 'finance' | 'wellness' | 'dating' | 'bookmarks';

interface CustomPrompt {
  id: string;
  title: string;
  prompt: string;
  category: string;
}

export default function PersonaPromptsWomen() {
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
      syncService.getData('infinitykit_custom_prompts_women').then(data => {
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
    syncService.saveData('infinitykit_custom_prompts_women', updated);
    setCustomTitle('');
    setIsBookmarking(false);
  };

  const handleDeleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    syncService.saveData('infinitykit_custom_prompts_women', updated);
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
          Women's Persona Prompts
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
          Access curated, professional prompt guidelines formulated for executive negotiation, dermatological skincare routines, financial freedom portfolios, somatic stress de-escalation, and high-value partnerships. Edit templates, manage bookmarks locally, and generate AI insights.
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
                <span>Career & Negotiation</span>
              </button>

              <button
                onClick={() => setActiveCategory('beauty')}
                style={{ ...categoryButtonStyle, background: activeCategory === 'beauty' ? 'rgba(0, 161, 155, 0.1)' : 'transparent', color: activeCategory === 'beauty' ? 'var(--primary-color)' : 'var(--text-color)' }}
              >
                <Gem size={16} color={activeCategory === 'beauty' ? '#00A19B' : 'currentColor'} />
                <span>Beauty & Skincare</span>
              </button>

              <button
                onClick={() => setActiveCategory('finance')}
                style={{ ...categoryButtonStyle, background: activeCategory === 'finance' ? 'rgba(0, 161, 155, 0.1)' : 'transparent', color: activeCategory === 'finance' ? 'var(--primary-color)' : 'var(--text-color)' }}
              >
                <Coins size={16} color={activeCategory === 'finance' ? '#00A19B' : 'currentColor'} />
                <span>Financial Independence</span>
              </button>

              <button
                onClick={() => setActiveCategory('wellness')}
                style={{ ...categoryButtonStyle, background: activeCategory === 'wellness' ? 'rgba(0, 161, 155, 0.1)' : 'transparent', color: activeCategory === 'wellness' ? 'var(--primary-color)' : 'var(--text-color)' }}
              >
                <Sun size={16} color={activeCategory === 'wellness' ? '#00A19B' : 'currentColor'} />
                <span>Wellness & Somatics</span>
              </button>

              <button
                onClick={() => setActiveCategory('dating')}
                style={{ ...categoryButtonStyle, background: activeCategory === 'dating' ? 'rgba(0, 161, 155, 0.1)' : 'transparent', color: activeCategory === 'dating' ? 'var(--primary-color)' : 'var(--text-color)' }}
              >
                <Heart size={16} color={activeCategory === 'dating' ? '#00A19B' : 'currentColor'} />
                <span>Relationships</span>
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
              downloadableFilename="women_persona_prompt_output.txt"
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
