import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaDownload, FaCalendarCheck, FaClock, FaDoorOpen, FaBook, FaUserTie, FaEye, FaUsers } from 'react-icons/fa';
import api from '../../services/api';

const FacultyTimetable = () => {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTimetable = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // Fetch strictly personal schedule
                const { data } = await axios.get(`http://127.0.0.1:5001/api/timetable`, config);

                const dayOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5 };
                const sorted = data.sort((a, b) => {
                    if (dayOrder[a.day] !== dayOrder[b.day]) {
                        return dayOrder[a.day] - dayOrder[b.day];
                    }
                    return a.startTime.localeCompare(b.startTime);
                });

                setTimetable(sorted);
            } catch (err) {
                console.error('Error fetching timetable:', err);
                setError('Failed to load timetable. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchTimetable();
    }, [user]);

    if (loading) return <div className="p-10 text-center font-bold text-gray-500 animate-pulse">Synchronizing Schedule...</div>;

    return (
        <div className="p-4 md:p-10 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
                <div className="text-left">
                    <h1 className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter uppercase flex items-center">
                        <FaCalendarCheck className="mr-3 md:mr-4 text-blue-600" />
                        Teaching Schedule
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Your personal assigned classes
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <button className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95 text-xs">
                        <FaDownload className="mr-2" /> Export
                    </button>
                </div>
            </div>

            {error ? (
                <div className="p-8 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-3xl text-rose-600 dark:text-rose-400 font-bold flex items-center">
                    <FaBook className="mr-4" /> {error}
                </div>
            ) : timetable.length === 0 ? (
                <div className="p-20 text-center bg-white dark:bg-gray-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <FaCalendarCheck size={40} />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">No Classes Assigned</h3>
                    <p className="text-gray-400 max-w-xs mx-auto">Your timetable is currently empty. Contact the administrator if you believe this is an error.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {timetable.map((slot, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-6">
                                <span className="px-5 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    {slot.day}
                                </span>
                                <div className="flex items-center text-gray-400 text-xs font-bold">
                                    <FaClock className="mr-2" />
                                    {slot.startTime} - {slot.endTime}
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                                {slot.course?.courseName || 'Untitled Course'}
                            </h3>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-6">
                                Code: {slot.course?.courseCode || 'N/A'} • Sem {slot.course?.semester || slot.semester || 'N/A'}
                            </p>

                            <div className="flex items-center space-x-12 pt-6 border-t border-gray-50 dark:border-gray-700/50">
                                <div>
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Room</p>
                                    <div className="flex items-center text-gray-700 dark:text-gray-200 font-bold">
                                        <FaDoorOpen className="mr-2 text-emerald-500" />
                                        {slot.classroom?.roomNumber || 'TBD'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Department</p>
                                    <p className="text-gray-700 dark:text-gray-200 font-bold">
                                        {slot.course?.department || 'General'}
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

export default FacultyTimetable;
