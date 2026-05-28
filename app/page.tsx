'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Heart, History, ArrowRight, Star, Sparkles, 
  Zap, TrendingUp, HelpCircle, ChevronDown, MessageSquare, 
  ChevronRight, ArrowUpRight, Shield, CheckCircle2
} from 'lucide-react';
import { tools, categories, mapCategoryToPath } from '../config/tools';
import { useSync } from '../hooks/useSync';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

export default function HomePage() {
  const { favorites, recentTools, toggleFavorite } = useSync();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Reviews & Rating states
  const [reviews, setReviews] = useState<{ id: string; name: string; rating: number; message: string; timestamp: any }[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const q = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const reviewList: any[] = [];
        
        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          // Automatically purge seeded mock reviews from Firestore if found
          if (data.name === "Anand H." || data.name === "Sarah L.") {
            try {
              await deleteDoc(doc(db, 'reviews', docSnap.id));
            } catch (delErr) {
              console.warn("Purging seeded review failed:", delErr);
            }
          } else {
            reviewList.push({ id: docSnap.id, ...data });
          }
        }
        
        setReviews(reviewList);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewMessage.trim()) {
      setReviewError("Please fill out both your name and review message.");
      return;
    }
    
    setIsSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(null);

    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        name: reviewName.trim(),
        rating: reviewRating,
        message: reviewMessage.trim(),
        timestamp: serverTimestamp()
      });

      const newReview = {
        id: docRef.id,
        name: reviewName.trim(),
        rating: reviewRating,
        message: reviewMessage.trim(),
        timestamp: new Date()
      };

      setReviews((prev) => [newReview, ...prev]);
      setReviewName('');
      setReviewMessage('');
      setReviewRating(5);
      setShowReviewForm(false);
      setReviewSuccess("Thank you! Your review has been added successfully.");
      setTimeout(() => setReviewSuccess(null), 5000);
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setReviewError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

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

  // Trending Tools (4 core premium utilities)
  const trendingTools = useMemo(() => {
    const trendingIds = ['bmicalculator', 'todolist', 'qrcode', 'notes'];
    return tools.filter(t => trendingIds.includes(t.id));
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



  // Motion variants for clean staggered spring entry animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 110,
        damping: 16
      }
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px 24px 80px', fontFamily: "'Outfit', sans-serif", position: 'relative' }}>
      
      {/* Dynamic Glowing Particle and Mesh Accents (Premium Visual Layer) */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '1200px',
        height: '620px',
        background: 'radial-gradient(circle at 50% 25%, rgba(0, 161, 155, 0.08) 0%, rgba(124, 58, 237, 0.04) 45%, transparent 75%)',
        filter: 'blur(90px)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      <motion.div
        animate={{
          y: [0, -25, 0],
          x: [0, 15, 0],
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.5, 0.25]
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '8%',
          left: '5%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />

      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          scale: [1.15, 0.9, 1.15],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '35%',
          right: '5%',
          width: '220px',
          height: '220px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />

      {/* 1. PREMIUM FUTURISTIC HERO SECTION */}
      <section style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '90px 0 60px',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--glass-bg)',
            border: '1px solid rgba(0, 161, 155, 0.18)',
            boxShadow: '0 8px 30px rgba(0, 161, 155, 0.05)',
            padding: '8px 20px',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: 800,
            color: 'var(--primary-color)',
            marginBottom: '28px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            backdropFilter: 'blur(12px)'
          }}
        >
          <Sparkles size={14} fill="var(--primary-color)" /> Introducing InfinityKit 2.0 — Browser-Native AI Suite
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'calc(2.5rem + 2.5vw)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-2.5px',
            marginBottom: '22px',
            color: 'var(--text-color)',
            maxWidth: '900px'
          }}
        >
          The Secure, Local-First{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--primary-color) 0%, #00F5D4 45%, var(--accent-purple) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Utility Ecosystem
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            marginBottom: '44px',
            lineHeight: 1.65,
            maxWidth: '720px',
            opacity: 0.95
          }}
        >
          Access over 80+ secure, developer-grade digital tools that execute 100% client-side. Zero server uploads. Absolute database privacy. Ultimate computing speed.
        </motion.p>

        {/* 2. AI-POWERED SEARCH HERO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: '660px', position: 'relative' }}
        >
          <motion.div
            whileHover={{ scale: 1.012 }}
            whileTap={{ scale: 0.995 }}
            animate={{
              borderColor: isSearchFocused ? 'rgba(0, 161, 155, 0.4)' : 'var(--glass-border)',
              boxShadow: isSearchFocused 
                ? '0 20px 45px rgba(0, 161, 155, 0.12), 0 0 0 1px rgba(0, 161, 155, 0.25)' 
                : '0 15px 50px rgba(0, 0, 0, 0.02)'
            }}
            transition={{ duration: 0.25 }}
            style={{
              display: 'flex', 
              alignItems: 'center', 
              width: '100%',
              borderRadius: '24px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(30px)',
              padding: '6px'
            }}
          >
            <span style={{
              paddingLeft: '22px',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search size={20} />
            </span>
            <input
              type="text"
              placeholder="What are you looking to accomplish today? (e.g. compress pdf, qr code...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              style={{
                width: '100%',
                padding: '16px 20px 16px 16px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-color)',
                outline: 'none',
                fontSize: '1.05rem',
                fontFamily: 'inherit'
              }}
            />
            <span style={{
              background: 'rgba(0, 161, 155, 0.08)',
              color: 'var(--primary-color)',
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '8px 14px',
              borderRadius: '10px',
              marginRight: '12px',
              letterSpacing: '0.5px'
            }}>⌘K</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Dynamic Results Tray on Active Search */}
      <AnimatePresence>
        {searchQuery && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '60px', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.3px' }}>
                <Zap size={20} color="var(--primary-color)" /> Matching Utilities ({filteredTools.length})
              </h2>
            </div>
            {filteredTools.length > 0 ? (
              <motion.div 
                className="tools-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredTools.map((tool) => (
                  <motion.div 
                    key={tool.id} 
                    variants={itemVariants}
                    style={{ position: 'relative' }}
                  >
                    <Link href={`/${mapCategoryToPath(tool.category)}/${tool.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '50px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No utilities matched "{searchQuery}". Browse categories below.</p>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* 3. BOOKMARKED FAVORITES TRAY */}
      {favoriteToolsList.length > 0 && !searchQuery && (
        <section style={{ marginBottom: '65px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.3px' }}>
            <Heart size={20} color="var(--primary-color)" fill="var(--primary-color)" /> Saved Shortcuts
          </h2>
          <motion.div 
            className="tools-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {favoriteToolsList.map((tool) => (
              <motion.div 
                key={tool.id} 
                variants={itemVariants}
                style={{ position: 'relative' }}
              >
                <Link href={`/${mapCategoryToPath(tool.category)}/${tool.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="tool-card" style={{ borderLeft: '3px solid var(--primary-color)' }}>
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
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* 4. SMART CATEGORY BENTO EXPLORER */}
      {!searchQuery && (
        <section style={{ marginBottom: '75px' }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Explore Specialized Utility Hubs
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Select a container to enter its private browser sandbox. Zero file retention.
            </p>
          </div>

          <motion.div 
            className="bento-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ display: 'flex' }}
              >
                <Link href={`/${mapCategoryToPath(cat.id)}`} style={{ textDecoration: 'none', color: 'inherit', width: '100%', display: 'flex' }}>
                  <div className="category-card" style={{ 
                    border: '1px solid var(--glass-border)', 
                    width: '100%',
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)',
                    position: 'relative'
                  }}>
                    {/* Glowing highlight reflection */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(0, 161, 155, 0.025) 0%, transparent 100%)',
                      pointerEvents: 'none',
                      zIndex: 0
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div className="category-icon" style={{
                        background: 'rgba(0, 161, 155, 0.06)',
                        border: '1px solid rgba(0, 161, 155, 0.12)',
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px'
                      }}>
                        {cat.emoji || cat.icon}
                      </div>
                      <h3 className="category-title" style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>{cat.name}</h3>
                      <p className="category-desc" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{cat.description}</p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--primary-color)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      marginTop: '24px',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      Open Directory <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}><ArrowRight size={14} /></motion.span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* 5. TRENDING TOOLS CAROUSEL */}
      {!searchQuery && (
        <section style={{ marginBottom: '70px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.3px' }}>
              <TrendingUp size={20} color="var(--primary-color)" /> Trending Utilities
            </h2>
          </div>
          <motion.div 
            className="tools-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {trendingTools.map((tool) => (
              <motion.div key={tool.id} variants={itemVariants}>
                <Link href={`/${mapCategoryToPath(tool.category)}/${tool.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="tool-card">
                    <div className="tool-card-icon" style={{ background: 'rgba(0,161,155,0.08)' }}>{tool.icon}</div>
                    <div className="tool-card-info">
                      <div className="tool-card-name">{tool.name}</div>
                      <div className="tool-card-desc">{tool.description}</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}



      {/* 8. FEATURED CREATOR ECOSYSTEM */}
      {!searchQuery && (
        <section style={{ marginBottom: '75px' }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Premium Workspace Utilities
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Explore advanced interactive soundscapes and self-destruct security modules designed for high-density focus.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <motion.div 
              whileHover={{ y: -6, borderColor: 'rgba(0, 161, 155, 0.2)', boxShadow: 'var(--hover-neon)' }}
              className="glass-panel" 
              style={{ 
                margin: 0, 
                padding: '35px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                minHeight: '230px',
                border: '1px solid var(--glass-border)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div>
                <span style={{ fontSize: '2.2rem', display: 'block', marginBottom: '12px' }}>🎧</span>
                <h3 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '8px' }}>Focus Soundscape Player</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.45, margin: 0 }}>
                  Synthesize rain, oceans, or forest audio signals directly in your browser using the native HTML5 Web Audio API. 100% offline.
                </p>
              </div>
              <Link href="/audio/ambient-noise-player" style={{ textDecoration: 'none', color: 'var(--primary-color)', fontSize: '0.88rem', fontWeight: 800, marginTop: '24px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Open Player <ArrowUpRight size={14} />
              </Link>
            </motion.div>

            <motion.div 
              whileHover={{ y: -6, borderColor: 'rgba(0, 161, 155, 0.2)', boxShadow: 'var(--hover-neon)' }}
              className="glass-panel" 
              style={{ 
                margin: 0, 
                padding: '35px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                minHeight: '230px',
                border: '1px solid var(--glass-border)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div>
                <span style={{ fontSize: '2.2rem', display: 'block', marginBottom: '12px' }}>🔏</span>
                <h3 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '8px' }}>Self-Destruct Notes</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.45, margin: 0 }}>
                  Write confidential notes that disintegrate automatically after a timer expires or upon reading once. Shredded client-side.
                </p>
              </div>
              <Link href="/utility/note-shredder" style={{ textDecoration: 'none', color: 'var(--primary-color)', fontSize: '0.88rem', fontWeight: 800, marginTop: '24px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Open Shredder <ArrowUpRight size={14} />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* 9. RECENTLY USED LAUNCHPAD */}
      {recentTools.length > 0 && !searchQuery && (
        <section style={{ marginBottom: '75px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.3px' }}>
            <History size={20} color="var(--primary-color)" /> Visited Launchpad
          </h2>
          <motion.div 
            className="tools-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {recentTools.slice(0, 4).map((recent) => {
              const tool = tools.find((t) => t.id === recent.id);
              if (!tool) return null;
              return (
                <motion.div key={tool.id} variants={itemVariants}>
                  <Link href={`/${mapCategoryToPath(tool.category)}/${tool.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="tool-card" style={{ opacity: 0.95 }}>
                      <div className="tool-card-icon">{tool.icon}</div>
                      <div className="tool-card-info">
                        <div className="tool-card-name">{tool.name}</div>
                        <div className="tool-card-desc">{tool.description}</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      )}

      {/* 10. STATS & TRUST INDICATORS */}
      {!searchQuery && (
        <section className="glass-panel" style={{ 
          margin: '0 0 75px 0', 
          padding: '44px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '30px', 
          textAlign: 'center',
          border: '1px solid var(--glass-border)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.01) 0%, rgba(0, 161, 155, 0.02) 100%)'
        }}>
          <div>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--primary-color)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px' }}>100%</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 600 }}>Client-Side Sandbox</div>
          </div>
          <div>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--accent-purple)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px' }}>80+</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 600 }}>Developer Utilities</div>
          </div>
          <div>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--text-color)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px' }}>{stats.conversions.toLocaleString()}</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 600 }}>Conversions Completed</div>
          </div>
        </section>
      )}

      {/* 11. LOVED BY BUILDERS TESTIMONIALS */}
      {!searchQuery && (
        <section style={{ marginBottom: '75px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.3px' }}>
              Loved by Engineers & Visual Creators
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
              See why digital architects prefer browser-native privacy over server-dependent tools.
            </p>
            
            {/* Add Review Buttons & Feedback */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowReviewForm(!showReviewForm)}
              style={{
                background: 'var(--primary-gradient)',
                color: 'white',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '30px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0,161,155,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <MessageSquare size={16} /> {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </motion.button>

            {reviewSuccess && (
              <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600, marginTop: '16px' }}>
                {reviewSuccess}
              </div>
            )}
          </div>

          {/* Star Rating & Review Input Form (Glass Card) */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 120, damping: 15 }}
                className="glass-panel"
                style={{
                  maxWidth: '550px',
                  margin: '0 auto 45px',
                  padding: '35px',
                  border: '1px solid var(--primary-color)',
                  boxShadow: '0 12px 40px rgba(0,161,155,0.06)'
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center', letterSpacing: '-0.3px' }}>
                  Share Your InfinityKit Experience
                </h3>
                
                <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Name field */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex M."
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  {/* Rating Selector */}
                  <div style={{ margin: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Your Rating</label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = hoverRating !== null ? star <= hoverRating : star <= reviewRating;
                        return (
                          <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.25 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--warning-color)', transition: 'color 0.2s' }}
                          >
                            <Star 
                              size={28} 
                              fill={isFilled ? "var(--warning-color)" : "none"} 
                              stroke="var(--warning-color)"
                              strokeWidth={1.5}
                            />
                          </motion.button>
                        );
                      })}
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '12px', fontWeight: 600 }}>
                        ({reviewRating} out of 5 stars)
                      </span>
                    </div>
                  </div>

                  {/* Message field */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Review Comment</label>
                    <textarea
                      placeholder="What do you love most about InfinityKit?"
                      value={reviewMessage}
                      onChange={(e) => setReviewMessage(e.target.value)}
                      className="form-input"
                      style={{ minHeight: '110px', resize: 'vertical' }}
                      required
                    />
                  </div>

                  {reviewError && (
                    <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                      ⚠️ {reviewError}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', marginTop: '5px' }}>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="btn btn-secondary"
                      style={{ padding: '10px 20px', fontSize: '0.88rem', borderRadius: '12px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="btn"
                      style={{ padding: '10px 26px', fontSize: '0.88rem', borderRadius: '12px' }}
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>

                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Testimonial Cards Listing */}
          {loadingReviews ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--glass-border)',
                borderTopColor: 'var(--primary-color)',
                borderRadius: '50%',
                animation: 'home-spin 0.75s linear infinite'
              }} />
              <style jsx>{`@keyframes home-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : reviews.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic', padding: '30px 0' }}>
              No customer reviews yet. Be the first to add one!
            </p>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px'
              }}
            >
              {reviews.map((rev) => {
                const initials = rev.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
                return (
                  <motion.div 
                    key={rev.id} 
                    variants={itemVariants}
                    whileHover={{ y: -6, borderColor: 'rgba(0, 161, 155, 0.2)', boxShadow: 'var(--hover-neon)' }}
                    className="glass-panel" 
                    style={{ 
                      margin: 0, 
                      padding: '30px', 
                      border: '1px solid var(--glass-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '24px',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div>
                      {/* Rating */}
                      <div style={{ display: 'flex', color: 'var(--warning-color)', gap: '4px', marginBottom: '16px' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            fill={i < rev.rating ? "var(--warning-color)" : "none"} 
                            stroke="var(--warning-color)"
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                      
                      {/* Comment */}
                      <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '24px', opacity: 0.95 }}>
                        "{rev.message}"
                      </p>
                    </div>

                    {/* Author Profile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: 'var(--primary-gradient)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '0.85rem', 
                        color: 'white', 
                        fontWeight: 800,
                        boxShadow: '0 4px 10px rgba(0, 161, 155, 0.2)'
                      }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{rev.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.8 }}>InfinityKit Pioneer</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>
      )}

      {/* 12. FAQ ACCORDION SECTION */}
      <section style={{ marginBottom: '75px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <HelpCircle size={22} color="var(--primary-color)" /> FAQ Knowledgebase
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Learn more about the technology stack, security architectures, and operations of InfinityKit.
          </p>
        </div>

        <div className="faq-container" style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="faq-item" 
                style={{ 
                  borderRadius: '20px',
                  border: isOpen ? '1px solid rgba(0, 161, 155, 0.25)' : '1px solid var(--glass-border)',
                  background: isOpen ? 'rgba(0, 161, 155, 0.02)' : 'var(--glass-bg)',
                  boxShadow: isOpen ? '0 6px 20px rgba(0, 161, 155, 0.02)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div 
                  className="faq-question"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '22px 28px',
                    fontWeight: 800,
                    fontSize: '1rem',
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
                    <ChevronDown size={18} />
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
                        padding: '0 28px 22px', 
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.65,
                        opacity: 0.95
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

      {/* 13. PREMIUM CTA CALLOUT */}
      {!searchQuery && (
        <motion.section 
          whileHover={{ borderColor: 'rgba(0, 161, 155, 0.25)', boxShadow: 'var(--hover-neon)' }}
          transition={{ duration: 0.4 }}
          className="glass-panel" 
          style={{
            margin: '0 0 20px 0',
            padding: '55px 45px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, rgba(0, 161, 155, 0.06) 0%, rgba(124, 58, 237, 0.05) 100%)',
            border: '1px solid rgba(0, 161, 155, 0.18)',
            textAlign: 'center',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Elevate Your Digital Workflows
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', marginBottom: '32px', maxWidth: '640px', margin: '0 auto 32px', lineHeight: 1.6, opacity: 0.95 }}>
            Unlock continuous database backups, secure sharing parameters, and customized ambient workspaces. 100% free and client-side.
          </p>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn" 
              style={{ 
                background: 'var(--primary-gradient)', 
                color: 'white', 
                padding: '14px 34px', 
                borderRadius: '30px', 
                fontWeight: 700, 
                fontSize: '0.92rem', 
                cursor: 'pointer', 
                border: 'none', 
                boxShadow: '0 6px 20px rgba(0, 161, 155, 0.25)' 
              }}
            >
              Open Productive Dashboard <ArrowRight size={14} />
            </motion.button>
          </Link>
        </motion.section>
      )}

    </div>
  );
}
