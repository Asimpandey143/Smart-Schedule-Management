import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarPlus, FaHistory, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaBed, FaBriefcaseMedical, FaSkiing, FaUserTie, FaListUl, FaArrowLeft, FaTrash } from 'react-icons/fa';

const LeaveRequest = () => {
    const { user } = useAuth();
    // ... existing state ...
    const [leaveType, setLeaveType] = useState('Sick Leave');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showAllHistory, setShowAllHistory] = useState(false);

    const fetchLeaves = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/leaves/my', config);
            setLeaves(data);
        } catch (err) {
            console.error('Error fetching leaves:', err);
        }
    };

    useEffect(() => {
        if (user) fetchLeaves();
    }, [user]);

    // ... existing calculations ...
    const stats = useMemo(() => {
        const TOTAL_ANNUAL_LEAVE = 20;
        let totalDaysUsed = 0;

        leaves.forEach(leave => {
            if (leave.status === 'Approved') {
                const startIST = new Date(leave.startDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
                const endIST = new Date(leave.endDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
                const start = new Date(startIST);
                const end = new Date(endIST);
                const diffTime = Math.abs(end - start);
                const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                totalDaysUsed += duration;
            }
        });

        return {
            totalQuota: TOTAL_ANNUAL_LEAVE,
            used: totalDaysUsed,
            available: Math.max(0, TOTAL_ANNUAL_LEAVE - totalDaysUsed)
        };
    }, [leaves]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const newLeave = { leaveType, startDate, endDate, reason };
            await api.post('/leaves', newLeave, config);

            setSuccess('Leave application filed successfully! Awaiting review by the Dean.');
            setStartDate('');
            setEndDate('');
            setReason('');
            fetchLeaves();
            setTimeout(() => setSuccess(''), 6000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this history record?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://127.0.0.1:5001/api/leaves/${id}`, config);
            setLeaves(leaves.filter(leave => leave._id !== id));
        } catch (err) {
            console.error('Error deleting leave:', err);
        }
    };

    // ... existing helpers ...
    const getStatusStyles = (status) => {
        if (status === 'Approved') return 'bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-900/20';
        if (status === 'Rejected') return 'bg-rose-500/10 text-rose-600 border-rose-100 dark:border-rose-900/20';
        return 'bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-900/20';
    };

    const getStatusIcon = (status) => {
        if (status === 'Approved') return <FaCheckCircle className="mr-2" />;
        if (status === 'Rejected') return <FaTimesCircle className="mr-2" />;
        return <FaHourglassHalf className="mr-2 animate-spin-slow" />;
    };

    const getLeaveIcon = (type) => {
        if (type === 'Sick Leave') return <FaBriefcaseMedical />;
        if (type === 'Casual Leave') return <FaSkiing />;
        if (type === 'Academic Leave') return <FaUserTie />;
        return <FaBed />;
    };

    const displayedLeaves = showAllHistory ? leaves : leaves.slice(0, 1);

    return (
        <div className="p-4 md:p-10 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen text-left transition-colors duration-200">
            {/* ... Header & Alerts ... */}
            <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter uppercase">Absence Management</h1>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">Submit sabbatical or medical leave requests through the official portal</p>
                </div>
            </div>

            {success && (
                <div className="mb-8 p-6 bg-emerald-500 text-white rounded-[2rem] shadow-xl shadow-emerald-500/20 flex items-center animate-in fade-in zoom-in font-bold">
                    <FaCheckCircle className="text-2xl mr-4" /> {success}
                </div>
            )}

            {error && (
                <div className="mb-8 p-6 bg-rose-500 text-white rounded-[2rem] shadow-xl shadow-rose-500/20 flex items-center animate-in fade-in zoom-in font-bold">
                    <FaTimesCircle className="text-2xl mr-4" /> {error}
                </div>
            )}

            {!showAllHistory ? (
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 md:gap-10">
                    {/* Application Form */}
                    <div className="xl:col-span-3 bg-white dark:bg-gray-800 p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
                        {/* ... Form Content ... */}
                        <div className="flex items-center space-x-4 mb-6 md:mb-10">
                            <div className="p-4 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl">
                                <FaCalendarPlus size={28} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">File Leave</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* ... Form Inputs ... */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Classification</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { id: 'Sick Leave', label: 'Medical', icon: <FaBriefcaseMedical />, color: 'rose' },
                                        { id: 'Casual Leave', label: 'Casual', icon: <FaSkiing />, color: 'blue' },
                                        { id: 'Academic Leave', label: 'Academic', icon: <FaUserTie />, color: 'emerald' },
                                        { id: 'Personal Leave', label: 'Personal', icon: <FaBed />, color: 'purple' }
                                    ].map((type) => (
                                        <label key={type.id} className={`flex flex-col items-center justify-center p-4 rounded-3xl cursor-pointer transition-all border-2 ${leaveType === type.id ? `border-${type.color}-500 bg-${type.color}-500/5 text-${type.color}-600` : 'border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 text-gray-400'}`}>
                                            <input type="radio" className="hidden" value={type.id} checked={leaveType === type.id} onChange={() => setLeaveType(type.id)} />
                                            <span className="text-xl mb-2">{type.icon}</span>
                                            <span className="font-black uppercase tracking-widest text-[8px]">{type.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Commencement Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 dark:text-white font-bold"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">End Date (Inclusive)</label>
                                    <input
                                        type="date"
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 dark:text-white font-bold"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Justification</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 dark:text-white font-bold"
                                    rows="4"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="State clearly the reason for absence and substitute arrangement if any..."
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-orange-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95 text-xs disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Forward Request to Dean'}
                            </button>
                        </form>
                    </div>

                    {/* Right Side Section with Balance and Recent Leave */}
                    <div className="xl:col-span-2 space-y-8">
                        <div className="p-10 bg-indigo-600 rounded-[3.5rem] shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden">
                            <FaHistory className="absolute -right-8 -bottom-8 text-white/5 text-[10rem] rotate-12" />
                            <h4 className="font-black uppercase tracking-widest text-[10px] opacity-70 mb-6">Leave Balance</h4>
                            <div className="grid grid-cols-3 gap-4 relative z-10 text-center">
                                <div>
                                    <p className="text-3xl font-black">{stats.totalQuota}</p>
                                    <p className="text-[8px] font-bold uppercase opacity-60 mt-1">Total Limit</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-black">{stats.available < 10 ? `0${stats.available}` : stats.available}</p>
                                    <p className="text-[8px] font-bold uppercase opacity-60 mt-1">Available</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-black">{stats.used < 10 ? `0${stats.used}` : stats.used}</p>
                                    <p className="text-[8px] font-bold uppercase opacity-60 mt-1">Days Used</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-3">
                                    <FaHistory className="text-gray-400" />
                                    <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Recent Request</h3>
                                </div>
                                <button
                                    onClick={() => setShowAllHistory(true)}
                                    className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-2"
                                >
                                    View All History <FaListUl />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {displayedLeaves.length === 0 ? (
                                    <div className="p-10 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-[2rem]">
                                        No prior records found
                                    </div>
                                ) : (
                                    displayedLeaves.map(leave => (
                                        <div key={leave._id} className="p-6 border-2 border-gray-50 dark:border-gray-700/50 rounded-[2.5rem] bg-gray-50/50 dark:bg-gray-700/20 group hover:border-orange-200 transition-all relative">
                                            <button
                                                onClick={() => handleDelete(leave._id)}
                                                className="absolute top-4 right-4 text-rose-300 hover:text-rose-500 transition-colors p-2"
                                                title="Delete Record"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                            <div className="flex justify-between items-start mb-4 pr-6">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 mr-4 shadow-sm group-hover:text-orange-500 transition-colors">
                                                        {getLeaveIcon(leave.leaveType)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-gray-800 dark:text-gray-200 text-sm">{leave.leaveType}</h4>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`flex items-center px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${getStatusStyles(leave.status)}`}>
                                                    {getStatusIcon(leave.status)} {leave.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium italic line-clamp-2">"{leave.reason}"</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto animate-in slide-in-from-right-8 duration-500">
                    <button
                        onClick={() => setShowAllHistory(false)}
                        className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                        <FaArrowLeft /> Back to Application
                    </button>

                    <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="p-4 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                                <FaHistory size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">My Leave History</h2>
                        </div>

                        <div className="space-y-4">
                            {leaves.map(leave => (
                                <div key={leave._id} className="p-6 md:p-8 border-2 border-gray-50 dark:border-gray-700/50 rounded-[2.5rem] bg-gray-50/50 dark:bg-gray-700/20 group hover:border-indigo-200 dark:hover:border-indigo-900 transition-all flex flex-col md:flex-row gap-6 relative">
                                    <button
                                        onClick={() => handleDelete(leave._id)}
                                        className="absolute top-6 right-6 text-rose-300 hover:text-rose-500 transition-colors p-2"
                                        title="Delete Record"
                                    >
                                        <FaTrash />
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-400 mr-4 shadow-sm group-hover:text-indigo-500 transition-colors text-xl">
                                                {getLeaveIcon(leave.leaveType)}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-800 dark:text-gray-200 text-lg">{leave.leaveType}</h4>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                    Filed on: {new Date(leave.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic bg-white dark:bg-gray-800 p-4 rounded-2xl inline-block border border-gray-100 dark:border-gray-700">"{leave.reason}"</p>
                                    </div>

                                    <div className="flex flex-col items-end justify-center min-w-[150px] gap-2 mr-8">
                                        <span className={`flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full border w-fit ${getStatusStyles(leave.status)}`}>
                                            {getStatusIcon(leave.status)} {leave.status}
                                        </span>
                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                            {new Date(leave.startDate).toLocaleDateString()} <span className="text-gray-300 mx-2">—</span> {new Date(leave.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveRequest;
