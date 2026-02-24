const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const Classroom = require('../models/Classroom');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Conflict Detection Engine
// Conflict Detection Engine
const hasConflict = (newEntry, existingEntries) => {
    return existingEntries.some(entry => {
        const sameTime = entry.day === newEntry.day && entry.startTime === newEntry.startTime;
        if (!sameTime) return false;

        const roomClash = String(entry.classroom) === String(newEntry.classroom);
        const facultyClash = String(entry.faculty) === String(newEntry.faculty);

        // A batch clash ONLY happens if it's the SAME SEMESTER and SAME DEPARTMENT
        const batchClash = String(entry.semester) === String(newEntry.semester) &&
            String(entry.department) === String(newEntry.department);

        return roomClash || facultyClash || batchClash;
    });
};

// @desc    Generate a new timetable with conflict detection
// @route   POST /api/timetable/generate
// @access  Private/Admin
const generateTimetable = async (req, res) => {
    try {
        const { targetDays, department, semester } = req.body;
        const daysToGenerate = targetDays && targetDays.length > 0
            ? targetDays
            : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        // 1. Fetch resources
        const courseQuery = {};
        if (department) courseQuery.department = department;
        if (semester) courseQuery.semester = semester;

        const [courses, classrooms, facultyMembers, existingTimetable] = await Promise.all([
            Course.find(courseQuery),
            Classroom.find({}),
            User.find({ role: 'faculty' }),
            Timetable.find({}) // Get all for conflict detection
        ]);

        if (courses.length === 0 || classrooms.length === 0 || facultyMembers.length === 0) {
            return res.status(400).json({ message: 'Missing courses, rooms, or faculty for this selection.' });
        }

        // 2. TARGETED CLEARANCE
        const deleteQuery = { day: { $in: daysToGenerate } };
        if (department) deleteQuery.department = department;
        if (semester) deleteQuery.semester = semester;

        await Timetable.deleteMany(deleteQuery);
        console.log(`Cleared existing slots for: ${department || 'All'} - Yr ${semester || 'All'} on ${daysToGenerate.join(', ')}`);

        // Filter existing timetable to remove what we just deleted (for local conflict check)
        const activeExisting = existingTimetable.filter(t => {
            const isTargetDay = daysToGenerate.includes(t.day);
            const isTargetDept = department ? t.department === department : true;
            const isTargetYear = semester ? t.semester === semester : true;
            return !(isTargetDay && isTargetDept && isTargetYear);
        });

        // Identify courses already scheduled in other days to avoid over-scheduling
        const scheduledCourseIds = new Set(activeExisting.map(t => String(t.course)));

        const timeSlots = [
            { start: '09:00', end: '10:00' },
            { start: '10:00', end: '11:00' },
            { start: '11:00', end: '12:00' },
            { start: '13:00', end: '14:00' },
            { start: '14:00', end: '15:00' },
            { start: '15:00', end: '16:00' },
        ];

        const generatedTimetable = [];
        const workloadMap = {};
        facultyMembers.forEach(f => {
            const currentWorkload = activeExisting.filter(t => String(t.faculty) === String(f._id)).length;
            workloadMap[String(f._id)] = currentWorkload;
        });

        // 3. GENERATION LOOP
        const sortedCourses = [...courses].sort((a, b) => a.courseCode.localeCompare(b.courseCode));
        let dayRotationIndex = 0;

        for (const course of sortedCourses) {
            if (daysToGenerate.length < 5 && scheduledCourseIds.has(String(course._id))) {
                continue;
            }

            let assigned = false;
            const facultyCandidates = [...facultyMembers].sort((a, b) =>
                (workloadMap[String(a._id)] || 0) - (workloadMap[String(b._id)] || 0)
            );

            for (const faculty of facultyCandidates) {
                if (faculty.department !== course.department) continue;

                for (let i = 0; i < daysToGenerate.length; i++) {
                    const day = daysToGenerate[(dayRotationIndex + i) % daysToGenerate.length];

                    for (const slot of timeSlots) {
                        for (const room of classrooms) {
                            const newEntry = {
                                course: course._id,
                                faculty: faculty._id,
                                classroom: room._id,
                                day,
                                startTime: slot.start,
                                endTime: slot.end,
                                semester: course.semester,
                                department: course.department
                            };

                            if (!hasConflict(newEntry, [...generatedTimetable, ...activeExisting])) {
                                generatedTimetable.push(newEntry);
                                workloadMap[String(faculty._id)]++;
                                assigned = true;
                                break;
                            }
                        }
                        if (assigned) break;
                    }
                    if (assigned) break;
                }
                if (assigned) {
                    dayRotationIndex++;
                    break;
                }
            }
        }

        // 4. Persistence
        if (generatedTimetable.length > 0) {
            const result = await Timetable.insertMany(generatedTimetable);
            res.status(201).json({
                message: `Successfully synchronized ${result.length} sessions for ${department || 'All'} - Year ${semester || 'All'}.`,
                count: result.length
            });
        } else {
            res.status(400).json({ message: 'No available slots found without structural conflicts.' });
        }
    } catch (error) {
        console.error('GENERATE EXCEPTION:', error);
        res.status(500).json({ message: 'Internal Generator Error', details: error.message });
    }
};

