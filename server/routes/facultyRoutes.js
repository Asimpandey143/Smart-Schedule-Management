const express = require('express');
const {
    getFaculty,
    addFaculty,
    updateFaculty,
    deleteFaculty,
} = require('../controllers/facultyController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, admin, getFaculty)
    .post(protect, admin, addFaculty);

router.route('/:id')
    .put(protect, admin, updateFaculty)
    .delete(protect, admin, deleteFaculty);

module.exports = router;
