const express = require('express');
const {
    generateTimetable,
    getTimetable,
    getAdminTimetable,
    getFacultyTimetable,
    getStudentTimetable,
    addTimetableEntry,
    deleteTimetableEntry,
    clearAllTimetables
} = require('../controllers/timetableController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Strict RBAC Routes
router.get('/admin', protect, authorize('admin'), getAdminTimetable);
router.get('/faculty', protect, authorize('faculty'), getFacultyTimetable);
router.get('/student', protect, authorize('student'), getStudentTimetable);

// Legacy/General Route (Auto-redirects based on role)
router.get('/', protect, getTimetable);

// Admin Actions
router.post('/generate', protect, admin, generateTimetable);
router.post('/manual', protect, admin, addTimetableEntry);
router.delete('/all', protect, admin, clearAllTimetables);
router.delete('/:id', protect, admin, deleteTimetableEntry);

module.exports = router;
