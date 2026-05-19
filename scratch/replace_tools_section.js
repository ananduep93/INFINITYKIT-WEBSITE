const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', 'utf8');

// Replace the entire allToolsSection block
const oldBlock = content.substring(
    content.indexOf('<!-- Existing Tools Grid Area'),
    content.indexOf('<!-- Infinity Kit Ecosystem Bento Grid')
);

console.log('OLD BLOCK START:', JSON.stringify(oldBlock.substring(0, 100)));
console.log('OLD BLOCK END:', JSON.stringify(oldBlock.substring(oldBlock.length - 100)));

const newBlock = `            <!-- All Tools - Grouped List (No Folders) -->
            <div class="all-tools-section" id="allToolsSection">
                <h2 class="section-heading" style="text-align:center; margin-bottom: 8px;">All Tools</h2>
                <p style="text-align:center; color:#64748B; margin-bottom: 32px; font-size: 0.95rem;">Tap any tool to open it instantly</p>
                <div id="groupedToolsList" class="grouped-tools-list"></div>
            </div>

            `;

const newContent = content.replace(oldBlock, newBlock);
fs.writeFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', newContent, 'utf8');
console.log('Done! Replaced allToolsSection.');
