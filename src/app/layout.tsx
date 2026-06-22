import React from 'react';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from '../components/layout/ThemeProvider';
import ClientLayout from '../components/layout/ClientLayout';
import '../styles/globals.css';

// ─── Self-hosted fonts via next/font (zero render-blocking requests) ──────────
// Next.js downloads & serves fonts from the same origin at build time.
// This eliminates the render-blocking Google Fonts stylesheet entirely.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',         // Show text in fallback font while loading
  preload: true,
  weight: ['300', '400', '500', '600', '700', '800'],
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  manifest: '/manifest.json',
  title: {
    default: 'InfinityKit | Premium Free Online Tools Suite',
    template: '%s | InfinityKit'
  },
  description: 'Access over 80+ secure, client-side digital tools for document conversion, visual editing, and advanced AI utilities. Engineered for ultimate client privacy and absolute zero server tracking.',
  metadataBase: new URL('https://infinitykit.online'),
  alternates: {
    canonical: 'https://infinitykit.online'
  },
  openGraph: {
    title: 'InfinityKit | Premium Free Online Tools Suite',
    description: 'Access over 80+ secure, client-side digital tools for document conversion, visual editing, and advanced AI utilities. Engineered for ultimate client privacy and absolute zero server tracking.',
    url: 'https://infinitykit.online',
    siteName: 'InfinityKit',
    images: [
      {
        url: 'https://infinitykit.online/icon-512.png',
        width: 512,
        height: 512,
        alt: 'InfinityKit Premium Tools Suite'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InfinityKit | Premium Free Online Tools Suite',
    description: 'Access over 80+ secure, client-side digital tools for document conversion, visual editing, and advanced AI utilities. Engineered for ultimate client privacy and absolute zero server tracking.',
    images: ['https://infinitykit.online/icon-512.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Global Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'InfinityKit',
    'url': 'https://infinitykit.online',
    'logo': 'https://infinitykit.online/icon-512.png',
    'sameAs': ['https://github.com/ananduep93/Infinity_Kit'],
    'contactPoint': {
      '@type': 'ContactPoint',
      'email': 'infinitykit24@gmail.com',
      'contactType': 'customer support'
    }
  };

  // Google Search Action Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'InfinityKit',
    'url': 'https://infinitykit.online',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://infinitykit.online/tools?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="shortcut icon" href="/icon-192.png" type="image/png" />
        {/* DNS prefetch for Firebase (used in whatsnew/auth) */}
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
