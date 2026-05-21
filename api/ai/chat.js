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

    const { message, context, stream } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    const systemPrompt = "You are Infinity AI, a brilliant, helpful, and friendly assistant. Provide direct, informative, and professional answers. Use markdown tables and lists for clarity when appropriate. Be concise and professional.";
    const historyString = context && context.length > 0 
        ? context.map(m => `${m.role.toUpperCase()}: ${m.content || m.text}`).join('\n') 
        : "";
    const userPrompt = `${historyString}\nUSER: ${message}\nASSISTANT:`;

    try {
        if (stream === true) {
            // Set headers for Server-Sent Events (SSE)
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no' // Direct Vercel streaming
            });

            // Start streaming via AIService
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
            // Standard response
            const result = await AIService.generate({
                model: "gemini-2.5-flash",
                systemInstruction: systemPrompt,
                prompt: userPrompt,
                identifier: authHeader
            });

            return res.status(200).json({ result: result.text, analytics: result.analytics });
        }
    } catch (error) {
        console.error('Chat AI Error:', error);
        if (stream === true) {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            return res.end();
        }
        return res.status(500).json({ error: error.message });
    }
};
