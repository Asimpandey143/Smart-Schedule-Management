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
        print('--- DATABASE SUMMARY ---');

        const courses = await Course.countDocuments();
        const rooms = await Classroom.countDocuments();
        const faculty = await User.find({ role: 'faculty' });
        const students = await User.countDocuments({ role: 'student' });

        print(`Courses: ${courses}`);
        print(`Classrooms: ${rooms}`);
        print(`Faculty: ${faculty.length}`);
        faculty.forEach(f => print(`  - ${f.name} [${f.email}] [ID: ${f._id}]`));
        print(`Students: ${students}`);

        const entries = await Timetable.find({}).populate('faculty').populate('course');
        print(`\nTotal Timetable Entries: ${entries.length}`);

        const facultyStats = {};
        faculty.forEach(f => facultyStats[f._id] = 0);

        entries.forEach(e => {
            if (e.faculty) {
                facultyStats[e.faculty._id] = (facultyStats[e.faculty._id] || 0) + 1;
            }
        });

        print('\nAssignments per Faculty:');
        faculty.forEach(f => {
            print(`- ${f.name}: ${facultyStats[f._id]} classes`);
        });

        fs.writeFileSync('debug_summary.txt', log);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
