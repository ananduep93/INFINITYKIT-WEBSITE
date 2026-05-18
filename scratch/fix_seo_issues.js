const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT';
const toolsDir = path.join(baseDir, 'tools');
const folderDir = path.join(baseDir, 'folder');
const aiToolsDir = path.join(baseDir, 'ai-tools');

function processHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Fix specific about-page links
    if (content.includes('index.html#about-page')) {
        content = content.replace(/href="[^"]*index\.html#about-page"/g, 'href="/about"');
        changed = true;
    }

    // 2. Fix index.html links to "/"
    if (content.includes('href="index.html"') || content.includes('href="../index.html"')) {
        content = content.replace(/href="(index\.html|\.\.\/index\.html)"/g, 'href="/"');
        changed = true;
    }

    // 3. Remove .html from internal links
    const regex = /href="([^"]+)\.html"/g;
    if (regex.test(content)) {
        content = content.replace(regex, 'href="$1"');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Processed: ${filePath}`);
    }
}

// Process root HTML files
fs.readdirSync(baseDir).forEach(file => {
    if (file.endsWith('.html')) {
        processHtmlFile(path.join(baseDir, file));
    }
});

// Process tools
if (fs.existsSync(toolsDir)) {
    fs.readdirSync(toolsDir).forEach(file => {
        if (file.endsWith('.html')) {
            processHtmlFile(path.join(toolsDir, file));
        }
    });
}

// Process folder
if (fs.existsSync(folderDir)) {
    fs.readdirSync(folderDir).forEach(file => {
        if (file.endsWith('.html')) {
            processHtmlFile(path.join(folderDir, file));
        }
    });
}

// Process ai-tools
if (fs.existsSync(aiToolsDir)) {
    fs.readdirSync(aiToolsDir).forEach(file => {
        if (file.endsWith('.html')) {
            processHtmlFile(path.join(aiToolsDir, file));
        }
    });
}

// Fix missing ALT tags in JS files
function fixJsFiles() {
    // 1. survey-hub.js
    const surveyHubPath = path.join(baseDir, 'survey-hub.js');
    if (fs.existsSync(surveyHubPath)) {
        let content = fs.readFileSync(surveyHubPath, 'utf8');
        content = content.replace(/<img src="\${url}" class="preview-img" loading="lazy">/g, '<img src="${url}" class="preview-img" loading="lazy" alt="Survey option">');
        content = content.replace(/<img src="\${url}" loading="lazy">/g, '<img src="${url}" loading="lazy" alt="Survey option">');
        content = content.replace(/<img src="\${ans}" class="preview-img" loading="lazy">/g, '<img src="${ans}" class="preview-img" loading="lazy" alt="Response image">');
        fs.writeFileSync(surveyHubPath, content, 'utf8');
        console.log('Fixed survey-hub.js images');
    }

    // 2. main.js
    const mainJsPath = path.join(baseDir, 'main.js');
    if (fs.existsSync(mainJsPath)) {
        let content = fs.readFileSync(mainJsPath, 'utf8');
        content = content.replace(/<img src="\${imgData}" loading="lazy">/g, '<img src="${imgData}" loading="lazy" alt="PDF Page Preview">');
        content = content.replace(/<img id="originalPreview" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px;" \/>/g, '<img id="originalPreview" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px;" alt="Original image preview" />');
        content = content.replace(/<img id="compressedPreview" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px; display: none;" \/>/g, '<img id="compressedPreview" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px; display: none;" alt="Compressed image preview" />');
        content = content.replace(/<img id="imageInfoPreview" style="max-width: 100%; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" \/>/g, '<img id="imageInfoPreview" style="max-width: 100%; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" alt="Image info preview" />');
        fs.writeFileSync(mainJsPath, content, 'utf8');
        console.log('Fixed main.js images');
    }
}

fixJsFiles();
console.log('SEO fixes completed!');
