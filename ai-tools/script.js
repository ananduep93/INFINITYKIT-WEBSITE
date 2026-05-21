import { db, auth, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, limit, deleteDoc, doc } from '../firebase-config.js';
import { authService } from '../auth.js';

// Dynamic API Endpoint router helper for local static servers
function getApiEndpoint(path) {
    const hostname = window.location.hostname;
    const port = window.location.port;
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && port !== '3000' && port !== '') {
        return `https://infinitykit.online${path}`;
    }
    return path;
}


// Local guest trial check and premium modal
function checkAndIncrementTrial() {
    const user = auth.currentUser;
    if (user && !user.isAnonymous) {
        return true;
    }
    
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('infinity_trial_date');
    let count = parseInt(localStorage.getItem('infinity_trial_count') || '0', 10);
    
    if (storedDate !== today) {
        localStorage.setItem('infinity_trial_date', today);
        count = 0;
        localStorage.setItem('infinity_trial_count', '0');
    }
    
    if (count >= 3) {
        showLoginPromptModal();
        return false;
    }
    
    count++;
    localStorage.setItem('infinity_trial_count', count.toString());
    return true;
}

function showLoginPromptModal() {
    if (document.getElementById('infinity-auth-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'infinity-auth-modal';
    modal.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 23, 42, 0.3);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: modalFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    const card = document.createElement('div');
    card.style = `
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
        border-radius: 28px;
        padding: 40px 30px;
        width: 100%;
        max-width: 440px;
        text-align: center;
        box-sizing: border-box;
        transform: scale(0.9);
        animation: cardZoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    `;

    card.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 16px; animation: bounce 2s infinite;">⚡</div>
        <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0 0 10px; color: #0f172a; background: linear-gradient(135deg, #3B82F6, #8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Daily Limit Reached</h2>
        <p style="font-size: 0.95rem; line-height: 1.6; color: #475569; margin: 0 0 28px; padding: 0 10px;">
            Guests enjoy up to 3 generations per day. Sign in with your Google account to unlock **unlimited** access, save your generation history, and use advanced tools for free!
        </p>
        <button id="modal-google-btn" style="
            width: 100%;
            padding: 14px 20px;
            border-radius: 16px;
            border: none;
            background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
            color: white;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.2s;
            margin-bottom: 12px;
        ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
        </button>
        <button id="modal-cancel-btn" style="
            width: 100%;
            padding: 14px 20px;
            border-radius: 16px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: white;
            color: #475569;
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
        ">
            Cancel
        </button>
        <style>
            @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes cardZoomIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-6px); }
            }
            #modal-google-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
            }
            #modal-cancel-btn:hover {
                background: #f8fafc;
                border-color: rgba(0, 0, 0, 0.12);
            }
        </style>
    `;

    modal.appendChild(card);
    document.body.appendChild(modal);

    const googleBtn = card.querySelector('#modal-google-btn');
    googleBtn.onclick = async () => {
        try {
            googleBtn.disabled = true;
            googleBtn.innerHTML = 'Signing in...';
            await authService.loginWithGoogle();
            modal.remove();
            location.reload();
        } catch (err) {
            console.error("Google login failed inside modal:", err);
            googleBtn.disabled = false;
            googleBtn.innerHTML = `Continue with Google`;
            alert("Login failed. Please try again.");
        }
    };

    const cancelBtn = card.querySelector('#modal-cancel-btn');
    cancelBtn.onclick = () => {
        modal.remove();
    };
}

// Local state for conversation memory
let chatContext = [];
let activeSessionId = null; // Tracks current sidebar session if selected

const AITools = {
    /**
     * Unified backend-only request router to secure Gemini endpoints
     */
    async ask(type, payload) {
        if (!checkAndIncrementTrial()) {
            return null;
        }
        try {
            this.setLoading(true);
            
            // Get Firebase ID token for secure backend authentication
            const user = auth.currentUser;
            let idToken = null;
            if (user) {
                idToken = await user.getIdToken();
            }

            let endpoint = getApiEndpoint('/api/askAI');
            let requestBody = { type, ...payload };

            // Image endpoint secure proxying or askAI matching
            if (type === 'image') {
                endpoint = getApiEndpoint('/api/askAI');
                requestBody = { type: 'image', prompt: payload.prompt };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': idToken ? `Bearer ${idToken}` : ''
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `AI request failed with status ${response.status}`);
            }

            const data = await response.json();
            const resultText = data.result;

            if (!resultText) throw new Error('AI was unable to generate a response.');

            // Save to Firebase History
            this.saveToHistory(type, payload, resultText);

            return resultText;
        } catch (error) {
            console.error('AI Error:', error);
            this.showError(error.message);
            return null;
        } finally {
            this.setLoading(false);
        }
    },

    /**
     * Reusable progressive chunk stream fetcher mapping SSE directly to output elements
     */
    async askStream({ type, payload, outputEl, resultCardEl, btnEl, isChat = false }) {
        if (!checkAndIncrementTrial()) {
            return null;
        }

        let originalBtnText = "";
        if (btnEl) {
            originalBtnText = btnEl.textContent;
            btnEl.disabled = true;
            btnEl.textContent = 'Streaming...';
        }

        // Show typing skeletons/containers
        if (resultCardEl) resultCardEl.style.display = 'block';
        outputEl.innerHTML = `
            <div class="skeleton-typing" style="display:flex;flex-direction:column;gap:8px;width:150px;padding:5px;">
                <div style="height:10px;background:rgba(0,0,0,0.06);border-radius:4px;width:100%;animation:pulse 1.5s infinite;"></div>
                <div style="height:10px;background:rgba(0,0,0,0.06);border-radius:4px;width:75%;animation:pulse 1.5s infinite;"></div>
            </div>
            <style>@keyframes pulse{0%{opacity:0.6}50%{opacity:0.3}100%{opacity:0.6}}</style>
        `;

        try {
            const user = auth.currentUser;
            let idToken = null;
            if (user) {
                idToken = await user.getIdToken();
            }

            let endpoint = getApiEndpoint('/api/ai/chat');
            let requestBody = {};

            if (type === 'chat') {
                endpoint = getApiEndpoint('/api/ai/chat');
                requestBody = { message: payload.message, context: chatContext.slice(-8), stream: true };
            } else if (['improve', 'summarize', 'translate'].includes(type)) {
                endpoint = getApiEndpoint('/api/ai/generate');
                requestBody = { text: payload.text, tool: type, targetLanguage: payload.targetLanguage, stream: true };
            } else if (type === 'code') {
                endpoint = getApiEndpoint('/api/ai/code');
                requestBody = { code: payload.text, stream: true };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': idToken ? `Bearer ${idToken}` : ''
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server connection failed (Status ${response.status})`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let resultText = "";
            let lineBuffer = ""; // Buffers incomplete chunks

            // Clear skeletons
            outputEl.innerHTML = "";

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value || new Uint8Array(), { stream: !done });
                
                lineBuffer += chunkValue;
                const lines = lineBuffer.split('\n');
                
                // Buffer the last potentially incomplete line
                lineBuffer = lines.pop() || "";
                
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;
                    
                    if (trimmed.startsWith('data: ')) {
                        const dataStr = trimmed.slice(6).trim();
                        if (dataStr === '[DONE]') {
                            done = true;
                            break;
                        }
                        
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.error) throw new Error(parsed.error);
                            if (parsed.text) {
                                resultText += parsed.text;
                                this.renderMarkdown(resultText, outputEl);
                                
                                // Scroll container if chat
                                if (isChat) {
                                    const chatContainer = document.getElementById('chatHistory');
                                    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
                                }
                            }
                        } catch (e) {
                            console.warn("SSE JSON Parse warning:", e, "on line:", trimmed);
                        }
                    }
                }
            }

            // Save completed output to Firebase
            this.saveToHistory(type, payload, resultText);

            if (isChat) {
                chatContext.push({ role: 'user', content: payload.message });
                chatContext.push({ role: 'ai', content: resultText });
                
                // Add action triggers (Regenerate, Copy)
                appendActionTriggers(outputEl, resultText, payload.message);
                
                // Reload Sidebar History
                loadSidebarHistory();
            }

            return resultText;

        } catch (error) {
            console.error('Streaming AI Error:', error);
            this.showError(error.message);
            
            outputEl.innerHTML = `
                <div style="color:#EF4444;font-weight:600;display:flex;align-items:center;gap:10px;padding:10px;">
                    ⚠️ Error: ${error.message || 'Stream processing failed.'}
                    <button class="chat-retry-btn" style="background:#3B82F6;color:white;border:none;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:0.8rem;font-weight:600;box-shadow:0 2px 6px rgba(59,130,246,0.2);">Retry</button>
                </div>
            `;
            const retryBtn = outputEl.querySelector('.chat-retry-btn');
            if (retryBtn) {
                retryBtn.onclick = () => {
                    this.askStream({ type, payload, outputEl, resultCardEl, btnEl, isChat });
                };
            }
            return null;
        } finally {
            if (btnEl) {
                btnEl.disabled = false;
                btnEl.textContent = originalBtnText;
            }
        }
    },

    /**
     * Save AI query history securely to Firestore
     */
    async saveToHistory(type, payload, result) {
        const user = auth.currentUser;
        if (!user) return;

        try {
            await addDoc(collection(db, 'ai_history'), {
                userId: user.uid,
                tool: type,
                input: payload.message || payload.text || payload.prompt || payload.code,
                output: result,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.warn('Error saving history:', e);
        }
    },

    /**
     * Elegant Glassmorphism Loading State Overlay (used for static actions like image generation)
     */
    setLoading(isLoading) {
        const overlay = document.getElementById('toolLoadingOverlay') || this.createLoadingOverlay();
        overlay.style.display = isLoading ? 'flex' : 'none';
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = isLoading);
    },

    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'toolLoadingOverlay';
        overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.6);display:none;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(8px);flex-direction:column;gap:15px;color:white;';
        overlay.innerHTML = `
            <div class="spinner" style="width:50px;height:50px;border:5px solid rgba(255,255,255,0.1);border-top:5px solid #3B82F6;border-radius:50%;animation:spin 1s linear infinite;"></div>
            <div style="font-family:'Outfit',sans-serif;font-weight:600;font-size:1.1rem;letter-spacing:0.5px;">Infinity AI processing...</div>
            <style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>
        `;
        document.body.appendChild(overlay);
        return overlay;
    },

    /**
     * Sleek Toast Notification System
     */
    showError(message) {
        const toast = document.createElement('div');
        toast.style = 'position:fixed;bottom:20px;right:20px;background:#EF4444;color:white;padding:16px 24px;border-radius:16px;box-shadow:0 10px 25px rgba(239,68,68,0.2);z-index:10000;font-family:\'Outfit\',sans-serif;font-weight:600;display:flex;align-items:center;gap:10px;animation:slideIn 0.3s ease;';
        toast.innerHTML = `<span>⚠️</span> <span>AI Error: ${message}</span>`;
        
        const style = document.createElement('style');
        style.innerHTML = `@keyframes slideIn{from{transform:translateY(100px);opacity:0}to{transform:translateY(0);opacity:1}}`;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    /**
     * Markdown rendering with support for code syntax highlights
     */
    renderMarkdown(text, element) {
        if (typeof marked !== 'undefined') {
            element.innerHTML = marked.parse(text);
            // Re-apply syntax highlights using Highlight.js if loaded
            if (typeof hljs !== 'undefined') {
                element.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
            this.addCodeCopyButtons(element);
        } else {
            element.textContent = text;
        }
    },

    /**
     * Elegant Floating Copy Buttons for all Code Blocks
     */
    addCodeCopyButtons(container) {
        container.querySelectorAll('pre').forEach((pre) => {
            if (pre.querySelector('.code-copy-btn')) return;
            
            pre.style.position = 'relative';
            const btn = document.createElement('button');
            btn.className = 'code-copy-btn';
            btn.style = 'position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.15);border:none;border-radius:8px;padding:6px 12px;color:white;font-size:0.75rem;cursor:pointer;font-weight:600;backdrop-filter:blur(4px);transition:all 0.2s;z-index:10;';
            btn.innerHTML = '📋 Copy';
            
            btn.onmouseover = () => btn.style.background = 'rgba(255,255,255,0.3)';
            btn.onmouseout = () => btn.style.background = 'rgba(255,255,255,0.15)';
            
            btn.onclick = (e) => {
                e.stopPropagation();
                const code = pre.querySelector('code').innerText;
                navigator.clipboard.writeText(code).then(() => {
                    btn.innerHTML = '✅ Copied!';
                    setTimeout(() => btn.innerHTML = '📋 Copy', 2000);
                });
            };
            pre.appendChild(btn);
        });
    }
};

// Export to window object for legacy static inline bindings
window.askAI = (type, data) => {
    if (typeof data === 'string') {
        const payload = type === 'chat' ? { message: data } : (type === 'image' ? { prompt: data } : { text: data });
        return AITools.ask(type, payload);
    }
    return AITools.ask(type, data);
};

// History Restore and Panel UI Overlay
async function showHistory(toolType) {
    const user = auth.currentUser;
    if (!user) return AITools.showError('Please sign in to see your history.');

    const historyOverlay = document.createElement('div');
    historyOverlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.4);display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px;backdrop-filter:blur(10px);animation:fadeIn 0.3s ease;';
    historyOverlay.id = 'history-overlay';
    
    const panel = document.createElement('div');
    panel.style = 'background:rgba(255,255,255,0.85);width:100%;max-width:600px;max-height:80vh;border-radius:30px;padding:35px;overflow-y:auto;position:relative;box-shadow: 0 30px 60px rgba(0,0,0,0.15);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.5);font-family:\'Outfit\',sans-serif;';
    panel.innerHTML = `
        <h2 style="margin-top:0;font-weight:800;background:linear-gradient(135deg,#3B82F6,#8B5CF6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">📜 ${toolType.charAt(0).toUpperCase() + toolType.slice(1)} History</h2>
        <button id="close-history" style="position:absolute;top:25px;right:25px;border:none;background:rgba(0,0,0,0.05);width:36px;height:36px;border-radius:50%;font-size:1.1rem;cursor:pointer;color:#64748B;display:flex;align-items:center;justify-content:center;transition:all 0.2s;">✕</button>
        <div id="history-list" style="margin-top:25px;">Loading...</div>
    `;
    
    historyOverlay.appendChild(panel);
    document.body.appendChild(historyOverlay);

    const closeBtn = document.getElementById('close-history');
    closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(0,0,0,0.1)';
    closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(0,0,0,0.05)';
    closeBtn.onclick = () => historyOverlay.remove();
    historyOverlay.onclick = (e) => { if(e.target === historyOverlay) historyOverlay.remove(); };

    try {
        const q = query(
            collection(db, 'ai_history'), 
            where('userId', '==', user.uid),
            where('tool', '==', toolType),
            orderBy('timestamp', 'desc'),
            limit(20)
        );
        const snapshot = await getDocs(q);
        const list = document.getElementById('history-list');
        list.innerHTML = '';

        if (snapshot.empty) {
            list.innerHTML = '<div style="color:#64748B;text-align:center;padding:50px 0;font-weight:500;">No history sessions found yet.</div>';
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const item = document.createElement('div');
            item.style = 'padding:18px;border:1px solid rgba(0,0,0,0.06);background:rgba(255,255,255,0.5);border-radius:20px;margin-bottom:14px;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 10px rgba(0,0,0,0.01);';
            item.onmouseover = () => {
                item.style.borderColor = '#3B82F6';
                item.style.background = 'rgba(255,255,255,0.9)';
            };
            item.onmouseout = () => {
                item.style.borderColor = 'rgba(0,0,0,0.06)';
                item.style.background = 'rgba(255,255,255,0.5)';
            };
            
            const inputPreview = data.input ? (data.input.length > 55 ? data.input.substring(0, 55) + '...' : data.input) : 'No input';
            const outputPreview = data.output ? (data.output.length > 110 ? data.output.substring(0, 110) + '...' : data.output) : 'No output';
            
            item.innerHTML = `<p style="font-weight:700;margin-bottom:8px;font-size:0.95rem;color:#3B82F6;margin-top:0;">Prompt: ${inputPreview}</p><div style="font-size:0.88rem;color:#1E293B;background:rgba(0,0,0,0.03);padding:14px;border-radius:14px;line-height:1.5;">${outputPreview}</div>`;
            
            item.onclick = () => {
                const outputEl = document.getElementById('text-output') || document.getElementById('textOutput') || document.getElementById('summary-output') || document.getElementById('resultContent') || document.getElementById('chat-history') || document.getElementById('chatHistory');
                if (outputEl && (outputEl.id === 'chat-history' || outputEl.id === 'chatHistory')) {
                    // Populate chatbot conversation
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'message-bubble ai-message';
                    AITools.renderMarkdown(data.output, msgDiv);
                    outputEl.appendChild(msgDiv);
                    outputEl.scrollTop = outputEl.scrollHeight;
                } else if (outputEl) {
                    AITools.renderMarkdown(data.output, outputEl);
                    const resultCard = document.getElementById('result-card') || document.getElementById('resultCard');
                    if (resultCard) resultCard.style.display = 'block';
                }
                historyOverlay.remove();
            };
            list.appendChild(item);
        });
    } catch (e) {
        console.error(e);
        document.getElementById('history-list').textContent = 'Error loading history.';
    }
}

