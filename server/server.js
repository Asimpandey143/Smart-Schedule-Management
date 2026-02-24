
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');

dotenv.config();

connectDB();

const app = express();

const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL]
        : true, // Allow all in development
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/classrooms', require('./routes/classroomRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/chat', require('./routes/chatRoutes')); // AI Chat Route

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5001; // Using 5001 as per .env

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});