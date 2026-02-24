const registerAdmin = async () => {
    try {
        const email = 'priyachaudhari040@gmail.com';
        const password = 'password123';
        const name = 'Admin User';

        console.log(`Attempting to register admin user: ${email}`);

        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                role: 'admin',
                // Department and year are not needed for admin
            })
        });

        const data = await response.json();

        console.log('Response Status:', response.status);
        console.log('Response Data:', data);

        if (response.ok) {
            console.log('\nSUCCESS: Admin user verified/registered successfully!');
            console.log(`You can now login with:\nEmail: ${email}\nPassword: ${password}`);
        } else {
            console.log('\nFAILURE: Could not register admin.');
            if (data.message === 'User already exists') {
                console.log('Reason: The user already exists. You should be able to login.');
                console.log('If you cannot login, the password might be different.');
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
        console.log('Make sure the backend server is running on port 5000.');
    }
};

registerAdmin();
