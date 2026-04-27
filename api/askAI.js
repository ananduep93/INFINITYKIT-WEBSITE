module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { type, message, text, code, helpType, targetLang, prompt } = req.body;

        // 1. IMAGE GENERATION (Completely Free)
        if (type === 'image') {
            const seed = Math.floor(Math.random() * 1000000);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=1024&height=1024&nologo=true`;
            return res.status(200).json({ result: imageUrl });
        }

        // 2. TEXT GENERATION (Completely Free via Pollinations Text API)
        let systemPrompt = "You are a helpful assistant part of Infinity Kit.";
        let userPrompt = "";

        switch (type) {
            case 'chat': userPrompt = message; break;
            case 'improve': systemPrompt = "Improve this text for professional use:"; userPrompt = text; break;
            case 'summarize': systemPrompt = "Summarize this text in bullet points:"; userPrompt = text; break;
            case 'code': systemPrompt = "Explain or fix this code:"; userPrompt = code; break;
            case 'translate': systemPrompt = `Translate this text to ${targetLang}:`; userPrompt = text; break;
            default: return res.status(400).json({ error: 'Invalid type' });
        }

        // Call Pollinations Text API (No Key Needed!)
        const apiUrl = `https://text.pollinations.ai/${encodeURIComponent(userPrompt)}?system=${encodeURIComponent(systemPrompt)}&model=openai`;
        
        const response = await fetch(apiUrl);
        const resultText = await response.text();

        if (resultText) {
            return res.status(200).json({ result: resultText });
        } else {
            throw new Error('AI was unable to generate a response.');
        }

    } catch (error) {
        console.error('Pollinations Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
