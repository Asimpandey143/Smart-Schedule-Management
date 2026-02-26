import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaBullhorn, FaCalendarAlt, FaEnvelopeOpenText, FaPlus, FaTimes, FaTrashAlt } from 'react-icons/fa';

const FacultyAnnouncements = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form States
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState('medium');
    const [targetDept, setTargetDept] = useState('all');
    const [targetYear, setTargetYear] = useState('all');
    const [isPosting, setIsPosting] = useState(false);

    const fetchAnnouncements = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/announcements', config);
            setAnnouncements(data);
        } catch (err) {
            console.error('Error fetching announcements:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchAnnouncements();
    }, [user]);

    const handlePost = async (e) => {
        e.preventDefault();
        setIsPosting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const newAnnouncement = {
                title,
                content,
                priority,
                targetAudience: 'student', // Faculty announcements target students by default
                targetDepartment: targetDept,
                targetYear
            };
            await api.post('/announcements', newAnnouncement, config);

            setShowModal(false);
            setTitle('');
            setContent('');
            setPriority('medium');
            setTargetDept('all');
            setTargetYear('all');
            fetchAnnouncements();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to post announcement');
        } finally {
            setIsPosting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/announcements/${id}`, config);
            setAnnouncements(announcements.filter(a => a._id !== id));
        } catch (err) {
            console.error('Error deleting:', err);
            alert('Failed to delete announcement. You can only delete your own posts.');
        }
    };

    const getPriorityStyles = (p) => {
        switch (p) {
            case 'high': return 'bg-rose-500/10 text-rose-600 border-rose-100 dark:border-rose-900/20';
            case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-900/20';
            default: return 'bg-blue-500/10 text-blue-600 border-blue-100 dark:border-blue-900/20';
        }
    };

    return (
        <div className="p-4 md:p-10 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen text-left transition-colors duration-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter uppercase">Notice Board</h1>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">Institutional broadcasts and departmental circulars</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95 text-xs"
                >
                    <FaPlus className="mr-2" /> Announce to Students
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400 animate-pulse font-bold">Loading notices...</div>
            ) : announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-full mb-6">
                        <FaEnvelopeOpenText size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">All Caught Up</h3>
                    <p className="text-gray-400 font-medium">No new announcements for you.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {announcements.map((ann) => (
                        <div key={ann._id} className="relative bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group flex flex-col">
                            {/* Delete Button (Only for owner) */}
                            {ann.sender?._id === user?._id && (
                                <button
                                    onClick={() => handleDelete(ann._id)}
                                    className="absolute top-8 right-8 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                                    title="Delete Announcement"
                                >
                                    <FaTrashAlt />
                                </button>
                            )}

                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                    <FaBullhorn size={20} />
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getPriorityStyles(ann.priority)}`}>
                                    {ann.priority} Priority
                                </span>
                            </div>

                            <div className="mb-4">
                                <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white mb-2 leading-tight uppercase tracking-tight line-clamp-2">
                                    {ann.title}
                                </h2>
                                <div className="flex items-center text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                                    <FaCalendarAlt className="mr-2" /> {new Date(ann.createdAt).toLocaleDateString()} • From: {ann.sender?._id === user?._id ? 'You' : (ann.sender?.name || 'Admin')}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl mb-6 flex-grow">
                                <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed text-sm md:text-base whitespace-pre-line">
                                    {ann.content}
                                </p>
                            </div>

                            <div className="flex justify-end pt-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl">
                                    {ann.targetAudience === 'student' ? 'Student Notice' : 'Official Notice'}
                                    {ann.targetAudience === 'student' && (
                                        <span className="ml-1 opacity-75">
                                            • {ann.targetDepartment === 'all' ? 'All Depts' : ann.targetDepartment}
                                            • {ann.targetYear === 'all' ? 'All Years' : `Year ${ann.targetYear}`}
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Announcement Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 text-left">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">New Announcement</h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-rose-500 transition-colors">
                                    <FaTimes size={24} />
                                </button>
                            </div>

                            <form onSubmit={handlePost} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold"
                                        placeholder="e.g. Assignment Deadline Extended"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Message Content</label>
                                    <textarea
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold"
                                        rows="4"
                                        placeholder="Detailed announcement details..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Priority</label>
                                    <select
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold appearance-none"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="low">Low Priority</option>
                                        <option value="medium">Medium Priority</option>
                                        <option value="high">High Priority</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Target Dept</label>
                                        <select
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold appearance-none"
                                            value={targetDept}
                                            onChange={(e) => setTargetDept(e.target.value)}
                                        >
                                            <option value="all">All Departments</option>
                                            <option value={user.department}>{user.department} Only</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Target Year</label>
                                        <select
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold appearance-none"
                                            value={targetYear}
                                            onChange={(e) => setTargetYear(e.target.value)}
                                        >
                                            <option value="all">All Years</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isPosting}
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700"
                                    >
                                        {isPosting ? 'Posting...' : 'Post Notice'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyAnnouncements;
