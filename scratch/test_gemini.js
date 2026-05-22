const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyBo_mYYWU8_4zNzRiZGa8F5J4QUYbT4ulQ';

async function test() {
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-2.5-flash'];
  for (const modelName of models) {
    try {
      console.log(`Testing model: ${modelName}`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello in one word.');
      console.log(`Success! Response for ${modelName}:`, result.response.text().trim());
      return;
    } catch (err) {
      console.error(`Error for ${modelName}:`, err.message);
    }
  }
}

test();