// Tool-Specific Initializers
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const pageId = path.split('/').pop().replace('.html', '');
    
    // Bind History Button
    const histBtn = document.getElementById('history-btn') || document.getElementById('historyBtn');
    if (histBtn) {
        histBtn.onclick = () => {
            const toolType = pageId === 'chatbot' ? 'chat' : pageId === 'text-improver' ? 'improve' : pageId === 'summarizer' ? 'summarize' : pageId === 'translator' ? 'translate' : 'code';
            showHistory(toolType);
        };
    }

    // Initialize chatbot if form exists
    if (document.getElementById('chatForm') || document.getElementById('chat-form')) {
        initChatbotStream();
        // Load sidebar histories
        auth.onAuthStateChanged((user) => {
            if (user) loadSidebarHistory();
        });
    }
    
    // Initialize text tools with dynamic streaming!
    const textToolBtn = document.getElementById('improve-btn') || document.getElementById('processBtn') || document.getElementById('summarize-btn');
    if (textToolBtn && pageId !== 'image-generator') {
        initTextToolsStreaming();
    }

    // Initialize image tools
    if (pageId === 'image-generator' || document.getElementById('generate-btn') || document.getElementById('generateBtn')) {
        initImageGenerator();
    }
});

/**
 * Chatbot Sidebar Loader
 */
