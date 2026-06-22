const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT';
const toolsPath = path.join(rootDir, 'src', 'config', 'tools.ts');
const layoutPath = path.join(rootDir, 'src', 'components', 'layout', 'ClientLayout.tsx');

const newCategories = [
  { id: 'ai-tools', name: 'AI Tools', icon: '🤖', emoji: '🤖', description: 'AI chat, writing, image, audio, and PDF assistants.' },
  { id: 'image-tools', name: 'Image Tools', icon: '🖼️', emoji: '🖼️', description: 'Resize, crop, convert, and edit image formats.' },
  { id: 'pdf-tools', name: 'PDF Tools', icon: '📄', emoji: '📄', description: 'Merge, split, compress, secure, and convert PDF files.' },
  { id: 'student-tools', name: 'Student Tools', icon: '🎓', emoji: '🎓', description: 'Math solvers, average calculators, and study helpers.' },
  { id: 'survey-builder', name: 'Survey Tools', icon: '📊', emoji: '📊', description: 'Create surveys, collect responses, and view analytics.' },
  { id: 'utility-tools', name: 'Utilities', icon: '🛠️', emoji: '🛠️', description: 'Timers, task lists, expenses, sound mixers, and converters.' }
];

const lucideIcons = {
  'ai-tools': 'Sparkles',
  'image-tools': 'ImageIcon',
  'pdf-tools': 'FileText',
  'student-tools': 'GraduationCap',
  'survey-builder': 'BarChart3',
  'utility-tools': 'Settings'
};

