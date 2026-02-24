const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Asssuming Faculty are Users with role 'faculty'
        required: true,
    },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true,
    },
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        required: true,
    },
    startTime: {
        type: String, // e.g., "09:00"
        required: true,
    },
    endTime: {
        type: String, // e.g., "10:00"
        required: true,
    },
    semester: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    section: {
        type: String, // Optional, for grouping students
    },
    isConflict: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
