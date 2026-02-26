import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaCheckDouble, FaBars } from 'react-icons/fa';
import api, { API_BASE_URL } from '../services/api';

const Navbar = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, [user]);

    const markRead = async (id) => {
        try {
            await api.put(`/notifications/${id}`, {});
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const clearAll = async () => {
        try {
            await api.delete('/notifications');
            fetchNotifications();
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="flex justify-between items-center h-20 bg-white dark:bg-[#0f172a] border-b border-slate-100 dark:border-slate-800 px-6 md:px-10 transition-colors duration-300 sticky top-0 z-30 font-sans">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="mr-4 md:hidden text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 focus:outline-none transition-colors"
                >
                    <FaBars size={24} />
                </button>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white capitalize flex items-center italic tracking-tight">
                    <span className="bg-indigo-600 w-1.5 h-8 rounded-full mr-4 hidden md:block"></span>
                    {user?.role} <span className="text-slate-400 ml-2 not-italic font-bold text-sm tracking-widest uppercase">Portal</span>
                </h1>
            </div>

            <div className="flex items-center space-x-2 md:space-x-6">
                {/* Content Removed: Theme Toggle */}
                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-3 rounded-2xl transition-all active:scale-95 ${showNotifications ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                    >
                        <FaBell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#0f172a] animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                            <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-300">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                    <span className="font-black text-slate-900 dark:text-white tracking-tight">Notifications</span>
                                    {unreadCount > 0 && <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-3 py-1 rounded-full font-black uppercase tracking-widest">{unreadCount} New</span>}
                                </div>
                                <div className="max-h-[20rem] overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                                                <FaBell size={24} />
                                            </div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No notifications yet</p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                className={`p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800 relative group cursor-pointer ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                                onClick={() => !n.read && markRead(n._id)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className={`text-sm font-bold ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {n.title || 'System Alert'}
                                                    </p>
                                                    {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{n.message}</p>
                                                <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest">{new Date(n.createdAt).toLocaleString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/20 text-center border-t border-slate-100 dark:border-slate-800">
                                    <button onClick={clearAll} className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest transition-colors">Clear All History</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Profile */}
                <div className="flex items-center space-x-6 border-l border-slate-100 dark:border-slate-800 pl-6 md:pl-8">
                    <div className="hidden md:flex flex-col text-right">
                        <span className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1 tracking-tight">{user?.name}</span>
                        <span className="text-[10px] text-indigo-500 dark:text-indigo-400 uppercase font-black tracking-widest">{user?.role}</span>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200 dark:shadow-none hover:rotate-3 transition-transform cursor-pointer overflow-hidden border-2 border-white dark:border-slate-700">
                        {user?.avatar ? (
                            <img src={`${API_BASE_URL}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase()
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