const toolIdToCategory = {
  // --- AI Tools ---
  "chatbot": "ai-tools",
  "text-improver": "ai-tools",
  "summarizer": "ai-tools",
  "image-generator": "ai-tools",
  "essay-writer": "ai-tools",
  "article-writer": "ai-tools",
  "blog-generator": "ai-tools",
  "faq-generator": "ai-tools",
  "ai-rewriter": "ai-tools",
  "ai-humanizer": "ai-tools",
  "grammar-fixer": "ai-tools",
  "men-prompts": "ai-tools",
  "women-prompts": "ai-tools",
  "smartsuggestions": "ai-tools",
  "bg-remover": "ai-tools",
  "blur-background": "ai-tools",
  "ai-summarize-pdf": "ai-tools",
  "ai-chat-pdf": "ai-tools",
  "subtitles-generator": "ai-tools",
  "video-transcription": "ai-tools",
  "video-to-gif": "ai-tools",
  "extract-audio": "ai-tools",
  
  "ai-subtitle-gen": "ai-tools",
  "ai-video-summary": "ai-tools",
  "ai-transcript": "ai-tools",
  "voice-cleaner": "ai-tools",
  "noise-removal": "ai-tools",
  "podcast-summary": "ai-tools",
  "remove-background": "ai-tools",
  "remove-objects": "ai-tools",
  "remove-watermark": "ai-tools",
  "remove-text": "ai-tools",
  "colorize-image": "ai-tools",
  "restore-photos": "ai-tools",

  // --- Image Tools ---
  "compressimage": "image-tools",
  "resizeimage": "image-tools",
  "imageinfo": "image-tools",
  "metadata-stripper": "image-tools",
  "color-palette": "image-tools",
  "ocrimage": "image-tools",
  
  "compress-image": "image-tools",
  "resize-image": "image-tools",
  "crop-image": "image-tools",
  "rotate-image": "image-tools",
  "flip-image": "image-tools",
  "blur-image": "image-tools",
  "sharpen-image": "image-tools",
  "pixelate-image": "image-tools",
  "png-to-jpg": "image-tools",
  "png-to-webp": "image-tools",
  "svg-to-png": "image-tools",
  "heic-to-jpg": "image-tools",
  "avif-to-png": "image-tools",

  // --- PDF Tools ---
  "mergepdf": "pdf-tools",
  "splitpdf": "pdf-tools",
  "compresspdf": "pdf-tools",
  "watermarkpdf": "pdf-tools",
  "rotatepdf": "pdf-tools",
  "protect-pdf": "pdf-tools",
  "unlock-pdf": "pdf-tools",
  "imagetopdf": "pdf-tools",
  "pdftoimage": "pdf-tools",
  
  "rearrange-pdf": "pdf-tools",
  "delete-pdf-pages": "pdf-tools",
  "duplicate-pdf-pages": "pdf-tools",
  "crop-pdf": "pdf-tools",
  "add-pdf-header-footer": "pdf-tools",
  "add-pdf-page-numbers": "pdf-tools",
  "add-pdf-text": "pdf-tools",
  "ocr-pdf": "pdf-tools",
  "extract-pdf-images": "pdf-tools",
  "translate-pdf": "pdf-tools",
  "pdf-to-word": "pdf-tools",
  "word-to-pdf": "pdf-tools",
  "pdf-to-jpg": "pdf-tools",
  "pdf-to-png": "pdf-tools",
  "pdf-to-excel": "pdf-tools",
  "pdf-to-csv": "pdf-tools",
  "pdf-to-html": "pdf-tools",
  "html-to-pdf": "pdf-tools",
  "pdf-to-txt": "pdf-tools",
  "txt-to-pdf": "pdf-tools",
  "pdf-to-epub": "pdf-tools",
  "epub-to-pdf": "pdf-tools",

  // --- Student Tools ---
  "equationsolver": "student-tools",
  "trianglechecker": "student-tools",
  "fibonacci": "student-tools",
  "factorial": "student-tools",
  "primenumber": "student-tools",
  "lcmhcf": "student-tools",
  "examcalc": "student-tools",
  "averagecalculator": "student-tools",
  "numbersorter": "student-tools",

  // --- Survey Builder ---
  "surveybuilder": "survey-builder",
  "mysurveys": "survey-builder",
  "responseviewer": "survey-builder",
  "publicsurvey": "survey-builder",

  // --- Utilities (all other tools) ---
  "texttospeech": "utility-tools",
  "focus-soundscape": "utility-tools",
  "ambient-noise-player": "utility-tools",
  "trim-audio": "utility-tools",
  "merge-audio": "utility-tools",
  "split-audio": "utility-tools",
  "compress-audio": "utility-tools",
  "mp4-to-mp3": "utility-tools",
  "wav-to-mp3": "utility-tools",
  "aac-to-mp3": "utility-tools",
  "flac-to-mp3": "utility-tools",
  "ogg-to-mp3": "utility-tools",
  "expenseadd": "utility-tools",
  "expenselist": "utility-tools",
  "budgettracker": "utility-tools",
  "expenseanalytics": "utility-tools",
  "dailymonthlyreport": "utility-tools",
  "searchexpenses": "utility-tools",
  "resetexpenses": "utility-tools",
  "topspendinginsights": "utility-tools",
  "daysbetween": "utility-tools",
  "todolist": "utility-tools",
  "notes": "utility-tools",
  "timer": "utility-tools",
  "reminderalert": "utility-tools",
  "medicinereminder": "utility-tools",
  "dailyplanner": "utility-tools",
  "calendarviewer": "utility-tools",
  "passwordsaver": "utility-tools",
  "passwordgen": "utility-tools",
  "qrcode-gen": "utility-tools",
  "usernamegen": "utility-tools",
  "unitconverter": "utility-tools",
  "discountcalc": "utility-tools",
  "percentagecalc": "utility-tools",
  "morse-flash": "utility-tools",
  "urlencoder": "utility-tools",
  "urlextractor": "utility-tools",
  "yesnogerator": "utility-tools",
  "spinwheel": "utility-tools",
  "choicecomparator": "utility-tools",
  "randomnamepicker": "utility-tools",
  "random-name-picker": "utility-tools",
  "caseconverter": "utility-tools",
  "wordcounter": "utility-tools",
  "palindrome": "utility-tools",
  "textreverse": "utility-tools",
  "removeduplicates": "utility-tools",
  "e-signature": "utility-tools",
  "encrypted-note": "utility-tools",
  "note-shredder": "utility-tools",
  "passwordstrength": "utility-tools",
  "password-leak": "utility-tools",
  "speed-test": "utility-tools",
  "csvviewer": "utility-tools",
  "metatagviewer": "utility-tools",
  "schema-generator": "utility-tools",
  "glass-gen": "utility-tools",
  "graphmaker": "utility-tools",
  "categorysummary": "utility-tools",
  "p2p-share": "utility-tools",
  "link-bio": "utility-tools",
  "distancecalc": "utility-tools"
};

