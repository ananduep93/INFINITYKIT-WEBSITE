const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT';
const toolsDir = path.join(baseDir, 'tools');
const folderDir = path.join(baseDir, 'folder');
const aiToolsDir = path.join(baseDir, 'ai-tools');

const newFooter = `    <!-- Global Footer -->
    <footer class="footer">
        <div class="container footer-grid">
            <div class="footer-brand">
                <h2 style="font-family: 'Pacifico', cursive; font-size: 2.5rem; margin-bottom: 15px;">Infinity Kit</h2>
                <p>Made for everyday tools ⚡ Your all-in-one digital utility hub to simplify your digital life.</p>
                <div class="social-links">
                    <a href="https://www.instagram.com/infinitykit.online" target="_blank"><i class="fab fa-instagram"></i></a>
                    <a href="https://www.linkedin.com" target="_blank"><i class="fab fa-linkedin-in"></i></a>
                    <a href="https://github.com" target="_blank"><i class="fab fa-github"></i></a>
                </div>
            </div>
            <div class="footer-links">
                <h3>Quick Links</h3>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/blog">Blog</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/privacy-policy">Privacy Policy</a></li>
                    <li><a href="/terms-conditions">Terms & Conditions</a></li>
                </ul>
            </div>
            <div class="footer-contact">
                <h3>Contact Us</h3>
                <ul>
                    <li><i class="fas fa-globe"></i> Online, Worldwide</li>
                    <li><i class="fas fa-bolt"></i> 24/7 Availability</li>
                    <li><i class="fas fa-envelope"></i> infinitykit24@gmail.com</li>
                </ul>
            </div>
        </div>

        <div id="footerPwaContainer" class="footer-pwa-container" style="display: none;">
            <button id="footerInstallBtn" class="footer-install-btn">
                <span id="footerDownloadText">📲 Download App</span>
            </button>
        </div>

        <div class="footer-bottom">
            <p id="copyrightText" class="copyright-text">&copy; 2026 Infinity Kit. All rights reserved.</p>
        </div>
    </footer>`;

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find footer block
    const footerRegex = /<footer class="footer">([\s\S]*?)<\/footer>/;
    
    if (footerRegex.test(content)) {
        content = content.replace(footerRegex, newFooter);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated footer in: ${filePath}`);
    } else {
        console.log(`No footer found in: ${filePath}`);
    }
}

// Process root HTML files
fs.readdirSync(baseDir).forEach(file => {
    if (file.endsWith('.html')) {
        processFile(path.join(baseDir, file));
    }
});

// Process tools
if (fs.existsSync(toolsDir)) {
    fs.readdirSync(toolsDir).forEach(file => {
        if (file.endsWith('.html')) {
            processFile(path.join(toolsDir, file));
        }
    });
}

// Process folder
if (fs.existsSync(folderDir)) {
    fs.readdirSync(folderDir).forEach(file => {
        if (file.endsWith('.html')) {
            processFile(path.join(folderDir, file));
        }
    });
}

// Process ai-tools
if (fs.existsSync(aiToolsDir)) {
    fs.readdirSync(aiToolsDir).forEach(file => {
        if (file.endsWith('.html')) {
            processFile(path.join(aiToolsDir, file));
        }
    });
}

console.log('All footers updated successfully!');
