const fs = require('fs');
const path = require('path');

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
  const categories = [
    'pdf-tools',
    'image-tools',
    'video-tools',
    'audio-tools',
    'ai-writing-tools',
    'ocr-tools',
    'file-conversion-tools',
    'developer-tools',
    'seo-tools',
    'utility-tools',
    'social-media-tools',
    'automation-tools'
  ];

  function mapCategoryToPath(catId) {
    switch (catId) {
      case 'pdf-tools': return 'pdf';
      case 'image-tools': return 'image';
      case 'video-tools': return 'video';
      case 'audio-tools': return 'audio';
      case 'ai-writing-tools': return 'ai-writing';
      case 'ocr-tools': return 'ocr';
      case 'file-conversion-tools': return 'file-conversion';
      case 'developer-tools': return 'developer-tools';
      case 'seo-tools': return 'seo';
      case 'utility-tools': return 'utility';
      case 'social-media-tools': return 'social-media';
      case 'automation-tools': return 'automation';
      default: return catId;
    }
  }

  categories.forEach(catId => {
    const cleanPath = mapCategoryToPath(catId);
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/${cleanPath}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += '  </url>\n';
  });

  // 3. Dynamic Tools pages (all 81+ tools!)
  const toolsFile = fs.readFileSync(path.join(__dirname, '../config/tools.ts'), 'utf8');
  const tools = [];
  const blocks = toolsFile.split(/\{\s*\n?\s*id:/);
  blocks.shift(); // remove header before first tool

  blocks.forEach(block => {
    const idMatch = block.match(/^\s*['"]([^'"]+)['"]/);
    const catMatch = block.match(/category:\s*['"]([^'"]+)['"]/);
    if (idMatch && catMatch) {
      tools.push({ id: idMatch[1], category: catMatch[1] });
    }
  });

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
  const blogFile = fs.readFileSync(path.join(__dirname, '../config/blogContent.ts'), 'utf8');
  const blogSlugs = [
    'how-to-use-to-do-list-effectively',
    'secure-client-side-calculators',
    'understanding-bmi-ranges',
    'maximizing-productivity-pomodoro',
    'how-to-watermark-pdf-offline-securely',
    'how-to-check-leaked-passwords-securely',
    'understanding-medicine-pediatric-dosage-formulas'
  ];

  blogSlugs.forEach(slug => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/blog/${slug}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Success! Pre-rendered static sitemap generated with ${staticPages.length + categories.length + tools.length + blogSlugs.length} URLs inside: ${outputPath}`);
}

generateSitemap();
