const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, 'migration_mapping.json');
if (!fs.existsSync(mappingPath)) {
  console.error('mapping file does not exist');
  process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Target categories
const categories = {
  pdf: [],
  image: [],
  ai: [],
  productivity: [],
  developer: [],
  utilities: [],
  uncategorized: []
};

// We will map config categories to target categories
const configToTarget = {
  // config category -> target category
  'pdf-tools': 'pdf',
  'image-tools': 'image',
  'ai-tools': 'ai',
  'writing-tools': 'ai', // Writing tools are AI-based essay/article writers
  'developer-tools': 'developer',
  'coding-tools': 'developer',
  'seo-tools': 'developer', // SEO schema/meta builders are developer-related
  'marketing-tools': 'developer', // Meta tag audit
  'productivity-tools': 'productivity',
  'business-tools': 'productivity', // Expense trackers, e-signatures, planners
  'expense-tracker': 'productivity',
  'survey-tools': 'productivity', // Survey builder is a productivity tool
  'automation-tools': 'productivity', // Planners and renamers
  'utility-tools': 'utilities',
  'calculator-tools': 'utilities', // BMI, drug dosage, drip rate, etc. (mostly simple, but check custom)
  'converter-tools': 'utilities', // Unit converter, Morse, PDF-to-image is file/utility
  'file-tools': 'utilities', // ImageToPDF, PDFToImage
  'social-tools': 'utilities', // P2P share, link-in-bio
  'audio-tools': 'utilities', // Text-to-speech, soundscape, audio suites
  'video-tools': 'utilities', // Video wrappers
  'media-tools': 'utilities', // Subtitle generators
  'cloud-tools': 'utilities', // P2P share
  'creator-tools': 'utilities', // E-signature
  'security-tools': 'productivity', // Passwords, note shredders, etc.
  'compression-tools': 'utilities' // Compressors
};

mapping.forEach(item => {
  const file = item.file;
  const configCategories = item.categories;
  
  if (configCategories.length === 0) {
    // If no direct category, let's check name of file
    if (file.toLowerCase().includes('pdf')) {
      categories.pdf.push(file);
    } else if (file.toLowerCase().includes('image') || file.toLowerCase().includes('photo') || file.toLowerCase().includes('png') || file.toLowerCase().includes('jpg') || file.toLowerCase().includes('webp') || file.toLowerCase().includes('svg') || file.toLowerCase().includes('gif')) {
      categories.image.push(file);
    } else if (file.toLowerCase().includes('ai') || file.toLowerCase().includes('chat') || file.toLowerCase().includes('writer') || file.toLowerCase().includes('generator')) {
      categories.ai.push(file);
    } else if (file.toLowerCase().includes('json') || file.toLowerCase().includes('ts') || file.toLowerCase().includes('regex') || file.toLowerCase().includes('code') || file.toLowerCase().includes('html') || file.toLowerCase().includes('css')) {
      categories.developer.push(file);
    } else if (file.toLowerCase().includes('todo') || file.toLowerCase().includes('note') || file.toLowerCase().includes('timer') || file.toLowerCase().includes('expense') || file.toLowerCase().includes('calendar') || file.toLowerCase().includes('planner') || file.toLowerCase().includes('remind') || file.toLowerCase().includes('budget') || file.toLowerCase().includes('survey')) {
      categories.productivity.push(file);
    } else {
      categories.uncategorized.push(file);
    }
    return;
  }
  
  // Use first category for primary mapping
  const primaryConfigCat = configCategories[0];
  const targetCat = configToTarget[primaryConfigCat] || 'uncategorized';
  categories[targetCat].push(file);
});

console.log('--- REORGANIZATION CATEGORIES SUMMARY ---');
for (const [cat, files] of Object.entries(categories)) {
  console.log(`${cat.toUpperCase()}: ${files.length} files`);
}

console.log('\nUNCATEGORIZED FILES:');
categories.uncategorized.forEach(f => console.log(` - ${f}`));

fs.writeFileSync(path.join(__dirname, 'reorg_plan.json'), JSON.stringify(categories, null, 2), 'utf8');
