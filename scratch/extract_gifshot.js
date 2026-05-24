const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\anand\\.gemini\\antigravity\\brain\\a3b75a90-10bc-4e83-9602-638825385bab\\.system_generated\\steps\\3789\\content.md';
const destPath = path.join(__dirname, '../public/gifshot.min.js');

if (!fs.existsSync(srcPath)) {
  console.error('Source content.md not found at:', srcPath);
  process.exit(1);
}

const content = fs.readFileSync(srcPath, 'utf8');
const lines = content.split('\n');

// Extract lines starting from line 9 (which is index 8)
const jsLines = lines.slice(8);
const jsCode = jsLines.join('\n');

// Ensure parent directories exist
const parentDir = path.dirname(destPath);
if (!fs.existsSync(parentDir)) {
  fs.mkdirSync(parentDir, { recursive: true });
}

// Write to public/gifshot.min.js
fs.writeFileSync(destPath, jsCode, 'utf8');

console.log('Successfully extracted and saved gifshot.min.js to public/! File size:', fs.statSync(destPath).size, 'bytes');
