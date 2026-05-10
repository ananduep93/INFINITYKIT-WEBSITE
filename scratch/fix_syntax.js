const fs = require('fs');
const path = require('main.js'); // Wait, this is wrong

const content = fs.readFileSync('main.js', 'utf8');
// Replace escaped backticks with unescaped ones
// But be careful, we only want to fix the ones that are breaking template literals
// Specifically those that look like \`
const fixedContent = content.replace(/\\`/g, '`').replace(/\\\${/g, '${');

fs.writeFileSync('main.js', fixedContent);
console.log('Fixed escaped backticks and template expressions in main.js');
