const AIService = require("../lib/ai.js");

module.exports = async (req, res) => {
    // CORS headers
    const allowedOrigins = ['https://infinitykit.online', 'http://localhost:3000'];
    const origin = req.headers.origin;
    const isLocal = origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'));
    if (allowedOrigins.includes(origin) || isLocal) {
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
        return res.status(401).json({ error: 'Unauthorized: No valid token provided.' });
    }

    const { text, tool, targetLanguage, stream } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Input text is required.' });
    }

    let systemPrompt = "You are Infinity AI, a premium writing assistant. Process the following text beautifully.";
    switch (tool) {
        case 'improve':
            systemPrompt = "You are a world-class editor. Rewrite the following text to make it sound professional, elegant, and engaging. Provide ONLY the improved text, without explanations or meta-commentary.";
            break;
        case 'summarize':
            systemPrompt = "You are an expert summarizer. Condense the following text using extremely clear, concise, and structured bullet points. Focus on key insights and takeaways. Keep it punchy.";
            break;
        case 'translate':
            systemPrompt = `You are an expert translator. Translate the following text accurately into ${targetLanguage || 'the requested language'}. Provide ONLY the direct translation. Do not add intro/outro comments or explanations.`;
            break;
    }

    try {
        if (stream === true) {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no'
            });

            const streamGenerator = AIService.generateStream({
                model: "gemini-2.5-flash",
                systemInstruction: systemPrompt,
                prompt: text,
                identifier: authHeader
            });

            for await (const chunk of streamGenerator) {
                res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
            }
            
            res.write(`data: [DONE]\n\n`);
            return res.end();
        } else {
            const result = await AIService.generate({
                model: "gemini-2.5-flash",
                systemInstruction: systemPrompt,
                prompt: text,
                identifier: authHeader
            });

            return res.status(200).json({ result: result.text, analytics: result.analytics });
        }
    } catch (error) {
        console.error('Generate AI Error:', error);
        if (stream === true) {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            return res.end();
        }
        return res.status(500).json({ error: error.message });
    }
};
