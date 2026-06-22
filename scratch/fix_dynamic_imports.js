const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT';
const srcDir = path.join(rootDir, 'src');
const toolsDir = path.join(srcDir, 'tools');

const filesToProcess = [];
function readDirRecursive(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      readDirRecursive(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      filesToProcess.push(fullPath);
    }
  });
}
readDirRecursive(toolsDir);

filesToProcess.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace dynamic import paths
  content = content.replace(/import\(['"]\.\.\/\.\.\/lib\/([^'"]+)['"]\)/g, "import('../../../lib/$1')");
  content = content.replace(/import\(['"]\.\.\/\.\.\/hooks\/([^'"]+)['"]\)/g, "import('../../../hooks/$1')");
  content = content.replace(/import\(['"]\.\.\/\.\.\/config\/([^'"]+)['"]\)/g, "import('../../../config/$1')");
  content = content.replace(/import\(['"]\.\.\/\.\.\/utils\/([^'"]+)['"]\)/g, "import('../../../utils/$1')");
  content = content.replace(/import\(['"]\.\.\/\.\.\/services\/([^'"]+)['"]\)/g, "import('../../../services/$1')");
  content = content.replace(/import\(['"]\.\.\/\.\.\/types\/([^'"]+)['"]\)/g, "import('../../../types/$1')");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed dynamic imports in ${path.relative(srcDir, filePath)}`);
  }
});

console.log('Dynamic imports fix completed.');
