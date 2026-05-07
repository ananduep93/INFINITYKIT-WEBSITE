const fs = require('fs');
let css = fs.readFileSync('app.css', 'utf8');

css = css.replace(/:root\s*\{[\s\S]*?\}/, `:root {
    --primary-color: #007AFF;
    --primary-gradient: linear-gradient(135deg, #007AFF 0%, #0056b3 100%);
    --bg-gradient: #FAFAFC;
    --glass-bg: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(0, 0, 0, 0.05);
    --text-color: #1D1D1F;
    --text-secondary: #86868B;
    --neon-shadow: 0 4px 15px rgba(0, 122, 255, 0.15);
    --hover-neon: 0 8px 25px rgba(0, 122, 255, 0.25);
}`);

css = css.replace(/\[data-theme="light"\]\s*\{[\s\S]*?\}/, `[data-theme="light"] {
    --bg-gradient: #FFFFFF;
    --glass-bg: rgba(255, 255, 255, 0.85);
    --glass-border: rgba(0, 0, 0, 0.05);
    --text-color: #1D1D1F;
}`);

css = css.replace(/font-family:\s*'Segoe UI',\s*Tahoma,\s*Geneva,\s*Verdana,\s*sans-serif;/, "font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;");

if(!css.includes('@import url')) {
    css = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');\n" + css;
}

// Replace dark green orbs with blue and light gray
css = css.replace(/background:\s*#064439;/g, 'background: rgba(0, 122, 255, 0.6);');
css = css.replace(/background:\s*#0A5D4E;/g, 'background: rgba(0, 86, 179, 0.4);');
// Replace dark green text overrides with Apple grey
css = css.replace(/color:\s*#064439;/g, 'color: var(--text-color);');
css = css.replace(/color:\s*rgba\(6,\s*68,\s*57,/g, 'color: rgba(29, 29, 31,');

fs.writeFileSync('app.css', css);