async function loadSidebarHistory() {
    const user = auth.currentUser;
    if (!user) return;

    const listContainer = document.getElementById('sidebarHistoryList');
    if (!listContainer) return;

    try {
        const q = query(
            collection(db, 'ai_history'), 
            where('userId', '==', user.uid),
            where('tool', '==', 'chat'),
            orderBy('timestamp', 'desc'),
            limit(12)
        );
        
        const snapshot = await getDocs(q);
        listContainer.innerHTML = "";

        if (snapshot.empty) {
            listContainer.innerHTML = `<div style="color:var(--secondary);text-align:center;padding:20px 10px;font-size:0.82rem;font-weight:600;">No recent conversations</div>`;
            return;
        }

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const docId = docSnap.id;
            const item = document.createElement('div');
            item.className = `sidebar-history-item ${activeSessionId === docId ? 'active' : ''}`;
            
            // Text preview of prompt input
            const inputVal = data.input || "Conversation Session";
            const preview = inputVal.length > 24 ? inputVal.substring(0, 24) + '...' : inputVal;
            
            item.innerHTML = `<span>💬</span> <span style="flex:1;overflow:hidden;text-overflow:ellipsis;">${preview}</span>`;
            
            item.onclick = () => {
                activeSessionId = docId;
                
                // Set active class
                document.querySelectorAll('.sidebar-history-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');

                // Load output into chat view
                const chatHistory = document.getElementById('chatHistory');
                if (chatHistory) {
                    chatHistory.innerHTML = "";
                    
                    // User query
                    const userDiv = document.createElement('div');
                    userDiv.className = 'message-bubble user-message';
                    userDiv.textContent = data.input;
                    chatHistory.appendChild(userDiv);

                    // AI response
                    const aiDiv = document.createElement('div');
                    aiDiv.className = 'message-bubble ai-message';
                    AITools.renderMarkdown(data.output, aiDiv);
                    chatHistory.appendChild(aiDiv);
                    
                    // Add Copy and Regenerate
                    appendActionTriggers(aiDiv, data.output, data.input);

                    chatHistory.scrollTop = chatHistory.scrollHeight;

                    // Update memory
                    chatContext = [
                        { role: 'user', content: data.input },
                        { role: 'ai', content: data.output }
                    ];
                }
                
                // Hide sidebar on mobile after selection
                const sidebar = document.getElementById('chatSidebar');
                if (sidebar) sidebar.classList.remove('active');
            };
            
            listContainer.appendChild(item);
        });

    } catch (e) {
        console.warn("Sidebar loader error:", e);
    }
}

