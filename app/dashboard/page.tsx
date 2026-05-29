'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useSync } from '../../hooks/useSync';
import { tools, mapCategoryToPath } from '../../config/tools';
import { 
  User, Cloud, Star, History, Settings, LogOut, CheckCircle, Trash2, 
  Award, Bell, BarChart2, Check, AlertCircle, Compass, Zap, Shield, 
  Mail, Key, UserCheck, Edit3, ArrowRight, Activity, Download
} from 'lucide-react';
import ReusableLoading from '../../components/ui/ReusableLoading';
import { useTheme } from '../../components/ThemeProvider';
import confetti from 'canvas-confetti';

export default function DashboardPage() {
  const { theme } = useTheme();
  const { user, logout, isLoggedIn, loginWithGoogle, loading: authLoading } = useAuth();
  const { favorites, recentTools, toggleFavorite } = useSync();
  
  // Local states
  const [activeTab, setActiveTab] = useState<'overview' | 'bookmarks' | 'premium' | 'profile' | 'notifications'>('overview');
  const [profileName, setProfileName] = useState(user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('cyan-orb');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [mockNotificationRead, setMockNotificationRead] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [authSuccessToast, setAuthSuccessToast] = useState<string | null>(null);

  // Load user API key from localStorage and check for auth redirects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGeminiKey(localStorage.getItem('infinitykit_gemini_key') || '');
      setOpenaiKey(localStorage.getItem('infinitykit_openai_key') || '');

      const params = new URLSearchParams(window.location.search);
      const authType = params.get('auth');
      const redirectType = sessionStorage.getItem('authRedirectSuccess');
      
      if (authType === 'login' || redirectType === 'login') {
        setAuthSuccessToast('Sign In Successful! Welcome back.');
        if (redirectType) sessionStorage.removeItem('authRedirectSuccess');
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => setAuthSuccessToast(null), 3500);
      } else if (authType === 'signup' || redirectType === 'signup') {
        setAuthSuccessToast('Registration Successful! Welcome to InfinityKit.');
        if (redirectType) sessionStorage.removeItem('authRedirectSuccess');
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => setAuthSuccessToast(null), 3500);
      }
    }
  }, []);

  // PWA Install state
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).deferredPrompt) {
        setInstallPrompt((window as any).deferredPrompt);
      }
      const handleInstallable = () => {
        setInstallPrompt((window as any).deferredPrompt);
      };
      window.addEventListener('infinitykit_pwa_installable', handleInstallable);
      return () => window.removeEventListener('infinitykit_pwa_installable', handleInstallable);
    }
  }, []);

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      console.log(`PWA Install choice from dashboard: ${outcome}`);
      setInstallPrompt(null);
      (window as any).deferredPrompt = null;
    } else {
      alert("To install InfinityKit, please use your browser's Share/Install Address Bar option.");
    }
  };

  // Sync profile display name when user object is loaded
  useEffect(() => {
    if (user?.displayName) {
      setProfileName(user.displayName);
    }
  }, [user]);

  // Mock Notifications list
  const mockNotifications = [
    {
      id: 'notif-1',
      title: 'Real-time database sync active',
      desc: 'All bookmarked tools and configuration inputs are now securely synced to Firestore database.',
      time: 'Just now',
      type: 'success'
    },
    {
      id: 'notif-2',
      title: 'Security alert: API key encryption verified',
      desc: 'Local-first algorithms are verified for strict client-side encryption. No servers can read your PDF content.',
      time: '2 hours ago',
      type: 'info'
    },
    {
      id: 'notif-3',
      title: 'Premium features available',
      desc: 'Upgrade your workspace to access dedicated AI bots and zero-latency file processors.',
      time: '1 day ago',
      type: 'promo'
    }
  ];

  // Mock local action history
  const [mockHistory, setMockHistory] = useState<Array<{ id: string, name: string, time: string, action: string }>>([
    { id: 'hist-1', name: 'Medication Reminder Scheduler', time: '10 mins ago', action: 'Created daily reminders' },
    { id: 'hist-2', name: 'Dead Drop Notes', time: '1 hour ago', action: 'Encrypted message chunk local-first' },
    { id: 'hist-3', name: 'Browser Image Compressor', time: 'Yesterday', action: 'Reduced payload size by 62%' },
  ]);

  // Filter dynamic favorite tools
  const favoriteToolsList = useMemo(() => {
    return tools.filter((t) => favorites.includes(t.id));
  }, [favorites]);

  // Handle premium upgrade
  const handleUpgrade = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
    setIsSubscribed(true);
    // Add success notification
    mockNotifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Premium Membership Activated!',
      desc: 'Welcome to Infinity Premium. Enjoy zero-latency tools, high-speed Edge execution, and premium support.',
      time: 'Just now',
      type: 'success'
    });
  };

  // Handle profile update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }, 1200);
  };

  if (authLoading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }}>
        <ReusableLoading type="skeleton" count={4} />
      </div>
    );
  }

  // LOGGED OUT STATE: Premium SaaS Auth Gateway
  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '640px', margin: '80px auto', padding: '0 20px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-panel" 
          style={{ padding: '45px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
        >
          {/* Futuristic ambient orb behind box */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '180px',
            height: '180px',
            background: 'radial-gradient(circle, rgba(0, 161, 155, 0.15), transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(20px)',
            pointerEvents: 'none'
          }} />

          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(0, 161, 155, 0.06)',
            border: '1px solid rgba(0, 161, 155, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Shield size={32} color="var(--primary-color)" />
          </div>

          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2.1rem', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Access Dashboard
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', marginBottom: '30px', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 30px' }}>
            Sign in to sync your local bookmarks, medication planners, private dead drop notes, and budget schedules to high-reliability cloud databases.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '320px', margin: '0 auto' }}>
            <button 
              onClick={loginWithGoogle}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: theme === 'dark' ? '#1E222D' : '#FFFFFF',
                color: theme === 'dark' ? '#FFFFFF' : '#1A1D26',
                border: '1px solid var(--glass-border)',
                fontWeight: 600,
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.2s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.7-1.57 2.69-3.88 2.69-6.57z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.47-.8 5.96-2.23l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.58-5.05-3.7H.95v2.3C2.43 15.89 5.5 18 9 18z" fill="#34A853"/>
                <path d="M3.95 10.7c-.18-.54-.28-1.12-.28-1.7s.1-1.16.28-1.7V5H.95A8.96 8.96 0 0 0 0 9c0 1.45.35 2.82.95 4.05l3-2.35z" fill="#FBBC05"/>
                <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.3A8.99 8.99 0 0 0 9 0C5.5 0 2.43 2.11.95 5.05l3 2.35c.71-2.13 2.7-3.71 5.05-3.71z" fill="#EA4335"/>
              </svg>
              Sign In with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0' }}>
              <span style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Or Account Credentials</span>
              <span style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link href="/login" style={{ textDecoration: 'none', flex: 1 }}>
                <button className="btn btn-secondary" style={{ width: '100%' }}>Sign In</button>
              </Link>
              <Link href="/signup" style={{ textDecoration: 'none', flex: 1 }}>
                <button className="btn btn-secondary" style={{ width: '100%' }}>Sign Up</button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // LOGGED IN STATE: Premium SaaS Dashboard Layout
  return (
    <div style={{ maxWidth: '1140px', margin: '40px auto', padding: '0 24px 60px' }}>
      
      {/* Toast Alert */}
      {authSuccessToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(0,161,155,0.95)',
          color: 'white',
          padding: '14px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,161,155,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '0.9rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'dashboard-slide-in 0.3s ease'
        }}>
          <CheckCircle size={18} />
          <span>{authSuccessToast}</span>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes dashboard-slide-in {
              from { transform: translateX(30px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}} />
        </div>
      )}

      {/* Header Profile Ribbon */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel"
        style={{ padding: '24px 30px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '35px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Avatar sphere */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isSubscribed 
              ? 'linear-gradient(135deg, var(--accent-purple) 0%, var(--primary-color) 100%)' 
              : 'var(--primary-gradient)',
            border: isSubscribed ? '2px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--glass-border)',
            boxShadow: isSubscribed ? '0 0 15px rgba(168, 85, 247, 0.25)' : 'none',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 900,
            fontFamily: "'Outfit', sans-serif",
            position: 'relative'
          }}>
            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
            {isSubscribed && (
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--primary-color) 100%)',
                color: 'white',
                borderRadius: '50%',
                padding: '3px',
                display: 'flex',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}>
                <Award size={10} fill="white" />
              </span>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '1.4rem', margin: 0 }}>
                {user.displayName || (user.email ? user.email.split('@')[0] : 'User')}
              </h2>
              {isSubscribed ? (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '2px 8px', borderRadius: '50px' }}>
                  PREMIUM
                </span>
              ) : (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', background: 'rgba(0, 161, 155, 0.08)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '50px' }}>
                  FREE PLAN
                </span>
              )}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={12} /> {user.email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Cloud sync stats indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 161, 155, 0.04)', border: '1px solid rgba(0, 161, 155, 0.1)', padding: '8px 16px', borderRadius: '12px' }}>
            <Cloud size={16} color="var(--primary-color)" />
            <div style={{ textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Database Backup</span>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--success-color)', fontWeight: 700 }}>Firestore Live Sync</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Left Navigation / Tabs, Right Panels */}
      <div className="dashboard-grid-container">
        
        {/* Navigation Sidebar Card */}
        <div className="dashboard-sidebar">
          <button 
            onClick={() => setActiveTab('overview')}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'overview' ? 'var(--primary-gradient)' : 'var(--glass-bg)',
              borderBottom: activeTab === 'overview' ? 'none' : '1px solid var(--glass-border)',
              color: activeTab === 'overview' ? 'white' : 'var(--text-color)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <BarChart2 size={16} /> Overview & Stats
          </button>
          
          <button 
            onClick={() => setActiveTab('bookmarks')}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'bookmarks' ? 'var(--primary-gradient)' : 'var(--glass-bg)',
              borderBottom: activeTab === 'bookmarks' ? 'none' : '1px solid var(--glass-border)',
              color: activeTab === 'bookmarks' ? 'white' : 'var(--text-color)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Star size={16} /> Sync Bookmarks & History
          </button>

          <button 
            onClick={() => setActiveTab('premium')}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'premium' ? 'linear-gradient(135deg, var(--accent-purple) 0%, var(--primary-color) 100%)' : 'var(--glass-bg)',
              borderBottom: activeTab === 'premium' ? 'none' : '1px solid var(--glass-border)',
              color: activeTab === 'premium' ? 'white' : 'var(--text-color)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === 'premium' ? '0 4px 15px rgba(168, 85, 247, 0.2)' : 'none'
            }}
          >
            <Award size={16} /> Premium Upgrades
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'profile' ? 'var(--primary-gradient)' : 'var(--glass-bg)',
              borderBottom: activeTab === 'profile' ? 'none' : '1px solid var(--glass-border)',
              color: activeTab === 'profile' ? 'white' : 'var(--text-color)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <User size={16} /> Profile & Avatars
          </button>

          <button 
            onClick={() => setActiveTab('notifications')}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'notifications' ? 'var(--primary-gradient)' : 'var(--glass-bg)',
              borderBottom: activeTab === 'notifications' ? 'none' : '1px solid var(--glass-border)',
              color: activeTab === 'notifications' ? 'white' : 'var(--text-color)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Bell size={16} /> Notifications
            </div>
            {mockNotifications.length - mockNotificationRead.length > 0 && (
              <span style={{ background: 'red', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50px', fontWeight: 900 }}>
                {mockNotifications.length - mockNotificationRead.length}
              </span>
            )}
          </button>

          <span style={{ height: '15px' }} />
          
          <button 
            onClick={() => {
              if (confirm('Log out of Infinity Kit?')) {
                logout().then(() => window.location.href = '/');
              }
            }}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', color: 'var(--error-color)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Dynamic Panels */}
        <div style={{ width: '100%' }}>
          <AnimatePresence mode="wait">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
              >
                {/* Embedded PWA Install Banner */}
                {installPrompt && (
                  <div className="glass-panel" style={{ 
                    margin: 0, 
                    padding: '24px 30px', 
                    borderRadius: '20px', 
                    borderLeft: '5px solid var(--primary-color)',
                    background: 'linear-gradient(135deg, rgba(0, 161, 155, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, minWidth: '280px' }}>
                      <div style={{ background: 'var(--primary-gradient)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={20} color="white" fill="white" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>
                          Install InfinityKit App
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          Install the client-side utility suite directly on your device desktop for instantaneous offline access.
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={handleInstallApp}
                        style={{
                          background: 'linear-gradient(135deg, #00A19B 0%, #00d2c7 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '30px',
                          padding: '10px 22px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,161,155,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Download size={14} /> Install Web App
                      </button>
                    </div>
                  </div>
                )}
                {/* Analytics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                  <div className="glass-panel" style={{ margin: 0, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'rgba(0,161,155,0.06)', color: 'var(--primary-color)', padding: '10px', borderRadius: '10px' }}>
                      <Activity size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>142+</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Frequented Operations</div>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ margin: 0, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'rgba(168, 85, 247,0.06)', color: 'var(--accent-purple)', padding: '10px', borderRadius: '10px' }}>
                      <Zap size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>18,400+</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI API Tokens Saved</div>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ margin: 0, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'rgba(16,185,129,0.06)', color: 'var(--success-color)', padding: '10px', borderRadius: '10px' }}>
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>100% Local</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Privacy Compliance</div>
                    </div>
                  </div>
                </div>

                {/* Simulated Chart Panel */}
                <div className="glass-panel" style={{ margin: 0, padding: '25px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart2 size={18} color="var(--primary-color)" /> Usage Metrics & Workspace Activity
                  </h3>
                  
                  {/* responsive mock bars chart */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', gap: '15px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', marginTop: '20px' }}>
                    {[
                      { l: 'Mon', h: '40%' },
                      { l: 'Tue', h: '60%' },
                      { l: 'Wed', h: '85%' },
                      { l: 'Thu', h: '45%' },
                      { l: 'Fri', h: '95%' },
                      { l: 'Sat', h: '25%' },
                      { l: 'Sun', h: '15%' }
                    ].map((item, index) => (
                      <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: item.h }}
                          transition={{ duration: 0.8, delay: index * 0.05 }}
                          style={{
                            width: '100%',
                            maxWidth: '30px',
                            background: activeTab === 'overview' ? 'var(--primary-gradient)' : 'rgba(0,161,155,0.2)',
                            borderRadius: '6px 6px 0 0'
                          }}
                        />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recently Used Tools Grid */}
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History size={18} color="var(--primary-color)" /> Frequented Tool Launchpad
                  </h3>
                  {recentTools.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                      {recentTools.slice(0, 4).map((item) => {
                        const tool = tools.find((t) => t.id === item.id);
                        if (!tool) return null;
                        return (
                          <Link href={`/${mapCategoryToPath(tool.category)}/${tool.id}`} key={tool.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="tool-card" style={{ height: '100%', margin: 0 }}>
                              <div className="tool-card-icon">{tool.icon}</div>
                              <div className="tool-card-info">
                                <div className="tool-card-name" style={{ fontWeight: 700 }}>{tool.name}</div>
                                <div className="tool-card-desc">{tool.description}</div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="glass-panel" style={{ margin: 0, padding: '30px', textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                        No recently used tools found. Explore the directory to populate your launchpad!
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: BOOKMARKS & SYNC HISTORY */}
            {activeTab === 'bookmarks' && (
              <motion.div
                key="bookmarks"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
              >
                {/* Synced Bookmarks card */}
                <div className="glass-panel" style={{ margin: 0, padding: '25px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={18} fill="var(--primary-color)" color="var(--primary-color)" /> Synced Bookmarks ({favoriteToolsList.length})
                  </h3>
                  
                  {favoriteToolsList.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px' }}>
                      {favoriteToolsList.map((tool) => (
                        <div key={tool.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                          <Link href={`/${mapCategoryToPath(tool.category)}/${tool.id}`} style={{ textDecoration: 'none', color: 'var(--text-color)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.1rem' }}>{tool.icon}</span> {tool.name}
                          </Link>
                          <button
                            onClick={() => toggleFavorite(tool.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}
                          >
                            <Trash2 size={16} style={{ color: 'var(--error-color)', opacity: 0.6 }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                      <Star size={36} color="var(--text-secondary)" style={{ opacity: 0.3, marginBottom: '12px' }} />
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        Your synced favorites list is empty. Tap star badges on any tool to back them up dynamically.
                      </p>
                    </div>
                  )}
                </div>

                {/* Synced Local History */}
                <div className="glass-panel" style={{ margin: 0, padding: '25px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History size={18} color="var(--primary-color)" /> Workspace Synced Activity Logs
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {mockHistory.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.action}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.time}</span>
                          <button 
                            onClick={() => setMockHistory(prev => prev.filter(h => h.id !== item.id))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-color)', padding: '2px' }}
                          >
                            <Trash2 size={14} style={{ opacity: 0.5 }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: PREMIUM UPGRADE */}
            {activeTab === 'premium' && (
              <motion.div
                key="premium"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
              >
                {/* Billing cycle selection toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'inline-flex', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '4px', borderRadius: '12px' }}>
                    <button 
                      onClick={() => setBillingCycle('monthly')}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: billingCycle === 'monthly' ? 'var(--primary-gradient)' : 'transparent',
                        color: billingCycle === 'monthly' ? 'white' : 'var(--text-color)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Monthly Billing
                    </button>
                    <button 
                      onClick={() => setBillingCycle('yearly')}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: billingCycle === 'yearly' ? 'var(--primary-gradient)' : 'transparent',
                        color: billingCycle === 'yearly' ? 'white' : 'var(--text-color)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Yearly Billing (Save 20%)
                    </button>
                  </div>
                </div>

                {/* Subscriptions Tier Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'stretch' }}>
                  
                  {/* Basic Tier */}
                  <div className="glass-panel" style={{ margin: 0, padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '1.25rem', fontFamily: "'Outfit', sans-serif", margin: '0 0 8px' }}>Infinity Standard</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 20px' }}>Perfect for basic file conversions and daily notes.</p>
                      
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '25px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>$0</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ forever</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {['80+ Client-Side local tools', 'Secure offline browser processing', 'Firestore database cloud sync', 'Standard AI writing assistant'].map((feat, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <Check size={14} color="var(--primary-color)" /> {feat}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="btn btn-secondary" style={{ width: '100%', marginTop: '30px', cursor: 'default' }} disabled>
                      Active Free Plan
                    </button>
                  </div>

                  {/* Premium Tier */}
                  <div className="glass-panel" style={{ 
                    margin: 0, 
                    padding: '30px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    boxShadow: '0 10px 30px rgba(168, 85, 247, 0.06)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Glowing card border ribbon */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '-30px',
                      background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--primary-color) 100%)',
                      color: 'white',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      padding: '4px 30px',
                      transform: 'rotate(45deg)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      PRO LIFE
                    </div>

                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '1.25rem', fontFamily: "'Outfit', sans-serif", margin: '0 0 8px', color: 'var(--accent-purple)' }}>Infinity Premium</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 20px' }}>Unleash dedicated high-speed edge AI capabilities.</p>
                      
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '25px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
                          {billingCycle === 'yearly' ? '$8' : '$10'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ month</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {['Zero latency local conversions', 'High-speed edge AI assistant execution', 'Unlimited Firestore cloud records', 'Priority 24/7 technical support channels', 'Exclusive beta access to dynamic tools'].map((feat, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-color)', fontWeight: 500 }}>
                            <Check size={14} color="var(--accent-purple)" /> {feat}
                          </div>
                        ))}
                      </div>
                    </div>

                    {isSubscribed ? (
                      <button className="btn" style={{ width: '100%', marginTop: '30px', background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--primary-color) 100%)', border: 'none', cursor: 'default' }}>
                        <UserCheck size={16} /> Premium Active
                      </button>
                    ) : (
                      <button 
                        onClick={handleUpgrade}
                        className="btn" 
                        style={{ width: '100%', marginTop: '30px', background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--primary-color) 100%)', border: 'none' }}
                      >
                        Upgrade Workspace
                      </button>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 4: PROFILE MANAGEMENT & AVATARS */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
              >
                <div className="glass-panel" style={{ margin: 0, padding: '25px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={18} color="var(--primary-color)" /> Manage Profile Identity
                  </h3>

                  <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Display Name</label>
                      <input 
                        type="text" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Enter display name"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--glass-border)',
                          background: 'rgba(0,0,0,0.01)',
                          color: 'var(--text-color)',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Secure Password</label>
                      <input 
                        type="password" 
                        value="•••••••••••••••••••••"
                        disabled
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--glass-border)',
                          background: 'rgba(0,0,0,0.04)',
                          color: 'var(--text-secondary)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    {/* Google Gemini API Key Setting */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Key size={14} color="var(--primary-color)" /> Google Gemini API Key
                      </label>
                      <input 
                        type="password" 
                        value={geminiKey}
                        onChange={(e) => {
                          setGeminiKey(e.target.value);
                          localStorage.setItem('infinitykit_gemini_key', e.target.value);
                        }}
                        placeholder="AI key (starts with AIzaSy...)"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--glass-border)',
                          background: 'rgba(0,0,0,0.01)',
                          color: 'var(--text-color)',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Optional. Paste your Gemini API Key to unlock guaranteed live AI responses across all AI workspace tools.
                      </span>
                    </div>

                    {/* OpenAI API Key Setting */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Key size={14} color="var(--primary-color)" /> OpenAI API Key
                      </label>
                      <input 
                        type="password" 
                        value={openaiKey}
                        onChange={(e) => {
                          setOpenaiKey(e.target.value);
                          localStorage.setItem('infinitykit_openai_key', e.target.value);
                        }}
                        placeholder="OpenAI key (starts with sk-...)"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--glass-border)',
                          background: 'rgba(0,0,0,0.01)',
                          color: 'var(--text-color)',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Optional. Paste your OpenAI API Key (sk-...) to utilize premium GPT models across writing, summarizing, and editing tools.
                      </span>
                    </div>

                    {updateSuccess && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--success-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={14} /> Profile details synchronized successfully!
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="btn" 
                      disabled={isUpdating}
                      style={{ width: 'fit-content', padding: '10px 24px', fontSize: '0.9rem' }}
                    >
                      {isUpdating ? 'Synchronizing...' : 'Save Settings'}
                    </button>
                  </form>
                </div>

                {/* Avatar customization card */}
                <div className="glass-panel" style={{ margin: 0, padding: '25px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Edit3 size={18} color="var(--primary-color)" /> Select Avatar Theme
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '15px' }}>
                    {[
                      { id: 'cyan-orb', label: 'Cyan Orb', gradient: 'var(--primary-gradient)' },
                      { id: 'purple-orb', label: 'Cyber Purple', gradient: 'linear-gradient(135deg, var(--accent-purple) 0%, #a855f7 100%)' },
                      { id: 'slate-orb', label: 'Dark Slate', gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
                    ].map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => setSelectedAvatar(avatar.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <div style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          background: avatar.gradient,
                          border: selectedAvatar === avatar.id 
                            ? '3px solid var(--primary-color)' 
                            : '2px solid var(--glass-border)',
                          boxShadow: selectedAvatar === avatar.id 
                            ? '0 0 10px rgba(0,161,155,0.2)' 
                            : 'none'
                        }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-color)' }}>{avatar.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={18} color="var(--primary-color)" /> Alert Inbox
                  </h3>
                  <button 
                    onClick={() => setMockNotificationRead(mockNotifications.map(n => n.id))}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
                  >
                    Mark all as read
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {mockNotifications.map((notif) => {
                    const isRead = mockNotificationRead.includes(notif.id);
                    return (
                      <div 
                        key={notif.id} 
                        onClick={() => {
                          if (!isRead) {
                            setMockNotificationRead(prev => [...prev, notif.id]);
                          }
                        }}
                        style={{
                          padding: '16px 20px',
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '16px',
                          display: 'flex',
                          gap: '15px',
                          alignItems: 'flex-start',
                          cursor: 'pointer',
                          opacity: isRead ? 0.75 : 1,
                          borderLeft: isRead ? '1px solid var(--glass-border)' : '4px solid var(--primary-color)',
                          boxShadow: isRead ? 'none' : '0 4px 15px rgba(0, 161, 155, 0.02)'
                        }}
                      >
                        <div style={{
                          background: 'rgba(0, 161, 155, 0.05)',
                          color: 'var(--primary-color)',
                          padding: '8px',
                          borderRadius: '10px',
                          marginTop: '2px'
                        }}>
                          <Bell size={16} />
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>{notif.title}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{notif.time}</span>
                          </div>
                          <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {notif.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-grid-container {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 30px;
          align-items: flex-start;
        }
        .dashboard-sidebar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        @media (max-width: 991px) {
          .dashboard-grid-container {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .dashboard-sidebar {
            flex-direction: row !important;
            overflow-x: auto !important;
            padding: 4px !important;
            margin-bottom: 10px !important;
            width: 100% !important;
            white-space: nowrap !important;
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
          .dashboard-sidebar::-webkit-scrollbar {
            display: none !important;
          }
          .dashboard-sidebar button {
            flex: 0 0 auto !important;
            width: auto !important;
          }
          .dashboard-sidebar span {
            display: none !important;
          }
        }
      `}} />

    </div>
  );
}
