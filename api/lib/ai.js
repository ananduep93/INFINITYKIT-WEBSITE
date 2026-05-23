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
        
        let resultText = "";
        let isDemo = false;

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
        }).catch(err => {
            const errMessage = err.message || '';
            const isApiKeyError = errMessage.includes('API key') ||
              errMessage.includes('leaked') ||
              errMessage.includes('API_KEY') ||
              errMessage.includes('403') ||
              errMessage.includes('404') ||
              errMessage.includes('not found');
            
            if (isApiKeyError) {
                console.warn("[AI Graceful Catch] API key is leaked, invalid, or revoked. Returning fallback demo response.");
                isDemo = true;
                return {
                    text: `⚠️ [DEMO MODE FALLBACK - API KEY ISSUE]\nThe configured Gemini API key has been reported as leaked or revoked by Google.\n\nTo restore full capabilities, please set a valid GEMINI_API_KEY. Here is a simulated response:\n\n"Hello! Since the API key is not currently active, I am running in local offline demo mode to showcase my interface. How can I assist you with your project today?"`
                };
            }
            throw err;
        });
        
        const duration = Date.now() - startTime;
        resultText = response.text || "";
        
        // Log analytics & tokens
        const inputTokens = estimateTokens(prompt) + estimateTokens(systemInstruction);
        const outputTokens = estimateTokens(resultText);
        console.log(`[AI Response] Duration: ${duration}ms | Input Tokens (~): ${inputTokens} | Output Tokens (~): ${outputTokens}`);
        
        return {
            text: resultText,
            demo: isDemo,
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
        
        let responseStream;
        try {
            responseStream = await ai.models.generateContentStream({
                model,
                contents: prompt,
                config
            });
        } catch (err) {
            const errMessage = err.message || '';
            const isApiKeyError = errMessage.includes('API key') ||
              errMessage.includes('leaked') ||
              errMessage.includes('API_KEY') ||
              errMessage.includes('403') ||
              errMessage.includes('404') ||
              errMessage.includes('not found');
            
            if (isApiKeyError) {
                console.warn("[AI Graceful Stream Catch] API key is leaked, invalid, or revoked. Yielding fallback demo response.");
                yield `⚠️ [DEMO MODE STREAM - API KEY ISSUE]\nThe configured Gemini API key has been reported as leaked or revoked by Google.\n\nTo restore full capabilities, please set a valid GEMINI_API_KEY. Here is a simulated response stream chunk.`;
                return;
            }
            throw err;
        }
        
        for await (const chunk of responseStream) {
            yield chunk.text || "";
        }
    }
};

module.exports = AIService;
