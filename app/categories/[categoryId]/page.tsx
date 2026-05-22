'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Search, Star, ChevronRight, Compass } from 'lucide-react';
import { categories, tools, getCategoryById, getToolsByCategory } from '../../../config/tools';
import { useSync } from '../../../hooks/useSync';

interface CategoryPageProps {
  params: {
    categoryId: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = params;
  const { favorites, toggleFavorite } = useSync();
  const [searchQuery, setSearchQuery] = useState('');

  const category = useMemo(() => {
    return getCategoryById(categoryId);
  }, [categoryId]);

  const categoryTools = useMemo(() => {
    if (!category) return [];
    return getToolsByCategory(categoryId);
  }, [category, categoryId]);

  const filteredTools = useMemo(() => {
    return categoryTools.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categoryTools, searchQuery]);

  if (!category) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={12} />
        <Link href="/tools" style={{ color: 'inherit', textDecoration: 'none' }}>Tools</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-color)', fontWeight: 500 }}>{category.name}</span>
      </div>

      {/* Hero Header */}
      <header className="glass-panel" style={{ margin: '0 0 40px 0', padding: '30px 40px', borderLeft: '5px solid var(--primary-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
          <span style={{ fontSize: '3rem' }}>{category.emoji || category.icon}</span>
          <div>
            <h1 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--text-color)'
            }}>
              {category.name} Hub
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '4px' }}>
              {category.description}
            </p>
          </div>
        </div>
      </header>

      {/* Search and Filters inside Category */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700 }}>
          Available Tools ({filteredTools.length})
        </h2>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder={`Search in ${category.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 40px',
              borderRadius: '20px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              color: 'var(--text-color)',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </div>

      {/* Grid of Tools */}
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
          <Compass size={36} style={{ color: 'var(--primary-color)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No utilities found in this category.</p>
        </div>
      )}
    </div>
  );
}
