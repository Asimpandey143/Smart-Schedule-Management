const Course = require('../models/Course');
const Timetable = require('../models/Timetable');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private/Admin
const getCourses = async (req, res) => {
    try {
        const userRole = (req.user.role || '').toLowerCase();
        let query = {};

        if (userRole === 'faculty') {
            console.log(`[DEBUG] Faculty ID: ${req.user._id}, Department: ${req.user.department}`);

            // Find courses assigned to this faculty in the timetable
            const assignedEntries = await Timetable.find({ faculty: req.user._id }).distinct('course');
            console.log(`[DEBUG] Assigned Courses: ${assignedEntries.length} found`);

            // Allow access to courses in their department OR explicitly assigned in timetable
            query = {
                $or: [
                    { _id: { $in: assignedEntries } },
                    { department: req.user.department }
                ]
            };
            console.log(`[DEBUG] Final Query:`, JSON.stringify(query));
        } else if (userRole === 'student') {
            // Find courses for student's department and semester
            // Find courses for student's department and year
            const studentYear = req.user.year;
            let targetYear = studentYear;

            // Map standard year strings to simple numbers if needed
            if (studentYear) {
                const s = studentYear.toString().toLowerCase().trim();
                // Check if it already IS just a number 1-4
                if (s === '1' || s.includes('1st')) targetYear = '1';
                else if (s === '2' || s.includes('2nd')) targetYear = '2';
                else if (s === '3' || s.includes('3rd')) targetYear = '3';
                else if (s === '4' || s.includes('4th')) targetYear = '4';
            }

            query = {
                department: req.user.department,
                semester: targetYear
            };
        } else if (userRole === 'admin') {
            query = {}; // Admin sees everything
        }

        const courses = await Course.find(query);
        res.json(courses);
    } catch (error) {
        console.error('Fetch Courses Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a course
// @route   POST /api/courses
// @access  Private/Admin
const addCourse = async (req, res) => {
    const { courseName, courseCode, department, semester, credits } = req.body;

    try {
        const courseExists = await Course.findOne({ courseCode });

        if (courseExists) {
            return res.status(400).json({ message: 'Course code already exists' });
        }

        const course = await Course.create({
            courseName,
            courseCode,
            department,
            semester,
            credits,
        });

        if (course) {
            res.status(201).json(course);
        } else {
            res.status(400).json({ message: 'Invalid course data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
    const { courseName, courseCode, department, semester, credits } = req.body;

    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            course.courseName = courseName || course.courseName;
            course.courseCode = courseCode || course.courseCode;
            course.department = department || course.department;
            course.semester = semester || course.semester;
            course.credits = credits || course.credits;

            const updatedCourse = await course.save();
            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            await Course.deleteOne({ _id: course._id });
            res.json({ message: 'Course removed' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCourses,
    addCourse,
    updateCourse,
    deleteCourse,
};
