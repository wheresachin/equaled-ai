import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AccessibilityControls from './AccessibilityControls';
import LiveCaption from './LiveCaption';
import { useAccessibility } from '../context/AccessibilityContext';
import { useEyeTracking } from '../hooks/useEyeTracking';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

const Layout = () => {
    const { highContrast, eyeTrackingEnabled } = useAccessibility();
    useEyeTracking(eyeTrackingEnabled);
    useVoiceCommands(); // Activate voice commands globally

    return (
        <div className={`flex min-h-screen transition-colors duration-300 ${
            highContrast ? 'bg-black' : 'bg-white'
        }`}>
            <Sidebar />
            
            <main className="flex-1 p-8 overflow-y-auto h-screen relative">
                <AccessibilityControls />
                <LiveCaption />
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
