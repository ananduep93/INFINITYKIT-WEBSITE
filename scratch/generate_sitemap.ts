import * as fs from 'fs';
import * as path from 'path';
import { tools, categories, mapCategoryToPath } from '../config/tools';
import { fullBlogPosts } from '../config/blogContent';

function generateSitemap() {
  const baseUrl = 'https://infinitykit.online';
  const currentDate = new Date().toISOString();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

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
  ];

  staticPages.forEach(route => {
    const priority = route === '' ? '1.0' : '0.8';
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${route}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // 2. Dynamic Categories pages
  categories.forEach(cat => {
    const cleanPath = mapCategoryToPath(cat.id);
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/${cleanPath}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += '  </url>\n';
  });

  // 3. Dynamic Tools pages (all 81+ tools!)
  tools.forEach(tool => {
    const cleanCategoryPath = mapCategoryToPath(tool.category);
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/${cleanCategoryPath}/${tool.id}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += '  </url>\n';
  });

  // 4. Dynamic Blog post pages
  Object.values(fullBlogPosts).forEach(post => {
    const postDate = new Date(post.date).toISOString();
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
    xml += `    <lastmod>${postDate}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Success! Pre-rendered static sitemap generated with ${staticPages.length + categories.length + tools.length + Object.keys(fullBlogPosts).length} URLs inside: ${outputPath}`);
}

generateSitemap();
