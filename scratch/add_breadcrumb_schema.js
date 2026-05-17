const fs = require('fs');
const path = require('path');

const toolsDir = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\tools';
const aiToolsDir = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\ai-tools';

function processFile(filePath, isAiTool = false) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has breadcrumb schema
    if (content.includes('"@type": "BreadcrumbList"')) {
        console.log(`Skipping ${path.basename(filePath)} (already has breadcrumb schema)`);
        return;
    }

    // Extract Breadcrumb Info
    // Example: <a href="../folder/daily-essentials.html">Daily Essentials</a>
    const folderMatch = content.match(/<a href="([^"]+)folder\/([^"]+)\.html">([^<]+)<\/a>/);
    const currentMatch = content.match(/<span class="current">([^<]+)<\/span>/);

    if (!folderMatch || !currentMatch) {
        console.log(`Breadcrumb structure not found in ${path.basename(filePath)}`);
        return;
    }

    const folderUrl = folderMatch[2]; // e.g., daily-essentials
    const folderName = folderMatch[3].trim();
    const currentName = currentMatch[1].trim();

    const prefix = isAiTool ? '../' : '../'; // Both are at the same depth relative to root? 
    // Wait, tools are in /tools/ and ai-tools are in /ai-tools/. So both need '../' to go to root.

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://infinitykit.online/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": folderName,
                "item": `https://infinitykit.online/folder/${folderUrl}.html`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": currentName,
                "item": `https://infinitykit.online/${isAiTool ? 'ai-tools' : 'tools'}/${path.basename(filePath)}`
            }
        ]
    };

    const schemaHTML = `
    <!-- Breadcrumb Schema -->
    <script type="application/ld+json">
    ${JSON.stringify(breadcrumbSchema, null, 2)}
    </script>
`;

    // Insert before </head>
    if (content.includes('</head>')) {
        content = content.replace('</head>', `${schemaHTML}</head>`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${path.basename(filePath)} with Breadcrumb Schema`);
    } else {
        console.log(`Could not find </head> in ${path.basename(filePath)}`);
    }
}

// Process Tools
fs.readdir(toolsDir, (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (file.endsWith('.html')) processFile(path.join(toolsDir, file), false);
    });
});

// Process AI Tools
fs.readdir(aiToolsDir, (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (file.endsWith('.html') && file !== 'index.html') { // Skip folder index
            processFile(path.join(aiToolsDir, file), true);
        }
    });
});
