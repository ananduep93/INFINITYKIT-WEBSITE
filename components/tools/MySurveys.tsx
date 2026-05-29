'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  BarChart3, 
  PlusCircle, 
  Calendar, 
  ClipboardList, 
  Inbox, 
  Eye, 
  Link
} from 'lucide-react';

import { syncService } from '../../lib/sync';
import { db } from '../../lib/firebase';
import { supabase } from '../../lib/supabase';
import { collection, getDocs } from 'firebase/firestore';

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

export default function MySurveys() {
  const [surveys, setSurveys] = useState<SavedSurvey[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  // ─── Load Surveys and Response Tallies ──────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      syncService.getData('infinitykit_surveys').then((data) => {
        if (data) {
          try {
            const parsedSurveys: SavedSurvey[] = typeof data === 'string' ? JSON.parse(data) : data;
            setSurveys(parsedSurveys);
            
            // Query counts from Supabase first
            parsedSurveys.forEach(async (survey) => {
              try {
                const { count, error } = await supabase
                  .from('survey_responses')
                  .select('id', { count: 'exact', head: true })
                  .eq('survey_id', survey.id);

                if (!error && count !== null) {
                  setCounts(prev => ({ ...prev, [survey.id]: count }));
                } else {
                  throw new Error(error?.message || 'Empty count');
                }
              } catch (e) {
                // Fallback to Firestore
                try {
                  const colRef = collection(db, 'tools', 'surveyResponses', survey.id);
                  const snapshot = await getDocs(colRef);
                  setCounts(prev => ({ ...prev, [survey.id]: snapshot.size }));
                } catch (fbErr) {
                  console.warn(`Could not fetch cloud count for survey ${survey.id}:`, fbErr);
                  // Local fallback count
                  const responsesKey = `infinitykit_responses_${survey.id}`;
                  const local = localStorage.getItem(responsesKey);
                  try {
                    const localCount = local ? JSON.parse(local).length : 0;
                    setCounts(prev => ({ ...prev, [survey.id]: localCount }));
                  } catch {
                    setCounts(prev => ({ ...prev, [survey.id]: 0 }));
                  }
                }
              }
            });
          } catch (e) {
            console.error('Failed to parse surveys:', e);
          }
        }
      });
    }
  }, []);

  // ─── Actions ────────────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this survey and all of its responses? This cannot be undone.')) {
      return;
    }
    
    const updated = surveys.filter(s => s.id !== id);
    setSurveys(updated);
    localStorage.setItem('infinitykit_surveys', JSON.stringify(updated));
    
    // Clean up responses
    localStorage.removeItem(`infinitykit_responses_${id}`);
    
    // Update tallies
    const newCounts = { ...counts };
    delete newCounts[id];
    setCounts(newCounts);
  };

  const handleEdit = (id: string) => {
    window.location.href = `/survey-tools/surveybuilder?edit=${id}`;
  };

  const handleViewResponses = (id: string) => {
    window.location.href = `/survey-tools/responseviewer?surveyId=${id}`;
  };

  const copyShareLink = (survey: SavedSurvey) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('You must be signed in to copy the public share link.');
      return;
    }
    
    const shareUrl = `${window.location.origin}/survey-tools/publicsurvey?id=${survey.id}&uid=${userId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(survey.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ padding: '10px 0', fontFamily: 'inherit' }}>
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-color)' }}>
            My Surveys Dashboard
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Manage active custom surveys, view response counts, and copy shareable web links.
          </p>
        </div>

        <button
          onClick={() => { window.location.href = '/survey-tools/surveybuilder'; }}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, #00d2c4 100%)',
            color: '#fff',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0, 161, 155, 0.25)',
            transition: 'var(--transition-smooth)'
          }}
        >
          <Plus size={16} />
          Create New Survey
        </button>
      </div>

      {/* ─── Dashboard Stats Grid ────────────────────────────────────────────── */}
      {surveys.length > 0 && (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '16px', 
            marginBottom: '28px' 
          }}
        >
          <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0, 161, 155, 0.1)', color: 'var(--primary-color)' }}>
              <ClipboardList size={22} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Surveys</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-color)' }}>{surveys.length}</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8' }}>
              <BarChart3 size={22} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Submissions</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-color)' }}>
                {Object.values(counts).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Surveys Listing / Empty State ────────────────────────────────────── */}
      {surveys.length === 0 ? (
        /* Empty State */
        <div 
          className="glass-panel" 
          style={{ 
            textAlign: 'center', 
            padding: '60px 40px', 
            borderRadius: '20px',
            maxWidth: '560px',
            margin: '40px auto'
          }}
        >
          <div 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'var(--glass-bg)', 
              border: '1.5px dashed var(--glass-border)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 20px',
              color: 'var(--text-secondary)'
            }}
          >
            <Inbox size={36} style={{ opacity: 0.5 }} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-color)', margin: '0 0 8px 0' }}>
            No surveys created yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 24px 0' }}>
            Get started by launching our drag-and-drop Visual Survey Builder. Once created, you can instantly share the form and collect local responses!
          </p>
          <button
            onClick={() => { window.location.href = '/survey-tools/surveybuilder'; }}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--primary-color)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto',
              transition: 'var(--transition-smooth)'
            }}
          >
            <PlusCircle size={18} />
            Create Your First Survey
          </button>
        </div>
      ) : (
        /* Survey Card Layout */
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '20px' 
          }}
        >
          {surveys.map((survey) => {
            const responseCount = counts[survey.id] || 0;
            return (
              <div 
                key={survey.id} 
                className="glass-panel" 
                style={{ 
                  borderRadius: '16px', 
                  padding: '22px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Title & Date */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <h3 
                      style={{ 
                        margin: 0, 
                        fontSize: '1.15rem', 
                        fontWeight: 700, 
                        color: 'var(--text-color)', 
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '80%'
                      }}
                      title={survey.title}
                    >
                      {survey.title}
                    </h3>
                    
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        padding: '3px 8px', 
                        borderRadius: '20px', 
                        background: 'rgba(0, 161, 155, 0.1)', 
                        color: 'var(--primary-color)',
                        fontWeight: 600
                      }}
                    >
                      ID: {survey.id.split('_')[1] || survey.id}
                    </span>
                  </div>

                  <p 
                    style={{ 
                      margin: '6px 0 12px 0', 
                      fontSize: '0.8rem', 
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: '2.8em'
                    }}
                  >
                    {survey.description || 'No description provided.'}
                  </p>

                  {/* Metrics Badge Panel */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={13} />
                      {survey.createdAt || 'N/A'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <ClipboardList size={13} />
                      {survey.questions.length} Question{survey.questions.length !== 1 ? 's' : ''}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <BarChart3 size={13} />
                      {responseCount} Response{responseCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Dashboard Actions */}
                <div 
                  style={{ 
                    borderTop: '1px solid var(--glass-border)', 
                    paddingTop: '14px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleEdit(survey.id)}
                      title="Edit Survey"
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <Edit size={14} />
                    </button>
                    
                    <button
                      onClick={() => copyShareLink(survey)}
                      title="Copy Share Link"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: copiedId === survey.id ? '1px solid #10b981' : '1px solid var(--glass-border)',
                        background: copiedId === survey.id ? 'rgba(16,185,129,0.1)' : 'var(--glass-bg)',
                        color: copiedId === survey.id ? '#10b981' : 'var(--text-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      {copiedId === survey.id ? <Check size={13} /> : <Share2 size={13} />}
                      {copiedId === survey.id ? 'Copied!' : 'Share'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleViewResponses(survey.id)}
                      disabled={responseCount === 0}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: responseCount === 0 ? 'rgba(0,0,0,0.05)' : 'var(--primary-color)',
                        color: responseCount === 0 ? 'var(--text-secondary)' : '#fff',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        cursor: responseCount === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: responseCount === 0 ? 0.5 : 1,
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <BarChart3 size={13} />
                      View Answers
                    </button>

                    <button
                      onClick={() => handleDelete(survey.id)}
                      title="Delete Survey"
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        background: 'rgba(239, 68, 68, 0.05)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
