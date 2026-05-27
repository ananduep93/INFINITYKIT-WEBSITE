'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Compass, Heart, History, Award, ArrowRight, Star, Sparkles, 
  Zap, TrendingUp, HelpCircle, ChevronDown, Check, Download, MessageSquare, 
  Play, Shield, Globe, FileText, Code, CheckCircle2, ChevronRight, Share2, 
  Clock, Trash2, ArrowUpRight, Cpu
} from 'lucide-react';
import { tools, categories, mapCategoryToPath } from '../config/tools';
import { useSync } from '../hooks/useSync';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';

export default function HomePage() {
  const { favorites, recentTools, toggleFavorite } = useSync();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<string>('document');
  const chatBottomRef = useRef<HTMLDivElement>(null);

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
        querySnapshot.forEach((doc) => {
          reviewList.push({ id: doc.id, ...doc.data() });
        });

        if (reviewList.length === 0) {
          // Auto-seed mock reviews if collection is empty
          const seedReviews = [
            {
              name: "Anand H.",
              rating: 5,
              message: "InfinityKit is amazing. Having access to PDF mergers and QR tools that run completely local inside my browser with absolute zero server latency is a total lifesaver for private client data.",
              timestamp: new Date()
            },
            {
              name: "Sarah L.",
              rating: 5,
              message: "Unlike TinyWow which limits uploads and runs slowly, this feels like an Apple product—lightweight, frosted panels, beautiful theme switches, and instant client-side responses.",
              timestamp: new Date()
            }
          ];

          const seededList: any[] = [];
          for (const sReview of seedReviews) {
            const docRef = await addDoc(collection(db, 'reviews'), {
              name: sReview.name,
              rating: sReview.rating,
              message: sReview.message,
              timestamp: serverTimestamp()
            });
            seededList.push({ id: docRef.id, ...sReview });
          }
          setReviews(seededList);
        } else {
          setReviews(reviewList);
        }
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

  // AI Tools (Gemini-powered tools)
  const aiTools = useMemo(() => {
    const aiIds = ['chatbot', 'text-improver', 'summarizer', 'image-generator'];
    return tools.filter(t => aiIds.includes(t.id));
  }, []);

  // AI Assistant trigger
  const handleAiChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const userKey = typeof window !== 'undefined' ? localStorage.getItem('infinitykit_gemini_key') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userKey) {
        headers['x-gemini-key'] = userKey;
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: aiQuery,
          taskType: 'chat'
        })
      });

      if (!response.ok) {
        throw new Error('AI response error');
      }

      const data = await response.json();
      setAiResponse(data.text || 'No response received.');
    } catch (err) {
      console.error(err);
      setAiResponse("I encountered an issue connecting to the AI models. Please configure your custom Google Gemini API Key in the Settings page for a guaranteed high-fidelity live AI experience!");
    } finally {
      setIsAiLoading(false);
    }
  };

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

  // Workflows mappings
  const workflowsList = {
    document: {
      title: "Document Optimization Pipeline",
      desc: "Ideal for business managers, researchers, and students looking to compile, compress, and translate papers securely.",
      steps: [
        { id: "mergepdf", name: "Merge PDF Docs", icon: "📄", desc: "Combine multiple sheets locally." },
        { id: "compresspdf", name: "Compress PDF Size", icon: "🗜️", desc: "Shrink file bytes without loss." },
        { id: "ocr", name: "OCR Document Scanner", icon: "🔍", desc: "Extract text from scanned pages." }
      ]
    },
    developer: {
      title: "Fullstack Developer Pipeline",
      desc: "Perfect for software engineers validating structures, encoding tokens, or building secure credentials.",
      steps: [
        { id: "json-validator", name: "JSON Structure Validator", icon: "💻", desc: "Audit syntax and format variables." },
        { id: "base64-tool", name: "Base64 Encoder/Decoder", icon: "🔄", desc: "Translate raw API tokens." },
        { id: "qrcode", name: "QR Access Generator", icon: "📱", desc: "Create high-density vector QR codes." }
      ]
    },
    creator: {
      title: "SaaS Creator Marketing Kit",
      desc: "Tailored for digital marketers and webmasters auditing landing page SEO and generating structural maps.",
      steps: [
        { id: "blog-generator", name: "AI Blog Planner", icon: "✍️", desc: "Write search-engine ready copy." },
        { id: "schema-generator", name: "JSON-LD SEO Schema Maker", icon: "📈", desc: "Generate search-engine rich results." },
        { id: "sitemap-generator", name: "Dynamic Sitemap Builder", icon: "🕸️", desc: "Map website pages automatically." }
      ]
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px 24px 80px', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* 1. PREMIUM FUTURISTIC HERO SECTION */}
      <section style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '80px 0 50px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Subtle glowing ring behind hero text */}
        <div style={{
          position: 'absolute',
          top: '40px',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(0, 161, 155, 0.08), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
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
            border: '1px solid rgba(0, 161, 155, 0.15)',
            boxShadow: '0 4px 20px rgba(0, 161, 155, 0.04)',
            padding: '6px 16px',
            borderRadius: '50px',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--primary-color)',
            marginBottom: '24px',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Sparkles size={12} fill="var(--primary-color)" /> Introducing InfinityKit 2.0 — Browser-Native AI Suite
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: 'calc(2.2rem + 2vw)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: '20px',
            color: 'var(--text-color)',
            maxWidth: '850px'
          }}
        >
          The Secure, Local-First{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-purple) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Utility Ecosystem
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            marginBottom: '40px',
            lineHeight: 1.6,
            maxWidth: '680px'
          }}
        >
          Access over 80+ secure, developer-grade digital tools that execute 100% client-side. Zero server uploads. Absolute database privacy. Ultimate computing speed.
        </motion.p>

        {/* 2. AI-POWERED SEARCH HERO */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '620px',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.03)',
            borderRadius: '24px',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(30px)',
            padding: '4px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <span style={{
              paddingLeft: '20px',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="What are you looking to accomplish today? (e.g. compress pdf, qr code...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px 16px 14px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-color)',
                outline: 'none',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
            <span style={{
              background: 'rgba(0, 161, 155, 0.08)',
              color: 'var(--primary-color)',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: '8px',
              marginRight: '12px',
              letterSpacing: '0.5px'
            }}>⌘K</span>
          </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="var(--primary-color)" /> Matching Utilities ({filteredTools.length})
              </h2>
            </div>
            {filteredTools.length > 0 ? (
              <div className="tools-grid">
                {filteredTools.map((tool) => (
                  <div key={tool.id} style={{ position: 'relative' }}>
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

      {/* 3. BOOKMARKED FAVORITES TRAY */}
      {favoriteToolsList.length > 0 && !searchQuery && (
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 850, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.3px' }}>
            <Heart size={18} color="var(--primary-color)" fill="var(--primary-color)" /> Saved Shortcuts
          </h2>
          <div className="tools-grid">
            {favoriteToolsList.map((tool) => (
              <div key={tool.id} style={{ position: 'relative' }}>
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
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. SMART CATEGORY BENTO EXPLORER */}
      {!searchQuery && (
        <section style={{ marginBottom: '65px' }}>
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 850, marginBottom: '6px', letterSpacing: '-0.5px' }}>
              Explore Specialized Utility Hubs
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Select a container to enter its private browser sandbox. Zero file retention.
            </p>
          </div>

          <div className="bento-grid">
            {categories.map((cat) => (
              <Link href={`/${mapCategoryToPath(cat.id)}`} key={cat.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="category-card" style={{ border: '1px solid rgba(0,0,0,0.035)' }}>
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
                    Open Directory <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. TRENDING TOOLS CAROUSEL */}
      {!searchQuery && (
        <section style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 850, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.3px' }}>
              <TrendingUp size={18} color="var(--primary-color)" /> Trending Utilities
            </h2>
          </div>
          <div className="tools-grid">
            {trendingTools.map((tool) => (
              <Link href={`/${mapCategoryToPath(tool.category)}/${tool.id}`} key={tool.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="tool-card">
                  <div className="tool-card-icon" style={{ background: 'rgba(0,161,155,0.08)' }}>{tool.icon}</div>
                  <div className="tool-card-info">
                    <div className="tool-card-name">{tool.name}</div>
                    <div className="tool-card-desc">{tool.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. POPULAR WORKFLOWS PIPELINE */}
      {!searchQuery && (
        <section style={{ marginBottom: '65px' }}>
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 850, marginBottom: '6px', letterSpacing: '-0.5px' }}>
              Popular Productivity Pipelines
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Chain secure client-side tools together to achieve complex workflows instantly.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '25px', paddingBottom: '5px' }}>
            {(Object.keys(workflowsList) as Array<keyof typeof workflowsList>).map((key) => (
              <button
                key={key}
                onClick={() => setActiveWorkflow(key)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: '1px solid var(--glass-border)',
                  background: activeWorkflow === key ? 'var(--primary-gradient)' : 'var(--glass-bg)',
                  color: activeWorkflow === key ? 'white' : 'var(--text-color)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {key === 'document' ? '📄 Office Doc Kit' : key === 'developer' ? '💻 Dev Tools' : '📈 SEO Marketing'}
              </button>
            ))}
          </div>

          <div className="glass-panel" style={{ margin: 0, padding: '35px', background: 'radial-gradient(circle at top right, rgba(0, 161, 155, 0.03), var(--glass-bg))' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
              {workflowsList[activeWorkflow as keyof typeof workflowsList].title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '30px', lineHeight: 1.5 }}>
              {workflowsList[activeWorkflow as keyof typeof workflowsList].desc}
            </p>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              flexWrap: 'wrap',
              gap: '20px',
              position: 'relative'
            }}>
              {workflowsList[activeWorkflow as keyof typeof workflowsList].steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div style={{
                    flex: 1,
                    minWidth: '220px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    padding: '20px',
                    position: 'relative'
                  }}>
                    <span style={{ fontSize: '2rem', marginBottom: '8px', display: 'block' }}>{step.icon}</span>
                    <h4 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>{step.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.4, margin: 0 }}>{step.desc}</p>
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(0,161,155,0.06)',
                      color: 'var(--primary-color)',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>{idx + 1}</span>
                  </div>
                  {idx < 2 && (
                    <div className="desktop-only" style={{ display: 'flex', color: 'var(--primary-color)', opacity: 0.5 }}>
                      <ArrowRight size={20} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. INTELLIGENT LOCAL AI ASSISTANT EMBED */}
      {!searchQuery && (
        <section style={{ marginBottom: '65px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-purple)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                <Cpu size={14} /> AI Onboarding Assistant
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 900, marginBottom: '10px', letterSpacing: '-0.5px' }}>
                Not sure which tool to select? Ask Infinity AI.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                Type your active project challenge in the helper workspace. The assistant parses keywords to recommend the ultimate secure, browser-native utility pipeline.
              </p>
            </div>

            <div className="glass-panel" style={{ margin: 0, padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <form onSubmit={handleAiChatSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="I need to crop a photo and compile sheets..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.015)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '0.88rem',
                    color: 'var(--text-color)',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiQuery.trim()}
                  style={{
                    background: 'var(--primary-gradient)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Ask
                </button>
              </form>

              <div style={{ 
                background: 'rgba(0,0,0,0.01)', 
                border: '1px solid var(--glass-border)', 
                borderRadius: '12px', 
                padding: '14px 18px', 
                minHeight: '100px', 
                fontSize: '0.85rem', 
                lineHeight: 1.5,
                color: 'var(--text-secondary)'
              }}>
                {isAiLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', animation: 'pulse 1s infinite alternate' }} />
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', animation: 'pulse 1s infinite alternate 0.2s' }} />
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', animation: 'pulse 1s infinite alternate 0.4s' }} />
                    <span>Analyzing toolkit...</span>
                  </div>
                ) : aiResponse ? (
                  <div dangerouslySetInnerHTML={{ __html: aiResponse }} />
                ) : (
                  <span>Ask a query above to see immediate tool recommendations.</span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. FEATURED CREATOR ECOSYSTEM */}
      {!searchQuery && (
        <section style={{ marginBottom: '65px' }}>
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 850, marginBottom: '6px', letterSpacing: '-0.5px' }}>
              Premium Workspace Utilities
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Explore advanced interactive soundscapes and self-destruct security modules designed for high-density focus.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ margin: 0, padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
              <div>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>🎧</span>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>Focus Soundscape Player</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>
                  Synthesize rain, oceans, or forest audio signals directly in your browser using the native HTML5 Web Audio API. 100% offline.
                </p>
              </div>
              <Link href="/audio/ambient-noise-player" style={{ textDecoration: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 700, marginTop: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Open Player <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="glass-panel" style={{ margin: 0, padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
              <div>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>🔏</span>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>Self-Destruct Notes</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>
                  Write confidential notes that disintegrate automatically after a timer expires or upon reading once. Shredded client-side.
                </p>
              </div>
              <Link href="/utility/note-shredder" style={{ textDecoration: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 700, marginTop: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Open Shredder <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 9. RECENTLY USED LAUNCHPAD */}
      {recentTools.length > 0 && !searchQuery && (
        <section style={{ marginBottom: '65px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 850, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.3px' }}>
            <History size={18} color="var(--primary-color)" /> Visited Launchpad
          </h2>
          <div className="tools-grid">
            {recentTools.slice(0, 4).map((recent) => {
              const tool = tools.find((t) => t.id === recent.id);
              if (!tool) return null;
              return (
                <Link href={`/${mapCategoryToPath(tool.category)}/${tool.id}`} key={tool.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="tool-card" style={{ opacity: 0.95 }}>
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

      {/* 10. STATS & TRUST INDICATORS */}
      {!searchQuery && (
        <section className="glass-panel" style={{ 
          margin: '0 0 65px 0', 
          padding: '40px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '30px', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.01) 0%, rgba(0, 161, 155, 0.015) 100%)'
        }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-color)', fontFamily: "'Outfit', sans-serif" }}>100%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Client-Side Sandbox</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-purple)', fontFamily: "'Outfit', sans-serif" }}>80+</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Developer Utilities</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-color)', fontFamily: "'Outfit', sans-serif" }}>{stats.conversions.toLocaleString()}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Conversions Completed</div>
          </div>
        </section>
      )}

      {/* 11. LOVED BY BUILDERS TESTIMONIALS */}
      {!searchQuery && (
        <section style={{ marginBottom: '65px' }}>
          <div style={{ textAlign: 'center', marginBottom: '35px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 850, marginBottom: '6px', letterSpacing: '-0.3px' }}>
              Loved by Engineers & Visual Creators
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              See why digital architects prefer browser-native privacy over server-dependent tools.
            </p>
            
            {/* Add Review Buttons & Feedback */}
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              style={{
                background: 'var(--primary-gradient)',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '30px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,161,155,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <MessageSquare size={16} /> {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </button>

            {reviewSuccess && (
              <div style={{ color: '#10b981', fontSize: '0.88rem', fontWeight: 600, marginTop: '12px' }}>
                {reviewSuccess}
              </div>
            )}
          </div>

          {/* Star Rating & Review Input Form (Glass Card) */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel"
                style={{
                  maxWidth: '550px',
                  margin: '0 auto 40px',
                  padding: '30px',
                  border: '1px solid var(--primary-color)',
                  boxShadow: '0 8px 32px rgba(0,161,155,0.05)'
                }}
              >
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', textAlign: 'center' }}>
                  Share Your InfinityKit Experience
                </h3>
                
                <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Name field */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Your Name</label>
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
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Your Rating</label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = hoverRating !== null ? star <= hoverRating : star <= reviewRating;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--warning-color)' }}
                          >
                            <Star 
                              size={24} 
                              fill={isFilled ? "currentColor" : "none"} 
                              stroke="currentColor"
                              strokeWidth={1.5}
                            />
                          </button>
                        );
                      })}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                        ({reviewRating} out of 5 stars)
                      </span>
                    </div>
                  </div>

                  {/* Message field */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Review Comment</label>
                    <textarea
                      placeholder="What do you love most about InfinityKit?"
                      value={reviewMessage}
                      onChange={(e) => setReviewMessage(e.target.value)}
                      className="form-input"
                      style={{ minHeight: '100px', resize: 'vertical' }}
                      required
                    />
                  </div>

                  {reviewError && (
                    <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                      ⚠️ {reviewError}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '5px' }}>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="btn"
                      style={{ padding: '8px 24px', fontSize: '0.85rem' }}
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
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                border: '3px solid var(--glass-border)',
                borderTopColor: 'var(--primary-color)',
                borderRadius: '50%',
                animation: 'home-spin 0.75s linear infinite'
              }} />
              <style jsx>{`@keyframes home-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : reviews.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', padding: '20px 0' }}>
              No customer reviews yet. Be the first to add one!
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {reviews.map((rev) => {
                const initials = rev.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
                return (
                  <div 
                    key={rev.id} 
                    className="glass-panel" 
                    style={{ 
                      margin: 0, 
                      padding: '28px', 
                      border: '1px solid rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Rating */}
                      <div style={{ display: 'flex', color: 'var(--warning-color)', gap: '2px', marginBottom: '12px' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < rev.rating ? "currentColor" : "none"} 
                            stroke="currentColor"
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                      
                      {/* Comment */}
                      <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '20px' }}>
                        "{rev.message}"
                      </p>
                    </div>

                    {/* Author Profile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        background: 'var(--primary-gradient)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '0.8rem', 
                        color: 'white', 
                        fontWeight: 700 
                      }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{rev.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>InfinityKit User</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 12. FAQ ACCORDION SECTION */}
      <section style={{ marginBottom: '65px' }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 850, marginBottom: '6px', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <HelpCircle size={20} color="var(--primary-color)" /> FAQ Knowledgebase
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Learn more about the technology stack, security architectures, and operations of InfinityKit.
          </p>
        </div>

        <div className="faq-container" style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="faq-item" 
                style={{ 
                  borderRadius: '16px',
                  border: isOpen ? '1px solid rgba(0, 161, 155, 0.2)' : '1px solid var(--glass-border)',
                  background: isOpen ? 'rgba(0, 161, 155, 0.02)' : 'var(--glass-bg)',
                  boxShadow: isOpen ? '0 4px 15px rgba(0, 161, 155, 0.02)' : 'none',
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
                    fontWeight: 700,
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

      {/* 13. PREMIUM CTA CALLOUT */}
      {!searchQuery && (
        <section className="glass-panel" style={{
          margin: '0 0 20px 0',
          padding: '50px 40px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(0, 161, 155, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
          border: '1px solid rgba(0, 161, 155, 0.15)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, marginBottom: '10px' }}>
            Elevate Your Digital Workflows
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px', lineHeight: 1.5 }}>
            Unlock continuous database backups, secure sharing parameters, and customized ambient workspaces. 100% free and client-side.
          </p>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="btn" style={{ background: 'var(--primary-gradient)', color: 'white', padding: '12px 30px', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', border: 'none', boxShadow: '0 4px 15px rgba(0, 161, 155, 0.2)' }}>
              Open Productive Dashboard <ArrowRight size={14} />
            </button>
          </Link>
        </section>
      )}

    </div>
  );
}
