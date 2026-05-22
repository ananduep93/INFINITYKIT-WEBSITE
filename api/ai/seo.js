const AIService = require("../lib/ai.js");

module.exports = async (req, res) => {
    // CORS headers
    const allowedOrigins = ['https://infinitykit.online', 'http://localhost:3000'];
    const origin = req.headers.origin;
    const isLocal = origin && (
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:') || 
        origin.startsWith('http://192.168.') || 
        origin.startsWith('http://10.') || 
        origin.startsWith('http://172.') || 
        origin === 'null'
    );
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

    const { topic, keywords, stream } = req.body;
    if (!topic) {
        return res.status(400).json({ error: 'Topic or website description is required.' });
    }

    const systemPrompt = "You are a master SEO growth engineer and elite digital marketer. For the given topic and keywords, generate: 1) 5 Click-Worthy SEO Page Titles (strictly under 60 characters) that optimize CTR; 2) 5 Engaging Meta Descriptions (strictly under 155 characters); and 3) A list of 10 relevant long-tail search keywords. Present these in a neat, professional layout with optimization tips using markdown.";
    const userPrompt = `Generate optimized SEO tags for:\nTopic/Description: ${topic}\nTarget Keywords: ${keywords || 'General optimization'}`;

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
                prompt: userPrompt,
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
                prompt: userPrompt,
                identifier: authHeader
            });

            return res.status(200).json({ result: result.text, analytics: result.analytics });
        }
    } catch (error) {
        console.error('SEO AI Error:', error);
        if (stream === true) {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            return res.end();
        }
        return res.status(500).json({ error: error.message });
    }
};
