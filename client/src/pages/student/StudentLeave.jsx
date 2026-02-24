import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaPaperPlane, FaHistory, FaCalendarAlt, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaClock, FaTrash } from 'react-icons/fa';

const StudentLeave = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('apply');
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [leaveCategory, setLeaveCategory] = useState('Leave');
    const [leaveType, setLeaveType] = useState('Sick Leave');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const fetchLeaves = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/leaves/my', config);
            setLeaves(data);
        } catch (err) {
            console.error('Error fetching leaves:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchLeaves();
    }, [user, activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.post('/leaves', {
                leaveCategory,
                leaveType,
                startDate,
                endDate,
                reason
            }, config);

            setSuccessMsg('Leave request submitted successfully!');
            setStartDate('');
            setEndDate('');
            setReason('');
            fetchLeaves(); // Refresh list
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://127.0.0.1:5001/api/leaves/${id}`, config);
            setLeaves(leaves.filter(leave => leave._id !== id));
        } catch (err) {
            console.error('Error deleting leave:', err);
            setErrorMsg('Failed to delete record');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
            case 'Rejected': return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800';
            default: return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <FaCheckCircle />;
            case 'Rejected': return <FaTimesCircle />;
            default: return <FaClock />;
        }
    };

    return (
        <div className="p-4 md:p-8 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen font-sans transition-colors duration-200">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic">
                        Leave & OD Request
                    </h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
                        Apply for leave or On-Duty permission
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-8">
                    <button
                        onClick={() => setActiveTab('apply')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'apply'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-y-[-2px]'
                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <FaPaperPlane /> Apply New
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'history'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-y-[-2px]'
                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <FaHistory /> My Requests
                    </button>
                </div>

                {activeTab === 'apply' ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-gray-700">
                        {successMsg && (
                            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3 font-bold">
                                <FaCheckCircle /> {successMsg}
                            </div>
                        )}
                        {errorMsg && (
                            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-3 font-bold">
                                <FaTimesCircle /> {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                                    <div className="flex gap-4">
                                        {['Leave', 'OD'].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setLeaveCategory(cat)}
                                                className={`flex-1 py-3 rounded-xl font-black text-sm uppercase transition-all ${leaveCategory === cat
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-700'
                                                    : 'bg-gray-50 dark:bg-gray-700 text-gray-400 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reason Type</label>
                                    <select
                                        value={leaveType}
                                        onChange={(e) => setLeaveType(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none text-gray-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Sick Leave">Sick Leave</option>
                                        <option value="Casual Leave">Casual Leave</option>
                                        <option value="Academic Leave">Academic Leave</option>
                                        <option value="Personal Leave">Personal Leave</option>
                                        <option value="On Duty">On Duty</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none text-gray-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none text-gray-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reason</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    rows="4"
                                    placeholder="Explain why you need leave..."
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none text-gray-800 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? 'Submitting...' : <><FaPaperPlane /> Submit Request</>}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-10 text-gray-400 animate-pulse font-bold">Loading history...</div>
                        ) : leaves.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700">
                                <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-4" />
                                <p className="text-gray-400 font-bold">No leave requests found</p>
                            </div>
                        ) : (
                            leaves.map((leave) => (
                                <div key={leave._id} className="bg-white dark:bg-gray-800 p-6 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4 transition-all hover:shadow-md relative">
                                    <button
                                        onClick={() => handleDelete(leave._id)}
                                        className="absolute top-4 right-4 text-rose-300 hover:text-rose-500 transition-colors p-2"
                                        title="Delete Record"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                    <div className="flex-1 pr-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(leave.status)}`}>
                                                {leave.status}
                                            </span>
                                            <span className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                                                {leave.leaveCategory}
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold">
                                                {new Date(leave.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                                            {leave.leaveType}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                                            <FaCalendarAlt className="text-indigo-400" />
                                            {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                                        </p>
                                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-sm italic text-gray-600 dark:text-gray-300">
                                            "{leave.reason}"
                                        </div>
                                        {leave.adminComments && (
                                            <div className="mt-2 text-xs text-rose-500 font-bold">
                                                Admin Note: {leave.adminComments}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-center min-w-[60px]">
                                        <div className={`text-3xl ${leave.status === 'Approved' ? 'text-emerald-500' : leave.status === 'Rejected' ? 'text-rose-500' : 'text-amber-500'}`}>
                                            {getStatusIcon(leave.status)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentLeave;
