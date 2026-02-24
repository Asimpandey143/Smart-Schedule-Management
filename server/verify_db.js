const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
require('./models/User');
require('./models/Course');
const dotenv = require('dotenv');

dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_classroom');
        const entries = await Timetable.find({})
            .populate('course', 'courseName')
            .populate('faculty', 'name email role');

        console.log(`Total Entries: ${entries.length}`);
        entries.forEach((e, i) => {
            console.log(`[${i + 1}] ${e.day} ${e.startTime}: ${e.course?.courseName} | Faculty: ${e.faculty?.name} (${e.faculty?.role})`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
