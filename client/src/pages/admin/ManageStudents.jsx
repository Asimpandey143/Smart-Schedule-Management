import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

const ManageStudents = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: '',
        year: '',
        section: '',
        studentClass: 'B.Tech'
    });
    const [error, setError] = useState('');

    const [filterYear, setFilterYear] = useState('');
    const [filterDept, setFilterDept] = useState('');

    const fetchStudents = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await api.get('/students', config);
            setStudents(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [user]);

    const filteredStudents = students.filter(s =>
        (filterYear ? s.year === filterYear : true) &&
        (filterDept ? s.department === filterDept : true)
    );

    const resetFilters = () => {
        setFilterYear('');
        setFilterDept('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                await axios.delete(`http://127.0.0.1:5001/api/students/${id}`, config);
                fetchStudents();
            } catch (error) {
                console.error('Error deleting student:', error);
                alert('Failed to delete student');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newFormData = { ...formData, [name]: value };

        // Room assignment logic
        if (name === 'year' || name === 'department') {
            const currentDept = name === 'department' ? value : formData.department;
            const currentYear = name === 'year' ? value : formData.year;

            let autoSection = '';
            if (currentDept === 'AIDS') {
                if (currentYear === '1') autoSection = '101';
                else if (currentYear === '2') autoSection = '102';
            } else if (currentDept === 'CSE') {
                if (currentYear === '1') autoSection = '103';
                else if (currentYear === '2') autoSection = '104';
            }
            newFormData.section = autoSection;
        }

        setFormData(newFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            // Ensure studentClass and section are sent
            await api.post('/students', formData, config);
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', department: '', year: '', section: '', studentClass: 'B.Tech' });
            fetchStudents();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add student');
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-8">
            <div className="py-8">
                {/* Step-by-Step Selection Flow */}
                {!filterYear ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Select Academic Year</h2>
                        <div className="flex gap-6">
                            {[1, 2].map(year => (
                                <button
                                    key={year}
                                    onClick={() => setFilterYear(year.toString())}
                                    className="group relative w-48 h-48 bg-white border-2 border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center transition-all hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 active:scale-95"
                                >
                                    <span className="text-6xl font-black text-gray-200 group-hover:text-blue-100 transition-colors uppercase italic">{year}</span>
                                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest mt-2">{year === 1 ? '1st Year' : '2nd Year'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : !filterDept ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-right duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={() => setFilterYear('')} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Select Department</h2>
                        </div>
                        <div className="flex gap-6">
                            {['AIDS', 'CSE'].map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setFilterDept(dept)}
                                    className="group relative w-48 h-48 bg-white border-2 border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center transition-all hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 active:scale-95"
                                >
                                    <span className="text-4xl font-black text-gray-200 group-hover:text-blue-100 transition-colors tracking-tighter uppercase italic">{dept}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-4">{dept === 'AIDS' ? 'AI & Data Science' : 'Comp. Science Engineering'}</span>
                                </button>
                            ))}
                        </div>
                        <p className="mt-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Year {filterYear} Selected</p>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <button onClick={resetFilters} className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-2xl transition-all border border-gray-100 hover:border-blue-100">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Manage Students</h2>
                                    <div className="flex gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded uppercase tracking-widest border border-blue-100">Year {filterYear}</span>
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded uppercase tracking-widest border border-indigo-100">{filterDept}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center px-6 py-4 bg-blue-600 text-white rounded-[1.25rem] hover:bg-blue-700 focus:outline-none shadow-xl shadow-blue-200 transition-all active:scale-95 font-black uppercase tracking-widest text-[10px]"
                            >
                                <FaPlus className="mr-2" /> Enroll Student
                            </button>
                        </div>
                        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                            <div className="inline-block min-w-full shadow-sm rounded-[2.5rem] overflow-hidden border border-gray-100 bg-white">
                                <table className="min-w-full leading-normal">
                                    <thead>
                                        <tr>
                                            <th className="px-8 py-6 border-b border-gray-100 bg-gray-50 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Student Name
                                            </th>
                                            <th className="px-8 py-6 border-b border-gray-100 bg-gray-50 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Email Address
                                            </th>
                                            <th className="px-8 py-6 border-b border-gray-100 bg-gray-50 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Class (Room)
                                            </th>
                                            <th className="px-8 py-6 border-b border-gray-100 bg-gray-50 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-20 font-black text-gray-200 uppercase tracking-[0.3em] animate-pulse">Scanning Database...</td>
                                            </tr>
                                        ) : filteredStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-20">
                                                    <p className="font-black text-gray-300 uppercase tracking-widest text-xs">No students found matching this criteria</p>
                                                    <button onClick={() => setShowModal(true)} className="mt-4 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:underline underline-offset-4">Enroll First Student</button>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStudents.map((student) => (
                                                <tr key={student._id} className="hover:bg-gray-50/80 transition-all group">
                                                    <td className="px-8 py-6 border-b border-gray-50 text-sm">
                                                        <p className="text-gray-900 font-black tracking-tight">{student.name}</p>
                                                    </td>
                                                    <td className="px-8 py-6 border-b border-gray-50 text-sm">
                                                        <p className="text-gray-500 font-medium tracking-tight italic">{student.email}</p>
                                                    </td>
                                                    <td className="px-8 py-6 border-b border-gray-50 text-sm">
                                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-black rounded-xl border border-blue-100/50 italic tracking-widest">
                                                            {student.section}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 border-b border-gray-50 text-sm text-center">
                                                        <button onClick={() => handleDelete(student._id)} className="p-3 text-red-100 group-hover:text-red-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all">
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-800/60 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative p-8 w-full max-w-md shadow-2xl rounded-[2.5rem] bg-white border border-gray-100 transform transition-all">
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-6">Enroll New Student</h3>
                            {error && <div className="mb-4 text-red-500 text-xs font-bold uppercase tracking-widest bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
                            <form className="text-left space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Department</label>
                                        <select name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium bg-white" required>
                                            <option value="">Select</option>
                                            <option value="AIDS">AIDS</option>
                                            <option value="CSE">CSE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Year</label>
                                        <select name="year" value={formData.year} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium bg-white" required>
                                            <option value="">Select</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Class (Room)</label>
                                    <input type="text" name="section" value={formData.section} readOnly className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-blue-600 font-black tracking-widest outline-none" placeholder="Auto-assigned" />
                                </div>
                                <div className="flex items-center gap-3 mt-8">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-100 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all">Enroll Student</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStudents;
