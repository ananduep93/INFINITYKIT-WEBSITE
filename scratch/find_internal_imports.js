const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, '../components/tools');
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.tsx'));

const internalImports = {};

files.forEach(file => {
  const content = fs.readFileSync(path.join(toolsDir, file), 'utf8');
  const matches = [...content.matchAll(/import\s+.*?\s+from\s+['"]\.\/([^'"]+)['"]/g)];
  if (matches.length > 0) {
    internalImports[file] = matches.map(m => m[1]);
  }
});

console.log('INTERNAL IMPORTS IN COMPONENTS/TOOLS:');
console.log(JSON.stringify(internalImports, null, 2));
