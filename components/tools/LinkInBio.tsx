'use client';
import React, { useState, useCallback } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Download, Copy, Check, Palette, User, Link } from 'lucide-react';

interface BioLink {
  id: string;
  title: string;
  url: string;
  emoji: string;
  color: string;
}

interface Profile {
  name: string;
  bio: string;
  avatarUrl: string;
}

type Theme = 'dark' | 'light' | 'gradient';

const LINK_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];
const THEMES: { id: Theme; label: string; bg: string; text: string; card: string }[] = [
  { id: 'dark', label: '🌙 Dark', bg: '#0f0f1a', text: '#ffffff', card: 'rgba(255,255,255,0.07)' },
  { id: 'light', label: '☀️ Light', bg: '#f5f5f5', text: '#111111', card: 'rgba(0,0,0,0.06)' },
  { id: 'gradient', label: '🌈 Gradient', bg: 'linear-gradient(135deg,#6366f1,#ec4899)', text: '#ffffff', card: 'rgba(255,255,255,0.15)' },
];

function encodeConfig(profile: Profile, links: BioLink[], theme: Theme) {
  return btoa(encodeURIComponent(JSON.stringify({ profile, links, theme })));
}

function generateHTML(profile: Profile, links: BioLink[], theme: Theme): string {
  const t = THEMES.find(th => th.id === theme) || THEMES[0];
  const linksHTML = links.map(l =>
    `<a href="${l.url}" target="_blank" rel="noopener" style="display:block;padding:14px 20px;border-radius:12px;background:${l.color}22;border:1.5px solid ${l.color}44;color:${t.text};text-decoration:none;font-weight:700;font-size:1rem;margin-bottom:10px;transition:transform 0.15s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
      <span style="margin-right:8px;">${l.emoji}</span>${l.title}
    </a>`
  ).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${profile.name} | Links</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:${t.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:20px;}</style>
</head>
<body>
<div style="max-width:420px;width:100%;text-align:center;">
  ${profile.avatarUrl ? `<img src="${profile.avatarUrl}" alt="Avatar" style="width:90px;height:90px;border-radius:50%;object-fit:cover;margin-bottom:14px;border:3px solid ${LINK_COLORS[0]};">` : ''}
  <h1 style="color:${t.text};font-size:1.5rem;font-weight:800;margin-bottom:8px;">${profile.name}</h1>
  ${profile.bio ? `<p style="color:${t.text};opacity:0.7;margin-bottom:24px;font-size:0.9rem;line-height:1.5;">${profile.bio}</p>` : ''}
  <div style="margin-top:10px;">${linksHTML}</div>
</div>
</body></html>`;
}

export default function LinkInBio() {
  const [profile, setProfile] = useState<Profile>({ name: 'Your Name', bio: 'Your awesome bio goes here ✨', avatarUrl: '' });
  const [links, setLinks] = useState<BioLink[]>([
    { id: '1', title: 'My Website', url: 'https://example.com', emoji: '🌐', color: '#6366f1' },
    { id: '2', title: 'Follow on Instagram', url: 'https://instagram.com', emoji: '📷', color: '#ec4899' },
  ]);
  const [theme, setTheme] = useState<Theme>('dark');
  const [showPreview, setShowPreview] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newEmoji, setNewEmoji] = useState('🔗');
  const [newColor, setNewColor] = useState(LINK_COLORS[0]);
  const [copied, setCopied] = useState(false);

  const addLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    const id = `${Date.now()}`;
    setLinks(l => [...l, { id, title: newTitle, url: newUrl, emoji: newEmoji, color: newColor }]);
    setNewTitle(''); setNewUrl(''); setNewEmoji('🔗');
  };

  const removeLink = (id: string) => setLinks(l => l.filter(x => x.id !== id));
  const moveUp = (idx: number) => { if (idx === 0) return; const n = [...links]; [n[idx-1],n[idx]] = [n[idx],n[idx-1]]; setLinks(n); };
  const moveDown = (idx: number) => { if (idx === links.length - 1) return; const n = [...links]; [n[idx],n[idx+1]] = [n[idx+1],n[idx]]; setLinks(n); };

  const downloadHTML = () => {
    const html = generateHTML(profile, links, theme);
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'link-in-bio.html'; a.click();
  };

  const copyShareLink = () => {
    const hash = encodeConfig(profile, links, theme);
    const url = `${window.location.origin}${window.location.pathname}#bio=${hash}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const t = THEMES.find(th => th.id === theme) || THEMES[0];

  return (
    <div style={{ padding: '10px 0' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '18px 22px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>🔗 Link-in-Bio Builder</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '4px 0 0' }}>Build your bio page, preview live, and export as HTML</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowPreview(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-color)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />} {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button onClick={copyShareLink} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-color)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />} {copied ? 'Copied!' : 'Share Link'}
          </button>
          <button onClick={downloadHTML} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
            <Download size={14} /> Export HTML
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showPreview ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', gap: '16px', alignItems: 'start' }}>
        {/* Editor Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Profile */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '7px' }}><User size={16} color="var(--primary-color)" /> Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} placeholder="Your name" className="form-input" />
              <textarea value={profile.bio} onChange={e => setProfile(p => ({...p, bio: e.target.value}))} placeholder="Short bio..." className="form-textarea" rows={2} />
              <input value={profile.avatarUrl} onChange={e => setProfile(p => ({...p, avatarUrl: e.target.value}))} placeholder="Avatar image URL (optional)" className="form-input" />
            </div>
          </div>

          {/* Theme */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '7px' }}><Palette size={16} color="var(--primary-color)" /> Theme</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {THEMES.map(th => (
                <button key={th.id} onClick={() => setTheme(th.id)} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: `2px solid ${theme === th.id ? 'var(--primary-color)' : 'var(--glass-border)'}`, background: theme === th.id ? 'rgba(99,102,241,0.1)' : 'transparent', color: 'var(--text-color)', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', transition: 'all 0.2s' }}>{th.label}</button>
              ))}
            </div>
          </div>

          {/* Add Link */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '7px' }}><Link size={16} color="var(--primary-color)" /> Add Link</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '8px' }}>
                <input value={newEmoji} onChange={e => setNewEmoji(e.target.value)} placeholder="🔗" className="form-input" style={{ textAlign: 'center', fontSize: '1.2rem' }} maxLength={2} />
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Link title" className="form-input" />
              </div>
              <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." className="form-input" type="url" />
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {LINK_COLORS.map(c => <button key={c} onClick={() => setNewColor(c)} style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, border: newColor === c ? '3px solid var(--text-color)' : '2px solid transparent', cursor: 'pointer' }} />)}
              </div>
              <button onClick={addLink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--primary-color)', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                <Plus size={15} /> Add Link
              </button>
            </div>
          </div>

          {/* Links List */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 14px' }}>Links ({links.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {links.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>Add your first link above</p>}
              {links.map((link, idx) => (
                <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: link.color + '11', borderLeft: `4px solid ${link.color}`, borderRadius: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>{link.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                    <button onClick={() => moveUp(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '3px' }}><ChevronUp size={14} /></button>
                    <button onClick={() => moveDown(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '3px' }}><ChevronDown size={14} /></button>
                    <button onClick={() => removeLink(link.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '3px' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Panel - Phone Frame */}
        {showPreview && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              {/* Phone frame */}
              <div style={{ border: '8px solid #1a1a2e', borderRadius: '36px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', position: 'relative' }}>
                <div style={{ height: '20px', background: '#1a1a2e', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '4px' }}>
                  <div style={{ width: '50px', height: '6px', background: '#333', borderRadius: '3px' }} />
                </div>
                <div style={{ background: t.bg, minHeight: '520px', padding: '24px 16px', overflow: 'auto', maxHeight: '600px' }}>
                  <div style={{ textAlign: 'center' }}>
                    {profile.avatarUrl && <img src={profile.avatarUrl} alt="Avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', border: `3px solid ${LINK_COLORS[0]}` }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    <div style={{ color: t.text, fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>{profile.name || 'Your Name'}</div>
                    {profile.bio && <div style={{ color: t.text, opacity: 0.65, fontSize: '0.75rem', marginBottom: '16px', lineHeight: 1.4 }}>{profile.bio}</div>}
                    <div>
                      {links.map(link => (
                        <div key={link.id} style={{ padding: '10px 14px', borderRadius: '10px', background: link.color + '22', border: `1.5px solid ${link.color}44`, color: t.text, fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{link.emoji}</span> {link.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Live Preview</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
