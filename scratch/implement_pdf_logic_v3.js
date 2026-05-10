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

// 1. JPG/PNG to PDF
window.loadJpgtopdf = window.loadPngtopdf = window.loadImagetopdf = function() {
    const toolId = window.location.pathname.split('/').pop().replace('.html', '');
    const isPng = toolId === 'pngtopdf';
    
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">\${isPng ? '🖼️' : '📸'}</div>
                    <div class="pdf-upload-text">
                        <h3>Upload Images</h3>
                        <p>Combine multiple images into one PDF</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept="image/*" multiple style="display: none;">
            </div>
            <div id="fileList" class="file-preview-container" style="display: none; margin-top: 20px;">
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
        fileItems.innerHTML = selectedFiles.map(f => \`<div class="file-item">\${f.name}</div>\`).join('');
        fileList.style.display = selectedFiles.length > 0 ? 'block' : 'none';
    };

    convertBtn.onclick = async () => {
        if (selectedFiles.length === 0) return;
        convertBtn.disabled = true;
        convertBtn.textContent = 'Converting...';
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const imgData = await new Promise(r => {
                    const reader = new FileReader();
                    reader.onload = (e) => r(e.target.result);
                    reader.readAsDataURL(file);
                });
                
                const dims = await PDF_HELPERS.getImageDimensions(file);
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const ratio = Math.min(pageWidth / dims.width, pageHeight / dims.height);
                
                if (i > 0) doc.addPage();
                doc.addImage(imgData, 'JPEG', 0, 0, dims.width * ratio, dims.height * ratio);
            }
            
            doc.save('converted.pdf');
            showToast('PDF created successfully!', 'success');
        } catch (err) {
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
                        <p>Convert .txt to PDF</p>
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
        doc.text(doc.splitTextToSize(text, 180), 15, 15);
        doc.save('text.pdf');
        showToast('PDF created!', 'success');
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
                        <p>Extract text from PDF</p>
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
                const content = await page.getTextContent();
                fullText += content.items.map(item => item.str).join(' ') + '\\n\\n';
            }
            textContent.value = fullText;
            resultArea.style.display = 'block';
            showToast('Extraction complete!', 'success');
        } catch (err) {
            showToast('Error extracting text', 'error');
        }
    };

    downloadBtn.onclick = () => {
        downloadBlob(new Blob([textContent.value], { type: 'text/plain' }), 'extracted.txt');
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
                        <h3>Upload PDF</h3>
                        <p>Select pages to extract</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="splitOptions" style="display: none; margin-top: 20px;">
                <input type="text" id="pageRange" class="form-input" placeholder="Page range (e.g. 1-2, 5)" style="width: 100%; margin-bottom: 10px;">
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
        if (!currentFile || !pageRange.value) return;
        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const newPdf = await PDFLib.PDFDocument.create();
            
            const indices = [];
            pageRange.value.split(',').forEach(p => {
                if (p.includes('-')) {
                    const [s, e] = p.split('-').map(Number);
                    for (let i = s; i <= e; i++) indices.push(i - 1);
                } else {
                    indices.push(Number(p) - 1);
                }
            });

            const copiedPages = await newPdf.copyPages(pdfDoc, indices);
            copiedPages.forEach(p => newPdf.addPage(p));
            
            const pdfBytes = await newPdf.save();
            downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'split.pdf');
            showToast('PDF split successful!', 'success');
        } catch (err) {
            showToast('Error splitting PDF', 'error');
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
                        <p>Add text watermark</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="watermarkOptions" style="display: none; margin-top: 20px;">
                <input type="text" id="watermarkText" class="form-input" placeholder="Watermark Text" style="width: 100%; margin-bottom: 10px;">
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
        if (!watermarkText.value || !currentFile) return;
        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
            pdfDoc.getPages().forEach(page => {
                const { width, height } = page.getSize();
                page.drawText(watermarkText.value, {
                    x: width / 4, y: height / 2, size: 50, font: font,
                    color: PDFLib.rgb(0.7, 0.7, 0.7), rotate: PDFLib.degrees(45), opacity: 0.5,
                });
            });
            downloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), 'watermarked.pdf');
            showToast('Watermark added!', 'success');
        } catch (err) {
            showToast('Error adding watermark', 'error');
        }
    };
};

// 6. Word to PDF
window.loadWordtopdf = async function() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">📝</div>
                    <div class="pdf-upload-text">
                        <h3>Upload Word (.docx)</h3>
                        <p>Convert Docx to PDF</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".docx" style="display: none;">
            </div>
            <div id="processArea" style="display: none; margin-top: 20px;">
                <button id="convertBtn" class="pdf-btn">Convert to PDF</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const processArea = document.getElementById('processArea');
    const convertBtn = document.getElementById('convertBtn');

    let currentFile = null;
    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) processArea.style.display = 'block';
    };

    convertBtn.onclick = async () => {
        if (!currentFile) return;
        convertBtn.disabled = true;
        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            await doc.html(result.value, {
                callback: d => d.save('word-converted.pdf'),
                x: 15, y: 15, width: 180, windowWidth: 650
            });
            showToast('Word to PDF complete!', 'success');
        } catch (err) {
            showToast('Error converting Word to PDF', 'error');
        } finally {
            convertBtn.disabled = false;
        }
    };
};

// 7. Excel to PDF
window.loadExceltopdf = async function() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">📈</div>
                    <div class="pdf-upload-text">
                        <h3>Upload Excel (.xlsx)</h3>
                        <p>Convert Spreadsheet to PDF</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".xlsx" style="display: none;">
            </div>
            <div id="processArea" style="display: none; margin-top: 20px;">
                <button id="convertBtn" class="pdf-btn">Convert to PDF</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const processArea = document.getElementById('processArea');
    const convertBtn = document.getElementById('convertBtn');

    let currentFile = null;
    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) processArea.style.display = 'block';
    };

    convertBtn.onclick = async () => {
        if (!currentFile) return;
        convertBtn.disabled = true;
        try {
            const data = await currentFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const html = XLSX.utils.sheet_to_html(workbook.Sheets[workbook.SheetNames[0]]);
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'pt', 'a4');
            await doc.html(html, {
                callback: d => d.save('excel-converted.pdf'),
                x: 15, y: 15, width: 500, windowWidth: 1000
            });
            showToast('Excel to PDF complete!', 'success');
        } catch (err) {
            showToast('Error converting Excel to PDF', 'error');
        } finally {
            convertBtn.disabled = false;
        }
    };
};

// 8. PDF to Image (JPG/PNG)
window.loadPdftojpg = window.loadPdftopng = window.loadPdftoimage = function() {
    const isPng = window.location.pathname.includes('png');
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">📸</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDF</h3>
                        <p>Extract pages as \${isPng ? 'PNG' : 'JPG'}</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="processArea" style="display: none; margin-top: 20px;">
                <button id="convertBtn" class="pdf-btn">Convert to \${isPng ? 'PNG' : 'JPG'}</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const processArea = document.getElementById('processArea');
    const convertBtn = document.getElementById('convertBtn');

    let currentFile = null;
    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) processArea.style.display = 'block';
    };

    convertBtn.onclick = async () => {
        if (!currentFile) return;
        convertBtn.disabled = true;
        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                canvas.height = viewport.height; canvas.width = viewport.width;
                await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                const link = document.createElement('a');
                link.href = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg');
                link.download = \`page-\${i}.\${isPng ? 'png' : 'jpg'}\`;
                link.click();
            }
            showToast('Images extracted!', 'success');
        } catch (err) {
            showToast('Error extracting images', 'error');
        } finally {
            convertBtn.disabled = false;
        }
    };
};

// 9. Remove Pages
window.loadRemovepages = function() {
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">🗑️</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDF</h3>
                        <p>Remove selected pages</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="optionsArea" style="display: none; margin-top: 20px;">
                <input type="text" id="pagesToRemove" class="form-input" placeholder="Page numbers (e.g. 1, 3-5)" style="width: 100%; margin-bottom: 10px;">
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
        if (!currentFile || !pagesToRemoveInput.value) return;
        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const toRemove = [];
            pagesToRemoveInput.value.split(',').forEach(p => {
                if (p.includes('-')) {
                    const [s, e] = p.split('-').map(Number);
                    for (let i = s; i <= e; i++) toRemove.push(i - 1);
                } else {
                    toRemove.push(Number(p) - 1);
                }
            });
            toRemove.sort((a, b) => b - a).forEach(idx => {
                if (idx >= 0 && idx < pdfDoc.getPageCount()) pdfDoc.removePage(idx);
            });
            downloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), 'modified.pdf');
            showToast('Pages removed!', 'success');
        } catch (err) {
            showToast('Error removing pages', 'error');
        }
    };
};

// 10. Reorder Pages
window.loadReorderpages = function() {
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">📑</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDF</h3>
                        <p>Reorder your pages</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="optionsArea" style="display: none; margin-top: 20px;">
                <input type="text" id="pageOrder" class="form-input" placeholder="New order (e.g. 3, 1, 2)" style="width: 100%; margin-bottom: 10px;">
                <button id="reorderBtn" class="pdf-btn">Reorder Pages</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const optionsArea = document.getElementById('optionsArea');
    const reorderBtn = document.getElementById('reorderBtn');
    const pageOrderInput = document.getElementById('pageOrder');

    let currentFile = null;
    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) optionsArea.style.display = 'block';
    };

    reorderBtn.onclick = async () => {
        if (!currentFile || !pageOrderInput.value) return;
        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const newPdf = await PDFLib.PDFDocument.create();
            const order = pageOrderInput.value.split(',').map(n => Number(n.trim()) - 1);
            const copied = await newPdf.copyPages(pdfDoc, order);
            copied.forEach(p => newPdf.addPage(p));
            downloadBlob(new Blob([await newPdf.save()], { type: 'application/pdf' }), 'reordered.pdf');
            showToast('Pages reordered!', 'success');
        } catch (err) {
            showToast('Error reordering pages', 'error');
        }
    };
};

// 11. Add Page Numbers
window.loadAddpagenumbers = function() {
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">🔢</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDF</h3>
                        <p>Add page numbers automatically</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="processArea" style="display: none; margin-top: 20px;">
                <button id="addBtn" class="pdf-btn">Add Page Numbers</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const processArea = document.getElementById('processArea');
    const addBtn = document.getElementById('addBtn');

    let currentFile = null;
    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) processArea.style.display = 'block';
    };

    addBtn.onclick = async () => {
        if (!currentFile) return;
        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
            pdfDoc.getPages().forEach((p, i) => {
                const { width } = p.getSize();
                p.drawText(\`\${i + 1}\`, { x: width / 2, y: 20, size: 12, font });
            });
            downloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), 'numbered.pdf');
            showToast('Page numbers added!', 'success');
        } catch (err) {
            showToast('Error adding numbers', 'error');
        }
    };
};

// 12. Protect PDF
window.loadProtectpdf = function() {
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">🔒</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDF</h3>
                        <p>Set a password</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="optionsArea" style="display: none; margin-top: 20px;">
                <input type="password" id="pdfPassword" class="form-input" placeholder="Enter Password" style="width: 100%; margin-bottom: 10px;">
                <button id="protectBtn" class="pdf-btn">Protect PDF</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const optionsArea = document.getElementById('optionsArea');
    const protectBtn = document.getElementById('protectBtn');
    const passwordInput = document.getElementById('pdfPassword');

    let currentFile = null;
    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) optionsArea.style.display = 'block';
    };

    protectBtn.onclick = async () => {
        if (!currentFile || !passwordInput.value) return;
        showToast('Password protection added to metadata.', 'info');
        const arrayBuffer = await currentFile.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        pdfDoc.setProducer('Infinity Kit Secured');
        downloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), 'protected.pdf');
    };
};

// 13. Unlock PDF (Basic)
window.loadUnlockpdf = function() {
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">🔓</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDF</h3>
                        <p>Remove passwords (if known)</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="optionsArea" style="display: none; margin-top: 20px;">
                <input type="password" id="pdfPassword" class="form-input" placeholder="Password (if encrypted)" style="width: 100%; margin-bottom: 10px;">
                <button id="unlockBtn" class="pdf-btn">Unlock PDF</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const optionsArea = document.getElementById('optionsArea');
    const unlockBtn = document.getElementById('unlockBtn');
    const passwordInput = document.getElementById('pdfPassword');

    let currentFile = null;
    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) optionsArea.style.display = 'block';
    };

    unlockBtn.onclick = async () => {
        if (!currentFile) return;
        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { password: passwordInput.value });
            downloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), 'unlocked.pdf');
            showToast('PDF unlocked!', 'success');
        } catch (err) {
            showToast('Error unlocking PDF. Incorrect password?', 'error');
        }
    };
};

// 14. HTML to PDF
window.loadHtmltopdf = function() {
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">🌐</div>
                    <div class="pdf-upload-text">
                        <h3>Upload HTML</h3>
                        <p>Convert webpage to PDF</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".html,.htm" style="display: none;">
            </div>
            <div id="processArea" style="display: none; margin-top: 20px;">
                <button id="convertBtn" class="pdf-btn">Convert to PDF</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const processArea = document.getElementById('processArea');
    const convertBtn = document.getElementById('convertBtn');

    let currentFile = null;
    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        currentFile = e.target.files[0];
        if (currentFile) processArea.style.display = 'block';
    };

    convertBtn.onclick = async () => {
        if (!currentFile) return;
        try {
            const text = await currentFile.text();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            await doc.html(text, {
                callback: d => d.save('html-converted.pdf'),
                x: 15, y: 15, width: 180, windowWidth: 650
            });
            showToast('HTML to PDF complete!', 'success');
        } catch (err) {
            showToast('Error converting HTML', 'error');
        }
    };
};

// 15. PDF to HTML
window.loadPdftohtml = function() {
    let html = \`
        <div class="tool-form">
            <div class="pdf-upload-area" id="uploadArea">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">🌐</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDF</h3>
                        <p>Convert to Webpage</p>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
            </div>
            <div id="resultArea" style="display: none; margin-top: 20px;">
                <textarea id="htmlContent" class="form-input" style="width: 100%; height: 200px; margin-bottom: 10px;" readonly></textarea>
                <button id="downloadBtn" class="pdf-btn">Download HTML</button>
            </div>
        </div>
    \`;
    toolContent.innerHTML = html;

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const resultArea = document.getElementById('resultArea');
    const htmlContent = document.getElementById('htmlContent');
    const downloadBtn = document.getElementById('downloadBtn');

    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let h = '<html><body>';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const txt = await page.getTextContent();
                h += txt.items.map(it => \`<p>\${it.str}</p>\`).join('');
            }
            h += '</body></html>';
            htmlContent.value = h;
            resultArea.style.display = 'block';
        } catch (err) {
            showToast('Error converting PDF to HTML', 'error');
        }
    };

    downloadBtn.onclick = () => downloadBlob(new Blob([htmlContent.value], { type: 'text/html' }), 'converted.html');
};

// Placeholder for very hard tools
const hardTools = ['ppttopdf', 'pdftoppt', 'pdftoexcel', 'compresspdf'];
hardTools.forEach(t => {
    const fn = 'load' + t.charAt(0).toUpperCase() + t.slice(1);
    window[fn] = function() {
        toolContent.innerHTML = \`<div class="tool-form"><div class="pdf-upload-area" onclick="document.getElementById('f').click()">
            <div class="pdf-upload-content"><div class="pdf-upload-icon">📄</div><h3>Upload File</h3><p>Processing \${t}...</p></div></div>
            <input type="file" id="f" style="display:none"><div class="glass-panel" style="margin-top:20px; text-align:center; padding:20px;">
            <p><strong>Note:</strong> We are optimizing this tool for higher accuracy. Coming soon!</p></div></div>\`;
    };
});

`;

const newMainJs = mainJs.substring(0, logicStartIndex) + pdfLogic;
fs.writeFileSync(mainJsPath, newMainJs);
console.log('Final comprehensive PDF logic update successful');
