const fs = require('fs');
const path = require('path');

// Configuration
const VERSION_FILE = './version.json';
const SW_FILE = './service-worker.js';
const HEADERS_FILE = './_headers'; // For Cloudflare/Netlify/Vercel
const TARGET_DIRS = ['./', './folder', './tools'];
const EXCLUDED_FILES = ['cache-buster.js', 'service-worker.js', 'firebase-api-keys.js'];

// Generate a dynamic version based on current timestamp
// Format: 16.7.[YYYYMMDD].[HHMM]
const now = new Date();
const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
const timeStr = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
const baseVersion = "16.7"; // Major.Minor
const newVersion = `${baseVersion}.${dateStr}.${timeStr}`;

console.log(`🚀 Cache-Buster: Generating New Version: ${newVersion}`);

// 1. Update version.json
try {
    fs.writeFileSync(VERSION_FILE, JSON.stringify({ version: newVersion }, null, 2), 'utf8');
    console.log(`✅ Updated ${VERSION_FILE}`);
} catch (error) {
    console.error(`❌ Failed to update ${VERSION_FILE}:`, error.message);
}

// 2. Update service-worker.js (CACHE_NAME and CORE_ASSETS)
try {
    if (fs.existsSync(SW_FILE)) {
        let swContent = fs.readFileSync(SW_FILE, 'utf8');
        
        // Update CACHE_NAME
        const swRegex = /const CACHE_NAME = 'infinity-kit-v[^']+';/;
        const newSwLine = `const CACHE_NAME = 'infinity-kit-v${newVersion}';`;
        if (swRegex.test(swContent)) {
            swContent = swContent.replace(swRegex, newSwLine);
        }

        // Update CORE_ASSETS automatically
        const coreFiles = [
            './',
            './index.html',
            './manifest.json',
            './icon-192.png',
            './icon-512.png'
        ];

        // Find all .js and .css files in root
        const rootFiles = fs.readdirSync('./');
        rootFiles.forEach(file => {
            if ((file.endsWith('.js') || file.endsWith('.css')) && !EXCLUDED_FILES.includes(file)) {
                coreFiles.push(`./${file}`);
            }
        });

        const assetsRegex = /const CORE_ASSETS = \[[\s\S]*?\];/;
        const newAssetsLine = `const CORE_ASSETS = [\n    '${coreFiles.join("',\n    '")}'\n];`;
        
        if (assetsRegex.test(swContent)) {
            swContent = swContent.replace(assetsRegex, newAssetsLine);
            fs.writeFileSync(SW_FILE, swContent, 'utf8');
            console.log(`✅ Updated ${SW_FILE} with new cache name and ${coreFiles.length} core assets`);
        } else {
            console.warn(`⚠️ Could not find variables in ${SW_FILE}`);
        }
    }
} catch (error) {
    console.error(`❌ Failed to update ${SW_FILE}:`, error.message);
}

// 3. Generate _headers file (for hosts that support it)
try {
    const headersContent = `/*
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=31536000, immutable

/*.jpg
  Cache-Control: public, max-age=31536000, immutable

/*.svg
  Cache-Control: public, max-age=31536000, immutable
`;
    fs.writeFileSync(HEADERS_FILE, headersContent, 'utf8');
    console.log(`✅ Generated ${HEADERS_FILE}`);
} catch (error) {
    console.error(`❌ Failed to generate ${HEADERS_FILE}:`, error.message);
}

// Helper to update URLs in attributes
function updateUrl(content, tag, attribute) {
    const regex = new RegExp(`(<${tag}\\s+[^>]*?${attribute}\\s*=\\s*["'])([^"']*)(["'])`, 'gi');
    
    return content.replace(regex, (match, prefix, url, suffix) => {
        // Skip external URLs, anchors, and empty URLs
        if (!url || url.startsWith('http') || url.startsWith('//') || url.startsWith('data:') || url.startsWith('#')) {
            return match;
        }

        // Clean existing version parameter
        const baseUrl = url.split('?')[0];
        const newUrl = `${baseUrl}?v=${newVersion}`;
        
        return `${prefix}${newUrl}${suffix}`;
    });
}

function updateVersionBadge(content) {
    const badgeRegex = /(<(?:div|span|p|a|h\d)\s+[^>]*?class\s*=\s*["'][^"']*(?:version-badge|version-text)[^"']*["'][^>]*>)([^<]*)(<\/(?:div|span|p|a|h\d)>)/gi;
    return content.replace(badgeRegex, (match, prefix, oldText, suffix) => {
        const isVerPrefix = oldText.toLowerCase().includes('ver');
        const newText = isVerPrefix ? `Ver ${newVersion}` : newVersion;
        return `${prefix}${newText}${suffix}`;
    });
}

function addCacheMetaTags(content) {
    if (content.includes('http-equiv="Cache-Control"')) {
        return content;
    }

    const metaTags = `
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">`;

    if (content.includes('<head>')) {
        return content.replace('<head>', `<head>${metaTags}`);
    }
    return content;
}

// Process a single file
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        content = updateUrl(content, 'link', 'href');
        content = updateUrl(content, 'script', 'src');
        content = updateUrl(content, 'img', 'src');
        content = updateVersionBadge(content);
        content = addCacheMetaTags(content);

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

// Recursive directory scan
function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
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
    scanDirectory(dir);
});
console.log('--- Cache-Busting Complete! ---');


