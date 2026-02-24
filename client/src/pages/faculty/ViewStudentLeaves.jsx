import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaUserGraduate, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

const ViewStudentLeaves = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get('/leaves/department', config);
                setLeaves(data);
            } catch (err) {
                console.error('Error fetching student leaves:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchLeaves();
    }, [user]);

    if (loading) {
        return <div className="p-10 text-center font-black text-slate-400 animate-pulse uppercase tracking-widest text-xs">Loading Student Leaves...</div>;
    }

    return (
        <div className="p-6 md:p-10 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen text-left transition-colors duration-200 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic flex items-center gap-3">
                    <FaUserGraduate className="text-indigo-500" /> Student Leaves
                </h1>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">
                    Approved leaves for {user.department} Department
                </p>
            </div>

            {leaves.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700">
                    <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No students currently on leave</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {leaves.map((leave) => (
                        <div key={leave._id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm">
                                        {leave.user?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white text-base leading-tight">
                                            {leave.user?.name}
                                        </h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Year {leave.user?.year}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 text-[10px] font-black uppercase tracking-widest rounded">
                                    {leave.leaveCategory}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl">
                                    <span>{new Date(leave.startDate).toLocaleDateString()}</span>
                                    <span className="text-gray-300 mx-2">➞</span>
                                    <span>{new Date(leave.endDate).toLocaleDateString()}</span>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Reason</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 italic line-clamp-2">
                                        {leave.reason}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewStudentLeaves;
