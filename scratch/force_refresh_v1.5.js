const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const toolsDir = path.join(rootDir, 'tools');

// 1. Update version numbers and add html2pdf library
const htmlFiles = [
    path.join(rootDir, 'index.html'),
    ...fs.readdirSync(toolsDir).filter(f => f.endsWith('.html')).map(f => path.join(toolsDir, f))
];

const html2pdfScript = '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>';

htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // Update version
        content = content.replace(/\?v=1\.\d/g, '?v=1.5');
        // Add html2pdf if missing
        if (!content.includes('html2pdf.bundle.min.js')) {
            content = content.replace('html2canvas/1.4.1/html2canvas.min.js"></script>', 'html2canvas/1.4.1/html2canvas.min.js"></script>\\n    ' + html2pdfScript);
        }
        fs.writeFileSync(file, content);
    }
});

console.log('Updated version numbers to v1.5 and added html2pdf library to all files');
