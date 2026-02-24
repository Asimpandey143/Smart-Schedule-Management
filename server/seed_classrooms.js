const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Classroom = require('./models/Classroom');

dotenv.config();

const departments = ['B.Tech AIDS', 'CSE', 'IT', 'ECE', 'EEE'];
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const classrooms = [];

// Room logic implementation:
// 1st Year: 101-110, 2nd Year: 111-120, 3rd Year: 121-130, 4th Year: 131-140
years.forEach((year, yIdx) => {
    const baseStart = 101 + (yIdx * 10);
    departments.forEach((dept, dIdx) => {
        const deptOffset = dIdx * 2;
        const roomA = baseStart + deptOffset;
        const roomB = baseStart + deptOffset + 1;

        classrooms.push({
            roomNumber: roomA.toString(),
            capacity: 60,
            type: 'Classroom',
            building: 'Academic Block',
            department: dept,
            year: year // Note: Adding year here might be useful if the model supports it
        });
        classrooms.push({
            roomNumber: roomB.toString(),
            capacity: 60,
            type: 'Classroom',
            building: 'Academic Block',
            department: dept,
            year: year
        });
    });
});

const seedClassrooms = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing classrooms to apply new schema
        await Classroom.deleteMany({});

        for (const room of classrooms) {
            const exists = await Classroom.findOne({ roomNumber: room.roomNumber });
            if (!exists) {
                await Classroom.create(room);
                console.log(`Classroom ${room.roomNumber} created.`);
            } else {
                console.log(`Classroom ${room.roomNumber} already exists.`);
            }
        }

        console.log('Seeding completed!');
        process.exit();
    } catch (error) {
        console.error('Error seeding classrooms:', error);
        process.exit(1);
    }
};

seedClassrooms();
