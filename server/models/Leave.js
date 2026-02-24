const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'faculty'],
        required: true
    },
    leaveCategory: {
        type: String,
        enum: ['Leave', 'OD'],
        default: 'Leave'
    },
    leaveType: {
        type: String,
        enum: ['Sick Leave', 'Casual Leave', 'Academic Leave', 'Personal Leave', 'On Duty', 'Other'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    adminComments: {
        type: String
    }
}, {
    timestamps: true
});

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
