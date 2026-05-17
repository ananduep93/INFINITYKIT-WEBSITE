const fs = require('fs');
const path = require('path');

const foldersDir = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\folder';

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
    console.log(`Added background animation scripts to folder/${path.basename(filePath)}`);
}

// Check if directory exists before reading
if (fs.existsSync(foldersDir)) {
    fs.readdir(foldersDir, (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            if (file.endsWith('.html')) {
                processFile(path.join(foldersDir, file));
            }
        });
    });
} else {
    console.error(`Directory not found: ${foldersDir}`);
}
