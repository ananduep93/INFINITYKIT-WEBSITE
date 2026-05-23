const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config/tools.ts');
const registryPath = path.join(__dirname, '../components/tools/index.tsx');

if (!fs.existsSync(configPath) || !fs.existsSync(registryPath)) {
  console.error('Paths do not exist!');
  process.exit(1);
}

const configContent = fs.readFileSync(configPath, 'utf8');
const registryContent = fs.readFileSync(registryPath, 'utf8');

// Parse registry exported keys
const registryMatch = registryContent.match(/export const toolsRegistry: Record<string, React\.ComponentType<any>> = \{([\s\S]*?)\};/);
if (!registryMatch) {
  console.error('Failed to locate toolsRegistry in index.tsx');
  process.exit(1);
}

// Clean comments and extract keys
const cleanRegistryString = registryMatch[1].replace(/\/\/.*$/gm, ''); // strip single-line comments
const registryKeys = new Set(
  cleanRegistryString
    .split(',')
    .map(k => {
      const parts = k.split(':');
      const keyName = parts[0].trim();
      // Remove any surrounding quotes
      return keyName.replace(/['"]/g, '');
    })
    .filter(k => k.length > 0)
);

// Find all custom tools in config
const toolBlocks = configContent.split('id:');
let mismatchCount = 0;
let totalCustom = 0;

toolBlocks.forEach((block, idx) => {
  if (idx === 0) return; // skip header
  
  const idMatch = block.match(/^\s*['"]?([a-zA-Z0-9_-]+)['"]?/);
  const typeMatch = block.match(/type:\s*['"](custom|simple)['"]/);
  const compMatch = block.match(/componentName:\s*['"]([a-zA-Z0-9_-]+)['"]/);
  const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);

  if (idMatch && typeMatch && typeMatch[1] === 'custom') {
    totalCustom++;
    const id = idMatch[1];
    const compName = compMatch ? compMatch[1] : id;
    const name = nameMatch ? nameMatch[1] : id;

    // Check key in registry
    if (!registryKeys.has(compName)) {
      let foundAlternative = null;
      for (let rKey of registryKeys) {
        if (rKey.toLowerCase() === compName.toLowerCase()) {
          foundAlternative = rKey;
          break;
        }
      }

      if (foundAlternative) {
        console.log(`⚠️ CASE MISMATCH: Tool "${name}" expects "${compName}", registry has "${foundAlternative}"`);
      } else {
        console.log(`❌ NOT REGISTERED: Tool "${name}" (ID: "${id}", componentName: "${compName}") has no component in index.tsx!`);
      }
      mismatchCount++;
    } else {
      // Check if file actually exists
      const filePath = path.join(__dirname, '../components/tools', `${compName}.tsx`);
      // Since some compNames are mapped to generic fallbacks or exist in registry under lowercase, let's verify if a file exists (ignoring casing or checking standard file)
      let fileExists = fs.existsSync(filePath);
      if (!fileExists) {
        // Search if file exists with different casing
        const dirFiles = fs.readdirSync(path.join(__dirname, '../components/tools'));
        const matchedFile = dirFiles.find(f => f.toLowerCase() === `${compName.toLowerCase()}.tsx`);
        if (matchedFile) {
          fileExists = true;
        }
      }

      if (!fileExists) {
        console.log(`❌ FILE MISSING: Component "${compName}.tsx" for Tool "${name}" does not exist in components/tools/!`);
        mismatchCount++;
      }
    }
  }
});

console.log(`\nProcessed ${totalCustom} custom tools. Found ${mismatchCount} alignment errors.`);
