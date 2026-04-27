const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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
        let systemPrompt = "You are a helpful assistant part of Infinity Kit.";
        let userPrompt = "";

        switch (type) {
            case 'chat':
                userPrompt = message;
                break;
            case 'improve':
                systemPrompt = "You are a writing expert. Improve the following text for clarity, grammar, and professional tone.";
                userPrompt = text;
                break;
            case 'summarize':
                systemPrompt = "You are a summarization expert. Provide a concise summary of the following text using bullet points.";
                userPrompt = text;
                break;
            case 'code':
                if (helpType === 'explain') {
                    systemPrompt = "Explain this code simply for a developer.";
                } else if (helpType === 'fix') {
                    systemPrompt = "Identify and fix any errors in this code. Provide the corrected code.";
                } else {
                    systemPrompt = "Convert this code to the most appropriate alternative language or suggest improvements.";
                }
                userPrompt = code;
                break;
            case 'translate':
                systemPrompt = `Translate the following text into ${targetLang}.`;
                userPrompt = text;
                break;
            case 'image':
                const imageResponse = await openai.images.generate({
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024",
                });
                return res.status(200).json({ result: imageResponse.data[0].url });
            default:
                return res.status(400).json({ error: 'Invalid request type' });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
        });

        return res.status(200).json({ result: completion.choices[0].message.content });

    } catch (error) {
        console.error('OpenAI Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
