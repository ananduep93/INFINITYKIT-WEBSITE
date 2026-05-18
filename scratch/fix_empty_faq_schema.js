const fs = require('fs');
const path = require('path');

const dirPath = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\ai-tools';

if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(dirPath, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            const emptyFaqSchema = `    <script type="application/ld+json">
    {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": []
}
    </script>`;

            const emptyFaqSchemaAlt = `    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": []
    }
    </script>`;

            let modified = false;
            
            if (content.includes(emptyFaqSchema)) {
                content = content.replace(emptyFaqSchema, '');
                modified = true;
            } else if (content.includes(emptyFaqSchemaAlt)) {
                content = content.replace(emptyFaqSchemaAlt, '');
                modified = true;
            } else {
                // Try a regex to be safe
                const regex = /<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "FAQPage",\s*"mainEntity": \[\]\s*\}\s*<\/script>/;
                if (regex.test(content)) {
                    content = content.replace(regex, '');
                    modified = true;
                }
            }
            
            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Fixed empty FAQ schema in ${file}`);
            }
        }
    });
} else {
    console.error('Directory not found: ' + dirPath);
}
