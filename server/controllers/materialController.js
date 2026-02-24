const Material = require('../models/Material');
const Course = require('../models/Course');
const path = require('path');
const fs = require('fs');

// @desc    Upload course material
// @route   POST /api/materials
// @access  Private/Faculty
const uploadMaterial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, description, courseId, fileType } = req.body;

        const material = await Material.create({
            title,
            description,
            course: courseId,
            faculty: req.user._id,
            fileType: fileType || 'other',
            filePath: `/uploads/${req.file.filename}`,
            originalName: req.file.originalname,
            size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB'
        });

        res.status(201).json(material);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get materials for a course (Student view) or for faculty (Faculty view)
// @route   GET /api/materials
// @access  Private
const getMaterials = async (req, res) => {
    try {
        let query = {};

        // If query parameters provided
        if (req.query.courseId) {
            query.course = req.query.courseId;
        } else if (req.user.role === 'faculty') {
            // By default, faculty sees their own uploads
            query.faculty = req.user._id;
        } else if (req.user.role === 'student') {
            // Students see materials for their department and their year ONLY
            // Students see materials for their department and their year ONLY
            const studentDept = req.user.department;
            const studentYear = req.user.year; // "1st Year", "2nd Year", "3rd Year", "4th Year"

            // Map Year string to "Year" number stored in 'semester' field
            let targetYear = studentYear; // Default to the raw value

            if (studentYear) {
                const s = studentYear.toString().toLowerCase().trim();
                if (s.includes('1st') || s === '1') targetYear = '1';
                else if (s.includes('2nd') || s === '2') targetYear = '2';
                else if (s.includes('3rd') || s === '3') targetYear = '3';
                else if (s.includes('4th') || s === '4') targetYear = '4';
            }

            // Find courses that match Dept AND Year (stored in semester field)
            const relevantCourses = await Course.find({
                department: studentDept,
                semester: targetYear
            }).distinct('_id');

            // Find materials linked to these courses
            query = { course: { $in: relevantCourses } };
        }

        const materials = await Material.find(query)
            .populate('course', 'courseName courseCode semester')
            .populate('faculty', 'name')
            .sort({ createdAt: -1 });

        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private/Faculty
const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Check ownership
        if (material.faculty.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', material.filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Material.deleteOne({ _id: material._id });
        res.json({ message: 'Material removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadMaterial,
    getMaterials,
    deleteMaterial
};
