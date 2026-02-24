const Notification = require('../models/Notification');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (notification) {
            notification.read = true;
            await notification.save();
            res.json({ message: 'Notification marked as read' });
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear all notifications for a user
// @route   DELETE /api/notifications
// @access  Private
const clearNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user._id });
        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    clearNotifications
};
