import { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaFilePdf, FaFilePowerpoint, FaUpload, FaCheckCircle, FaTrashAlt, FaBook, FaFileAlt, FaEye, FaExternalLinkAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api, { API_BASE_URL } from '../../services/api';

const UploadMaterials = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('view'); // 'upload' or 'view'
    const [courses, setCourses] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [title, setTitle] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [fileType, setFileType] = useState('pdf');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get('/courses', config);
                setCourses(data);
            } catch (err) {
                console.error('Error fetching courses:', err);
            }
        };

        const fetchMaterials = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get('/materials', config);
                setMaterials(data);
            } catch (err) {
                console.error('Error fetching materials:', err);
            }
        };

        if (user) {
            fetchCourses();
            fetchMaterials();
        }
    }, [user]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        setIsUploading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('courseId', selectedCourse);
        formData.append('description', description);
        formData.append('fileType', fileType);
        formData.append('file', file);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            await api.post('/materials', formData, config);

            setSuccess(`Material "${title}" has been published to candidates!`);
            setTitle('');
            setSelectedCourse('');
            setDescription('');
            setFile(null);

            // Refresh list
            const { data } = await api.get('/materials', { headers: { Authorization: `Bearer ${user.token}` } });
            setMaterials(data);

            // Switch to view tab
            setTimeout(() => setActiveTab('view'), 1500);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading material');
            console.error('Upload error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/materials/${id}`, config);
            setMaterials(materials.filter(m => m._id !== id));
        } catch (err) {
            console.error('Error deleting material:', err);
            setError('Failed to delete material');
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="p-4 md:p-10 bg-[#f8f9fc] dark:bg-gray-900 min-h-screen text-left transition-colors duration-200">
            <div className="mb-6 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter uppercase">Academic Repository</h1>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">Distribute & Manage learning resources</p>
                </div>

                {/* Tabs for Mobile/Desktop */}
                <div className="mt-4 md:mt-0 flex space-x-2 bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('view')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'view' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-blue-500'}`}
                    >
                        Repository
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'upload' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-blue-500'}`}
                    >
                        Upload New
                    </button>
                </div>
            </div>

            {success && (
                <div className="mb-8 p-6 bg-emerald-500 text-white rounded-[2rem] shadow-xl shadow-emerald-500/20 flex items-center animate-in fade-in zoom-in font-bold text-sm md:text-base">
                    <FaCheckCircle className="text-2xl mr-4" /> {success}
                </div>
            )}

            {error && (
                <div className="mb-8 p-6 bg-rose-500 text-white rounded-[2rem] shadow-xl shadow-rose-500/20 flex items-center animate-in fade-in zoom-in font-bold text-sm md:text-base">
                    <FaCloudUploadAlt className="text-2xl mr-4" /> {error}
                </div>
            )}

            {/* TAB CONTENT: UPLOAD */}
            {activeTab === 'upload' && (
                <div className="duration-300">
                    <div className="bg-white dark:bg-gray-800 p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] shadow-sm border border-gray-100 dark:border-gray-700 max-w-4xl mx-auto">
                        <div className="flex items-center space-x-4 mb-10">
                            <div className="p-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                                <FaCloudUploadAlt size={28} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Upload Material</h2>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Content Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold"
                                        placeholder="e.g. Advanced AI - Unit 1"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Target Course</label>
                                    <select
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold appearance-none"
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        required
                                    >
                                        <option value="">Select a Course</option>
                                        {courses.map(c => (
                                            <option key={c._id} value={c._id}>
                                                {c.courseName} ({c.courseCode}) - Year: {c.semester}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Format</label>
                                <div className="flex flex-wrap gap-4">
                                    <label className={`flex flex-1 items-center justify-center space-x-3 p-6 rounded-3xl cursor-pointer transition-all border-2 ${fileType === 'pdf' ? 'border-blue-500 bg-blue-500/5 text-blue-600' : 'border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 text-gray-400'}`}>
                                        <input type="radio" className="hidden" value="pdf" checked={fileType === 'pdf'} onChange={() => setFileType('pdf')} />
                                        <FaFilePdf size={24} />
                                        <span className="font-black uppercase tracking-widest text-[10px]">Document-PDF</span>
                                    </label>
                                    <label className={`flex flex-1 items-center justify-center space-x-3 p-6 rounded-3xl cursor-pointer transition-all border-2 ${fileType === 'ppt' ? 'border-amber-500 bg-amber-500/5 text-amber-600' : 'border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 text-gray-400'}`}>
                                        <input type="radio" className="hidden" value="ppt" checked={fileType === 'ppt'} onChange={() => setFileType('ppt')} />
                                        <FaFilePowerpoint size={24} />
                                        <span className="font-black uppercase tracking-widest text-[10px]">Presentation-PPT</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Attachment</label>
                                <div className={`w-full py-12 bg-gray-50 dark:bg-gray-700/30 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all cursor-pointer group ${file ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-500/5'}`}>
                                    <label className="cursor-pointer flex flex-col items-center w-full h-full">
                                        {file ? (
                                            <>
                                                <FaCheckCircle size={32} className="mb-4 text-emerald-500" />
                                                <p className="font-bold text-sm text-emerald-600">{file.name}</p>
                                                <p className="text-[10px] font-black opacity-60 mt-1 uppercase tracking-tighter text-emerald-400">{(file.size / 1024 / 1024).toFixed(2)} MB Selected</p>
                                            </>
                                        ) : (
                                            <>
                                                <FaUpload size={32} className="mb-4 opacity-50 group-hover:opacity-100 group-hover:text-blue-500 transition-all text-gray-400" />
                                                <p className="font-bold text-sm text-gray-400">Select files or drag here</p>
                                                <p className="text-[10px] font-black opacity-60 mt-1 uppercase tracking-tighter text-gray-400">Supports PDF, PPTX (MAX 25MB)</p>
                                            </>
                                        )}
                                        <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.ppt,.pptx,.doc,.docx" />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Instructions (Optional)</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold"
                                    rows="4"
                                    placeholder="State any prerequisites or context for this material..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isUploading}
                                className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 text-xs"
                            >
                                {isUploading ? 'Encrypting & Syncing...' : 'Publish to Repository'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: VIEW REPOSITORY */}
            {activeTab === 'view' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 duration-300">
                    {materials.length === 0 ? (
                        <div className="col-span-full p-20 text-center bg-white dark:bg-gray-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                <FaBook size={40} />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">Repository Empty</h3>
                            <p className="text-gray-400 max-w-xs mx-auto mb-6">You haven't uploaded any study materials yet.</p>
                            <button onClick={() => setActiveTab('upload')} className="text-blue-600 font-bold hover:underline">Upload First Material</button>
                        </div>
                    ) : (
                        materials.map((file) => (
                            <div key={file._id} className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${file.fileType === 'pdf' ? 'bg-rose-500 shadow-rose-500/30' :
                                        file.fileType === 'ppt' ? 'bg-amber-500 shadow-amber-500/30' :
                                            'bg-blue-500 shadow-blue-500/30'
                                        }`}>
                                        {file.fileType === 'pdf' ? <FaFilePdf size={24} /> : (file.fileType === 'ppt' ? <FaFilePowerpoint size={24} /> : <FaFileAlt size={24} />)}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(file._id)}
                                        className="text-gray-300 hover:text-rose-500 p-2 transition-colors"
                                        title="Delete Material"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </div>

                                <div className="mb-4 flex-grow">
                                    <h3 className="text-lg font-black text-gray-800 dark:text-white leading-tight mb-2 line-clamp-2" title={file.title}>{file.title}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{file.course?.courseName} • Year {file.course?.semester}</p>
                                    <p className="text-[10px] text-gray-400">{file.size} • {formatTime(file.createdAt)}</p>
                                </div>

                                {file.description && (
                                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl text-xs text-gray-500 dark:text-gray-400 italic line-clamp-3">
                                        "{file.description}"
                                    </div>
                                )}

                                <a
                                    href={`${API_BASE_URL}${file.filePath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-auto w-full py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/30 transition-all group"
                                >
                                    Open Resource <FaExternalLinkAlt className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default UploadMaterials;
