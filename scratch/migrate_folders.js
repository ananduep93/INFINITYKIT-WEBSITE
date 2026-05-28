const fs = require('fs');
const path = require('path');

const toolsPath = path.join('c:', 'Users', 'anand', 'OneDrive', 'Documents', 'INFINITY KIT', 'config', 'tools.ts');
const layoutPath = path.join('c:', 'Users', 'anand', 'OneDrive', 'Documents', 'INFINITY KIT', 'components', 'ui', 'ClientLayout.tsx');

// Define 29 categories
const newCategories = [
  { id: 'ai-tools', name: 'AI Tools', icon: '🤖', emoji: '🤖', description: 'Chatbots, prompt helpers, and AI graphics.' },
  { id: 'image-tools', name: 'Image Tools', icon: '🖼️', emoji: '🖼️', description: 'Resize, edit, strip metadata, and extract palettes.' },
  { id: 'pdf-tools', name: 'PDF Tools', icon: '📄', emoji: '📄', description: 'Merge, split, lock, unlock, and sign PDF pages.' },
  { id: 'video-tools', name: 'Video Tools', icon: '🎥', emoji: '🎥', description: 'Convert videos and generate subtitles.' },
  { id: 'audio-tools', name: 'Audio Tools', icon: '🎵', emoji: '🎵', description: 'Text to speech and ambient noise mixers.' },
  { id: 'text-tools', name: 'Text Tools', icon: '🔤', emoji: '🔤', description: 'Counters, case converters, duplicate removers, and OCR.' },
  { id: 'developer-tools', name: 'Developer Tools', icon: '💻', emoji: '💻', description: 'JSON formatters, compilers, and SVG builders.' },
  { id: 'student-tools', name: 'Student Tools', icon: '🎓', emoji: '🎓', description: 'Average, formula solvers, and grade calculators.' },
  { id: 'seo-tools', name: 'SEO Tools', icon: '📈', emoji: '📈', description: 'Website meta tag checkers and schema builders.' },
  { id: 'security-tools', name: 'Security Tools', icon: '🛡️', emoji: '🛡️', description: 'Password strength checkers and leak scanners.' },
  { id: 'business-tools', name: 'Business Tools', icon: '💼', emoji: '💼', description: 'E-signatures, expenses, and monthly budget trackers.' },
  { id: 'social-tools', name: 'Social Tools', icon: '📱', emoji: '📱', description: 'Link-in-bio builders and direct file shares.' },
  { id: 'productivity-tools', name: 'Productivity Tools', icon: '⏱️', emoji: '⏱️', description: 'Timers, schedules, planners, and task lists.' },
  { id: 'utility-tools', name: 'Utility Tools', icon: '🛠️', emoji: '🛠️', description: 'Decision wheels and custom utility boards.' },
  { id: 'document-tools', name: 'Document Tools', icon: '📁', emoji: '📁', description: 'Local document editors and converters.' },
  { id: 'generator-tools', name: 'Generator Tools', icon: '⚙️', emoji: '⚙️', description: 'QR code and strong password generators.' },
  { id: 'calculator-tools', name: 'Calculator Tools', icon: '🧮', emoji: '🧮', description: 'Dose, drip, discount, BMI, and percentage calculators.' },
  { id: 'converter-tools', name: 'Converter Tools', icon: '🔄', emoji: '🔄', description: 'URL converters, Morse translators, and units.' },
  { id: 'file-tools', name: 'File Tools', icon: '📁', emoji: '📁', description: 'Bulk renamers and file utilities.' },
  { id: 'coding-tools', name: 'Coding Tools', icon: '💻', emoji: '💻', description: 'JSON and code development helpers.' },
  { id: 'cloud-tools', name: 'Cloud Tools', icon: '☁️', emoji: '☁️', description: 'Direct p2p secured cloud file transfers.' },
  { id: 'automation-tools', name: 'Automation Tools', icon: '⚡', emoji: '⚡', description: 'Daily routines and notification alerts.' },
  { id: 'creator-tools', name: 'Creator Tools', icon: '🎨', emoji: '🎨', description: 'Drawing signatures and visual assets.' },
  { id: 'research-tools', name: 'Research Tools', icon: '🔍', emoji: '🔍', description: 'Graph builders and spreadsheet readers.' },
  { id: 'writing-tools', name: 'Writing Tools', icon: '✍️', emoji: '✍️', description: 'AI essay, blog, and article writers.' },
  { id: 'marketing-tools', name: 'Marketing Tools', icon: '📢', emoji: '📢', description: 'SEO landing page checkers.' },
  { id: 'compression-tools', name: 'Compression Tools', icon: '🗜️', emoji: '🗜️', description: 'Image, vector, and PDF compressors.' },
  { id: 'media-tools', name: 'Media Tools', icon: '🎬', emoji: '🎬', description: 'Audio extractors and video subtitles generator.' },
  { id: 'survey-tools', name: 'Survey Tools', icon: '📊', emoji: '📊', description: 'Interactive survey form builders.' }
];

