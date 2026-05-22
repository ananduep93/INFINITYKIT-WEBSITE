'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Clock, ArrowRight } from 'lucide-react';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  icon: string;
}

const staticBlogPosts: BlogPost[] = [
  {
    slug: 'how-to-use-to-do-list-effectively',
    title: 'How to Use a To-Do List Effectively',
    excerpt: 'Learn the science behind task management and proven strategies like the 1-3-5 rule to boost your daily productivity.',
    date: 'May 18, 2026',
    readTime: '5 min read',
    category: 'Productivity',
    icon: '📝'
  },
  {
    slug: 'secure-client-side-calculators',
    title: 'Why Client-Side Computations Guarantee Absolute Privacy',
    excerpt: 'Explore the architectural security behind processing data locally in your browser instead of uploading sensitive inputs to remote cloud databases.',
    date: 'May 18, 2026',
    readTime: '4 min read',
    category: 'Security',
    icon: '🔒'
  },
  {
    slug: 'understanding-bmi-ranges',
    title: 'A Modern Scientific Guide to Body Mass Index (BMI) Ranges',
    excerpt: 'An in-depth explanation of standard BMI formulations, their clinical relevance, and how to assess overall body weight categories accurately.',
    date: 'May 12, 2026',
    readTime: '6 min read',
    category: 'Health',
    icon: '🩺'
  },
  {
    slug: 'maximizing-productivity-pomodoro',
    title: 'Maximizing Daily Cognitive Output with the Pomodoro Clock',
    excerpt: 'How chunking work into 25-minute intervals with structured resting cycles improves mental agility, blocks burnout, and enhances focus.',
    date: 'May 08, 2026',
    readTime: '5 min read',
    category: 'Productivity',
    icon: '⏱️'
  }
];


export default function BlogPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Header */}
      <header style={{ marginBottom: '50px', marginTop: '20px' }}>
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '3rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, var(--primary-color) 0%, #00d2c7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '15px'
        }}>
          Infinity Kit Blog
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          lineHeight: 1.5
        }}>
          Scientific guidelines, tutorials, security reports, and deep-dives about health formulas, focus timers, and digital utilities.
        </p>
      </header>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        {staticBlogPosts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-panel" style={{
              margin: 0,
              padding: '30px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--card-radius)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{
                    background: 'rgba(0,161,155,0.06)',
                    color: 'var(--primary-color)',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: '1.5rem' }}>{post.icon}</span>
                </div>

                <h3 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  marginBottom: '12px',
                  lineHeight: 1.4,
                  color: 'var(--text-color)'
                }}>
                  {post.title}
                </h3>
                
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  marginBottom: '20px'
                }}>
                  {post.excerpt}
                </p>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--glass-border)',
                paddingTop: '15px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {post.date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {post.readTime}
                  </span>
                </div>
                <span style={{ color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Read Article <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
