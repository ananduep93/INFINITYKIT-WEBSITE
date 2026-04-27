const { GoogleGenerativeAI } = require("@google/generative-ai");

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

        // Handle Image Generation separately (Free via Pollinations)
        if (type === 'image') {
            const seed = Math.floor(Math.random() * 1000000);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=1024&height=1024&nologo=true`;
            return res.status(200).json({ result: imageUrl });
        }

        // Handle Text via Gemini
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Missing GEMINI_API_KEY in Environment Variables' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let systemPrompt = "You are a helpful assistant part of Infinity Kit.";
        let userPrompt = "";

        switch (type) {
            case 'chat':
                userPrompt = message;
                break;
            case 'improve':
                systemPrompt = "Improve the following text for clarity and professional tone:";
                userPrompt = text;
                break;
            case 'summarize':
                systemPrompt = "Summarize the following text concisely:";
                userPrompt = text;
                break;
            case 'code':
                if (helpType === 'explain') systemPrompt = "Explain this code simply:";
                else if (helpType === 'fix') systemPrompt = "Fix the errors in this code:";
                else systemPrompt = "Improve or convert this code:";
                userPrompt = code;
                break;
            case 'translate':
                systemPrompt = `Translate this text into ${targetLang}:`;
                userPrompt = text;
                break;
            default:
                return res.status(400).json({ error: 'Invalid request type' });
        }

        const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
        const response = await result.response;
        const resultText = response.text();

        return res.status(200).json({ result: resultText });

    } catch (error) {
        console.error('Gemini Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
