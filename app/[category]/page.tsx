import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categories, mapCategoryToPath, mapPathToCategory, getCategoryById } from '../../config/tools';
import CategoryClient from './CategoryClient';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  return categories.map((cat) => ({
    category: mapCategoryToPath(cat.id)
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const internalCategory = mapPathToCategory(params.category);
  const category = getCategoryById(internalCategory);

  if (!category) {
    return {
      title: 'Category Not Found | InfinityKit',
      description: 'The requested tool category could not be found.'
    };
  }

  const title = `${category.name} | Free Online Utilities Hub | InfinityKit`;
  const description = `${category.description} Secure, private, and 100% browser-based tools with zero server uploads.`;
  const url = `https://infinitykit.online/${params.category}`;

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
          alt: `${category.name} Hub`
        }
      ],
      type: 'website'
    }
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const internalCategory = mapPathToCategory(params.category);
  const category = getCategoryById(internalCategory);

  if (!category) {
    notFound();
  }

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
        'name': category.name,
        'item': `https://infinitykit.online/${params.category}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CategoryClient categoryPath={params.category} />
    </>
  );
}
