'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Check, Calendar } from 'lucide-react';
import { syncService } from '../../../lib/sync';

interface CalEvent {
  id: string;
  title: string;
  time: string;
  color: string;
  notes: string;
}

interface CalendarData {
  [dateKey: string]: CalEvent[];
}

const LS_KEY = 'infinitykit_calendar_events';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444'];

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

export default function InteractiveCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [data, setData] = useState<CalendarData>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('09:00');
  const [formColor, setFormColor] = useState(COLORS[0]);
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    syncService.getData(LS_KEY).then(res => {
      if (res) setData(res);
    });
  }, []);

  const saveData = useCallback((updated: CalendarData) => {
    setData(updated);
    syncService.saveData(LS_KEY, updated);
  }, []);

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  const handleDayClick = (day: number) => {
    const key = toKey(year, month, day);
    setSelectedDate(key);
    setShowForm(false);
  };

  const addEvent = () => {
    if (!formTitle.trim() || !selectedDate) return;
    const ev: CalEvent = { id: `${Date.now()}`, title: formTitle, time: formTime, color: formColor, notes: formNotes };
    const updated = { ...data, [selectedDate]: [...(data[selectedDate] || []), ev] };
    saveData(updated);
    setFormTitle(''); setFormTime('09:00'); setFormColor(COLORS[0]); setFormNotes('');
    setShowForm(false);
  };

  const deleteEvent = (dateKey: string, evId: string) => {
    const updated = { ...data, [dateKey]: (data[dateKey] || []).filter(e => e.id !== evId) };
    if (!updated[dateKey].length) delete updated[dateKey];
    saveData(updated);
  };

  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedEvents = selectedDate ? (data[selectedDate] || []) : [];

  return (
    <div style={{ padding: '10px 0' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={prevMonth} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)' }}><ChevronLeft size={16} /></button>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)' }}><ChevronRight size={16} /></button>
        </div>
        <button onClick={goToday} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--primary-color)', background: 'transparent', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
          <Calendar size={14} /> Today
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {/* Calendar Grid */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '8px' }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', padding: '6px 0' }}>{d}</div>)}
          </div>
          {/* Grid cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} />;
              const key = toKey(year, month, day);
              const events = data[key] || [];
              const isToday = key === todayKey;
              const isSelected = key === selectedDate;
              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  style={{
                    padding: '6px 4px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--primary-color)' : isToday ? 'rgba(99,102,241,0.12)' : 'transparent',
                    border: isToday && !isSelected ? '1.5px solid var(--primary-color)' : '1.5px solid transparent',
                    transition: 'background 0.15s',
                    minHeight: '44px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: isToday ? 800 : 500, color: isSelected ? 'white' : isToday ? 'var(--primary-color)' : 'var(--text-color)' }}>{day}</span>
                  {events.length > 0 && (
                    <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {events.slice(0, 3).map(e => <div key={e.id} style={{ width: '5px', height: '5px', borderRadius: '50%', background: isSelected ? 'white' : e.color }} />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Events Panel */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          {selectedDate ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '2px 0 0' }}>{selectedEvents.length} event(s)</p>
                </div>
                <button onClick={() => setShowForm(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 13px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
                  <Plus size={14} /> Add
                </button>
              </div>

              {showForm && (
                <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Event title..." className="form-input" autoFocus />
                  <input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} className="form-input" />
                  <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Notes (optional)" className="form-textarea" rows={2} />
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {COLORS.map(c => <button key={c} onClick={() => setFormColor(c)} style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, border: formColor === c ? '3px solid var(--text-color)' : '2px solid transparent', cursor: 'pointer' }} />)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '9px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                    <button onClick={addEvent} style={{ flex: 2, padding: '9px', border: 'none', background: formColor, color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><Check size={14} /> Save Event</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedEvents.length === 0 && !showForm && (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.85rem', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                    No events. Click Add to create one.
                  </div>
                )}
                {selectedEvents.map(ev => (
                  <div key={ev.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: ev.color + '11', borderLeft: `4px solid ${ev.color}`, borderRadius: '8px', padding: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: ev.color }}>{ev.title}</div>
                      {ev.time && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>🕐 {ev.time}</div>}
                      {ev.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{ev.notes}</div>}
                    </div>
                    <button onClick={() => deleteEvent(selectedDate, ev.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', flexShrink: 0 }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-secondary)', gap: '10px' }}>
              <Calendar size={36} opacity={0.3} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Click a date to view or add events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
