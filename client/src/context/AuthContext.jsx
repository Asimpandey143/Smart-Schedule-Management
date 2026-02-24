import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            // Validate that the user object actually has valid data
            if (userInfo && userInfo.token && userInfo.role) {
                setUser(userInfo);
            } else {
                // If data is corrupt or empty, clear it
                localStorage.removeItem('userInfo');
                setUser(null);
            }
        } catch (error) {
            localStorage.removeItem('userInfo');
            setUser(null);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            console.log('Login Response Data:', JSON.stringify(data, null, 2)); // Debugging
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            console.error("Login Error:", error);
            const msg = error.response?.data?.message
                || (error.message === "Network Error" ? "Cannot connect to server (Is it running on port 5001?)" : error.message)
                || 'Login failed';
            return { success: false, message: msg };
        }
    };

    const register = async (name, email, password, role, department, year, section, studentClass) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password, role, department, year, section, studentClass });
            console.log('Register Response Data:', JSON.stringify(data, null, 2)); // Debugging
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            console.error("Registration Error:", error);
            const msg = error.response?.data?.message
                || (error.message === "Network Error" ? "Cannot connect to server (Is it running on port 5001?)" : error.message)
                || 'Registration failed';
            return { success: false, message: msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    const updateLocalUser = (updatedData) => {
        setUser(updatedData);
        localStorage.setItem('userInfo', JSON.stringify(updatedData));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateLocalUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
