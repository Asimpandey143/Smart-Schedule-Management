const mongoose = require('mongoose');
const User = require('./models/User');
const Timetable = require('./models/Timetable');
const Course = require('./models/Course');
const Classroom = require('./models/Classroom');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const debug = async () => {
    let log = '';
    const print = (msg) => {
        console.log(msg);
        log += msg + '\n';
    };

    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_classroom');
        print('--- FULL TIMETABLE DUMP ---');

        const entries = await Timetable.find({})
            .populate('course')
            .populate('faculty')
            .populate('classroom');

        print(`Total Records in Database: ${entries.length}`);

        entries.forEach((e, i) => {
            print(`[${i + 1}] Day: ${e.day} | Time: ${e.startTime}-${e.endTime}`);
            print(`    Course: ${e.course?.courseName} (${e.course?.courseCode})`);
            print(`    Faculty: ${e.faculty?.name} (${e.faculty?.email})`);
            print(`    Room: ${e.classroom?.roomNumber}`);
            print('-----------------------------------');
        });

        fs.writeFileSync('full_dump.txt', log);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
