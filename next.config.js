/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Core Performance Flags ───────────────────────────────────────────────
  reactStrictMode: true,
  compress: true,                  // Enable gzip/brotli compression at the edge
  poweredByHeader: false,          // Remove X-Powered-By header (minor security + header savings)
  
  // ─── SWC Minification & Bundling ─────────────────────────────────────────
  swcMinify: true,                 // Use SWC (Rust-based) minifier — 4x faster than Terser
  
  // ─── Optimized Image Delivery ─────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'], // AVIF first (50% smaller), fallback WebP
    minimumCacheTTL: 86400,                // 24h CDN cache for transformed images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ─── Package Import Optimization (Tree-shaking) ──────────────────────────
  // Instead of bundling entire lucide-react & framer-motion, only used icons/modules ship
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@google/genai',
      '@google/generative-ai',
    ],
  },

  // ─── HTTP Headers (CDN Caching + Security) ────────────────────────────────
  async headers() {
    return [
      // ── Immutable static assets (JS/CSS chunks with content hashes) ──────
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ── Fonts self-hosted via next/font ───────────────────────────────────
      {
        source: '/_next/static/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ── Public images & icons ─────────────────────────────────────────────
      {
        source: '/:path*.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/:path*.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/:path*.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800' },
        ],
      },
      // ── HTML pages: short cache with stale-while-revalidate ───────────────
      {
        source: '/((?!_next).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
          // Security headers
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