// Sidebar short names for cleaner sidebar layout
const sidebarNames = {
  "essay-writer": "AI Essay Writer",
  "ai-humanizer": "AI Text Humanizer",
  "blog-generator": "AI Blog Planner",
  "article-writer": "AI Article Planner",
  "faq-generator": "AI FAQ Generator",
  "grammar-fixer": "AI Grammar Checker",
  "ai-rewriter": "AI Paragraph Paraphrase",
  "chatbot": "AI Chatbot Assistant",
  "text-improver": "AI Smart Text Improver",
  "summarizer": "AI Smart Text Summarizer",
  "men-prompts": "AI Prompts for Men",
  "women-prompts": "AI Prompts for Women",
  "smartsuggestions": "Refine Prompts Assistant",
  "bg-remover": "Remove Background",
  "blur-background": "Blur Background",
  "compressimage": "Shrink Photo file",
  "resizeimage": "Resize Dimensions",
  "imageinfo": "Read Photo Details",
  "image-generator": "AI Image Generator",
  "metadata-stripper": "EXIF Metadata Stripper",
  "color-palette": "Color Palette Extractor",
  "mergepdf": "Merge PDF files",
  "splitpdf": "Split PDF pages",
  "compresspdf": "Reduce PDF size",
  "rotatepdf": "Rotate PDF pages",
  "protect-pdf": "Password Lock PDF",
  "unlock-pdf": "Unlock PDF file",
  "pdftoimage": "Export PDF to Images",
  "imagetopdf": "Convert Images to PDF",
  "watermarkpdf": "Add PDF Watermark",
  "ai-summarize-pdf": "AI PDF Summarizer",
  "ai-chat-pdf": "AI Chat with PDF",
  "video-to-gif": "Convert Video to GIF",
  "subtitles-generator": "Create Video Subtitles",
  "video-transcription": "Audio Speech to Text",
  "extract-audio": "Extract Video Audio",
  "texttospeech": "Convert Text to Voice",
  "focus-soundscape": "Focus Ambient Noise Mixer",
  "ocrimage": "Scan Image to Text",
  "caseconverter": "Convert Text Cases",
  "wordcounter": "Word & Character Counter",
  "palindrome": "Palindrome Checker",
  "textreverse": "Flip Text Backward",
  "removeduplicates": "Remove Duplicate Words",
  "usernamegen": "Creative Username Generator",
  "morse-flash": "Morse Code Converter",
  "json-code": "Format JSON code",
  "json-to-ts": "JSON to TypeScript class",
  "svg-optimizer": "Optimize SVG vector",
  "urlencoder": "URL Link Encoder",
  "urlextractor": "Extract Links from Text",
  "categorysummary": "Columns Data Summarizer",
  "glass-gen": "Frosty Glass CSS Maker",
  "graphmaker": "Interactive Graph Maker",
  "equationsolver": "Parabola Math Solver",
  "averagecalculator": "Average & Mean Calculator",
  "numbersorter": "Sort Numbers in Order",
  "metatagviewer": "Audits Landing Meta Tags",
  "schema-generator": "Sitemap Schema Builder",
  "note-shredder": "Self-Destruct Notes",
  "password-leak": "Breaches Leak Scanner",
  "passwordstrength": "Key Strength Entropy",
  "encrypted-note": "Secured Vault Note",
  "e-signature": "E-Signatures Pad",
  "expenseadd": "Outflow Purchases Recorder",
  "expenselist": "View Expense Records",
  "budgettracker": "Savings Limits Planner",
  "expenseanalytics": "Spending Visual Graphs",
  "dailymonthlyreport": "Printable Balance Statements",
  "searchexpenses": "Search & Filter Expenses",
  "resetexpenses": "Erase Ledger History",
  "topspendinginsights": "Where Do I Spend Most?",
  "p2p-share": "Direct P2P File Transfer",
  "link-bio": "Link-In-Bio Page Builder",
  "timer": "Pomodoro Study Timer",
  "todolist": "Daily To-Do Checklist",
  "notes": "Quick Notebook Vault",
  "spinwheel": "Spin-the-Wheel Picker",
  "choicecomparator": "Compare Choices Matrix",
  "randomnamepicker": "Pick Random Winners",
  "distancecalc": "Distance Calc Coordinates",
  "examcalc": "Class Grade Estimator",
  "speed-test": "Internet Speed Test",
  "trianglechecker": "Triangle Validity Inspector",
  "yesnogerator": "Yes or No Decision Oracle",
  "passwordsaver": "Encrypted Password Keeper",
  "surveybuilder": "Custom Survey Builder",
  "mysurveys": "My Surveys Dashboard",
  "responseviewer": "Survey Response Analyst",
  "publicsurvey": "Fill Survey Form",
  "ambient-noise-player": "Focus Ambient Noise Mixer"
};

