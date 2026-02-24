const express = require('express');
const {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
} = require('../controllers/studentController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin', 'faculty'), getStudents)
    .post(protect, admin, addStudent);

router.route('/:id')
    .put(protect, admin, updateStudent)
    .delete(protect, admin, deleteStudent);

module.exports = router;
