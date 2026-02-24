const testRegister = async () => {
    try {
        const randomEmail = `test${Math.floor(Math.random() * 10000)}@test.com`;
        console.log(`Registering user with email: ${randomEmail}`);

        const response = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test User',
                email: randomEmail,
                password: 'password123',
                role: 'faculty',
                department: 'CS'
            })
        });

        console.log('Response Status:', response.status);
        const data = await response.json();
        console.log('Response Data:', data);

        if (data.role === 'faculty') {
            console.log('SUCCESS: Role is present and correct.');
        } else {
            console.log('FAILURE: Role is missing or incorrect.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
};

testRegister();