async function run() {
  console.log('Reading config/tools.ts...');
  let toolsContent = fs.readFileSync(toolsPath, 'utf8');

  // Replace the categories array in config/tools.ts
  const categoriesRegex = /export const categories: CategoryDefinition\[] = \[\s*[\s\S]*?\s*\];/;
  const categoriesStr = `export const categories: CategoryDefinition[] = ${JSON.stringify(newCategories, null, 2)};`;
  toolsContent = toolsContent.replace(categoriesRegex, categoriesStr);

  // Parse all tool IDs from toolsContent to make sure we don't miss any
  const toolIdsInFile = [];
  const idMatches = [...toolsContent.matchAll(/id:\s*['"]([a-zA-Z0-9_-]+)['"]/g)];
  idMatches.forEach(m => {
    if (!newCategories.map(c => c.id).includes(m[1]) && m[1] !== 'categories') {
      toolIdsInFile.push(m[1]);
    }
  });

  const uniqueToolIds = [...new Set(toolIdsInFile)];

  // Update categories of tools in config/tools.ts
  let updatedCount = 0;
  uniqueToolIds.forEach(toolId => {
    const newCat = toolIdToCategory[toolId] || 'utility-tools';
    
    const idPatterns = [
      new RegExp(`id:\\s*'${toolId}'`),
      new RegExp(`id:\\s*"${toolId}"`)
    ];

    let foundIndex = -1;
    for (const pattern of idPatterns) {
      const match = toolsContent.match(pattern);
      if (match) {
        foundIndex = match.index;
        break;
      }
    }

    if (foundIndex !== -1) {
      const subContent = toolsContent.slice(foundIndex, foundIndex + 400);
      const catMatch = subContent.match(/(category:\s*['"])(.*?)(['"])/);
      if (catMatch) {
        const fullMatch = catMatch[0];
        const prefix = catMatch[1];
        const oldCat = catMatch[2];
        const suffix = catMatch[3];
        
        const newCatStr = `${prefix}${newCat}${suffix}`;
        
        const updatedSubContent = subContent.replace(fullMatch, newCatStr);
        toolsContent = toolsContent.slice(0, foundIndex) + updatedSubContent + toolsContent.slice(foundIndex + 400);
        updatedCount++;
      }
    }
  });

  fs.writeFileSync(toolsPath, toolsContent, 'utf8');
  console.log(`Updated config/tools.ts successfully. Migrated ${updatedCount} tool categories.`);

  // Now update ClientLayout.tsx
  console.log('Reading ClientLayout.tsx...');
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');

  const toolsList = [];
  const toolBlocks = toolsContent.split('id:');
  toolBlocks.forEach((block, idx) => {
    if (idx === 0) return;
    const idMatch = block.match(/^\s*['"]?([a-zA-Z0-9_-]+)['"]?/);
    const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
    const catMatch = block.match(/category:\s*['"]([a-zA-Z0-9_-]+)['"]/);
    if (idMatch && nameMatch && catMatch) {
      toolsList.push({
        id: idMatch[1],
        name: nameMatch[1],
        category: catMatch[1]
      });
    }
  });

  // AI lists & specific groupings
  const aiToolIds = Object.keys(toolIdToCategory).filter(k => toolIdToCategory[k] === 'ai-tools');
  const imageToolIds = Object.keys(toolIdToCategory).filter(k => toolIdToCategory[k] === 'image-tools');
  const pdfToolIds = Object.keys(toolIdToCategory).filter(k => toolIdToCategory[k] === 'pdf-tools');

  const categoriesMap = {};
  newCategories.forEach(cat => {
    categoriesMap[cat.id] = {
      id: cat.id,
      name: cat.name,
      iconName: lucideIcons[cat.id] || 'Settings',
      children: []
    };
  });

  // Populate children with dual-listing logic!
  const processedSidebarEntries = {};
  newCategories.forEach(cat => {
    processedSidebarEntries[cat.id] = new Set();
  });

  toolsList.forEach(tool => {
    const shortName = sidebarNames[tool.id] || tool.name;
    const isAi = aiToolIds.includes(tool.id);
    const isImage = imageToolIds.includes(tool.id);
    const isPdf = pdfToolIds.includes(tool.id);

    // 1. If it's an AI tool, it goes to "AI Tools"
    if (isAi) {
      if (!processedSidebarEntries['ai-tools'].has(tool.id)) {
        processedSidebarEntries['ai-tools'].add(tool.id);
        categoriesMap['ai-tools'].children.push({
          name: shortName,
          path: `/ai-tools/${tool.id}`
        });
      }
    }

    // 2. If it's an Image tool (including AI image tools)
    if (isImage || (isAi && (tool.id.includes('image') || tool.id.includes('photo') || tool.id.includes('bg-remover') || tool.id.includes('background') || tool.id.includes('objects') || tool.id.includes('watermark') || tool.id.includes('text') || tool.id.includes('colorize') || tool.id.includes('restore') || tool.id.includes('png') || tool.id.includes('jpg') || tool.id.includes('webp') || tool.id.includes('svg') || tool.id.includes('heic') || tool.id.includes('avif')))) {
      if (!processedSidebarEntries['image-tools'].has(tool.id)) {
        processedSidebarEntries['image-tools'].add(tool.id);
        categoriesMap['image-tools'].children.push({
          name: shortName,
          path: `/image-tools/${tool.id}`
        });
      }
    }

    // 3. If it's a PDF tool (including AI PDF tools and PDF conversions)
    if (isPdf || (isAi && (tool.id.includes('pdf') || tool.id.includes('word-to-pdf') || tool.id.includes('epub-to-pdf') || tool.id.includes('html-to-pdf') || tool.id.includes('txt-to-pdf')))) {
      if (!processedSidebarEntries['pdf-tools'].has(tool.id)) {
        processedSidebarEntries['pdf-tools'].add(tool.id);
        categoriesMap['pdf-tools'].children.push({
          name: shortName,
          path: `/pdf-tools/${tool.id}`
        });
      }
    }

    // 4. Student tools
    if (toolIdToCategory[tool.id] === 'student-tools') {
      if (!processedSidebarEntries['student-tools'].has(tool.id)) {
        processedSidebarEntries['student-tools'].add(tool.id);
        categoriesMap['student-tools'].children.push({
          name: shortName,
          path: `/student-tools/${tool.id}`
        });
      }
    }

    // 5. Survey tools
    if (toolIdToCategory[tool.id] === 'survey-builder') {
      if (!processedSidebarEntries['survey-builder'].has(tool.id)) {
        processedSidebarEntries['survey-builder'].add(tool.id);
        categoriesMap['survey-builder'].children.push({
          name: shortName,
          path: `/survey-builder/${tool.id}`
        });
      }
    }

    // 6. Utilities (if not already mapped, or if explicitly utility)
    const alreadyMappedInNonUtility = isAi || isImage || isPdf || (toolIdToCategory[tool.id] === 'student-tools') || (toolIdToCategory[tool.id] === 'survey-builder');
    if (toolIdToCategory[tool.id] === 'utility-tools' || !alreadyMappedInNonUtility) {
      if (!processedSidebarEntries['utility-tools'].has(tool.id)) {
        processedSidebarEntries['utility-tools'].add(tool.id);
        categoriesMap['utility-tools'].children.push({
          name: shortName,
          path: `/utility-tools/${tool.id}`
        });
      }
    }
  });

  let categoriesListCode = 'const categoriesList = [\n';
  newCategories.forEach((cat, idx) => {
    const data = categoriesMap[cat.id];
    
    data.children.sort((a, b) => a.name.localeCompare(b.name));

    const childrenStr = data.children.map(child => {
      return `      { name: ${JSON.stringify(child.name)}, path: ${JSON.stringify(child.path)} }`;
    }).join(',\n');

    categoriesListCode += `    { id: '${cat.id}', name: '${cat.name}', icon: <${data.iconName} size={16} />, folderKey: '${cat.id}', children: [\n${childrenStr}\n    ]}${idx < newCategories.length - 1 ? ',' : ''}\n`;
  });
  categoriesListCode += '  ];';

  const layoutCategoriesListRegex = /const categoriesList = \[\s*[\s\S]*?\s*\];/;
  layoutContent = layoutContent.replace(layoutCategoriesListRegex, categoriesListCode);

  fs.writeFileSync(layoutPath, layoutContent, 'utf8');
  console.log('Updated ClientLayout.tsx successfully.');
}

run().catch(err => {
  console.error('Error during migration:', err);
});
