const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config/tools.ts');
const registryPath = path.join(__dirname, '../components/tools/index.tsx');
const toolsDir = path.join(__dirname, '../components/tools');

const configContent = fs.readFileSync(configPath, 'utf8');
const registryContent = fs.readFileSync(registryPath, 'utf8');

// Parse registry keys to see which file corresponds to which exports
const importMatches = [...registryContent.matchAll(/const (\w+)\s*=\s*dynamic\(\(\)\s*=>\s*import\('(?:\.\/|\.\.\/tools\/)(.*?)'\)[^)]*\)/g)];
const importMap = {};
importMatches.forEach(m => {
  importMap[m[1]] = m[2]; // e.g. TodoList -> './TodoList'
});

// Let's find matches like:
// const AISubtitleGen      = dynamic(() => import('./VideoSuiteWrappers').then(m => m.AISubtitleGen), ...);
const complexImportMatches = [...registryContent.matchAll(/const (\w+)\s*=\s*dynamic\(\(\)\s*=>\s*import\('(?:\.\/|\.\.\/tools\/)(.*?)'\)\.then\(m\s*=>\s*m\.(\w+)\)/g)];
complexImportMatches.forEach(m => {
  importMap[m[1]] = m[2]; // e.g. AISubtitleGen -> './VideoSuiteWrappers'
});

// Read registry mappings (lowercase mappings to component names)
const registryMatch = registryContent.match(/export const toolsRegistry: Record<string, React\.ComponentType<any>> = \{([\s\S]*?)\};/);
if (!registryMatch) {
  console.error('Failed to locate toolsRegistry');
  process.exit(1);
}

const registryLines = registryMatch[1].split('\n');
const keyToComponent = {};
const componentToKeys = {};

// Simple matches first: component name listed directly (e.g. TodoList)
registryLines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.length === 0) return;
  
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    const key = parts[0].trim().replace(/['"]/g, '');
    const comp = parts[1].trim().replace(/,$/, '').replace(/['"]/g, '');
    keyToComponent[key] = comp;
    if (!componentToKeys[comp]) componentToKeys[comp] = [];
    componentToKeys[comp].push(key);
  } else {
    const comp = trimmed.replace(/,$/, '');
    if (comp.match(/^[a-zA-Z0-9_-]+$/)) {
      keyToComponent[comp] = comp;
      if (!componentToKeys[comp]) componentToKeys[comp] = [];
      componentToKeys[comp].push(comp);
    }
  }
});

// Parse all tools defined in config/tools.ts
// We'll read the tools array definition.
// A tool has an id and category.
const tools = [];
const toolBlocks = configContent.split('id:');
toolBlocks.forEach((block, idx) => {
  if (idx === 0) return;
  
  const idMatch = block.match(/^\s*['"]?([a-zA-Z0-9_-]+)['"]?/);
  const catMatch = block.match(/category:\s*['"]([a-zA-Z0-9_-]+)['"]/);
  const compMatch = block.match(/componentName:\s*['"]([a-zA-Z0-9_-]+)['"]/);
  const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
  const typeMatch = block.match(/type:\s*['"](custom|simple)['"]/);

  if (idMatch) {
    const id = idMatch[1];
    const category = catMatch ? catMatch[1] : '';
    const componentName = compMatch ? compMatch[1] : id;
    const name = nameMatch ? nameMatch[1] : '';
    const type = typeMatch ? typeMatch[1] : 'simple';
    
    tools.push({ id, name, category, componentName, type });
  }
});

// Now, let's map each actual file in components/tools/ to a category
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.tsx') && f !== 'index.tsx');
const fileMapping = [];

files.forEach(file => {
  const baseName = path.basename(file, '.tsx');
  
  // Find which tool(s) use this component
  // Check if baseName matches componentName or id of any tool
  let mappedTools = tools.filter(t => t.componentName === baseName || t.id === baseName || (componentToKeys[baseName] && componentToKeys[baseName].includes(t.id)));
  
  if (mappedTools.length === 0) {
    // Check if it's imported in registry
    // e.g. importMap[something] === `./${baseName}`
    const importedAs = Object.keys(importMap).filter(k => importMap[k] === `./${baseName}` || importMap[k] === baseName);
    if (importedAs.length > 0) {
      mappedTools = tools.filter(t => importedAs.includes(t.componentName) || importedAs.includes(t.id));
    }
  }
  
  const categoriesList = [...new Set(mappedTools.map(t => t.category).filter(Boolean))];
  fileMapping.push({
    file,
    baseName,
    categories: categoriesList,
    tools: mappedTools.map(t => ({ id: t.id, name: t.name, category: t.category, type: t.type }))
  });
});

fs.writeFileSync(path.join(__dirname, 'migration_mapping.json'), JSON.stringify(fileMapping, null, 2), 'utf8');
console.log(`Mapped ${fileMapping.length} files. Saved to migration_mapping.json.`);
