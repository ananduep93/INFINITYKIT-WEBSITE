const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  const apiKey = 'AIzaSyBo_mYYWU8_4zNzRiZGa8F5J4QUYbT4ulQ';
  console.log('Testing Gemini API key:', apiKey);
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Say hello in exactly 3 words!');
    console.log('Success! Response:', result.response.text());
  } catch (error) {
    console.error('Gemini API call failed:', error);
  }
}

testGemini();
