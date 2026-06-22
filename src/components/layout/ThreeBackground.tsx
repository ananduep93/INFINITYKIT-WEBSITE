'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  z: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  alphaSpeed: number;
}

export const ThreeBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // ── Detect user preferences BEFORE running canvas ────────────────────────
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isMobile =
    typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Skip canvas entirely for users who prefer reduced motion
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastFrameTime = 0;
    // Target 30fps on mobile (battery saver), 60fps on desktop
    const targetFPS = isMobile ? 30 : 60;
    const frameDuration = 1000 / targetFPS;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // ── Reduced particle count: 18 desktop, 8 mobile ─────────────────────
    const particleCount = isMobile ? 8 : 18;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      particles.push({
        x: px,
        y: py,
        baseX: px,
        baseY: py,
        z: Math.random() * 2 + 0.5,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        alpha: Math.random() * 0.6 + 0.2,
        alphaSpeed: (Math.random() - 0.5) * 0.004,
      });
    }

    // ── Passive event listeners (no main thread blocking) ─────────────────
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.targetX = e.touches[0].clientX;
        mouseRef.current.targetY = e.touches[0].clientY;
      }
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      // Debounce resize to avoid layout thrashing
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles.forEach((p) => {
          p.baseX = Math.random() * width;
          p.baseY = Math.random() * height;
          p.x = p.baseX;
          p.y = p.baseY;
        });
      }, 200);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // ── Frame-rate throttled animation loop ──────────────────────────────
    const animate = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // Frame throttling: skip frames to hit target FPS
      if (timestamp - lastFrameTime < frameDuration) return;
      lastFrameTime = timestamp;

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const parallaxX = (mouse.x - width / 2) * 0.018;
      const parallaxY = (mouse.y - height / 2) * 0.018;

      particles.forEach((p) => {
        p.baseX += p.vx;
        p.baseY += p.vy;

        if (p.baseX < 0) p.baseX = width;
        if (p.baseX > width) p.baseX = 0;
        if (p.baseY < 0) p.baseY = height;
        if (p.baseY > height) p.baseY = 0;

        p.alpha += p.alphaSpeed;
        if (p.alpha > 0.85 || p.alpha < 0.15) p.alphaSpeed *= -1;

        // Mouse repulsion (skip on mobile for perf)
        let targetX = p.baseX;
        let targetY = p.baseY;

        if (!isMobile) {
          const dx = p.baseX - mouse.x;
          const dy = p.baseY - mouse.y;
          const distSq = dx * dx + dy * dy;
          const repulsionRadius = 130;

          if (distSq < repulsionRadius * repulsionRadius) {
            const distance = Math.sqrt(distSq);
            const force = (repulsionRadius - distance) / repulsionRadius;
            const angle = Math.atan2(dy, dx);
            const push = force * 24;
            targetX = p.baseX + Math.cos(angle) * push;
            targetY = p.baseY + Math.sin(angle) * push;
          }
        }

        p.x += (targetX - p.x) * 0.1;
        p.y += (targetY - p.y) * 0.1;

        const finalX = p.x + parallaxX * p.z;
        const finalY = p.y + parallaxY * p.z;

        const dotAlpha = Math.min(Math.max(0.1, p.alpha), 0.85);

        ctx.beginPath();
        ctx.arc(finalX, finalY, p.radius * (p.z * 0.6 + 0.4), 0, Math.PI * 2);
        ctx.fillStyle = theme === 'dark'
          ? `rgba(0, 240, 255, ${dotAlpha * 0.4})`
          : `rgba(124, 58, 237, ${dotAlpha * 0.4})`;
        ctx.fill();

        // Halo only for closest (deepest) particles
        if (p.z > 1.8) {
          ctx.beginPath();
          ctx.arc(finalX, finalY, p.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = theme === 'dark'
            ? `rgba(0, 240, 255, ${dotAlpha * 0.04})`
            : `rgba(124, 58, 237, ${dotAlpha * 0.04})`;
          ctx.fill();
        }
      });
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted, theme, prefersReducedMotion, isMobile]);

  if (!mounted) return null;

  // ── If user prefers reduced motion: show static gradient only ────────────
  if (prefersReducedMotion) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -2,
          pointerEvents: 'none',
          background: theme === 'dark'
            ? 'radial-gradient(circle at 20% 20%, rgba(0, 240, 255, 0.04), transparent 60%)'
            : 'radial-gradient(circle at 20% 20%, rgba(0, 161, 155, 0.05), transparent 60%)',
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -2,
        pointerEvents: 'none',
        overflow: 'hidden',
        // content-visibility: auto lets browser skip painting off-screen sections
        contentVisibility: 'auto' as any,
      }}
    >
      {/* ── GPU-composited glowing orbs ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          willChange: 'transform',
        }}
      >
        {/* Orb 1: Teal/Cyan */}
        <div
          className="glow-orb"
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '60vw',
            height: '60vw',
            borderRadius: '50%',
            background: theme === 'dark'
              ? 'radial-gradient(circle, rgba(0, 240, 255, 0.06) 0%, transparent 75%)'
              : 'radial-gradient(circle, rgba(0, 161, 155, 0.07) 0%, transparent 75%)',
            animation: 'floatOrb1 32s infinite ease-in-out',
            // Reduced blur: 40px→20px = 4x cheaper GPU fill rate
            filter: isMobile ? 'blur(15px)' : 'blur(25px)',
          }}
        />

        {/* Orb 2: Purple */}
        <div
          className="glow-orb"
          style={{
            position: 'absolute',
            bottom: '-15%',
            right: '-10%',
            width: '65vw',
            height: '65vw',
            borderRadius: '50%',
            background: theme === 'dark'
              ? 'radial-gradient(circle, rgba(124, 58, 237, 0.07) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(124, 58, 237, 0.06) 0%, transparent 70%)',
            animation: 'floatOrb2 45s infinite ease-in-out',
            filter: isMobile ? 'blur(15px)' : 'blur(28px)',
          }}
        />

        {/* Orb 3: Pink — hidden on mobile to save GPU */}
        {!isMobile && (
          <div
            className="glow-orb"
            style={{
              position: 'absolute',
              top: '30%',
              right: '20%',
              width: '45vw',
              height: '45vw',
              borderRadius: '50%',
              background: theme === 'dark'
                ? 'radial-gradient(circle, rgba(236, 72, 153, 0.035) 0%, transparent 75%)'
                : 'radial-gradient(circle, rgba(236, 72, 153, 0.04) 0%, transparent 75%)',
              animation: 'floatOrb3 28s infinite ease-in-out',
              filter: 'blur(22px)',
            }}
          />
        )}
      </div>

      {/* ── Light beams — hidden on mobile ── */}
      {!isMobile && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: theme === 'dark' ? 0.3 : 0.55,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '20%',
              width: '1px',
              height: '140%',
              transform: 'rotate(-35deg)',
              background: 'linear-gradient(to bottom, transparent, rgba(0, 240, 255, 0.13), transparent)',
              animation: 'sweepLight1 18s infinite linear',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '60%',
              width: '1px',
              height: '140%',
              transform: 'rotate(-35deg)',
              background: 'linear-gradient(to bottom, transparent, rgba(124, 58, 237, 0.1), transparent)',
              animation: 'sweepLight2 24s infinite linear',
            }}
          />
        </div>
      )}

      {/* ── Particle canvas ── */}
      {!prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ── Keyframe definitions ── */}
      <style jsx global>{`
        @keyframes floatOrb1 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33% { transform: translate3d(4vw, 5vh, 0) scale(1.08); }
          66% { transform: translate3d(-3vw, 8vh, 0) scale(0.95); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          40% { transform: translate3d(-5vw, -8vh, 0) scale(1.05); }
          75% { transform: translate3d(3vw, -4vh, 0) scale(0.92); }
        }
        @keyframes floatOrb3 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(0.9); }
          50% { transform: translate3d(-6vw, 4vh, 0) scale(1.12); }
        }
        @keyframes sweepLight1 {
          0% { transform: rotate(-35deg) translate3d(-50vw, -100%, 0); }
          100% { transform: rotate(-35deg) translate3d(80vw, 100%, 0); }
        }
        @keyframes sweepLight2 {
          0% { transform: rotate(-35deg) translate3d(-80vw, -100%, 0); }
          100% { transform: rotate(-35deg) translate3d(50vw, 100%, 0); }
        }
        /* Respect OS-level reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .glow-orb { animation: none !important; }
        }
      `}</style>
    </div>
  );
};
