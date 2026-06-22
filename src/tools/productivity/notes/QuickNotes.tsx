'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, BookOpen, FileText, Cloud, Check } from 'lucide-react';
import { useSync } from '../../../hooks/useSync';
import ReusableLoading from '../../../components/ui/ReusableLoading';

interface NoteItem {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}

export default function QuickNotes() {
  const { data, saveData, loading } = useSync('quicknotes');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingBody, setEditingBody] = useState('');
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const notes: NoteItem[] = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  // Set first note active if none selected
  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId]);

  // Sync editing fields with active note selection
  useEffect(() => {
    const activeNote = notes.find(n => n.id === activeNoteId);
    if (activeNote) {
      setEditingTitle(activeNote.title);
      setEditingBody(activeNote.body);
    } else {
      setEditingTitle('');
      setEditingBody('');
    }
  }, [activeNoteId, notes]);

  // Auto-save logic
  useEffect(() => {
    if (!activeNoteId) return;
    const activeNote = notes.find(n => n.id === activeNoteId);
    if (!activeNote) return;

    if (editingTitle === activeNote.title && editingBody === activeNote.body) {
      return;
    }

    setSavingState('saving');
    const timer = setTimeout(async () => {
      const updatedNotes = notes.map(n => 
        n.id === activeNoteId 
          ? { ...n, title: editingTitle, body: editingBody, updatedAt: Date.now() }
          : n
      );
      await saveData(updatedNotes);
      setSavingState('saved');
      setTimeout(() => setSavingState('idle'), 1500);
    }, 1000);

    return () => clearTimeout(timer);
  }, [editingTitle, editingBody, activeNoteId, saveData]);

  const handleCreateNote = async () => {
    const newNote: NoteItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Untitled Note',
      body: '',
      updatedAt: Date.now()
    };
    const updated = [newNote, ...notes];
    await saveData(updated);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this note permanently?')) {
      const updated = notes.filter(n => n.id !== id);
      await saveData(updated);
      if (activeNoteId === id) {
        setActiveNoteId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  if (loading) {
    return <ReusableLoading type="skeleton" count={3} />;
  }

  const activeNote = notes.find(n => n.id === activeNoteId);

  return (
    <div className="glass-panel quicknotes-container" style={{ margin: '0 auto', display: 'grid', gap: '20px', padding: '25px', minHeight: '500px' }}>
      
      {/* Sidebar - Note list */}
      <div className="quicknotes-sidebar" style={{ borderRight: '1px solid var(--glass-border)', paddingRight: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 700 }}>Notes</h3>
          <button
            onClick={handleCreateNote}
            className="btn"
            style={{ padding: '6px 12px', borderRadius: '15px', fontSize: '0.75rem' }}
          >
            <Plus size={14} /> New
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, maxHeight: '400px' }}>
          {notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: activeNoteId === note.id ? 'rgba(0, 161, 155, 0.08)' : 'transparent',
                  border: activeNoteId === note.id ? '1px solid rgba(0, 161, 155, 0.2)' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '85%' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-color)' }}>
                    {note.title || 'Untitled Note'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteNote(note.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--error-color)',
                    opacity: 0.5,
                    padding: '2px'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              No notes. Click 'New' to write.
            </div>
          )}
        </div>
      </div>

      {/* Workspace - Note editing */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {activeNote ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 600 }}>
                <Cloud size={14} /> Auto-Syncing
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {savingState === 'saving' && 'Saving changes...'}
                {savingState === 'saved' && (
                  <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={12} /> Draft Saved
                  </span>
                )}
              </div>
            </div>

            <input
              type="text"
              placeholder="Note Title"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.6rem',
                fontWeight: 700,
                border: 'none',
                background: 'transparent',
                color: 'var(--text-color)',
                outline: 'none',
                width: '100%',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--glass-border)'
              }}
            />

            <textarea
              placeholder="Start writing..."
              value={editingBody}
              onChange={(e) => setEditingBody(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                color: 'var(--text-color)',
                outline: 'none',
                width: '100%',
                resize: 'none',
                fontSize: '1rem',
                lineHeight: 1.6,
                minHeight: '300px'
              }}
            />
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <FileText size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
            <h4 style={{ fontWeight: 600 }}>No active note selection</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>Select an existing note or build a new one to begin editing.</p>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .quicknotes-container {
          grid-template-columns: 250px 1fr;
        }
        @media (max-width: 768px) {
          .quicknotes-container {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
            min-height: auto !important;
          }
          .quicknotes-sidebar {
            border-right: none !important;
            border-bottom: 1px solid var(--glass-border) !important;
            padding-right: 0 !important;
            padding-bottom: 20px !important;
          }
        }
      `}} />
    </div>
  );
}
