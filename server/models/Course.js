const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
    },
    courseCode: {
        type: String,
        required: true,
        unique: true,
    },
    department: {
        type: String,
        required: true,
    },
    semester: {
        type: String,
        required: true,
    },
    credits: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
