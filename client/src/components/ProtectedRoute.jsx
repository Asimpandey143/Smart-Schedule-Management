import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || !user.role) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.log('Access Denied. Redirecting to Unauthorized.');
        return <Navigate to="/unauthorized" replace />; // Or redirect to their specific dashboard
    }

    return <Outlet />;
};

export default ProtectedRoute;
