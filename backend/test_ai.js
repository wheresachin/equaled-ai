async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sachin@gmail.com', password: 'Sachin@12' })
    });
    const loginData = await loginRes.json();
    console.log('Login:', Object.keys(loginData));

    if (!loginData.token) {
      console.log('No token obtained, cannot test AI.');
      return;
    }

    const aiRes = await fetch('http://localhost:5000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({ message: 'hello' })
    });
    const aiData = await aiRes.json();
    console.log('AI Response:', aiData);
  } catch (err) {
    console.error(err);
  }
}

test();
