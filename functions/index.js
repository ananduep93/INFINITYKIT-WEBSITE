const functions = require('firebase-functions');
const { OpenAI } = require('openai');
const admin = require('firebase-admin');

admin.initializeApp();

// Initialize OpenAI with API Key from .env file
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.askAI = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
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
                // Image generation uses a different endpoint
                const imageResponse = await openai.images.generate({
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024",
                });
                res.json({ result: imageResponse.data[0].url });
                return;
            default:
                res.status(400).send('Invalid request type');
                return;
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
        });

        res.json({ result: completion.choices[0].message.content });

    } catch (error) {
        console.error('OpenAI Error:', error);
        res.status(500).json({ error: error.message });
    }
});
