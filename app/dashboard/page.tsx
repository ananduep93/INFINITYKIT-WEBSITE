'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { useSync } from '../../hooks/useSync';
import { tools } from '../../config/tools';
import { User, Cloud, Star, History, Settings, LogOut, CheckCircle, Trash2 } from 'lucide-react';
import ReusableLoading from '../../components/ui/ReusableLoading';

export default function DashboardPage() {
  const { user, logout, isLoggedIn, loading: authLoading } = useAuth();
  const { favorites, recentTools, toggleFavorite } = useSync();

  const favoriteToolsList = useMemo(() => {
    return tools.filter((t) => favorites.includes(t.id));
  }, [favorites]);

  if (authLoading) {
    return <ReusableLoading type="skeleton" count={4} />;
  }

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '40px 20px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '45px 30px' }}>
          <User size={48} style={{ color: 'var(--primary-color)', marginBottom: '15px' }} />
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>
            Access Your Dashboard
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px', lineHeight: 1.5 }}>
            Sign in to unlock real-time Firestore database backup synchronizations for all tools, medication schedules, notes, and financial budget planners.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <Link href="/login" className="btn" style={{ textDecoration: 'none' }}>
              Sign In
            </Link>
            <Link href="/signup" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      <header style={{ marginBottom: '35px' }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>
          User Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Welcome back! Manage your synced databases, favorites, and settings panels.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* User Card & Sync Status */}
        <div className="glass-panel" style={{ margin: 0, padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: 800,
              fontFamily: "'Outfit', sans-serif"
            }}>
              {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.displayName || 'Active Member'}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user?.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,161,155,0.04)', padding: '12px 15px', borderRadius: '10px', border: '1px solid rgba(0,161,155,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                <Cloud size={16} color="var(--primary-color)" /> Backup Status
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--success-color)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> Synced to Cloud
              </span>
            </div>

            <button
              onClick={() => {
                if (confirm('Log out of Infinity Kit?')) {
                  logout().then(() => window.location.href = '/');
                }
              }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '10px', borderRadius: '10px', fontSize: '0.9rem' }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Favorites Overview */}
        <div className="glass-panel" style={{ margin: 0, padding: '25px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={18} color="var(--primary-color)" fill="var(--primary-color)" /> Bookmarked ({favoriteToolsList.length})
          </h3>
          
          {favoriteToolsList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
              {favoriteToolsList.map((tool) => (
                <div key={tool.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
                  <Link href={`/tools/${tool.id}`} style={{ textDecoration: 'none', color: 'var(--text-color)', fontWeight: 600, fontSize: '0.9rem' }}>
                    {tool.icon} {tool.name}
                  </Link>
                  <button
                    onClick={() => toggleFavorite(tool.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}
                  >
                    <Trash2 size={14} style={{ color: 'var(--error-color)', opacity: 0.6 }} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
              No favorites saved. Favorite tools by clicking their star anchors.
            </p>
          )}
        </div>
      </div>

      {/* History row */}
      {recentTools.length > 0 && (
        <section style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="var(--primary-color)" /> Recently Used Tools
          </h3>
          <div className="tools-grid">
            {recentTools.slice(0, 4).map((recent) => {
              const tool = tools.find((t) => t.id === recent.id);
              if (!tool) return null;
              return (
                <Link href={`/tools/${tool.id}`} key={tool.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="tool-card">
                    <div className="tool-card-icon">{tool.icon}</div>
                    <div className="tool-card-info">
                      <div className="tool-card-name">{tool.name}</div>
                      <div className="tool-card-desc">{tool.description}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
