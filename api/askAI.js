module.exports = async (req, res) => {
    const allowedOrigins = ['https://infinitykit.online', 'http://localhost:3000'];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Basic Authentication Check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No valid authentication token provided.' });
    }

    try {
        const { type, message, text, prompt, context } = req.body;

        // 1. IMAGE GENERATION
        if (type === 'image') {
            const seed = Math.floor(Math.random() * 1000000);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=1024&height=1024&nologo=true&enhance=true`;
            return res.status(200).json({ result: imageUrl });
        }

        // 2. TEXT GENERATION (Matching Flutter Logic)
        let systemPrompt = "You are Infinity AI, a premium and highly intelligent assistant. Provide detailed, helpful, and professional answers.";
        let userPrompt = "";

        switch (type) {
            case 'chat':
                systemPrompt = "You are Infinity AI, a brilliant, helpful, and friendly assistant. Provide direct, informative answers. Use markdown tables and lists for clarity when appropriate, but DO NOT use '---' as a separator. Be concise and professional.";
                const historyString = context && context.length > 0 
                    ? context.map(m => `${m.role.toUpperCase()}: ${m.content || m.text}`).join('\n') 
                    : "";
                userPrompt = `${historyString}\nUSER: ${message}\nASSISTANT:`;
                break;
            case 'improve':
                systemPrompt = "You are a world-class editor. Rewrite the following text to make it sound professional and elegant. Provide only the improved text.";
                userPrompt = text || "";
                break;
            case 'summarize':
                systemPrompt = "Summarize the following text using clear, concise bullet points.";
                userPrompt = text || "";
                break;
            case 'code':
                systemPrompt = "You are a senior software engineer. Explain the following code in detail, breaking down what each part does. If there are errors, suggest fixes. Use markdown code blocks.";
                userPrompt = `Please explain this code:\n\n${text}`;
                break;
            case 'translate':
                systemPrompt = "Translate the following text accurately. Provide only the translated result.";
                userPrompt = text || "";
                break;
            default:
                userPrompt = text || message || "";
        }

        if (!userPrompt.trim()) {
            return res.status(400).json({ error: 'Please provide more text for the AI to process.' });
        }

        // Call Pollinations Text API
        const apiUrl = `https://text.pollinations.ai/${encodeURIComponent(userPrompt)}?system=${encodeURIComponent(systemPrompt)}&model=openai`;
        
        const response = await fetch(apiUrl);
        const resultText = await response.text();

        if (resultText) {
            return res.status(200).json({ result: resultText });
        } else {
            throw new Error('AI was unable to generate a response.');
        }

    } catch (error) {
        console.error('AI Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
