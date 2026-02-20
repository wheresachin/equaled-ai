async function test() {
  try {
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sachin@gmail.com', password: 'Sachin@12' })
    });
    const loginData = await loginRes.json();
    console.log('Login response:', Object.keys(loginData));

    if (!loginData.token) {
      console.log('No token obtained:', loginData);
      return;
    }
    console.log('Got token.');

    console.log('Pinging AI endpoint...');
    const aiRes = await fetch('http://localhost:5000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({ message: 'hello' })
    });
    
    const text = await aiRes.text();
    try {
      const aiData = JSON.parse(text);
      console.log('AI Response:', aiData);
    } catch (e) {
      console.log('AI Response (not JSON):', text.substring(0, 200));
    }
  } catch (err) {
    console.error(err);
  }
}

test();
