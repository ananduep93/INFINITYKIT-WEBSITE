const fs = require('fs');
const path = require('path');

const tools = {
    'jpgtopdf': {
        name: 'JPG to PDF',
        icon: '🖼️',
        description: 'Convert JPG images to PDF online.',
        howToUse: [
            'Upload your JPG images by clicking the upload area.',
            'Click the "Convert to PDF" button.',
            'Download your converted PDF file instantly.'
        ],
        features: [
            'Fast and secure conversion.',
            'Completely private - your files never leave your browser.',
            'Maintain high image quality.'
        ],
        example: 'Convert a batch of vacation photos into a single PDF document for easy sharing.',
        faq: [
            { q: 'Is it free?', a: 'Yes, all our tools are 100% free.' },
            { q: 'Are my files safe?', a: 'Yes, the conversion happens entirely in your browser. Your files are not uploaded to any server.' }
        ]
    },
    'pngtopdf': {
        name: 'PNG to PDF',
        icon: '🖼️',
        description: 'Convert PNG images to PDF online.',
        howToUse: [
            'Upload your PNG images.',
            'Click the "Convert to PDF" button.',
            'Download your PDF file.'
        ],
        features: [
            'High-quality PDF output.',
            'Secure browser-based conversion.',
            'Support for transparent PNGs.'
        ],
        example: 'Turn a logo or an infographic into a professional PDF document.',
        faq: [
            { q: 'Can I convert multiple images?', a: 'Yes, you can upload multiple PNGs to create a multi-page PDF.' }
        ]
    },
    'wordtopdf': {
        name: 'Word to PDF',
        icon: '📝',
        description: 'Convert Word documents (.docx) to PDF.',
        howToUse: [
            'Upload your .docx file.',
            'Wait for the conversion to finish.',
            'Download the resulting PDF.'
        ],
        features: [
            'Accurate text extraction.',
            'Privacy-focused conversion.',
            'No software installation required.'
        ],
        example: 'Convert a resume or a report from Word to PDF for better compatibility.',
        faq: [
            { q: 'Does it support .doc format?', a: 'Currently, we support .docx files.' }
        ]
    },
    'ppttopdf': {
        name: 'PowerPoint to PDF',
        icon: '📊',
        description: 'Convert PowerPoint presentations to PDF.',
        howToUse: [
            'Upload your .pptx file.',
            'The tool will process your slides.',
            'Download the PDF presentation.'
        ],
        features: [
            'Preserve slide layout.',
            'Quick conversion process.',
            'Ideal for sharing presentations.'
        ],
        example: 'Convert a lecture presentation into a PDF for students to view easily.',
        faq: [
            { q: 'Will my animations be preserved?', a: 'PDFs are static, so animations and transitions will not be preserved.' }
        ]
    },
    'exceltopdf': {
        name: 'Excel to PDF',
        icon: '📈',
        description: 'Convert Excel spreadsheets to PDF.',
        howToUse: [
            'Upload your .xlsx file.',
            'Select the sheets you want to convert.',
            'Download the PDF document.'
        ],
        features: [
            'Maintain cell formatting.',
            'Convert large spreadsheets efficiently.',
            'Secure local processing.'
        ],
        example: 'Convert a financial report or a data table into a PDF for printing.',
        faq: [
            { q: 'Can I convert specific sheets?', a: 'The tool currently converts the active sheet of your Excel file.' }
        ]
    },
    'htmltopdf': {
        name: 'HTML to PDF',
        icon: '🌐',
        description: 'Convert HTML pages or files to PDF.',
        howToUse: [
            'Upload an HTML file.',
            'Click "Convert to PDF".',
            'Download the PDF output.'
        ],
        features: [
            'Accurate rendering of web content.',
            'Support for CSS styling.',
            'Fast and reliable.'
        ],
        example: 'Save a webpage or an HTML report as a PDF for offline viewing.',
        faq: [
            { q: 'Does it work with external CSS?', a: 'It works best with inline styles or styles provided within the HTML file.' }
        ]
    },
    'texttopdf': {
        name: 'Text to PDF',
        icon: '✍️',
        description: 'Convert plain text files to PDF.',
        howToUse: [
            'Upload your .txt file.',
            'The tool will instantly generate a PDF.',
            'Download your PDF document.'
        ],
        features: [
            'Simple and lightweight.',
            'Perfect for quick notes.',
            'No data ever leaves your device.'
        ],
        example: 'Convert a raw log file or a simple note into a clean PDF document.',
        faq: [
            { q: 'Can I change the font?', a: 'The tool uses a standard font for maximum compatibility.' }
        ]
    },
    'pdftojpg': {
        name: 'PDF to JPG',
        icon: '📸',
        description: 'Extract pages from a PDF as JPG images.',
        howToUse: [
            'Upload your PDF file.',
            'Select the pages you want to extract.',
            'Download the JPG images.'
        ],
        features: [
            'High-resolution image extraction.',
            'Extract specific pages or the whole document.',
            'Secure and private.'
        ],
        example: 'Convert a PDF flyer into a JPG image for social media posting.',
        faq: [
            { q: 'What is the image quality?', a: 'We use high-resolution rendering to ensure your images look sharp.' }
        ]
    },
    'pdftopng': {
        name: 'PDF to PNG',
        icon: '📸',
        description: 'Convert PDF pages to PNG images.',
        howToUse: [
            'Upload your PDF.',
            'Process the pages.',
            'Download PNG files.'
        ],
        features: [
            'Lossless image quality.',
            'Support for transparent backgrounds.',
            'Fast browser-based extraction.'
        ],
        example: 'Extract a chart or a diagram from a PDF as a high-quality PNG image.',
        faq: [
            { q: 'Can I download all pages at once?', a: 'Currently, you can download pages individually or as a batch.' }
        ]
    },
    'pdftoword': {
        name: 'PDF to Word',
        icon: '📝',
        description: 'Convert PDF files to editable Word documents.',
        howToUse: [
            'Upload your PDF.',
            'The tool will extract the text.',
            'Download the .docx file.'
        ],
        features: [
            'Accurate text and layout preservation.',
            'Edit your PDF content easily.',
            'No registration required.'
        ],
        example: 'Convert a PDF contract into a Word document to make edits.',
        faq: [
            { q: 'Will the formatting be perfect?', a: 'Complex layouts might require some minor adjustments in Word.' }
        ]
    },
    'pdftoppt': {
        name: 'PDF to PowerPoint',
        icon: '📊',
        description: 'Convert PDF to PowerPoint presentations.',
        howToUse: [
            'Upload your PDF.',
            'The tool will convert each page to a slide.',
            'Download the .pptx file.'
        ],
        features: [
            'Quickly create presentations from PDFs.',
            'Easy to edit slides.',
            'Private and secure.'
        ],
        example: 'Convert a PDF report into a PowerPoint deck for a meeting.',
        faq: [
            { q: 'Can I edit the text in PPT?', a: 'Yes, we attempt to extract text as editable blocks where possible.' }
        ]
    },
    'pdftoexcel': {
        name: 'PDF to Excel',
        icon: '📈',
        description: 'Convert PDF tables to Excel spreadsheets.',
        howToUse: [
            'Upload a PDF containing tables.',
            'The tool will detect and extract the data.',
            'Download the .xlsx file.'
        ],
        features: [
            'Automated table detection.',
            'Save time on manual data entry.',
            'Secure local processing.'
        ],
        example: 'Convert a PDF bank statement into an Excel sheet for budget tracking.',
        faq: [
            { q: 'Does it work with scanned PDFs?', a: 'It works best with "native" PDFs that contain selectable text.' }
        ]
    },
    'pdftohtml': {
        name: 'PDF to HTML',
        icon: '🌐',
        description: 'Convert PDF documents to HTML webpages.',
        howToUse: [
            'Upload your PDF file.',
            'The tool will generate HTML code.',
            'Download or copy the HTML.'
        ],
        features: [
            'Convert PDFs for web viewing.',
            'Responsive HTML output.',
            'Fast and easy to use.'
        ],
        example: 'Convert a PDF brochure into a webpage for your site.',
        faq: [
            { q: 'Will it include images?', a: 'Yes, images are embedded into the HTML output.' }
        ]
    },
    'pdftotext': {
        name: 'PDF to Text',
        icon: '✍️',
        description: 'Extract plain text from a PDF file.',
        howToUse: [
            'Upload your PDF.',
            'The tool will extract all text.',
            'Download the .txt file.'
        ],
        features: [
            'Simple and efficient extraction.',
            'Perfect for data analysis.',
            'Works entirely offline.'
        ],
        example: 'Extract the text from a long PDF book for easier searching.',
        faq: [
            { q: 'Does it support multiple languages?', a: 'Yes, it supports all standard text encodings.' }
        ]
    },
    'mergepdf': {
        name: 'Merge PDF',
        icon: '📎',
        description: 'Combine multiple PDF files into one.',
        howToUse: [
            'Upload the PDFs you want to merge.',
            'Reorder them if necessary.',
            'Click "Merge PDF" and download.'
        ],
        features: [
            'Combine any number of files.',
            'Easy drag-and-drop ordering.',
            'Fast processing.'
        ],
        example: 'Combine several monthly reports into a single annual document.',
        faq: [
            { q: 'Is there a file size limit?', a: 'There is no hard limit, but very large files may depend on your browser memory.' }
        ]
    },
    'splitpdf': {
        name: 'Split PDF',
        icon: '✂️',
        description: 'Split a PDF into separate files.',
        howToUse: [
            'Upload the PDF you want to split.',
            'Select the pages or ranges to extract.',
            'Download the new PDFs.'
        ],
        features: [
            'Extract specific pages.',
            'Split by range.',
            'Maintain original quality.'
        ],
        example: 'Extract only the first chapter from a long PDF ebook.',
        faq: [
            { q: 'Can I split by every page?', a: 'Yes, you can choose to save each page as a separate PDF.' }
        ]
    },
    'compresspdf': {
        name: 'Compress PDF',
        icon: '🗜️',
        description: 'Reduce the file size of your PDF.',
        howToUse: [
            'Upload your large PDF.',
            'The tool will optimize the file size.',
            'Download the compressed PDF.'
        ],
        features: [
            'Reduce size without losing quality.',
            'Ideal for email attachments.',
            'Secure browser-based compression.'
        ],
        example: 'Shrink a large PDF manual so it can be sent via email.',
        faq: [
            { q: 'How much will the size be reduced?', a: 'Reduction depends on the content (e.g., images are compressed more than text).' }
        ]
    },
    'unlockpdf': {
        name: 'Unlock PDF',
        icon: '🔓',
        description: 'Remove passwords from protected PDFs.',
        howToUse: [
            'Upload the password-protected PDF.',
            'Enter the password (if known) to remove it.',
            'Download the unlocked PDF.'
        ],
        features: [
            'Remove restrictions instantly.',
            'Works with standard PDF encryption.',
            'Private and secure.'
        ],
        example: 'Remove a password from a document you received so you don\'t have to enter it every time.',
        faq: [
            { q: 'Can it crack passwords?', a: 'No, this tool is for removing passwords when you already know them.' }
        ]
    },
    'protectpdf': {
        name: 'Protect PDF',
        icon: '🔒',
        description: 'Add a password to your PDF document.',
        howToUse: [
            'Upload your PDF.',
            'Enter a strong password.',
            'Download your protected PDF.'
        ],
        features: [
            'Secure encryption.',
            'Protect sensitive information.',
            'Easy to use.'
        ],
        example: 'Add a password to a financial statement before sending it via email.',
        faq: [
            { q: 'What kind of encryption is used?', a: 'We use industry-standard PDF encryption.' }
        ]
    },
    'rotatepdf': {
        name: 'Rotate PDF',
        icon: '🔄',
        description: 'Rotate PDF pages permanently.',
        howToUse: [
            'Upload your PDF.',
            'Rotate individual pages or the whole doc.',
            'Download the rotated PDF.'
        ],
        features: [
            'Rotate 90, 180, or 270 degrees.',
            'Visual preview of rotations.',
            'Fast and easy.'
        ],
        example: 'Fix a PDF that was scanned upside down.',
        faq: [
            { q: 'Can I rotate only one page?', a: 'Yes, you can select specific pages to rotate.' }
        ]
    },
    'addwatermark': {
        name: 'Add Watermark',
        icon: '💧',
        description: 'Add text or image watermarks to a PDF.',
        howToUse: [
            'Upload your PDF.',
            'Enter text or upload a watermark image.',
            'Adjust position and download.'
        ],
        features: [
            'Customizable watermarks.',
            'Protect your intellectual property.',
            'Professional output.'
        ],
        example: 'Add a "DRAFT" or "CONFIDENTIAL" watermark to your document.',
        faq: [
            { q: 'Can I use an image as a watermark?', a: 'Yes, you can upload a logo or any image to use as a watermark.' }
        ]
    },
    'removepages': {
        name: 'Remove Pages',
        icon: '🗑️',
        description: 'Delete specific pages from a PDF.',
        howToUse: [
            'Upload your PDF.',
            'Select the pages you want to delete.',
            'Download the modified PDF.'
        ],
        features: [
            'Easy page selection.',
            'Quickly shrink your PDF.',
            'Secure local processing.'
        ],
        example: 'Remove the cover page or blank pages from a PDF document.',
        faq: [
            { q: 'Can I undo a removal?', a: 'You can re-upload the original file if you make a mistake.' }
        ]
    },
    'reorderpages': {
        name: 'Reorder Pages',
        icon: '📑',
        description: 'Rearrange the pages of your PDF.',
        howToUse: [
            'Upload your PDF.',
            'Drag and drop pages to reorder them.',
            'Download the new PDF.'
        ],
        features: [
            'Visual drag-and-drop interface.',
            'Total control over page order.',
            'Fast and secure.'
        ],
        example: 'Rearrange the chapters of a PDF book or the slides of a presentation.',
        faq: [
            { q: 'Is there a limit on the number of pages?', a: 'No, you can reorder documents of any length.' }
        ]
    },
    'addpagenumbers': {
        name: 'Add Page Numbers',
        icon: '🔢',
        description: 'Insert page numbers into a PDF.',
        howToUse: [
            'Upload your PDF document.',
            'Select position and font style.',
            'Download the numbered PDF.'
        ],
        features: [
            'Automatic page numbering.',
            'Customizable placement.',
            'Professional look.'
        ],
        example: 'Add page numbers to a long report for easier navigation.',
        faq: [
            { q: 'Can I start numbering from a specific page?', a: 'Yes, you can set the starting page and number.' }
        ]
    }
};

