const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '..', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

const splitIndex = mainJs.indexOf('// ===== AUTO-GENERATED PDF TOOLS LOGIC =====');
if (splitIndex !== -1) {
    mainJs = mainJs.substring(0, splitIndex);
}

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

let mainJsAppend = '\n// ===== AUTO-GENERATED PDF TOOLS LOGIC =====\n';

for (const tool of tools) {
    const fnName = 'load' + tool.id.charAt(0).toUpperCase() + tool.id.slice(1);

    mainJsAppend += `
function ${fnName}() {
    console.log('[PDF] Loading ${tool.name} tool');
    
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" onclick="document.getElementById('${tool.id}FileInput').click()">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">${tool.icon}</div>
                    <div class="pdf-upload-text">
                        <h3>Select File(s)</h3>
                        <p>Upload files to ${tool.name.toLowerCase()}</p>
                    </div>
                </div>
                <input type="file" id="${tool.id}FileInput" style="display: none;">
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
}

fs.writeFileSync(mainJsPath, mainJs + mainJsAppend);
console.log('Fixed main.js successfully');
