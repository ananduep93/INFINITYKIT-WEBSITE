const fs = require('fs');
let content = fs.readFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', 'utf8');

// Find the existing .grouped-tools-list CSS and replace with desktop-aware version
const oldCss = `        /* ===== iOS-Style Grouped Tools List ===== */
        .grouped-tools-list {
            max-width: 680px;
            margin: 0 auto;
            padding: 0 16px 40px;
        }`;

const newCss = `        /* ===== iOS-Style Grouped Tools List ===== */
        .grouped-tools-list {
            max-width: 680px;
            margin: 0 auto;
            padding: 0 16px 40px;
        }

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

if (content.includes(oldCss.substring(0, 50))) {
    const newContent = content.replace(oldCss, newCss);
    fs.writeFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', newContent, 'utf8');
    console.log('Done! Desktop grid layout added to index.html');
} else {
    console.log('ERROR: Could not find target CSS. Check index.html styles.');
    // Log what's there to debug
    const styleStart = content.indexOf('/* ===== iOS-Style');
    console.log('Found at:', styleStart, '| Snippet:', content.substring(styleStart, styleStart + 100));
}
