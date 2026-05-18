const fs = require('fs');
const filePath = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\tools\\compressimage.html';

if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    const oldRegex = /function initTool\(\) \{([\s\S]*?)\}/;
    
    if (oldRegex.test(content)) {
        const match = content.match(oldRegex);
        
        const newCode = `function initTool() {
            try {
                if (typeof loadCompressImage === 'function') {
                    loadCompressImage();
                    trackToolUsage('compressimage');
                    addRecentTool('compressimage', 'Compress Image');
                } else {
                    window.toolContent.innerHTML = '<div class="error">Tool logic failed to load. Please refresh the page.</div>';
                }
            } catch (e) {
                window.toolContent.innerHTML = '<div class="error">Error executing tool: ' + e.message + '</div>';
                console.error("Tool execution failed:", e);
            }
        }`;
        
        content = content.replace(oldRegex, newCode);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully added try...catch to initTool in compressimage.html using regex');
    } else {
        console.log('Target regex not found in compressimage.html');
    }
} else {
    console.error('File not found: ' + filePath);
}
