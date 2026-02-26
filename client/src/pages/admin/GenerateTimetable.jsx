import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaTrash, FaPlus, FaDownload, FaMagic, FaCalendarAlt } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const GenerateTimetable = () => {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState([]);
    const [courses, setCourses] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [classrooms, setClassrooms] = useState([]);

    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [showGenModal, setShowGenModal] = useState(false);
    const [selectedDays, setSelectedDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    const [genFilterDept, setGenFilterDept] = useState('');
    const [genFilterYear, setGenFilterYear] = useState('');

    const [manualFilterDept, setManualFilterDept] = useState('');
    const [manualFilterYear, setManualFilterYear] = useState('');

    const [formData, setFormData] = useState({
        course: '',
        faculty: '',
        classroom: '',
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        semester: '1'
    });

    const fetchResources = async () => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        try {
            const [courseRes, facultyRes, roomRes] = await Promise.all([
                api.get('/courses', config),
                api.get('/faculty', config),
                api.get('/classrooms', config)
            ]);
            setCourses(courseRes.data);
            setFaculty(facultyRes.data);
            setClassrooms(roomRes.data);
        } catch (e) {
            console.error("Error fetching resources", e);
        }
    };

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/timetable', config);
            setTimetable(data);
        } catch (error) {
            setError('Failed to fetch timetable');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTimetable();
            fetchResources();
        }
    }, [user]);

    const handleGenerate = async () => {
        setShowGenModal(false);
        setGenerating(true);
        setError('');
        setSuccessMessage('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                targetDays: selectedDays,
                department: genFilterDept,
                semester: genFilterYear
            };
            const { data } = await api.post('/timetable/generate', payload, config);
            setSuccessMessage(data.message);
            fetchTimetable();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to generate timetable');
        } finally {
            setGenerating(false);
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.post('/timetable/manual', formData, config);

            if (data.isConflict) {
                setError(data.message);
            } else {
                setSuccessMessage(data.message);
            }

            setShowModal(false);
            fetchTimetable();
        } catch (error) {
            setError(error.response?.data?.message || 'Conflict detected!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this entry?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/timetable/${id}`, config);
            fetchTimetable();
        } catch (error) {
            setError('Delete failed');
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text('University Academic Timetable', 15, 20);

        const tableData = timetable.map(entry => [
            entry.day,
            `${entry.startTime} - ${entry.endTime}`,
            `${entry.course?.courseName} (Yr ${entry.course?.semester}, ${entry.course?.department})`,
            entry.faculty?.name || 'N/A',
            entry.classroom?.roomNumber || 'N/A'
        ]);

        autoTable(doc, {
            startY: 30,
            head: [['Day', 'Time', 'Course Details', 'Faculty', 'Classroom']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
        });

        doc.save(`timetable_${new Date().toLocaleDateString()}.pdf`);
    };

    const groupedTimetable = {
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
    };

    timetable.forEach(entry => {
        if (groupedTimetable[entry.day]) groupedTimetable[entry.day].push(entry);
    });

    Object.keys(groupedTimetable).forEach(day => {
        groupedTimetable[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    const toggleDaySelection = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const filteredCoursesForManual = courses.filter(c =>
        (manualFilterDept ? c.department === manualFilterDept : true) &&
        (manualFilterYear ? c.semester === manualFilterYear : true)
    );

    return (
        <div className="p-8 bg-slate-50 min-h-screen dark:bg-[#0f172a] transition-colors font-sans">
            {/* Main Header Card */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800/50 p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 backdrop-blur-sm animate-in fade-in slide-in-from-top duration-700">
                <div className="relative">
                    <div className="absolute -left-6 top-0 w-1.5 h-full bg-indigo-500 rounded-full hidden md:block"></div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Timetable Manager</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-3 italic flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                        Smart Scheduling & Automated Generation
                    </p>
                </div>
                <div className="flex flex-wrap gap-4 mt-8 md:mt-0">
                    <button onClick={downloadPDF} className="flex items-center px-7 py-4.5 bg-slate-50 text-slate-500 dark:bg-slate-700 dark:text-slate-300 font-black rounded-2xl hover:text-indigo-600 hover:bg-white border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-xl transition-all active:scale-95 uppercase tracking-widest text-[9px]">
                        <FaDownload className="mr-2" /> PDF Export
                    </button>
                    <button onClick={() => setShowModal(true)} className="flex items-center px-7 py-4.5 bg-white text-indigo-600 border-2 border-indigo-50 font-black rounded-2xl hover:bg-indigo-50 hover:border-indigo-100 transition-all active:scale-95 uppercase tracking-widest text-[9px] shadow-sm">
                        <FaPlus className="mr-2" /> Manual Add
                    </button>
                    <button onClick={() => setShowGenModal(true)} disabled={generating} className="flex items-center px-8 py-4.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95 disabled:bg-slate-300 uppercase tracking-widest text-[10px] ring-4 ring-indigo-50 dark:ring-0">
                        <FaMagic className="mr-2" /> {generating ? 'Processing...' : 'Auto-Generate'}
                    </button>
                </div>
            </div>

            {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-bold text-xs uppercase tracking-widest text-center">{error}</div>}
            {successMessage && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 font-bold text-xs uppercase tracking-widest text-center">{successMessage}</div>}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-12">
                    {Object.keys(groupedTimetable).map(day => (
                        <div key={day} className="animate-in fade-in slide-in-from-bottom duration-700">
                            <div className="flex items-center gap-4 mb-6 ml-2">
                                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none rotate-3">
                                    <FaCalendarAlt size={16} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">{day}</h2>
                            </div>
                            <div className="bg-white dark:bg-slate-800/80 rounded-[3rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden backdrop-blur-md">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700">
                                            <th className="px-10 py-7 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                                            <th className="px-10 py-7 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Academic Details</th>
                                            <th className="px-10 py-7 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Professor</th>
                                            <th className="px-10 py-7 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Venue</th>
                                            <th className="px-10 py-7 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Control</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {groupedTimetable[day].map(entry => (
                                            <tr key={entry._id} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-all ${entry.isConflict ? 'bg-rose-50/30' : ''}`}>
                                                <td className="px-10 py-8 whitespace-nowrap">
                                                    <span className={`text-base font-black italic tracking-tighter ${entry.isConflict ? 'text-rose-600' : 'text-indigo-600'}`}>
                                                        {entry.startTime} - {entry.endTime}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className={`text-base font-black tracking-tight ${entry.isConflict ? 'text-rose-700' : 'text-slate-800 dark:text-white'}`}>
                                                        {entry.course?.courseName}
                                                        {entry.isConflict && <span className="ml-2 bg-rose-600 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Conflict</span>}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.course?.courseCode}</span>
                                                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50/80 dark:bg-blue-900/30 px-3 py-1 rounded-lg">Yr {entry.course?.semester} | {entry.course?.department}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 italic flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                                        {entry.faculty?.name}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center w-fit ${entry.isConflict ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm'}`}>
                                                        Room {entry.classroom?.roomNumber}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8 text-center">
                                                    <button onClick={() => handleDelete(entry._id)} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all active:scale-95 group-hover:bg-rose-50/50">
                                                        <FaTrash size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {groupedTimetable[day].length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-24 text-center">
                                                    <p className="font-black text-slate-200 dark:text-slate-700/50 uppercase tracking-[0.6em] italic text-lg">No Scholastic Activity</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 italic">Select resources to begin scheduling</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Auto-Generation Options Modal */}
            {showGenModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Generator Core</h2>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Distributed algorithmic scheduling</p>
                            </div>
                            <button onClick={() => setShowGenModal(false)} className="text-gray-300 hover:text-gray-900 transition-all text-xl font-light">&times;</button>
                        </div>

                        {/* Generation Filters */}
                        <div className="grid grid-cols-2 gap-4 mb-10 p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
                            <div>
                                <label className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 ml-1">Limit to Department</label>
                                <select className="w-full bg-white border border-transparent rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-indigo-200 transition-all" value={genFilterDept} onChange={e => setGenFilterDept(e.target.value)}>
                                    <option value="">All Departments</option>
                                    <option value="AIDS">AIDS</option>
                                    <option value="CSE">CSE</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 ml-1">Limit to Academic Year</label>
                                <select className="w-full bg-white border border-transparent rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-indigo-200 transition-all" value={genFilterYear} onChange={e => setGenFilterYear(e.target.value)}>
                                    <option value="">All Years</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span> Quick Day Sync
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                        <button
                                            key={day}
                                            onClick={() => {
                                                setSelectedDays([day]);
                                                setTimeout(handleGenerate, 50);
                                            }}
                                            className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all font-black uppercase tracking-widest text-[9px] shadow-sm"
                                        >
                                            Generate {day}
                                            <span className="opacity-0 group-hover:opacity-100 transition-all">START →</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Batch Controls</h3>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                        <button
                                            key={day}
                                            onClick={() => toggleDaySelection(day)}
                                            className={`px-4 py-3 rounded-xl border-2 transition-all font-black uppercase tracking-widest text-[8px] ${selectedDays.includes(day) ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-50 bg-gray-50 text-gray-300'}`}
                                        >
                                            {day.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={selectedDays.length === 0}
                                    className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-700 shadow-xl transition-all active:scale-95 disabled:bg-gray-100 disabled:text-gray-300"
                                >
                                    Sync {selectedDays.length} Days
                                </button>
                                <div className="mt-4 flex gap-4">
                                    <button onClick={() => setSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])} className="text-[8px] font-black text-gray-400 hover:text-indigo-600">Full Week</button>
                                    <button onClick={() => setSelectedDays([])} className="text-[8px] font-black text-gray-400 hover:text-rose-600">Reset</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Entry Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom duration-500 relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
                        <div className="p-10 border-b dark:border-slate-800">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Manual Entry</h2>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-2 italic">Precision Scholastic Scheduling</p>
                        </div>
                        <form onSubmit={handleManualSubmit} className="p-8 space-y-6">
                            {/* Filtering Options for Selection */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                                <div>
                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Dept Filter</label>
                                    <select className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-indigo-500" value={manualFilterDept} onChange={e => setManualFilterDept(e.target.value)}>
                                        <option value="">All Depts</option>
                                        <option value="AIDS">AIDS</option>
                                        <option value="CSE">CSE</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Year Filter</label>
                                    <select className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-indigo-500" value={manualFilterYear} onChange={e => setManualFilterYear(e.target.value)}>
                                        <option value="">All Years</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Course Assignment</label>
                                <select className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold tracking-tight outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer" required onChange={e => setFormData({ ...formData, course: e.target.value })}>
                                    <option value="">Select Target Course</option>
                                    {filteredCoursesForManual.map(c => <option key={c._id} value={c._id}>{c.courseName} | Yr {c.semester}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Assigned Faculty</label>
                                    <select className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold tracking-tight outline-none" required onChange={e => setFormData({ ...formData, faculty: e.target.value })}>
                                        <option value="">Select Staff</option>
                                        {faculty.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Assigned Venue</label>
                                    <select className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold tracking-tight outline-none" required onChange={e => setFormData({ ...formData, classroom: e.target.value })}>
                                        <option value="">Select Room</option>
                                        {classrooms.map(r => <option key={r._id} value={r._id}>{r.roomNumber}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Day</label>
                                    <select className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold tracking-tight outline-none" required value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })}>
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Start</label>
                                    <input type="time" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">End</label>
                                    <input type="time" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-100 transition-all">Cancel</button>
                                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">Finalize Slot</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerateTimetable;
