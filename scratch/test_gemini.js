const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Read .env file manually
const envPath = path.join(__dirname, '../.env');
let apiKey = 'AIzaSyBo_mYYWU8_4zNzRiZGa8F5J4QUYbT4ulQ';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^GEMINI_API_KEY\s*=\s*(.*)$/m);
  if (match) {
    apiKey = match[1].trim();
  }
}

console.log('Using API Key:', apiKey.substring(0, 10) + '...');

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Say Hello in one word.');
    console.log('Gemini Response:', result.response.text());
  } catch (error) {
    console.error('Gemini API Error:', error.message);
  }
}

run();
