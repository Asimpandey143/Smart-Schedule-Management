const express = require('express');
const router = express.Router();
const {
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAnnouncements)
    .post(protect, authorize('admin', 'faculty'), createAnnouncement);

router.route('/:id')
    .delete(protect, authorize('admin', 'faculty'), deleteAnnouncement);

module.exports = router;
