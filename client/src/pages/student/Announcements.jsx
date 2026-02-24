import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaBullhorn, FaExclamationCircle, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';

const Announcements = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get('/announcements', config);
                setAnnouncements(data);
            } catch (error) {
                console.error('Error fetching announcements:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchAnnouncements();
    }, [user]);

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'high': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800';
            case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
            default: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
        }
    };

    const getIcon = (priority) => {
        switch (priority) {
            case 'high': return <FaExclamationCircle />;
            case 'medium': return <FaCalendarAlt />;
            default: return <FaInfoCircle />;
        }
    };

    return (
        <div className="p-6 md:p-10 bg-slate-50 dark:bg-[#0f172a] min-h-screen text-left transition-colors duration-300 font-sans">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-4">
                    Campus Notices
                    <span className="p-2 bg-indigo-600 rounded-xl text-white text-2xl shadow-lg shadow-indigo-200 dark:shadow-none -rotate-6">
                        <FaBullhorn />
                    </span>
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 ml-1">
                    Stay updated with the latest news and events
                </p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400 font-bold animate-pulse">Loading announcements...</div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {announcements.length === 0 ? (
                        <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[3rem] bg-slate-50/50 dark:bg-slate-800/30">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No announcements at the moment</p>
                        </div>
                    ) : (
                        announcements.map((ann) => (
                            <div key={ann._id} className="bg-white dark:bg-slate-800/80 p-8 md:p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit shadow-sm ${getPriorityStyles(ann.priority)}`}>
                                                    {getIcon(ann.priority)} {ann.priority} Priority
                                                </span>
                                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                    {new Date(ann.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                                                {ann.title}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="prose dark:prose-invert max-w-none mb-8">
                                        <p className="text-slate-600 dark:text-slate-300 leading-loose text-sm font-medium whitespace-pre-wrap">
                                            {ann.content}
                                        </p>
                                    </div>
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700/50 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-black text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/30">
                                            {ann.sender?.name?.charAt(0) || 'A'}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                                {ann.sender?.name || 'Admin'}
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                {ann.sender?.role || 'Staff'} • Official Notice
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Announcements;
