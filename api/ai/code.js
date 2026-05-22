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

    const { code, stream } = req.body;
    if (!code) {
        return res.status(400).json({ error: 'Code content is required.' });
    }

    const systemPrompt = "You are an elite principal software architect. Explain the following code in detail, breaking down what each part does with maximum clarity. If there are performance bottlenecks, security vulnerabilities, or styling bugs, list them and suggest optimized fixes. Format your response beautifully using markdown, lists, and code blocks.";
    const userPrompt = `Please explain and review this code:\n\n${code}`;

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
        console.error('Code AI Error:', error);
        if (stream === true) {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            return res.end();
        }
        return res.status(500).json({ error: error.message });
    }
};
