import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaBook, FaChalkboardTeacher, FaBuilding, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaBell, FaUserGraduate } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        totalCourses: 0,
        totalClassrooms: 0,
        totalTimetables: 0,
        activeConflicts: 0,
        completedSchedules: 0,
        pendingTasks: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');

                let timetableCount = 0;
                try {
                    const timetableRes = await api.get('/timetable');
                    timetableCount = timetableRes.data.length;
                } catch (e) {
                    console.error("Could not fetch timetable count", e);
                }

                setStats({
                    ...data,
                    totalTimetables: timetableCount,
                    activeConflicts: data.activeConflicts || 0,
                    completedSchedules: timetableCount > 0 ? 1 : 0,
                    pendingTasks: 5
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching stats:', error);
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    // PREMIUM PASTEL THEME with Navigation Paths
    const cards = [
        {
            title: 'Total Students',
            value: stats.totalStudents,
            icon: <FaUserGraduate className="text-blue-600 dark:text-blue-400 text-xl" />,
            bg: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 dark:border-blue-800',
            iconBg: 'bg-white dark:bg-gray-800',
            barColor: 'bg-blue-500',
            textColor: 'text-blue-700 dark:text-blue-300',
            path: '/admin/students'
        },
        {
            title: 'Total Faculty',
            value: stats.totalFaculty,
            icon: <FaChalkboardTeacher className="text-violet-600 dark:text-violet-400 text-xl" />,
            bg: 'bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 dark:from-violet-900/30 dark:to-violet-800/30 dark:border-violet-800',
            iconBg: 'bg-white dark:bg-gray-800',
            barColor: 'bg-violet-500',
            textColor: 'text-violet-700 dark:text-violet-300',
            path: '/admin/faculty'
        },
        {
            title: 'Total Courses',
            value: stats.totalCourses,
            icon: <FaBook className="text-emerald-600 dark:text-emerald-400 text-xl" />,
            bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 dark:border-emerald-800',
            iconBg: 'bg-white dark:bg-gray-800',
            barColor: 'bg-emerald-500',
            textColor: 'text-emerald-700 dark:text-emerald-300',
            path: '/admin/courses'
        },
        {
            title: 'Total Classrooms',
            value: stats.totalClassrooms,
            icon: <FaBuilding className="text-teal-600 dark:text-teal-400 text-xl" />,
            bg: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 dark:from-teal-900/30 dark:to-teal-800/30 dark:border-teal-800',
            iconBg: 'bg-white dark:bg-gray-800',
            barColor: 'bg-teal-500',
            textColor: 'text-teal-700 dark:text-teal-300',
            path: '/admin/classrooms'
        },
        {
            title: 'Generated Schedules',
            value: stats.totalTimetables,
            icon: <FaCalendarAlt className="text-fuchsia-600 dark:text-fuchsia-400 text-xl" />,
            bg: 'bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 border-fuchsia-200 dark:from-fuchsia-900/30 dark:to-fuchsia-800/30 dark:border-fuchsia-800',
            iconBg: 'bg-white dark:bg-gray-800',
            barColor: 'bg-fuchsia-500',
            textColor: 'text-fuchsia-700 dark:text-fuchsia-300',
            path: '/admin/timetable'
        },
        {
            title: 'Active Conflicts',
            value: stats.activeConflicts,
            icon: <FaExclamationTriangle className="text-amber-600 dark:text-amber-400 text-xl" />,
            bg: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 dark:border-amber-800',
            iconBg: 'bg-white dark:bg-gray-800',
            barColor: 'bg-amber-500',
            textColor: 'text-amber-700 dark:text-amber-300',
            path: '/admin/timetable'
        },
        {
            title: 'Reports Generated',
            value: stats.completedSchedules > 0 ? 'Full' : 'None',
            icon: <FaCheckCircle className="text-emerald-600 dark:text-emerald-400 text-xl" />,
            bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 dark:border-emerald-800',
            iconBg: 'bg-white dark:bg-gray-800',
            barColor: 'bg-emerald-500',
            textColor: 'text-emerald-700 dark:text-emerald-300',
            path: '/admin/reports'
        },
        {
            title: 'System Tasks',
            value: stats.pendingTasks,
            icon: <FaBell className="text-rose-600 dark:text-rose-400 text-xl" />,
            bg: 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 dark:from-rose-900/30 dark:to-rose-800/30 dark:border-rose-800',
            iconBg: 'bg-white dark:bg-gray-800',
            barColor: 'bg-rose-500',
            textColor: 'text-rose-700 dark:text-rose-300',
            path: '/admin/settings'
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full text-indigo-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5fbf7] dark:bg-gray-900 p-8 font-sans relative overflow-hidden transition-colors duration-200">
            <div className="mb-8 bg-gradient-to-r from-emerald-400 to-violet-500 rounded-3xl p-8 shadow-lg text-white">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-emerald-50 mt-1 opacity-90">Manage your university resources efficiently</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        onClick={() => card.path !== '#' && navigate(card.path)}
                        className={`${card.bg} rounded-2xl p-6 shadow-sm border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer dark:bg-gray-800 dark:border-gray-700`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl shadow-sm ${card.iconBg} transform transition-transform group-hover:scale-110`}>
                                {card.icon}
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${card.textColor} bg-white bg-opacity-60 px-2 py-1 rounded-full shadow-sm`}>
                                Active
                            </span>
                        </div>

                        <div>
                            <h3 className={`text-3xl font-bold ${card.textColor} mb-1`}>{card.value}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wide opacity-80">{card.title}</p>
                        </div>

                        {/* Progress Bar Line */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-6 overflow-hidden">
                            <div className={`h-full rounded-full ${card.barColor}`} style={{ width: '75%' }}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Recent Activity</h3>
                        <button className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm font-semibold">View All</button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
                                <FaCalendarAlt />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Timetable Generated</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">System generated a new schedule for Engineering Dept.</p>
                            </div>
                            <span className="ml-auto text-xs text-gray-400">2h ago</span>
                        </div>
                        <div className="flex items-center p-4 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mr-4">
                                <FaChalkboardTeacher />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">New Faculty Added</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Dr. Sarah Johnson joined Computer Science</p>
                            </div>
                            <span className="ml-auto text-xs text-gray-400">5h ago</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-violet-600 dark:from-emerald-800 dark:to-violet-900 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden transition-colors duration-200">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
                        <p className="text-emerald-100 text-sm mb-6 opacity-90">Fast access to key features</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/admin/timetable')}
                                className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium transition-colors border border-white/10 flex justify-between items-center group"
                            >
                                Generate Timetable
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </button>
                            <button
                                onClick={() => navigate('/admin/faculty')}
                                className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium transition-colors border border-white/10 flex justify-between items-center group"
                            >
                                Add Faculty
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </button>
                            <button
                                onClick={() => navigate('/admin/classrooms')}
                                className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium transition-colors border border-white/10 flex justify-between items-center group"
                            >
                                Manage Classrooms
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </button>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400 opacity-20 rounded-full blur-2xl -ml-10 -mb-10"></div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
