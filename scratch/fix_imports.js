const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT';
const srcDir = path.join(rootDir, 'src');
const toolsDir = path.join(srcDir, 'tools');

function fixToolsImports() {
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

    // Fix the 4-level relative path to 3-level
    content = content.replace(/from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\/([^'"]+)['"]/g, "from '../../../lib/$1'");
    content = content.replace(/from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/hooks\/([^'"]+)['"]/g, "from '../../../hooks/$1'");
    content = content.replace(/from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/config\/([^'"]+)['"]/g, "from '../../../config/$1'");
    content = content.replace(/from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/utils\/([^'"]+)['"]/g, "from '../../../utils/$1'");
    content = content.replace(/from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/services\/([^'"]+)['"]/g, "from '../../../services/$1'");
    content = content.replace(/from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/types\/([^'"]+)['"]/g, "from '../../../types/$1'");

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed tools imports in ${path.relative(srcDir, filePath)}`);
    }
  });
}

function fixLayoutAndPageImports() {
  // 1. BlogClient.tsx
  const blogClientPath = path.join(srcDir, 'app', 'blog', '[slug]', 'BlogClient.tsx');
  if (fs.existsSync(blogClientPath)) {
    let content = fs.readFileSync(blogClientPath, 'utf8');
    // Change '../../../components/ThemeProvider' to '../../../components/layout/ThemeProvider'
    content = content.replace(/['"]\.\.\/\.\.\/\.\.\/components\/ThemeProvider['"]/g, "'../../../components/layout/ThemeProvider'");
    fs.writeFileSync(blogClientPath, content, 'utf8');
    console.log('Fixed BlogClient.tsx ThemeProvider import.');
  }

  // 2. dashboard/page.tsx
  const dashboardPath = path.join(srcDir, 'app', 'dashboard', 'page.tsx');
  if (fs.existsSync(dashboardPath)) {
    let content = fs.readFileSync(dashboardPath, 'utf8');
    // Change '../../components/ThemeProvider' to '../../components/layout/ThemeProvider'
    content = content.replace(/['"]\.\.\/\.\.\/components\/ThemeProvider['"]/g, "'../../components/layout/ThemeProvider'");
    fs.writeFileSync(dashboardPath, content, 'utf8');
    console.log('Fixed dashboard/page.tsx ThemeProvider import.');
  }

  // 3. ThemeProvider.tsx
  const themeProviderPath = path.join(srcDir, 'components', 'layout', 'ThemeProvider.tsx');
  if (fs.existsSync(themeProviderPath)) {
    let content = fs.readFileSync(themeProviderPath, 'utf8');
    // Change '../lib/sync' to '../../lib/sync'
    content = content.replace(/['"]\.\.\/lib\/sync['"]/g, "'../../lib/sync'");
    fs.writeFileSync(themeProviderPath, content, 'utf8');
    console.log('Fixed ThemeProvider.tsx sync import.');
  }

  // 4. ThreeBackground.tsx
  const threeBgPath = path.join(srcDir, 'components', 'layout', 'ThreeBackground.tsx');
  if (fs.existsSync(threeBgPath)) {
    let content = fs.readFileSync(threeBgPath, 'utf8');
    // Change '../ThemeProvider' to './ThemeProvider'
    content = content.replace(/['"]\.\.\/ThemeProvider['"]/g, "'./ThemeProvider'");
    fs.writeFileSync(threeBgPath, content, 'utf8');
    console.log('Fixed ThreeBackground.tsx ThemeProvider import.');
  }
}

fixToolsImports();
fixLayoutAndPageImports();
console.log('Imports fix completed.');
