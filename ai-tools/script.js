
import { db, auth, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, limit } from '../firebase-config.js';

const API_ENDPOINT = '/api/askAI'; 

// Local state for conversation memory
let chatContext = [];

const AITools = {
    async ask(type, payload) {
        try {
            this.setLoading(true);
            
            // Add context for Chatbot matching Flutter logic
            if (type === 'chat') {
                payload.context = chatContext.slice(-6); 
            }

            let resultText;

            // Try local API first
            try {
                // Get Firebase ID token for authentication
                const user = auth.currentUser;
                let idToken = null;
                if (user) {
                    idToken = await user.getIdToken();
                }

                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': idToken ? `Bearer ${idToken}` : ''
                    },
                    body: JSON.stringify({ type, ...payload }),
                });

                if (response.ok) {
                    const data = await response.json();
                    resultText = data.result;
                } else {
                    throw new Error('Local API not available');
                }
            } catch (apiError) {
                console.warn('Local API failed, falling back to direct Pollinations call...', apiError);
                
                // FALLBACK LOGIC (Matching Flutter/Backend logic)
                let systemPrompt = "You are Infinity AI, a premium and highly intelligent assistant. Provide detailed, helpful, and professional answers.";
                let userPrompt = "";

                switch (type) {
                    case 'chat':
                        systemPrompt = "You are Infinity AI, a brilliant, helpful, and friendly assistant. Provide direct, informative answers. Use markdown tables and lists for clarity when appropriate, but DO NOT use '---' as a separator. Be concise and professional.";
                        const historyString = chatContext.length > 0 
                            ? chatContext.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n') 
                            : "";
                        userPrompt = `${historyString}\nUSER: ${payload.message}\nASSISTANT:`;
                        break;
                    case 'improve':
                        systemPrompt = "You are a world-class editor. Rewrite the following text to make it sound professional and elegant. Provide only the improved text.";
                        userPrompt = payload.text || "";
                        break;
                    case 'summarize':
                        systemPrompt = "Summarize the following text using clear, concise bullet points.";
                        userPrompt = payload.text || "";
                        break;
                    case 'code':
                        systemPrompt = "You are a senior software engineer. Explain the following code in detail, breaking down what each part does. If there are errors, suggest fixes. Use markdown code blocks.";
                        userPrompt = `Please explain this code:\n\n${payload.text}`;
                        break;
                    case 'translate':
                        systemPrompt = "Translate the following text accurately. Provide only the translated result.";
                        userPrompt = payload.text || "";
                        break;
                    default:
                        userPrompt = payload.text || payload.message || "";
                }

                if (!userPrompt.trim()) throw new Error('Input text is empty');

                const pollinationsUrl = `https://text.pollinations.ai/${encodeURIComponent(userPrompt)}?system=${encodeURIComponent(systemPrompt)}&model=openai`;
                const pollResp = await fetch(pollinationsUrl);
                resultText = await pollResp.text();
            }

            if (!resultText) throw new Error('AI was unable to generate a response.');

            // Save to Firebase History
            this.saveToHistory(type, payload, resultText);

            // Update local context for Chatbot
            if (type === 'chat') {
                chatContext.push({ role: 'user', content: payload.message });
                chatContext.push({ role: 'ai', content: resultText });
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
        overlay.innerHTML = '<div class="spinner" style="width:40px;height:40px;border:4px solid #f3f3f3;border-top:4px solid #2563EB;border-radius:50%;animation:spin 1s linear infinite;"></div><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>';
        document.body.appendChild(overlay);
        return overlay;
    },

    showError(message) {
        // Use a more premium toast if available, otherwise alert
        alert('AI Error: ' + message);
    },

    renderMarkdown(text, element) {
        if (typeof marked !== 'undefined') {
            element.innerHTML = marked.parse(text);
        } else {
            element.textContent = text;
        }
    }
};

// Export to window for HTML inline scripts
window.askAI = (type, data) => {
    if (typeof data === 'string') {
        const payload = type === 'chat' ? { message: data } : (type === 'image' ? { prompt: data } : { text: data });
        return AITools.ask(type, payload);
    }
    return AITools.ask(type, data);
};

