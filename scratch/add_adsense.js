const fs = require('fs');
const path = require('path');

const adsenseCode = `
    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8795968572402515"
     crossorigin="anonymous"></script>
`;

const files = [
    'tools/mysurveys.html',
    'tools/publicsurvey.html',
    'tools/responseviewer.html',
    'tools/surveybuilder.html',
    'folder/data-tools.html',
    'folder/decision-tools.html',
    'folder/expense-tracker.html',
    'folder/health-utility-hub.html',
    'folder/image.html',
    'folder/planner-tools.html',
    'folder/quick-tools.html',
    'folder/student-tools.html',
    'folder/survey-hub.html',
    'folder/text-tools.html',
    'folder/time-tools.html',
    'folder/utilities.html',
    'folder/web-tools.html'
];

const basePath = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT';

files.forEach(file => {
    const filePath = path.join(basePath, file);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already contains AdSense
    if (content.includes('ca-pub-8795968572402515')) {
        console.log(`Skipping ${file}: AdSense already present.`);
        return;
    }

    // Insert after <meta name="viewport" ...> or <title> or <head>
    const insertionPoint = content.indexOf('</title>');
    if (insertionPoint !== -1) {
        const afterTitle = insertionPoint + '</title>'.length;
        const newContent = content.slice(0, afterTitle) + adsenseCode + content.slice(afterTitle);
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated ${file}`);
    } else {
        console.log(`Could not find insertion point in ${file}`);
    }
});
