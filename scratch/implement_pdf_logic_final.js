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

/**
 * PDF Tool Standard UI Manager
 */
const PDFToolUI = {
    state: {
        files: [],
        currentToolId: ''
    },

    reset(toolId) {
        this.state.files = [];
        this.state.currentToolId = toolId;
        this.render();
    },

    init(toolId, config) {
        this.state.currentToolId = toolId;
        this.state.config = config;
        this.state.files = [];
        this.render();
    },

    render() {
        const config = this.state.config;
        const toolId = this.state.currentToolId;
        
        let html = \`
            <div class="tool-form">
                <div class="pdf-upload-area" id="pdfUploadArea" onclick="document.getElementById('pdfFileInput').click()">
                    <div class="pdf-upload-content">
                        <div class="pdf-upload-icon">\${config.icon}</div>
                        <div class="pdf-upload-text">
                            <h3>\${config.uploadTitle}</h3>
                            <p>\${config.uploadDesc}</p>
                        </div>
                    </div>
                    <input type="file" id="pdfFileInput" \${config.multiple ? 'multiple' : ''} accept="\${config.accept}" style="display: none;">
                </div>
                
                <div id="pdfFileList" class="file-preview-container" style="display: none; margin-top: 20px;">
                    <h4>Selected Files:</h4>
                    <div id="pdfFileItems" class="file-items"></div>
                    
                    \${config.extraInputs || ''}
                    
                    <button id="pdfActionBtn" class="pdf-btn" style="width: 100%; margin-top: 20px;">\${config.btnText}</button>
                </div>
            </div>
        \`;
        
        if (window.toolContent) window.toolContent.innerHTML = html;

        const fileInput = document.getElementById('pdfFileInput');
        const uploadArea = document.getElementById('pdfUploadArea');
        
        if (fileInput) {
            fileInput.onchange = (e) => this.handleFiles(e.target.files);
        }

        const actionBtn = document.getElementById('pdfActionBtn');
        if (actionBtn) {
            actionBtn.onclick = () => config.action(this.state.files);
        }
    },

    handleFiles(files) {
        if (!files.length) return;
        
        const newFiles = Array.from(files);
        if (this.state.config.multiple) {
            this.state.files = [...this.state.files, ...newFiles];
        } else {
            this.state.files = [newFiles[0]];
        }
        
        this.renderFileList();
    },

    renderFileList() {
        const listContainer = document.getElementById('pdfFileList');
        const itemsContainer = document.getElementById('pdfFileItems');
        
        if (this.state.files.length === 0) {
            listContainer.style.display = 'none';
            return;
        }
        
        listContainer.style.display = 'block';
        itemsContainer.innerHTML = '';
        
        this.state.files.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerHTML = \`
                <div class="file-icon">\${this.state.config.icon}</div>
                <div class="file-info">
                    <div class="file-name">\${file.name}</div>
                    <div class="file-size">\${(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button class="file-remove-btn" onclick="PDFToolUI.removeFile(\${index})">×</button>
            \`;
            itemsContainer.appendChild(item);
        });
    },

    removeFile(index) {
        this.state.files.splice(index, 1);
        this.renderFileList();
    }
};

// Generic helper to download blob
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

/**
 * 1. JPG to PDF / PNG to PDF
 */
window.loadJpgtopdf = window.loadPngtopdf = window.loadImagetopdf = function() {
    const isPng = window.location.pathname.includes('png');
    PDFToolUI.init('imagetopdf', {
        icon: isPng ? '🖼️' : '📸',
        uploadTitle: \`Upload \${isPng ? 'PNG' : 'JPG'} Images\`,
        uploadDesc: 'Select multiple images to combine into one PDF',
        accept: 'image/*',
        multiple: true,
        btnText: '🖼️ Convert to PDF',
        action: async (files) => {
            if (!files.length) return;
            const btn = document.getElementById('pdfActionBtn');
            btn.disabled = true;
            btn.textContent = 'Processing...';
            
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const dataUrl = await new Promise(r => {
                        const reader = new FileReader();
                        reader.onload = (e) => r(e.target.result);
                        reader.readAsDataURL(file);
                    });
                    
                    if (i > 0) doc.addPage();
                    const props = doc.getImageProperties(dataUrl);
                    const width = doc.internal.pageSize.getWidth();
                    const height = (props.height * width) / props.width;
                    doc.addImage(dataUrl, 'JPEG', 0, 0, width, height);
                }
                
                doc.save('images-converted.pdf');
                showToast('✓ PDF created successfully!', 'success');
            } catch (err) {
                console.error(err);
                showToast('Error converting images', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = '🖼️ Convert to PDF';
            }
        }
    });
};

/**
 * 2. Word to PDF
 */
window.loadWordtopdf = function() {
    PDFToolUI.init('wordtopdf', {
        icon: '📝',
        uploadTitle: 'Upload Word Document',
        uploadDesc: 'Convert .docx file to PDF locally',
        accept: '.docx',
        multiple: false,
        btnText: '📝 Convert to PDF',
        action: async (files) => {
            if (!files.length) return;
            const btn = document.getElementById('pdfActionBtn');
            btn.disabled = true;
            btn.textContent = 'Processing...';
            
            try {
                if (typeof mammoth === 'undefined') {
                    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
                }
                
                const arrayBuffer = await files[0].arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                
                // Create temporary container for rendering
                const container = document.createElement('div');
                container.style.padding = '40px';
                container.style.width = '800px';
                container.style.background = 'white';
                container.innerHTML = result.value;
                document.body.appendChild(container);
                
                const canvas = await html2canvas(container);
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                const width = doc.internal.pageSize.getWidth();
                const height = (canvas.height * width) / canvas.width;
                
                doc.addImage(imgData, 'PNG', 0, 0, width, height);
                doc.save('word-converted.pdf');
                
                document.body.removeChild(container);
                showToast('✓ Word to PDF complete!', 'success');
            } catch (err) {
                console.error(err);
                showToast('Error converting Word to PDF', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = '📝 Convert to PDF';
            }
        }
    });
};

/**
 * 3. Text to PDF
 */
window.loadTexttopdf = function() {
    PDFToolUI.init('texttopdf', {
        icon: '✍️',
        uploadTitle: 'Upload Text File',
        uploadDesc: 'Convert .txt file to PDF',
        accept: '.txt',
        multiple: false,
        btnText: '✍️ Create PDF',
        action: async (files) => {
            if (!files.length) return;
            const text = await files[0].text();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const margin = 15;
            const width = doc.internal.pageSize.getWidth() - (margin * 2);
            doc.text(doc.splitTextToSize(text, width), margin, margin);
            doc.save('text-converted.pdf');
            showToast('✓ PDF created successfully!', 'success');
        }
    });
};

/**
 * 4. PDF to Image (JPG/PNG)
 */
window.loadPdftojpg = window.loadPdftopng = function() {
    const isPng = window.location.pathname.includes('png');
    PDFToolUI.init('pdftoimage', {
        icon: '📸',
        uploadTitle: 'Upload PDF',
        uploadDesc: \`Extract all pages as \${isPng ? 'PNG' : 'JPG'} images\`,
        accept: '.pdf',
        multiple: false,
        btnText: \`📸 Extract to \${isPng ? 'PNG' : 'JPG'}\`,
        action: async (files) => {
            if (!files.length) return;
            const btn = document.getElementById('pdfActionBtn');
            btn.disabled = true;
            btn.textContent = 'Extracting...';
            
            try {
                const arrayBuffer = await files[0].arrayBuffer();
                const pdfjsLib = window['pdfjs-dist/build/pdf'];
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                    
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg');
                    link.download = \`page-\${i}.\${isPng ? 'png' : 'jpg'}\`;
                    link.click();
                    if (i > 10) break; // Safety limit
                }
                showToast('✓ Pages extracted!', 'success');
            } catch (err) {
                console.error(err);
                showToast('Error extracting images', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = '📸 Extract Images';
            }
        }
    });
};

/**
 * 5. Split PDF
 */
window.loadSplitpdf = function() {
    PDFToolUI.init('splitpdf', {
        icon: '✂️',
        uploadTitle: 'Upload PDF to Split',
        uploadDesc: 'Extract specific pages from your PDF',
        accept: '.pdf',
        multiple: false,
        extraInputs: \`
            <div style="margin-top: 15px;">
                <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">Page Range (e.g. 1-2, 5):</label>
                <input type="text" id="pdfPageRange" class="form-input" placeholder="1-3" style="width: 100%;">
            </div>
        \`,
        btnText: '✂️ Split PDF',
        action: async (files) => {
            const range = document.getElementById('pdfPageRange').value;
            if (!files.length || !range) {
                showToast('Please select a file and enter page range', 'error');
                return;
            }
            
            try {
                const arrayBuffer = await files[0].arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                const newPdf = await PDFLib.PDFDocument.create();
                
                const pagesToExtract = [];
                range.split(',').forEach(p => {
                    const part = p.trim();
                    if (part.includes('-')) {
                        const [s, e] = part.split('-').map(Number);
                        for (let i = s; i <= e; i++) pagesToExtract.push(i - 1);
                    } else {
                        pagesToExtract.push(Number(part) - 1);
                    }
                });

                const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtract);
                copiedPages.forEach(p => newPdf.addPage(p));
                downloadBlob(new Blob([await newPdf.save()], { type: 'application/pdf' }), 'split.pdf');
                showToast('✓ PDF split successful!', 'success');
            } catch (err) {
                showToast('Error splitting PDF. Check range.', 'error');
            }
        }
    });
};

/**
 * 6. Add Watermark
 */
window.loadAddwatermark = function() {
    PDFToolUI.init('addwatermark', {
        icon: '💧',
        uploadTitle: 'Upload PDF',
        uploadDesc: 'Add text watermark to all pages',
        accept: '.pdf',
        multiple: false,
        extraInputs: \`
            <div style="margin-top: 15px;">
                <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">Watermark Text:</label>
                <input type="text" id="pdfWatermarkText" class="form-input" placeholder="DRAFT / CONFIDENTIAL" style="width: 100%;">
            </div>
        \`,
        btnText: '💧 Apply Watermark',
        action: async (files) => {
            const text = document.getElementById('pdfWatermarkText').value;
            if (!files.length || !text) return;
            
            try {
                const arrayBuffer = await files[0].arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
                
                pdfDoc.getPages().forEach(page => {
                    const { width, height } = page.getSize();
                    page.drawText(text, {
                        x: width / 4, y: height / 2, size: 50, font,
                        color: PDFLib.rgb(0.7, 0.7, 0.7), rotate: PDFLib.degrees(45), opacity: 0.5
                    });
                });
                
                downloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), 'watermarked.pdf');
                showToast('✓ Watermark added!', 'success');
            } catch (err) {
                showToast('Error adding watermark', 'error');
            }
        }
    });
};

/**
 * 7. Merge PDF (Updated to use standard UI)
 */
window.loadMergepdf = function() {
    PDFToolUI.init('mergepdf', {
        icon: '📎',
        uploadTitle: 'Upload PDFs to Merge',
        uploadDesc: 'Select multiple PDF files to combine',
        accept: '.pdf',
        multiple: true,
        btnText: '📎 Merge PDFs',
        action: async (files) => {
            if (files.length < 2) {
                showToast('Please select at least 2 files', 'error');
                return;
            }
            try {
                const mergedPdf = await PDFLib.PDFDocument.create();
                for (const file of files) {
                    const pdf = await PDFLib.PDFDocument.load(await file.arrayBuffer());
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach(p => mergedPdf.addPage(p));
                }
                downloadBlob(new Blob([await mergedPdf.save()], { type: 'application/pdf' }), 'merged.pdf');
                showToast('✓ PDFs merged!', 'success');
            } catch (err) {
                showToast('Error merging PDFs', 'error');
            }
        }
    });
};

/**
 * 8. Remove Pages
 */
window.loadRemovepages = function() {
    PDFToolUI.init('removepages', {
        icon: '🗑️',
        uploadTitle: 'Upload PDF',
        uploadDesc: 'Remove specific pages from your document',
        accept: '.pdf',
        multiple: false,
        extraInputs: \`
            <div style="margin-top: 15px;">
                <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">Pages to Remove (e.g. 1, 3-5):</label>
                <input type="text" id="pdfPagesToRemove" class="form-input" placeholder="2, 4" style="width: 100%;">
            </div>
        \`,
        btnText: '🗑️ Remove Pages',
        action: async (files) => {
            const range = document.getElementById('pdfPagesToRemove').value;
            if (!files.length || !range) return;
            
            try {
                const pdfDoc = await PDFLib.PDFDocument.load(await files[0].arrayBuffer());
                const toRemove = [];
                range.split(',').forEach(p => {
                    const part = p.trim();
                    if (part.includes('-')) {
                        const [s, e] = part.split('-').map(Number);
                        for (let i = s; i <= e; i++) toRemove.push(i - 1);
                    } else {
                        toRemove.push(Number(part) - 1);
                    }
                });
                
                toRemove.sort((a, b) => b - a).forEach(idx => {
                    if (idx >= 0 && idx < pdfDoc.getPageCount()) pdfDoc.removePage(idx);
                });
                
                downloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), 'modified.pdf');
                showToast('✓ Pages removed!', 'success');
            } catch (err) {
                showToast('Error removing pages', 'error');
            }
        }
    });
};

/**
 * 9. Reorder Pages
 */
window.loadReorderpages = function() {
    PDFToolUI.init('reorderpages', {
        icon: '📑',
        uploadTitle: 'Upload PDF',
        uploadDesc: 'Rearrange the order of pages',
        accept: '.pdf',
        multiple: false,
        extraInputs: \`
            <div style="margin-top: 15px;">
                <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">New Page Order (e.g. 3, 1, 2):</label>
                <input type="text" id="pdfPageOrder" class="form-input" placeholder="3, 1, 2" style="width: 100%;">
            </div>
        \`,
        btnText: '📑 Reorder Pages',
        action: async (files) => {
            const order = document.getElementById('pdfPageOrder').value;
            if (!files.length || !order) return;
            
            try {
                const pdfDoc = await PDFLib.PDFDocument.load(await files[0].arrayBuffer());
                const newPdf = await PDFLib.PDFDocument.create();
                const indices = order.split(',').map(n => Number(n.trim()) - 1);
                
                const copied = await newPdf.copyPages(pdfDoc, indices);
                copied.forEach(p => newPdf.addPage(p));
                
                downloadBlob(new Blob([await newPdf.save()], { type: 'application/pdf' }), 'reordered.pdf');
                showToast('✓ Pages reordered!', 'success');
            } catch (err) {
                showToast('Error reordering pages', 'error');
            }
        }
    });
};

/**
 * 10. Add Page Numbers
 */
window.loadAddpagenumbers = function() {
    PDFToolUI.init('addpagenumbers', {
        icon: '🔢',
        uploadTitle: 'Upload PDF',
        uploadDesc: 'Add automatic page numbering to footer',
        accept: '.pdf',
        multiple: false,
        btnText: '🔢 Add Page Numbers',
        action: async (files) => {
            if (!files.length) return;
            try {
                const pdfDoc = await PDFLib.PDFDocument.load(await files[0].arrayBuffer());
                const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
                pdfDoc.getPages().forEach((p, i) => {
                    const { width } = p.getSize();
                    p.drawText(\`\${i + 1} / \${pdfDoc.getPageCount()}\`, {
                        x: width / 2 - 10, y: 20, size: 10, font, color: PDFLib.rgb(0, 0, 0)
                    });
                });
                downloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), 'numbered.pdf');
                showToast('✓ Page numbers added!', 'success');
            } catch (err) {
                showToast('Error adding page numbers', 'error');
            }
        }
    });
};

/**
 * 11. HTML to PDF
 */
window.loadHtmltopdf = function() {
    PDFToolUI.init('htmltopdf', {
        icon: '🌐',
        uploadTitle: 'Upload HTML File',
        uploadDesc: 'Convert HTML code to PDF',
        accept: '.html,.htm',
        multiple: false,
        btnText: '🌐 Convert to PDF',
        action: async (files) => {
            if (!files.length) return;
            try {
                const html = await files[0].text();
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                await doc.html(html, {
                    callback: d => d.save('html-converted.pdf'),
                    x: 10, y: 10, width: 190, windowWidth: 800
                });
                showToast('✓ HTML to PDF complete!', 'success');
            } catch (err) {
                showToast('Error converting HTML', 'error');
            }
        }
    });
};

/**
 * 12. Excel to PDF
 */
window.loadExceltopdf = async function() {
    if (typeof XLSX === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    }
    PDFToolUI.init('exceltopdf', {
        icon: '📈',
        uploadTitle: 'Upload Excel File',
        uploadDesc: 'Convert spreadsheet to PDF',
        accept: '.xlsx,.xls',
        multiple: false,
        btnText: '📈 Convert to PDF',
        action: async (files) => {
            if (!files.length) return;
            try {
                const workbook = XLSX.read(await files[0].arrayBuffer());
                const sheet = workbook.SheetNames[0];
                const html = XLSX.utils.sheet_to_html(workbook.Sheets[sheet]);
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'pt', 'a4');
                await doc.html(html, {
                    callback: d => d.save('excel-converted.pdf'),
                    x: 20, y: 20, width: 500, windowWidth: 1000
                });
                showToast('✓ Excel to PDF complete!', 'success');
            } catch (err) {
                showToast('Error converting Excel', 'error');
            }
        }
    });
};

/**
 * 13. PDF to Text
 */
window.loadPdftotext = function() {
    PDFToolUI.init('pdftotext', {
        icon: '✍️',
        uploadTitle: 'Upload PDF',
        uploadDesc: 'Extract all text from your document',
        accept: '.pdf',
        multiple: false,
        btnText: '✍️ Extract Text',
        action: async (files) => {
            if (!files.length) return;
            try {
                const pdfjsLib = window['pdfjs-dist/build/pdf'];
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                const pdf = await pdfjsLib.getDocument({ data: await files[0].arrayBuffer() }).promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(it => it.str).join(' ') + '\\n\\n';
                }
                downloadBlob(new Blob([text], { type: 'text/plain' }), 'extracted.txt');
                showToast('✓ Text extracted!', 'success');
            } catch (err) {
                showToast('Error extracting text', 'error');
            }
        }
    });
};

// Aliases for compatibility
window.loadImagetopdf = window.loadJpgtopdf;
window.loadPdftoimage = window.loadPdftojpg;

// Fallback for tools currently in development
const devTools = ['ppttopdf', 'pdftoppt', 'pdftoexcel', 'compresspdf', 'unlockpdf', 'protectpdf'];
devTools.forEach(t => {
    const fn = 'load' + t.charAt(0).toUpperCase() + t.slice(1);
    if (!window[fn]) {
        window[fn] = () => {
            if (window.toolContent) {
                window.toolContent.innerHTML = \`
                    <div class="glass-panel" style="text-align: center; padding: 40px;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">⚙️</div>
                        <h3>Tool in Development</h3>
                        <p>We are currently optimizing the local WASM engine for \${t.toUpperCase()}. This tool will be available in the next update!</p>
                    </div>
                \`;
            }
        };
    }
});
`;

const newMainJs = mainJs.substring(0, logicStartIndex) + pdfLogic;
fs.writeFileSync(mainJsPath, newMainJs);
console.log('Successfully implemented standardized PDF tools with file previews and multi-file support');
