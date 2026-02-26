import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarCheck, FaCheck, FaTimes, FaSpinner, FaSearch, FaFilter, FaUserTie, FaUserGraduate, FaTrash } from 'react-icons/fa';

const LeaveManagement = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [activeRole, setActiveRole] = useState('faculty'); // 'faculty' or 'student'
    const [processingId, setProcessingId] = useState(null);

    const fetchLeaves = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/leaves', config);
            setLeaves(data);
        } catch (err) {
            console.error('Error fetching leaves:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchLeaves();
    }, [user]);

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;

        setProcessingId(id);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/leaves/${id}`, { status }, config);

            // Update local state
            setLeaves(leaves.map(leave =>
                leave._id === id ? { ...leave, status } : leave
            ));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/leaves/${id}`, config);
            setLeaves(leaves.filter(leave => leave._id !== id));
        } catch (err) {
            console.error('Error deleting leave:', err);
            alert('Failed to delete record');
        }
    };

    const filteredLeaves = leaves.filter(leave => {
        const matchesRole = leave.role === activeRole;
        const matchesSearch = leave.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            leave.user?.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || leave.status === filterStatus;
        return matchesRole && matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Rejected': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
            default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
        }
    };

    return (
        <div className="p-4 md:p-10 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen text-left transition-colors duration-200">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white tracking-tighter uppercase">Leave Requests</h1>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">Manage and process leave applications</p>
            </div>

            {/* Role Tabs */}
            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => setActiveRole('faculty')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeRole === 'faculty'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-y-[-2px]'
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <FaUserTie /> Faculty Requests
                </button>
                <button
                    onClick={() => setActiveRole('student')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeRole === 'student'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-y-[-2px]'
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <FaUserGraduate /> Student Requests
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or department..."
                        className="w-full pl-12 pr-6 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        className="w-full pl-12 pr-6 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold appearance-none cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400 animate-pulse font-bold">Loading requests...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredLeaves.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700">
                            <FaCalendarCheck className="mx-auto text-4xl text-gray-300 mb-4" />
                            <p className="text-gray-400 font-bold">No {activeRole} requests found</p>
                        </div>
                    ) : (
                        filteredLeaves.map((leave) => (
                            <div key={leave._id} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-6 transition-all hover:shadow-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(leave.status)}`}>
                                            {leave.status}
                                        </span>
                                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                            {new Date(leave.createdAt).toLocaleDateString()}
                                        </span>
                                        {leave.leaveCategory && (
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded">
                                                {leave.leaveCategory}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-bold uppercase">
                                            {leave.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-800 dark:text-white leading-tight">
                                                {leave.user?.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                {leave.user?.department} • {leave.user?.email}
                                                {leave.role === 'student' && leave.user?.year && ` • Year ${leave.user.year}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Type: {leave.leaveType}</span>
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                                {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm italic">
                                            "{leave.reason}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col justify-center gap-3 min-w-[140px]">
                                    {leave.status === 'Pending' ? (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                                disabled={processingId === leave._id}
                                                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {processingId === leave._id ? <FaSpinner className="animate-spin" /> : <FaCheck />} Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                                disabled={processingId === leave._id}
                                                className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {processingId === leave._id ? <FaSpinner className="animate-spin" /> : <FaTimes />} Reject
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleDelete(leave._id)}
                                            className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-rose-500 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default LeaveManagement;
