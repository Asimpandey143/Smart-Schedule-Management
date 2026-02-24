const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a student
// @route   POST /api/students
// @access  Private/Admin
const addStudent = async (req, res) => {
    const { name, email, password, department, year } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const student = await User.create({
            name,
            email,
            password,
            role: 'student',
            department,
            year,
        });

        if (student) {
            res.status(201).json({
                _id: student._id,
                name: student.name,
                email: student.email,
                role: student.role,
                department: student.department,
                year: student.year,
            });
        } else {
            res.status(400).json({ message: 'Invalid student data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
    const { name, email, department, year } = req.body;

    try {
        const student = await User.findById(req.params.id);

        if (student) {
            student.name = name || student.name;
            student.email = email || student.email;
            student.department = department || student.department;
            student.year = year || student.year;

            const updatedStudent = await student.save();

            res.json({
                _id: updatedStudent._id,
                name: updatedStudent.name,
                email: updatedStudent.email,
                role: updatedStudent.role,
                department: updatedStudent.department,
                year: updatedStudent.year,
            });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);

        if (student) {
            if (student.role !== 'student') {
                return res.status(400).json({ message: 'User is not a student' });
            }
            await User.deleteOne({ _id: student._id });
            res.json({ message: 'Student removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
};