// History UI Logic
async function showHistory(toolType) {
    const user = auth.currentUser;
    if (!user) return alert('Please sign in to see your history.');

    const historyOverlay = document.createElement('div');
    historyOverlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px;';
    historyOverlay.id = 'history-overlay';
    
    const panel = document.createElement('div');
    panel.style = 'background:white;width:100%;max-width:600px;max-height:80vh;border-radius:24px;padding:30px;overflow-y:auto;position:relative;box-shadow: 0 20px 50px rgba(0,0,0,0.2);';
    panel.innerHTML = `<h2 style="margin-top:0;font-weight:800;">📜 ${toolType.charAt(0).toUpperCase() + toolType.slice(1)} History</h2><button id="close-history" style="position:absolute;top:20px;right:20px;border:none;background:none;font-size:1.5rem;cursor:pointer;color:#64748B;">✕</button><div id="history-list" style="margin-top:20px;">Loading...</div>`;
    
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
            list.innerHTML = '<p style="color:#64748B;text-align:center;padding:40px 0;">No history found yet.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const item = document.createElement('div');
            item.style = 'padding:15px;border:1px solid #E2E8F0;border-radius:16px;margin-bottom:12px;cursor:pointer;transition:all 0.2s;';
            item.onmouseover = () => item.style.borderColor = '#2563EB';
            item.onmouseout = () => item.style.borderColor = '#E2E8F0';
            
            const inputPreview = data.input ? (data.input.length > 50 ? data.input.substring(0, 50) + '...' : data.input) : 'No input';
            const outputPreview = data.output ? (data.output.length > 100 ? data.output.substring(0, 100) + '...' : data.output) : 'No output';
            
            item.innerHTML = `<p style="font-weight:700;margin-bottom:8px;font-size:0.9rem;color:#2563EB;">You: ${inputPreview}</p><div style="font-size:0.85rem;color:#1E293B;background:#F8FAFC;padding:12px;border-radius:12px;line-height:1.4;">${outputPreview}</div>`;
            
            item.onclick = () => {
                if(confirm('Do you want to restore this response?')) {
                    const outputEl = document.getElementById('text-output') || document.getElementById('textOutput') || document.getElementById('summary-output') || document.getElementById('resultContent') || document.getElementById('chat-history') || document.getElementById('chatHistory');
                    if(outputEl && (outputEl.id === 'chat-history' || outputEl.id === 'chatHistory')) {
                        const msgDiv = document.createElement('div');
                        msgDiv.className = 'message-bubble ai-message';
                        AITools.renderMarkdown(data.output, msgDiv);
                        outputEl.appendChild(msgDiv);
                        outputEl.scrollTop = outputEl.scrollHeight;
                    } else if (outputEl) {
                        AITools.renderMarkdown(data.output, outputEl);
                        const resultCard = document.getElementById('resultCard') || document.getElementById('result-card');
                        if (resultCard) resultCard.style.display = 'block';
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
    const histBtn = document.getElementById('history-btn') || document.getElementById('historyBtn');
    if (histBtn) {
        histBtn.onclick = () => {
            const toolType = pageId === 'chatbot' ? 'chat' : pageId === 'text-improver' ? 'improve' : pageId === 'summarizer' ? 'summarize' : 'image';
            showHistory(toolType);
        };
    }

    // Initialize tools based on existing elements
    if (document.getElementById('chatForm') || document.getElementById('chat-form')) {
        initChatbot();
    }
    
    const textToolBtn = document.getElementById('improve-btn') || document.getElementById('processBtn') || document.getElementById('summarize-btn');
    if (textToolBtn && pageId !== 'image-generator') {
        initTextTools();
    }

    if (pageId === 'image-generator' || document.getElementById('generate-btn') || document.getElementById('generateBtn')) {
        initImageGenerator();
    }
});

function initChatbot() {
    const chatForm = document.getElementById('chatForm') || document.getElementById('chat-form');
    const chatInput = document.getElementById('chatInput') || document.getElementById('chat-input');
    const chatHistory = document.getElementById('chatHistory') || document.getElementById('chat-history');
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
        if (!chatHistory) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `message-bubble ${role}-message`;
        if (role === 'ai') {
            AITools.renderMarkdown(text, msgDiv);
        } else {
            msgDiv.textContent = text;
        }
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

function initTextTools() {
    const btn = document.getElementById('improve-btn') || document.getElementById('processBtn') || document.getElementById('summarize-btn');
    const input = document.getElementById('text-input') || document.getElementById('textInput');
    const output = document.getElementById('text-output') || document.getElementById('resultContent') || document.getElementById('summary-output');
    const resultCard = document.getElementById('result-card') || document.getElementById('resultCard');
    
    if (!btn) return;

    // Determine type from path or elements
    const path = window.location.pathname;
    let type = 'improve';
    if (path.includes('summarizer')) type = 'summarize';
    else if (path.includes('code-explainer')) type = 'code';
    else if (path.includes('translator')) type = 'translate';

    btn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (!text) return;
        
        const originalText = btn.textContent;
        btn.textContent = 'Processing...';

        const response = await AITools.ask(type, { text });
        
        btn.textContent = originalText;

        if (response) {
            if (resultCard) resultCard.style.display = 'block';
            AITools.renderMarkdown(response, output);
            if (resultCard) resultCard.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

function initImageGenerator() {
    const generateBtn = document.getElementById('generate-btn') || document.getElementById('generateBtn');
    const promptInput = document.getElementById('prompt-input') || document.getElementById('promptInput');
    const imageResult = document.getElementById('image-result') || document.getElementById('resultImage');
    const resultCard = document.getElementById('result-card') || document.getElementById('resultCard');
    
    if (!generateBtn) return;

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) return;
        const response = await AITools.ask('image', { prompt });
        if (response) {
            if (resultCard) resultCard.style.display = 'block';
            if (imageResult) {
                imageResult.src = response;
                imageResult.style.display = 'block';
            }
            const loader = document.getElementById('imageLoader');
            if (loader) loader.style.display = 'none';
        }
    });
}
