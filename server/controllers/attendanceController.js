const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private/Faculty
const markAttendance = async (req, res) => {
    const { courseId, students, date, startTime, endTime } = req.body;

    try {
        const attendance = await Attendance.create({
            course: courseId,
            students,
            date,
            startTime,
            endTime,
            faculty: req.user._id
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance for a student
// @route   GET /api/attendance/student
// @access  Private/Student
const getStudentAttendance = async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find({
            'students.student': req.user._id
        }).populate('course', 'courseName courseCode');

        // Transform results for frontend
        const subjectsData = {};

        attendanceRecords.forEach(record => {
            const courseName = record.course.courseName;
            if (!subjectsData[courseName]) {
                subjectsData[courseName] = { name: courseName, attended: 0, total: 0 };
            }

            subjectsData[courseName].total += 1;
            const studentEntry = record.students.find(s => s.student.toString() === req.user._id.toString());
            if (studentEntry && studentEntry.status === 'Present') {
                subjectsData[courseName].attended += 1;
            }
        });

        const result = Object.values(subjectsData).map(sub => ({
            ...sub,
            percentage: sub.total > 0 ? Math.round((sub.attended / sub.total) * 100) : 0
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance for a course (for faculty)
// @route   GET /api/attendance/course/:courseId
// @access  Private/Faculty
const getCourseAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ course: req.params.courseId })
            .populate('students.student', 'name email');
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all attendance records (for admin)
// @route   GET /api/attendance/all
// @access  Private/Admin
const getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({})
            .populate('course', 'courseName courseCode')
            .populate('faculty', 'name')
            .sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance history for logged-in faculty
// @route   GET /api/attendance/faculty-history
// @access  Private/Faculty
const getFacultyAttendanceHistory = async (req, res) => {
    try {
        const attendance = await Attendance.find({ faculty: req.user._id })
            .populate('course', 'courseName courseCode semester department')
            .populate('students.student', 'name email rollNumber')
            .sort({ date: -1, createdAt: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markAttendance,
    getStudentAttendance,
    getCourseAttendance,
    getAllAttendance,
    getFacultyAttendanceHistory
};
