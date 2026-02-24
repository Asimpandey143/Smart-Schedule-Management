import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaHistory, FaCalendarCheck, FaUserCheck, FaUserTimes, FaUsers, FaEye, FaChevronDown, FaChevronUp, FaFileExport } from 'react-icons/fa';

const ViewAttendance = () => {
    const { user } = useAuth();
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRecord, setExpandedRecord] = useState(null);

    useEffect(() => {
        const fetchAttendanceHistory = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get('/attendance/faculty-history', config);
                setAttendanceHistory(data);
            } catch (err) {
                console.error('Error fetching attendance history:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchAttendanceHistory();
    }, [user]);

    const toggleRecord = (id) => {
        if (expandedRecord === id) {
            setExpandedRecord(null);
        } else {
            setExpandedRecord(id);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="p-4 md:p-10 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen text-left transition-colors duration-200">
            <div className="mb-6 md:mb-10">
                <h1 className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter uppercase flex items-center">
                    <FaHistory className="mr-3 text-blue-600" /> Attendance History
                </h1>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">Review past class records and student presence logs</p>
            </div>

            {loading ? (
                <div className="p-20 text-center font-bold text-gray-400 animate-pulse">Loading records...</div>
            ) : attendanceHistory.length === 0 ? (
                <div className="p-20 text-center bg-white dark:bg-gray-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <FaCalendarCheck size={40} />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">No Records Found</h3>
                    <p className="text-gray-400 max-w-xs mx-auto">You haven't submitted any attendance records yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {attendanceHistory.map((record) => (
                        <div key={record._id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-lg">
                            {/* Record Header - Always Visible */}
                            <div
                                onClick={() => toggleRecord(record._id)}
                                className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                            >
                                <div className="flex items-center mb-4 md:mb-0">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl mr-4 md:mr-6">
                                        <FaCalendarCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-black text-gray-800 dark:text-white">{record.course?.courseName || 'Class Session'}</h3>
                                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                            {formatDate(record.date)} • {record.startTime} - {record.endTime}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <div className="flex items-center space-x-4 text-xs font-bold">
                                            <span className="flex items-center text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
                                                <FaUserCheck className="mr-2" />
                                                {record.students.filter(s => s.status === 'Present').length} Present
                                            </span>
                                            <span className="flex items-center text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg">
                                                <FaUserTimes className="mr-2" />
                                                {record.students.filter(s => s.status === 'Absent').length} Absent
                                            </span>
                                        </div>
                                    </div>
                                    <div className="hidden md:block text-gray-300">
                                        {expandedRecord === record._id ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Student List - Collapsible */}
                            {expandedRecord === record._id && (
                                <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/50 p-6 md:p-8 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest">Student Roster</h4>
                                        <button className="text-xs font-bold text-blue-600 hover:underline flex items-center">
                                            <FaFileExport className="mr-2" /> Export Report
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {record.students.map((entry, idx) => (
                                            <div key={idx} className="flex items-center p-4 bg-white dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600">
                                                <div className={`w-2 h-12 rounded-full mr-4 ${entry.status === 'Present' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{entry.student?.name || 'Unknown Student'}</p>
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">{entry.student?.rollNumber || 'No ID'}</p>
                                                </div>
                                                <div className={`ml-auto px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${entry.status === 'Present'
                                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                                                    }`}>
                                                    {entry.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewAttendance;
