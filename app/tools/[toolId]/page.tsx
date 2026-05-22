import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getToolById, tools } from '../../../config/tools';
import ToolClient from './ToolClient';

interface ToolPageProps {
  params: {
    toolId: string;
  };
}

// Statically generate parameters for all tools at build time
export async function generateStaticParams() {
  return tools.map((t) => ({
    toolId: t.id
  }));
}

// Generate dynamic SEO metadata for each tool individually
export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tool = getToolById(params.toolId);
  if (!tool) {
    return {
      title: 'Tool Not Found | InfinityKit',
      description: 'The requested utility could not be found.'
    };
  }

  const title = tool.seoTitle || `${tool.name} | Free Client-Side Tool | InfinityKit`;
  const description = tool.seoDescription || `${tool.description} Use this lightweight, private, and 100% client-side web utility with absolute zero tracking.`;
  const url = `https://infinitykit.online/tools/${params.toolId}`;

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

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolById(params.toolId);
  
  if (!tool) {
    notFound();
  }

  return <ToolClient toolId={params.toolId} />;
}
