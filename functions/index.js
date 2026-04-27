const functions = require('firebase-functions');
const { OpenAI } = require('openai');
const admin = require('firebase-admin');

admin.initializeApp();

// Initialize OpenAI with API Key from .env file
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Other Firebase functions can stay here

