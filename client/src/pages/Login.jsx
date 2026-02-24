import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('student'); // Default role
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);
        if (res.success) {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const userRole = userInfo?.role;

            // Check if the user's role matches the selected role
            if (userRole !== selectedRole) {
                setError(`Access denied. You are trying to login as ${selectedRole} but your account is registered as ${userRole}.`);
                return;
            }

            // Redirect based on role
            if (userRole === 'admin') navigate('/admin');
            else if (userRole === 'faculty') navigate('/faculty');
            else if (userRole === 'student') navigate('/student');
            else navigate('/dashboard');
        } else {
            setError(res.message);
        }
    };

    // Theme configuration based on role
    const theme = {
        student: {
            color: 'blue',
            title: 'Welcome Back',
            subtitle: 'Sign in to your Student account',
            icon: <FaUserGraduate className="text-4xl text-blue-600" />,
            iconBg: 'bg-blue-100',
            buttonText: 'Sign in',
            linkText: 'Register here',
            placeholderEmail: 'Email address'
        },
        faculty: {
            color: 'green',
            title: 'Faculty Portal',
            subtitle: 'Sign in to your Faculty account',
            icon: <FaChalkboardTeacher className="text-4xl text-green-600" />,
            iconBg: 'bg-green-100',
            buttonText: 'Faculty Sign in',
            linkText: 'Register new Faculty',
            placeholderEmail: 'Faculty Email'
        },
        admin: {
            color: 'red',
            title: 'Admin Portal',
            subtitle: 'Sign in to access administrative controls',
            icon: <FaUserShield className="text-4xl text-red-600" />,
            iconBg: 'bg-red-100',
            buttonText: 'Admin Sign in',
            linkText: 'Register new Admin',
            placeholderEmail: 'Admin Email'
        }
    };

    const currentTheme = theme[selectedRole];

    // Helper to get dynamic classes
    const getButtonClass = () => {
        const base = "w-full py-3 text-white rounded-lg focus:outline-none focus:ring-2 font-semibold transition duration-200 flex items-center justify-center space-x-2";
        if (selectedRole === 'student') return `${base} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
        if (selectedRole === 'faculty') return `${base} bg-green-600 hover:bg-green-700 focus:ring-green-500`;
        if (selectedRole === 'admin') return `${base} bg-red-600 hover:bg-red-700 focus:ring-red-500`;
    };

    const getLinkClass = () => {
        if (selectedRole === 'student') return "text-blue-600 hover:underline font-medium";
        if (selectedRole === 'faculty') return "text-green-600 hover:underline font-medium";
        if (selectedRole === 'admin') return "text-red-600 hover:underline font-medium";
    };

    const getInputClass = () => {
        return "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition duration-200 " +
            (selectedRole === 'student' ? 'focus:ring-blue-500' :
                selectedRole === 'faculty' ? 'focus:ring-green-500' :
                    'focus:ring-red-500');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl transform transition-all">

                {/* Header Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className={`p-5 rounded-full mb-4 shadow-lg border-2 ${currentTheme.iconBg} ${selectedRole === 'student' ? 'border-blue-200' : selectedRole === 'faculty' ? 'border-green-200' : 'border-red-200'}`}>
                        {currentTheme.icon}
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{currentTheme.title}</h2>
                    <p className="text-gray-500 mt-2 text-sm font-medium">{currentTheme.subtitle}</p>
                </div>

                {error && (
                    <div className={`p-4 mb-6 text-sm rounded-lg flex items-center ${selectedRole === 'admin' ? 'bg-red-50 text-red-700' : 'bg-red-50 text-red-600'}`}>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                            type="email"
                            placeholder={currentTheme.placeholderEmail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={getInputClass()}
                            required
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="text-gray-400" />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={getInputClass()}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={getButtonClass()}
                    >
                        <span>{currentTheme.buttonText}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/register" className={getLinkClass()}>
                        {currentTheme.linkText}
                    </Link>
                </div>

                {/* Role Switcher */}
                <div className="mt-8 border-t border-gray-100 pt-6">
                    <p className="text-center text-sm text-gray-400 mb-4">Or login as</p>
                    <div className="flex justify-center space-x-6 text-sm font-medium text-gray-500">
                        {['student', 'faculty', 'admin'].filter(role => role !== selectedRole).map(role => (
                            <button
                                key={role}
                                onClick={() => {
                                    setSelectedRole(role);
                                    setError('');
                                    setEmail('');
                                    setPassword('');
                                }}
                                className={`capitalize hover:text-gray-800 transition-colors focus:outline-none relative pb-1`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