/**
 * Real-time SSE Chat Stream Implementation
 */
function initChatbotStream() {
    const chatForm = document.getElementById('chatForm') || document.getElementById('chat-form');
    const chatInput = document.getElementById('chatInput') || document.getElementById('chat-input');
    const chatHistory = document.getElementById('chatHistory') || document.getElementById('chat-history');
    const newChatBtn = document.getElementById('newChatBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    if (!chatForm || !chatHistory) return;

    // Render suggestion chips dynamically
    renderSuggestionChips(chatHistory, chatInput);

    // New conversation trigger
    if (newChatBtn) {
        newChatBtn.onclick = () => {
            chatHistory.innerHTML = `
                <div class="message-bubble ai-message">
                    <h1 style="font-size: 1.25rem; font-weight: 800; margin: 0 0 8px; display: flex; align-items: center; gap: 8px;">🤖 Infinity AI Chatbot</h1>
                    Hello! I am your Infinity AI assistant. How can I help you today?
                </div>
            `;
            chatContext = [];
            activeSessionId = null;
            chatInput.value = "";
            document.querySelectorAll('.sidebar-history-item').forEach(el => el.classList.remove('active'));
            AITools.showError('Started a fresh conversation session!');
        };
    }

    // Clear entire history
    if (clearHistoryBtn) {
        clearHistoryBtn.onclick = async () => {
            const confirmPurge = confirm("Are you sure you want to permanently clear all your AI chat sessions?");
            if (!confirmPurge) return;

            const user = auth.currentUser;
            if (!user) return;

            try {
                const q = query(
                    collection(db, 'ai_history'),
                    where('userId', '==', user.uid),
                    where('tool', '==', 'chat')
                );
                const snapshot = await getDocs(q);
                for (const docSnapshot of snapshot.docs) {
                    await deleteDoc(doc(db, 'ai_history', docSnapshot.id));
                }
                chatHistory.innerHTML = `
                    <div class="message-bubble ai-message">
                        <h1 style="font-size: 1.25rem; font-weight: 800; margin: 0 0 8px; display: flex; align-items: center; gap: 8px;">🤖 Infinity AI Chatbot</h1>
                        Hello! I am your Infinity AI assistant. How can I help you today?
                    </div>
                `;
                chatContext = [];
                activeSessionId = null;
                loadSidebarHistory();
                AITools.showError('Successfully cleared all sessions!');
            } catch (err) {
                AITools.showError("Failed to clear sessions: " + err.message);
            }
        };
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        chatInput.value = '';
        await runChatStream(message, chatHistory);
    });
}

