const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const { v4: uuidv4 } = require('uuid');
const { OpenAI } = require('openai');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

admin.initializeApp();

const window = new JSDOM('').window;
const dompurify = createDOMPurify(window);

// Initialize Express
const app = express();

// Security Headers (Helmet)
app.use(helmet());

// Secure CORS
const allowedOrigins = ['https://infinity-kit-79c58.web.app', 'https://infinity-kit.com'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// Rate Limiting
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per minute
    message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per 15 minutes
    message: { error: 'Too many auth attempts, please try again later.' }
});

const uploadLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 uploads per minute
    message: { error: 'Upload limit exceeded.' }
});

app.use(generalLimiter);

// --- Secure Endpoints ---

// 1. OpenAI Chat (General API with validation)
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        // Input Validation & Sanitization
        if (!message || typeof message !== 'string' || message.length > 2000) {
            return res.status(400).json({ error: 'Invalid message content' });
        }
        
        const cleanMessage = dompurify.sanitize(validator.trim(message));
        
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: cleanMessage }],
        });

        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'An internal error occurred' }); // Generic error
    }
});

// 2. Secure File Upload Handler (Example Logic)
app.post('/api/upload-profile', uploadLimiter, async (req, res) => {
    // In a real scenario, use Busboy or similar to handle file streams
    // Here we show the security logic
    const { fileName, mimeType, fileSize, userId } = req.body;

    // Validate MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
        return res.status(400).json({ error: 'Invalid file type' });
    }

    // Restrict size (5MB)
    if (fileSize > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'File too large' });
    }

    // Rename with UUID
    const secureFileName = `${uuidv4()}_${fileName}`;
    
    // Logic to move to Firebase Storage would go here...
    res.json({ message: 'Ready for upload', securePath: `users/${userId}/profile/${secureFileName}` });
});

// 3. Payment Integration (Stripe)
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { priceId } = req.body;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            success_url: 'https://infinity-kit.com/success',
            cancel_url: 'https://infinity-kit.com/cancel',
        });
        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: 'Payment initialization failed' });
    }
});

// Export the API
exports.app = functions.https.onRequest(app);
