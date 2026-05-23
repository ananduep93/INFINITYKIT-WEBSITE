'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Zap, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ArrowRight, 
  Github, 
  Search, 
  Sparkles, 
  Bell, 
  Laptop, 
  ChevronRight,
  Download
} from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import { ThreeBackground } from './ThreeBackground';
import PageProgressBar from './PageProgressBar';
import { tools } from '../../config/tools';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // PWA & Notification states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');

  // Command Palette states
  const [showPalette, setShowPalette] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Register PWA Service Worker & check notifications status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Register service worker if supported
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
          .then((reg) => {
            console.log('PWA Service Worker registered successfully:', reg.scope);
          })
          .catch((err) => {
            console.error('PWA Service Worker registration failed:', err);
          });
      }

      // Check notification permission state
      if ('Notification' in window) {
        setNotificationStatus(Notification.permission);
      }
    }
  }, []);

  // Listen for beforeinstallprompt event for PWA Installer
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Listen for Ctrl+K global keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowPalette(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out? Your local sessions will be cleared for safety.')) {
      await logout();
      router.push('/');
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Install choice: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationStatus(permission);
        if (permission === 'granted') {
          new Notification("InfinityKit Premium Push Active", {
            body: "You will now receive instant push alerts for newly updated utilities! ✨",
            icon: "/icon-192.png"
          });
        }
      } catch (err) {
        console.error("Failed to request push notification permission:", err);
      }
    } else {
      alert("Push notifications are not supported in your current browser.");
    }
  };

  // Filter tools list inside search palette
  const filteredPaletteTools = useMemo(() => {
    if (paletteSearch.trim() === '') {
      return tools.slice(0, 8); // Show featured/top tools first when search is empty
    }
    return tools.filter(t => 
      t.name.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(paletteSearch.toLowerCase()))
    );
  }, [paletteSearch]);

  return (
    <>
      {/* 2px glowing top progress bar responding to route changes */}
      <PageProgressBar />
      
      {/* GPU Accelerated dynamic particle background */}
      <ThreeBackground />
      
      {/* Floating Header Navigation (Apple + Linear Inspired) */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'center',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: scrolled ? '1000px' : '1100px',
            padding: scrolled ? '12px 24px' : '18px 32px',
            background: theme === 'dark' ? 'rgba(10, 12, 16, 0.7)' : 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: scrolled ? '50px' : '20px',
            border: theme === 'dark' 
              ? scrolled ? '1px solid rgba(0, 240, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.04)'
              : scrolled ? '1px solid rgba(0, 161, 155, 0.15)' : '1px solid rgba(0, 0, 0, 0.04)',
            boxShadow: scrolled 
              ? theme === 'dark' ? '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 240, 255, 0.05)' : '0 12px 40px rgba(0, 161, 155, 0.06)'
              : 'none',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Logo */}
          <Link href="/" prefetch={true} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 900,
                color: 'var(--text-color)',
                letterSpacing: '-0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div style={{
                background: 'var(--primary-gradient)',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 161, 155, 0.2)'
              }}>
                <Zap size={16} color="white" fill="white" />
              </div>
              INFINITYKIT
            </span>
          </Link>
 
          {/* Desktop Links (Linear-inspired minimalism) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '30px',
              marginLeft: 'auto'
            }}
            className="desktop-nav"
          >
            <Link
              href="/"
              prefetch={true}
              style={{
                color: 'var(--text-color)',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: pathname === '/' ? 600 : 500,
                opacity: pathname === '/' ? 1 : 0.6,
                transition: 'opacity 0.2s',
                letterSpacing: '-0.1px'
              }}
            >
              Home
            </Link>
            <Link
              href="/tools"
              prefetch={true}
              style={{
                color: 'var(--text-color)',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: pathname.startsWith('/tools') ? 600 : 500,
                opacity: pathname.startsWith('/tools') ? 1 : 0.6,
                transition: 'opacity 0.2s',
                letterSpacing: '-0.1px'
              }}
            >
              All Tools
            </Link>
            <Link
              href="/blog"
              prefetch={true}
              style={{
                color: 'var(--text-color)',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: pathname.startsWith('/blog') ? 600 : 500,
                opacity: pathname.startsWith('/blog') ? 1 : 0.6,
                transition: 'opacity 0.2s',
                letterSpacing: '-0.1px'
              }}
            >
              Blog
            </Link>
            <Link
              href="/about"
              prefetch={true}
              style={{
                color: 'var(--text-color)',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: pathname === '/about' ? 600 : 500,
                opacity: pathname === '/about' ? 1 : 0.6,
                transition: 'opacity 0.2s',
                letterSpacing: '-0.1px'
              }}
            >
              About
            </Link>
            <Link
              href="/contact"
              prefetch={true}
              style={{
                color: 'var(--text-color)',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: pathname === '/contact' ? 600 : 500,
                opacity: pathname === '/contact' ? 1 : 0.6,
                transition: 'opacity 0.2s',
                letterSpacing: '-0.1px'
              }}
            >
              Contact
            </Link>

            {/* Divider line */}
            <div style={{ width: '1px', height: '14px', background: 'var(--glass-border)' }} />

            {/* Search Palette Toggle Trigger */}
            <button
              onClick={() => setShowPalette(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '50%',
                opacity: 0.8,
                transition: 'all 0.2s',
                marginRight: '-4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.8';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Open Command Palette"
              title="Search Palette (Ctrl+K)"
            >
              <Search size={18} />
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '50%',
                opacity: 0.8,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.8';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Toggle dark/light mode"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Auth Controls */}
            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-color)', textDecoration: 'none', fontWeight: 600 }}>
                  <User size={16} color="var(--primary-color)" />
                  <span style={{ fontSize: '0.85rem' }}>{user?.displayName || 'Dashboard'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--error-color)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                    opacity: 0.8,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link
                  href="/login"
                  style={{ 
                    color: 'var(--text-color)',
                    textDecoration: 'none', 
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    padding: '6px 14px',
                    borderRadius: '8px',
                    opacity: 0.8,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: scrolled ? '30px' : '10px', 
                    fontSize: '0.85rem', 
                    fontWeight: 600,
                    textDecoration: 'none',
                    background: 'var(--primary-gradient)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(0, 161, 155, 0.15)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-color)',
              cursor: 'pointer',
              padding: '6px',
              display: 'none',
              borderRadius: '8px'
            }}
            className="mobile-toggle"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: scrolled ? '65px' : '85px',
            left: '20px',
            right: '20px',
            background: theme === 'dark' ? 'rgba(12, 14, 18, 0.96)' : 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            padding: '24px',
            borderRadius: '20px',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            animation: 'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <Link href="/" style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>
            Home
          </Link>
          <Link href="/tools" style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>
            All Tools
          </Link>
          <Link href="/blog" style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>
            Blog
          </Link>
          <Link href="/about" style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>
            About
          </Link>
          <Link href="/contact" style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>
            Contact
          </Link>
          
          <div style={{ height: '1px', background: 'var(--glass-border)', margin: '5px 0' }} />

          {/* Mobile Search Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setShowPalette(true);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(0, 161, 155, 0.06)',
              color: 'var(--primary-color)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <Search size={16} /> Search & Command Palette
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Theme</span>
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-color)',
                padding: '6px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,161,155,0.06)'
              }}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>

          {isLoggedIn ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-color)', textDecoration: 'none', fontWeight: 600 }}>
                <User size={18} color="var(--primary-color)" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '10px', justifyContent: 'center' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <Link href="/login" style={{ width: '100%', textAlign: 'center', textDecoration: 'none', color: 'var(--text-color)', fontWeight: 500, padding: '10px' }}>
                Sign In
              </Link>
              <Link href="/signup" className="btn" style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area using semantic HTML */}
      <main style={{ minHeight: 'calc(100vh - 120px)', paddingTop: '100px' }}>
        {children}
      </main>

      {/* Global Futuristic SaaS Footer */}
      <footer
        style={{
          background: theme === 'dark' ? '#07090C' : '#FAFBFD',
          color: 'var(--text-color)',
          padding: '80px 40px 40px',
          marginTop: '80px',
          borderTop: '1px solid var(--glass-border)',
          fontSize: '0.9rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Neon glow inside footer background */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(0, 161, 155, 0.04), transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '50px',
            marginBottom: '60px',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.25rem', fontWeight: 900, marginBottom: '15px', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={18} color="var(--primary-color)" fill="var(--primary-color)" />
              INFINITYKIT
            </h3>
            <p style={{ lineHeight: 1.6, opacity: 0.7, fontSize: '0.85rem' }}>
              An elegant utility suite engineered completely client-side for total privacy and lightning speed. Open, secure, and tracker-free.
            </p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <a href="https://github.com/ananduep93/Infinity_Kit" aria-label="GitHub Repository" style={{ color: 'var(--text-secondary)' }}><Github size={18} /></a>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', color: 'var(--primary-color)' }}>Navigation</h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}>Home</Link>
              <Link href="/tools" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}>All Utilities</Link>
              <Link href="/blog" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}>Resource Blog</Link>
              <Link href="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}>About Us</Link>
              <Link href="/contact" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}>Contact</Link>
            </nav>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', color: 'var(--primary-color)' }}>Legal & Security</h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/privacy-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Privacy Policy</Link>
              <Link href="/terms-conditions" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Terms & Conditions</Link>
              <Link href="/cookie-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Cookie Policy</Link>
              <Link href="/disclaimer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Disclaimer</Link>
            </nav>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', color: 'var(--primary-color)' }}>Direct Contact</h4>
            <p style={{ opacity: 0.7, fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '12px' }}>
              For support, integration inquiries, or suggestion tickets:
            </p>
            <a 
              href="mailto:infinitykit24@gmail.com" 
              style={{ 
                color: 'var(--text-color)', 
                textDecoration: 'none', 
                fontWeight: 600,
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              infinitykit24@gmail.com
              <ArrowRight size={14} color="var(--primary-color)" />
            </a>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            borderTop: '1px solid var(--glass-border)',
            paddingTop: '25px',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            position: 'relative',
            zIndex: 1
          }}
        >
          &copy; 2026 InfinityKit. Zero-server computations. Absolute browser privacy.
        </div>
      </footer>

      {/* 3. PREMIUM FLOATING PWA INSTALL BANNER */}
      {showInstallBanner && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 1100,
          maxWidth: '380px',
          width: 'calc(100% - 60px)',
          background: theme === 'dark' ? 'rgba(10, 15, 24, 0.85)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--primary-color)',
          borderRadius: '20px',
          padding: '20px 24px',
          boxShadow: '0 20px 50px rgba(0, 161, 155, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'pwa-slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--primary-gradient)', padding: '6px', borderRadius: '8px' }}>
                <Zap size={14} color="white" fill="white" />
              </div>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', fontWeight: 800 }}>Install InfinityKit App</span>
            </div>
            <button
              onClick={() => setShowInstallBanner(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Install the client-side utility suite directly on your device desktop for instantaneous offline access.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <button
              onClick={handleInstallClick}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #00A19B 0%, #00d2c7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                padding: '8px 16px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,161,155,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Download size={12} /> Install Web App
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              style={{
                background: 'none',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)',
                borderRadius: '30px',
                padding: '8px 16px',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* 4. PREMIUM FLOATING COMMAND PALETTE & SEARCH DIALOG */}
      {showPalette && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 5, 8, 0.75)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          zIndex: 1500,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '100px 20px'
        }}
        onClick={() => setShowPalette(false)}
        >
          <div 
            style={{
              maxWidth: '650px',
              width: '100%',
              background: theme === 'dark' ? 'rgba(10, 14, 20, 0.95)' : 'rgba(255, 255, 255, 0.97)',
              border: '1px solid var(--glass-border)',
              borderRadius: '24px',
              boxShadow: '0 25px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(0, 161, 155, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'palette-zoom 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 24px', borderBottom: '1px solid var(--glass-border)' }}>
              <Search size={20} color="var(--primary-color)" />
              <input
                type="text"
                placeholder="Search tools, AI solvers, calculators, converters..."
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                autoFocus
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-color)',
                  outline: 'none',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '1.05rem',
                  fontWeight: 500
                }}
              />
              <span style={{ fontSize: '0.72rem', background: 'var(--glass-border)', padding: '4px 8px', borderRadius: '6px', color: 'var(--text-secondary)', fontWeight: 600 }}>ESC</span>
            </div>

            {/* Quick Actions / Integration Toggles */}
            <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '15px', alignItems: 'center', background: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.01)', overflowX: 'auto' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Quick Settings:</span>
              
              <button 
                onClick={requestNotificationPermission}
                style={{
                  background: 'none', border: 'none', padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: notificationStatus === 'granted' ? 'rgba(46,204,113,0.08)' : 'rgba(0,161,155,0.05)',
                  color: notificationStatus === 'granted' ? '#2ecc71' : 'var(--primary-color)',
                  borderWidth: '1px', borderStyle: 'solid', borderColor: 'transparent'
                }}
              >
                <Bell size={12} /> {notificationStatus === 'granted' ? 'Push Granted ✓' : 'Enable Push Alerts 🔔'}
              </button>

              <button
                onClick={toggleTheme}
                style={{
                  background: 'none', border: '1px solid var(--glass-border)', padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />} Theme: {theme}
              </button>
            </div>

            {/* Results Scroll list */}
            <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '12px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px', padding: '8px 12px' }}>
                {paletteSearch.trim() === '' ? '⚡ FEATURED DYNAMIC TOOLS' : `🔎 SEARCH RESULTS (${filteredPaletteTools.length})`}
              </div>

              {filteredPaletteTools.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {filteredPaletteTools.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setShowPalette(false);
                        router.push(`/tools/${t.id}`);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: 'none',
                        background: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                      className="palette-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '1.4rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>{t.icon}</span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-color)' }}>{t.name}</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>{t.description || 'Intelligent, ultra-private client calculations.'}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="palette-arrow" style={{ color: 'var(--primary-color)', opacity: 0, transform: 'translateX(-5px)', transition: 'all 0.2s' }} />
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Sparkles size={24} style={{ opacity: 0.5, marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '0.82rem' }}>We couldn't find matches for &ldquo;{paletteSearch}&rdquo;.</p>
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div style={{ padding: '15px 24px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)', background: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.01)' }}>
              <span>Use ↑↓ to navigate & Enter to select</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Sparkles size={11} color="var(--primary-color)" /> Powered by Client-Side Edge Calculations</span>
            </div>

          </div>
        </div>
      )}

      {/* Embedded Styles for Responsive Controls */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pwa-slide-up {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes palette-zoom {
          from {
            transform: scale(0.97);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .palette-item:hover {
          background-color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'} !important;
        }

        .palette-item:hover .palette-arrow {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      `}</style>
    </>
  );
}
