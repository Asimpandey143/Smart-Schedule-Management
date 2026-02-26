import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';
export const API_BASE_URL = API_URL.replace(/\/api$/, '');

const api = axios.create({
    baseURL: API_URL,
});


// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.token) {
            config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
