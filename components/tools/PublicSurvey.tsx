'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle2, ChevronRight, ClipboardList, AlertCircle, Send } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ─── Types ────────────────────────────────────────────────────────────────────
type QuestionType = 'text' | 'multiple_choice' | 'rating' | 'yes_no';

interface Question {
  id: string;
  type: QuestionType;
  label: string;
  required?: boolean;
  options?: string[]; // for multiple_choice
}

interface SurveyConfig {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

// ─── Demo Survey (shown when no URL hash is present) ─────────────────────────
const DEMO_SURVEY: SurveyConfig = {
  id: 'demo_survey_001',
  title: 'InfinityKit User Satisfaction Survey',
  description: 'Help us improve! Share your honest feedback about your experience with InfinityKit tools.',
  questions: [
    {
      id: 'q1',
      type: 'rating',
      label: 'How would you rate your overall experience with InfinityKit?',
      required: true,
    },
    {
      id: 'q2',
      type: 'multiple_choice',
      label: 'Which category of tools do you use most often?',
      required: true,
      options: ['PDF Tools', 'AI Writing Tools', 'Image Tools', 'Developer Tools', 'Utility Tools'],
    },
    {
      id: 'q3',
      type: 'yes_no',
      label: 'Would you recommend InfinityKit to a friend or colleague?',
      required: true,
    },
    {
      id: 'q4',
      type: 'text',
      label: 'What feature or tool would you most like to see added next?',
      required: false,
    },
    {
      id: 'q5',
      type: 'yes_no',
      label: 'Have you encountered any bugs or issues while using the platform?',
      required: false,
    },
    {
      id: 'q6',
      type: 'text',
      label: 'Any additional comments or suggestions for our team?',
      required: false,
    },
  ],
};

// ─── Star Rating Sub-component ────────────────────────────────────────────────
function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              lineHeight: 1,
              transition: 'transform 0.15s',
              transform: active ? 'scale(1.15)' : 'scale(1)',
            }}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              size={32}
              fill={active ? 'var(--primary-color)' : 'none'}
              color={active ? 'var(--primary-color)' : 'var(--glass-border)'}
              strokeWidth={1.5}
              style={{ transition: 'all 0.15s' }}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
}

