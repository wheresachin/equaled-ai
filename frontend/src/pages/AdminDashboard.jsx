import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 high-contrast:bg-black">
      <Navbar />
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 high-contrast:text-yellow-400">Admin Dashboard</h1>
        <div className="bg-white p-6 rounded-2xl shadow-sm high-contrast:bg-gray-900 high-contrast:border high-contrast:border-yellow-400">
           <p className="text-gray-600 high-contrast:text-white">Welcome, Admin! Manage users and system settings here.</p>
           {/* Add admin specific controls here */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
