import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AccessibilityControls from './AccessibilityControls';
import LiveCaption from './LiveCaption';
import { useAccessibility } from '../context/AccessibilityContext';
const Layout = () => {
    const { highContrast } = useAccessibility();
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    return (
        <div className={`flex min-h-screen transition-colors duration-300 ${
            highContrast ? 'bg-black' : 'bg-white'
        }`}>
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            
            <main className={`flex-1 p-8 overflow-y-auto h-screen relative transition-all duration-300 ${
                isCollapsed ? 'md:ml-20' : 'md:ml-64'
            }`}>
                <AccessibilityControls />
                <LiveCaption />
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
