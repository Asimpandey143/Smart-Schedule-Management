const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileType: {
        type: String,
        enum: ['pdf', 'ppt', 'doc', 'other'],
        default: 'other'
    },
    filePath: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    size: {
        type: String
    }
}, {
    timestamps: true
});

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;
