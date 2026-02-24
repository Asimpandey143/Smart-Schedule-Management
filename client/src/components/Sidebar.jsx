import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUserGraduate, FaChalkboardTeacher, FaBook, FaBuilding, FaCalendarAlt, FaClipboardList, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout } = useAuth();
    const { user } = useAuth();

    const adminMenuItems = [
        { path: '/admin', name: 'Dashboard', icon: <FaHome /> },
        { path: '/admin/students', name: 'Manage Students', icon: <FaUserGraduate /> },
        { path: '/admin/faculty', name: 'Manage Faculty', icon: <FaChalkboardTeacher /> },
        { path: '/admin/courses', name: 'Manage Courses', icon: <FaBook /> },
        { path: '/admin/classrooms', name: 'Manage Classrooms', icon: <FaBuilding /> },
        { path: '/admin/timetable', name: 'Generate Timetable', icon: <FaCalendarAlt /> },
        { path: '/admin/reports', name: 'Reports', icon: <FaClipboardList /> },
        { path: '/admin/announcements', name: 'Announcements', icon: <FaBuilding /> },
        { path: '/admin/leaves', name: 'Leave Requests', icon: <FaClipboardList /> },
        { path: '/admin/settings', name: 'Settings', icon: <FaCog /> },
    ];

    const studentMenuItems = [
        { path: '/student', name: 'Dashboard', icon: <FaHome /> },
        { path: '/student/timetable', name: 'My Timetable', icon: <FaCalendarAlt /> },
        { path: '/student/attendance', name: 'Attendance', icon: <FaClipboardList /> },
        { path: '/student/materials', name: 'Study Materials', icon: <FaBook /> },
        { path: '/student/announcements', name: 'Announcements', icon: <FaBuilding /> },
        { path: '/student/leave', name: 'Leave / OD', icon: <FaClipboardList /> },
        { path: '/student/profile', name: 'Profile', icon: <FaUserGraduate /> },
    ];

    const facultyMenuItems = [
        { path: '/faculty', name: 'Dashboard', icon: <FaHome /> },
        { path: '/faculty/timetable', name: 'My Timetable', icon: <FaCalendarAlt /> },
        { path: '/faculty/attendance', name: 'Mark Attendance', icon: <FaClipboardList /> },
        { path: '/faculty/attendance-history', name: 'History', icon: <FaCalendarAlt /> },
        { path: '/faculty/materials', name: 'Upload Materials', icon: <FaBook /> },
        { path: '/faculty/announcements', name: 'Announcements', icon: <FaBuilding /> },
        { path: '/faculty/leave', name: 'Leave Request', icon: <FaClipboardList /> },
        { path: '/faculty/student-leaves', name: 'Student Leaves', icon: <FaUserGraduate /> },
        { path: '/faculty/profile', name: 'Profile', icon: <FaUserGraduate /> },
    ];

    let menuItems = adminMenuItems;
    if (user?.role === 'student') {
        menuItems = studentMenuItems;
    } else if (user?.role === 'faculty') {
        menuItems = facultyMenuItems;
    }

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-[100] w-72 h-screen px-6 py-10 bg-white dark:bg-[#0f172a] border-r border-slate-100 dark:border-slate-800 transition-transform duration-300 transform md:translate-x-0 md:static ${isOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl'}`}>
                <div className="flex justify-between items-center mb-12 px-2">
                    <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">
                        Smart<span className="text-indigo-600 dark:text-indigo-400">Sched</span>
                        <span className="text-indigo-600 text-4xl">.</span>
                    </h2>
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600 dark:text-slate-500">
                        <FaSignOutAlt className="rotate-180" size={20} />
                    </button>
                </div>

                <div className="flex flex-col justify-between flex-1 overflow-y-auto">
                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => window.innerWidth < 768 && onClose()}
                                    className={`flex items-center px-4 py-3.5 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1'
                                        }`}
                                >
                                    <span className={`text-lg mr-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500'}`}>{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                    <div>
                        <button
                            onClick={logout}
                            className="flex items-center w-full px-4 py-3.5 mt-4 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 group"
                        >
                            <span className="text-lg mr-4 text-slate-400 dark:text-slate-500 group-hover:text-rose-500"><FaSignOutAlt /></span>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
