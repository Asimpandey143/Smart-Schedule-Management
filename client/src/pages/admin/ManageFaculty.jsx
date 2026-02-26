import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaTrash, FaPlus } from 'react-icons/fa';

const ManageFaculty = () => {
    const { user } = useAuth();
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: ''
    });
    const [error, setError] = useState('');

    const [filterDept, setFilterDept] = useState('');

    const fetchFaculty = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await api.get('/faculty', config);
            setFaculty(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching faculty:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, [user]);

    const filteredFaculty = faculty.filter(f =>
        (filterDept ? f.department === filterDept : true)
    );

    const resetFilters = () => {
        setFilterDept('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this faculty member?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                await api.delete(`/faculty/${id}`, config);
                fetchFaculty();
            } catch (error) {
                console.error('Error deleting faculty:', error);
                alert('Failed to delete faculty');
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
            await api.post('/faculty', formData, config);
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', department: '' });
            fetchFaculty();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add faculty');
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-8">
            <div className="py-8">
                {!filterDept ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">Select Department Faculty</h2>
                        <div className="flex gap-6">
                            {['AIDS', 'CSE'].map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setFilterDept(dept)}
                                    className="group relative w-48 h-48 bg-white border-2 border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center transition-all hover:border-teal-500 hover:shadow-2xl hover:shadow-teal-100 active:scale-95"
                                >
                                    <span className="text-4xl font-black text-gray-200 group-hover:text-teal-100 transition-colors tracking-tighter uppercase italic">{dept}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-4">{dept === 'AIDS' ? 'AI & Data Science' : 'Comp. Science Engineering'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <button onClick={resetFilters} className="p-3 bg-gray-50 text-gray-400 hover:text-teal-600 rounded-2xl transition-all border border-gray-100 hover:border-teal-100">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Faculty Registry</h2>
                                    <div className="flex gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-teal-50 text-teal-600 text-[10px] font-black rounded uppercase tracking-widest border border-teal-100">{filterDept}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center px-6 py-4 bg-teal-600 text-white rounded-[1.25rem] hover:bg-teal-700 focus:outline-none shadow-xl shadow-teal-200 transition-all active:scale-95 font-black uppercase tracking-widest text-[10px]"
                            >
                                <FaPlus className="mr-2" /> Add Faculty
                            </button>
                        </div>
                        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                            <div className="inline-block min-w-full shadow-sm rounded-[2.5rem] overflow-hidden border border-gray-100 bg-white">
                                <table className="min-w-full leading-normal">
                                    <thead>
                                        <tr>
                                            <th className="px-8 py-6 border-b border-gray-100 bg-gray-50 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Faculty Name
                                            </th>
                                            <th className="px-8 py-6 border-b border-gray-100 bg-gray-50 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Contact Email
                                            </th>
                                            <th className="px-8 py-6 border-b border-gray-100 bg-gray-50 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="3" className="text-center py-20 font-black text-gray-200 uppercase tracking-[0.3em] animate-pulse">Syncing Staff...</td>
                                            </tr>
                                        ) : filteredFaculty.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-center py-20">
                                                    <p className="font-black text-gray-300 uppercase tracking-widest text-xs">No faculty found in {filterDept}</p>
                                                    <button onClick={() => setShowModal(true)} className="mt-4 text-teal-600 font-black uppercase tracking-widest text-[10px] hover:underline underline-offset-4">Register First Member</button>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredFaculty.map((member) => (
                                                <tr key={member._id} className="hover:bg-gray-50/80 transition-all group">
                                                    <td className="px-8 py-6 border-b border-gray-50 text-sm">
                                                        <p className="text-gray-900 font-black tracking-tight">{member.name}</p>
                                                    </td>
                                                    <td className="px-8 py-6 border-b border-gray-50 text-sm">
                                                        <p className="text-gray-500 font-medium tracking-tight italic">{member.email}</p>
                                                    </td>
                                                    <td className="px-8 py-6 border-b border-gray-50 text-sm text-center">
                                                        <button onClick={() => handleDelete(member._id)} className="p-3 text-red-100 group-hover:text-red-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all">
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
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Faculty</h3>
                            {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
                            <form className="mt-2 text-left" onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Department</label>
                                    <input type="text" name="department" value={formData.department} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                                </div>
                                <div className="flex items-center justify-between">
                                    <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel</button>
                                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Faculty</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageFaculty;
