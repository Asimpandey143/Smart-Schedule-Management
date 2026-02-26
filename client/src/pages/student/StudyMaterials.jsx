import { useState, useEffect } from 'react';
import { FaDownload, FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileAlt } from 'react-icons/fa';
import api, { API_BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StudyMaterials = () => {
    const { user } = useAuth();
    const [filter, setFilter] = useState('All');
    const [materials, setMaterials] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            // Parallel fetch for materials and courses
            const [materialsRes, coursesRes] = await Promise.all([
                api.get('/materials', config),
                api.get('/courses', config)
            ]);

            setMaterials(materialsRes.data);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    // Use fetched courses for the dropdown
    const subjects = ['All', ...courses.map(c => c.courseName)];

    const filteredMaterials = filter === 'All'
        ? materials
        : materials.filter(m => (m.course?.courseName || 'Unknown Subject') === filter);

    const getIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'pdf': return <FaFilePdf className="text-rose-500" />;
            case 'doc':
            case 'docx': return <FaFileWord className="text-blue-500" />;
            case 'ppt':
            case 'pptx': return <FaFilePowerpoint className="text-orange-500" />;
            default: return <FaFileAlt className="text-slate-500" />;
        }
    };

    const handleDownload = (filePath, originalName) => {
        // Construct the full URL
        const url = `${API_BASE_URL}${filePath}`;

        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', originalName);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 md:p-10 bg-slate-50 dark:bg-[#0f172a] min-h-screen text-left transition-colors duration-300 font-sans">
            <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-4">
                        Study Materials
                        <span className="p-2 bg-indigo-600 rounded-xl text-white text-2xl shadow-lg shadow-indigo-200 dark:shadow-none rotate-3">
                            <FaFilePdf />
                        </span>
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 ml-1">
                        Access learning resources & documents
                    </p>
                </div>

                <div className="mt-6 md:mt-0">
                    <div className="relative group">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none px-6 py-3 pr-12 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 cursor-pointer shadow-sm hover:border-slate-300 transition-all min-w-[200px]"
                        >
                            {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800/80 p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 backdrop-blur-sm">
                {loading ? (
                    <div className="text-center py-20 text-slate-400 animate-pulse font-bold tracking-widest uppercase text-xs">Loading materials...</div>
                ) : (
                    <div className="space-y-4">
                        {filteredMaterials.map((item) => (
                            <div key={item._id} className="group flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-lg hover:bg-white dark:hover:bg-slate-700/80 transition-all duration-300">
                                <div className="flex items-center gap-6 mb-4 md:mb-0 w-full md:w-auto">
                                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-3xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                        {getIcon(item.fileType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate pr-4">{item.title}</h3>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-[9px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">
                                                {item.course?.courseName || 'General'}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{item.size} • Uploaded by {item.faculty?.name || 'Faculty'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDownload(item.filePath, item.originalName)}
                                    className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all duration-300 shadow-sm hover:shadow-indigo-200 dark:hover:shadow-none gap-2 group/btn shrink-0"
                                >
                                    <span className="group-hover/btn:-translate-y-0.5 transition-transform"><FaDownload /></span>
                                    <span>Download</span>
                                </button>
                            </div>
                        ))}
                        {filteredMaterials.length === 0 && (
                            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[3rem] bg-slate-50/50 dark:bg-slate-800/30">
                                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No materials found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyMaterials;
