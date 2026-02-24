import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const FacultyLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f8f9fc] dark:bg-gray-900 transition-colors duration-200">
                <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f8f9fc] dark:bg-gray-900 p-0 transition-colors duration-200">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default FacultyLayout;
