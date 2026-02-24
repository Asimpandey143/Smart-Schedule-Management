import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaBullhorn, FaTrashAlt, FaPaperPlane, FaUserGraduate, FaChalkboardTeacher, FaUsers } from 'react-icons/fa';

const MakeAnnouncement = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState('medium');
    const [targetAudience, setTargetAudience] = useState('all');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const fetchAnnouncements = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/announcements', config);
            setAnnouncements(data);
        } catch (err) {
            console.error('Error fetching announcements:', err);
        }
    };

    useEffect(() => {
        if (user) fetchAnnouncements();
    }, [user]);

    const handlePost = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const newAnnouncement = { title, content, priority, targetAudience };
            await api.post('/announcements', newAnnouncement, config);

            setSuccess('Announcement posted successfully!');
            setTitle('');
            setContent('');
            setPriority('medium');
            setTargetAudience('all');
            fetchAnnouncements();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post announcement');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://127.0.0.1:5001/api/announcements/${id}`, config);
            setAnnouncements(announcements.filter(a => a._id !== id));
        } catch (err) {
            console.error('Error deleting announcement:', err);
        }
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'high': return 'bg-rose-500 text-white';
            case 'medium': return 'bg-amber-500 text-white';
            case 'low': return 'bg-blue-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="p-4 md:p-10 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen text-left transition-colors duration-200">
            <div className="mb-6 md:mb-10">
                <h1 className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter uppercase">Announcements Hub</h1>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">Broadcast important updates to the campus</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="lg:col-span-1 h-fit bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 sticky top-4">
                    <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6 uppercase tracking-tight flex items-center">
                        <FaPaperPlane className="mr-3 text-blue-600" /> New Broadcast
                    </h2>

                    {success && <div className="mb-4 p-4 bg-emerald-500/10 text-emerald-600 rounded-xl text-sm font-bold">{success}</div>}
                    {error && <div className="mb-4 p-4 bg-rose-500/10 text-rose-600 rounded-xl text-sm font-bold">{error}</div>}

                    <form onSubmit={handlePost} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold"
                                placeholder="e.g. Campus Closed Tomorrow"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Message</label>
                            <textarea
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold"
                                rows="4"
                                placeholder="Write your announcement here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Priority</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold appearance-none"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Audience</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold appearance-none"
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                >
                                    <option value="all">Everyone</option>
                                    <option value="faculty">Faculty Only</option>
                                    <option value="student">Students Only</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 text-xs"
                        >
                            {loading ? 'Posting...' : 'Broadcast Now'}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-gray-800 dark:text-white mb-2 uppercase tracking-tight ml-2">Active Announcements</h2>

                    {announcements.length === 0 ? (
                        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700">
                            <FaBullhorn className="mx-auto text-4xl text-gray-200 mb-4" />
                            <p className="text-gray-400 font-bold">No announcements yet</p>
                        </div>
                    ) : (
                        announcements.map((ann) => (
                            <div key={ann._id} className="group relative bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
                                <button
                                    onClick={() => handleDelete(ann._id)}
                                    className="absolute top-6 right-6 p-2 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <FaTrashAlt />
                                </button>

                                <div className="flex items-start mb-4">
                                    <div className={`mt-1 mr-4 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getPriorityColor(ann.priority)}`}>
                                        {ann.priority}
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center">
                                        {ann.targetAudience === 'student' ? <FaUserGraduate className="mr-2" /> :
                                            ann.targetAudience === 'faculty' ? <FaChalkboardTeacher className="mr-2" /> : <FaUsers className="mr-2" />}
                                        {ann.targetAudience}
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">{ann.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm whitespace-pre-line mb-4">{ann.content}</p>

                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between">
                                    <span>From: {ann.sender?.name || 'Admin'}</span>
                                    <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MakeAnnouncement;
