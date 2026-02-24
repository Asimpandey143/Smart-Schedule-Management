import { useState, useEffect } from 'react';
import { FaUserCircle, FaEnvelope, FaIdCard, FaPhone, FaMapMarkerAlt, FaCamera, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Profile = () => {
    const { user, updateLocalUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        studentId: '',
        department: '',
        year: '',
        avatar: null,
        previewAvatar: null
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                studentId: user.studentId || '',
                department: user.department || '',
                year: user.year || '',
                avatar: null,
                previewAvatar: user.avatar ? `http://127.0.0.1:5001${user.avatar}` : null
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                avatar: file,
                previewAvatar: URL.createObjectURL(file)
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            };

            const data = new FormData();
            data.append('name', formData.name);
            data.append('phone', formData.phone);
            data.append('address', formData.address);
            data.append('studentId', formData.studentId);
            data.append('department', formData.department);
            data.append('year', formData.year);
            if (formData.avatar) {
                data.append('avatar', formData.avatar);
            }

            const res = await api.put('/auth/profile', data, config);

            updateLocalUser(res.data);
            setIsEditing(false);
            setMsg('Profile updated successfully!');
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            console.error('Update Error:', error);
            setMsg(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-10 text-center">Loading Profile...</div>;

    return (
        <div className="p-6 md:p-10 bg-slate-50 dark:bg-[#0f172a] min-h-screen text-left transition-colors duration-300 font-sans">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-4">
                    My Profile
                    <span className="p-2 bg-indigo-600 rounded-xl text-white text-2xl shadow-lg shadow-indigo-200 dark:shadow-none rotate-3">
                        <FaUserCircle />
                    </span>
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 ml-1">
                    Manage your personal information
                </p>
            </div>

            <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800/80 rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 backdrop-blur-sm overflow-hidden relative">

                {/* Visual Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 h-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                </div>

                <div className="px-10 pb-12">
                    {/* Profile Header & Avatar */}
                    <div className="relative flex flex-col md:flex-row justify-between items-end -mt-20 mb-8 gap-6">
                        <div className="relative group/avatar">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl">
                                <div className="w-40 h-40 bg-slate-100 dark:bg-slate-700 rounded-[2rem] flex items-center justify-center text-slate-400 text-6xl shadow-inner overflow-hidden border-4 border-slate-50 dark:border-slate-800">
                                    {formData.previewAvatar ? (
                                        <img src={formData.previewAvatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <FaUserCircle />
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <label className="absolute bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                    <FaCamera size={16} />
                                    <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                                </label>
                            )}
                        </div>

                        <div className="flex-1 md:mb-4">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="text-3xl font-black text-slate-900 dark:text-white bg-transparent border-b-2 border-indigo-500 focus:outline-none w-full mb-2"
                                    placeholder="Your Name"
                                />
                            ) : (
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{user.name}</h2>
                            )}

                            <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                {user.role} • {user.department}
                            </p>
                        </div>

                        <div className="flex gap-3 mb-4">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50"
                                    >
                                        <FaSave /> {loading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(false); setMsg(''); }}
                                        className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-rose-200 dark:shadow-none"
                                    >
                                        <FaTimes /> Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {msg && (
                        <div className={`mb-6 p-4 rounded-2xl text-center text-sm font-bold uppercase tracking-widest ${msg.includes('success') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {msg}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Column 1 */}
                        <div className="space-y-6">
                            {/* Email */}
                            <div className="group flex items-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-[2rem] border border-transparent transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500 text-xl shadow-sm mr-6">
                                    <FaEnvelope />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                    <p className="font-bold text-slate-800 dark:text-white text-sm">{user.email}</p>
                                </div>
                            </div>

                            {/* Student ID */}
                            <div className="group flex items-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-[2rem] border border-transparent transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500 text-xl shadow-sm mr-6">
                                    <FaIdCard />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Student ID</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="studentId"
                                            value={formData.studentId}
                                            onChange={handleChange}
                                            className="font-bold text-slate-800 dark:text-white text-sm bg-transparent border-b border-indigo-300 focus:border-indigo-500 focus:outline-none w-full"
                                            placeholder="Enter ID"
                                        />
                                    ) : (
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{user.studentId || 'Not set'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="group flex items-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-[2rem] border border-transparent transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500 text-xl shadow-sm mr-6">
                                    <FaMapMarkerAlt />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address</p>
                                    {isEditing ? (
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="font-bold text-slate-800 dark:text-white text-sm bg-transparent border-b border-indigo-300 focus:border-indigo-500 focus:outline-none w-full resize-none"
                                            placeholder="Enter Address"
                                            rows="2"
                                        />
                                    ) : (
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{user.address || 'Not set'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-6">
                            {/* Phone */}
                            <div className="group flex items-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-[2rem] border border-transparent transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500 text-xl shadow-sm mr-6">
                                    <FaPhone />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="font-bold text-slate-800 dark:text-white text-sm bg-transparent border-b border-indigo-300 focus:border-indigo-500 focus:outline-none w-full"
                                            placeholder="Enter Phone"
                                        />
                                    ) : (
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{user.phone || 'Not set'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Year / Dept (Read Only) */}
                            <div className="group flex items-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-[2rem] border border-transparent transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500 text-xl shadow-sm mr-6">
                                    <FaUserCircle />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Year</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="year"
                                            value={formData.year}
                                            onChange={handleChange}
                                            className="font-bold text-slate-800 dark:text-white text-sm bg-transparent border-b border-indigo-300 focus:border-indigo-500 focus:outline-none w-full"
                                            placeholder="Enter Year"
                                        />
                                    ) : (
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{user.year}</p>
                                    )}
                                </div>
                            </div>

                            <div className="group flex items-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-[2rem] border border-transparent transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500 text-xl shadow-sm mr-6">
                                    <FaUserCircle />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="font-bold text-slate-800 dark:text-white text-sm bg-transparent border-b border-indigo-300 focus:border-indigo-500 focus:outline-none w-full"
                                            placeholder="Enter Department"
                                        />
                                    ) : (
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{user.department}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
