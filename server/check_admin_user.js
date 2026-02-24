const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed
const dotenv = require('dotenv');

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const email = 'priyachaudhari040@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log('User found:', {
                email: user.email,
                role: user.role,
                department: user.department,
            });
            console.log('Password hash length:', user.password ? user.password.length : 0);
        } else {
            console.log('User not found with email:', email);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
