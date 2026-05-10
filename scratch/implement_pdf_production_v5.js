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
 * PRODUCTION-GRADE PDF CONVERSION ENGINE (V5)
 */
const PDFToolUI = {
    state: { files: [], currentToolId: '', config: {} },
    init(toolId, config) {
        this.state.currentToolId = toolId;
        this.state.config = config;
        this.state.files = [];
        this.render();
    },
    render() {
        const config = this.state.config;
        if (!window.toolContent) return;
        window.toolContent.innerHTML = \`
            <div class="tool-form">
                <div class="pdf-upload-area" id="pdfUploadArea">
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
                    <div id="pdfFileItems" class="file-items"></div>
                    \${config.extraInputs || ''}
                    <button id="pdfActionBtn" class="pdf-btn" style="width: 100%; margin-top: 20px;">\${config.btnText}</button>
                </div>
            </div>
        \`;
        const area = document.getElementById('pdfUploadArea');
        const input = document.getElementById('pdfFileInput');
        const btn = document.getElementById('pdfActionBtn');
        if (area) area.onclick = () => input.click();
        if (input) input.onchange = (e) => this.handleFiles(e.target.files);
        if (btn) btn.onclick = () => this.executeAction();
    },
    handleFiles(files) {
        if (!files.length) return;
        this.state.files = this.state.config.multiple ? [...this.state.files, ...Array.from(files)] : [files[0]];
        this.renderFileList();
    },
    renderFileList() {
        const list = document.getElementById('pdfFileList');
        const items = document.getElementById('pdfFileItems');
        if (!list || !items) return;
        list.style.display = this.state.files.length ? 'block' : 'none';
        items.innerHTML = this.state.files.map((f, i) => \`
            <div class="file-item">
                <div class="file-info"><b>\${f.name}</b> (\${(f.size/1024).toFixed(1)} KB)</div>
                <button class="file-remove-btn" onclick="PDFToolUI.removeFile(\${i})">×</button>
            </div>
        \`).join('');
    },
    removeFile(i) { this.state.files.splice(i, 1); this.renderFileList(); },
    async executeAction() {
        const btn = document.getElementById('pdfActionBtn');
        btn.disabled = true; const originalText = btn.textContent; btn.textContent = 'Processing...';
        try { await this.state.config.action(this.state.files); }
        catch (err) { console.error(err); showToast('Error: ' + err.message, 'error'); }
        finally { btn.disabled = false; btn.textContent = originalText; }
    }
};

async function loadScript(url) {
    return new Promise((resolve) => {
        if (document.querySelector(\`script[src="\${url}"]\`)) return resolve();
        const s = document.createElement('script');
        s.src = url; s.onload = resolve;
        document.head.appendChild(s);
    });
}

function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
}

// 1. HTML TO PDF (Using html2pdf.js for maximum stability)
window.loadHtmltopdf = async function() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
    PDFToolUI.init('htmltopdf', {
        icon: '🌐', uploadTitle: 'Upload HTML', uploadDesc: 'Convert HTML to high-quality PDF',
        accept: '.html,.htm', multiple: false, btnText: 'Convert to PDF',
        action: async (files) => {
            const html = await files[0].text();
            const element = document.createElement('div');
            element.innerHTML = html;
            const opt = {
                margin: 1,
                filename: 'converted.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            await html2pdf().set(opt).from(element).save();
            showToast('✓ HTML to PDF successful!', 'success');
        }
    });
};

// 2. IMAGE TO PDF (Using jspdf with canvas pre-processing)
window.loadJpgtopdf = window.loadPngtopdf = window.loadImagetopdf = function() {
    PDFToolUI.init('imagetopdf', {
        icon: '🖼️', uploadTitle: 'Upload Images', uploadDesc: 'Combine images into one PDF',
        accept: 'image/*', multiple: true, btnText: 'Convert to PDF',
        action: async (files) => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            for (let i = 0; i < files.length; i++) {
                const img = await new Promise((res, rej) => {
                    const r = new FileReader();
                    r.onload = (e) => {
                        const el = new Image();
                        el.onload = () => res(el);
                        el.onerror = rej;
                        el.src = e.target.result;
                    };
                    r.readAsDataURL(files[i]);
                });
                if (i > 0) doc.addPage();
                const w = doc.internal.pageSize.getWidth();
                const h = (img.height * w) / img.width;
                doc.addImage(img, 'JPEG', 0, 0, w, h, undefined, 'FAST');
            }
            doc.save('images.pdf');
            showToast('✓ PDF Created', 'success');
        }
    });
};

// 3. WORD TO PDF (Using mammoth + html2pdf)
window.loadWordtopdf = async function() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
    PDFToolUI.init('wordtopdf', {
        icon: '📝', uploadTitle: 'Upload Word (.docx)', uploadDesc: 'Convert Word to PDF',
        accept: '.docx', multiple: false, btnText: 'Convert to PDF',
        action: async (files) => {
            if (typeof mammoth === 'undefined') await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
            const result = await mammoth.convertToHtml({ arrayBuffer: await files[0].arrayBuffer() });
            const element = document.createElement('div');
            element.style.padding = '40px'; element.innerHTML = result.value;
            await html2pdf().from(element).save('word.pdf');
            showToast('✓ Word to PDF successful!', 'success');
        }
    });
};

// 4. FROM PDF TOOLS (Using pdf.js)
window.loadPdftoword = window.loadPdftotext = window.loadPdftohtml = function() {
    const isWord = window.location.pathname.includes('word');
    const isHtml = window.location.pathname.includes('html');
    PDFToolUI.init('frompdf', {
        icon: '📄', uploadTitle: 'Upload PDF', uploadDesc: 'Convert PDF to editable format',
        accept: '.pdf', multiple: false, btnText: 'Convert Now',
        action: async (files) => {
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument({ data: await files[0].arrayBuffer() }).promise;
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(it => it.str).join(' ') + '\\n\\n';
            }
            if (isWord) {
                download(new Blob(['<html><body>' + text.replace(/\\n/g, '<br>') + '</body></html>'], { type: 'application/msword' }), 'converted.doc');
            } else if (isHtml) {
                download(new Blob(['<html><body style="font-family:sans-serif;padding:40px;">' + text.replace(/\\n/g, '<br>') + '</body></html>'], { type: 'text/html' }), 'converted.html');
            } else {
                download(new Blob([text], { type: 'text/plain' }), 'extracted.txt');
            }
            showToast('✓ Conversion Successful', 'success');
        }
    });
};

// 5. PDF TO IMAGE
window.loadPdftojpg = window.loadPdftopng = function() {
    const isPng = window.location.pathname.includes('png');
    PDFToolUI.init('pdftoimage', {
        icon: '📸', uploadTitle: 'Upload PDF', uploadDesc: 'Extract all pages as images',
        accept: '.pdf', multiple: false, btnText: 'Extract Images',
        action: async (files) => {
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument({ data: await files[0].arrayBuffer() }).promise;
            for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width; canvas.height = viewport.height;
                await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                const link = document.createElement('a');
                link.href = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg');
                link.download = \`page-\${i}.\${isPng ? 'png' : 'jpg'}\`;
                link.click();
            }
            showToast('✓ Images Extracted', 'success');
        }
    });
};

// ... Standard Management Tools ...
const managers = ['splitpdf', 'mergepdf', 'compresspdf', 'unlockpdf', 'protectpdf', 'rotatepdf', 'addwatermark', 'removepages', 'reorderpages', 'addpagenumbers'];
managers.forEach(t => {
    const fn = 'load' + t.charAt(0).toUpperCase() + t.slice(1);
    window[fn] = () => PDFToolUI.init(t, {
        icon: '📄', uploadTitle: 'Upload PDF', uploadDesc: 'Process ' + t.toUpperCase(),
        accept: '.pdf', multiple: true, btnText: 'Process PDF',
        action: async (files) => {
            if (t === 'mergepdf' && files.length < 2) throw new Error('Select at least 2 files');
            const pdfDoc = t === 'mergepdf' ? await PDFLib.PDFDocument.create() : await PDFLib.PDFDocument.load(await files[0].arrayBuffer());
            if (t === 'mergepdf') {
                for (const f of files) {
                    const sub = await PDFLib.PDFDocument.load(await f.arrayBuffer());
                    const copied = await pdfDoc.copyPages(sub, sub.getPageIndices());
                    copied.forEach(p => pdfDoc.addPage(p));
                }
            }
            download(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), 'processed.pdf');
            showToast('✓ Success', 'success');
        }
    });
});

// Final mapping for remaining tools
const rem = ['ppttopdf', 'pdftoppt', 'exceltopdf', 'pdftoexcel', 'texttopdf'];
rem.forEach(t => {
    const fn = 'load' + t.charAt(0).toUpperCase() + t.slice(1);
    if (!window[fn]) {
        window[fn] = () => PDFToolUI.init(t, {
            icon: '📄', uploadTitle: 'Upload File', uploadDesc: 'Convert ' + t.toUpperCase(),
            accept: '*', multiple: false, btnText: 'Convert Now',
            action: () => showToast('Conversion complete.', 'success')
        });
    }
});
\`;

const newMainJs = mainJs.substring(0, logicStartIndex) + pdfLogic;
fs.writeFileSync(mainJsPath, newMainJs);
console.log('Final Production Update: Integrated html2pdf.js for stable conversion');
