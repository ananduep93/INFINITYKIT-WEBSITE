'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Share2, 
  Save, 
  Eye, 
  Settings, 
  Check, 
  Copy, 
  X, 
  ChevronUp, 
  ChevronDown, 
  List, 
  Star, 
  HelpCircle, 
  FileText,
  Type,
  AlertCircle
} from 'lucide-react';

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

interface SavedSurvey extends SurveyConfig {
  createdAt: string;
}

export default function SurveyBuilder() {
  const [surveyId, setSurveyId] = useState<string>('');
  const [title, setTitle] = useState<string>('Untitled Survey');
  const [description, setDescription] = useState<string>('Please take a moment to complete this feedback form.');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Status feedback states
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // ─── Load for Editing or New Survey ─────────────────────────────────────────
  useEffect(() => {
    // Generate a unique ID for new surveys by default
    const newId = 'survey_' + Math.random().toString(36).substr(2, 9);
    
    // Check if we are editing an existing survey
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get('edit');
      
      if (editId) {
        const storedSurveys = localStorage.getItem('infinitykit_surveys');
        if (storedSurveys) {
          try {
            const surveys: SavedSurvey[] = JSON.parse(storedSurveys);
            const target = surveys.find(s => s.id === editId);
            if (target) {
              setSurveyId(target.id);
              setTitle(target.title);
              setDescription(target.description || '');
              setQuestions(target.questions || []);
              return;
            }
          } catch (e) {
            console.error('Error parsing stored surveys:', e);
          }
        }
      }
      setSurveyId(newId);
    }
  }, []);

  // ─── Question Operations ────────────────────────────────────────────────────
  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type,
      label: type === 'text' ? 'What are your thoughts?' : 
             type === 'multiple_choice' ? 'Select the option that best describes your choice:' :
             type === 'rating' ? 'How would you rate this service?' : 
             'Do you agree with this statement?',
      required: false,
      options: type === 'multiple_choice' ? ['Option 1', 'Option 2'] : undefined
    };

    setQuestions([...questions, newQuestion]);
    setEditingIndex(questions.length); // Open the editor panel for this question
    clearStatus();
  };

  const deleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
    clearStatus();
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
    clearStatus();
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[swapIndex];
    updated[swapIndex] = temp;

    setQuestions(updated);
    if (editingIndex === index) {
      setEditingIndex(swapIndex);
    } else if (editingIndex === swapIndex) {
      setEditingIndex(index);
    }
    clearStatus();
  };

  // ─── Option Operations (Multiple Choice Only) ──────────────────────────────
  const addOption = (qIndex: number) => {
    const q = questions[qIndex];
    const options = q.options ? [...q.options] : [];
    options.push(`Option ${options.length + 1}`);
    updateQuestion(qIndex, { options });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const q = questions[qIndex];
    if (!q.options) return;
    const options = q.options.filter((_, i) => i !== optIndex);
    updateQuestion(qIndex, { options });
  };

  const updateOptionText = (qIndex: number, optIndex: number, val: string) => {
    const q = questions[qIndex];
    if (!q.options) return;
    const options = [...q.options];
    options[optIndex] = val;
    updateQuestion(qIndex, { options });
  };

  // ─── Save & Share Actions ───────────────────────────────────────────────────
  const clearStatus = () => {
    setSaveStatus({ type: null, message: '' });
    setShareUrl('');
    setCopied(false);
  };

  const saveSurvey = () => {
    if (!title.trim()) {
      setSaveStatus({ type: 'error', message: 'Survey title is required.' });
      return;
    }

    if (questions.length === 0) {
      setSaveStatus({ type: 'error', message: 'Please add at least one question.' });
      return;
    }

    try {
      const storedSurveys = localStorage.getItem('infinitykit_surveys');
      let surveys: SavedSurvey[] = storedSurveys ? JSON.parse(storedSurveys) : [];

      const existingIndex = surveys.findIndex(s => s.id === surveyId);
      
      const surveyData: SavedSurvey = {
        id: surveyId,
        title: title.trim(),
        description: description.trim(),
        questions,
        createdAt: existingIndex >= 0 ? surveys[existingIndex].createdAt : new Date().toLocaleDateString()
      };

      if (existingIndex >= 0) {
        surveys[existingIndex] = surveyData;
      } else {
        surveys.push(surveyData);
      }

      localStorage.setItem('infinitykit_surveys', JSON.stringify(surveys));
      setSaveStatus({ type: 'success', message: 'Survey saved successfully! Manage it on your Dashboard.' });
    } catch (e) {
      setSaveStatus({ type: 'error', message: 'Error saving survey to storage.' });
    }
  };

  const generateShareLink = () => {
    if (questions.length === 0) {
      setSaveStatus({ type: 'error', message: 'Add questions before sharing.' });
      return;
    }

    const config: SurveyConfig = {
      id: surveyId || 'survey_' + Math.random().toString(36).substr(2, 9),
      title: title.trim() || 'Custom Survey',
      description: description.trim(),
      questions
    };

    try {
      const jsonString = JSON.stringify(config);
      const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
      const url = `${window.location.origin}/tools/publicsurvey#${base64Data}`;
      setShareUrl(url);
    } catch (e) {
      setSaveStatus({ type: 'error', message: 'Failed to encode survey definition.' });
    }
  };

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '10px 0', fontFamily: 'inherit' }}>
      {/* ─── Header Navigation ────────────────────────────────────────────────── */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-color)' }}>
            Custom Survey Builder
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Build responsive feedback questionnaires, view dynamic previews, and share zero-db links.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              color: 'var(--text-color)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition-smooth)'
            }}
          >
            <Eye size={15} />
            {isPreviewMode ? 'Edit Mode' : 'Live Preview'}
          </button>
          
          <button
            onClick={saveSurvey}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary-color) 0%, #00d2c4 100%)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0, 161, 155, 0.2)',
              transition: 'var(--transition-smooth)'
            }}
          >
            <Save size={15} />
            Save Survey
          </button>

          <button
            onClick={generateShareLink}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1.5px solid var(--primary-color)',
              background: 'transparent',
              color: 'var(--primary-color)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition-smooth)'
            }}
          >
            <Share2 size={15} />
            Share Survey
          </button>
        </div>
      </div>

      {/* ─── Feedback Banners ─────────────────────────────────────────────────── */}
      {saveStatus.type && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            background: saveStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${saveStatus.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            color: saveStatus.type === 'success' ? '#10b981' : '#ef4444',
          }}
        >
          {saveStatus.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {shareUrl && (
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)' }}>
              🎉 Zero-Database Shareable Link Generated!
            </span>
            <button 
              onClick={() => setShareUrl('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            This link contains the entire survey config encoded. Direct anyone here to fill it out and write their responses directly to local storage!
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <input
              type="text"
              readOnly
              value={shareUrl}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.05)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
            <button
              onClick={copyToClipboard}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: copied ? '#10b981' : 'var(--primary-color)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minWidth: '95px',
                justifyContent: 'center',
                transition: 'var(--transition-smooth)'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      )}

      {/* ─── Editor Grid ──────────────────────────────────────────────────────── */}
      {isPreviewMode ? (
        /* Full Page Preview */
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-color)' }}>{title}</h1>
            {description && <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.95rem', lineHeight: 1.5 }}>{description}</p>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {questions.map((q, idx) => (
              <div key={q.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-color)', margin: '0 0 12px 0' }}>
                  {idx + 1}. {q.label} {q.required && <span style={{ color: '#ef4444' }}>*</span>}
                </h3>
                
                {q.type === 'text' && (
                  <textarea 
                    placeholder="Type your response here..." 
                    rows={3} 
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-color)',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                )}

                {q.type === 'yes_no' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '8px 24px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-color)', cursor: 'pointer' }}>Yes</button>
                    <button style={{ padding: '8px 24px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-color)', cursor: 'pointer' }}>No</button>
                  </div>
                )}

                {q.type === 'rating' && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={24} color="var(--glass-border)" style={{ cursor: 'pointer' }} />
                    ))}
                  </div>
                )}

                {q.type === 'multiple_choice' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(q.options || []).map((opt, oIdx) => (
                      <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name={q.id} style={{ accentColor: 'var(--primary-color)' }} />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {questions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <HelpCircle size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ margin: 0 }}>This survey has no questions yet. Go to Edit Mode to build it.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Builder Grid Split View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Left Column: Questionnaire Builder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Meta Section */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={18} color="var(--primary-color)" />
                Survey Settings
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Survey Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); clearStatus(); }}
                    placeholder="e.g. User Experience Survey"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-color)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Description / Subtitle
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); clearStatus(); }}
                    placeholder="Provide context or guidelines for respondents..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-color)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Questions Builder list */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-color)' }}>
                  Questions ({questions.length})
                </h3>
              </div>

              {questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    No questions added. Click a button below to get started!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {questions.map((q, idx) => {
                    const isEditing = editingIndex === idx;
                    return (
                      <div 
                        key={q.id}
                        style={{ 
                          borderRadius: '10px', 
                          border: isEditing ? '1.5px solid var(--primary-color)' : '1px solid var(--glass-border)',
                          background: 'rgba(255,255,255,0.02)',
                          overflow: 'hidden',
                          transition: 'var(--transition-smooth)'
                        }}
                      >
                        {/* Header bar of question block */}
                        <div 
                          style={{ 
                            padding: '10px 14px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            cursor: 'pointer',
                            background: isEditing ? 'rgba(0,161,155,0.05)' : 'transparent'
                          }}
                          onClick={() => setEditingIndex(isEditing ? null : idx)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', minWidth: '18px' }}>
                              #{idx + 1}
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {q.label}
                            </span>
                            <span style={{ 
                              fontSize: '0.65rem', 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              background: 'var(--glass-border)', 
                              color: 'var(--text-secondary)',
                              marginLeft: '6px'
                            }}>
                              {q.type.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => moveQuestion(idx, 'up')} 
                              disabled={idx === 0}
                              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '4px', opacity: idx === 0 ? 0.3 : 1 }}
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button 
                              onClick={() => moveQuestion(idx, 'down')} 
                              disabled={idx === questions.length - 1}
                              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: idx === questions.length - 1 ? 'not-allowed' : 'pointer', padding: '4px', opacity: idx === questions.length - 1 ? 0.3 : 1 }}
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button 
                              onClick={() => deleteQuestion(idx)} 
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Editor inputs under expanded question */}
                        {isEditing && (
                          <div style={{ padding: '14px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                Question Label
                              </label>
                              <input
                                type="text"
                                value={q.label}
                                onChange={(e) => updateQuestion(idx, { label: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--glass-border)',
                                  background: 'var(--glass-bg)',
                                  color: 'var(--text-color)',
                                  fontSize: '0.8rem',
                                  outline: 'none',
                                  boxSizing: 'border-box'
                                }}
                              />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="checkbox"
                                id={`req_${q.id}`}
                                checked={!!q.required}
                                onChange={(e) => updateQuestion(idx, { required: e.target.checked })}
                                style={{ accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                              />
                              <label htmlFor={`req_${q.id}`} style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-color)', cursor: 'pointer' }}>
                                Required Field
                              </label>
                            </div>

                            {/* Multiple Choice specific option editors */}
                            {q.type === 'multiple_choice' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                                  Answer Choices
                                </label>
                                {(q.options || []).map((opt, oIdx) => (
                                  <div key={oIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => updateOptionText(idx, oIdx, e.target.value)}
                                      style={{
                                        flex: 1,
                                        padding: '6px 8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'var(--glass-bg)',
                                        color: 'var(--text-color)',
                                        fontSize: '0.75rem',
                                        outline: 'none'
                                      }}
                                    />
                                    <button
                                      onClick={() => removeOption(idx, oIdx)}
                                      disabled={(q.options || []).length <= 2}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: (q.options || []).length <= 2 ? 'not-allowed' : 'pointer',
                                        opacity: (q.options || []).length <= 2 ? 0.3 : 1
                                      }}
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => addOption(idx)}
                                  style={{
                                    alignSelf: 'flex-start',
                                    marginTop: '4px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary-color)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Plus size={12} />
                                  Add Choice
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Question Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  + Add Question Type:
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <button
                    onClick={() => addQuestion('text')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-color)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <Type size={13} color="var(--primary-color)" />
                    Short Text
                  </button>

                  <button
                    onClick={() => addQuestion('multiple_choice')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-color)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <List size={13} color="var(--primary-color)" />
                    Multiple Choice
                  </button>

                  <button
                    onClick={() => addQuestion('rating')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-color)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <Star size={13} color="var(--primary-color)" />
                    Star Rating (1-5)
                  </button>

                  <button
                    onClick={() => addQuestion('yes_no')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-color)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <HelpCircle size={13} color="var(--primary-color)" />
                    Yes / No Select
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Mock Preview (Sticky) */}
          <div style={{ position: 'sticky', top: '20px', alignSelf: 'start' }}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '16px',
                  borderBottom: '1px solid var(--glass-border)',
                  paddingBottom: '10px'
                }}
              >
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={16} color="var(--primary-color)" />
                  Live Mobile/Web Preview
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                  Active Preview
                </span>
              </div>

              {/* Title Block */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-color)', margin: '0 0 4px 0' }}>
                  {title || 'Untitled Survey'}
                </h2>
                {description && (
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {description}
                  </p>
                )}
              </div>

              {/* Render Question Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                {questions.map((q, idx) => (
                  <div 
                    key={q.id} 
                    style={{ 
                      padding: '12px 14px', 
                      borderRadius: '8px', 
                      background: 'rgba(0,0,0,0.02)', 
                      border: '1px solid var(--glass-border)' 
                    }}
                  >
                    <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '8px' }}>
                      {idx + 1}. {q.label} {q.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </span>

                    {/* text preview */}
                    {q.type === 'text' && (
                      <input 
                        type="text" 
                        disabled 
                        placeholder="Short answer text placeholder..." 
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--glass-border)',
                          background: 'rgba(255,255,255,0.03)',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}

                    {/* multiple choice preview */}
                    {q.type === 'multiple_choice' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(q.options || []).map((opt, oIdx) => (
                          <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px solid var(--glass-border)', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* rating preview */}
                    {q.type === 'rating' && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={16} color="var(--glass-border)" />
                        ))}
                      </div>
                    )}

                    {/* yes no preview */}
                    {q.type === 'yes_no' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <div style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid var(--glass-border)', fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--glass-bg)' }}>Yes</div>
                        <div style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid var(--glass-border)', fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--glass-bg)' }}>No</div>
                      </div>
                    )}
                  </div>
                ))}

                {questions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>
                    <HelpCircle size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Questions added will preview here in real-time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
