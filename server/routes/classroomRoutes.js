const express = require('express');
const {
    getClassrooms,
    addClassroom,
    updateClassroom,
    deleteClassroom,
} = require('../controllers/classroomController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, admin, getClassrooms)
    .post(protect, admin, addClassroom);

router.route('/:id')
    .put(protect, admin, updateClassroom)
    .delete(protect, admin, deleteClassroom);

module.exports = router;
