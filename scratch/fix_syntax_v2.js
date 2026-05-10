const fs = require('fs');

let content = fs.readFileSync('main.js', 'utf8');

// Find the PDF logic section
const startMarker = '// ===== AUTO-GENERATED PDF TOOLS LOGIC =====';
const startIndex = content.indexOf(startMarker);

if (startIndex !== -1) {
    const prefix = content.substring(0, startIndex);
    const suffix = content.substring(startIndex);
    
    // Fix only the suffix part
    const fixedSuffix = suffix.replace(/\\`/g, '`').replace(/\\\${/g, '${').replace(/\\n/g, '\n');
    
    fs.writeFileSync('main.js', prefix + fixedSuffix);
    console.log('Fixed syntax in PDF section of main.js');
} else {
    console.log('PDF marker not found');
}
