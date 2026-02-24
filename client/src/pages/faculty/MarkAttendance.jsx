import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaUserFriends, FaGraduationCap, FaChevronRight, FaTimesCircle } from 'react-icons/fa';

const MarkAttendance = () => {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [overrideDay, setOverrideDay] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFacultyTimetable = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get('/timetable', config);
                setTimetable(data);
            } catch (err) {
                console.error('Error fetching timetable:', err);
            }
        };

        const fetchAllStudents = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get('/students', config);
                setStudents(data);
            } catch (err) {
                console.error('Error fetching students:', err);
            }
        };

        if (user) {
            fetchFacultyTimetable();
            fetchAllStudents();
        }
    }, [user]);

    const getDayName = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
    };

    const activeDay = overrideDay || getDayName(selectedDate);
    const dailySlots = timetable.filter(t => t.day === activeDay);

    const handleSlotChange = (slotId) => {
        const slot = dailySlots.find(s => s._id === slotId);
        setSelectedSlot(slot);
        setSuccess('');
        setError('');

        if (slot) {
            console.log('Selected Slot:', slot);
            console.log('Total Students:', students.length);

            // Filter students belonging to the course's department
            const filteredStudents = students.filter(s => {
                // strict check on department
                const deptMatch = s.department === slot.course?.department;

                // optional: check semester/year mapping if possible
                // For now, let's rely on Department matching as the primary filter
                return deptMatch;
            });

            console.log('Filtered Students:', filteredStudents.length);

            setAttendanceData(filteredStudents.length > 0 ? filteredStudents.map(s => ({
                student: s._id,
                name: s.name,
                email: s.email,
                status: 'Present'
            })) : []);

            if (filteredStudents.length === 0) {
                setError(`No students found for Department: ${slot.course?.department || 'N/A'}`);
            }
        } else {
            setAttendanceData([]);
        }
    };

    const handleStatusChange = (id, status) => {
        setAttendanceData(prev => prev.map(s =>
            s.student === id ? { ...s, status } : s
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSlot || !selectedDate) {
            setError('Please choose a class slot and verify the date.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.post('/attendance', {
                courseId: selectedSlot.course?._id,
                date: selectedDate,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
                students: attendanceData.map(s => ({ student: s.student, status: s.status }))
            }, config);

            setSuccess('Attendance register updated successfully! 🎉');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit attendance. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-10 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen text-left transition-colors duration-200">
            <div className="mb-6 md:mb-10">
                <h1 className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter uppercase">Attendance Register</h1>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">Select your class and mark student presence for the day</p>
            </div>

            {success && (
                <div className="mb-8 p-6 bg-emerald-500 text-white rounded-[2rem] shadow-xl shadow-emerald-500/20 flex items-center animate-in fade-in zoom-in font-bold text-sm md:text-base">
                    <FaCheckCircle className="text-2xl mr-4" /> {success}
                </div>
            )}

            {error && (
                <div className="mb-8 p-6 bg-rose-500 text-white rounded-[2rem] shadow-xl shadow-rose-500/20 flex items-center animate-in fade-in zoom-in font-bold text-sm md:text-base">
                    <FaTimesCircle className="text-2xl mr-4" /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                {/* Left Panel: Configuration */}
                <div className="lg:col-span-1 space-y-6 md:space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter mb-6 flex items-center">
                            <FaCalendarAlt className="mr-3 text-blue-500" /> Session Controls
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Class Date</label>
                                <input
                                    type="date"
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold mb-4"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setOverrideDay(null); // Reset override on date change
                                        setSelectedSlot(null);
                                        setAttendanceData([]);
                                    }}
                                />

                                {/* Day Selector Chips */}
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Schedule Day (Override)</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                                        <button
                                            key={day}
                                            onClick={() => {
                                                setOverrideDay(day);
                                                setSelectedSlot(null);
                                                setAttendanceData([]);
                                            }}
                                            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeDay === day
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {day.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Available Slots ({activeDay})</label>
                                <div className="space-y-3">
                                    {dailySlots.length === 0 ? (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl text-center text-gray-400 font-bold text-xs uppercase">
                                            No classes scheduled
                                        </div>
                                    ) : (
                                        dailySlots.map((slot) => (
                                            <button
                                                key={slot._id}
                                                onClick={() => handleSlotChange(slot._id)}
                                                className={`w-full p-5 rounded-2xl border-2 transition-all flex flex-col text-left ${selectedSlot?._id === slot._id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-50 dark:border-gray-700 hover:border-blue-200 bg-white dark:bg-gray-800'
                                                    }`}
                                            >
                                                <span className={`font-black uppercase tracking-widest text-[10px] mb-1 ${selectedSlot?._id === slot._id ? 'text-blue-600' : 'text-gray-400'}`}>
                                                    {slot.startTime} - {slot.endTime}
                                                </span>
                                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                                    {slot.course?.courseName}
                                                </span>
                                                <span className="text-[11px] text-gray-400 font-medium">Room {slot.classroom?.roomNumber} • Sem {slot.course?.semester}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedSlot && (
                        <div className="bg-emerald-600 p-8 rounded-[3rem] shadow-xl shadow-emerald-600/20 text-white">
                            <h3 className="font-black uppercase tracking-widest text-xs opacity-70 mb-2 text-left">Selected Class</h3>
                            <h2 className="text-2xl font-black mb-1 text-left">{selectedSlot.course?.courseName}</h2>
                            <p className="text-xs font-bold opacity-80 mb-6 flex items-center text-left">
                                <FaClock className="mr-2" /> {selectedSlot.startTime} - {selectedSlot.endTime}
                            </p>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-60">Total Roster</p>
                                    <p className="text-3xl font-black">{attendanceData.length}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase opacity-60">Present</p>
                                    <p className="text-3xl font-black">{attendanceData.filter(s => s.status === 'Present').length}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Student List */}
                <div className="lg:col-span-2">
                    {!selectedSlot ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
                            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center mb-6 text-blue-500">
                                <FaUserFriends size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2 uppercase tracking-tighter">Ready to mark?</h3>
                            <p className="text-gray-400 font-medium max-w-sm text-center">Please select a class session from the control panel on the left to load the student list.</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tighter uppercase">Student Roster</h2>
                                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Mark Present (P) or Absent (A)</p>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || attendanceData.length === 0}
                                    className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 text-xs"
                                >
                                    {loading ? 'Submitting...' : 'Save Attendance'}
                                </button>
                            </div>

                            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {attendanceData.length === 0 ? (
                                    <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">
                                        Roster list is empty
                                    </div>
                                ) : (
                                    attendanceData.map((student, index) => (
                                        <div key={student.student} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50/30 dark:hover:bg-gray-700/20 transition-all group">
                                            <div className="flex items-center mb-4 md:mb-0">
                                                <div className="hidden md:flex w-8 h-8 font-black text-[10px] text-gray-300 items-center justify-center mr-4">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </div>
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                                                    <FaGraduationCap size={24} />
                                                </div>
                                                <div className="ml-5 text-left">
                                                    <h4 className="font-black text-gray-800 dark:text-gray-200">{student.name}</h4>
                                                    <p className="text-xs text-gray-400 font-medium">{student.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1.5 rounded-2xl w-fit self-end md:self-auto">
                                                <button
                                                    onClick={() => handleStatusChange(student.student, 'Present')}
                                                    className={`px-8 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${student.status === 'Present'
                                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                        : 'text-gray-400 hover:text-gray-600'
                                                        }`}
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(student.student, 'Absent')}
                                                    className={`px-8 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${student.status === 'Absent'
                                                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                                        : 'text-gray-400 hover:text-gray-600'
                                                        }`}
                                                >
                                                    Absent
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarkAttendance;