// Mapping for tool ID to category ID
const toolIdToCategory = {
  "bmicalculator": "calculator-tools",
  "drugdosage": "calculator-tools",
  "ivdripcalc": "calculator-tools",
  "medicinereminder": "calculator-tools",
  "todolist": "productivity-tools",
  "notes": "productivity-tools",
  "timer": "productivity-tools",
  "expenseadd": "business-tools",
  "expenselist": "business-tools",
  "budgettracker": "business-tools",
  "expenseanalytics": "business-tools",
  "dailymonthlyreport": "business-tools",
  "searchexpenses": "business-tools",
  "topspendinginsights": "business-tools",
  "resetexpenses": "business-tools",
  "chatbot": "ai-tools",
  "text-improver": "ai-tools",
  "summarizer": "ai-tools",
  "image-generator": "ai-tools",
  "essay-writer": "writing-tools",
  "article-writer": "writing-tools",
  "blog-generator": "writing-tools",
  "faq-generator": "writing-tools",
  "ai-rewriter": "writing-tools",
  "ai-humanizer": "writing-tools",
  "grammar-fixer": "writing-tools",
  "passwordgen": "generator-tools",
  "qrcode-gen": "generator-tools",
  "unitconverter": "converter-tools",
  "discountcalc": "calculator-tools",
  "percentagecalc": "calculator-tools",
  "lcmhcf": "calculator-tools",
  "urlencoder": "converter-tools",
  "caseconverter": "text-tools",
  "wordcounter": "text-tools",
  "fibonacci": "calculator-tools",
  "factorial": "calculator-tools",
  "primenumber": "calculator-tools",
  "daysbetween": "calculator-tools",
  "palindrome": "text-tools",
  "textreverse": "text-tools",
  "averagecalculator": "student-tools",
  "numbersorter": "student-tools",
  "yesnogerator": "utility-tools",
  "trianglechecker": "utility-tools",
  "graphmaker": "coding-tools",
  "removeduplicates": "text-tools",
  "usernamegen": "generator-tools",
  "e-signature": "creator-tools",
  "metadata-stripper": "image-tools",
  "bulk-renamer": "automation-tools",
  "json-to-ts": "developer-tools",
  "encrypted-note": "security-tools",
  "dailyplanner": "productivity-tools",
  "calendarviewer": "productivity-tools",
  "reminderalert": "productivity-tools",
  "men-prompts": "ai-tools",
  "women-prompts": "ai-tools",
  "svg-optimizer": "compression-tools",
  "password-leak": "security-tools",
  "note-shredder": "security-tools",
  "csvviewer": "document-tools", // mapped csv viewer here
  "metatagviewer": "marketing-tools",
  "speed-test": "utility-tools",
  "morse-flash": "converter-tools",
  "p2p-share": "cloud-tools",
  "distancecalc": "utility-tools",
  "equationsolver": "student-tools",
  "examcalc": "utility-tools",
  "passwordstrength": "security-tools",
  "spinwheel": "utility-tools",
  "choicecomparator": "utility-tools",
  "randomnamepicker": "utility-tools",
  "compressimage": "compression-tools",
  "resizeimage": "image-tools",
  "bg-remover": "image-tools",
  "blur-background": "image-tools",
  "ocrimage": "text-tools",
  "imageinfo": "image-tools",
  "imagetopdf": "file-tools",
  "pdftoimage": "file-tools",
  "mergepdf": "pdf-tools",
  "compresspdf": "compression-tools",
  "splitpdf": "pdf-tools",
  "watermarkpdf": "pdf-tools",
  "rotatepdf": "pdf-tools",
  "protect-pdf": "pdf-tools",
  "unlock-pdf": "pdf-tools",
  "ai-summarize-pdf": "pdf-tools",
  "ai-chat-pdf": "pdf-tools",
  "color-palette": "image-tools",
  "texttospeech": "audio-tools",
  "urlextractor": "converter-tools",
  "glass-gen": "coding-tools",
  "json-code": "developer-tools",
  "link-bio": "social-tools",
  "passwordsaver": "security-tools",
  "surveybuilder": "survey-tools",
  "mysurveys": "survey-tools",
  "responseviewer": "survey-tools",
  "smartsuggestions": "ai-tools",
  "publicsurvey": "survey-tools",
  "categorysummary": "research-tools",
  "extract-audio": "media-tools",
  "video-to-gif": "media-tools",
  "subtitles-generator": "video-tools",
  "video-transcription": "video-tools",
  "schema-generator": "seo-tools",
  "random-name-picker": "utility-tools",
  "ambient-noise-player": "audio-tools"
};

