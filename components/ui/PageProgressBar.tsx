'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to clear running timers
  const clearTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
  };

  // Start animating progress (simulates page loading steps)
  const startLoading = () => {
    clearTimers();
    setVisible(true);
    setProgress(5);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 40) {
          return prev + Math.floor(Math.random() * 8) + 4; // speedier initial jump
        } else if (prev < 75) {
          return prev + Math.floor(Math.random() * 3) + 1; // slow down in the middle
        } else if (prev < 90) {
          return prev + 0.5; // crawl close to the finish line
        }
        return prev;
      });
    }, 120);
  };

  // Complete progress and fade out
  const finishLoading = () => {
    clearTimers();
    setProgress(100);
    
    fadeTimeoutRef.current = setTimeout(() => {
      setVisible(false);
      // Wait for css opacity fadeout transition before resetting progress value
      fadeTimeoutRef.current = setTimeout(() => {
        setProgress(0);
      }, 300);
    }, 250);
  };

  // Trigger completion when route actually changes
  useEffect(() => {
    if (visible) {
      finishLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Register global click interceptor to catch user navigating internal links
  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      // Find closest anchor parent
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const targetAttr = anchor.getAttribute('target');
      const downloadAttr = anchor.getAttribute('download');

      // Ignore external, blank, hash, same-path hash, and special protocols
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        targetAttr === '_blank' ||
        downloadAttr !== null
      ) {
        return;
      }

      // Check if it's an internal path of the same origin
      const currentUrl = new URL(window.location.href);
      const targetUrl = new URL(href, currentUrl.origin);

      if (targetUrl.origin !== currentUrl.origin) return;

      // Ignore if clicking the exact same route with exact same search params (except if path is different)
      if (
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search &&
        !targetUrl.hash
      ) {
        return;
      }

      // Start the glowing animation!
      startLoading();
    };

    window.addEventListener('click', handleLinkClick);
    return () => {
      window.removeEventListener('click', handleLinkClick);
      clearTimers();
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 99999,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease-out',
        background: 'transparent'
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--accent-purple, #a855f7) 0%, var(--primary-color, #00f0ff) 50%, var(--accent-teal, #00f5a0) 100%)',
          boxShadow: '0 1px 10px rgba(0, 240, 255, 0.6), 0 0 5px rgba(168, 85, 247, 0.4)',
          transition: progress === 100 ? 'width 0.2s ease-out' : 'width 0.35s cubic-bezier(0.1, 0.8, 0.1, 1)'
        }}
      />
    </div>
  );
}
