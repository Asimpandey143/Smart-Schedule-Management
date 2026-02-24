import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUserShield, FaBell, FaDatabase, FaPalette, FaLock, FaUserEdit, FaTrashAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const Settings = () => {
    const { user, updateLocalUser } = useAuth();
    const { darkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Form States
    const [profileName, setProfileName] = useState(user?.name || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.put('/auth/profile', { name: profileName }, config);

            // Update global state and local storage immediately
            updateLocalUser(data);

            setSuccess('Profile updated successfully!');
        } catch (err) {
            console.error('Profile Update Error:', err);
            const errorMsg = err.response?.data?.details || err.response?.data?.message || err.message || 'Failed to update profile';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put('/auth/password', { oldPassword, newPassword }, config);
            setSuccess('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleClearTimetables = async () => {
        if (!window.confirm('CRITICAL: Are you sure you want to delete EVERY timetable entry? This cannot be undone.')) return;
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete('/timetable/all', config);
            setSuccess('All timetables have been successfully wiped.');
        } catch (err) {
            setError('Failed to clear data');
        } finally {
            setLoading(false);
        }
    };

    // Preferences State
    const [preferences, setPreferences] = useState({
        notifications: true,
        emailReports: false,
        systemLogs: true
    });

    const togglePreference = (key) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="p-4 md:p-10 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-800 dark:text-white tracking-tighter uppercase">System Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Configure your personal and administrative preferences</p>
            </div>

            {success && <div className="mb-6 p-4 bg-emerald-500 text-white rounded-2xl shadow-lg flex items-center animate-in fade-in slide-in-from-top-4 font-bold"><FaCheckCircle className="mr-3" /> {success}</div>}
            {error && <div className="mb-6 p-4 bg-rose-500 text-white rounded-2xl shadow-lg flex items-center animate-in fade-in slide-in-from-top-4 font-bold"><FaExclamationTriangle className="mr-3" /> {error}</div>}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Profile Edit */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-4 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                            <FaUserEdit size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white">Profile Customization</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                            <input
                                type="text"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Login Email (Read-only)</label>
                            <input
                                type="text"
                                disabled
                                value={user?.email}
                                className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl border-none text-gray-400 font-bold opacity-60 cursor-not-allowed"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Save Profile Changes'}
                        </button>
                    </form>
                </div>

                {/* Password Change */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-4 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl">
                            <FaLock size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white">Security & Login</h2>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-rose-500 dark:text-white font-bold"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-rose-500 dark:text-white font-bold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Confirm New</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-rose-500 dark:text-white font-bold"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Securing...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                {/* Notifications & Prefs */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                            <FaBell size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white">Preferences</h2>
                    </div>

                    <div className="space-y-6">
                        {[
                            { id: 'notifications', label: 'Real-time Conflict Notifications', desc: 'Alert me instantly if a timetable clash occurs' },
                            { id: 'emailReports', label: 'Email Reports', desc: 'Send weekly system audits to my email' },
                            { id: 'systemLogs', label: 'System Logs', desc: 'Record all administrative activities' }
                        ].map((pref) => (
                            <div key={pref.id} className="flex justify-between items-center p-6 bg-gray-50 dark:bg-gray-700/30 rounded-3xl">
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-white text-sm">{pref.label}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">{pref.desc}</p>
                                </div>
                                <div
                                    onClick={() => togglePreference(pref.id)}
                                    className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${preferences[pref.id] ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${preferences[pref.id] ? 'left-7' : 'left-1'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dangerous Zone */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-rose-50 dark:border-rose-900/20">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-4 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl">
                            <FaDatabase size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white">Danger Zone</h2>
                    </div>

                    <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/20">
                        <p className="text-rose-600 dark:text-rose-400 font-black text-sm mb-1 uppercase tracking-tighter">Factory Reset Timetables</p>
                        <p className="text-[11px] text-rose-400 mb-6 font-medium leading-relaxed">This will permanently delete every single timetable entry across all departments and semesters. This action is irreversible.</p>
                        <button
                            onClick={handleClearTimetables}
                            disabled={loading}
                            className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all active:scale-95 flex items-center disabled:opacity-50"
                        >
                            <FaTrashAlt className="mr-2" /> Wipe All Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
