const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\ai-tools\\index.html';

if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Comment out the redirect line
    const oldContent = `if (!user) window.location.href = '/signin.html';`;
    const newContent = `// Removed mandatory redirect so Google can index the page content\n            // if (!user) window.location.href = '/signin.html';`;
    
    if (content.includes(oldContent)) {
        content = content.replace(oldContent, newContent);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully commented out the redirect in ai-tools/index.html');
    } else {
        console.log('Target content not found in ai-tools/index.html');
    }
} else {
    console.error('File not found: ' + filePath);
}
