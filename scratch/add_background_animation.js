const fs = require('fs');
const path = require('path');

const toolsDir = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\tools';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has background.js
    if (content.includes('background.js')) return;

    const scripts = `
    <!-- Background Animation Scripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script src="../background.js"></script>
`;

    // Insert before closing body tag
    content = content.replace('</body>', `${scripts}\n</body>`);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added background animation scripts to ${path.basename(filePath)}`);
}

fs.readdir(toolsDir, (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (file.endsWith('.html')) {
            processFile(path.join(toolsDir, file));
        }
    });
});
