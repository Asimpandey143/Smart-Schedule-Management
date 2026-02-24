import { useState, useEffect } from 'react';
import { FaUserTie, FaEnvelope, FaIdCard, FaPhone, FaMapMarkerAlt, FaCamera, FaSave, FaTimes, FaLock, FaBuilding } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const FacultyProfile = () => {
    const { user, updateLocalUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        department: '',
        avatar: null,
        previewAvatar: null
    });

    // Password Change States
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passMsg, setPassMsg] = useState('');
    const [passError, setPassError] = useState('');

    const [loading, setLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                department: user.department || '',
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
            data.append('department', formData.department);

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

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPassError('New passwords do not match');
            return;
        }
        setPassLoading(true);
        setPassMsg('');
        setPassError('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put('/auth/password', { oldPassword, newPassword }, config);
            setPassMsg('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPassError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setPassLoading(false);
        }
    };

    if (!user) return <div className="p-10 text-center">Loading Profile...</div>;

    return (
        <div className="p-6 md:p-10 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen text-left transition-colors duration-300 font-sans">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-gray-800 dark:text-white tracking-tighter uppercase italic flex items-center gap-4">
                    Faculty Profile
                    <span className="p-2 bg-blue-600 rounded-xl text-white text-2xl shadow-lg shadow-blue-200 dark:shadow-none rotate-3">
                        <FaUserTie />
                    </span>
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4 ml-1">
                    Manage your professional details
                </p>
            </div>

            <div className="flex flex-col gap-10 max-w-5xl mx-auto">
                {/* Main Profile Card */}
                <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden relative">

                    {/* Visual Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-48 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    </div>

                    <div className="px-10 pb-12">
                        {/* Profile Header & Avatar */}
                        <div className="relative flex flex-col md:flex-row justify-between items-end -mt-20 mb-8 gap-6">
                            <div className="relative group/avatar">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl">
                                    <div className="w-40 h-40 bg-gray-100 dark:bg-gray-700 rounded-[2rem] flex items-center justify-center text-gray-400 text-6xl shadow-inner overflow-hidden border-4 border-white dark:border-gray-800">
                                        {formData.previewAvatar ? (
                                            <img src={formData.previewAvatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <FaUserTie />
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <label className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-transform">
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
                                        className="text-3xl font-black text-gray-800 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none w-full mb-2"
                                        placeholder="Your Name"
                                    />
                                ) : (
                                    <h2 className="text-4xl font-black text-gray-800 dark:text-white tracking-tight mb-1">{user.name}</h2>
                                )}

                                <p className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
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
                                        className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
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
                                <div className="group flex items-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-[2rem] border border-transparent transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-blue-500 text-xl shadow-sm mr-6">
                                        <FaEnvelope />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Institutional Email</p>
                                        <p className="font-bold text-gray-800 dark:text-white text-sm">{user.email}</p>
                                    </div>
                                </div>

                                {/* Department */}
                                <div className="group flex items-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-[2rem] border border-transparent transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-blue-500 text-xl shadow-sm mr-6">
                                        <FaBuilding />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Department</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                className="font-bold text-gray-800 dark:text-white text-sm bg-transparent border-b border-blue-300 focus:border-blue-500 focus:outline-none w-full"
                                                placeholder="Enter Department"
                                            />
                                        ) : (
                                            <p className="font-bold text-gray-800 dark:text-white text-sm">{user.department}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-6">
                                {/* Phone */}
                                <div className="group flex items-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-[2rem] border border-transparent transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-blue-500 text-xl shadow-sm mr-6">
                                        <FaPhone />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="font-bold text-gray-800 dark:text-white text-sm bg-transparent border-b border-blue-300 focus:border-blue-500 focus:outline-none w-full"
                                                placeholder="Enter Phone"
                                            />
                                        ) : (
                                            <p className="font-bold text-gray-800 dark:text-white text-sm">{user.phone || 'Not set'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="group flex items-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-[2rem] border border-transparent transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-blue-500 text-xl shadow-sm mr-6">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Office Address</p>
                                        {isEditing ? (
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="font-bold text-gray-800 dark:text-white text-sm bg-transparent border-b border-blue-300 focus:border-blue-500 focus:outline-none w-full resize-none"
                                                placeholder="Enter Address"
                                                rows="1"
                                            />
                                        ) : (
                                            <p className="font-bold text-gray-800 dark:text-white text-sm">{user.address || 'Not set'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Change Card */}
                <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-10">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-4 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl">
                            <FaLock size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white">Security & Password</h2>
                    </div>

                    {passMsg && (
                        <div className="mb-6 p-4 bg-emerald-100 text-emerald-800 rounded-2xl text-center text-sm font-bold uppercase tracking-widest">
                            {passMsg}
                        </div>
                    )}
                    {passError && (
                        <div className="mb-6 p-4 bg-rose-100 text-rose-800 rounded-2xl text-center text-sm font-bold uppercase tracking-widest">
                            {passError}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="text-left">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-rose-500 dark:text-white font-bold"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-rose-500 dark:text-white font-bold"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm New</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-rose-500 dark:text-white font-bold"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={passLoading}
                            className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {passLoading ? 'Securing Account...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FacultyProfile;
