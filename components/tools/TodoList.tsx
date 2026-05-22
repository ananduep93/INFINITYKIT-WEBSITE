'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Save, Cloud, Search, Clipboard } from 'lucide-react';
import { useSync } from '../../hooks/useSync';
import ReusableLoading from '../ui/ReusableLoading';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export default function TodoList() {
  const { data, saveData, loading } = useSync('todolist');
  const [newText, setNewText] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState('');

  const todos: TodoItem[] = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newItem: TodoItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newText.trim(),
      completed: false,
      createdAt: Date.now()
    };

    const updated = [newItem, ...todos];
    await saveData(updated);
    setNewText('');
  };

  const handleToggle = async (id: string) => {
    const updated = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    await saveData(updated);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const updated = todos.filter(todo => todo.id !== id);
      await saveData(updated);
    }
  };

  const handleClearCompleted = async () => {
    if (confirm('Remove all completed tasks?')) {
      const updated = todos.filter(todo => !todo.completed);
      await saveData(updated);
    }
  };

  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(search.toLowerCase());
      if (filter === 'completed') return todo.completed && matchesSearch;
      if (filter === 'pending') return !todo.completed && matchesSearch;
      return matchesSearch;
    });
  }, [todos, filter, search]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    return {
      total,
      completed,
      pending: total - completed
    };
  }, [todos]);

  if (loading) {
    return <ReusableLoading type="skeleton" count={3} />;
  }

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800 }}>Todo List Manager</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Secure task manager with real-time Firebase syncing.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 600 }}>
          <Cloud size={16} /> Cloud Synced
        </div>
      </div>

      {/* Stats Counter */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ background: 'rgba(0, 161, 155, 0.05)', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-color)' }}>{stats.total}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Tasks</div>
        </div>
        <div style={{ background: 'rgba(40, 167, 69, 0.05)', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success-color)' }}>{stats.completed}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Completed</div>
        </div>
        <div style={{ background: 'rgba(220, 53, 69, 0.05)', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--error-color)' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pending</div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="form-input"
          style={{ flex: 1, borderRadius: '25px' }}
        />
        <button type="submit" className="btn" style={{ padding: '10px 22px', borderRadius: '25px' }}>
          <Plus size={18} /> Add
        </button>
      </form>

      {/* Filters and Search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '250px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ padding: '8px 12px 8px 32px', fontSize: '0.85rem', borderRadius: '20px' }}
          />
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'pending', 'completed'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              style={{
                padding: '6px 14px',
                borderRadius: '15px',
                border: '1px solid var(--glass-border)',
                background: filter === mode ? 'var(--primary-color)' : 'transparent',
                color: filter === mode ? 'white' : 'var(--text-color)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
        {filteredTodos.length > 0 ? (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                transition: 'var(--transition-smooth)'
              }}
            >
              <div
                onClick={() => handleToggle(todo.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                {todo.completed ? (
                  <CheckCircle size={20} color="var(--primary-color)" />
                ) : (
                  <Circle size={20} color="var(--text-secondary)" />
                )}
                <span
                  style={{
                    fontSize: '0.95rem',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    opacity: todo.completed ? 0.6 : 1,
                    transition: 'all 0.2s',
                    color: 'var(--text-color)'
                  }}
                >
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => handleDelete(todo.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--error-color)',
                  opacity: 0.7,
                  padding: '4px',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {todos.length === 0 ? "You're all caught up! Add a task to get started." : "No tasks match your filters."}
          </div>
        )}
      </div>

      {/* Footer controls */}
      {stats.completed > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
          <button
            onClick={handleClearCompleted}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '15px' }}
          >
            Clear Completed
          </button>
        </div>
      )}
    </div>
  );
}
