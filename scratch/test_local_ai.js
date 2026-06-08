async function testLocalAI() {
  console.log('Sending request to local /api/ai endpoint on port 3000...');
  try {
    const response = await fetch('http://localhost:3000/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-openai-key': 'sk-proj-invalidkey1234567890'
      },
      body: JSON.stringify({
        prompt: 'Say hello',
        taskType: 'chat',
        context: ''
      })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

testLocalAI();
