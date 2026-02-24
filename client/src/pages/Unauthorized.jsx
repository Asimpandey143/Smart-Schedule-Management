import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        // Redirect to their dashboard based on role
        if (user?.role === 'admin') navigate('/admin');
        else if (user?.role === 'faculty') navigate('/faculty');
        else if (user?.role === 'student') navigate('/student');
        else navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                    <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
                <p className="text-gray-600 mb-6">
                    You do not have permission to view this page. This might be because you are logged in with an account that doesn't have the required role.
                </p>

                {user && (
                    <div className="mb-6 p-3 bg-gray-50 rounded text-sm text-gray-500">
                        Logged in as: <span className="font-semibold text-gray-700">{user.email}</span> ({user.role})
                    </div>
                )}

                <div className="flex flex-col space-y-3">
                    <button
                        onClick={handleGoHome}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Go to My Dashboard
                    </button>
                    <button
                        onClick={handleGoBack}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-red-600 hover:text-red-800 transition"
                    >
                        Logout and Switch Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
