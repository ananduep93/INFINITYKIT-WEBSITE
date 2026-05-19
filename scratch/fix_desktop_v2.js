const fs = require('fs');
let content = fs.readFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', 'utf8');

// Find and replace the desktop grid media queries we added last time
const oldDesktopCSS = `
        /* Desktop: 2-column layout to fill wide screens */
        @media (min-width: 960px) {
            .grouped-tools-list {
                max-width: 1100px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                column-gap: 36px;
                align-items: start;
            }
        }
        @media (min-width: 1400px) {
            .grouped-tools-list {
                max-width: 1300px;
                grid-template-columns: 1fr 1fr 1fr;
                column-gap: 40px;
            }
        }`;

const newDesktopCSS = `
        /* Desktop: wider container, categories stay single-column,
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

if (content.includes(oldDesktopCSS.trim().substring(0, 50))) {
    const newContent = content.replace(oldDesktopCSS, newDesktopCSS);
    fs.writeFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', newContent, 'utf8');
    console.log('Done! Desktop layout fixed to tool-item 2-column grid.');
} else {
    // fallback: search and replace the block
    const idx = content.indexOf('/* Desktop: 2-column layout to fill wide screens */');
    const endIdx = content.indexOf('        }', content.indexOf('@media (min-width: 1400px)')) + 9;
    if (idx !== -1) {
        const newContent = content.substring(0, idx) + newDesktopCSS.trim() + content.substring(endIdx);
        fs.writeFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', newContent, 'utf8');
        console.log('Done via index fallback!');
    } else {
        console.log('ERROR - Could not find target. Snippet:');
        const start = content.indexOf('/* Desktop');
        console.log(content.substring(start, start + 200));
    }
}
