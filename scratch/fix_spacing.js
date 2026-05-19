const fs = require('fs');
let content = fs.readFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', 'utf8');

// Add margin-bottom to .tool-group for spacing between categories
// and small visual gap between individual items
const old = `.tool-group {
            margin-bottom: 28px;
        }`;

const replacement = `.tool-group {
            margin-bottom: 20px;
        }
        .tool-list-item + .tool-list-item {
            margin-top: 0;
        }`;

// Also find .tool-group-items and add a small gap
const oldItems = `.tool-group-items {
            background: rgba(255,255,255,0.7);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 16px rgba(31,38,135,0.07);
            border: 1px solid rgba(255,255,255,0.5);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }`;

const newItems = `.tool-group-items {
            background: rgba(255,255,255,0.7);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 16px rgba(31,38,135,0.07);
            border: 1px solid rgba(255,255,255,0.5);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            display: flex;
            flex-direction: column;
            gap: 0;
        }`;

let newContent = content;
if (content.includes(old)) {
    newContent = newContent.replace(old, replacement);
    console.log('Replaced .tool-group margin.');
} else {
    console.log('WARN: .tool-group margin not found exactly.');
}

// Add margin-bottom on .tool-list-item for small spacing
const oldItem = `.tool-list-item {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 16px;
            cursor: pointer;
            transition: background 0.18s ease;
            border-bottom: 1px solid rgba(100,116,139,0.09);
            text-decoration: none;
            color: inherit;
            -webkit-tap-highlight-color: transparent;
        }`;

const newItem = `.tool-list-item {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 13px 16px;
            cursor: pointer;
            transition: background 0.18s ease, transform 0.15s ease;
            border-bottom: 1px solid rgba(100,116,139,0.09);
            text-decoration: none;
            color: inherit;
            -webkit-tap-highlight-color: transparent;
        }`;

if (newContent.includes(oldItem)) {
    newContent = newContent.replace(oldItem, newItem);
    console.log('Updated .tool-list-item.');
} else {
    console.log('WARN: .tool-list-item not found exactly. Trying partial...');
    // try just the padding part
    newContent = newContent.replace('padding: 14px 16px;', 'padding: 13px 16px;');
}

fs.writeFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', newContent, 'utf8');
console.log('Done! Spacing refined.');
