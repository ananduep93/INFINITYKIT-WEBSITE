const { GoogleGenAI } = require("@google/genai");

// Create central Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Warning: GEMINI_API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

// In-memory rate limiting map
const rateLimits = new Map();

/**
 * Exponential backoff helper for transient API errors
 */
async function retryWithBackoff(fn, retries = 3, delay = 1000) {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        // Check if error is retryable (like transient rate limits or 503 server errors)
        const status = error.status || error.statusCode;
        const isTransient = !status || status === 429 || status >= 500;
        
        if (isTransient) {
            console.warn(`[AI Retry] Transient error encountered. Retrying in ${delay}ms... (Remaining retries: ${retries}). Reason: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryWithBackoff(fn, retries - 1, delay * 2);
        }
        throw error;
    }
}

/**
 * Simple in-memory rate limiter to prevent spam (default max 40 requests per minute per IP/user)
 */
function checkRateLimit(identifier, limit = 40, windowMs = 60000) {
    const now = Date.now();
    const userHistory = rateLimits.get(identifier) || [];
    
    // Clean old history outside of window windowMs
    const activeRequests = userHistory.filter(timestamp => now - timestamp < windowMs);
    
    if (activeRequests.length >= limit) {
        return false;
    }
    
    activeRequests.push(now);
    rateLimits.set(identifier, activeRequests);
    return true;
}

/**
 * Rough token count estimator based on character lengths (~4 characters per English token)
 */
function estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
}

/**
 * Central AI Utility Service
 */
const AIService = {
    ai,
    
    /**
     * General content generation
     */
    async generate({ model = "gemini-2.5-flash", systemInstruction, prompt, identifier = "anonymous" }) {
        if (!checkRateLimit(identifier)) {
            throw new Error("Too many requests. Please slow down and try again in a minute.");
        }
        
        const startTime = Date.now();
        console.log(`[AI Request] User: ${identifier} | Model: ${model} | Prompt Length: ${prompt ? prompt.length : 0}`);
        
        const response = await retryWithBackoff(async () => {
            const config = {};
            if (systemInstruction) {
                config.systemInstruction = systemInstruction;
            }
            
            return await ai.models.generateContent({
                model,
                contents: prompt,
                config
            });
        });
        
        const duration = Date.now() - startTime;
        const resultText = response.text || "";
        
        // Log analytics & tokens
        const inputTokens = estimateTokens(prompt) + estimateTokens(systemInstruction);
        const outputTokens = estimateTokens(resultText);
        console.log(`[AI Response] Duration: ${duration}ms | Input Tokens (~): ${inputTokens} | Output Tokens (~): ${outputTokens}`);
        
        return {
            text: resultText,
            analytics: {
                durationMs: duration,
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens
            }
        };
    },
    
    /**
     * Real-time streaming content generation
     */
    async *generateStream({ model = "gemini-2.5-flash", systemInstruction, prompt, identifier = "anonymous" }) {
        if (!checkRateLimit(identifier)) {
            throw new Error("Too many requests. Please slow down and try again in a minute.");
        }
        
        console.log(`[AI Stream Request] User: ${identifier} | Model: ${model}`);
        
        const config = {};
        if (systemInstruction) {
            config.systemInstruction = systemInstruction;
        }
        
        const responseStream = await ai.models.generateContentStream({
            model,
            contents: prompt,
            config
        });
        
        for await (const chunk of responseStream) {
            yield chunk.text || "";
        }
    }
};

module.exports = AIService;
