const fs = require('fs');
const path = require('path');

// Configuration
const VERSION_FILE = './version.json';
const TARGET_DIRS = ['./', './folder', './tools'];
const EXCLUDED_FILES = ['cache-buster.js', 'service-worker.js'];

// Load the version
let version = '1.0.0';
try {
    const versionData = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
    version = versionData.version;
    console.log(`🚀 Starting Cache-Buster for Version: ${version}`);
} catch (error) {
    console.error('❌ Failed to load version.json. Make sure it exists in the root.');
    process.exit(1);
}

// Helper to update URLs in attributes
function updateUrl(content, tag, attribute) {
    // Regex explanation:
    // (tag\s+[^>]*?attribute\s*=\s*["'])([^"']*)(["'])
    // Group 1: tag and attribute name up to the opening quote
    // Group 2: the URL
    // Group 3: the closing quote
    const regex = new RegExp(`(<${tag}\\s+[^>]*?${attribute}\\s*=\\s*["'])([^"']*)(["'])`, 'gi');
    
    return content.replace(regex, (match, prefix, url, suffix) => {
        // Skip external URLs
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) {
            return match;
        }

        // Clean existing version parameter
        const baseUrl = url.split('?')[0];
        const newUrl = `${baseUrl}?v=${version}`;
        
        return `${prefix}${newUrl}${suffix}`;
    });
}

function updateVersionBadge(content) {
    // Matches stuff like: <div class="version-badge">Ver 16.5</div>
    // or <span class="version-text">16.5</span>
    const badgeRegex = /(<(?:div|span|p|a|h\d)\s+[^>]*?class\s*=\s*["'][^"']*(?:version-badge|version-text)[^"']*["'][^>]*>)([^<]*)(<\/(?:div|span|p|a|h\d)>)/gi;
    return content.replace(badgeRegex, (match, prefix, oldText, suffix) => {
        const isVerPrefix = oldText.toLowerCase().includes('ver');
        const newText = isVerPrefix ? `Ver ${version}` : version;
        return `${prefix}${newText}${suffix}`;
    });
}

// Process a single file
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Apply cache busting for CSS, JS, and Images
        content = updateUrl(content, 'link', 'href');
        content = updateUrl(content, 'script', 'src');
        content = updateUrl(content, 'img', 'src');
        
        // Update version displays
        content = updateVersionBadge(content);

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filePath}`);
        } else {
            // console.log(`⏩ No changes: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

// Recursive directory scan
function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file).replace(/\\/g, '/');
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (file !== '.git' && file !== 'node_modules') {
                scanDirectory(fullPath);
            }
        } else if (file.endsWith('.html')) {
            if (!EXCLUDED_FILES.includes(file)) {
                processFile(fullPath);
            }
        }
    });
}

// Run the process
console.log('--- Scanning project files ---');
TARGET_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
        scanDirectory(dir);
    }
});
console.log('--- Cache-Busting Complete! ---');
