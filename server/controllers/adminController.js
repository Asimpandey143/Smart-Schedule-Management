const User = require('../models/User');
const Course = require('../models/Course');
const Classroom = require('../models/Classroom');
const Timetable = require('../models/Timetable');
const Attendance = require('../models/Attendance');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalFaculty = await User.countDocuments({ role: 'faculty' });
        const totalCourses = await Course.countDocuments();
        const totalClassrooms = await Classroom.countDocuments();
        const activeConflicts = await Timetable.countDocuments({ isConflict: true });

        // Calculate Faculty Workload (Classes per week)
        const timetableEntries = await Timetable.find({}).populate('faculty', 'name');
        const workloadMap = {};
        timetableEntries.forEach(entry => {
            if (entry.faculty) {
                const name = entry.faculty.name;
                workloadMap[name] = (workloadMap[name] || 0) + 1;
            }
        });
        const facultyWorkload = Object.keys(workloadMap).map(name => ({
            name,
            value: workloadMap[name]
        }));

        // Calculate Weekly Attendance (Current Week)
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const attendanceRecords = await Attendance.find({
            date: { $gte: startOfWeek }
        });

        const weeklyStats = {
            'Mon': { present: 0, total: 0 },
            'Tue': { present: 0, total: 0 },
            'Wed': { present: 0, total: 0 },
            'Thu': { present: 0, total: 0 },
            'Fri': { present: 0, total: 0 },
        };

        attendanceRecords.forEach(record => {
            const dayName = new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' });
            if (weeklyStats[dayName]) {
                const dayPresent = record.students.filter(s => s.status === 'Present').length;
                weeklyStats[dayName].present += dayPresent;
                weeklyStats[dayName].total += record.students.length;
            }
        });

        const weeklyAttendance = Object.keys(weeklyStats).map(day => {
            const { present, total } = weeklyStats[day];
            const rate = total > 0 ? Math.round((present / total) * 100) : 0;
            return {
                day,
                present: rate,
                absent: total > 0 ? 100 - rate : 0
            };
        });

        res.json({
            totalStudents,
            totalFaculty,
            totalCourses,
            totalClassrooms,
            activeConflicts,
            facultyWorkload,
            weeklyAttendance,
            weekStartDate: startOfWeek.toLocaleDateString()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
