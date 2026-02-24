const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get announcements for the current user
// @route   GET /api/announcements
// @access  Private (Faculty, Student, Admin)
const getAnnouncements = async (req, res) => {
    try {
        const userRole = (req.user.role || '').toLowerCase();
        let filter = {};

        if (userRole === 'admin') {
            filter = {}; // Admin sees all
        } else if (userRole === 'faculty') {
            filter = {
                $or: [
                    { targetAudience: { $in: ['all', 'faculty'] } },
                    { sender: req.user._id }
                ]
            };
        } else if (userRole === 'student') {
            // Students see announcements:
            // 1. Where targetAudience is 'all' or 'student'
            // 2. AND (targetDepartment is 'all' OR matches their dept)
            // 3. AND (targetYear is 'all' OR matches their year)

            const dept = req.user.department;
            const year = req.user.year; // e.g. "2nd Year"

            // Simplify year to just the number if needed, but let's assume direct match or robust match
            // For simplicity, we'll do exact match or 'all'.
            // If faculty sends "2", we want "2nd Year" to match if we parse.
            // Let's store raw string for now and assume the dropdowns match.

            filter = {
                targetAudience: { $in: ['all', 'student'] },
                $or: [
                    { targetDepartment: 'all' },
                    { targetDepartment: dept }
                ],
                $and: [
                    {
                        $or: [
                            { targetYear: 'all' },
                            { targetYear: year }, // exact match "2nd Year"
                            // If faculty sends "2", let's try to match partial
                            { targetYear: { $regex: year?.split(' ')[0] || 'nevermatch', $options: 'i' } }
                        ]
                    }
                ]
            };
        } else {
            console.warn(`[getAnnouncements] Unknown role: ${userRole}. Defaulting to 'all'.`);
            filter = { targetAudience: 'all' }; // Default fallback
        }

        const announcements = await Announcement.find(filter)
            .populate('sender', 'name email role')
            .sort({ createdAt: -1 });

        res.json(announcements);
    } catch (error) {
        console.error(`[getAnnouncements] Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private/Admin only
const createAnnouncement = async (req, res) => {
    try {
        const { title, content, priority, targetAudience, targetDepartment, targetYear } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const announcement = await Announcement.create({
            title,
            content,
            priority: priority || 'medium',
            targetAudience: targetAudience || 'all',
            targetDepartment: targetDepartment || 'all',
            targetYear: targetYear || 'all',
            sender: req.user._id,
        });

        // NOTIFICATION LOGIC
        // 1. Build Query for Target Users
        let query = {};

        if (targetAudience === 'student') {
            query.role = 'student';
            if (targetDepartment && targetDepartment !== 'all') query.department = targetDepartment;
            if (targetYear && targetYear !== 'all') query.year = targetYear;
        } else if (targetAudience === 'faculty') {
            query.role = 'faculty';
            if (targetDepartment && targetDepartment !== 'all') query.department = targetDepartment;
        } else {
            // 'all' - notify everyone except admins (admins posted it usually)
            query.role = { $in: ['student', 'faculty'] };
        }

        // 2. Find Recipients
        const recipients = await User.find(query).select('_id');

        // 3. Create Notifications
        if (recipients.length > 0) {
            const notifications = recipients.map(user => ({
                recipient: user._id,
                title: `New Announcement: ${title}`,
                message: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                type: 'info'
            }));

            await Notification.insertMany(notifications);
        }

        res.status(201).json(announcement);
    } catch (error) {
        console.error(`[createAnnouncement] Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin/Faculty)
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Check ownership if user is faculty
        if (req.user.role === 'faculty' && announcement.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this announcement' });
        }

        await Announcement.deleteOne({ _id: announcement._id });
        res.json({ message: 'Announcement removed' });
    } catch (error) {
        console.error(`[deleteAnnouncement] Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
};
