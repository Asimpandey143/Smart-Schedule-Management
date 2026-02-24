const Leave = require('../models/Leave');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Faculty/Student)
const applyLeave = async (req, res) => {
    try {
        const { leaveType, leaveCategory, startDate, endDate, reason } = req.body;

        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const leave = await Leave.create({
            user: req.user._id,
            role: req.user.role,
            leaveCategory: leaveCategory || 'Leave',
            leaveType,
            startDate,
            endDate,
            reason
        });

        // Notify Admins
        const admins = await User.find({ role: 'admin' });
        const notifications = admins.map(admin => ({
            recipient: admin._id,
            title: `New ${leaveCategory || 'Leave'} Request`,
            message: `${req.user.name} (${req.user.role}) has applied for ${leaveType} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.`,
            type: 'info'
        }));
        await Notification.insertMany(notifications);

        res.status(201).json(leave);
    } catch (error) {
        console.error('Apply Leave Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user's leave history
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all leave requests (Admin)
// @route   GET /api/leaves
// @access  Private (Admin Only)
const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({})
            .populate('user', 'name department year email role')
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/leaves/:id
// @access  Private (Admin Only)
const updateLeaveStatus = async (req, res) => {
    try {
        const { status, adminComments } = req.body;
        const leave = await Leave.findById(req.params.id).populate('user');

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        leave.status = status || leave.status;
        leave.adminComments = adminComments || leave.adminComments;

        const updatedLeave = await leave.save();

        // Notify Applicant
        await Notification.create({
            recipient: leave.user._id,
            title: `Leave Request ${status}`,
            message: `Your ${leave.leaveCategory} request has been ${status}. ${adminComments ? `Comment: ${adminComments}` : ''}`,
            type: status === 'Approved' ? 'success' : 'warning'
        });

        // If Student Leave Approved, Notify Department Faculty
        if (status === 'Approved' && leave.role === 'student') {
            const facultyMembers = await User.find({
                role: 'faculty',
                department: leave.user.department
            });

            const facultyNotifications = facultyMembers.map(faculty => ({
                recipient: faculty._id,
                title: 'Student Leave Approved',
                message: `Student ${leave.user.name} (Year ${leave.user.year}) will be on ${leave.leaveType} from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}.`,
                type: 'info'
            }));

            if (facultyNotifications.length > 0) {
                await Notification.insertMany(facultyNotifications);
            }
        }

        res.json(updatedLeave);
    } catch (error) {
        console.error('Update Leave Status Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete leave request
// @route   DELETE /api/leaves/:id
// @access  Private
const deleteLeaveRequest = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Authorization check
        // Admin can delete any request
        // Users can only delete their own
        if (req.user.role !== 'admin' && leave.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this request' });
        }

        await Leave.deleteOne({ _id: leave._id });
        res.json({ message: 'Leave request deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get approved leaves of students in faculty's department
// @route   GET /api/leaves/department
// @access  Private (Faculty Only)
const getDepartmentLeaves = async (req, res) => {
    try {
        // Find leaves for students who are approved
        // Populating user to check department
        const leaves = await Leave.find({
            role: 'student',
            status: 'Approved'
        })
            .populate('user', 'name department year email')
            .sort({ startDate: 1 });

        // Filter for current faculty's department
        const departmentLeaves = leaves.filter(leave =>
            leave.user && leave.user.department === req.user.department
        );

        res.json(departmentLeaves);
    } catch (error) {
        console.error('Dept Leaves Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus,
    deleteLeaveRequest,
    getDepartmentLeaves
};
