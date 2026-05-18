const fs = require('fs');
const path = require('path');

const files = [
    'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\tools\\todolist.html',
    'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\tools\\compressimage.html'
];

files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        const oldRegex = /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{([\s\S]*?)\}\);/;
        
        if (oldRegex.test(content)) {
            const match = content.match(oldRegex);
            const innerContent = match[1];
            
            const newContent = `function initTool() {${innerContent}}

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initTool);
        } else {
            initTool();
        }`;
            
            content = content.replace(oldRegex, newContent);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Successfully fixed race condition in ${path.basename(filePath)}`);
        } else {
            console.log(`Pattern not found in ${path.basename(filePath)}`);
        }
    } else {
        console.error(`File not found: ${filePath}`);
    }
});
