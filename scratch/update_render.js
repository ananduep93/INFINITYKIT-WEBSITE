const fs = require('fs');
let content = fs.readFileSync('main.js', 'utf8');

const oldCode = `    const folderItems = Array.isArray(folder.tools) ? folder.tools : [];
    folderItems.forEach(itemId => {`;

const newCode = `    const toolItems = Array.isArray(folder.tools) ? folder.tools : [];
    const subFolderItems = Array.isArray(folder.subFolders) ? folder.subFolders : [];
    const allItems = [...subFolderItems, ...toolItems];
    
    allItems.forEach(itemId => {`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync('main.js', content);
    console.log('Successfully updated renderToolsInFolder');
} else {
    console.log('Target code not found in main.js');
}
