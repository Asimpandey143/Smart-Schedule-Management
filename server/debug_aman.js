const mongoose = require('mongoose');
const User = require('./models/User');
const Timetable = require('./models/Timetable');
const dotenv = require('dotenv');

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_classroom');
        console.log('Connected to DB');

        const aman = await User.findOne({ email: /aman/i });
        if (!aman) {
            console.log('User "Aman" not found by email search.');
            const allFaculty = await User.find({ role: 'faculty' });
            console.log('Current Faculty List:', allFaculty.map(f => ({ name: f.name, email: f.email, role: f.role })));
        } else {
            console.log('Aman found:', { name: aman.name, role: aman.role, id: aman._id });
            const amansClasses = await Timetable.find({ faculty: aman._id });
            console.log(`Aman has ${amansClasses.length} classes assigned in Timetable.`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
