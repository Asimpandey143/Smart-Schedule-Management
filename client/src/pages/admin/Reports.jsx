import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaBuilding, FaDownload, FaHistory, FaClock } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        totalCourses: 0,
        totalClassrooms: 0,
        facultyWorkload: [],
        weeklyAttendance: [],
        weekStartDate: ''
    });
    const [detailedLogs, setDetailedLogs] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);

    const fetchDetailedData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [statsRes, logsRes, timetableRes] = await Promise.all([
                api.get('/admin/stats', config),
                api.get('/attendance/all', config),
                api.get('/timetable', config)
            ]);
            setStats(statsRes.data);
            setDetailedLogs(logsRes.data);
            setTimetable(timetableRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching detailed stats:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchDetailedData();
    }, [user]);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    // Helper to find period from timetable
    const getPeriod = (courseId, facultyId, date) => {
        const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        const match = timetable.find(t =>
            t.course?._id === courseId &&
            t.faculty?._id === facultyId &&
            t.day === day
        );
        return match ? `${match.startTime} - ${match.endTime}` : 'Manual Entry';
    };

    const downloadAuditReport = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.text('University Full System Audit', 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Report Period Week Starting: ${stats.weekStartDate}`, 14, 35);

        // 1. Summary Statistics Table
        autoTable(doc, {
            startY: 45,
            head: [['Statistic', 'Total Count']],
            body: [
                ['Total Students', stats.totalStudents],
                ['Active Faculty', stats.totalFaculty],
                ['Total Courses', stats.totalCourses],
                ['Classrooms', stats.totalClassrooms],
            ],
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] } // Indigo-600
        });

        // 2. Attendance Log Table
        doc.setFontSize(16);
        doc.text('Detailed Attendance Logs', 14, doc.lastAutoTable.finalY + 15);

        const logsData = detailedLogs.map(log => [
            new Date(log.date).toLocaleDateString(),
            (log.course?.courseName || 'N/A') + ' (' + (log.course?.courseCode || 'N/A') + ')',
            log.faculty?.name || 'N/A',
            log.startTime && log.endTime ? `${log.startTime} - ${log.endTime}` : 'N/A',
            `${log.students.filter(s => s.status === 'Present').length} / ${log.students.length}`
        ]);

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Date', 'Course', 'Faculty', 'Period', 'Attendance']],
            body: logsData,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] } // Emerald-500
        });

        // 3. Faculty Workload
        doc.setFontSize(16);
        doc.text('Faculty Workload Summary', 14, doc.lastAutoTable.finalY + 15);

        const workloadData = stats.facultyWorkload.map(fw => [fw.name, fw.value]);
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Faculty Name', 'Classes Per Week']],
            body: workloadData,
            headStyles: { fillColor: [245, 158, 11] } // Amber-500
        });

        doc.save(`University_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-indigo-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen transition-colors">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">University Analytics</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Real-time attendance & resource utilization</p>
                </div>
                <button
                    onClick={downloadAuditReport}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
                >
                    <FaDownload className="mr-2" /> Full System Audit
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Total Students', value: stats.totalStudents, icon: <FaUserGraduate />, color: 'blue' },
                    { label: 'Active Faculty', value: stats.totalFaculty, icon: <FaChalkboardTeacher />, color: 'emerald' },
                    { label: 'Live Courses', value: stats.totalCourses, icon: <FaBook />, color: 'amber' },
                    { label: 'Classrooms', value: stats.totalClassrooms, icon: <FaBuilding />, color: 'indigo' },
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900 transition-all">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                            <p className="text-3xl font-black text-gray-800 dark:text-white tracking-tighter">{item.value}</p>
                        </div>
                        <div className={`p-4 rounded-xl bg-${item.color}-500/10 text-${item.color}-600 dark:text-${item.color}-400 text-2xl`}>
                            {item.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Visual Analytics */}
                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                {selectedSession ? `Session Detail: ${selectedSession.course?.courseName}` : 'Attendance Dynamics (%)'}
                            </h2>
                            {selectedSession && (
                                <button onClick={() => setSelectedSession(null)} className="text-[10px] text-indigo-500 font-bold uppercase hover:underline">← Back to Weekly Overview</button>
                            )}
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                            {selectedSession ? `${new Date(selectedSession.date).toLocaleDateString()}` : `Week: ${stats.weekStartDate}`}
                        </span>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={selectedSession ? [
                                    { name: 'Present', count: selectedSession.students.filter(s => s.status === 'Present').length, color: '#10b981' },
                                    { name: 'Absent', count: selectedSession.students.filter(s => s.status === 'Absent').length, color: '#f43f5e' }
                                ] : stats.weeklyAttendance}
                                margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis
                                    dataKey={selectedSession ? "name" : "day"}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 800 }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                />
                                {selectedSession ? (
                                    <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={60}>
                                        {[0, 1].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                                        ))}
                                    </Bar>
                                ) : (
                                    <>
                                        <Bar dataKey="present" fill="#10b981" radius={[8, 8, 0, 0]} barSize={24} name="Present" />
                                        <Bar dataKey="absent" fill="#f43f5e" radius={[8, 8, 0, 0]} barSize={24} name="Absent" />
                                    </>
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-8">Workload Distribution</h2>
                    <div className="h-72">
                        {stats.facultyWorkload.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.facultyWorkload}
                                        cx="50%" cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.facultyWorkload.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">No scheduling data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* NEW: Detailed Period-wise Reports */}
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-8 py-6 bg-gray-50/50 dark:bg-gray-700/30 border-b dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-indigo-200 shadow-lg dark:shadow-none">
                            <FaHistory />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Detailed Period Logs</h2>
                            <p className="text-xs text-gray-500 font-medium">Drill-down data for every class session conducted</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{detailedLogs.length} Sessions Total</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/40">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Day</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Info</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Faculty</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Period / Slot</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {detailedLogs.map((log) => (
                                <tr
                                    key={log._id}
                                    onClick={() => setSelectedSession(log)}
                                    className={`cursor-pointer transition-colors group ${selectedSession?._id === log._id ? 'bg-indigo-100/50 dark:bg-indigo-900/40' : 'hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10'}`}
                                >
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <p className="text-sm font-bold text-gray-800 dark:text-white">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'long' })}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-bold text-gray-800 dark:text-white">{log.course?.courseName}</p>
                                        <p className="text-[10px] text-indigo-500 font-bold">{log.course?.courseCode}</p>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black">
                                                {log.faculty?.name?.charAt(0)}
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{log.faculty?.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                            <FaClock className="mr-2 text-indigo-400" size={12} />
                                            <span className="text-xs font-bold">
                                                {log.startTime && log.endTime ? `${log.startTime} - ${log.endTime}` : getPeriod(log.course?._id, log.faculty?._id, log.date)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="inline-flex items-center px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                                            <span className="text-sm font-black mr-1">{log.students.filter(s => s.status === 'Present').length}</span>
                                            <span className="text-[10px] font-bold opacity-60">/ {log.students.length} Present</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {detailedLogs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-gray-400 italic">No attendance records found in the system</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
