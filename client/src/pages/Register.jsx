import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        department: '',
        year: '',
        section: '',
        studentClass: 'B.Tech',
    });
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newFormData = { ...formData, [name]: value };

        // Logic for automatic room assignment
        if (name === 'year' || name === 'department' || name === 'role') {
            const currentDept = name === 'department' ? value : formData.department;
            const currentYear = name === 'year' ? value : formData.year;

            let autoSection = '';
            if (currentDept === 'AIDS') {
                if (currentYear === '1') autoSection = '101';
                else if (currentYear === '2') autoSection = '102';
            } else if (currentDept === 'CSE') {
                if (currentYear === '1') autoSection = '103';
                else if (currentYear === '2') autoSection = '104';
            }
            newFormData.section = autoSection;
        }

        setFormData(newFormData);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await register(
            formData.name,
            formData.email,
            formData.password,
            formData.role,
            formData.department,
            formData.year,
            formData.section,
            formData.studentClass
        );
        if (res.success) {
            const role = formData.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'faculty') navigate('/faculty');
            else if (role === 'student') navigate('/student');
            else navigate('/dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">Create an Account</h2>
                {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded">{error}</div>}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    {formData.role !== 'admin' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Department</option>
                                <option value="AIDS">AIDS</option>
                                <option value="CSE">CSE</option>
                            </select>
                        </div>
                    )}
                    {formData.role === 'student' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Year</label>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Class</label>
                                <input
                                    type="text"
                                    name="section"
                                    value={formData.section}
                                    readOnly
                                    placeholder="Auto-populated"
                                    className="w-full px-3 py-2 mt-1 border rounded-md bg-gray-50 text-gray-500 font-bold"
                                    required
                                />
                            </div>
                        </>
                    )}
                    <button
                        type="submit"
                        className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Register
                    </button>
                </form>
                <div className="text-sm text-center text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
