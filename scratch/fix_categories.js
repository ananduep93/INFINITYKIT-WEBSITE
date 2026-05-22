const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../config/tools.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Mapping of specific tools to their new category
const toolCategoryOverrides = {
  // SEO Tools
  'metatagviewer': 'seo-tools',
  
  // OCR Tools
  'ocrimage': 'ocr-tools',
  
  // File Conversion
  'imagetopdf': 'file-conversion-tools',
  'pdftoimage': 'file-conversion-tools',
  
  // Social Media
  'link-bio': 'social-media-tools',
  'p2p-share': 'social-media-tools',
  
  // AI Writing Tools
  'chatbot': 'ai-writing-tools',
  'text-improver': 'ai-writing-tools',
  'summarizer': 'ai-writing-tools',
  'image-generator': 'ai-writing-tools',
  'men-prompts': 'ai-writing-tools',
  'women-prompts': 'ai-writing-tools',
  'smartsuggestions': 'ai-writing-tools',
  
  // PDF Tools
  'mergepdf': 'pdf-tools',
  'splitpdf': 'pdf-tools',
  'watermarkpdf': 'pdf-tools',
  'rotatepdf': 'pdf-tools',
  
  // Image Tools
  'compressimage': 'image-tools',
  'resizeimage': 'image-tools',
  'imageinfo': 'image-tools',
  'color-palette': 'image-tools',
  'metadata-stripper': 'image-tools',

  // Automation Tools
  'bulk-renamer': 'automation-tools',
  'dailyplanner': 'automation-tools',
  'calendarviewer': 'automation-tools',
  'reminderalert': 'automation-tools',
  
  // Developer Tools
  'json-to-ts': 'developer-tools',
  'json-code': 'developer-tools',
  'urlencoder': 'developer-tools',
  'urlextractor': 'developer-tools',
  'glass-gen': 'developer-tools',
  'svg-path-optimizer': 'developer-tools',
  'svg-optimizer': 'developer-tools',
  'csvviewer': 'developer-tools',
  
  // Utilities
  'qrcode-gen': 'utility-tools'
};

// General mapping of category IDs
const categoryMapping = {
  'daily-essentials': 'utility-tools',
  'expense-tracker': 'utility-tools',
  'survey-hub': 'utility-tools',
  'utilities': 'utility-tools',
  'pdf-toolkit': 'pdf-tools',
  'image': 'image-tools',
  'math-tools': 'utility-tools',
  'time-tools': 'utility-tools',
  'text-tools': 'utility-tools',
  'student-tools': 'utility-tools',
  'quick-tools': 'utility-tools',
  'data-tools': 'developer-tools',
  'decision-tools': 'utility-tools',
  'planner-tools': 'automation-tools',
  'web-tools': 'developer-tools',
  'health-utility-hub': 'utility-tools',
  'social-tools': 'social-media-tools',
  'ai-tools': 'ai-writing-tools',
  'advanced-suite': 'developer-tools',
  'ai-prompts': 'ai-writing-tools'
};

// Match tool blocks inside export const tools = [ ... ];
// We can parse line by line and track when we are inside a tool object
const lines = content.split('\n');
let insideTools = false;
let currentToolId = '';
let modifiedLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  if (line.includes('export const tools: ToolDefinition[] = [')) {
    insideTools = true;
  }
  
  if (insideTools) {
    const idMatch = line.match(/id:\s*['"]([^'"]+)['"]/);
    if (idMatch) {
      currentToolId = idMatch[1];
    }
    
    const catMatch = line.match(/category:\s*['"]([^'"]+)['"]/);
    if (catMatch) {
      const oldCat = catMatch[1];
      let newCat = toolCategoryOverrides[currentToolId] || categoryMapping[oldCat] || oldCat;
      
      line = line.replace(`category: '${oldCat}'`, `category: '${newCat}'`)
                 .replace(`category: "${oldCat}"`, `category: "${newCat}"`);
      console.log(`Updated tool "${currentToolId}": category ${oldCat} -> ${newCat}`);
    }
  }
  
  modifiedLines.push(line);
}

fs.writeFileSync(filePath, modifiedLines.join('\n'), 'utf8');
console.log('Successfully updated tools config categories.');
