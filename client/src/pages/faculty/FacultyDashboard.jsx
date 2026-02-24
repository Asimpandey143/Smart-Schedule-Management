import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaChalkboardTeacher, FaCalendarWeek, FaClipboardCheck, FaBed, FaClock, FaDoorOpen, FaArrowRight } from 'react-icons/fa';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const [todayClasses, setTodayClasses] = useState([]);
    const [stats, setStats] = useState({
        today: 0,
        weekly: 0,
        pendingAttendance: 'Checking...',
        leaveStatus: 'Active'
    });
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get('/timetable');

                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const todayName = days[new Date().getDay()];

                const today = data.filter(slot => slot.day === todayName);
                const sortedToday = today.sort((a, b) => a.startTime.localeCompare(b.startTime));

                setTodayClasses(sortedToday);
                setStats({
                    today: today.length,
                    weekly: data.length,
                    pendingAttendance: today.length > 0 ? today.length : 0,
                    leaveStatus: 'On Duty'
                });

                // Fetch recent attendance
                const attendRes = await api.get('/attendance/faculty-history');
                setRecentAttendance(attendRes.data.slice(0, 3));
            } catch (err) {
                console.error('Error fetching faculty dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDashboardData();
    }, [user]);

    const statCards = [
        { title: "Today's Lectures", value: stats.today, icon: <FaChalkboardTeacher />, color: "bg-blue-600 shadow-blue-500/30", link: "/faculty/timetable" },
        { title: "Weekly Load", value: stats.weekly, icon: <FaCalendarWeek />, color: "bg-emerald-600 shadow-emerald-500/30", link: "/faculty/timetable" },
        { title: "Attendance To-do", value: stats.pendingAttendance, icon: <FaClipboardCheck />, color: "bg-orange-600 shadow-orange-500/30", link: "/faculty/attendance" },
        { title: "Current Status", value: stats.leaveStatus, icon: <FaBed />, color: "bg-purple-600 shadow-purple-500/30", link: "/faculty/leave" },
    ];

    if (loading) return <div className="p-10 text-center font-bold text-gray-500 animate-pulse">Initializing Professor Dashboard...</div>;

    return (
        <div className="p-4 md:p-10 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen text-left">
            <div className="mb-6 md:mb-10">
                <h1 className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter uppercase">
                    Welcome, Prof. {user?.name.split(' ')[0]} 👋
                </h1>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">Here's your overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                {statCards.map((stat, index) => (
                    <Link to={stat.link} key={index} className={`block p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl ${stat.color} text-white transform hover:scale-105 transition-all duration-300`}>
                        <div className="flex justify-between items-center h-full">
                            <div>
                                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80 mb-1 md:mb-2">{stat.title}</p>
                                <h3 className="text-3xl md:text-4xl font-black">{stat.value}</h3>
                            </div>
                            <div className="text-3xl md:text-4xl opacity-30">{stat.icon}</div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                {/* Today's Schedule - Larger Column */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6 md:mb-8">
                        <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Today's Sessions</h2>
                        <Link to="/faculty/timetable" className="text-blue-600 font-bold text-[10px] md:text-xs uppercase tracking-widest flex items-center hover:underline">
                            Full Schedule <FaArrowRight className="ml-2" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {todayClasses.length === 0 ? (
                            <div className="py-12 bg-gray-50 dark:bg-gray-700/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                                <p className="text-gray-400 font-bold text-sm">No classes scheduled for today! 🎉</p>
                            </div>
                        ) : (
                            todayClasses.map((cls, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 bg-gray-50 dark:bg-gray-700/50 rounded-[2rem] border-l-8 border-blue-500 hover:shadow-md transition-all">
                                    <div className="flex items-center mb-4 md:mb-0">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mr-4 md:mr-6 flex-shrink-0">
                                            <FaClock />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-800 dark:text-gray-100 text-base md:text-lg leading-tight">{cls.course?.courseName || 'Untitled Session'}</h4>
                                            <p className="text-[10px] md:text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">{cls.startTime} - {cls.endTime}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end space-x-4 md:space-x-8 w-full md:w-auto">
                                        <div className="text-left md:text-right">
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Classroom</p>
                                            <span className="flex items-center text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300">
                                                <FaDoorOpen className="mr-2 text-emerald-500" />
                                                Room {cls.classroom?.roomNumber || 'TBD'}
                                            </span>
                                        </div>
                                        <Link
                                            to="/faculty/attendance"
                                            state={{ selectedClass: cls }}
                                            className="px-5 py-2.5 md:px-6 md:py-3 bg-white dark:bg-gray-600 text-gray-800 dark:text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all"
                                        >
                                            Mark
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel: Academic History & Tools */}
                <div className="space-y-6 md:space-y-10">
                    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6 md:mb-8">
                            <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">History</h2>
                            <Link to="/faculty/view-attendance" className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest hover:underline">Full Log</Link>
                        </div>
                        <div className="space-y-4">
                            {recentAttendance.length === 0 ? (
                                <p className="text-gray-400 text-xs text-center py-4 italic">No history yet</p>
                            ) : (
                                recentAttendance.map((log, i) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">{log.course?.courseName}</p>
                                            <span className="text-[9px] font-black text-emerald-500 uppercase">{log.students.filter(s => s.status === 'Present').length}/{log.students.length} P</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium">{new Date(log.date).toLocaleDateString()} • {log.startTime}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter mb-6 md:mb-8">Tools</h2>
                        <div className="grid grid-cols-1 gap-3 md:gap-4 text-left">
                            <Link to="/faculty/attendance" className="p-5 md:p-6 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-[2rem] hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all border border-blue-100 dark:border-blue-900/20 flex flex-col justify-center h-full">
                                <FaClipboardCheck className="text-2xl mb-2 md:mb-3" />
                                <p className="font-black text-xs uppercase tracking-widest">Attendance</p>
                                <p className="text-[10px] opacity-70 mt-1 font-medium">Register student presence</p>
                            </Link>
                            <Link to="/faculty/materials" className="p-5 md:p-6 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-[2rem] hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all border border-emerald-100 dark:border-emerald-900/20 flex flex-col justify-center h-full">
                                <FaChalkboardTeacher className="text-2xl mb-2 md:mb-3" />
                                <p className="font-black text-xs uppercase tracking-widest">Materials</p>
                                <p className="text-[10px] opacity-70 mt-1 font-medium">Upload lecture notes/resources</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
