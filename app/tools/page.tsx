'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Compass, Star, ChevronRight } from 'lucide-react';
import { tools, categories, mapCategoryToPath } from '../../config/tools';
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
            <Link
              key={cat.id}
              href={`/${mapCategoryToPath(cat.id)}`}
              style={{ textDecoration: 'none' }}
            >
              <button
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
            </Link>
          ))}
        </div>
      </div>

      {/* Sleek SaaS List View */}
      {filteredTools.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTools.map((tool) => (
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
              <Link href={`/${mapCategoryToPath(tool.category)}/${tool.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
                <span style={{ fontSize: '1.8rem', background: 'rgba(0,161,155,0.05)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {tool.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-color)' }}>{tool.name}</h3>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(0, 161, 155, 0.08)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '50px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {tool.category.replace('-tools', '').replace('-', ' ')}
                    </span>
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
                  title="Toggle Bookmark"
                >
                  <Star size={16} fill={favorites.includes(tool.id) ? 'var(--primary-color)' : 'none'} />
                </button>
                <Link href={`/${mapCategoryToPath(tool.category)}/${tool.id}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.78rem', borderRadius: '8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Launch <ChevronRight size={12} />
                </Link>
              </div>
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
