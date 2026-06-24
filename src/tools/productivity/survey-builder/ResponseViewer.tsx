'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Trash2, 
  ClipboardList, 
  Calendar, 
  ChevronDown, 
  Check, 
  Share2, 
  Star, 
  FileText, 
  AlertCircle, 
  ArrowLeft,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

import { syncService } from '../../../lib/sync';
import { db } from '../../../lib/firebase';
import { supabase } from '../../../lib/supabase';
import { collection, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';

// ─── Types ────────────────────────────────────────────────────────────────────
type QuestionType = 'text' | 'multiple_choice' | 'rating' | 'yes_no';

interface Question {
  id: string;
  type: QuestionType;
  label: string;
  required?: boolean;
  options?: string[];
}

interface SavedSurvey {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: string;
}

interface SurveyResponse {
  submittedAt: string;
  answers: Record<string, any>;
}

export default function ResponseViewer() {
  const [surveys, setSurveys] = useState<SavedSurvey[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // ─── Load surveys & check search query on mount ────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      syncService.getData('infinitykit_surveys').then((data) => {
        if (data) {
          try {
            const parsedSurveys: SavedSurvey[] = typeof data === 'string' ? JSON.parse(data) : data;
            setSurveys(parsedSurveys);
            
            // Check for URL search param auto-select
            const params = new URLSearchParams(window.location.search);
            const urlSurveyId = params.get('surveyId');
            
            if (urlSurveyId && parsedSurveys.some(s => s.id === urlSurveyId)) {
              setSelectedSurveyId(urlSurveyId);
            } else if (parsedSurveys.length > 0) {
              setSelectedSurveyId(parsedSurveys[0].id);
            }
          } catch (e) {
            console.error('Failed to parse surveys:', e);
          }
        }
      });
    }
  }, []);

  // ─── Load responses when active survey changes ─────────────────────────────
  useEffect(() => {
    if (selectedSurveyId) {
      const fetchResponses = async () => {
        try {
          // 1. Try to fetch from Supabase (primary)
          const { data, error } = await supabase
            .from('survey_responses')
            .select('answers, created_at')
            .eq('survey_id', selectedSurveyId)
            .order('created_at', { ascending: true });

          if (!error && data && data.length > 0) {
            const list: SurveyResponse[] = data.map(item => ({
              submittedAt: item.created_at,
              answers: item.answers as Record<string, any>
            }));
            setResponses(list);
            return;
          }

          // 2. Fallback to Firestore (coexistence)
          const colRef = collection(db, 'tools', 'surveyResponses', selectedSurveyId);
          const snapshot = await getDocs(colRef);
          const cloudResponses = snapshot.docs.map(doc => {
            const docData = doc.data();
            return {
              submittedAt: docData.timestamp || new Date().toISOString(),
              answers: docData.answers || {}
            } as SurveyResponse;
          });
          cloudResponses.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
          setResponses(cloudResponses);
        } catch (err) {
          console.error('Failed to fetch responses:', err);
          // Fallback to local storage
          const key = `infinitykit_responses_${selectedSurveyId}`;
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              setResponses(JSON.parse(stored));
            } catch (e) {
              setResponses([]);
            }
          } else {
            setResponses([]);
          }
        }
      };
      fetchResponses();
    } else {
      setResponses([]);
    }
  }, [selectedSurveyId]);

  const activeSurvey = surveys.find(s => s.id === selectedSurveyId);

  // ─── Core Calculations ──────────────────────────────────────────────────────
  const getAverageRating = (qId: string): number => {
    if (responses.length === 0) return 0;
    let sum = 0;
    let count = 0;
    responses.forEach(r => {
      const rating = Number(r.answers[qId]);
      if (rating && !isNaN(rating)) {
        sum += rating;
        count++;
      }
    });
    return count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
  };

  const getMultipleChoiceStats = (qId: string, options: string[] = []): Record<string, { count: number; pct: number }> => {
    const stats: Record<string, { count: number; pct: number }> = {};
    options.forEach(opt => {
      stats[opt] = { count: 0, pct: 0 };
    });

    let answeredCount = 0;
    responses.forEach(r => {
      const val = r.answers[qId];
      if (val !== undefined && val !== '') {
        answeredCount++;
        if (stats[val]) {
          stats[val].count++;
        } else {
          stats[val] = { count: 1, pct: 0 };
        }
      }
    });

    if (answeredCount > 0) {
      Object.keys(stats).forEach(key => {
        stats[key].pct = Math.round((stats[key].count / answeredCount) * 100);
      });
    }

    return stats;
  };

  const getYesNoStats = (qId: string): { Yes: { count: number; pct: number }; No: { count: number; pct: number } } => {
    let yesCount = 0;
    let noCount = 0;
    let answeredCount = 0;

    responses.forEach(r => {
      const val = r.answers[qId];
      if (val === 'Yes') {
        yesCount++;
        answeredCount++;
      } else if (val === 'No') {
        noCount++;
        answeredCount++;
      }
    });

    const yesPct = answeredCount > 0 ? Math.round((yesCount / answeredCount) * 100) : 0;
    const noPct = answeredCount > 0 ? Math.round((noCount / answeredCount) * 100) : 0;

    return {
      Yes: { count: yesCount, pct: yesPct },
      No: { count: noCount, pct: noPct }
    };
  };

  // ─── Actions ────────────────────────────────────────────────────────────────
  const handleClearResponses = async () => {
    if (!activeSurvey) return;
    if (!confirm(`Are you sure you want to permanently clear all ${responses.length} responses for "${activeSurvey.title}"?`)) {
      return;
    }
    
    try {
      // 1. Clear in Supabase (primary)
      try {
        const { error } = await supabase
          .from('survey_responses')
          .delete()
          .eq('survey_id', activeSurvey.id);
        
        if (error) {
          console.warn('[Supabase backup Warning] Failed to delete survey responses from Supabase:', error.message);
        }
      } catch (sbErr: any) {
        console.warn('[Supabase backup Error] Failed to delete survey responses from Supabase:', sbErr.message || sbErr);
      }

      // 2. Clear in Firestore (coexistence)
      const colRef = collection(db, 'tools', 'surveyResponses', activeSurvey.id);
      const snapshot = await getDocs(colRef);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      localStorage.removeItem(`infinitykit_responses_${activeSurvey.id}`);
      setResponses([]);
    } catch (e: any) {
      console.error('Failed to delete responses:', e);
      alert('Error deleting responses from cloud: ' + e.message);
    }
  };

  const handleExportCSV = () => {
    if (!activeSurvey || responses.length === 0) return;

    // Headers
    const headers = ['Submission Timestamp', ...activeSurvey.questions.map(q => q.label)];
    
    // Rows
    const rows = responses.map(r => {
      const dateStr = new Date(r.submittedAt).toLocaleString();
      const answers = activeSurvey.questions.map(q => {
        const val = r.answers[q.id];
        return val !== undefined ? String(val) : '';
      });
      return [dateStr, ...answers];
    });

    // Build CSV Content
    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create Download Trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const sanitizedTitle = activeSurvey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute("download", `responses_${sanitizedTitle}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyShareLink = () => {
    if (!activeSurvey) return;
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('You must be signed in to copy the public share link.');
      return;
    }
    
    const shareUrl = `${window.location.origin}/survey-tools/publicsurvey?id=${activeSurvey.id}&uid=${userId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '10px 0', fontFamily: 'inherit' }}>
      {/* ─── Top Header navigation ────────────────────────────────────────────── */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-color)' }}>
            Survey Response Analyst
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Aggregate, audit, and chart user metrics, check horizontal CSS bar scales, and export ledger logs.
          </p>
        </div>

        <button
          onClick={() => { window.location.href = '/survey-tools/mysurveys'; }}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1.5px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            color: 'var(--text-color)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition-smooth)'
          }}
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </button>
      </div>

      {/* ─── Survey Selector bar ─────────────────────────────────────────────── */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '16px 20px', 
          borderRadius: '14px', 
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', whiteSpace: 'nowrap' }}>
            Select Questionnaire:
          </span>
          <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
            <select
              value={selectedSurveyId}
              onChange={(e) => setSelectedSurveyId(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 36px 9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-color)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                fontWeight: 500
              }}
            >
              {surveys.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
              {surveys.length === 0 && (
                <option value="">No custom surveys available</option>
              )}
            </select>
            <ChevronDown 
              size={16} 
              style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                pointerEvents: 'none',
                color: 'var(--text-secondary)'
              }} 
            />
          </div>
        </div>

        {activeSurvey && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={copyShareLink}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: copied ? 'rgba(16,185,129,0.1)' : 'var(--glass-bg)',
                color: copied ? '#10b981' : 'var(--text-color)',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-smooth)'
              }}
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? 'Link Copied!' : 'Copy Form Link'}
            </button>

            <button
              onClick={() => {
                // Trigger state refresh
                const key = `infinitykit_responses_${selectedSurveyId}`;
                const stored = localStorage.getItem(key);
                if (stored) setResponses(JSON.parse(stored));
              }}
              title="Refresh Responses"
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-color)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ─── Empty state checking ────────────────────────────────────────────── */}
      {surveys.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
          <AlertCircle size={40} style={{ color: 'var(--text-secondary)', opacity: 0.4, marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--text-color)' }}>No Surveys Found</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            You haven't built any surveys yet. Create a survey definition using our visual designer first.
          </p>
          <button
            onClick={() => { window.location.href = '/survey-tools/surveybuilder'; }}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--primary-color)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Launch Survey Builder
          </button>
        </div>
      ) : responses.length === 0 ? (
        <div className="glass-panel" style={{ padding: '50px 30px', borderRadius: '16px', textAlign: 'center' }}>
          <HelpCircle size={44} style={{ color: 'var(--text-secondary)', opacity: 0.3, marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--text-color)' }}>No Responses Yet</h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', marginInline: 'auto' }}>
            We couldn't find any submissions under `infinitykit_responses_{selectedSurveyId}`. Share your questionnaire form link to let users log entries.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={copyShareLink}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary-color)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Copy Form Link
            </button>
          </div>
        </div>
      ) : (
        /* Render Full Survey Aggregation and Ledger */
        <div>
          
          {/* Summary Banner metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Answer Logs</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-color)' }}>{responses.length}</span>
            </div>

            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>First Recorded</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-color)' }}>
                {new Date(responses[0].submittedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Latest Recorded</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-color)' }}>
                {new Date(responses[responses.length - 1].submittedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Aggregated Analytical Charts */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="var(--primary-color)" />
              Per-Question Aggregated Analytics
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {activeSurvey?.questions.map((q, idx) => {
                return (
                  <div key={q.id} style={{ borderBottom: idx < activeSurvey.questions.length - 1 ? '1px solid rgba(0,0,0,0.03)' : 'none', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                        Q{idx + 1}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-color)' }}>
                        {q.label}
                      </h4>
                    </div>

                    {/* text response aggregation */}
                    {q.type === 'text' && (
                      <div style={{ background: 'rgba(0,0,0,0.01)', borderRadius: '10px', padding: '12px 16px', maxHeight: '180px', overflowY: 'auto' }}>
                        <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          Open-Text Answers Feed ({responses.filter(r => r.answers[q.id]).length})
                        </span>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {responses.map((r, rIdx) => {
                            const val = r.answers[q.id];
                            if (!val) return null;
                            return (
                              <div key={rIdx} style={{ fontSize: '0.8rem', padding: '6px 8px', background: 'var(--glass-bg)', borderRadius: '6px', borderLeft: '3px solid var(--primary-color)', color: 'var(--text-color)' }}>
                                {val}
                              </div>
                            );
                          })}
                          {responses.every(r => !r.answers[q.id]) && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No open-ended text answers filled for this field.</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* multiple choice stats */}
                    {q.type === 'multiple_choice' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(() => {
                          const stats = getMultipleChoiceStats(q.id, q.options);
                          return Object.entries(stats).map(([opt, stat]) => (
                            <div key={opt}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px', fontWeight: 500 }}>
                                <span style={{ color: 'var(--text-color)' }}>{opt}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{stat.count} vote{stat.count !== 1 ? 's' : ''} ({stat.pct}%)</span>
                              </div>
                              <div style={{ height: '8px', borderRadius: '4px', background: 'var(--glass-border)', overflow: 'hidden' }}>
                                <div 
                                  style={{ 
                                    height: '100%', 
                                    borderRadius: '4px', 
                                    background: 'var(--primary-color)', 
                                    width: `${stat.pct}%`,
                                    transition: 'width 0.4s ease'
                                  }} 
                                />
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    )}

                    {/* rating averages */}
                    {q.type === 'rating' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'center', padding: '14px 20px', borderRadius: '12px', background: 'rgba(0,161,155,0.04)', border: '1px solid var(--glass-border)' }}>
                          <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                            {getAverageRating(q.id)}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Out of 5 Stars</span>
                        </div>

                        <div>
                          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                            {[1, 2, 3, 4, 5].map((star) => {
                              const avg = getAverageRating(q.id);
                              const active = star <= Math.round(avg);
                              return (
                                <Star 
                                  key={star} 
                                  size={20} 
                                  fill={active ? 'var(--primary-color)' : 'none'} 
                                  color={active ? 'var(--primary-color)' : 'var(--glass-border)'} 
                                />
                              );
                            })}
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Based on {responses.filter(r => r.answers[q.id]).length} client rating votes.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* yes_no ratios */}
                    {q.type === 'yes_no' && (
                      <div style={{ display: 'flex', gap: '20px' }}>
                        {(() => {
                          const stats = getYesNoStats(q.id);
                          return (
                            <>
                              <div style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,161,155,0.03)', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px', fontWeight: 600 }}>
                                  <span style={{ color: 'var(--text-color)' }}>Yes 👍</span>
                                  <span style={{ color: 'var(--primary-color)' }}>{stats.Yes.pct}%</span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                  {stats.Yes.count} Vote{stats.Yes.count !== 1 ? 's' : ''}
                                </span>
                                <div style={{ height: '4px', background: 'var(--glass-border)', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', background: 'var(--primary-color)', width: `${stats.Yes.pct}%` }} />
                                </div>
                              </div>

                              <div style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px', fontWeight: 600 }}>
                                  <span style={{ color: 'var(--text-color)' }}>No 👎</span>
                                  <span style={{ color: 'var(--text-secondary)' }}>{stats.No.pct}%</span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                  {stats.No.count} Vote{stats.No.count !== 1 ? 's' : ''}
                                </span>
                                <div style={{ height: '4px', background: 'var(--glass-border)', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', background: 'var(--text-secondary)', width: `${stats.No.pct}%` }} />
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

          {/* Response Ledger Table Grid */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--primary-color)" />
                Individual Response Ledger
              </h3>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleExportCSV}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--primary-color)',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <Download size={13} />
                  Export to CSV
                </button>

                <button
                  onClick={handleClearResponses}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    background: 'rgba(239, 68, 68, 0.05)',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <Trash2 size={13} />
                  Clear Responses
                </button>
              </div>
            </div>

            {/* Responsive Table layout */}
            <div style={{ width: '100%', overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '12px 14px', color: 'var(--text-color)', fontWeight: 600, width: '160px' }}>Submitted Time</th>
                    {activeSurvey?.questions.map(q => (
                      <th key={q.id} style={{ padding: '12px 14px', color: 'var(--text-color)', fontWeight: 600, minWidth: '140px' }}>
                        {q.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.map((row, rIdx) => (
                    <tr 
                      key={rIdx} 
                      style={{ 
                        borderBottom: rIdx < responses.length - 1 ? '1px solid var(--glass-border)' : 'none',
                        background: rIdx % 2 === 1 ? 'rgba(0,0,0,0.01)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(row.submittedAt).toLocaleString()}
                      </td>
                      {activeSurvey?.questions.map(q => {
                        const answer = row.answers[q.id];
                        return (
                          <td key={q.id} style={{ padding: '12px 14px', color: 'var(--text-color)' }}>
                            {q.type === 'rating' && answer ? (
                              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                                <span>{answer}</span>
                                <Star size={12} fill="var(--primary-color)" color="var(--primary-color)" />
                              </div>
                            ) : (
                              answer !== undefined && answer !== '' ? String(answer) : <span style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
