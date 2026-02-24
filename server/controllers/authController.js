const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    let { name, email, password, role, department, year, section, studentClass } = req.body;
    email = email.trim().toLowerCase();
    console.log(`Registration attempt for: ${email}`);

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log(`Registration failed: ${email} already exists`);
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            department,
            year,
            section,
            studentClass,
        });

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                year: user.year,
                section: user.section,
                studentClass: user.studentClass,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar,
                studentId: user.studentId,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();
    console.log(`Login attempt for: ${email}`);

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            console.log(`Login successful for: ${email}`);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                year: user.year,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar,
                studentId: user.studentId,
                token: generateToken(user._id),
            });
        } else {
            console.log(`Login failed for: ${email} - Invalid credentials`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(`Login error for ${email}:`, error.message);
        res.status(500).json({ message: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authenticated or ID missing' });
        }

        console.log('Update Profile Request for:', req.user.email);
        const user = await User.findById(req.user._id);

        if (user) {
            // Only update if value is provided, otherwise keep existing
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.password) {
                user.password = req.body.password;
            }

            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.studentId = req.body.studentId || user.studentId;
            user.department = req.body.department || user.department;
            user.year = req.body.year || user.year;

            if (req.file) {
                // Ensure the path is relative to the server root or handled by static middleware
                user.avatar = `/uploads/${req.file.filename}`;
            }

            const updatedUser = await user.save();
            console.log('Profile saved successfully for:', updatedUser.email);

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                department: updatedUser.department,
                year: updatedUser.year,
                phone: updatedUser.phone,
                address: updatedUser.address,
                avatar: updatedUser.avatar,
                studentId: updatedUser.studentId,
                token: generateToken(updatedUser._id),
            });
        } else {
            console.error('User not found in DB for ID:', req.user._id);
            res.status(404).json({ message: 'User object not found in database' });
        }
    } catch (error) {
        console.error('SERVER PROFILE UPDATE EXCEPTION:', error);
        res.status(500).json({
            message: 'Error updating profile',
            details: error.message
        });
    }
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(oldPassword))) {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid old password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, authUser, updateUserProfile, changePassword };
