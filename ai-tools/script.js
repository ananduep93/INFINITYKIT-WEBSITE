
// AI Tools Logic for Infinity Kit
// Handles communication with Firebase Cloud Functions and UI updates

const API_ENDPOINT = '/api/askAI'; 

const AITools = {
    async ask(type, payload) {
        try {
            this.setLoading(true);
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type, ...payload }),
            });

            if (!response.ok) {
                throw new Error('AI request failed. Please try again.');
            }

            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('AI Error:', error);
            this.showError(error.message);
            return null;
        } finally {
            this.setLoading(false);
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
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(overlay);
        return overlay;
    },

    showError(message) {
        // Use the existing toast notification system if available
        if (window.showToast) {
            window.showToast(message);
        } else {
            alert(message);
        }
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showError('Copied to clipboard! ✨');
        });
    }
};

// Tool-Specific Logic
document.addEventListener('DOMContentLoaded', () => {
    const pageId = window.location.pathname.split('/').pop().replace('.html', '');
    
    switch(pageId) {
        case 'chatbot':
            initChatbot();
            break;
        case 'text-improver':
            initTextImprover();
            break;
        case 'summarizer':
            initSummarizer();
            break;
        case 'code-helper':
            initCodeHelper();
            break;
        case 'image-generator':
            initImageGenerator();
            break;
        case 'translator':
            initTranslator();
            break;
        case 'voice-assistant':
            initVoiceAssistant();
            break;
        case 'document-checker':
            initDocumentChecker();
            break;
    }
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
        msgDiv.textContent = text;
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

function initTextImprover() {
    const improveBtn = document.getElementById('improve-btn');
    const input = document.getElementById('text-input');
    const output = document.getElementById('text-output');
    const copyBtn = document.getElementById('copy-btn');

    if (!improveBtn) return;

    improveBtn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (!text) return;

        const response = await AITools.ask('improve', { text });
        if (response) {
            output.textContent = response;
            copyBtn.style.display = 'block';
        }
    });

    copyBtn.addEventListener('click', () => AITools.copyToClipboard(output.textContent));
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
        if (response) {
            output.textContent = response;
        }
    });
}

function initCodeHelper() {
    const helpBtn = document.getElementById('help-btn');
    const input = document.getElementById('code-input');
    const output = document.getElementById('code-output');
    const typeSelect = document.getElementById('help-type');

    if (!helpBtn) return;

    helpBtn.addEventListener('click', async () => {
        const code = input.value.trim();
        const type = typeSelect.value;
        if (!code) return;

        const response = await AITools.ask('code', { code, helpType: type });
        if (response) {
            output.textContent = response;
        }
    });
}

function initImageGenerator() {
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt-input');
    const imageResult = document.getElementById('image-result');
    const downloadBtn = document.getElementById('download-btn');

    if (!generateBtn) return;

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        const response = await AITools.ask('image', { prompt });
        if (response) {
            imageResult.src = response; // Response should be URL
            imageResult.style.display = 'block';
            downloadBtn.style.display = 'block';
            downloadBtn.href = response;
        }
    });
}

function initTranslator() {
    const translateBtn = document.getElementById('translate-btn');
    const input = document.getElementById('text-input');
    const output = document.getElementById('translated-output');
    const langSelect = document.getElementById('target-lang');

    if (!translateBtn) return;

    translateBtn.addEventListener('click', async () => {
        const text = input.value.trim();
        const targetLang = langSelect.value;
        if (!text) return;

        const response = await AITools.ask('translate', { text, targetLang });
        if (response) {
            output.textContent = response;
        }
    });
}

function initVoiceAssistant() {
    const voiceBtn = document.getElementById('voice-btn');
    const status = document.getElementById('voice-status');
    const responseDiv = document.getElementById('voice-response');

    if (!voiceBtn) return;

    let recognition;
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            status.textContent = 'Listening...';
            voiceBtn.classList.add('recording');
        };

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            status.textContent = `You said: "${transcript}"`;
            
            const response = await AITools.ask('chat', { message: transcript });
            if (response) {
                responseDiv.textContent = response;
                speak(response);
            }
        };

        recognition.onerror = () => {
            status.textContent = 'Error occurred. Try again.';
            voiceBtn.classList.remove('recording');
        };

        recognition.onend = () => {
            voiceBtn.classList.remove('recording');
        };
    }

    voiceBtn.addEventListener('click', () => {
        if (recognition) {
            recognition.start();
        } else {
            AITools.showError('Speech recognition not supported in this browser.');
        }
    });

    function speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }
}

function initDocumentChecker() {
    const checkBtn = document.getElementById('check-btn');
    const fileInput = document.getElementById('file-input');
    const output = document.getElementById('doc-output');

    if (!checkBtn) return;

    checkBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) return;

        // Simple text extraction for demonstration
        // In a real app, you'd use a library or send the file to the backend
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            const response = await AITools.ask('summarize', { text: text.substring(0, 5000) });
            if (response) {
                output.textContent = response;
            }
        };
        reader.readAsText(file);
    });
}
