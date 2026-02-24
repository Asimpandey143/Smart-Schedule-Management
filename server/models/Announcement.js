const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    targetAudience: {
        type: String,
        enum: ['all', 'faculty', 'student'],
        default: 'all',
    },
    targetDepartment: {
        type: String,
        default: 'all'
    },
    targetYear: {
        type: String,
        default: 'all'
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Only admins can send, but we track who sent it
    }
}, {
    timestamps: true,
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
