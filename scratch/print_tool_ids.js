const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT';
const toolsPath = path.join(rootDir, 'src', 'config', 'tools.ts');

const toolsContent = fs.readFileSync(toolsPath, 'utf8');
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

console.log(JSON.stringify(toolsList, null, 2));
