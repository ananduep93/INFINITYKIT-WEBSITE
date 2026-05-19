const fs = require('fs');
let content = fs.readFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', 'utf8');

// Remove old desktop grid CSS (both the old v1 block and v2 block)
// and replace with the correct column-count approach

const oldBlock = `/* Desktop: wider container, categories stay single-column,
           but tool items inside each category go 2-per-row */
        @media (min-width: 900px) {
            .grouped-tools-list {
                max-width: 1000px;
            }
            .tool-group-items {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0;
            }
            /* Keep divider only on right column items */
            .tool-group-items .tool-list-item:nth-child(odd) {
                border-right: 1px solid rgba(100,116,139,0.09);
            }
            /* Remove bottom border from last two items */
            .tool-group-items .tool-list-item:nth-last-child(-n+2) {
                border-bottom: none;
            }
            /* But if last row has only 1 item, only remove that one */
            .tool-group-items .tool-list-item:last-child {
                border-bottom: none;
            }
        }
        @media (min-width: 1200px) {
            .grouped-tools-list {
                max-width: 1100px;
            }
        }`;

const newBlock = `/* Desktop: CSS column-count layout — tools flow one by one,
           categories are never split, zero blank spaces */
        @media (min-width: 900px) {
            .grouped-tools-list {
                max-width: 1100px;
                column-count: 2;
                column-gap: 32px;
            }
            .tool-group {
                break-inside: avoid;
                -webkit-column-break-inside: avoid;
                page-break-inside: avoid;
            }
            /* Small gap between individual tool items */
            .tool-list-item {
                margin-bottom: 0;
            }
        }
        @media (min-width: 1300px) {
            .grouped-tools-list {
                max-width: 1260px;
                column-count: 3;
                column-gap: 36px;
            }
        }`;

if (content.includes('/* Desktop: wider container')) {
    const newContent = content.replace(oldBlock, newBlock);
    fs.writeFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', newContent, 'utf8');
    console.log('Done! Replaced with column-count layout.');
} else {
    // Try looser match
    const startIdx = content.indexOf('/* Desktop: wider container');
    if (startIdx !== -1) {
        // Find end of the block - after the last closing }
        let idx = startIdx;
        let depth = 0;
        let started = false;
        while (idx < content.length) {
            if (content[idx] === '{') { depth++; started = true; }
            if (content[idx] === '}') { depth--; }
            if (started && depth === 0) { idx++; break; }
            idx++;
        }
        // Keep going to close out the last @media block  
        const endIdx = content.indexOf('\n        }', idx) + 10;
        const replaced = content.substring(0, startIdx) + newBlock + content.substring(endIdx);
        fs.writeFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', replaced, 'utf8');
        console.log('Done via index fallback!');
    } else {
        console.log('ERROR: Target not found. Searching for nearby text...');
        console.log('Found Desktop block at:', content.indexOf('/* Desktop'));
    }
}
