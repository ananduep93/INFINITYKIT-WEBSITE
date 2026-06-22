import { MetadataRoute } from 'next';
import { tools, categories, mapCategoryToPath } from '../config/tools';
import { fullBlogPosts } from '../config/blogContent';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://infinitykit.online';

  // 1. Static site core pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms-conditions',
    '/cookie-policy',
    '/disclaimer',
    '/whatsnew',
    '/blog',
    '/tools',
    '/login',
    '/signup'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8
  }));

  // 2. Dynamic Categories pages
  const categoryPages = categories.map(cat => ({
    url: `${baseUrl}/${mapCategoryToPath(cat.id)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }));

  // 3. Dynamic Tools pages (all 81+ tools)
  const toolPages = tools.map(tool => ({
    url: `${baseUrl}/${mapCategoryToPath(tool.category)}/${tool.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9
  }));

  // 4. Dynamic Blog post pages
  const blogPages = Object.values(fullBlogPosts).map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6
  }));

  return [...staticPages, ...categoryPages, ...toolPages, ...blogPages];
}
