import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('Testing login after database fix...');
    
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const user = await response.json();
      console.log('🎉 LOGIN SUCCESSFUL!');
      console.log('User data:', {
        id: user.id,
        username: user.username,
        role: user.role,
        accessLevel: user.accessLevel,
        email: user.email
      });
      console.log('\n✅ Your Early Alert Network is now fully working!');
      console.log('🌐 Open: http://localhost:3000');
      console.log('👤 Login with: admin / admin123');
    } else {
      const error = await response.text();
      console.log('❌ Login failed:', error);
    }

  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  }
}

testLogin();
