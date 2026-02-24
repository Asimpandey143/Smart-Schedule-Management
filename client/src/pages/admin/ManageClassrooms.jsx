import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaTrash, FaPlus } from 'react-icons/fa';

const ManageClassrooms = () => {
    const { user } = useAuth();
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        roomNumber: '',
        capacity: '',
        type: 'Lecture Hall',
        building: '',
        department: 'General'
    });
    const [error, setError] = useState('');

    const fetchClassrooms = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await api.get('/classrooms', config);
            setClassrooms(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching classrooms:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassrooms();
    }, [user]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this classroom?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                await axios.delete(`http://127.0.0.1:5001/api/classrooms/${id}`, config);
                fetchClassrooms();
            } catch (error) {
                console.error('Error deleting classroom:', error);
                alert('Failed to delete classroom');
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
            await api.post('/classrooms', formData, config);
            setShowModal(false);
            setFormData({ roomNumber: '', capacity: '', type: 'Lecture Hall', building: '', department: 'General' });
            fetchClassrooms();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add classroom');
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-8">
            <div className="py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold leading-tight">Manage Classrooms</h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
                    >
                        <FaPlus className="mr-2" /> Add Classroom
                    </button>
                </div>
                <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                    <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Room Number
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Capacity
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Building
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">Loading...</td>
                                    </tr>
                                ) : (
                                    classrooms.map((classroom) => (
                                        <tr key={classroom._id}>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <div className="flex items-center">
                                                    <div className="ml-3">
                                                        <p className="text-gray-900 whitespace-no-wrap">
                                                            {classroom.roomNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <p className="text-gray-900 whitespace-no-wrap">{classroom.capacity}</p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <p className="text-gray-900 whitespace-no-wrap">{classroom.type}</p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <p className="text-gray-900 whitespace-no-wrap">{classroom.building}</p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <p className="text-gray-900 whitespace-no-wrap">{classroom.department || 'General'}</p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <div className="flex item-center justify-center">
                                                    <button onClick={() => handleDelete(classroom._id)} className="text-red-600 hover:text-red-900">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Classroom</h3>
                            {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
                            <form className="mt-2 text-left" onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Room Number</label>
                                    <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Capacity</label>
                                    <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
                                    <select name="type" value={formData.type} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                        <option value="Lecture Hall">Lecture Hall</option>
                                        <option value="Lab">Lab</option>
                                        <option value="Seminar Hall">Seminar Hall</option>
                                        <option value="Classroom">Classroom</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Department</label>
                                    <select name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium bg-white">
                                        <option value="General">General</option>
                                        <option value="AIDS">AIDS</option>
                                        <option value="CSE">CSE</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Building</label>
                                    <input type="text" name="building" value={formData.building} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel</button>
                                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Classroom</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageClassrooms;
