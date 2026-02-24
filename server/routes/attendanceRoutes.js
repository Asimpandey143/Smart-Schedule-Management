const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getStudentAttendance,
    getCourseAttendance,
    getAllAttendance,
    getFacultyAttendanceHistory
} = require('../controllers/attendanceController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, markAttendance);
router.get('/student', protect, getStudentAttendance);
router.get('/faculty-history', protect, authorize('faculty'), getFacultyAttendanceHistory);
router.get('/course/:courseId', protect, getCourseAttendance);
router.get('/all', protect, admin, getAllAttendance);

module.exports = router;
