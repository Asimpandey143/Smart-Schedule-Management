const express = require('express');
const {
    getCourses,
    addCourse,
    updateCourse,
    deleteCourse,
} = require('../controllers/courseController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin', 'faculty', 'student'), getCourses)
    .post(protect, admin, addCourse);

router.route('/:id')
    .put(protect, admin, updateCourse)
    .delete(protect, admin, deleteCourse);

module.exports = router;