/**
 * Perform Server-Sent Events progressive stream mapping for Chat
 */
async function runChatStream(message, chatHistory) {
    // 1. Append User Bubble
    const userDiv = document.createElement('div');
    userDiv.className = 'message-bubble user-message';
    userDiv.textContent = message;
    chatHistory.appendChild(userDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // 2. Append AI Bubble
    const aiDiv = document.createElement('div');
    aiDiv.className = 'message-bubble ai-message';
    chatHistory.appendChild(aiDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Trigger Stream
    await AITools.askStream({
        type: 'chat',
        payload: { message },
        outputEl: aiDiv,
        resultCardEl: null,
        btnEl: document.getElementById('sendBtn'),
        isChat: true
    });
}

/**
 * Render quick clickable suggested prompts chips
 */
function renderSuggestionChips(chatHistory, chatInput) {
    const chipsWrapper = document.createElement('div');
    chipsWrapper.id = 'suggested-chips-container';
    chipsWrapper.style = 'display:flex;gap:10px;flex-wrap:wrap;margin:10px auto;width:100%;max-width:800px;padding:0 24px;box-sizing:border-box;margin-bottom:20px;z-index:5;position:relative;justify-content:center;';
    
    const suggestions = [
        "💡 Startup Ideas",
        "💻 Async JS explained",
        "✍️ Polish my pitches",
        "🌍 Spanish translation"
    ];

    suggestions.forEach(text => {
        const chip = document.createElement('div');
        chip.style = 'background:white;border:1px solid rgba(0,0,0,0.06);border-radius:20px;padding:8px 16px;font-size:0.85rem;cursor:pointer;font-weight:600;color:#475569;box-shadow:0 2px 6px rgba(0,0,0,0.02);transition:all 0.2s;';
        chip.innerText = text;
        chip.onmouseover = () => {
            chip.style.borderColor = '#3B82F6';
            chip.style.color = '#3B82F6';
            chip.style.transform = 'translateY(-1px)';
        };
        chip.onmouseout = () => {
            chip.style.borderColor = 'rgba(0,0,0,0.06)';
            chip.style.color = '#475569';
            chip.style.transform = 'translateY(0)';
        };
        chip.onclick = () => {
            let actualVal = text.substring(2);
            if (actualVal.includes("JS")) actualVal = "Explain asynchronous JavaScript in detail with code examples.";
            else if (actualVal.includes("Startup")) actualVal = "Brainstorm 5 creative business startup ideas for 2026.";
            else if (actualVal.includes("Polish")) actualVal = "Help me polish my product pitch draft so it sounds extremely premium and clean.";
            else if (actualVal.includes("Spanish")) actualVal = "Translate this phrase into conversational Spanish: 'Success is a journey, not a destination.'";
            
            chatInput.value = actualVal;
            chatInput.focus();
        };
        chipsWrapper.appendChild(chip);
    });

    const inputArea = chatHistory.parentNode.querySelector('.input-area');
    const chatForm = document.getElementById('chatForm') || document.getElementById('chat-form');
    if (inputArea && chatForm) {
        inputArea.insertBefore(chipsWrapper, chatForm);
    } else {
        chatHistory.parentNode.insertBefore(chipsWrapper, chatHistory.nextSibling);
    }
}

/**
 * Floating action buttons under chatbot response blocks
 */
function appendActionTriggers(aiDiv, resultText, originalMessage) {
    if (aiDiv.querySelector('.chat-actions-container')) return;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'chat-actions-container';
    actionsDiv.style = 'display:flex;gap:12px;margin-top:14px;opacity:0.75;font-size:0.8rem;border-top:1px solid rgba(0,0,0,0.03);padding-top:10px;';
    
    const copyBtn = document.createElement('button');
    copyBtn.style = 'background:none;border:none;cursor:pointer;color:#64748B;font-weight:600;display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:6px;transition:all 0.2s;';
    copyBtn.innerHTML = '📋 Copy Response';
    copyBtn.onmouseover = () => copyBtn.style.background = 'rgba(0,0,0,0.04)';
    copyBtn.onmouseout = () => copyBtn.style.background = 'none';
    copyBtn.onclick = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(resultText).then(() => {
            copyBtn.innerHTML = '✅ Copied!';
            setTimeout(() => copyBtn.innerHTML = '📋 Copy Response', 2000);
        });
    };

    const regenBtn = document.createElement('button');
    regenBtn.style = 'background:none;border:none;cursor:pointer;color:#64748B;font-weight:600;display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:6px;transition:all 0.2s;';
    regenBtn.innerHTML = '🔄 Regenerate';
    regenBtn.onmouseover = () => regenBtn.style.background = 'rgba(0,0,0,0.04)';
    regenBtn.onmouseout = () => regenBtn.style.background = 'none';
    regenBtn.onclick = async (e) => {
        e.stopPropagation();
        // Remove previous bubble and regenerate
        aiDiv.remove();
        const chatHistory = document.getElementById('chatHistory');
        if (chatHistory) {
            await runChatStream(originalMessage, chatHistory);
        }
    };

    actionsDiv.appendChild(copyBtn);
    actionsDiv.appendChild(regenBtn);
    aiDiv.appendChild(actionsDiv);
}

/**
 * Text Tools with Real-Time Progressive Streaming Integration
 */
function initTextToolsStreaming() {
    const btn = document.getElementById('improve-btn') || document.getElementById('processBtn') || document.getElementById('summarize-btn');
    const input = document.getElementById('text-input') || document.getElementById('textInput');
    const output = document.getElementById('text-output') || document.getElementById('resultContent') || document.getElementById('summary-output');
    const resultCard = document.getElementById('result-card') || document.getElementById('resultCard');
    
    if (!btn || !input || !output) return;

    const path = window.location.pathname;
    let type = 'improve';
    if (path.includes('summarizer')) type = 'summarize';
    else if (path.includes('code-explainer')) type = 'code';
    else if (path.includes('translator')) type = 'translate';

    // Click handler utilizingaskStream for maximum visual elegance!
    btn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (!text) return;
        
        // Trigger high-end progressive streaming
        await AITools.askStream({
            type,
            payload: { text },
            outputEl: output,
            resultCardEl: resultCard,
            btnEl: btn,
            isChat: false
        });

        // Smooth scroll to the result block
        if (resultCard) {
            resultCard.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Automatically bind the main layout Copy Button!
    const copyBtn = document.getElementById('copyBtn') || document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.onclick = () => {
            const rawText = output.innerText || output.textContent;
            if (!rawText) return;

            navigator.clipboard.writeText(rawText).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '✅ Copied!';
                setTimeout(() => copyBtn.innerHTML = originalText, 2000);
            });
        };
    }
}

