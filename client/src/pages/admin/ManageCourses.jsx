import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaTrash, FaPlus } from 'react-icons/fa';

const ManageCourses = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        courseName: '',
        courseCode: '',
        department: '',
        semester: '',
        credits: ''
    });
    const [error, setError] = useState('');

    const [filterDept, setFilterDept] = useState('');
    const [filterYear, setFilterYear] = useState('');

    const fetchCourses = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await api.get('/courses', config);
            setCourses(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [user]);

    const filteredCourses = courses.filter(c =>
        (filterDept ? c.department === filterDept : true) &&
        (filterYear ? c.semester === filterYear : true)
    );

    const resetFilters = () => {
        setFilterDept('');
        setFilterYear('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                await api.delete(`/courses/${id}`, config);
                fetchCourses();
            } catch (error) {
                console.error('Error deleting course:', error);
                alert('Failed to delete course');
            }
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
            await api.post('/courses', formData, config);
            setShowModal(false);
            setFormData({ courseName: '', courseCode: '', department: '', semester: '', credits: '' });
            fetchCourses();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add course');
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-8">
            <div className="py-8">
                {!filterDept ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600">Select Department Curriculum</h2>
                        <div className="flex gap-6">
                            {['AIDS', 'CSE'].map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setFilterDept(dept)}
                                    className="group relative w-48 h-48 bg-white border-2 border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center transition-all hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-100 active:scale-95"
                                >
                                    <span className="text-4xl font-black text-gray-200 group-hover:text-orange-100 transition-colors tracking-tighter uppercase italic">{dept}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-4">{dept === 'AIDS' ? 'AI & Data Science' : 'Comp. Science Engineering'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : !filterYear ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-right duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={resetFilters} className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600">Select Academic Year</h2>
                        </div>
                        <div className="flex gap-6">
                            {[1, 2].map(year => (
                                <button
                                    key={year}
                                    onClick={() => setFilterYear(year.toString())}
                                    className="group relative w-48 h-48 bg-white border-2 border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center transition-all hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-100 active:scale-95"
                                >
                                    <span className="text-6xl font-black text-gray-200 group-hover:text-orange-100 transition-colors uppercase italic">{year}</span>
                                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest mt-2">{year === 1 ? '1st Year' : '2nd Year'}</span>
                                </button>
                            ))}
                        </div>
                        <p className="mt-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest">{filterDept} Department Selection Active</p>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setFilterYear('')} className="p-3 bg-gray-50 text-gray-400 hover:text-orange-600 rounded-2xl transition-all border border-gray-100 hover:border-orange-100">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Curriculum Management</h2>
                                    <div className="flex gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-black rounded uppercase tracking-widest border border-orange-100">{filterDept}</span>
                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded uppercase tracking-widest border border-amber-100">Year {filterYear}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center px-6 py-4 bg-orange-600 text-white rounded-[1.25rem] hover:bg-orange-700 focus:outline-none shadow-xl shadow-orange-200 transition-all active:scale-95 font-black uppercase tracking-widest text-[10px]"
                            >
                                <FaPlus className="mr-2" /> Add Course
                            </button>
                        </div>
                        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                            <div className="inline-block min-w-full shadow-sm rounded-[2.5rem] overflow-hidden border border-gray-100 bg-white">
                                <table className="min-w-full leading-normal">
                                    <thead>
                                        <tr>
                                            <th className="px-8 py-6 border-b border-gray-100 bg-gray-50 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Course Details
                                            </th>
                                            <th className="px-8 py-6 border-b border-gray-100 bg-gray-50 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Course Code
                                            </th>
                                            <th className="px-8 py-6 border-b border-gray-100 bg-gray-50 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Credits
                                            </th>
                                            <th className="px-8 py-6 border-b border-gray-100 bg-gray-50 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-20 font-black text-gray-200 uppercase tracking-[0.3em] animate-pulse">Mapping Curriculum...</td>
                                            </tr>
                                        ) : filteredCourses.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-20">
                                                    <p className="font-black text-gray-300 uppercase tracking-widest text-xs">No courses listed for this selection</p>
                                                    <button onClick={() => setShowModal(true)} className="mt-4 text-orange-600 font-black uppercase tracking-widest text-[10px] hover:underline underline-offset-4">Add First Course</button>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredCourses.map((course) => (
                                                <tr key={course._id} className="hover:bg-gray-50/80 transition-all group">
                                                    <td className="px-8 py-6 border-b border-gray-50 text-sm">
                                                        <p className="text-gray-900 font-black tracking-tight">{course.courseName}</p>
                                                    </td>
                                                    <td className="px-8 py-6 border-b border-gray-50 text-sm">
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[11px] font-black rounded-xl border border-gray-200/50 italic tracking-widest">
                                                            {course.courseCode}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 border-b border-gray-50 text-sm">
                                                        <p className="text-gray-500 font-bold">{course.credits} Credits</p>
                                                    </td>
                                                    <td className="px-8 py-6 border-b border-gray-50 text-sm text-center">
                                                        <button onClick={() => handleDelete(course._id)} className="p-3 text-red-100 group-hover:text-red-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all">
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
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Course</h3>
                            {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
                            <form className="mt-2 text-left space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Course Name</label>
                                    <input type="text" name="courseName" value={formData.courseName} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Course Code</label>
                                    <input type="text" name="courseCode" value={formData.courseCode} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" required />
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
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Semester/Year</label>
                                        <select name="semester" value={formData.semester} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium bg-white" required>
                                            <option value="">Select</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Credits</label>
                                    <input type="number" name="credits" value={formData.credits} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" required />
                                </div>
                                <div className="flex items-center gap-3 mt-8">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-100 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all">Add Course</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCourses;