// @desc    Get full timetable (Admin)
// @route   GET /api/timetable/admin
// @access  Private/Admin
const getAdminTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.find({})
            .populate('course')
            .populate('faculty', 'name email')
            .populate('classroom', 'roomNumber')
            .sort({ day: 1, startTime: 1 });
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get faculty-specific timetable
// @route   GET /api/timetable/faculty
// @access  Private/Faculty
const getFacultyTimetable = async (req, res) => {
    try {
        // STRICT PERSONAL FILTER
        const timetable = await Timetable.find({ faculty: req.user._id })
            .populate('course')
            .populate('faculty', 'name email')
            .populate('classroom', 'roomNumber')
            .sort({ day: 1, startTime: 1 });
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student-specific timetable
// @route   GET /api/timetable/student
// @access  Private/Student
const getStudentTimetable = async (req, res) => {
    try {
        const studentCourses = await Course.find({
            department: req.user.department,
            semester: req.user.year
        });
        const courseIds = studentCourses.map(c => c._id);

        const timetable = await Timetable.find({ course: { $in: courseIds } })
            .populate('course')
            .populate('faculty', 'name email') // Student sees faculty name
            // No sensitive workload details exposed here
            .populate('classroom', 'roomNumber')
            .sort({ day: 1, startTime: 1 });

        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Legacy support (redirects based on role, optional but good for backward compat if needed temporarily)
const getTimetable = async (req, res) => {
    const role = (req.user.role || '').toLowerCase();
    if (role === 'admin') return getAdminTimetable(req, res);
    if (role === 'faculty') return getFacultyTimetable(req, res);
    if (role === 'student') return getStudentTimetable(req, res);
    return res.status(403).json({ message: 'Unknown role' });
};

// @desc    Add manual timetable entry
// @route   POST /api/timetable/manual
// @access  Private/Admin
const addTimetableEntry = async (req, res) => {
    try {
        const { course, faculty, classroom, day, startTime, endTime, semester } = req.body;

        const courseDetails = await Course.findById(course);
        const resolvedSemester = semester || courseDetails?.semester;
        const resolvedDept = courseDetails?.department;

        const newEntry = {
            course,
            faculty,
            classroom,
            day,
            startTime,
            endTime,
            semester: resolvedSemester,
            department: resolvedDept
        };

        const existingEntries = await Timetable.find({});

        // Detailed conflict check using the same logic as the engine
        const conflictDetected = existingEntries.some(entry => {
            const sameTime = entry.day === newEntry.day && entry.startTime === newEntry.startTime;
            if (!sameTime) return false;

            const roomClash = String(entry.classroom) === String(newEntry.classroom);
            const facultyClash = String(entry.faculty) === String(newEntry.faculty);
            const batchClash = String(entry.semester) === String(newEntry.semester) &&
                String(entry.department) === String(newEntry.department);

            return roomClash || facultyClash || batchClash;
        });

        // Save even if conflict exists, but mark it
        const timetableEntry = await Timetable.create({
            ...newEntry,
            isConflict: conflictDetected
        });

        // Create notification for admin if conflict exists
        if (conflictDetected) {
            await Notification.create({
                recipient: req.user._id,
                title: 'Scheduling Conflict Detected',
                message: `A manual entry for ${courseDetails.courseName} triggered a conflict on ${newEntry.day} at ${newEntry.startTime}.`,
                type: 'warning'
            });
        }

        res.status(201).json({
            message: conflictDetected ? 'Warning: Entry added with scheduling conflicts!' : 'Entry added successfully!',
            data: timetableEntry,
            isConflict: conflictDetected
        });
    } catch (error) {
        console.error("Manual Entry Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete timetable entry
// @route   DELETE /api/timetable/:id
// @access  Private/Admin
const deleteTimetableEntry = async (req, res) => {
    try {
        const entry = await Timetable.findById(req.params.id);
        if (entry) {
            await Timetable.deleteOne({ _id: entry._id });
            res.json({ message: 'Entry removed' });
        } else {
            res.status(404).json({ message: 'Entry not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const clearAllTimetables = async (req, res) => {
    try {
        await Timetable.deleteMany({});
        res.json({ message: 'All timetable entries have been cleared successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generateTimetable,
    getTimetable,
    getAdminTimetable,
    getFacultyTimetable,
    getStudentTimetable,
    addTimetableEntry,
    deleteTimetableEntry,
    clearAllTimetables
};
