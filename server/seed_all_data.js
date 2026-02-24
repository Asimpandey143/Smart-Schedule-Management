const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const Classroom = require('./models/Classroom');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Seed Faculty
        const facultyData = [
            { name: 'Dr. Alan Turing', email: 'alan@univ.edu', password: 'password123', role: 'faculty', department: 'Computer Science' },
            { name: 'Dr. Grace Hopper', email: 'grace@univ.edu', password: 'password123', role: 'faculty', department: 'Computer Science' },
            { name: 'Prof. Richard Feynman', email: 'richard@univ.edu', password: 'password123', role: 'faculty', department: 'Physics' }
        ];

        for (const f of facultyData) {
            const exists = await User.findOne({ email: f.email });
            if (!exists) await User.create(f);
        }
        console.log('Faculty seeded.');

        // 2. Seed Students
        const studentData = [
            { name: 'John Doe', email: 'john@student.edu', password: 'password123', role: 'student', department: 'Computer Science', year: '2nd' },
            { name: 'Jane Smith', email: 'jane@student.edu', password: 'password123', role: 'student', department: 'Computer Science', year: '2nd' },
            { name: 'Bob Wilson', email: 'bob@student.edu', password: 'password123', role: 'student', department: 'Physics', year: '1st' }
        ];

        for (const s of studentData) {
            const exists = await User.findOne({ email: s.email });
            if (!exists) await User.create(s);
        }
        console.log('Students seeded.');

        // 3. Seed Courses
        const courseData = [
            { courseName: 'Data Structures', courseCode: 'CS201', department: 'Computer Science', semester: '3', credits: 4 },
            { courseName: 'Algorithms', courseCode: 'CS202', department: 'Computer Science', semester: '4', credits: 4 },
            { courseName: 'Quantum Mechanics', courseCode: 'PH101', department: 'Physics', semester: '1', credits: 3 },
            { courseName: 'Database Systems', courseCode: 'CS301', department: 'Computer Science', semester: '5', credits: 3 }
        ];

        for (const c of courseData) {
            const exists = await Course.findOne({ courseCode: c.courseCode });
            if (!exists) await Course.create(c);
        }
        console.log('Courses seeded.');

        console.log('All sample data seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
