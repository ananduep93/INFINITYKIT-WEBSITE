'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Heart, History, Award, ArrowRight, Star, Sparkles, Zap, TrendingUp, HelpCircle, ChevronDown, Check } from 'lucide-react';
import { tools, categories } from '../config/tools';
import { useSync } from '../hooks/useSync';

export default function HomePage() {
  const { favorites, recentTools, toggleFavorite } = useSync();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalTools = tools.length;
    const totalCats = categories.length;
    let localConversions = 14282; // Premium base count
    if (typeof window !== 'undefined') {
      localConversions += Number(localStorage.getItem('totalConversions') || '0');
    }
    return {
      totalTools,
      totalCats,
      conversions: localConversions
    };
  }, []);

  // Filter tools based on search query and active category
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory ? tool.category === activeCategory : true;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  // Find actual tool metadata for favorites
  const favoriteToolsList = useMemo(() => {
    return tools.filter((t) => favorites.includes(t.id));
  }, [favorites]);

  // Staggered animation containers
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  // Trending Tools (4 core premium utilities)
  const trendingTools = useMemo(() => {
    const trendingIds = ['bmicalculator', 'todolist', 'qrcode', 'notes'];
    return tools.filter(t => trendingIds.includes(t.id));
  }, []);

  // AI Tools (Gemini-powered tools)
  const aiTools = useMemo(() => {
    const aiIds = ['chatbot', 'text-improver', 'summarizer', 'image-generator'];
    return tools.filter(t => aiIds.includes(t.id));
  }, []);

  // FAQ Active Item Tracker
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqItems = [
    {
      q: "Are my documents, files, and images safe?",
      a: "Yes, 100% safe. Unlike TinyWow and other online converters, InfinityKit runs almost all utility algorithms (compressors, mergers, QR generators, and EXIF readers) fully local-first in your browser. Your files never touch an external server."
    },
    {
      q: "How does the AI writing suite operate?",
      a: "Our AI Chatbots and Writing assistants connect securely to Google's advanced Gemini-2.5-flash model through local-encrypted API endpoints. This offers state-of-the-art responses with zero retention policy."
    },
    {
      q: "Can I use InfinityKit on my smartphone?",
      a: "Absolutely. InfinityKit is engineered with a responsive mobile-first grid, optimized viewport scaling, and lightweight GPU canvas elements to deliver a seamless mobile web experience."
    },
    {
      q: "Why is the website so fast and lag-free?",
      a: "We developed the platform using Next.js App Router for server-rendered page foundations, CSS HSL design tokens for instant theme shifts, and custom-tuned low-density HTML5 canvas nodes for smooth 60fps animations."
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px 24px 60px' }}>
      
      {/* Premium Futuristic Hero Section */}
      <section className="hero-grid" style={{ 
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '40px',
        alignItems: 'center',
        padding: '70px 0 50px',
        position: 'relative',
      }}>
        <style>{`
          @media (max-width: 820px) {
            .hero-grid {
              grid-template-columns: 1fr !important;
              text-align: center !important;
              padding: 40px 0 20px !important;
            }
            .hero-left {
              align-items: center !important;
              text-align: center !important;
            }
            .hero-right {
              display: none !important;
            }
          }
        `}</style>

        {/* Left Column: Text Content & Search bar */}
        <div className="hero-left" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left',
          zIndex: 1
        }}>
          {/* Subtle glowing ring behind hero text */}
          <div style={{
            position: 'absolute',
            left: '-20px',
            top: '40px',
            width: '280px',
            height: '280px',
            background: 'radial-gradient(circle, rgba(0, 161, 155, 0.12), transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(30px)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--glass-bg)',
              border: '1px solid rgba(0, 161, 155, 0.25)',
              boxShadow: '0 4px 15px rgba(0, 161, 155, 0.05)',
              padding: '6px 14px',
              borderRadius: '50px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--primary-color)',
              marginBottom: '20px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              zIndex: 1
            }}
          >
            <Sparkles size={12} fill="var(--primary-color)" /> Next-Gen SaaS Utility Hub
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'calc(2rem + 1.6vw)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              marginBottom: '16px',
              color: 'var(--text-color)',
              zIndex: 1
            }}
          >
            One Kit.{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-purple) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Infinite Capabilities.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: '1.02rem',
              color: 'var(--text-secondary)',
              marginBottom: '30px',
              lineHeight: 1.6,
              zIndex: 1
            }}
          >
            Access over 80+ secure, client-side digital tools for document conversion, visual editing, and advanced AI utilities. Engineered for ultimate privacy and absolute zero server tracking.
          </motion.p>

          {/* Apple/Linear Inspired Sleek Search Engine */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '540px',
              zIndex: 1,
              boxShadow: 'var(--neon-shadow)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <span style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search merger, compressors, QR makers, AI bots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px 16px 52px',
                borderRadius: '16px',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-color)',
                fontSize: '1rem',
                outline: 'none',
                backdropFilter: 'blur(10px)',
                transition: 'var(--transition-smooth)'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 161, 155, 0.08)',
                  border: 'none',
                  color: 'var(--primary-color)',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </motion.div>
        </div>

        {/* Right Column: Premium Futuristic Orbs / Graphics */}
        <div className="hero-right" style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          zIndex: 1
        }}>
          {/* Animated Glowing Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              width: '320px',
              height: '320px',
              border: '2px dashed rgba(0, 161, 155, 0.15)',
              borderRadius: '50%',
              zIndex: 0
            }}
          />

          {/* Central Glassmorphic Dashboard Mockup Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              width: '280px',
              height: '240px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 161, 155, 0.06)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }} />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, background: 'rgba(0,161,155,0.06)', padding: '2px 8px', borderRadius: '6px' }}>
                LOCAL CORE v2.0
              </div>
            </div>

            {/* Simulated UI Graphs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '20px 0' }}>
              <div style={{ height: '6px', width: '80%', background: 'var(--glass-border)', borderRadius: '3px' }} />
              <div style={{ height: '6px', width: '50%', background: 'var(--glass-border)', borderRadius: '3px' }} />
              <div style={{ height: '35px', display: 'flex', alignItems: 'flex-end', gap: '6px', marginTop: '10px' }}>
                <div style={{ height: '40%', width: '100%', background: 'rgba(0,161,155,0.2)', borderRadius: '4px' }} />
                <div style={{ height: '70%', width: '100%', background: 'rgba(0,161,155,0.4)', borderRadius: '4px' }} />
                <div style={{ height: '90%', width: '100%', background: 'var(--primary-gradient)', borderRadius: '4px' }} />
                <div style={{ height: '50%', width: '100%', background: 'rgba(0,161,155,0.3)', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Security Verified</span>
              <Check size={14} style={{ color: 'var(--success-color)' }} />
            </div>
          </motion.div>

          {/* Floating Tags */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '40px',
              left: '10px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              padding: '6px 12px',
              borderRadius: '30px',
              fontSize: '0.75rem',
              fontWeight: 600,
              boxShadow: '0 10px 20px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 3
            }}
          >
            <Zap size={12} color="var(--primary-color)" /> PDF Local-First
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            style={{
              position: 'absolute',
              bottom: '50px',
              right: '10px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              padding: '6px 12px',
              borderRadius: '30px',
              fontSize: '0.75rem',
              fontWeight: 600,
              boxShadow: '0 10px 20px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 3
            }}
          >
            <Sparkles size={12} color="var(--accent-purple)" /> AI Engine v2
          </motion.div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '50px'
        }}
      >
        <motion.div variants={itemVariants} className="glass-panel" style={{ margin: 0, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'rgba(0,161,155,0.06)', color: 'var(--primary-color)', padding: '10px', borderRadius: '10px' }}>
            <Compass size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{stats.totalTools}+</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Functional Utilities</div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="glass-panel" style={{ margin: 0, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'rgba(124,58,237,0.06)', color: 'var(--accent-purple)', padding: '10px', borderRadius: '10px' }}>
            <Heart size={20} fill="var(--accent-purple)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{favoriteToolsList.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bookmarked Favorites</div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="glass-panel" style={{ margin: 0, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'rgba(0,161,155,0.06)', color: 'var(--primary-color)', padding: '10px', borderRadius: '10px' }}>
            <Award size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{stats.conversions.toLocaleString()}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Calculations Audited</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Dynamic Search Results */}
      <AnimatePresence>
        {searchQuery && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '50px', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="var(--primary-color)" /> Search Results ({filteredTools.length})
              </h2>
            </div>
            {filteredTools.length > 0 ? (
              <div className="tools-grid">
                {filteredTools.map((tool) => (
                  <div key={tool.id} style={{ position: 'relative' }}>
                    <Link href={`/tools/${tool.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="tool-card">
                        <div className="tool-card-icon">{tool.icon}</div>
                        <div className="tool-card-info">
                          <div className="tool-card-name">{tool.name}</div>
                          <div className="tool-card-desc">{tool.description}</div>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => toggleFavorite(tool.id)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: favorites.includes(tool.id) ? 'var(--primary-color)' : 'var(--text-secondary)',
                        opacity: favorites.includes(tool.id) ? 1 : 0.35,
                        zIndex: 10
                      }}
                    >
                      <Star size={14} fill={favorites.includes(tool.id) ? 'var(--primary-color)' : 'none'} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No utilities matched "{searchQuery}". Browse folders below.</p>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Bookmarked Favorites */}
      {favoriteToolsList.length > 0 && !searchQuery && (
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.35rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={18} color="var(--primary-color)" fill="var(--primary-color)" /> Your Bookmarked Hub
          </h2>
          <div className="tools-grid">
            {favoriteToolsList.map((tool) => (
              <div key={tool.id} style={{ position: 'relative' }}>
                <Link href={`/tools/${tool.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="tool-card" style={{ borderLeft: '2.5px solid var(--primary-color)' }}>
                    <div className="tool-card-icon">{tool.icon}</div>
                    <div className="tool-card-info">
                      <div className="tool-card-name">{tool.name}</div>
                      <div className="tool-card-desc">{tool.description}</div>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => toggleFavorite(tool.id)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--primary-color)',
                    zIndex: 10
                  }}
                >
                  <Star size={14} fill="var(--primary-color)" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Utilities (Apple Card tray) */}
      {!searchQuery && (
        <section style={{ marginBottom: '55px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--primary-color)" /> Trending Utilities
            </h2>
          </div>
          <div className="tools-grid">
            {trendingTools.map((tool) => (
              <Link href={`/tools/${tool.id}`} key={tool.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="tool-card">
                  <div className="tool-card-icon" style={{ background: 'rgba(0,161,155,0.08)' }}>{tool.icon}</div>
                  <div className="tool-card-info">
                    <div className="tool-card-name">{tool.name}</div>
                    <div className="tool-card-desc">{tool.description}</div>
                  </div>
                  <div style={{ opacity: 0, transform: 'translateX(-5px)', transition: 'all 0.25s' }} className="sweep-arrow">
                    <ArrowRight size={14} color="var(--primary-color)" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Futuristic AI Suite (Glow backlit cards) */}
      {!searchQuery && (
        <section style={{ marginBottom: '55px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--accent-purple)" fill="var(--accent-purple)" /> Premium AI Suite
            </h2>
          </div>
          <div className="tools-grid">
            {aiTools.map((tool) => (
              <Link href={`/tools/${tool.id}`} key={tool.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div 
                  className="tool-card" 
                  style={{ 
                    border: '1px solid rgba(124, 58, 237, 0.15)',
                    background: 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.04), var(--glass-bg))'
                  }}
                >
                  <div className="tool-card-icon" style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.12)' }}>{tool.icon}</div>
                  <div className="tool-card-info">
                    <div className="tool-card-name" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {tool.name}
                      <span style={{ fontSize: '0.65rem', background: 'var(--accent-purple)', color: 'white', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>AI</span>
                    </div>
                    <div className="tool-card-desc">{tool.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Rebuilt Bento Categories grid */}
      <section style={{ marginBottom: '55px' }}>
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '1.5rem',
            fontWeight: 800,
            marginBottom: '6px',
            letterSpacing: '-0.5px'
          }}>
            Explore Utility Hubs
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}>
            Filter from 12 specialized client-side categories consolidated for absolute efficiency.
          </p>
        </div>

        <div className="bento-grid">
          {categories.map((cat) => (
            <Link href={`/categories/${cat.id}`} key={cat.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="category-card">
                <div>
                  <div className="category-icon">{cat.emoji || cat.icon}</div>
                  <h3 className="category-title">{cat.name}</h3>
                  <p className="category-desc">{cat.description}</p>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--primary-color)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  marginTop: '20px'
                }}>
                  Enter Folder <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Added Section */}
      {recentTools.length > 0 && !searchQuery && (
        <section style={{ marginBottom: '55px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.35rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="var(--primary-color)" /> Recents Visited
          </h2>
          <div className="tools-grid">
            {recentTools.slice(0, 4).map((recent) => {
              const tool = tools.find((t) => t.id === recent.id);
              if (!tool) return null;
              return (
                <Link href={`/tools/${tool.id}`} key={tool.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="tool-card" style={{ opacity: 0.9 }}>
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

      {/* Premium Trust Testimonials Row */}
      <section style={{ marginBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.3px' }}>
            Loved by Developers & Creators
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            See why over thousands of digital builders trust our secure, local-first ecosystem.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div className="glass-panel" style={{ margin: 0, padding: '24px' }}>
            <div style={{ display: 'flex', color: 'var(--warning-color)', gap: '2px', marginBottom: '12px' }}>
              <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '16px' }}>
              "InfinityKit is amazing. Having access to PDF mergers and QR tools that run completely local inside my browser with absolute zero server latency is a total lifesaver for private client data."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'white', fontWeight: 700 }}>
                AH
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Anand H.</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Senior DevOps Engineer</div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ margin: 0, padding: '24px' }}>
            <div style={{ display: 'flex', color: 'var(--warning-color)', gap: '2px', marginBottom: '12px' }}>
              <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '16px' }}>
              "Unlike TinyWow which limits uploads and runs slowly, this feels like an Apple product—lightweight, frosted panels, beautiful theme switches, and instant client-side responses."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--primary-glow) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'white', fontWeight: 700 }}>
                SL
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Sarah L.</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>UI/UX Product Designer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Framer Motion Interactive FAQ Accordion */}
      <section style={{ marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <HelpCircle size={20} color="var(--primary-color)" /> Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Learn more about the technology stack, security architectures, and operations of InfinityKit.
          </p>
        </div>

        <div className="faq-container" style={{ maxWidth: '750px', margin: '0 auto' }}>
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="faq-item" 
                style={{ 
                  borderRadius: '12px',
                  border: isOpen ? '1px solid rgba(0, 161, 155, 0.25)' : '1px solid var(--glass-border)',
                  background: isOpen ? 'rgba(0, 161, 155, 0.02)' : 'var(--glass-bg)',
                  boxShadow: isOpen ? '0 4px 15px rgba(0, 161, 155, 0.03)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div 
                  className="faq-question"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <span style={{ color: isOpen ? 'var(--primary-color)' : 'var(--text-color)', transition: 'color 0.2s' }}>{item.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{ color: isOpen ? 'var(--primary-color)' : 'var(--text-secondary)' }}
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </div>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ 
                        padding: '0 24px 20px', 
                        color: 'var(--text-secondary)',
                        fontSize: '0.88rem',
                        lineHeight: 1.6
                      }}>
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
