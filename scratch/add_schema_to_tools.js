const fs = require('fs');
const path = require('path');

const toolsDir = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\ai-tools';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has schema
    if (content.includes('application/ld+json')) {
        console.log(`Skipping ${path.basename(filePath)} (already has schema)`);
        return;
    }

    // Extract Tool Name
    const titleMatch = content.match(/<title>(.*?) - Infinity Kit/);
    const toolName = titleMatch ? titleMatch[1] : path.basename(filePath, '.html');

    // Extract Description
    const descMatch = content.match(/<meta name="description" content="(.*?)">/);
    const description = descMatch ? descMatch[1] : `Free online tool from Infinity Kit.`;

    // Extract FAQs
    const faqs = [];
    const faqRegex = /<div class="faq-question">\s*(?:Q:\s*)?(.*?)\s*(?:<span|<\/div>)[\s\S]*?<div class="faq-answer">\s*(.*?)\s*<\/div>/g;
    
    let match;
    while ((match = faqRegex.exec(content)) !== null) {
        let q = match[1].trim();
        let a = match[2].trim();
        // Clean up any remaining HTML tags or arrows in question
        q = q.replace(/<[^>]*>/g, '').trim();
        faqs.push({ q, a });
    }

    if (faqs.length === 0) {
        console.log(`No FAQs found in ${path.basename(filePath)}`);
    }

    // Generate Schema
    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": toolName,
        "operatingSystem": "All",
        "applicationCategory": "ProductivityApplication", // Default
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": description
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": f.a
            }
        }))
    };

    const schemaHTML = `
    <!-- Schema Markup -->
    <script type="application/ld+json">
    ${JSON.stringify(softwareSchema, null, 2)}
    </script>
    <script type="application/ld+json">
    ${JSON.stringify(faqSchema, null, 2)}
    </script>
`;

    // Insert before </head>
    if (content.includes('</head>')) {
        content = content.replace('</head>', `${schemaHTML}</head>`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${path.basename(filePath)} with ${faqs.length} FAQs`);
    } else {
        console.log(`Could not find </head> in ${path.basename(filePath)}`);
    }
}

// Read all files in tools dir
fs.readdir(toolsDir, (err, files) => {
    if (err) {
        console.error("Error reading directory:", err);
        return;
    }
    files.forEach(file => {
        if (file.endsWith('.html')) {
            processFile(path.join(toolsDir, file));
        }
    });
});
