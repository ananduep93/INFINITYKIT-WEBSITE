/**
 * Infinity Kit - Advanced Suite Tools
 * High-performance, premium utilities for Power Users.
 */

// ==================== METADATA STRIPPER ====================
window.loadMetadataStripper = function() {
    const toolContent = document.getElementById('toolContent');
    let html = `
        <div class="tool-form">
            <div class="glass-panel" style="padding:30px; text-align:center; border: 2px dashed var(--primary-color);">
                <div style="font-size:3rem; margin-bottom:15px;">🕵️‍♂️</div>
                <h3>Privacy-First Metadata Stripper</h3>
                <p style="opacity:0.7; font-size:0.9rem; margin-bottom:20px;">Upload an image to remove EXIF data, GPS location, and camera info. Processing happens entirely in your browser.</p>
                
                <input type="file" id="stripInput" accept="image/*" style="display:none;" onchange="processMetadataStrip(this.files[0])">
                <button class="btn-primary" onclick="document.getElementById('stripInput').click()">Select Image to Clean</button>
            </div>
            
            <div id="stripResult" style="display:none; margin-top:30px; text-align:center;">
                <div class="glass-panel" style="padding:20px;">
                    <div style="color: #10b981; font-weight:bold; margin-bottom:15px;">✅ Image Cleaned Successfully!</div>
                    <img id="cleanPreview" style="max-width:100%; border-radius:12px; margin-bottom:20px; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
                    <button id="downloadCleanBtn" class="btn-primary" style="width:100%;">Download Protected Image</button>
                </div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
};

window.processMetadataStrip = function(file) {
    if (!file) return;
    showToast('Cleaning image...', 'info');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Redrawing to canvas and exporting to blob strips EXIF
            const cleanUrl = canvas.toDataURL('image/jpeg', 0.95);
            
            document.getElementById('cleanPreview').src = cleanUrl;
            document.getElementById('stripResult').style.display = 'block';
            
            document.getElementById('downloadCleanBtn').onclick = () => {
                const link = document.createElement('a');
                link.download = `cleaned_${file.name}`;
                link.href = cleanUrl;
                link.click();
                showToast('Image downloaded!', 'success');
            };
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

// ==================== FOCUS SOUNDSCAPE ====================
window.loadFocusSoundscape = function() {
    const toolContent = document.getElementById('toolContent');
    const sounds = [
        { id: 'rain', name: 'Summer Rain', icon: '🌧️', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }, // Placeholders for now
        { id: 'cafe', name: 'Paris Cafe', icon: '☕', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
        { id: 'white', name: 'Deep White Noise', icon: '💨', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
    ];

    let html = `
        <div class="tool-form" style="text-align:center;">
            <h3>Focus Soundscape</h3>
            <p style="opacity:0.7; margin-bottom:30px;">Premium ambient sounds for deep concentration.</p>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                ${sounds.map(s => `
                    <div class="glass-panel sound-card" onclick="toggleSound('${s.id}', '${s.url}')" id="card-${s.id}" style="padding:20px; cursor:pointer; transition:all 0.3s; border:1px solid transparent;">
                        <div style="font-size:2rem; margin-bottom:10px;">${s.icon}</div>
                        <div style="font-weight:bold;">${s.name}</div>
                        <div style="font-size:0.7rem; opacity:0.6; margin-top:5px;" id="status-${s.id}">Off</div>
                        <audio id="audio-${s.id}" loop src="${s.url}"></audio>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top:40px; padding:20px; background: rgba(1, 69, 242, 0.05); border-radius:20px;">
                <div style="font-size:0.8rem; font-weight:bold; margin-bottom:10px;">Master Volume</div>
                <input type="range" min="0" max="1" step="0.1" value="0.5" oninput="setMasterVolume(this.value)" style="width:100%;">
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
};

window.toggleSound = function(id, url) {
    const audio = document.getElementById(`audio-${id}`);
    const card = document.getElementById(`card-${id}`);
    const status = document.getElementById(`status-${id}`);
    
    if (audio.paused) {
        audio.play();
        card.style.borderColor = 'var(--primary-color)';
        card.style.background = 'rgba(1, 69, 242, 0.05)';
        status.textContent = 'Playing...';
        status.style.color = 'var(--primary-color)';
    } else {
        audio.pause();
        card.style.borderColor = 'transparent';
        card.style.background = 'rgba(255, 255, 255, 0.6)';
        status.textContent = 'Off';
        status.style.color = 'inherit';
    }
};

window.setMasterVolume = function(val) {
    document.querySelectorAll('audio').forEach(a => a.volume = val);
};

// ==================== JSON TO TYPESCRIPT ====================
window.loadJSONToTS = function() {
    const toolContent = document.getElementById('toolContent');
    let html = `
        <div class="tool-form">
            <div class="form-group">
                <label>Input JSON:</label>
                <textarea id="tsInput" placeholder='{"id": 1, "name": "Infinity"}' style="min-height:200px; font-family:monospace; font-size:0.9rem;"></textarea>
            </div>
            <button class="btn-primary" onclick="generateTS()" style="width:100%; margin-bottom:20px;">Generate Interfaces ⚡</button>
            
            <div id="tsResult" style="display:none;">
                <div class="form-group">
                    <label>TypeScript Interfaces:</label>
                    <textarea id="tsOutput" readonly style="min-height:250px; font-family:monospace; font-size:0.9rem; background: #f1f5f9; color: #1e293b;"></textarea>
                </div>
                <button class="btn-secondary" onclick="copyToClipboard(document.getElementById('tsOutput').value); showToast('Copied!')" style="width:100%;">Copy Code</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
};

window.generateTS = function() {
    const input = document.getElementById('tsInput').value.trim();
    if (!input) return;
    
    try {
        const obj = JSON.parse(input);
        let output = "export interface RootObject {\n";
        
        for (const [key, value] of Object.entries(obj)) {
            let type = typeof value;
            if (value === null) type = "any";
            else if (Array.isArray(value)) type = "any[]";
            else if (type === "object") type = "any";
            
            output += `  ${key}: ${type};\n`;
        }
        
        output += "}";
        
        document.getElementById('tsOutput').value = output;
        document.getElementById('tsResult').style.display = 'block';
    } catch (e) {
        showToast('Invalid JSON provided!', 'error');
    }
};

// ==================== BULK FILE RENAMER ====================
window.loadBulkRenamer = function() {
    const toolContent = document.getElementById('toolContent');
    let html = `
        <div class="tool-form">
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div class="form-group">
                    <label>Naming Pattern:</label>
                    <input type="text" id="renamePattern" placeholder="Photo_Trip" value="File">
                </div>
                <div class="form-group">
                    <label>Start Numbering At:</label>
                    <input type="number" id="renameStart" value="1">
                </div>
            </div>
            
            <div class="glass-panel" style="padding:30px; text-align:center; border: 2px dashed #cbd5e1;">
                <input type="file" id="bulkInput" multiple style="display:none;" onchange="updateBulkPreview(this.files)">
                <button onclick="document.getElementById('bulkInput').click()" class="btn-secondary">Step 1: Select Files</button>
                <div id="bulkFileCount" style="margin-top:10px; font-size:0.8rem; opacity:0.6;">0 files selected</div>
            </div>
            
            <div id="bulkActions" style="display:none; margin-top:20px;">
                <button class="btn-primary" onclick="processBulkRename()" style="width:100%;">Step 2: Rename & Download All ⚡</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
};

window.updateBulkPreview = function(files) {
    if (files.length === 0) return;
    document.getElementById('bulkFileCount').textContent = `${files.length} files selected`;
    document.getElementById('bulkActions').style.display = 'block';
    window.selectedBulkFiles = files;
};

window.processBulkRename = async function() {
    const files = window.selectedBulkFiles;
    const pattern = document.getElementById('renamePattern').value || 'File';
    let start = parseInt(document.getElementById('renameStart').value) || 1;
    
    showToast(`Renaming ${files.length} files...`, 'info');
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const newName = `${pattern}_${start.toString().padStart(3, '0')}.${ext}`;
        
        // Use a hidden link to trigger downloads
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = newName;
        link.click();
        
        start++;
        // Small delay to prevent browser overload
        await new Promise(r => setTimeout(r, 200));
    }
    
    showToast('All files processed!', 'success');
};

// ==================== e-SIGNATURE STUDIO ====================
window.loadESignature = function() {
    const toolContent = document.getElementById('toolContent');
    let html = `
        <div class="tool-form" style="text-align:center;">
            <h3>e-Signature Studio</h3>
            <p style="opacity:0.7; font-size:0.9rem; margin-bottom:20px;">Draw your signature below and download it as a transparent PNG.</p>
            
            <div class="glass-panel" style="padding:10px; background: white; margin-bottom:20px;">
                <canvas id="sigCanvas" style="width:100%; height:250px; cursor:crosshair; touch-action:none;"></canvas>
            </div>
            
            <div style="display:flex; gap:10px;">
                <button class="btn-secondary" onclick="clearSignature()" style="flex:1;">Clear Canvas</button>
                <button class="btn-primary" onclick="downloadSignature()" style="flex:1;">Download Signature ⚡</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
    initSignatureCanvas();
};

window.initSignatureCanvas = function() {
    const canvas = document.getElementById('sigCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    let drawing = false;
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    
    const start = (e) => { drawing = true; draw(e); };
    const end = () => { drawing = false; ctx.beginPath(); };
    const draw = (e) => {
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };
    
    canvas.onmousedown = start; canvas.ontouchstart = start;
    window.onmouseup = end; window.ontouchend = end;
    canvas.onmousemove = draw; canvas.ontouchmove = draw;
};

window.clearSignature = function() {
    const canvas = document.getElementById('sigCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

window.downloadSignature = function() {
    const canvas = document.getElementById('sigCanvas');
    const link = document.createElement('a');
    link.download = 'signature_infinity.png';
    link.href = canvas.toDataURL();
    link.click();
    showToast('Signature downloaded!', 'success');
};

// ==================== DYNAMIC QR GEN ====================
window.loadDynamicQR = function() {
    const toolContent = document.getElementById('toolContent');
    let html = `
        <div class="tool-form">
            <div class="form-group">
                <label>Content (URL or Text):</label>
                <input type="text" id="qrText" placeholder="https://infinitykit.online" oninput="updateQR()">
            </div>
            <div class="form-group">
                <label>QR Color:</label>
                <input type="color" id="qrColor" value="#0145F2" oninput="updateQR()">
            </div>
            
            <div id="qrResult" style="text-align:center; margin:30px 0;">
                <div id="qrOutput" style="display:inline-block; padding:20px; background:white; border-radius:15px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);"></div>
            </div>
            
            <button class="btn-primary" onclick="downloadQR()" style="width:100%;">Download QR Code ⚡</button>
        </div>
    `;
    toolContent.innerHTML = html;
    updateQR();
};

window.updateQR = function() {
    const text = document.getElementById('qrText').value || 'Infinity Kit';
    const color = document.getElementById('qrColor').value;
    const output = document.getElementById('qrOutput');
    output.innerHTML = '';
    
    // Using a fast, public QR API for high-quality renders
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}&color=${color.substring(1)}&bgcolor=ffffff`;
    const img = new Image();
    img.src = url;
    img.id = "generatedQR";
    img.style.maxWidth = "100%";
    output.appendChild(img);
};

window.downloadQR = function() {
    const img = document.getElementById('generatedQR');
    const link = document.createElement('a');
    link.download = 'qr_code_infinity.png';
    link.href = img.src;
    // Cross-origin fix for direct downloads
    fetch(img.src).then(res => res.blob()).then(blob => {
        link.href = URL.createObjectURL(blob);
        link.click();
    });
    showToast('QR Code saved!', 'success');
};

// ==================== SVG OPTIMIZER ====================
window.loadSVGOptimizer = function() {
    const toolContent = document.getElementById('toolContent');
    let html = `
        <div class="tool-form">
            <div class="form-group">
                <label>Paste SVG Code:</label>
                <textarea id="svgInput" placeholder='<svg xmlns="http://www.w3.org/2000/svg" ...' style="min-height:200px; font-family:monospace; font-size:0.8rem;"></textarea>
            </div>
            <button class="btn-primary" onclick="optimizeSVG()" style="width:100%; margin-bottom:20px;">Optimize Path Data ⚡</button>
            
            <div id="svgResult" style="display:none;">
                <div class="form-group">
                    <label>Optimized SVG:</label>
                    <textarea id="svgOutput" readonly style="min-height:200px; font-family:monospace; font-size:0.8rem; background: #f1f5f9;"></textarea>
                </div>
                <div id="svgStats" style="font-size:0.8rem; opacity:0.7; margin-bottom:15px;"></div>
                <button class="btn-secondary" onclick="copyToClipboard(document.getElementById('svgOutput').value); showToast('Copied!')" style="width:100%;">Copy Optimized SVG</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
};

window.optimizeSVG = function() {
    const input = document.getElementById('svgInput').value.trim();
    if (!input) return;
    
    // Basic optimization logic (remove comments, excessive whitespace, and non-essential attrs)
    let optimized = input
        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
        .replace(/>\s+</g, '><')         // Remove whitespace between tags
        .replace(/\s{2,}/g, ' ')        // Collapse multiple spaces
        .replace(/\s\/>/g, '/>')        // Clean self-closing tags
        .trim();
    
    const originalSize = input.length;
    const newSize = optimized.length;
    const saved = (((originalSize - newSize) / originalSize) * 100).toFixed(1);
    
    document.getElementById('svgOutput').value = optimized;
    document.getElementById('svgStats').textContent = `Size reduced from ${originalSize}B to ${newSize}B (Saved ${saved}%)`;
    document.getElementById('svgResult').style.display = 'block';
    showToast('Optimization complete!', 'success');
};

// ==================== PASSWORD LEAK SCANNER ====================
window.loadPasswordLeak = function() {
    const toolContent = document.getElementById('toolContent');
    let html = `
        <div class="tool-form">
            <div class="form-group">
                <label>Check Password Security:</label>
                <input type="password" id="leakInput" placeholder="Enter password to scan...">
            </div>
            <button class="btn-primary" onclick="scanForLeaks()" style="width:100%; margin-bottom:20px;">Scan Global Breaches 🔓</button>
            
            <div id="leakResult" style="display:none; text-align:center; padding:20px; border-radius:15px;">
                <div id="leakIcon" style="font-size:3rem; margin-bottom:10px;"></div>
                <div id="leakTitle" style="font-weight:bold; font-size:1.2rem; margin-bottom:5px;"></div>
                <div id="leakDesc" style="font-size:0.9rem; opacity:0.8;"></div>
            </div>
            
            <p style="font-size:0.75rem; opacity:0.6; margin-top:20px; text-align:center;">🔒 Privacy Note: Your password is hashed locally. We only send the first 5 characters of the hash to the security database (k-Anonymity).</p>
        </div>
    `;
    toolContent.innerHTML = html;
};

window.scanForLeaks = async function() {
    const pwd = document.getElementById('leakInput').value;
    if (!pwd) return;
    
    showToast('Scanning database...', 'info');
    
    try {
        // 1. Hash the password locally (SHA-1)
        const msgBuffer = new TextEncoder().encode(pwd);
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        
        const prefix = hashHex.substring(0, 5);
        const suffix = hashHex.substring(5);
        
        // 2. Fetch hashes starting with the same prefix
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        const data = await response.text();
        
        // 3. Check if suffix exists in results
        const lines = data.split('\n');
        let count = 0;
        for (let line of lines) {
            if (line.startsWith(suffix)) {
                count = parseInt(line.split(':')[1]);
                break;
            }
        }
        
        const resultDiv = document.getElementById('leakResult');
        const icon = document.getElementById('leakIcon');
        const title = document.getElementById('leakTitle');
        const desc = document.getElementById('leakDesc');
        
        resultDiv.style.display = 'block';
        if (count > 0) {
            resultDiv.style.background = 'rgba(239, 68, 68, 0.1)';
            icon.textContent = '⚠️';
            title.textContent = 'Password Exposed!';
            title.style.color = '#ef4444';
            desc.textContent = `This password has appeared in ${count.toLocaleString()} data breaches. Change it immediately!`;
        } else {
            resultDiv.style.background = 'rgba(16, 185, 129, 0.1)';
            icon.textContent = '🛡️';
            title.textContent = 'Safe & Secure';
            title.style.color = '#10b981';
            desc.textContent = 'No matches found in known data breaches. This password is safe to use.';
        }
        
    } catch (e) {
        showToast('Error connecting to security service.', 'error');
    }
};

// ==================== DEAD DROP NOTE ====================
window.loadEncryptedNote = function() {
    const toolContent = document.getElementById('toolContent');
    let html = `
        <div class="tool-form">
            <div class="form-group">
                <label>Secret Message:</label>
                <textarea id="noteText" placeholder="Write your secret note here..." style="min-height:150px;"></textarea>
            </div>
            <div class="form-group">
                <label>Encryption Key:</label>
                <input type="text" id="noteKey" placeholder="A strong password...">
            </div>
            <button class="btn-primary" onclick="encryptNote()" style="width:100%; margin-bottom:20px;">Lock & Encrypt 🔐</button>
            
            <div id="noteResult" style="display:none;">
                <div class="form-group">
                    <label>Encrypted Data:</label>
                    <textarea id="noteOutput" readonly style="min-height:100px; font-family:monospace; background:#f1f5f9;"></textarea>
                </div>
                <button class="btn-secondary" onclick="copyToClipboard(document.getElementById('noteOutput').value); showToast('Locked Note Copied!')" style="width:100%;">Copy Encrypted Note</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
};

window.encryptNote = function() {
    const text = document.getElementById('noteText').value;
    const key = document.getElementById('noteKey').value;
    if (!text || !key) return showToast('Need both note and key!', 'error');
    
    // Simple XOR-based encryption (Base64 safe)
    let output = "";
    for (let i = 0; i < text.length; i++) {
        output += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    
    document.getElementById('noteOutput').value = btoa(output);
    document.getElementById('noteResult').style.display = 'block';
    showToast('Note encrypted!', 'success');
};

// ==================== INFINITY TIMER ====================
window.loadFocusTimer = function() {
    const toolContent = document.getElementById('toolContent');
    let html = `
        <div class="tool-form" style="text-align:center;">
            <div style="position:relative; width:200px; height:200px; margin:0 auto 30px;">
                <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(1, 69, 242, 0.1)" stroke-width="8" />
                    <circle id="timerProgress" cx="100" cy="100" r="90" fill="none" stroke="var(--primary-color)" stroke-width="8" stroke-dasharray="565.48" stroke-dashoffset="0" style="transition: stroke-dashoffset 1s linear; transform: rotate(-90deg); transform-origin: center;" />
                </svg>
                <div id="timerDisplay" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:3rem; font-weight:900; color:var(--primary-color);">25:00</div>
            </div>
            
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:20px;">
                <button onclick="setTimer(25)" class="btn-secondary" style="padding:10px 20px;">Pomodoro</button>
                <button onclick="setTimer(5)" class="btn-secondary" style="padding:10px 20px;">Break</button>
            </div>
            
            <button id="timerBtn" onclick="toggleTimer()" class="btn-primary" style="width:100%; font-size:1.2rem;">Start Session ⚡</button>
        </div>
    `;
    toolContent.innerHTML = html;
    window.timerSeconds = 25 * 60;
    window.timerTotal = 25 * 60;
    window.timerInterval = null;
};

window.setTimer = function(mins) {
    clearInterval(window.timerInterval);
    window.timerSeconds = mins * 60;
    window.timerTotal = mins * 60;
    updateTimerUI();
    document.getElementById('timerBtn').textContent = 'Start Session ⚡';
};

window.toggleTimer = function() {
    const btn = document.getElementById('timerBtn');
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
        window.timerInterval = null;
        btn.textContent = 'Resume ⚡';
    } else {
        btn.textContent = 'Pause ⏸️';
        window.timerInterval = setInterval(() => {
            window.timerSeconds--;
            updateTimerUI();
            if (window.timerSeconds <= 0) {
                clearInterval(window.timerInterval);
                showToast('Time is up! Great work.', 'success');
                new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3').play(); // Placeholder alert
            }
        }, 1000);
    }
};

window.updateTimerUI = function() {
    const display = document.getElementById('timerDisplay');
    const progress = document.getElementById('timerProgress');
    
    const mins = Math.floor(window.timerSeconds / 60);
    const secs = window.timerSeconds % 60;
    display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const offset = 565.48 * (1 - window.timerSeconds / window.timerTotal);
    progress.style.strokeDashoffset = offset;
};


