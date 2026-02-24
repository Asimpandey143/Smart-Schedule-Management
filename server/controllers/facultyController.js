const User = require('../models/User');

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private/Admin
const getFaculty = async (req, res) => {
    try {
        const faculty = await User.find({ role: 'faculty' }).select('-password');
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a faculty member
// @route   POST /api/faculty
// @access  Private/Admin
const addFaculty = async (req, res) => {
    const { name, email, password, department } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const faculty = await User.create({
            name,
            email,
            password,
            role: 'faculty',
            department,
        });

        if (faculty) {
            res.status(201).json({
                _id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                role: faculty.role,
                department: faculty.department,
            });
        } else {
            res.status(400).json({ message: 'Invalid faculty data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update faculty
// @route   PUT /api/faculty/:id
// @access  Private/Admin
const updateFaculty = async (req, res) => {
    const { name, email, department } = req.body;

    try {
        const faculty = await User.findById(req.params.id);

        if (faculty) {
            faculty.name = name || faculty.name;
            faculty.email = email || faculty.email;
            faculty.department = department || faculty.department;

            const updatedFaculty = await faculty.save();

            res.json({
                _id: updatedFaculty._id,
                name: updatedFaculty.name,
                email: updatedFaculty.email,
                role: updatedFaculty.role,
                department: updatedFaculty.department,
            });
        } else {
            res.status(404).json({ message: 'Faculty not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete faculty
// @route   DELETE /api/faculty/:id
// @access  Private/Admin
const deleteFaculty = async (req, res) => {
    try {
        const faculty = await User.findById(req.params.id);

        if (faculty) {
            if (faculty.role !== 'faculty') {
                return res.status(400).json({ message: 'User is not a faculty member' });
            }
            await User.deleteOne({ _id: faculty._id });
            res.json({ message: 'Faculty removed' });
        } else {
            res.status(404).json({ message: 'Faculty not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFaculty,
    addFaculty,
    updateFaculty,
    deleteFaculty,
};
