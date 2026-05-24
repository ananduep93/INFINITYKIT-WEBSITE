'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Search, Star, ChevronRight, Compass, Sparkles, Flame, ArrowRight } from 'lucide-react';
import { categories, tools, getCategoryById, getToolsByCategory, mapPathToCategory, mapCategoryToPath } from '../../config/tools';
import { useSync } from '../../hooks/useSync';

interface CategoryClientProps {
  categoryPath: string;
}

export default function CategoryClient({ categoryPath }: CategoryClientProps) {
  const { favorites, toggleFavorite } = useSync();
  const [searchQuery, setSearchQuery] = useState('');

  const internalCategory = useMemo(() => {
    return mapPathToCategory(categoryPath);
  }, [categoryPath]);

  const category = useMemo(() => {
    return getCategoryById(internalCategory);
  }, [internalCategory]);

  const categoryTools = useMemo(() => {
    if (!category) return [];
    return getToolsByCategory(internalCategory);
  }, [category, internalCategory]);

  const filteredTools = useMemo(() => {
    return categoryTools.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categoryTools, searchQuery]);

  // Split into trending and standard categories
  const trendingTools = useMemo(() => {
    return filteredTools.slice(0, 2);
  }, [filteredTools]);

  const standardTools = useMemo(() => {
    return filteredTools.slice(2);
  }, [filteredTools]);

  // Get related/other categories for SEO linkages
  const relatedCategories = useMemo(() => {
    return categories
      .filter((c) => c.id !== internalCategory)
      .slice(0, 3);
  }, [internalCategory]);

  if (!category) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>Home</Link>
        <ChevronRight size={12} />
        <Link href="/tools" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>Tools</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-color)', fontWeight: 600 }}>{category.name}</span>
      </div>

      {/* Futuristic Glassmorphic Category Hero Banner */}
      <header className="glass-panel" style={{ 
        margin: '0 0 40px 0', 
        padding: '40px', 
        borderRadius: '24px', 
        borderLeft: '6px solid var(--primary-color)',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px', zIndex: 2, position: 'relative' }}>
          <span style={{ 
            fontSize: '3.5rem', 
            background: 'rgba(0, 161, 155, 0.08)', 
            padding: '16px', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>{category.emoji || category.icon}</span>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ 
                background: 'rgba(0, 161, 155, 0.1)', 
                color: 'var(--primary-color)', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                padding: '4px 10px', 
                borderRadius: '50px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>Category Hub</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>⚡ Browser-Sandbox Secured</span>
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 850,
              color: 'var(--text-color)',
              letterSpacing: '-1px',
              margin: '0 0 10px 0',
              lineHeight: 1.1
            }}>
              {category.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: 0, lineHeight: 1.5, maxWidth: '650px' }}>
              {category.description}
            </p>
          </div>
        </div>
      </header>

      {/* Utility Search Control */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '35px',
        borderBottom: '1px solid var(--glass-border)',
        paddingBottom: '20px'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Sparkles size={20} color="var(--primary-color)" /> Available Utilities ({filteredTools.length})
        </h2>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', opacity: 0.7 }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder={`Search ${category.name.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              color: 'var(--text-color)',
              outline: 'none',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary-color)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 161, 155, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--glass-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {filteredTools.length > 0 ? (
        <>
          {/* Trending Section */}
          {trendingTools.length > 0 && (
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '15px' }}>
                <Flame size={14} color="#EF4444" fill="#EF4444" /> Trending in {category.name}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {trendingTools.map((tool) => (
                  <div 
                    key={tool.id} 
                    className="glass-panel"
                    style={{
                      margin: 0,
                      padding: '16px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '20px',
                      borderRadius: '16px',
                      border: '1px solid rgba(0, 161, 155, 0.15)',
                      background: 'linear-gradient(135deg, rgba(0, 161, 155, 0.03) 0%, rgba(255,255,255,0.01) 100%)',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <Link href={`/${categoryPath}/${tool.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
                      <span style={{ fontSize: '1.8rem', background: 'rgba(0,161,155,0.05)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {tool.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-color)' }}>{tool.name}</h4>
                          <span style={{ background: '#EF4444', color: 'white', fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>HOT</span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tool.description}
                        </p>
                      </div>
                    </Link>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <button
                        onClick={() => toggleFavorite(tool.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: favorites.includes(tool.id) ? 'var(--primary-color)' : 'var(--text-secondary)',
                          opacity: favorites.includes(tool.id) ? 1 : 0.4,
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        aria-label="Toggle favorite"
                      >
                        <Star size={16} fill={favorites.includes(tool.id) ? 'var(--primary-color)' : 'none'} />
                      </button>
                      <Link href={`/${categoryPath}/${tool.id}`} className="btn" style={{ padding: '8px 16px', fontSize: '0.78rem', borderRadius: '8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Launch <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standard Tools List */}
          {standardTools.length > 0 && (
            <div style={{ marginBottom: '50px' }}>
              {trendingTools.length > 0 && (
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                  All {category.name} Utilities
                </h3>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {standardTools.map((tool) => (
                  <div 
                    key={tool.id} 
                    className="glass-panel"
                    style={{
                      margin: 0,
                      padding: '16px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '20px',
                      borderRadius: '16px',
                      background: 'var(--glass-bg)',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <Link href={`/${categoryPath}/${tool.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
                      <span style={{ fontSize: '1.6rem', background: 'rgba(0,161,155,0.05)', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {tool.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-color)' }}>{tool.name}</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tool.description}
                        </p>
                      </div>
                    </Link>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <button
                        onClick={() => toggleFavorite(tool.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: favorites.includes(tool.id) ? 'var(--primary-color)' : 'var(--text-secondary)',
                          opacity: favorites.includes(tool.id) ? 1 : 0.4,
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        aria-label="Toggle favorite"
                      >
                        <Star size={16} fill={favorites.includes(tool.id) ? 'var(--primary-color)' : 'none'} />
                      </button>
                      <Link href={`/${categoryPath}/${tool.id}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.78rem', borderRadius: '8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Launch <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 40px', borderRadius: '24px' }}>
          <Compass size={40} style={{ color: 'var(--primary-color)', marginBottom: '16px', animation: 'spin 8s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: 500 }}>No browser-based utilities found matching your search query.</p>
        </div>
      )}

      {/* Related Categories / Internal Cross-Linking Section (SEO Boost) */}
      <section style={{ 
        marginTop: '60px', 
        paddingTop: '40px', 
        borderTop: '1px solid var(--glass-border)' 
      }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-color)', marginBottom: '10px' }}>Explore Other Category Hubs</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Boost your productivity by combining secure, browser-based utilities across multiple workspace categories.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {relatedCategories.map((c) => {
            const cleanPath = mapCategoryToPath(c.id);
            return (
              <Link href={`/${cleanPath}`} key={c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="glass-panel" style={{ 
                  padding: '24px', 
                  borderRadius: '16px', 
                  transition: 'all 0.3s ease',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255,255,255,0.01)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 161, 155, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <span style={{ fontSize: '2rem' }}>{c.emoji || c.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-color)', marginBottom: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                      Open Hub <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
