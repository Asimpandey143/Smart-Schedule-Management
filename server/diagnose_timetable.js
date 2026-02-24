const mongoose = require('mongoose');
const User = require('./models/User');
const Timetable = require('./models/Timetable');
require('./models/Course');
const dotenv = require('dotenv');

dotenv.config();

const runDiag = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_classroom');
        console.log('--- DIAGNOSTIC: TIMETABLE VS FACULTY ---');

        const aman = await User.findOne({ email: 'amanjha@gmail.com' });
        console.log(`Aman ID: ${aman ? aman._id : 'NOT FOUND'}`);

        const entries = await Timetable.find({}).lean();
        console.log(`Total Timetable Entries: ${entries.length}`);

        for (const e of entries) {
            const facultyUser = await User.findById(e.faculty);
            console.log(`Entry: ${e.day} ${e.startTime} - Course: ${e.course}`);
            console.log(`  Raw Faculty ID in Timetable: ${e.faculty}`);
            console.log(`  Resolved Faculty Name: ${facultyUser ? facultyUser.name : 'UNKNOWN'}`);
            console.log(`  Resolved Faculty Role: ${facultyUser ? facultyUser.role : 'UNKNOWN'}`);
            console.log('-----------------------------------');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runDiag();
