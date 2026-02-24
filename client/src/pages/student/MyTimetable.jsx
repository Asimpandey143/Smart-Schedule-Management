import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserTie } from 'react-icons/fa';

const MyTimetable = () => {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState({});
    const [loading, setLoading] = useState(true);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
        { start: '09:00', end: '10:00', label: '09:00 - 10:00', type: 'class' },
        { start: '10:00', end: '11:00', label: '10:00 - 11:00', type: 'class' },
        { start: '11:00', end: '11:15', label: '11:00 - 11:15', type: 'break', name: 'Short Break ☕' },
        { start: '11:15', end: '12:15', label: '11:15 - 12:15', type: 'class' },
        { start: '12:15', end: '13:00', label: '12:15 - 01:00', type: 'lunch', name: 'Lunch Break 🍱' },
        { start: '13:00', end: '14:00', label: '01:00 - 02:00', type: 'class' },
        { start: '14:00', end: '15:00', label: '02:00 - 03:00', type: 'class' },
        { start: '15:00', end: '16:00', label: '03:00 - 04:00', type: 'class' },
    ];

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get('/timetable', config);

                // Transform data into a readable format: { Day: { StartTime: SessionObj } }
                const formattedTimetable = {};
                days.forEach(day => formattedTimetable[day] = {});

                data.forEach(session => {
                    if (formattedTimetable[session.day]) {
                        // Normalize start time to match slots if needed
                        // FIX: If session starts at 11:00, map it to 11:15 slot so it's not hidden by the break
                        let startTime = session.startTime;
                        if (startTime === '11:00') startTime = '11:15';

                        formattedTimetable[session.day][startTime] = session;
                    }
                });

                setTimetable(formattedTimetable);
            } catch (error) {
                console.error('Error fetching timetable:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchTimetable();
    }, [user]);

    if (loading) return <div className="p-10 text-center font-black text-slate-400 animate-pulse uppercase tracking-widest text-xs">Loading Schedule...</div>;

    return (
        <div className="p-6 md:p-10 bg-slate-50 dark:bg-[#0f172a] min-h-screen text-left transition-colors duration-300 font-sans">
            <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-4">
                        <span className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none rotate-3">
                            <FaCalendarAlt size={24} />
                        </span>
                        Weekly Schedule
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 ml-1">
                        Term {user.year} • {user.department} Department
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">
                                    Time Slot
                                </th>
                                {days.map(day => (
                                    <th key={day} className="px-8 py-6 text-left text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {timeSlots.map((slot) => {
                                if (slot.type === 'break' || slot.type === 'lunch') {
                                    return (
                                        <tr key={slot.start} className="bg-orange-50/50 dark:bg-orange-900/10 border-y border-orange-100 dark:border-orange-900/20">
                                            <td className="px-8 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-xs font-black text-orange-500 italic">
                                                    <FaClock className="mr-2 opacity-50" /> {slot.label}
                                                </div>
                                            </td>
                                            <td colSpan={days.length} className="px-4 py-4 text-center align-middle">
                                                <div className="flex items-center justify-center h-full w-full opacity-70">
                                                    <span className="text-xs font-black text-orange-400 uppercase tracking-[0.5em] flex items-center gap-4">
                                                        <span>----------------</span>
                                                        {slot.name}
                                                        <span>----------------</span>
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }

                                return (
                                    <tr key={slot.start} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-8 py-8 whitespace-nowrap bg-slate-50/30 dark:bg-transparent">
                                            <div className="flex items-center text-xs font-black text-indigo-500 italic">
                                                <FaClock className="mr-2 opacity-50" /> {slot.label}
                                            </div>
                                        </td>
                                        {days.map(day => {
                                            const session = timetable[day]?.[slot.start];
                                            return (
                                                <td key={`${day}-${slot.start}`} className="px-4 py-4 align-top h-40 w-48">
                                                    {session ? (
                                                        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-800/30 hover:shadow-lg hover:shadow-indigo-100 dark:hover:shadow-none transition-all group h-full flex flex-col justify-between cursor-pointer hover:-translate-y-1 duration-300">
                                                            <div>
                                                                <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3 inline-block shadow-sm">
                                                                    {session.course?.courseCode}
                                                                </span>
                                                                <h4 className="font-black text-slate-800 dark:text-white text-sm leading-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                    {session.course?.courseName}
                                                                </h4>
                                                            </div>
                                                            <div className="space-y-1.5 border-t border-indigo-100 dark:border-indigo-800/30 pt-3">
                                                                <div className="flex items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                                    <FaUserTie className="mr-2 text-indigo-300" />
                                                                    {session.faculty?.name || 'Staff'}
                                                                </div>
                                                                <div className="flex items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                                    <FaMapMarkerAlt className="mr-2 text-emerald-500" />
                                                                    Room {session.classroom?.roomNumber}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-full rounded-[1.5rem] border border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity">
                                                            <span className="text-[9px] font-black text-slate-200 dark:text-slate-700 uppercase tracking-widest rotate-[-12deg]">Free Slot</span>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-6">
                        <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 rounded-full"></div>
                            Active Lecture
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 rounded-full"></div>
                            Break / Lunch
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-full"></div>
                            Free Slot
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyTimetable;
