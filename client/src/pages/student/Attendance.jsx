import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaUserCheck, FaUserTimes, FaChalkboardTeacher, FaExclamationTriangle, FaChartPie, FaListAlt } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Attendance = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // Using the specific endpoint for detailed student attendance
                const { data } = await api.get('/attendance/student', config);
                // Ensure data has necessary fields, default to empty if not
                setAttendance(data || []);
            } catch (err) {
                console.error('Error fetching attendance:', err);
                // Fallback mock data for visualization if API fails or returns empty (optional, remove in prod)
                // setAttendance([]); 
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchAttendance();
    }, [user]);

    // Calculate Summary Statistics
    const totalClasses = attendance.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const totalAttended = attendance.reduce((acc, curr) => acc + (curr.attended || 0), 0);
    const totalMissed = totalClasses - totalAttended;
    const overallPercentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : 0;

    // Determine status color for progress bars
    const getStatusColor = (pct) => {
        if (pct >= 85) return 'bg-emerald-500'; // Excellent
        if (pct >= 75) return 'bg-blue-500';    // Good
        if (pct >= 65) return 'bg-amber-500';   // Warning
        return 'bg-rose-500';                   // Critical
    };

    const getStatusText = (pct) => {
        if (pct >= 85) return 'Excellent';
        if (pct >= 75) return 'Good';
        if (pct >= 65) return 'At Risk';
        return 'Critical';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f8f9fc] dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-black text-gray-400 uppercase tracking-widest text-xs animate-pulse">Loading Records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen text-left transition-colors duration-200">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white tracking-tighter uppercase flex items-center gap-3">
                        <span className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 text-xl"><FaChartPie /></span>
                        Attendance Record
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-2 ml-1">
                        Comprehensive overview of your academic presence
                    </p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className={`w-3 h-3 rounded-full ${overallPercentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Overall Status: {overallPercentage >= 75 ? 'Good Standing' : 'Action Required'}
                    </span>
                </div>
            </div>

            {/* Summary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Card 1: Overall % */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${overallPercentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <FaChartPie size={80} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Overall Attendance</p>
                    <h2 className={`text-4xl font-black ${overallPercentage >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {overallPercentage}%
                    </h2>
                    <p className="text-xs font-bold text-gray-400 mt-2">Target: 75%+</p>
                </div>

                {/* Card 2: Present */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 text-blue-600 transition-opacity">
                        <FaUserCheck size={80} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Classes Attended</p>
                    <h2 className="text-4xl font-black text-blue-600 dark:text-blue-400">
                        {totalAttended}
                    </h2>
                    <p className="text-xs font-bold text-gray-400 mt-2">Sessions Present</p>
                </div>

                {/* Card 3: Absent */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 text-amber-600 transition-opacity">
                        <FaUserTimes size={80} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Classes Missed</p>
                    <h2 className="text-4xl font-black text-amber-500">
                        {totalMissed}
                    </h2>
                    <p className="text-xs font-bold text-gray-400 mt-2">Sessions Absent</p>
                </div>

                {/* Card 4: Total */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 text-purple-600 transition-opacity">
                        <FaChalkboardTeacher size={80} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Classes</p>
                    <h2 className="text-4xl font-black text-purple-600 dark:text-purple-400">
                        {totalClasses}
                    </h2>
                    <p className="text-xs font-bold text-gray-400 mt-2">Conducted Sessions</p>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left Column: Detailed List */}
                <div className="xl:col-span-2 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                                <FaListAlt className="text-gray-400" /> Subject Breakdown
                            </h3>
                            <p className="text-xs text-gray-400 font-bold mt-1">Detailed report per subject</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <th className="pb-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                                    <th className="pb-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Attended</th>
                                    <th className="pb-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                                    <th className="pb-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Performance</th>
                                    <th className="pb-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {attendance.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-400 font-medium">No attendance records found.</td>
                                    </tr>
                                ) : (
                                    attendance.map((sub, idx) => (
                                        <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="py-5 pr-4">
                                                <div className="font-bold text-gray-800 dark:text-white text-sm">{sub.name}</div>
                                                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{sub.code || 'CODE-??'}</div>
                                            </td>
                                            <td className="py-5 text-center font-bold text-gray-600 dark:text-gray-300">{sub.attended}</td>
                                            <td className="py-5 text-center font-bold text-gray-600 dark:text-gray-300">{sub.total}</td>
                                            <td className="py-5 pl-4 w-1/3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black w-8 text-right dark:text-white">{sub.percentage}%</span>
                                                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${getStatusColor(sub.percentage)}`}
                                                            style={{ width: `${sub.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 text-right">
                                                <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${sub.percentage >= 75
                                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-100'
                                                        : 'bg-rose-500/10 text-rose-600 border-rose-100'
                                                    }`}>
                                                    {getStatusText(sub.percentage)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                    <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter mb-2">Visual Analysis</h3>
                    <p className="text-xs text-gray-400 font-bold mb-8">Performance Comparison</p>

                    <div className="flex-grow min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendance} layout="vertical" margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={[0, 100]}
                                />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={80}
                                    tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Bar dataKey="percentage" barSize={15} radius={[0, 10, 10, 0]}>
                                    {attendance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.percentage >= 75 ? '#3b82f6' : '#f43f5e'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
                        <div className="flex items-start gap-3">
                            <FaExclamationTriangle className={`mt-1 ${overallPercentage < 75 ? 'text-rose-500' : 'text-emerald-500'}`} />
                            <div>
                                <h4 className="text-xs font-black uppercase text-gray-700 dark:text-gray-200 mb-1">Efficiency Insight</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {overallPercentage >= 75
                                        ? "Great job! Your attendance is consistently high across most subjects. Keep maintaining this streak."
                                        : "Your overall attendance is below the recommended 75% threshold. Consider attending more classes to avoid penalties."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Attendance;
