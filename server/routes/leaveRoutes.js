const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus,
    deleteLeaveRequest,
    getDepartmentLeaves
} = require('../controllers/leaveController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

// Order matters! Specific routes before parameterized routes

router.route('/')
    .post(protect, authorize('faculty', 'student'), applyLeave)
    .get(protect, admin, getAllLeaves); // Admin views all leaves

router.route('/my')
    .get(protect, authorize('faculty', 'student'), getMyLeaves); // User views their own history

router.route('/department')
    .get(protect, authorize('faculty'), getDepartmentLeaves); // Faculty views student leaves

router.route('/:id')
    .put(protect, admin, updateLeaveStatus) // Admin approves/rejects
    .delete(protect, authorize('faculty', 'student', 'admin'), deleteLeaveRequest); // Delete request (User or Admin)

module.exports = router;
