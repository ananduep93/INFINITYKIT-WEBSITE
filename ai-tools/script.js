
import { db, auth, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, limit } from '../firebase-config.js';

const API_ENDPOINT = '/api/askAI'; 

// Local state for conversation memory
let chatContext = [];

const AITools = {
    async ask(type, payload) {
        try {
            this.setLoading(true);
            
            // Add context for Chatbot
            if (type === 'chat') {
                payload.context = chatContext.slice(-6); // Keep last 3 rounds
            }

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, ...payload }),
            });

            if (!response.ok) throw new Error('AI request failed. Please try again.');

            const data = await response.json();
            const resultText = data.result;

            // Save to Firebase History
            this.saveToHistory(type, payload, resultText);

            // Update local context for Chatbot
            if (type === 'chat') {
                chatContext.push({ role: 'user', text: payload.message });
                chatContext.push({ role: 'ai', text: resultText });
            }

            return resultText;
        } catch (error) {
            console.error('AI Error:', error);
            this.showError(error.message);
            return null;
        } finally {
            this.setLoading(false);
        }
    },

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

    setLoading(isLoading) {
        const overlay = document.getElementById('toolLoadingOverlay') || this.createLoadingOverlay();
        overlay.style.display = isLoading ? 'flex' : 'none';
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = isLoading);
    },

    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'toolLoadingOverlay';
        overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.7);display:none;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(3px);';
        overlay.innerHTML = '<div class="spinner" style="width:40px;height:40px;border:4px solid #f3f3f3;border-top:4px solid #4a6cf7;border-radius:50%;animation:spin 1s linear infinite;"></div><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>';
        document.body.appendChild(overlay);
        return overlay;
    },

    showError(message) {
        alert(message);
    },

    renderMarkdown(text, element) {
        if (typeof marked !== 'undefined') {
            element.innerHTML = marked.parse(text);
        } else {
            element.textContent = text;
        }
    }
};

// History UI Logic
async function showHistory(toolType) {
    const user = auth.currentUser;
    if (!user) return alert('Please sign in to see your history.');

    const historyOverlay = document.createElement('div');
    historyOverlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px;';
    historyOverlay.id = 'history-overlay';
    
    const panel = document.createElement('div');
    panel.style = 'background:white;width:100%;max-width:600px;max-height:80vh;border-radius:20px;padding:30px;overflow-y:auto;position:relative;';
    panel.innerHTML = `<h2 style="margin-top:0;">📜 Your ${toolType} History</h2><button id="close-history" style="position:absolute;top:20px;right:20px;border:none;background:none;font-size:1.5rem;cursor:pointer;">✕</button><div id="history-list" style="margin-top:20px;">Loading...</div>`;
    
    historyOverlay.appendChild(panel);
    document.body.appendChild(historyOverlay);

    document.getElementById('close-history').onclick = () => historyOverlay.remove();
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
            list.innerHTML = '<p style="color:#666;">No history found yet.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const item = document.createElement('div');
            item.style = 'padding:15px;border-bottom:1px solid #eee;margin-bottom:10px;';
            item.innerHTML = `<p style="font-weight:600;margin-bottom:5px;font-size:0.9rem;color:#4a6cf7;">You: ${data.input.substring(0, 50)}...</p><div style="font-size:0.85rem;color:#333;background:#f8f9fa;padding:10px;border-radius:10px;">${data.output.substring(0, 150)}...</div>`;
            item.onclick = () => {
                if(confirm('Do you want to restore this response to the screen?')) {
                    const outputEl = document.getElementById('text-output') || document.getElementById('summary-output') || document.getElementById('chat-history');
                    if(outputEl.id === 'chat-history') {
                        const msgDiv = document.createElement('div');
                        msgDiv.className = 'chat-message ai-message';
                        AITools.renderMarkdown(data.output, msgDiv);
                        outputEl.appendChild(msgDiv);
                    } else {
                        AITools.renderMarkdown(data.output, outputEl);
                    }
                    historyOverlay.remove();
                }
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
    const histBtn = document.getElementById('history-btn');
    if (histBtn) histBtn.onclick = () => showHistory(pageId === 'chatbot' ? 'chat' : pageId === 'text-improver' ? 'improve' : pageId === 'summarizer' ? 'summarize' : 'image');

    if (pageId === 'chatbot') initChatbot();
    else if (pageId === 'text-improver') initTextImprover();
    else if (pageId === 'summarizer') initSummarizer();
    else if (pageId === 'image-generator') initImageGenerator();
});

function initChatbot() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatHistory = document.getElementById('chat-history');
    if (!chatForm) return;

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        appendMessage('user', message);
        chatInput.value = '';

        const response = await AITools.ask('chat', { message });
        if (response) {
            appendMessage('ai', response);
        }
    });

    function appendMessage(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${role}-message`;
        if (role === 'ai') {
            AITools.renderMarkdown(text, msgDiv);
        } else {
            msgDiv.textContent = text;
        }
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

function initTextImprover() {
    const improveBtn = document.getElementById('improve-btn');
    const input = document.getElementById('text-input');
    const output = document.getElementById('text-output');
    if (!improveBtn) return;

    improveBtn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (!text) return;
        const response = await AITools.ask('improve', { text });
        if (response) AITools.renderMarkdown(response, output);
    });
}

function initSummarizer() {
    const summarizeBtn = document.getElementById('summarize-btn');
    const input = document.getElementById('text-input');
    const output = document.getElementById('summary-output');
    if (!summarizeBtn) return;

    summarizeBtn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (!text) return;
        const response = await AITools.ask('summarize', { text });
        if (response) AITools.renderMarkdown(response, output);
    });
}

function initImageGenerator() {
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt-input');
    const imageResult = document.getElementById('image-result');
    if (!generateBtn) return;

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) return;
        const response = await AITools.ask('image', { prompt });
        if (response) {
            imageResult.src = response;
            imageResult.style.display = 'block';
        }
    });
}
