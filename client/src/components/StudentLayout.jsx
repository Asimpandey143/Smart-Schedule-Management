import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import Chatbot from './Chatbot';

const StudentLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-[#0f172a] font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
                <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-[#0f172a] p-0 transition-colors duration-300 scroll-smooth">
                    <Outlet />
                </main>
                <Chatbot />
            </div>
        </div>
    );
};

export default StudentLayout;
