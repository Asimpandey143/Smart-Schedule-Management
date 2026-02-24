import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaBookReader, FaCalendarCheck, FaClipboardList, FaBullhorn, FaMapMarkerAlt, FaClock, FaArrowRight, FaGraduationCap } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState([]);
    const [todaySessions, setTodaySessions] = useState([]);
    const [recentAnnouncements, setRecentAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Parallel fetch for Timetable and Announcements
                const [timetableRes, announcementsRes] = await Promise.all([
                    api.get('/timetable'),
                    api.get('/announcements')
                ]);

                const timetableData = timetableRes.data || [];
                const announcementsData = announcementsRes.data || [];

                // Process Timetable
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                // Filter for today and sort by start time
                const todayIndices = timetableData
                    .filter(s => s.day === today)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));

                setTodaySessions(todayIndices);

                // Process Announcements (Top 3)
                setRecentAnnouncements(announcementsData.slice(0, 3));

                // Process Stats
                setStats([
                    { title: "Today's Classes", value: todayIndices.length, icon: <FaBookReader />, color: "bg-blue-500", shadow: "shadow-blue-500/40", link: "/student/timetable" },
                    { title: "Weekly Load", value: timetableData.length, icon: <FaClipboardList />, color: "bg-emerald-500", shadow: "shadow-emerald-500/40", link: "/student/timetable" },
                    { title: "Year", value: user.year || 'N/A', icon: <FaCalendarCheck />, color: "bg-purple-500", shadow: "shadow-purple-500/40", link: null },
                    { title: "Notices", value: announcementsData.length, icon: <FaBullhorn />, color: "bg-orange-500", shadow: "shadow-orange-500/40", link: "/student/announcements" },
                ]);

            } catch (err) {
                console.error('Student Dashboard Error:', err);
                // Fallback for stats if fetch fails (optional, could just leave empty or show error state)
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDashboardData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f8f9fc] dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-black text-gray-400 uppercase tracking-widest text-xs animate-pulse">Loading Workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen text-left transition-colors duration-200 font-sans">

            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter uppercase flex items-center gap-3">
                        {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{user.name?.split(' ')[0]}</span>
                        <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mt-2">
                        {user.department} Department • Year {user.year}
                    </p>
                </div>
                <div className="hidden md:block">
                    <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">System Live</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, index) => {
                    // Determine if the card should be a link
                    const isLink = stat.link;
                    const CardContent = (
                        <div className={`bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group h-full ${isLink ? 'cursor-pointer' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl ${stat.color} ${stat.shadow}`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-800 dark:text-white">{stat.value}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
                                </div>
                            </div>
                        </div>
                    );

                    return isLink ? (
                        <Link key={index} to={stat.link} className="block h-full">
                            {CardContent}
                        </Link>
                    ) : (
                        <div key={index} className="block h-full">
                            {CardContent}
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left Column: Today's Schedule */}
                <div className="xl:col-span-2 flex flex-col gap-8">
                    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                                    <FaCalendarCheck className="text-indigo-500" /> Today's Schedule
                                </h2>
                                <p className="text-xs text-gray-400 font-bold mt-1">Your timeline for the day</p>
                            </div>
                            <Link to="/student/timetable" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl">
                                Full Timetable <FaArrowRight />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {todaySessions.length > 0 ? (
                                todaySessions.map((session, idx) => (
                                    <div key={idx} className="group relative flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 text-left">
                                        <div className="flex-shrink-0 w-16 text-center">
                                            <div className="text-sm font-black text-gray-800 dark:text-white">{session.startTime}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Start</div>
                                        </div>
                                        <div className="w-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-full group-hover:bg-indigo-500 transition-colors"></div>
                                        <div className="flex-grow">
                                            <h4 className="text-base font-bold text-gray-800 dark:text-white leading-tight mb-1">{session.course?.courseName}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
                                                <span className="flex items-center gap-1"><FaMapMarkerAlt /> {session.classroom?.roomNumber}</span>
                                                <span className="flex items-center gap-1"><FaGraduationCap /> {session.faculty?.name}</span>
                                            </p>
                                        </div>
                                        <div className="hidden sm:block">
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                {session.startTime > new Date().toTimeString().slice(0, 5) ? 'Upcoming' : 'Past'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center bg-gray-50 dark:bg-gray-700/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                        <FaCalendarCheck />
                                    </div>
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No classes scheduled for today.</p>
                                    <p className="text-xs text-gray-400 mt-1">Enjoy your free time!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Notices & Actions */}
                <div className="flex flex-col gap-6">
                    {/* Notice Board */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                                    <FaBullhorn className="text-orange-500" /> Notice Board
                                </h2>
                            </div>
                            <Link to="/student/announcements" className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 transition-colors">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentAnnouncements.length > 0 ? (
                                recentAnnouncements.map((ann, idx) => (
                                    <div key={idx} className="p-5 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/20 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                                        <div className="flex justify-between mb-2">
                                            <span className="px-2 py-0.5 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase tracking-widest rounded shadow-sm">
                                                {ann.priority}
                                            </span>
                                            <span className="text-[9px] text-gray-400 font-bold">
                                                {new Date(ann.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-800 dark:text-white leading-tight mb-1 line-clamp-2">{ann.title}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{ann.content}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                    No active notices
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentDashboard;
