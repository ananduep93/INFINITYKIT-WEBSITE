'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Compass, Star, ChevronRight } from 'lucide-react';
import { tools, categories } from '../../config/tools';
import { useSync } from '../../hooks/useSync';

export default function ToolsPage() {
  const { favorites, toggleFavorite } = useSync();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' ? true : tool.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-color)', fontWeight: 500 }}>All Utilities</span>
      </div>

      <header style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '2.5rem',
          fontWeight: 800,
          marginBottom: '10px'
        }}>
          Comprehensive Utilities Directory
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', lineHeight: 1.5 }}>
          Search and filter through our full catalog of 80+ tools. Bookmark tools for quick access from the homepage dashboard.
        </p>
      </header>

      {/* Filter and Search Bar Row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search utilities by name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 45px',
              borderRadius: '25px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              color: 'var(--text-color)',
              outline: 'none',
              fontSize: '0.95rem'
            }}
          />
        </div>

        {/* Category Dropdown/Tabs */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '5px' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: '1px solid var(--glass-border)',
              background: selectedCategory === 'all' ? 'var(--primary-gradient)' : 'var(--glass-bg)',
              color: selectedCategory === 'all' ? 'white' : 'var(--text-color)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-smooth)'
            }}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                border: '1px solid var(--glass-border)',
                background: selectedCategory === cat.id ? 'var(--primary-gradient)' : 'var(--glass-bg)',
                color: selectedCategory === cat.id ? 'white' : 'var(--text-color)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'var(--transition-smooth)'
              }}
            >
              {cat.emoji || cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
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
                  opacity: favorites.includes(tool.id) ? 1 : 0.4,
                  zIndex: 10
                }}
              >
                <Star size={16} fill={favorites.includes(tool.id) ? 'var(--primary-color)' : 'none'} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <Compass size={40} style={{ color: 'var(--primary-color)', marginBottom: '15px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>No tools found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            We couldn't find any utilities matching your query. Clear your filters or query to explore all tools.
          </p>
        </div>
      )}
    </div>
  );
}
