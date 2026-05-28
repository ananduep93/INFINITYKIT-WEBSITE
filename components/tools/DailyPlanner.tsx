'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, Edit3, Download, Clock, X, Check } from 'lucide-react';
import { syncService } from '../../lib/sync';

interface Task {
  id: string;
  hour: number;
  title: string;
  duration: 0.5 | 1 | 2;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6AM–11PM
const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];
const PRIORITY_COLORS: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

const LS_KEY = 'infinitykit_daily_planner';

function formatHour(h: number) {
  if (h === 0 || h === 24) return '12:00 AM';
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return '12:00 PM';
  return `${h - 12}:00 PM`;
}

export default function DailyPlanner() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formHour, setFormHour] = useState(9);
  const [formTitle, setFormTitle] = useState('');
  const [formDuration, setFormDuration] = useState<0.5 | 1 | 2>(1);
  const [formColor, setFormColor] = useState(COLORS[0]);
  const [formPriority, setFormPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [currentMinute, setCurrentMinute] = useState(new Date().getMinutes());
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    syncService.getData(LS_KEY).then(data => {
      if (data) setTasks(data);
    });
    const ticker = setInterval(() => {
      setCurrentHour(new Date().getHours());
      setCurrentMinute(new Date().getMinutes());
    }, 60000);
    return () => clearInterval(ticker);
  }, []);

  const saveTasks = useCallback((updated: Task[]) => {
    setTasks(updated);
    syncService.saveData(LS_KEY, updated);
  }, []);

  const openFormForHour = (h: number) => {
    setFormHour(h);
    setFormTitle('');
    setFormDuration(1);
    setFormColor(COLORS[0]);
    setFormPriority('medium');
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (task: Task) => {
    setFormHour(task.hour);
    setFormTitle(task.title);
    setFormDuration(task.duration);
    setFormColor(task.color);
    setFormPriority(task.priority);
    setEditingId(task.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;
    if (editingId) {
      saveTasks(tasks.map(t => t.id === editingId
        ? { ...t, hour: formHour, title: formTitle, duration: formDuration, color: formColor, priority: formPriority }
        : t));
    } else {
      const newTask: Task = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        hour: formHour, title: formTitle, duration: formDuration, color: formColor, priority: formPriority
      };
      saveTasks([...tasks, newTask]);
    }
    setShowForm(false);
  };

  const deleteTask = (id: string) => saveTasks(tasks.filter(t => t.id !== id));

  const exportDay = () => {
    const lines = HOURS.map(h => {
      const hourTasks = tasks.filter(t => t.hour === h);
      if (!hourTasks.length) return `${formatHour(h)} — Free`;
      return hourTasks.map(t => `${formatHour(h)} [${t.priority.toUpperCase()}] ${t.title} (${t.duration}h)`).join('\n');
    });
    const blob = new Blob([`Daily Plan — ${new Date().toDateString()}\n\n` + lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'daily-plan.txt'; a.click();
  };

  const SLOT_HEIGHT = 72; // px per hour

  // Current time indicator position (relative to 6AM)
  const indicatorTop = (currentHour - 6 + currentMinute / 60) * SLOT_HEIGHT;
  const showIndicator = currentHour >= 6 && currentHour <= 23;

  return (
    <div style={{ padding: '10px 0', fontFamily: 'inherit' }}>
      {/* Header */}
      <div className="glass-panel" style={{ marginBottom: '20px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>📅 Daily Planner Hub</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportDay} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-color)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'var(--transition-smooth)' }}>
            <Download size={15} /> Export
          </button>
          <button onClick={() => openFormForHour(currentHour >= 6 ? currentHour : 9)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: 'none', background: 'var(--primary-color)', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>{editingId ? 'Edit Task' : 'Add Task'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>TITLE</label>
                <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Morning workout" className="form-input" autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>HOUR</label>
                  <select value={formHour} onChange={e => setFormHour(Number(e.target.value))} className="form-select">
                    {HOURS.map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>DURATION</label>
                  <select value={formDuration} onChange={e => setFormDuration(Number(e.target.value) as 0.5 | 1 | 2)} className="form-select">
                    <option value={0.5}>30 min</option>
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>PRIORITY</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['high', 'medium', 'low'] as const).map(p => (
                    <button key={p} onClick={() => setFormPriority(p)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `2px solid ${formPriority === p ? PRIORITY_COLORS[p] : 'var(--glass-border)'}`, background: formPriority === p ? PRIORITY_COLORS[p] + '22' : 'transparent', color: formPriority === p ? PRIORITY_COLORS[p] : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.2s' }}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>COLOR TAG</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setFormColor(c)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: formColor === c ? '3px solid var(--text-color)' : '3px solid transparent', cursor: 'pointer', transition: 'transform 0.2s', transform: formColor === c ? 'scale(1.2)' : 'scale(1)' }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button onClick={handleSave} style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: formColor, color: 'white', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Check size={16} /> Save Task</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
        <div ref={timelineRef} style={{ position: 'relative', minWidth: '340px' }}>
          {/* Current time red line */}
          {showIndicator && (
            <div style={{ position: 'absolute', top: `${indicatorTop}px`, left: 0, right: 0, zIndex: 10, pointerEvents: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                <div style={{ flex: 1, height: '2px', background: '#ef4444', opacity: 0.8 }} />
                <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {`${currentHour % 12 || 12}:${String(currentMinute).padStart(2, '0')} ${currentHour < 12 ? 'AM' : 'PM'}`}
                </span>
              </div>
            </div>
          )}

          {HOURS.map((h) => {
            const hourTasks = tasks.filter(t => t.hour === h);
            return (
              <div key={h} style={{ display: 'flex', height: `${SLOT_HEIGHT}px`, borderBottom: '1px dashed var(--glass-border)' }}>
                {/* Time label */}
                <div style={{ width: '72px', flexShrink: 0, display: 'flex', alignItems: 'flex-start', paddingTop: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatHour(h)}</span>
                </div>

                {/* Slot area */}
                <div
                  onClick={() => !hourTasks.length && openFormForHour(h)}
                  style={{ flex: 1, padding: '4px 6px', cursor: hourTasks.length ? 'default' : 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px', transition: 'background 0.2s', borderRadius: '6px' }}
                  onMouseEnter={e => { if (!hourTasks.length) (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.05)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {hourTasks.length === 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.75rem', opacity: 0.5, gap: '5px' }}>
                      <Plus size={12} /> Click to add
                    </div>
                  )}
                  {hourTasks.map(task => (
                    <div key={task.id} style={{ background: task.color + '22', borderLeft: `4px solid ${task.color}`, borderRadius: '6px', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: task.color }}>{task.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <Clock size={10} /> {task.duration === 0.5 ? '30 min' : `${task.duration}h`}
                          <span style={{ background: PRIORITY_COLORS[task.priority] + '33', color: PRIORITY_COLORS[task.priority], padding: '1px 6px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 700 }}>{task.priority}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => openEditForm(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}><Edit3 size={13} /></button>
                        <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Footer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginTop: '16px' }}>
        {[
          { label: 'Total Tasks', value: tasks.length },
          { label: 'High Priority', value: tasks.filter(t => t.priority === 'high').length, color: '#ef4444' },
          { label: 'Hours Planned', value: tasks.reduce((s, t) => s + t.duration, 0) },
        ].map(stat => (
          <div key={stat.label} className="glass-panel" style={{ padding: '16px', textAlign: 'center', margin: 0 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color || 'var(--primary-color)' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
