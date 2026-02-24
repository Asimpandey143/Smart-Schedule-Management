const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['Lecture Hall', 'Lab', 'Seminar Hall', 'Classroom'],
        default: 'Lecture Hall',
    },
    department: {
        type: String,
        default: 'General'
    },
    building: {
        type: String,
    },
    year: {
        type: String,
    }
}, {
    timestamps: true,
});

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
