const fs = require('fs');
let content = fs.readFileSync('main.js', 'utf8');

const regex = /const folderItems = Array\.isArray\(folder\.tools\) \? folder\.tools : \[\];\s+folderItems\.forEach\(itemId => \{/;

const newCode = `const toolItems = Array.isArray(folder.tools) ? folder.tools : [];
    const subFolderItems = Array.isArray(folder.subFolders) ? folder.subFolders : [];
    const allItems = [...subFolderItems, ...toolItems];
    
    allItems.forEach(itemId => {`;

if (regex.test(content)) {
    content = content.replace(regex, newCode);
    fs.writeFileSync('main.js', content);
    console.log('Successfully updated renderToolsInFolder using Regex');
} else {
    console.log('Target code still not found with Regex');
}
