async function testLocalAI() {
  console.log('Sending request to local /api/ai endpoint on port 3001...');
  try {
    const response = await fetch('http://localhost:3001/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'Say hello in exactly 3 words!',
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
