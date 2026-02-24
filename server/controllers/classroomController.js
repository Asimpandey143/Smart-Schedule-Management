const Classroom = require('../models/Classroom');

// @desc    Get all classrooms
// @route   GET /api/classrooms
// @access  Private/Admin
const getClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find({});
        res.json(classrooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a classroom
// @route   POST /api/classrooms
// @access  Private/Admin
const addClassroom = async (req, res) => {
    const { roomNumber, capacity, type, building, department } = req.body;

    try {
        const roomExists = await Classroom.findOne({ roomNumber });

        if (roomExists) {
            return res.status(400).json({ message: 'Room number already exists' });
        }

        const classroom = await Classroom.create({
            roomNumber,
            capacity,
            type,
            building,
            department
        });

        if (classroom) {
            res.status(201).json(classroom);
        } else {
            res.status(400).json({ message: 'Invalid classroom data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update classroom
// @route   PUT /api/classrooms/:id
// @access  Private/Admin
const updateClassroom = async (req, res) => {
    const { roomNumber, capacity, type, building, department } = req.body;

    try {
        const classroom = await Classroom.findById(req.params.id);

        if (classroom) {
            classroom.roomNumber = roomNumber || classroom.roomNumber;
            classroom.capacity = capacity || classroom.capacity;
            classroom.type = type || classroom.type;
            classroom.building = building || classroom.building;
            classroom.department = department || classroom.department;

            const updatedClassroom = await classroom.save();
            res.json(updatedClassroom);
        } else {
            res.status(404).json({ message: 'Classroom not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete classroom
// @route   DELETE /api/classrooms/:id
// @access  Private/Admin
const deleteClassroom = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);

        if (classroom) {
            await Classroom.deleteOne({ _id: classroom._id });
            res.json({ message: 'Classroom removed' });
        } else {
            res.status(404).json({ message: 'Classroom not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getClassrooms,
    addClassroom,
    updateClassroom,
    deleteClassroom,
};
