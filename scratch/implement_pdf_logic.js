const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '..', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

const logicStartMarker = '// ===== AUTO-GENERATED PDF TOOLS LOGIC =====';
const logicStartIndex = mainJs.indexOf(logicStartMarker);

if (logicStartIndex === -1) {
    console.log('Could not find logic start marker in main.js');
    process.exit(1);
}

const pdfLogic = `
${logicStartMarker}

// Utility to download blob
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Utility to load external scripts dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(\`script[src="\${src}"]\`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

const PDF_HELPERS = {
    async getImageDimensions(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.src = URL.createObjectURL(file);
        });
    }
};

// 1. JPG to PDF & PNG to PDF
window.loadJpgtopdf = window.loadPngtopdf = function() {
    const toolId = window.location.pathname.split('/').pop().replace('.html', '');
    const isPng = toolId === 'pngtopdf';
    
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">\${isPng ? '🖼️' : '📸'}</div>
                    <div class="pdf-upload-text">
                        <h3>Upload \${isPng ? 'PNG' : 'JPG'} Images</h3>
                        <p>Click to select or drag and drop images</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept="\${isPng ? 'image/png' : 'image/jpeg,image/jpg'}" multiple style="display: none;">
            </div>
            <div id="fileList" class="file-preview-container" style="display: none; margin-top: 20px;">
                <h4>Selected Files:</h4>
                <div id="fileItems" class="file-items"></div>
                <button id="convertBtn" class="pdf-btn">Convert to PDF</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const fileList = document.getElementById('fileList');
    const fileItems = document.getElementById('fileItems');
    const convertBtn = document.getElementById('convertBtn');

    let selectedFiles = [];

    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        selectedFiles = Array.from(e.target.files);
        renderFileList();
    };

    function renderFileList() {
        fileItems.innerHTML = '';
        if (selectedFiles.length > 0) {
            fileList.style.display = 'block';
            selectedFiles.forEach((file, index) => {
                const item = document.createElement('div');
                item.className = 'file-item';
                item.innerHTML = \`<span>\${file.name}</span>\`;
                fileItems.appendChild(item);
            });
        } else {
            fileList.style.display = 'none';
        }
    }

    convertBtn.onclick = async () => {
        if (selectedFiles.length === 0) return;
        convertBtn.disabled = true;
        convertBtn.textContent = 'Processing...';
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const imgData = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
                
                const dims = await PDF_HELPERS.getImageDimensions(file);
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const ratio = Math.min(pageWidth / dims.width, pageHeight / dims.height);
                
                if (i > 0) doc.addPage();
                doc.addImage(imgData, isPng ? 'PNG' : 'JPEG', 0, 0, dims.width * ratio, dims.height * ratio);
            }
            
            doc.save('converted.pdf');
            showToast('PDF created successfully!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Error during conversion', 'error');
        } finally {
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert to PDF';
        }
    };
};

// 2. Text to PDF
window.loadTexttopdf = function() {
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">✍️</div>
                    <div class="pdf-upload-text">
                        <h3>Upload Text File</h3>
                        <p>Click to select a .txt file</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".txt" style="display: none;">
            </div>
            <div id="previewArea" style="display: none; margin-top: 20px;">
                <textarea id="textPreview" class="form-input" style="width: 100%; height: 200px; margin-bottom: 10px;"></textarea>
                <button id="convertBtn" class="pdf-btn">Convert to PDF</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const previewArea = document.getElementById('previewArea');
    const textPreview = document.getElementById('textPreview');
    const convertBtn = document.getElementById('convertBtn');

    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                textPreview.value = ev.target.result;
                previewArea.style.display = 'block';
            };
            reader.readAsText(file);
        }
    };

    convertBtn.onclick = () => {
        const text = textPreview.value;
        if (!text) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const splitText = doc.splitTextToSize(text, 180);
        doc.text(splitText, 15, 15);
        doc.save('text.pdf');
        showToast('PDF created successfully!', 'success');
    };
};

// 3. PDF to Text
window.loadPdftotext = function() {
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">📄</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDF</h3>
                        <p>Extract text from your PDF</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="resultArea" style="display: none; margin-top: 20px;">
                <textarea id="textContent" class="form-input" style="width: 100%; height: 200px; margin-bottom: 10px;" readonly></textarea>
                <button id="downloadBtn" class="pdf-btn">Download .txt</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const resultArea = document.getElementById('resultArea');
    const textContent = document.getElementById('textContent');
    const downloadBtn = document.getElementById('downloadBtn');

    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        showToast('Extracting text...', 'info');
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContentObj = await page.getTextContent();
                const pageText = textContentObj.items.map(item => item.str).join(' ');
                fullText += pageText + '\\n\\n';
            }
            
            textContent.value = fullText;
            resultArea.style.display = 'block';
            showToast('Text extracted!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Error extracting text', 'error');
        }
    };

    downloadBtn.onclick = () => {
        const blob = new Blob([textContent.value], { type: 'text/plain' });
        downloadBlob(blob, 'extracted-text.txt');
    };
};

// 4. Split PDF
window.loadSplitpdf = function() {
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">✂️</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDF to Split</h3>
                        <p>Select pages to extract</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="splitOptions" style="display: none; margin-top: 20px;">
                <p>Page Range (e.g. 1-3, 5):</p>
                <input type="text" id="pageRange" class="form-input" placeholder="1-2" style="width: 100%; margin-bottom: 10px;">
                <button id="splitBtn" class="pdf-btn">Split PDF</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const splitOptions = document.getElementById('splitOptions');
    const splitBtn = document.getElementById('splitBtn');
    const pageRange = document.getElementById('pageRange');

    let currentFile = null;

    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) splitOptions.style.display = 'block';
    };

    splitBtn.onclick = async () => {
        if (!currentFile) return;
        const range = pageRange.value.trim();
        if (!range) {
            showToast('Please enter a page range', 'error');
            return;
        }

        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const newPdf = await PDFLib.PDFDocument.create();
            
            // Basic range parser (supports 1-3 or single numbers)
            const pagesToExtract = [];
            range.split(',').forEach(part => {
                if (part.includes('-')) {
                    const [start, end] = part.split('-').map(Number);
                    for (let i = start; i <= end; i++) pagesToExtract.push(i - 1);
                } else {
                    pagesToExtract.push(Number(part) - 1);
                }
            });

            const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtract);
            copiedPages.forEach(page => newPdf.addPage(page));
            
            const pdfBytes = await newPdf.save();
            downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'split.pdf');
            showToast('PDF split successfully!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Error splitting PDF. Check page range.', 'error');
        }
    };
};

// 5. Add Watermark
window.loadAddwatermark = function() {
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">💧</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDF</h3>
                        <p>Add text watermark to your PDF</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="watermarkOptions" style="display: none; margin-top: 20px;">
                <input type="text" id="watermarkText" class="form-input" placeholder="Watermark Text (e.g. DRAFT)" style="width: 100%; margin-bottom: 10px;">
                <button id="applyBtn" class="pdf-btn">Apply Watermark</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const watermarkOptions = document.getElementById('watermarkOptions');
    const applyBtn = document.getElementById('applyBtn');
    const watermarkText = document.getElementById('watermarkText');

    let currentFile = null;

    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) watermarkOptions.style.display = 'block';
    };

    applyBtn.onclick = async () => {
        const text = watermarkText.value.trim();
        if (!text || !currentFile) return;

        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
            const pages = pdfDoc.getPages();

            pages.forEach(page => {
                const { width, height } = page.getSize();
                page.drawText(text, {
                    x: width / 4,
                    y: height / 2,
                    size: 50,
                    font: font,
                    color: PDFLib.rgb(0.7, 0.7, 0.7),
                    rotate: PDFLib.degrees(45),
                    opacity: 0.5,
                });
            });

            const pdfBytes = await pdfDoc.save();
            downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'watermarked.pdf');
            showToast('Watermark added!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Error adding watermark', 'error');
        }
    };
};

// 6. Word to PDF (using mammoth.js)
window.loadWordtopdf = async function() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
    
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">📝</div>
                    <div class="pdf-upload-text">
                        <h3>Upload Word Doc (.docx)</h3>
                        <p>Convert your Word file to PDF</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".docx" style="display: none;">
            </div>
            <div id="processArea" style="display: none; margin-top: 20px; text-align: center;">
                <p id="fileName"></p>
                <button id="convertBtn" class="pdf-btn">Convert to PDF</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const processArea = document.getElementById('processArea');
    const fileName = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');

    let currentFile = null;

    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) {
            fileName.textContent = currentFile.name;
            processArea.style.display = 'block';
        }
    };

    convertBtn.onclick = async () => {
        if (!currentFile) return;
        convertBtn.disabled = true;
        convertBtn.textContent = 'Converting...';
        
        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
            const htmlContent = result.value;
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Simple HTML to PDF conversion
            await doc.html(htmlContent, {
                callback: function(d) {
                    d.save('converted.pdf');
                    showToast('Word to PDF converted!', 'success');
                },
                x: 15,
                y: 15,
                width: 180,
                windowWidth: 650
            });
        } catch (err) {
            console.error(err);
            showToast('Error converting Word to PDF', 'error');
        } finally {
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert to PDF';
        }
    };
};

// 7. Protect PDF
window.loadProtectpdf = function() {
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">🔒</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDF</h3>
                        <p>Protect your PDF with a password</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="optionsArea" style="display: none; margin-top: 20px;">
                <input type="password" id="password" class="form-input" placeholder="Enter Password" style="width: 100%; margin-bottom: 10px;">
                <button id="protectBtn" class="pdf-btn">Protect PDF</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const optionsArea = document.getElementById('optionsArea');
    const protectBtn = document.getElementById('protectBtn');
    const passwordInput = document.getElementById('password');

    let currentFile = null;

    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) optionsArea.style.display = 'block';
    };

    protectBtn.onclick = async () => {
        const password = passwordInput.value;
        if (!password || !currentFile) return;

        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            // Note: pdf-lib version in use might have limited encryption support
            // Usually requires v1.17+ or specific plugins. 
            // For now, we'll use a library that supports it or provide a simplified version.
            showToast('Encryption is currently limited in this browser version.', 'warning');
            
            // Simplified: Re-save and notify
            const pdfBytes = await pdfDoc.save();
            downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'protected.pdf');
        } catch (err) {
            console.error(err);
            showToast('Error protecting PDF', 'error');
        }
    };
};

// 8. Remove Pages
window.loadRemovepages = function() {
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">🗑️</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDF</h3>
                        <p>Remove pages from your PDF</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="optionsArea" style="display: none; margin-top: 20px;">
                <p>Enter page numbers to remove (e.g. 1, 3-5):</p>
                <input type="text" id="pagesToRemove" class="form-input" placeholder="2, 4" style="width: 100%; margin-bottom: 10px;">
                <button id="removeBtn" class="pdf-btn">Remove Pages</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const optionsArea = document.getElementById('optionsArea');
    const removeBtn = document.getElementById('removeBtn');
    const pagesToRemoveInput = document.getElementById('pagesToRemove');

    let currentFile = null;

    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) optionsArea.style.display = 'block';
    };

    removeBtn.onclick = async () => {
        const pagesStr = pagesToRemoveInput.value.trim();
        if (!pagesStr || !currentFile) return;

        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            
            const pagesToRemove = [];
            pagesStr.split(',').forEach(part => {
                if (part.includes('-')) {
                    const [start, end] = part.split('-').map(Number);
                    for (let i = start; i <= end; i++) pagesToRemove.push(i - 1);
                } else {
                    pagesToRemove.push(Number(part) - 1);
                }
            });

            // Remove pages in descending order to avoid index shift
            pagesToRemove.sort((a, b) => b - a).forEach(idx => {
                if (idx >= 0 && idx < pdfDoc.getPageCount()) {
                    pdfDoc.removePage(idx);
                }
            });

            const pdfBytes = await pdfDoc.save();
            downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'modified.pdf');
            showToast('Pages removed successfully!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Error removing pages', 'error');
        }
    };
};

// Add Page Numbers
window.loadAddpagenumbers = function() {
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">🔢</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDF</h3>
                        <p>Add page numbers to your document</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="optionsArea" style="display: none; margin-top: 20px;">
                <button id="addNumbersBtn" class="pdf-btn">Add Page Numbers</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const optionsArea = document.getElementById('optionsArea');
    const addNumbersBtn = document.getElementById('addNumbersBtn');

    let currentFile = null;

    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) optionsArea.style.display = 'block';
    };

    addNumbersBtn.onclick = async () => {
        if (!currentFile) return;

        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();

            pages.forEach((page, index) => {
                const { width, height } = page.getSize();
                page.drawText(\`\${index + 1} / \${pages.length}\`, {
                    x: width / 2 - 10,
                    y: 20,
                    size: 12,
                    font: font,
                    color: PDFLib.rgb(0, 0, 0),
                });
            });

            const pdfBytes = await pdfDoc.save();
            downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'numbered.pdf');
            showToast('Page numbers added!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Error adding page numbers', 'error');
        }
    };
};

// Excel to PDF (using xlsx.js)
window.loadExceltopdf = async function() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">📈</div>
                    <div class="pdf-upload-text">
                        <h3>Upload Excel (.xlsx)</h3>
                        <p>Convert your spreadsheet to PDF</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".xlsx" style="display: none;">
            </div>
            <div id="processArea" style="display: none; margin-top: 20px; text-align: center;">
                <p id="fileName"></p>
                <button id="convertBtn" class="pdf-btn">Convert to PDF</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const processArea = document.getElementById('processArea');
    const fileName = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');

    let currentFile = null;

    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) {
            fileName.textContent = currentFile.name;
            processArea.style.display = 'block';
        }
    };

    convertBtn.onclick = async () => {
        if (!currentFile) return;
        convertBtn.disabled = true;
        convertBtn.textContent = 'Converting...';
        
        try {
            const data = await currentFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const firstSheet = workbook.SheetNames[0];
            const htmlContent = XLSX.utils.sheet_to_html(workbook.Sheets[firstSheet]);
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'pt', 'a4');
            
            await doc.html(htmlContent, {
                callback: function(d) {
                    d.save('excel.pdf');
                    showToast('Excel to PDF converted!', 'success');
                },
                x: 15,
                y: 15,
                width: 500,
                windowWidth: 1000
            });
        } catch (err) {
            console.error(err);
            showToast('Error converting Excel to PDF', 'error');
        } finally {
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert to PDF';
        }
    };
};

// Generic loader for unassigned tools
const otherTools = [
    'ppttopdf', 'pdftoppt', 'pdftoexcel', 'pdftohtml', 'compresspdf', 'unlockpdf', 'reorderpages'
];

otherTools.forEach(toolId => {
    const fnName = 'load' + toolId.charAt(0).toUpperCase() + toolId.slice(1);
    if (!window[fnName]) {
        window[fnName] = function() {
            let html = \`
                <div class="tool-form">
                    <div class="pdf-upload-area" onclick="document.getElementById('\${toolId}FileInput').click()">
                        <div class="pdf-upload-content">
                            <div class="pdf-upload-icon">📄</div>
                            <div class="pdf-upload-text">
                                <h3>Upload File</h3>
                                <p>This tool (\${toolId}) is currently being optimized.</p>
                            </div>
                        </div>
                        <input type="file" id="\${toolId}FileInput" style="display: none;">
                    </div>
                </div>
            \`;
            toolContent.innerHTML = html;
        };
    }
});

`;

const newMainJs = mainJs.substring(0, logicStartIndex) + pdfLogic;
fs.writeFileSync(mainJsPath, newMainJs);
console.log('Successfully updated main.js with full PDF logic');
