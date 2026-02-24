const mongoose = require('mongoose');
const User = require('./models/User');
const Timetable = require('./models/Timetable');
const Course = require('./models/Course');
const dotenv = require('dotenv');

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_classroom');
        console.log('--- DATABASE DEBUG ---');

        const allUsers = await User.find({});
        console.log('Total Users:', allUsers.length);

        const faculty = allUsers.filter(u => u.role === 'faculty');
        console.log('Total Faculty:', faculty.length);
        faculty.forEach(f => console.log(`- ${f.name} (${f.email}) [ID: ${f._id}]`));

        const aman = allUsers.find(u => u.name.toLowerCase().includes('aman') || u.email.toLowerCase().includes('aman'));

        if (aman) {
            console.log('\nAman Details:');
            console.log('ID:', aman._id);
            console.log('Name:', aman.name);
            console.log('Email:', aman.email);
            console.log('Role:', aman.role);

            const classes = await Timetable.find({ faculty: aman._id }).populate('course');
            console.log('Classes assigned to Aman:', classes.length);
            classes.forEach(c => console.log(`  * ${c.course.courseName} (${c.day} ${c.startTime})`));
        } else {
            console.log('\nUser "Aman" not found in any form.');
        }

        const totalClasses = await Timetable.countDocuments();
        console.log('\nTotal Timetable Entries:', totalClasses);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
