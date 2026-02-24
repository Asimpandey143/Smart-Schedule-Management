const mongoose = require('mongoose');
const User = require('./models/User');
const Timetable = require('./models/Timetable');
const Course = require('./models/Course');
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
        print('--- DATABASE DEBUG ---');

        const allUsers = await User.find({});
        print(`Total Users: ${allUsers.length}`);

        const faculty = allUsers.filter(u => u.role === 'faculty');
        print(`Total Faculty: ${faculty.length}`);
        faculty.forEach(f => print(`- ${f.name} (${f.email}) [ID: ${f._id}]`));

        const aman = allUsers.find(u => (u.name && u.name.toLowerCase().includes('aman')) || (u.email && u.email.toLowerCase().includes('aman')));

        if (aman) {
            print('\nAman Details:');
            print(`ID: ${aman._id}`);
            print(`Name: ${aman.name}`);
            print(`Email: ${aman.email}`);
            print(`Role: ${aman.role}`);

            const classes = await Timetable.find({ faculty: aman._id }).populate('course');
            print(`Classes assigned to Aman: ${classes.length}`);
            classes.forEach(c => print(`  * ${c.course?.courseName || 'Unknown Course'} (${c.day} ${c.startTime})`));
        } else {
            print('\nUser "Aman" not found in any form.');
        }

        const totalClasses = await Timetable.countDocuments();
        print(`\nTotal Timetable Entries: ${totalClasses}`);

        fs.writeFileSync('debug_output.txt', log);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
