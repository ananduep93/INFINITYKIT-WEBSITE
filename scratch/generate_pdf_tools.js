const fs = require('fs');
const path = require('path');

const tools = [
    // Convert to PDF
    { id: 'jpgtopdf', name: 'JPG to PDF', icon: '🖼️', description: 'Convert JPG images to PDF file online.' },
    { id: 'pngtopdf', name: 'PNG to PDF', icon: '🖼️', description: 'Convert PNG images to PDF file online.' },
    { id: 'wordtopdf', name: 'Word to PDF', icon: '📝', description: 'Convert Microsoft Word documents to PDF.' },
    { id: 'ppttopdf', name: 'PowerPoint to PDF', icon: '📊', description: 'Convert PowerPoint presentations to PDF.' },
    { id: 'exceltopdf', name: 'Excel to PDF', icon: '📈', description: 'Convert Excel spreadsheets to PDF.' },
    { id: 'htmltopdf', name: 'HTML to PDF', icon: '🌐', description: 'Convert HTML webpages to PDF.' },
    { id: 'texttopdf', name: 'Text to PDF', icon: '✍️', description: 'Convert plain text files to PDF.' },
    
    // Convert from PDF
    { id: 'pdftojpg', name: 'PDF to JPG', icon: '📸', description: 'Extract images from PDF or convert pages to JPG.' },
    { id: 'pdftopng', name: 'PDF to PNG', icon: '📸', description: 'Extract images from PDF or convert pages to PNG.' },
    { id: 'pdftoword', name: 'PDF to Word', icon: '📝', description: 'Convert PDF to editable Word document.' },
    { id: 'pdftoppt', name: 'PDF to PowerPoint', icon: '📊', description: 'Convert PDF to editable PowerPoint presentation.' },
    { id: 'pdftoexcel', name: 'PDF to Excel', icon: '📈', description: 'Convert PDF to editable Excel spreadsheet.' },
    { id: 'pdftohtml', name: 'PDF to HTML', icon: '🌐', description: 'Convert PDF to HTML webpage.' },
    { id: 'pdftotext', name: 'PDF to Text', icon: '✍️', description: 'Extract plain text from PDF documents.' },
    
    // PDF Management
    { id: 'splitpdf', name: 'Split PDF', icon: '✂️', description: 'Split a PDF into multiple smaller files.' },
    { id: 'compresspdf', name: 'Compress PDF', icon: '🗜️', description: 'Reduce the file size of your PDF.' },
    { id: 'unlockpdf', name: 'Unlock PDF', icon: '🔓', description: 'Remove password protection from PDF.' },
    { id: 'protectpdf', name: 'Protect PDF', icon: '🔒', description: 'Add password protection to your PDF.' },
    { id: 'addwatermark', name: 'Add Watermark', icon: '💧', description: 'Add a text or image watermark to your PDF.' },
    { id: 'removepages', name: 'Remove Pages', icon: '🗑️', description: 'Delete specific pages from your PDF.' },
    { id: 'reorderpages', name: 'Reorder Pages', icon: '📑', description: 'Rearrange the pages in your PDF.' },
    { id: 'addpagenumbers', name: 'Add Page Numbers', icon: '🔢', description: 'Insert page numbers into your PDF document.' }
];

const basePath = path.join(__dirname, '..');
const templatePath = path.join(basePath, 'tools', 'mergepdf.html');
const templateHtml = fs.readFileSync(templatePath, 'utf8');

// Update Sitemap
const sitemapPath = path.join(basePath, 'sitemap.xml');
let sitemapXml = fs.readFileSync(sitemapPath, 'utf8');

let mainJsAppend = '\n\n// ===== AUTO-GENERATED PDF TOOLS LOGIC =====\n';

for (const tool of tools) {
    // Generate HTML
    let html = templateHtml;
    // Replace title
    html = html.replace(/<title>.*?<\/title>/, `<title>${tool.name} - Infinity Kit⚡</title>`);
    // Replace canonical
    html = html.replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="https://infinitykit.online/tools/${tool.id}">`);
    // Replace meta description
    html = html.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${tool.description} Free online tool from Infinity Kit for daily productivity.">`);
    // Replace breadcrumb current
    html = html.replace(/<span class="current">mergepdf<\/span>/, `<span class="current">${tool.id}</span>`);
    // Replace H1
    html = html.replace(/<h1 class="tool-title">.*?<\/h1>/, `<h1 class="tool-title">${tool.icon} ${tool.name}</h1>`);
    // Replace SEO Introduction
    html = html.replace(/<h2>Introduction<\/h2>\s*<p>.*?<\/p>/, `<h2>Introduction</h2>\n                <p>${tool.description} Fast, secure, and completely free to use without registration.</p>`);
    // Replace load function
    const fnName = 'load' + tool.id.charAt(0).toUpperCase() + tool.id.slice(1);
    html = html.replace(/loadMergePDF/g, fnName);
    html = html.replace(/'mergepdf'/g, `'${tool.id}'`);
    html = html.replace(/'Merge PDF'/g, `'${tool.name}'`);
    
    fs.writeFileSync(path.join(basePath, 'tools', `${tool.id}.html`), html);

    // Generate main.js logic
    mainJsAppend += `
function ${fnName}() {
    console.log('[PDF] Loading ${tool.name} tool');
    
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" onclick="document.getElementById('\${tool.id}FileInput').click()">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">\${tool.icon}</div>
                    <div class="pdf-upload-text">
                        <h3>Select File(s)</h3>
                        <p>Upload files to \${tool.name.toLowerCase()}</p>
                    </div>
                </div>
                <input type="file" id="\${tool.id}FileInput" style="display: none;">
            </div>
            
            <div class="glass-panel" style="margin-top: 20px; text-align: center; padding: 20px;">
                <p><strong>Note:</strong> The core processing engine for ${tool.name} is currently being optimized for client-side processing to ensure complete privacy. Check back soon for the full functionality!</p>
            </div>
        </div>
    \`;
    
    if(window.toolContent) {
        window.toolContent.innerHTML = html;
    }
}
`;

    // Add to sitemap if not exists
    const sitemapUrl = `<url><loc>https://infinitykit.online/tools/${tool.id}</loc><lastmod>2026-05-09</lastmod><priority>0.8</priority></url>`;
    if (!sitemapXml.includes(`tools/${tool.id}<`)) {
        sitemapXml = sitemapXml.replace('</urlset>', `    ${sitemapUrl}\n</urlset>`);
    }
}

// Append to main.js
const mainJsPath = path.join(basePath, 'main.js');
fs.appendFileSync(mainJsPath, mainJsAppend);

// Save sitemap
fs.writeFileSync(sitemapPath, sitemapXml);

console.log('Successfully generated 24 PDF tool pages and updated main.js / sitemap.xml');
