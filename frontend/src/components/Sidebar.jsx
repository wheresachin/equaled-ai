import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, BookOpen, Settings, LogOut, User, Users, CheckCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = user?.role === 'teacher' ? [
    { to: "/teacher-dashboard",  icon: <LayoutDashboard size={24} />, label: "Dashboard" },
    { to: "/manage-lessons",     icon: <BookOpen size={24} />,       label: "Manage Lessons" },
    { to: "/manage-students",    icon: <UserPlus size={24} />,       label: "My Students" },
    { to: "/student-progress",   icon: <Users size={24} />,          label: "Student Progress" },
    { to: "/submission-review",  icon: <CheckCircle size={24} />,    label: "Review Work" },
  ] : [
    { to: "/dashboard", icon: <Home size={24} />, label: "Home" },
    { to: "/dashboard", icon: <LayoutDashboard size={24} />, label: "Dashboard" },
    { to: "/lesson/1", icon: <BookOpen size={24} />, label: "Lesson" }, // Placeholder for student
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col p-4 high-contrast:bg-black high-contrast:border-yellow-400">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-blue-600 high-contrast:text-yellow-400">EqualEd</h1>
        {user && (
           <div className="mt-4 p-3 bg-white rounded-xl border border-gray-100 flex items-center gap-3 high-contrast:bg-gray-900 high-contrast:border-gray-700">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600 high-contrast:bg-yellow-900 high-contrast:text-yellow-400">
                 <User size={20} />
              </div>
              <div className="overflow-hidden">
                 <p className="font-bold text-sm truncate high-contrast:text-white">{user.name}</p>
                 <p className="text-xs text-gray-500 capitalize high-contrast:text-gray-400">{user.role}</p>
              </div>
           </div>
        )}
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-semibold high-contrast:bg-yellow-900 high-contrast:text-yellow-300"
                  : "text-gray-600 hover:bg-gray-100 high-contrast:text-white high-contrast:hover:bg-gray-800"
              }`
            }
          >
            {item.icon}
            <span className="text-lg">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto space-y-4">
        <div className="p-4 bg-blue-50 rounded-xl high-contrast:bg-gray-900 border high-contrast:border-yellow-400">
          <p className="text-sm text-blue-800 font-medium high-contrast:text-yellow-400">
            Voice Commands Active
          </p>
          <p className="text-xs text-blue-600 mt-1 high-contrast:text-white">
            Try saying "Home" or "Dashboard"
          </p>
        </div>
        
        {user && (
            <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium high-contrast:text-red-400 high-contrast:hover:bg-gray-900"
            >
                <LogOut size={24} />
                Logout
            </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
