const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const check = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}, 'email role');
    console.log('Users in DB:', JSON.stringify(users, null, 2));
    process.exit();
};

check();
