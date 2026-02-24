const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'faculty', 'student'],
        default: 'student',
    },
    department: {
        type: String,
        required: function () { return this.role !== 'admin'; }
    },
    year: {
        type: String,
        required: function () { return this.role === 'student'; }
    },
    studentClass: {
        type: String, // e.g. B.Tech, M.Tech
        required: function () { return this.role === 'student'; }
    },
    section: {
        type: String,
        required: function () { return this.role === 'student'; }
    },
    phone: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    avatar: {
        type: String,
        default: '',
    },
    studentId: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
