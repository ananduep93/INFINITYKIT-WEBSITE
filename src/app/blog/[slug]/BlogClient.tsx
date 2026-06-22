'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, User, ChevronRight, BookOpen, Share2, Check } from 'lucide-react';
import { fullBlogPosts, FullBlogPost } from '../../../config/blogContent';
import { useTheme } from '../../../components/layout/ThemeProvider';

interface BlogClientProps {
  slug: string;
}

export default function BlogClient({ slug }: BlogClientProps) {
  const router = useRouter();
  const { theme } = useTheme();

  const [post, setPost] = useState<FullBlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<FullBlogPost[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    const activePost = fullBlogPosts[slug];
    if (activePost) {
      setPost(activePost);
      
      // Calculate related posts (excluding current)
      const others = Object.values(fullBlogPosts).filter(p => p.slug !== slug);
      // Pick up to 2 related posts
      setRelatedPosts(others.slice(0, 2));
    }
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const percentage = (window.scrollY / totalScroll) * 100;
        setReadingProgress(percentage);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  if (!post) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '20px' }}>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', marginBottom: '15px' }}>Article Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>The blog article you are looking for does not exist or has been relocated.</p>
        <Link href="/blog" className="btn" style={{ textDecoration: 'none', padding: '10px 20px', borderRadius: '30px' }}>
          Back to Resource Blog
        </Link>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Reading Progress Indicator */}
      <div 
        style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          width: `${readingProgress}%`,
          height: '4px',
          background: 'linear-gradient(90deg, var(--primary-color) 0%, #00d2c7 100%)',
          zIndex: 1001,
          transition: 'width 0.1s ease-out'
        }}
      />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Breadcrumbs */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontSize: '0.85rem', 
          color: 'var(--text-secondary)',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <Link href="/blog" style={{ color: 'inherit', textDecoration: 'none' }}>Blog</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{post.title}</span>
        </div>

        {/* Back Navigation & Share */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <Link href="/blog" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--text-color)', 
            textDecoration: 'none', 
            fontWeight: 600,
            fontSize: '0.95rem'
          }}>
            <ArrowLeft size={16} /> Back to Resource Blog
          </Link>
          
          <button 
            onClick={handleShare}
            style={{
              background: 'none',
              border: '1px solid var(--glass-border)',
              borderRadius: '20px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: 'var(--text-color)',
              backgroundColor: 'var(--glass-bg)',
              transition: 'all 0.2s'
            }}
          >
            {copiedShare ? (
              <>
                <Check size={14} color="var(--primary-color)" /> Copied Link!
              </>
            ) : (
              <>
                <Share2 size={14} /> Share Article
              </>
            )}
          </button>
        </div>

        {/* Article Header */}
        <header style={{ marginBottom: '40px' }}>
          <div style={{ marginBottom: '15px' }}>
            <span style={{
              background: 'rgba(0,161,155,0.08)',
              color: 'var(--primary-color)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {post.category}
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.25,
            color: 'var(--text-color)',
            marginBottom: '25px',
            letterSpacing: '-0.5px'
          }}>
            {post.title}
          </h1>

          {/* Author/Date/ReadTime Info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px', 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--glass-border)',
            borderBottom: '1px solid var(--glass-border)',
            padding: '15px 0',
            flexWrap: 'wrap'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} color="var(--primary-color)" /> {post.author}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} /> {post.date}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> {post.readTime}
            </span>
          </div>
        </header>

        {/* Article Body */}
        <article className="glass-panel" style={{
          padding: '45px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--card-radius)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.04)',
          marginBottom: '50px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {post.sections.map((section, idx) => {
              switch (section.type) {
                case 'p':
                  return (
                    <p key={idx} style={{
                      fontSize: '1.1rem',
                      lineHeight: '1.8',
                      color: 'var(--text-color)',
                      margin: 0,
                      opacity: 0.95
                    }}>
                      {section.content as string}
                    </p>
                  );
                case 'h2':
                  return (
                    <h2 key={idx} style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      color: 'var(--text-color)',
                      marginTop: '20px',
                      marginBottom: '5px',
                      lineHeight: 1.3,
                      borderBottom: '2px solid rgba(0, 161, 155, 0.1)',
                      paddingBottom: '10px'
                    }}>
                      {section.content as string}
                    </h2>
                  );
                case 'h3':
                  return (
                    <h3 key={idx} style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '1.4rem',
                      fontWeight: 600,
                      color: 'var(--text-color)',
                      marginTop: '15px',
                      marginBottom: '0px',
                      lineHeight: 1.3
                    }}>
                      {section.content as string}
                    </h3>
                  );
                case 'ul':
                  return (
                    <ul key={idx} style={{
                      margin: '5px 0 10px 20px',
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      {(section.content as string[]).map((item, itemIdx) => (
                        <li key={itemIdx} style={{
                          fontSize: '1.05rem',
                          lineHeight: '1.6',
                          color: 'var(--text-color)',
                          opacity: 0.95
                        }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                case 'ol':
                  return (
                    <ol key={idx} style={{
                      margin: '5px 0 10px 20px',
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      {(section.content as string[]).map((item, itemIdx) => (
                        <li key={itemIdx} style={{
                          fontSize: '1.05rem',
                          lineHeight: '1.6',
                          color: 'var(--text-color)',
                          opacity: 0.95
                        }}>
                          {item}
                        </li>
                      ))}
                    </ol>
                  );
                case 'cta':
                  return (
                    <div key={idx} className="cta-box" style={{
                      background: 'linear-gradient(135deg, rgba(0, 161, 155, 0.05) 0%, rgba(0, 161, 155, 0.12) 100%)',
                      border: '1px solid rgba(0, 161, 155, 0.25)',
                      borderRadius: '20px',
                      padding: '35px',
                      margin: '25px 0',
                      textAlign: 'center',
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)'
                    }}>
                      <h3 style={{ 
                        fontFamily: "'Outfit', sans-serif", 
                        fontSize: '1.3rem', 
                        fontWeight: 700, 
                        marginBottom: '10px', 
                        color: 'var(--text-color)' 
                      }}>
                        Ready to accelerate your workflow?
                      </h3>
                      <p style={{ 
                        fontSize: '0.95rem', 
                        color: 'var(--text-secondary)', 
                        marginBottom: '20px',
                        lineHeight: 1.5
                      }}>
                        {section.content as string}
                      </p>
                      {section.ctaLink && section.ctaText && (
                        <Link 
                          href={section.ctaLink} 
                          className="btn" 
                          style={{ 
                            display: 'inline-block', 
                            textDecoration: 'none', 
                            padding: '12px 28px', 
                            borderRadius: '30px',
                            fontWeight: 700,
                            boxShadow: '0 8px 20px rgba(0, 161, 155, 0.25)'
                          }}
                        >
                          {section.ctaText}
                        </Link>
                      )}
                    </div>
                  );
                case 'note':
                  return (
                    <div key={idx} style={{
                      backgroundColor: 'rgba(0, 161, 155, 0.05)',
                      borderLeft: '4px solid var(--primary-color)',
                      borderRadius: '4px 12px 12px 4px',
                      padding: '20px 25px',
                      margin: '10px 0',
                      fontSize: '1.05rem',
                      fontStyle: 'italic',
                      lineHeight: '1.6',
                      color: 'var(--text-color)'
                    }}>
                      {section.content as string}
                    </div>
                  );
                case 'code':
                  return (
                    <pre key={idx} style={{
                      backgroundColor: 'rgba(0, 161, 155, 0.03)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '10px',
                      padding: '20px',
                      margin: '15px 0',
                      overflowX: 'auto',
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: '0.9rem',
                      color: 'var(--text-color)',
                      lineHeight: 1.5
                    }}>
                      <code>{section.content as string}</code>
                    </pre>
                  );
                default:
                  return null;
              }
            })}
          </div>
        </article>

        {/* Dynamic Related Reads */}
        {relatedPosts.length > 0 && (
          <section style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '50px' }}>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.8rem',
              fontWeight: 800,
              color: 'var(--text-color)',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <BookOpen size={24} color="var(--primary-color)" /> Related Reads & Guides
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
              {relatedPosts.map((otherPost) => (
                <Link href={`/blog/${otherPost.slug}`} key={otherPost.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="glass-panel" style={{
                    margin: 0,
                    padding: '25px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--card-radius)',
                    transition: 'transform 0.2s',
                    cursor: 'pointer'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{
                          background: 'rgba(0,161,155,0.06)',
                          color: 'var(--primary-color)',
                          padding: '4px 10px',
                          borderRadius: '10px',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          {otherPost.category}
                        </span>
                        <span style={{ fontSize: '1.2rem' }}>{otherPost.icon}</span>
                      </div>
                      
                      <h3 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        marginBottom: '10px',
                        lineHeight: 1.4,
                        color: 'var(--text-color)'
                      }}>
                        {otherPost.title}
                      </h3>
                      
                      <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        margin: 0
                      }}>
                        {otherPost.excerpt}
                      </p>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '15px',
                      fontSize: '0.8rem',
                      color: 'var(--primary-color)',
                      fontWeight: 600
                    }}>
                      Read Article <ChevronRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
