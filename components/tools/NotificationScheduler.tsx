'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Plus, Trash2, Clock, AlertCircle, Check, RefreshCw } from 'lucide-react';

interface ScheduledNotif {
  id: string;
  title: string;
  message: string;
  scheduledAt: number; // timestamp ms
  recurring: 'none' | 'daily' | 'weekly';
  fired: boolean;
}

const LS_KEY = 'infinitykit_notifications';

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Now';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export default function NotificationScheduler() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notifs, setNotifs] = useState<ScheduledNotif[]>([]);
  const [now, setNow] = useState(Date.now());
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formDatetime, setFormDatetime] = useState('');
  const [formRecurring, setFormRecurring] = useState<'none' | 'daily' | 'weekly'>('none');
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Default datetime to 5 min from now
  useEffect(() => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    setFormDatetime(d.toISOString().slice(0, 16));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
    try { const s = localStorage.getItem(LS_KEY); if (s) setNotifs(JSON.parse(s)); } catch {}
  }, []);

  const saveNotifs = useCallback((updated: ScheduledNotif[]) => {
    setNotifs(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  }, []);

  // Ticker + fire check
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const ts = Date.now();
      setNow(ts);
      setNotifs(prev => {
        let changed = false;
        const updated = prev.map(n => {
          if (!n.fired && n.scheduledAt <= ts) {
            // Fire notification
            if (permission === 'granted' && 'Notification' in window) {
              try { new Notification(n.title, { body: n.message, icon: '/icon-192.png' }); } catch {}
            }
            changed = true;
            // If recurring, update scheduledAt
            if (n.recurring === 'daily') {
              return { ...n, scheduledAt: n.scheduledAt + 86400000 };
            }
            if (n.recurring === 'weekly') {
              return { ...n, scheduledAt: n.scheduledAt + 7 * 86400000 };
            }
            return { ...n, fired: true };
          }
          return n;
        });
        if (changed) {
          localStorage.setItem(LS_KEY, JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [permission]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const p = await Notification.requestPermission();
      setPermission(p);
    }
  };

  const addNotification = () => {
    if (!formTitle.trim() || !formDatetime) return;
    const scheduledAt = new Date(formDatetime).getTime();
    if (isNaN(scheduledAt)) return;
    const n: ScheduledNotif = {
      id: `${Date.now()}`,
      title: formTitle,
      message: formMessage,
      scheduledAt,
      recurring: formRecurring,
      fired: false
    };
    saveNotifs([n, ...notifs]);
    setFormTitle(''); setFormMessage(''); setFormRecurring('none');
    const d = new Date(Date.now() + 5 * 60 * 1000);
    setFormDatetime(d.toISOString().slice(0, 16));
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteNotif = (id: string) => saveNotifs(notifs.filter(n => n.id !== id));

  const activeNotifs = notifs.filter(n => !n.fired);
  const firedNotifs = notifs.filter(n => n.fired);

  return (
    <div style={{ padding: '10px 0' }}>
      {/* Permission Banner */}
      {permission !== 'granted' && (
        <div style={{ background: permission === 'denied' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${permission === 'denied' ? '#ef4444' : '#f59e0b'}`, borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} color={permission === 'denied' ? '#ef4444' : '#f59e0b'} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              {permission === 'denied' ? 'Notifications are blocked. Enable them in browser settings.' : 'Browser notifications are needed to fire alerts.'}
            </span>
          </div>
          {permission !== 'denied' && (
            <button onClick={requestPermission} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
              Enable Notifications
            </button>
          )}
        </div>
      )}

      {permission === 'granted' && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '12px', padding: '12px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} color="#10b981" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>Browser notifications enabled. Alerts will fire as scheduled.</span>
        </div>
      )}

      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>🔔 Notification Scheduler</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '4px 0 0' }}>{activeNotifs.length} active • {firedNotifs.length} completed</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', border: 'none', borderRadius: '10px', background: 'var(--primary-color)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
          <Plus size={15} /> Schedule Alert
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-panel" style={{ padding: '22px', marginBottom: '16px', border: '1px solid var(--primary-color)' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '1rem' }}>New Notification</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>TITLE</label>
              <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Notification title" className="form-input" />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>SCHEDULED TIME</label>
              <input type="datetime-local" value={formDatetime} onChange={e => setFormDatetime(e.target.value)} className="form-input" />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>MESSAGE (optional)</label>
              <input value={formMessage} onChange={e => setFormMessage(e.target.value)} placeholder="Notification body" className="form-input" />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>RECURRING</label>
              <select value={formRecurring} onChange={e => setFormRecurring(e.target.value as any)} className="form-select">
                <option value="none">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button onClick={addNotification} style={{ flex: 2, padding: '10px', border: 'none', background: 'var(--primary-color)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              {saved ? <><Check size={15} /> Saved!</> : <><Bell size={15} /> Schedule</>}
            </button>
          </div>
        </div>
      )}

      {/* Active Notifications */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '16px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Clock size={16} color="var(--primary-color)" /> Upcoming Alerts ({activeNotifs.length})
        </h3>
        {activeNotifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.85rem', border: '1px dashed var(--glass-border)', borderRadius: '10px' }}>
            No scheduled alerts. Click "Schedule Alert" to add one.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeNotifs.map(n => {
              const diff = n.scheduledAt - now;
              const isPast = diff <= 0;
              return (
                <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: isPast ? '#10b98122' : 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={18} color={isPast ? '#10b981' : 'var(--primary-color)'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
                    {n.message && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span>📅 {new Date(n.scheduledAt).toLocaleString()}</span>
                      {n.recurring !== 'none' && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><RefreshCw size={10} /> {n.recurring}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: isPast ? '#10b981' : 'var(--primary-color)' }}>{isPast ? 'Firing...' : formatCountdown(diff)}</div>
                    <button onClick={() => deleteNotif(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', marginTop: '4px' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fired/Completed */}
      {firedNotifs.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Check size={16} /> Completed ({firedNotifs.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {firedNotifs.map(n => (
              <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', opacity: 0.6 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{n.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '10px' }}>{new Date(n.scheduledAt).toLocaleString()}</span>
                </div>
                <button onClick={() => deleteNotif(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
