import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, BookOpen, Settings } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: "/", icon: <Home size={24} />, label: "Home" },
    { to: "/dashboard", icon: <LayoutDashboard size={24} />, label: "Dashboard" },
    { to: "/lesson/1", icon: <BookOpen size={24} />, label: "Lesson" },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col p-4 high-contrast:bg-black high-contrast:border-yellow-400">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-blue-600 high-contrast:text-yellow-400">EqualEd</h1>
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
      <div className="p-4 bg-blue-50 rounded-xl mt-auto high-contrast:bg-gray-900 border high-contrast:border-yellow-400">
        <p className="text-sm text-blue-800 font-medium high-contrast:text-yellow-400">
          Voice Commands Active
        </p>
        <p className="text-xs text-blue-600 mt-1 high-contrast:text-white">
          Try saying "Home" or "Dashboard"
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
