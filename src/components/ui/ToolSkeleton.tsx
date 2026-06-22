'use client';

import React from 'react';

/**
 * ToolSkeleton
 * 
 * Premium animated loading skeleton that mirrors the tool page layout.
 * Shown via Suspense boundary while the dynamic tool chunk loads,
 * giving instant visual feedback with zero layout shift.
 */
export default function ToolSkeleton() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 60px' }}>
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .sk-shimmer {
          background: linear-gradient(
            90deg,
            var(--glass-bg) 25%,
            rgba(0, 161, 155, 0.06) 50%,
            var(--glass-bg) 75%
          );
          background-size: 800px 100%;
          animation: skeletonShimmer 1.4s ease-in-out infinite;
          border-radius: 10px;
        }
      `}</style>

      {/* Breadcrumb skeleton */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
        <div className="sk-shimmer" style={{ width: '40px', height: '14px' }} />
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--glass-border)' }} />
        <div className="sk-shimmer" style={{ width: '80px', height: '14px' }} />
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--glass-border)' }} />
        <div className="sk-shimmer" style={{ width: '120px', height: '14px' }} />
      </div>

      {/* Tool header skeleton */}
      <div
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '20px',
          padding: '25px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '35px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Icon skeleton */}
          <div
            className="sk-shimmer"
            style={{ width: '60px', height: '60px', borderRadius: '15px', flexShrink: 0 }}
          />
          <div>
            {/* Title skeleton */}
            <div className="sk-shimmer" style={{ width: '220px', height: '28px', marginBottom: '10px' }} />
            {/* Description skeleton */}
            <div className="sk-shimmer" style={{ width: '340px', height: '16px' }} />
          </div>
        </div>
        {/* Star button skeleton */}
        <div className="sk-shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
      </div>

      {/* Tool workspace skeleton — two-column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '35px',
          marginBottom: '40px',
        }}
      >
        {/* Left: form panel */}
        <div
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '20px',
            padding: '30px',
          }}
        >
          <div className="sk-shimmer" style={{ width: '160px', height: '20px', marginBottom: '24px' }} />
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <div className="sk-shimmer" style={{ width: '100px', height: '13px', marginBottom: '8px' }} />
              <div className="sk-shimmer" style={{ width: '100%', height: '42px', borderRadius: '10px' }} />
            </div>
          ))}
          <div className="sk-shimmer" style={{ width: '100%', height: '48px', borderRadius: '12px', marginTop: '10px' }} />
        </div>

        {/* Right: results panel */}
        <div
          style={{
            background: 'var(--glass-bg)',
            border: '1px dashed var(--glass-border)',
            borderRadius: '20px',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            gap: '12px',
          }}
        >
          <div
            className="sk-shimmer"
            style={{ width: '48px', height: '48px', borderRadius: '50%' }}
          />
          <div className="sk-shimmer" style={{ width: '140px', height: '18px' }} />
          <div className="sk-shimmer" style={{ width: '200px', height: '13px' }} />
        </div>
      </div>

      {/* Usage guide skeleton */}
      <div
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '40px',
        }}
      >
        <div className="sk-shimmer" style={{ width: '280px', height: '22px', marginBottom: '24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="sk-shimmer" style={{ width: '180px', height: '16px', marginBottom: '12px' }} />
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="sk-shimmer" style={{ width: '90%', height: '12px', marginBottom: '8px' }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
