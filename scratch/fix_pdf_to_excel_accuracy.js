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

const pdfToExcelLogic = `
// 2. PDF to EXCEL (Accurate Table Detection)
window.loadPdftoexcel = async function() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    PDFToolUI.init('pdftoexcel', {
        icon: '📊', uploadTitle: 'Upload PDF', uploadDesc: 'Accurately convert PDF tables to Excel',
        accept: '.pdf', multiple: false, btnText: 'Convert to Excel',
        action: async (files) => {
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument({ data: await files[0].arrayBuffer() }).promise;
            
            const allRows = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const items = textContent.items;
                
                // 1. Group items by Y coordinate (Rows)
                const rowsMap = {};
                items.forEach(item => {
                    const y = Math.round(item.transform[5]); // Y coordinate
                    if (!rowsMap[y]) rowsMap[y] = [];
                    rowsMap[y].push(item);
                });
                
                // 2. Sort Y coordinates descending (Top to Bottom)
                const sortedY = Object.keys(rowsMap).sort((a, b) => b - a);
                
                // 3. Process each row
                sortedY.forEach(y => {
                    const rowItems = rowsMap[y].sort((a, b) => a.transform[4] - b.transform[4]); // Sort by X
                    const rowData = [];
                    let lastX = -1;
                    
                    rowItems.forEach(item => {
                        const x = item.transform[4];
                        // If X difference is large, it's likely a new column
                        if (lastX !== -1 && (x - lastX) > 20) { 
                            // Add empty cells if gap is huge
                            const gapCount = Math.floor((x - lastX) / 100);
                            for(let g=0; g<gapCount; g++) rowData.push("");
                        }
                        rowData.push(item.str);
                        lastX = x + (item.width || 0);
                    });
                    allRows.push(rowData);
                });
                allRows.push([]); // Gap between pages
            }
            
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(allRows);
            
            // Auto-calculate column widths
            const wscols = [];
            allRows.forEach(row => {
                row.forEach((cell, idx) => {
                    const len = (cell ? cell.toString().length : 0);
                    if (!wscols[idx] || wscols[idx].wch < len) wscols[idx] = { wch: len + 2 };
                });
            });
            ws['!cols'] = wscols;

            XLSX.utils.book_append_sheet(wb, ws, "PDF Data");
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            download(new Blob([wbout], { type: 'application/octet-stream' }), 'converted_table.xlsx');
            showToast('✓ Accurate Excel conversion complete!', 'success');
        }
    });
};
`;

// Find where the old loadPdftoexcel was and replace it
const oldPattern = /window\.loadPdftoexcel\s*=\s*async\s*function[\s\S]*?\}\s*;/;
const updatedMainJs = mainJs.replace(oldPattern, pdfToExcelLogic);

fs.writeFileSync(mainJsPath, updatedMainJs);
console.log('Updated PDF to Excel with accurate table detection logic');
