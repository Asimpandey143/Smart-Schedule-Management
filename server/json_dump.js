const mongoose = require('mongoose');
const User = require('./models/User');
const Timetable = require('./models/Timetable');
const Course = require('./models/Course');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_classroom');
        const entries = await Timetable.find({})
            .populate('course', 'courseName courseCode')
            .populate('faculty', 'name email')
            .populate('classroom', 'roomNumber');

        fs.writeFileSync('db_dump.json', JSON.stringify(entries, null, 2));
        console.log(`Dumped ${entries.length} entries to db_dump.json`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
