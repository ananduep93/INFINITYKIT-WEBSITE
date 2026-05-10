const fs = require('fs');
const path = require('path');

const tools = [
    'jpgtopdf', 'pngtopdf', 'wordtopdf', 'ppttopdf', 'exceltopdf', 'htmltopdf', 'texttopdf',
    'pdftojpg', 'pdftopng', 'pdftoword', 'pdftoppt', 'pdftoexcel', 'pdftohtml', 'pdftotext',
    'mergepdf', 'splitpdf', 'compresspdf', 'unlockpdf', 'protectpdf', 'rotatepdf', 'addwatermark', 'removepages', 'reorderpages', 'addpagenumbers'
];

const toolsDir = path.join(__dirname, '..', 'tools');

const libraries = \`
    <!-- PDF & Conversion Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
\`;

tools.forEach(tool => {
    const filePath = path.join(toolsDir, \`\${tool}.html\`);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (!content.includes('pdf.min.js')) {
            // Inject before the first script tag at the bottom
            content = content.replace('<script src="../notifications.js', libraries + '\\n    <script src="../notifications.js');
            fs.writeFileSync(filePath, content);
            console.log(\`Injected libraries into \${tool}.html\`);
        }
    }
});