// ─── Yes/No Toggle Sub-component ──────────────────────────────────────────────
function YesNoToggle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      {['Yes', 'No'].map((opt) => {
        const isActive = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              padding: '10px 32px',
              borderRadius: '10px',
              border: `2px solid ${isActive ? 'var(--primary-color)' : 'var(--glass-border)'}`,
              background: isActive ? 'var(--primary-color)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-color)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.5px',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PublicSurvey() {
  const [survey, setSurvey] = useState<SurveyConfig | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loadError, setLoadError] = useState('');

  // ── Load survey config from URL parameters, hash, or fall back to demo ──────
  useEffect(() => {
    const loadSurvey = async () => {
      if (typeof window === 'undefined') return;

      const params = new URLSearchParams(window.location.search);
      const surveyId = params.get('id');
      const creatorId = params.get('uid');

      if (surveyId && creatorId) {
        try {
          const docRef = doc(db, 'tools', 'surveyHub', creatorId, surveyId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setSurvey(docSnap.data() as SurveyConfig);
            return;
          } else {
            setLoadError('Survey not found in cloud. Showing demo survey instead.');
          }
        } catch (err: any) {
          console.error('Failed to load survey from cloud:', err);
          setLoadError('Error connecting to cloud database. Showing demo survey instead.');
        }
      }

      // Legacy Hash Fallback
      try {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
          const decoded = atob(hash);
          const config: SurveyConfig = JSON.parse(decoded);
          if (config && config.questions && config.title) {
            setSurvey(config);
            return;
          }
        }
      } catch {
        setLoadError('Could not parse legacy link. Showing demo survey instead.');
      }

      setSurvey(DEMO_SURVEY);
    };

    loadSurvey();

    // Also handle hash changes for legacy
    window.addEventListener('hashchange', loadSurvey);
    return () => window.removeEventListener('hashchange', loadSurvey);
  }, []);

  // ── Answer management ─────────────────────────────────────────────────────
  const setAnswer = useCallback((questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  // ── Progress ──────────────────────────────────────────────────────────────
  const answeredCount = survey
    ? survey.questions.filter((q) => {
        const a = answers[q.id];
        return a !== undefined && a !== '' && a !== 0;
      }).length
    : 0;

  const totalCount = survey?.questions.length ?? 0;
  const progressPct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    if (!survey) return false;
    const newErrors: Record<string, string> = {};
    survey.questions.forEach((q) => {
      if (q.required) {
        const a = answers[q.id];
        if (a === undefined || a === '' || a === 0) {
          newErrors[q.id] = 'This question is required.';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate() || !survey) return;

    const response = {
      submittedAt: new Date().toISOString(),
      answers,
    };

    try {
      // Save to Firestore tools/surveyResponses/{surveyId}/{responseId}
      const responseId = 'resp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const responseRef = doc(db, 'tools', 'surveyResponses', survey.id, responseId);
      
      // Note: We need a root 'timestamp' field to satisfy the security rule
      await setDoc(responseRef, {
        timestamp: response.submittedAt,
        answers: response.answers
      });

      // Also back up locally under infinitykit_responses_{surveyId}
      const key = `infinitykit_responses_${survey.id}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(response);
      localStorage.setItem(key, JSON.stringify(existing));

      setSubmitted(true);
    } catch (e: any) {
      console.error('Failed to submit response:', e);
      alert('Error submitting response to the cloud: ' + e.message);
    }
  };

  // ─── Thank You Screen ─────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ padding: '10px 0' }}>
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '60px 32px',
            borderRadius: '20px',
            maxWidth: '560px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-color) 0%, #6ee7b7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 32px rgba(var(--primary-color-rgb, 99,102,241),0.25)',
            }}
          >
            <CheckCircle2 size={36} color="#fff" strokeWidth={2} />
          </div>
          <h2
            style={{
              fontSize: '1.7rem',
              fontWeight: 700,
              color: 'var(--text-color)',
              margin: '0 0 12px',
            }}
          >
            Thank You! 🎉
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              lineHeight: 1.6,
              margin: '0 0 28px',
            }}
          >
            Your response has been recorded successfully. We really appreciate you taking the time to
            share your feedback!
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setErrors({});
            }}
            style={{
              padding: '10px 28px',
              borderRadius: '10px',
              border: '1.5px solid var(--glass-border)',
              background: 'transparent',
              color: 'var(--text-color)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'var(--transition-smooth)',
            }}
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div style={{ padding: '10px 0' }}>
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            borderRadius: '20px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--glass-border)',
              borderTopColor: 'var(--primary-color)',
              borderRadius: '50%',
              animation: 'psSpin 0.75s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <style>{`@keyframes psSpin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Loading survey…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px 0' }}>
      {/* ── Load-error banner ── */}
      {loadError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            borderRadius: '10px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            color: '#d97706',
            fontSize: '0.85rem',
          }}
        >
          <AlertCircle size={16} />
          {loadError}
        </div>
      )}

      {/* ── Header panel ── */}
      <div
        className="glass-panel"
        style={{
          borderRadius: '20px',
          padding: '28px 28px 20px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary-color), #818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
            }}
          >
            <ClipboardList size={24} color="#fff" strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: '1.45rem',
                fontWeight: 700,
                color: 'var(--text-color)',
                margin: '0 0 6px',
                lineHeight: 1.3,
              }}
            >
              {survey.title}
            </h1>
            {survey.description && (
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {survey.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ marginTop: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Progress
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {answeredCount}/{totalCount} answered ({progressPct}%)
            </span>
          </div>
          <div
            style={{
              height: '6px',
              borderRadius: '9999px',
              background: 'var(--glass-border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: '9999px',
                background: 'linear-gradient(90deg, var(--primary-color), #818cf8)',
                width: `${progressPct}%`,
                transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Questions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {survey.questions.map((q, idx) => {
          const hasError = !!errors[q.id];
          return (
            <div
              key={q.id}
              className="glass-panel"
              style={{
                borderRadius: '16px',
                padding: '22px 24px',
                border: hasError
                  ? '1.5px solid rgba(239,68,68,0.5)'
                  : '1px solid var(--glass-border)',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Question label */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--primary-color)',
                    letterSpacing: '0.5px',
                  }}
                >
                  {idx + 1}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.97rem',
                    fontWeight: 600,
                    color: 'var(--text-color)',
                    lineHeight: 1.4,
                  }}
                >
                  {q.label}
                  {q.required && (
                    <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                  )}
                </p>
              </div>

              {/* ── text ── */}
              {q.type === 'text' && (
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  placeholder="Type your answer here…"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: `1.5px solid ${hasError ? 'rgba(239,68,68,0.5)' : 'var(--glass-border)'}`,
                    background: 'var(--glass-bg)',
                    color: 'var(--text-color)',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary-color)')}
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = hasError
                      ? 'rgba(239,68,68,0.5)'
                      : 'var(--glass-border)')
                  }
                />
              )}

              {/* ── multiple_choice ── */}
              {q.type === 'multiple_choice' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(q.options || []).map((opt) => {
                    const selected = answers[q.id] === opt;
                    return (
                      <label
                        key={opt}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: `1.5px solid ${selected ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                          background: selected ? 'rgba(99,102,241,0.07)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.18s',
                          userSelect: 'none',
                        }}
                      >
                        {/* Custom radio */}
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: `2px solid ${selected ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                            background: selected ? 'var(--primary-color)' : 'transparent',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.18s',
                          }}
                        >
                          {selected && (
                            <div
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: '#fff',
                              }}
                            />
                          )}
                        </div>
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={selected}
                          onChange={() => setAnswer(q.id, opt)}
                          style={{ display: 'none' }}
                        />
                        <span
                          style={{
                            fontSize: '0.9rem',
                            color: selected ? 'var(--primary-color)' : 'var(--text-color)',
                            fontWeight: selected ? 600 : 400,
                            transition: 'color 0.18s',
                          }}
                        >
                          {opt}
                        </span>
                        {selected && (
                          <ChevronRight
                            size={14}
                            color="var(--primary-color)"
                            style={{ marginLeft: 'auto', flexShrink: 0 }}
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              )}

              {/* ── rating ── */}
              {q.type === 'rating' && (
                <StarRating
                  value={answers[q.id] || 0}
                  onChange={(v) => setAnswer(q.id, v)}
                />
              )}

              {/* ── yes_no ── */}
              {q.type === 'yes_no' && (
                <YesNoToggle
                  value={answers[q.id] || ''}
                  onChange={(v) => setAnswer(q.id, v)}
                />
              )}

              {/* Error message */}
              {hasError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '10px',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                  }}
                >
                  <AlertCircle size={13} />
                  {errors[q.id]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Submit button ── */}
      <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '13px 32px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--primary-color), #818cf8)',
            color: '#fff',
            fontSize: '0.97rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            transition: 'opacity 0.2s, transform 0.15s',
            letterSpacing: '0.3px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Send size={17} strokeWidth={2} />
          Submit Response
        </button>
      </div>

      {/* ── Footer note ── */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          marginTop: '16px',
          opacity: 0.7,
        }}
      >
        Your responses are securely saved to the database. Required fields are marked with{' '}
        <span style={{ color: '#ef4444' }}>*</span>.
      </p>
    </div>
  );
}
