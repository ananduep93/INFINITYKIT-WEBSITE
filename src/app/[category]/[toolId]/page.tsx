import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getToolById, tools, mapCategoryToPath } from '../../../config/tools';
import ToolClient from './ToolClient';

interface ToolPageProps {
  params: Promise<{
    category: string;
    toolId: string;
  }>;
}

export async function generateStaticParams() {
  return tools.map((t) => ({
    category: mapCategoryToPath(t.category),
    toolId: t.id
  }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tool = getToolById(resolvedParams.toolId);
  if (!tool) {
    return {
      title: 'Tool Not Found | InfinityKit',
      description: 'The requested utility could not be found.'
    };
  }

  const title = tool.seoTitle || `${tool.name} | Free Client-Side Tool | InfinityKit`;
  const description = tool.seoDescription || `${tool.description} Use this lightweight, private, and 100% client-side web utility with absolute zero tracking.`;
  const url = `https://infinitykit.online/${resolvedParams.category}/${resolvedParams.toolId}`;

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
          alt: `${tool.name} Interface`
        }
      ],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://infinitykit.online/icon-512.png']
    }
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const resolvedParams = await params;
  const tool = getToolById(resolvedParams.toolId);
  
  if (!tool) {
    notFound();
  }

  // 1. Google SoftwareApplication JSON-LD Schema
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': tool.name,
    'operatingSystem': 'All',
    'applicationCategory': 'UtilityApplication',
    'browserRequirements': 'Requires HTML5 compatible browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': tool.description
  };

  // 2. Google BreadcrumbList JSON-LD Schema
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
        'name': resolvedParams.category.charAt(0).toUpperCase() + resolvedParams.category.slice(1),
        'item': `https://infinitykit.online/${resolvedParams.category}`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': tool.name,
        'item': `https://infinitykit.online/${resolvedParams.category}/${tool.id}`
      }
    ]
  };

  // 3. Google FAQPage JSON-LD Schema
  const faqSchema = tool.faq && tool.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': tool.faq.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer
      }
    }))
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <ToolClient toolId={resolvedParams.toolId} />
    </>
  );
}
