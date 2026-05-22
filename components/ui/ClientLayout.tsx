'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, Sun, Moon, User, LogOut, Menu, X, ArrowRight, Github } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import { ThreeBackground } from './ThreeBackground';
import PageProgressBar from './PageProgressBar';

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

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out? Your local sessions will be cleared for safety.')) {
      await logout();
      router.push('/');
    }
  };

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

            {/* Divider line */}
            <div style={{ width: '1px', height: '14px', background: 'var(--glass-border)' }} />

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
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
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
          
          <div style={{ height: '1px', background: 'var(--glass-border)', margin: '5px 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      `}</style>
    </>
  );
}
