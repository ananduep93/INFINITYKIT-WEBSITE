const fs = require('fs');
const path = require('path');

const toolsDir = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\tools';
const aiToolsDir = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\ai-tools';

const seoData = {
    'compressimage': {
        title: 'Free Online Image Compressor - Reduce File Size Instantly | Infinity Kit',
        description: 'Compress images online without losing quality. Reduce file size of JPG, PNG, and WebP images instantly for free with Infinity Kit.'
    },
    'imagetopdf': {
        title: 'Convert Image to PDF Online for Free - JPG to PDF | Infinity Kit',
        description: 'Easily convert JPG, PNG, and other images to PDF online for free. Fast, secure, and no installation required.'
    },
    'mergepdf': {
        title: 'Merge PDF Files Online - Combine PDFs for Free | Infinity Kit',
        description: 'Combine multiple PDF files into one document online for free. Fast, secure, and easy to use PDF merger.'
    },
    'passwordgen': {
        title: 'Secure Password Generator - Create Strong Passwords | Infinity Kit',
        description: 'Generate strong, secure, and random passwords instantly to protect your online accounts. Free and secure.'
    },
    'bmicalculator': {
        title: 'Free BMI Calculator Online - Check Your Body Mass Index | Infinity Kit',
        description: 'Calculate your Body Mass Index (BMI) instantly for free. Understand your health and weight status easily.'
    },
    'todolist': {
        title: 'Free Online To-Do List - Manage Your Daily Tasks | Infinity Kit',
        description: 'Stay organized with our free online to-do list. Create, manage, and track your daily tasks easily.'
    },
    'unitconverter': {
        title: 'Universal Unit Converter - Fast & Free Online Conversion | Infinity Kit',
        description: 'Convert units of length, weight, temperature, and more instantly. Free, fast, and accurate unit converter.'
    },
    'graphmaker': {
        title: 'Free Online Graph Maker - Create Charts Instantly | Infinity Kit',
        description: 'Create beautiful bar charts, line graphs, and pie charts online for free. Easy to use data visualization tool.'
    }
};

function processFile(filePath, isAiTool = false) {
    const filename = path.basename(filePath, '.html');
    if (filename === 'index') return; // Skip folder index

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extract current tool name from title or filename as fallback
    const titleMatch = content.match(/<title>(.*?) - Infinity Kit/);
    let toolName = titleMatch ? titleMatch[1] : filename;
    // Clean up tool name
    toolName = toolName.replace(/[^\w\s-]/g, '').trim();

    const data = seoData[filename] || {
        title: `${toolName} - Free Online Tool | Infinity Kit`,
        description: `Use our free online ${toolName} to improve your daily productivity. Fast, secure, and easy to use with Infinity Kit.`
    };

    // Update Title
    if (content.includes('<title>')) {
        content = content.replace(/<title>.*?<\/title>/, `<title>${data.title}</title>`);
    } else {
        content = content.replace('</head>', `    <title>${data.title}</title>\n</head>`);
    }
    
    // Update Meta Description
    if (content.includes('<meta name="description"')) {
        content = content.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${data.description}">`);
    } else {
        content = content.replace('</head>', `    <meta name="description" content="${data.description}">\n</head>`);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Optimized SEO for ${isAiTool ? 'ai-tools/' : 'tools/'}${filename}.html`);
}

// Process Tools
fs.readdir(toolsDir, (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (file.endsWith('.html')) processFile(path.join(toolsDir, file), false);
    });
});

// Process AI Tools
fs.readdir(aiToolsDir, (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (file.endsWith('.html')) processFile(path.join(aiToolsDir, file), true);
    });
});