// Original sidebar names for high fidelity layout
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

const lucideIcons = {
  'ai-tools': 'Sparkles',
  'image-tools': 'ImageIcon',
  'pdf-tools': 'FileText',
  'video-tools': 'Video',
  'audio-tools': 'Music',
  'text-tools': 'Scan',
  'developer-tools': 'Code',
  'student-tools': 'GraduationCap',
  'seo-tools': 'Search',
  'security-tools': 'Shield',
  'business-tools': 'Briefcase',
  'social-tools': 'Share2',
  'productivity-tools': 'ClipboardList',
  'utility-tools': 'Settings',
  'document-tools': 'FolderOpen',
  'generator-tools': 'Zap',
  'calculator-tools': 'Calculator',
  'converter-tools': 'Activity',
  'file-tools': 'Folder',
  'coding-tools': 'Code',
  'cloud-tools': 'Share2',
  'automation-tools': 'Activity',
  'creator-tools': 'PenTool',
  'research-tools': 'BarChart3',
  'writing-tools': 'PenTool',
  'marketing-tools': 'Search',
  'compression-tools': 'Folder',
  'media-tools': 'Video',
  'survey-tools': 'BarChart3'
};

async function run() {
  console.log('Reading config/tools.ts...');
  let toolsContent = fs.readFileSync(toolsPath, 'utf8');

  // Let's replace the categories array in config/tools.ts
  const categoriesRegex = /export const categories: CategoryDefinition\[] = \[\s*[\s\S]*?\s*\];/;
  const categoriesStr = `export const categories: CategoryDefinition[] = ${JSON.stringify(newCategories, null, 2)};`;
  toolsContent = toolsContent.replace(categoriesRegex, categoriesStr);

  // Let's migrate categories of tools in config/tools.ts
  // We can do it by finding each category attribute and replacing it.
  // Wait, let's write a parser that updates the tools definitions array in a high fidelity way.
  // Each tool has "category: '...'" or 'category: "..."'. Let's find each tool definition block.
  // A tool definition looks like:
  // {
  //   id: 'id',
  //   ...
  //   category: '...',
  //   ...
  // }
  // We can replace it using regex for each tool or step through it.
  // Wait! A more precise way is to match `{` to `}` blocks or use a parser.
  // But wait! We can find `id: 'bmicalculator'` and then find the next `category: '...'` or `category: "..."` and replace it!
  // Let's do that for each tool!
  let updatedCount = 0;
  for (const [toolId, newCat] of Object.entries(toolIdToCategory)) {
    // Find the block of the tool: start searching from `id: 'toolId'` or `id: "toolId"`
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
      // Find the next category definition within the next 400 characters (limit the range to the current object)
      const subContent = toolsContent.slice(foundIndex, foundIndex + 400);
      const catMatch = subContent.match(/(category:\s*['"])(.*?)(['"])/);
      if (catMatch) {
        const fullMatch = catMatch[0];
        const prefix = catMatch[1];
        const oldCat = catMatch[2];
        const suffix = catMatch[3];
        
        const newCatStr = `${prefix}${newCat}${suffix}`;
        
        // Replace ONLY the first occurrence of fullMatch in the subContent
        const updatedSubContent = subContent.replace(fullMatch, newCatStr);
        toolsContent = toolsContent.slice(0, foundIndex) + updatedSubContent + toolsContent.slice(foundIndex + 400);
        updatedCount++;
      }
    }
  }

  // Remove duplicate note-shredder definition
  // Let's find the first note-shredder and the second note-shredder, and remove the second one.
  const noteShredderRegex = /\{\s*id:\s*'note-shredder',[\s\S]*?\}\s*,?/g;
  const noteShredderMatches = [...toolsContent.matchAll(noteShredderRegex)];
  if (noteShredderMatches.length > 1) {
    console.log(`Found ${noteShredderMatches.length} note-shredder definitions, removing duplicate...`);
    const secondMatchIndex = noteShredderMatches[1].index;
    const matchLength = noteShredderMatches[1][0].length;
    toolsContent = toolsContent.slice(0, secondMatchIndex) + toolsContent.slice(secondMatchIndex + matchLength);
  }

  fs.writeFileSync(toolsPath, toolsContent, 'utf8');
  console.log(`Updated config/tools.ts successfully. Migrated ${updatedCount} tool categories.`);

  // Now, let's update components/ui/ClientLayout.tsx!
  console.log('Reading components/ui/ClientLayout.tsx...');
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');

  // Let's generate the categoriesList array for ClientLayout.tsx dynamically!
  // We need to group tools by category.
  // Let's load the updated tools array from config/tools.ts
  const toolsModule = require(toolsPath);
  const updatedTools = toolsModule.tools;

  const categoriesMap = {};
  newCategories.forEach(cat => {
    categoriesMap[cat.id] = {
      id: cat.id,
      name: cat.name,
      iconName: lucideIcons[cat.id] || 'Settings',
      children: []
    };
  });

  // Unique tools check
  const processedToolIds = new Set();
  updatedTools.forEach(tool => {
    if (processedToolIds.has(tool.id)) return; // skip duplicate note-shredder
    processedToolIds.add(tool.id);

    const catId = tool.category;
    if (categoriesMap[catId]) {
      const shortName = sidebarNames[tool.id] || tool.name;
      categoriesMap[catId].children.push({
        name: shortName,
        path: `/${catId}/${tool.id}`
      });
    } else {
      console.warn(`Warning: Category ${catId} not found in newCategories for tool ${tool.id}`);
    }
  });

  // Build the code string for categoriesList
  let categoriesListCode = 'const categoriesList = [\n';
  newCategories.forEach((cat, idx) => {
    const data = categoriesMap[cat.id];
    const childrenStr = data.children.map(child => {
      return `      { name: ${JSON.stringify(child.name)}, path: ${JSON.stringify(child.path)} }`;
    }).join(',\n');

    categoriesListCode += `    { id: '${cat.id}', name: '${cat.name}', icon: <${data.iconName} size={16} />, folderKey: '${cat.id}', children: [\n${childrenStr}\n    ]}${idx < newCategories.length - 1 ? ',' : ''}\n`;
  });
  categoriesListCode += '  ];';

  // Replace the categoriesList array in ClientLayout.tsx
  const layoutCategoriesListRegex = /const categoriesList = \[\s*[\s\S]*?\s*\];/;
  layoutContent = layoutContent.replace(layoutCategoriesListRegex, categoriesListCode);

  fs.writeFileSync(layoutPath, layoutContent, 'utf8');
  console.log('Updated components/ui/ClientLayout.tsx successfully.');
}

run().catch(err => {
  console.error('Error during migration:', err);
});
