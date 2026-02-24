const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    students: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['Present', 'Absent'],
            default: 'Absent'
        }
    }],
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: String,
    endTime: String
}, {
    timestamps: true
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
