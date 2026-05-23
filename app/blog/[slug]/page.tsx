import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fullBlogPosts } from '../../../config/blogContent';
import BlogClient from './BlogClient';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate static routes at build time
export async function generateStaticParams() {
  return Object.keys(fullBlogPosts).map((slug) => ({
    slug
  }));
}

// Dynamic SEO metadata generation
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = fullBlogPosts[params.slug];
  if (!post) {
    return {
      title: 'Article Not Found | InfinityKit',
      description: 'The requested blog article could not be found.'
    };
  }

  const title = `${post.title} | InfinityKit Blog`;
  const description = post.excerpt || 'Access high-quality client-side utilities resource articles and guides.';
  const url = `https://infinitykit.online/blog/${params.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'InfinityKit',
      images: [
        {
          url: 'https://infinitykit.online/icon-512.png',
          width: 512,
          height: 512,
          alt: post.title
        }
      ],
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      authors: [post.author || 'InfinityKit Team']
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://infinitykit.online/icon-512.png']
    }
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = fullBlogPosts[params.slug];
  
  if (!post) {
    notFound();
  }

  // Google TechArticle JSON-LD Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': post.title,
    'description': post.excerpt,
    'datePublished': new Date(post.date).toISOString(),
    'author': {
      '@type': 'Person',
      'name': post.author || 'InfinityKit Team'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'InfinityKit',
      'logo': 'https://infinitykit.online/icon-512.png'
    },
    'mainEntityOfPage': `https://infinitykit.online/blog/${params.slug}`
  };

  // Google BreadcrumbList JSON-LD Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://infinitykit.online'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Blog',
        'item': 'https://infinitykit.online/blog'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': post.title,
        'item': `https://infinitykit.online/blog/${params.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogClient slug={params.slug} />
    </>
  );
}
