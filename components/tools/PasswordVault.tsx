'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, Unlock, Plus, Trash2, Eye, EyeOff, Copy, Check, Download, Search, Key } from 'lucide-react';

interface VaultEntry {
  id: string;
  website: string;
  username: string;
  password: string;
  notes: string;
}

// Simple XOR "encryption" with PIN
function xorEncode(str: string, key: string): string {
  if (!key) return str;
  let out = '';
  for (let i = 0; i < str.length; i++) {
    out += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(out);
}

function xorDecode(encoded: string, key: string): string {
  if (!key) return encoded;
  try {
    const str = atob(encoded);
    let out = '';
    for (let i = 0; i < str.length; i++) {
      out += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return out;
  } catch { return ''; }
}

const STORAGE_KEY = 'ik_vault_v1';
const PIN_HASH_KEY = 'ik_vault_pin_hash';

function hashPIN(pin: string): string {
  // Simple deterministic hash (not cryptographic—for demo only)
  let hash = 0;
  for (let i = 0; i < pin.length; i++) hash = (hash * 31 + pin.charCodeAt(i)) | 0;
  return String(hash >>> 0);
}

export default function PasswordVault() {
  const [locked, setLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [search, setSearch] = useState('');
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ website: '', username: '', password: '', notes: '' });
  const [showFormPw, setShowFormPw] = useState(false);

  useEffect(() => {
    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    if (!storedHash) setIsFirstTime(true);
  }, []);

  const saveEntries = useCallback((data: VaultEntry[], currentPin: string) => {
    const json = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, xorEncode(json, currentPin));
  }, []);

  const loadEntries = useCallback((currentPin: string): VaultEntry[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(xorDecode(raw, currentPin));
    } catch { return []; }
  }, []);

  const unlock = () => {
    if (!pinInput.trim()) { setPinError('Please enter a PIN.'); return; }
    if (isFirstTime) {
      if (pinInput.length < 4) { setPinError('PIN must be at least 4 characters.'); return; }
      localStorage.setItem(PIN_HASH_KEY, hashPIN(pinInput));
      setPin(pinInput);
      setEntries([]);
      setLocked(false);
      setPinInput('');
      setPinError('');
    } else {
      const storedHash = localStorage.getItem(PIN_HASH_KEY);
      if (hashPIN(pinInput) !== storedHash) { setPinError('Incorrect PIN. Try again.'); return; }
      setPin(pinInput);
      setEntries(loadEntries(pinInput));
      setLocked(false);
      setPinInput('');
      setPinError('');
    }
  };

  const lock = () => {
    setLocked(true);
    setPin('');
    setEntries([]);
    setRevealedIds(new Set());
    setShowForm(false);
  };

  const addEntry = () => {
    if (!form.website || !form.username || !form.password) return;
    const newEntry: VaultEntry = { id: Date.now().toString(), ...form };
    const updated = [...entries, newEntry];
    setEntries(updated);
    saveEntries(updated, pin);
    setForm({ website: '', username: '', password: '', notes: '' });
    setShowForm(false);
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveEntries(updated, pin);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 1800);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'password-vault.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = entries.filter(e =>
    e.website.toLowerCase().includes(search.toLowerCase()) ||
    e.username.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    borderRadius: '10px', color: 'var(--text-color)', padding: '10px 14px',
    fontSize: '0.95rem', width: '100%', outline: 'none', boxSizing: 'border-box',
  };

  if (locked) {
    return (
      <div style={{ padding: '10px 0' }}>
        <div className="glass-panel" style={{ maxWidth: '420px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '16px' }}>
            <Shield size={48} color="var(--primary-color)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Password Vault</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
            {isFirstTime ? 'Create a master PIN to protect your vault. All data is stored locally and encrypted.' : 'Enter your master PIN to unlock the vault.'}
          </p>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Key size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="password"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && unlock()}
              placeholder={isFirstTime ? 'Create a PIN (min 4 chars)' : 'Enter Master PIN'}
              style={{ ...inputStyle, paddingLeft: '40px', textAlign: 'center', letterSpacing: '0.2em', fontSize: '1.1rem' }}
              autoFocus
            />
          </div>
          {pinError && <div style={{ color: '#dc3545', fontSize: '0.82rem', marginBottom: '10px' }}>{pinError}</div>}
          <button onClick={unlock} style={{
            background: 'var(--primary-color)', color: '#fff', border: 'none',
            borderRadius: '12px', padding: '12px 32px', fontWeight: 700,
            fontSize: '0.95rem', cursor: 'pointer', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            <Unlock size={18} /> {isFirstTime ? 'Create Vault' : 'Unlock Vault'}
          </button>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '16px', lineHeight: 1.5 }}>
            🔒 Your data is encrypted with XOR cipher and stored only in your browser's localStorage. Nothing is sent to any server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={24} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Password Vault</h2>
            <span style={{
              background: 'rgba(40,167,69,0.1)', color: '#28a745',
              borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700
            }}>UNLOCKED</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={exportJSON} style={{
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              borderRadius: '10px', padding: '8px 14px', cursor: 'pointer',
              color: 'var(--text-color)', fontSize: '0.82rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <Download size={14} /> Export
            </button>
            <button onClick={() => setShowForm(true)} style={{
              background: 'var(--primary-color)', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '8px 14px', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <Plus size={14} /> Add Entry
            </button>
            <button onClick={lock} style={{
              background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.2)',
              borderRadius: '10px', padding: '8px 14px', cursor: 'pointer',
              color: '#dc3545', fontSize: '0.82rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <Lock size={14} /> Lock
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries…" style={{ ...inputStyle, paddingLeft: '38px' }} />
        </div>

        {/* Add Form */}
        {showForm && (
          <div style={{
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            borderRadius: '14px', padding: '20px', marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>New Entry</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="Website / App" style={inputStyle} />
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="Username / Email" style={inputStyle} />
              <div style={{ position: 'relative' }}>
                <input type={showFormPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" style={{ ...inputStyle, paddingRight: '40px' }} />
                <button onClick={() => setShowFormPw(p => !p)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  {showFormPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes (optional)" style={{ ...inputStyle, marginBottom: '12px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={addEntry} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
                Save Entry
              </button>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Entries */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            <Shield size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <div>{entries.length === 0 ? 'No entries yet. Add your first password!' : 'No matching entries.'}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(e => (
              <div key={e.id} style={{
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: '14px', padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: '0' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{e.website}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>{e.username}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <code style={{
                        background: 'rgba(0,0,0,0.1)', padding: '4px 10px', borderRadius: '6px',
                        fontSize: '0.85rem', letterSpacing: revealedIds.has(e.id) ? 0 : '0.15em'
                      }}>
                        {revealedIds.has(e.id) ? e.password : '••••••••'}
                      </code>
                      <button onClick={() => toggleReveal(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                        {revealedIds.has(e.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => copyText(e.username, e.id + '_u')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {copiedId === e.id + '_u' ? <Check size={14} color="#28a745" /> : <Copy size={14} />}
                        User
                      </button>
                      <button onClick={() => copyText(e.password, e.id + '_p')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {copiedId === e.id + '_p' ? <Check size={14} color="#28a745" /> : <Copy size={14} />}
                        Pass
                      </button>
                    </div>
                    {e.notes && <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{e.notes}</div>}
                  </div>
                  <button onClick={() => deleteEntry(e.id)} style={{ background: 'rgba(220,53,69,0.1)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#dc3545', display: 'flex', flexShrink: 0 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