const toolsDir = path.join(__dirname, '..', 'tools');

Object.keys(tools).forEach(id => {
    const tool = tools[id];
    const filePath = path.join(toolsDir, `${id}.html`);
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Update Title and Meta
        content = content.replace(/<title>.*?<\/title>/, `<title>${tool.name} - Free Online PDF Tools | Infinity Kit</title>`);
        content = content.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${tool.description} Fast, secure, and private browser-based PDF utilities.">`);
        
        // Update Introduction
        const introRegex = /<section class="tool-info-section">[\s\S]*?<\/section>/;
        const newIntro = `
        <section class="tool-info-section">
            <div class="info-card">
                <div class="card-icon">📖</div>
                <h2>Introduction</h2>
                <p>${tool.description} Our tool allows you to process your documents directly in your browser, ensuring that your sensitive data never leaves your computer. It's fast, free, and easy to use.</p>
            </div>
            
            <div class="info-card">
                <div class="card-icon">🛠️</div>
                <h2>How to Use</h2>
                <ol>
                    ${tool.howToUse.map(step => `<li>${step}</li>`).join('\n                    ')}
                </ol>
            </div>

            <div class="info-card">
                <div class="card-icon">✨</div>
                <h2>Features</h2>
                <ul>
                    ${tool.features.map(feat => `<li><strong>${feat.split(':')[0]}:</strong> ${feat.split(':')[1] || ''}</li>`).join('\n                    ')}
                </ul>
            </div>

            <div class="info-card">
                <div class="card-icon">💡</div>
                <h2>Example</h2>
                <p>${tool.example}</p>
            </div>

            <div class="info-card">
                <div class="card-icon">🚀</div>
                <h2>Why Use This Tool?</h2>
                <p>Infinity Kit's ${tool.name} tool is designed for speed and privacy. Unlike other online converters, we don't store your files on our servers. Everything happens locally in your browser, giving you peace of mind and instant results.</p>
            </div>

            <div class="info-card">
                <div class="card-icon">❓</div>
                <h2>FAQ</h2>
                <div class="faq-container">
                    ${tool.faq.map(item => `
                    <div class="faq-item">
                        <div class="faq-question">Q: ${item.q} <span class="faq-arrow">▼</span></div>
                        <div class="faq-answer">${item.a}</div>
                    </div>`).join('')}
                </div>
            </div>
        </section>`;
        
        content = content.replace(introRegex, newIntro);
        
        fs.writeFileSync(filePath, content);
        console.log(`Updated SEO content for ${id}`);
    }
});