/**
 * Image Generation Client Binding
 */
function initImageGenerator() {
    const generateBtn = document.getElementById('generate-btn') || document.getElementById('generateBtn');
    const promptInput = document.getElementById('prompt-input') || document.getElementById('promptInput');
    const imageResult = document.getElementById('image-result') || document.getElementById('resultImage');
    const resultCard = document.getElementById('result-card') || document.getElementById('resultCard');
    
    if (!generateBtn || !promptInput) return;

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) return;
        
        const originalText = generateBtn.textContent;
        generateBtn.disabled = true;
        generateBtn.textContent = 'Creating masterpiece...';
        if (resultCard) resultCard.style.display = 'none';
        
        const loader = document.getElementById('imageLoader');
        if (loader) loader.style.display = 'block';

        const response = await AITools.ask('image', { prompt });
        
        generateBtn.disabled = false;
        generateBtn.textContent = originalText;

        if (response) {
            if (resultCard) resultCard.style.display = 'block';
            if (imageResult) {
                imageResult.src = response;
                imageResult.style.display = 'block';
                imageResult.onload = () => {
                    if (loader) loader.style.display = 'none';
                };
            }
            if (resultCard) resultCard.scrollIntoView({ behavior: 'smooth' });
        } else {
            if (loader) loader.style.display = 'none';
        }
    });

    // Save Image to Gallery simulation
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            if (imageResult && imageResult.src) {
                const a = document.createElement('a');
                a.href = imageResult.src;
                a.download = `infinity-ai-artwork-${Date.now()}.png`;
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        };
    }

    // Share Image simulation
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.onclick = () => {
            if (imageResult && imageResult.src) {
                navigator.clipboard.writeText(imageResult.src).then(() => {
                    alert("Image address copied to clipboard! Share it with your friends.");
                });
            }
        };
    }
}
