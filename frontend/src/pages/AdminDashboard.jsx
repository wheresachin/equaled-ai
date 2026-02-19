import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, X, Shield, User, Check, AlertCircle, Loader2, Filter, BookOpen, Calendar, ClipboardList, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API_BASE from '../utils/api';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  
  // View states
  const [activeView, setActiveView] = useState('users'); // 'users' or 'tasks'
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, teacher, student / active, completed
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    disabilityType: 'none'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        showToast(data.message || "Failed to fetch users", "error");
      }
    } catch (error) {
      showToast("Server error occurred", "error");
    } finally {
      setLoading(false);
    }
  }, [currentUser, showToast]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/tasks`, {
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(data);
      } else {
        showToast(data.message || "Failed to fetch tasks", "error");
      }
    } catch (error) {
      showToast("Server error occurred", "error");
    } finally {
      setLoading(false);
    }
  }, [currentUser, showToast]);

  useEffect(() => {
    if (activeView === 'users') {
      fetchUsers();
    } else {
      fetchTasks();
    }
    setFilter('all');
    setSearchQuery('');
  }, [activeView, fetchUsers, fetchTasks]);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Don't show password
        role: user.role,
        disabilityType: user.disabilityType || 'none'
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        disabilityType: 'none'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingUser 
        ? `${API_BASE}/api/admin/users/${editingUser._id}` 
        : `${API_BASE}/api/admin/users`;
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`User ${editingUser ? 'updated' : 'created'} successfully`, "success");
        handleCloseModal();
        fetchUsers();
      } else {
        showToast(data.message || "Operation failed", "error");
      }
    } catch (error) {
      showToast("Server error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`
        }
      });

      if (res.ok) {
        showToast("User deleted successfully", "success");
        fetchUsers();
      } else {
        const data = await res.json();
        showToast(data.message || "Delete failed", "error");
      }
    } catch (error) {
      showToast("Server error", "error");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'all' || u.role === filter;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredTasks = tasks.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (t.teacher?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderUserTable = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden high-contrast:bg-gray-900 high-contrast:border-yellow-400">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 high-contrast:bg-gray-800 high-contrast:border-gray-700">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">User Details</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 high-contrast:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-gray-500 font-medium">Loading users...</p>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="text-gray-300" size={48} />
                    <p className="text-gray-500 font-medium">No users found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors high-contrast:hover:bg-black group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        u.role === 'teacher' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                      } high-contrast:bg-gray-800 high-contrast:text-white`}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 high-contrast:text-white">{u.name}</p>
                        <p className="text-xs text-gray-500 high-contrast:text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        u.role === 'teacher'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-green-100 text-green-700'
                      } high-contrast:border high-contrast:border-yellow-400 high-contrast:text-yellow-400 high-contrast:bg-transparent`}>
                        {u.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center text-sm text-gray-500 high-contrast:text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(u)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all high-contrast:text-yellow-400"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all high-contrast:text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTaskTable = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden high-contrast:bg-gray-900 high-contrast:border-yellow-400">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 high-contrast:bg-gray-800 high-contrast:border-gray-700">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Task / Lesson</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Assigned By</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Students</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 high-contrast:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-gray-500 font-medium">Loading tasks...</p>
                  </div>
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <ClipboardList className="text-gray-300" size={48} />
                    <p className="text-gray-500 font-medium">No tasks found on the platform.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTasks.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50 transition-colors high-contrast:hover:bg-black group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center high-contrast:bg-gray-800 high-contrast:text-white">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 high-contrast:text-white">{t.title}</p>
                        <p className="text-xs text-gray-500 high-contrast:text-gray-400">{t.lesson?.title || 'Unknown Lesson'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-700 high-contrast:text-white">{t.teacher?.name || 'N/A'}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-black">{t.teacher?.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-gray-900 high-contrast:text-white">{t.students?.length || 0}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Assigned</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        t.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      } high-contrast:border high-contrast:border-yellow-400 high-contrast:text-yellow-400 high-contrast:bg-transparent`}>
                        {t.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right text-sm text-gray-500 high-contrast:text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 high-contrast:bg-black font-inter">
      <Navbar />
      
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 high-contrast:text-yellow-400">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1 high-contrast:text-gray-400">
                {activeView === 'users' ? 'Manage all teachers and students in the system.' : 'Monitor all tasks assigned by teachers.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm flex high-contrast:bg-gray-900 high-contrast:border-gray-800">
                <button 
                    onClick={() => setActiveView('users')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'users' ? 'bg-blue-600 text-white high-contrast:bg-yellow-400 high-contrast:text-black' : 'text-gray-500 hover:bg-gray-50 high-contrast:text-white high-contrast:hover:bg-gray-800'}`}
                >
                    Users
                </button>
                <button 
                    onClick={() => setActiveView('tasks')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'tasks' ? 'bg-blue-600 text-white high-contrast:bg-yellow-400 high-contrast:text-black' : 'text-gray-500 hover:bg-gray-50 high-contrast:text-white high-contrast:hover:bg-gray-800'}`}
                >
                    Tasks
                </button>
            </div>
            {activeView === 'users' && (
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 high-contrast:bg-yellow-400 high-contrast:text-black high-contrast:shadow-none"
                >
                    <UserPlus size={20} />
                    <span className="hidden sm:inline">Add User</span>
                </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { label: activeView === 'users' ? 'Total Users' : 'Total Tasks', count: activeView === 'users' ? users.length : tasks.length, icon: activeView === 'users' ? Users : ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: activeView === 'users' ? 'Teachers' : 'Active Tasks', count: activeView === 'users' ? users.filter(u => u.role === 'teacher').length : tasks.filter(t => t.status !== 'completed').length, icon: activeView === 'users' ? Shield : Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: activeView === 'users' ? 'Students' : 'Completed', count: activeView === 'users' ? users.filter(u => u.role === 'student').length : tasks.filter(t => t.status === 'completed').length, icon: activeView === 'users' ? User : Check, color: 'text-green-600', bg: 'bg-green-50' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 high-contrast:bg-gray-900 high-contrast:border-yellow-400">
              <div className={`${stat.bg} p-4 rounded-2xl high-contrast:bg-gray-800`}>
                <stat.icon size={28} className={stat.color} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium high-contrast:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 high-contrast:text-white">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Row */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-6 high-contrast:bg-gray-900 high-contrast:border-gray-800">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder={`Search ${activeView}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all high-contrast:bg-black high-contrast:border-gray-700 high-contrast:text-white"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {activeView === 'users' ? (
                ['all', 'teacher', 'student'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-3 rounded-2xl text-sm font-bold capitalize transition-all whitespace-nowrap ${
                        filter === f 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-100 high-contrast:bg-yellow-400 high-contrast:text-black' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 high-contrast:bg-gray-800 high-contrast:text-white'
                        }`}
                    >
                        {f}s
                    </button>
                ))
            ) : (
                ['all', 'assigned', 'completed'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-3 rounded-2xl text-sm font-bold capitalize transition-all whitespace-nowrap ${
                        filter === f 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-100 high-contrast:bg-yellow-400 high-contrast:text-black' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 high-contrast:bg-gray-800 high-contrast:text-white'
                        }`}
                    >
                        {f}
                    </button>
                ))
            )}
          </div>
        </div>

        {/* Content Section */}
        {activeView === 'users' ? renderUserTable() : renderTaskTable()}
      </main>

      {/* Add/Edit Modal (Users only) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 high-contrast:bg-gray-900 high-contrast:border-2 high-contrast:border-yellow-400">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center high-contrast:border-gray-800">
              <h2 className="text-xl font-black text-gray-900 high-contrast:text-white">
                {editingUser ? 'Edit User Details' : 'Register New User'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors high-contrast:text-yellow-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all high-contrast:bg-black high-contrast:border-gray-700 high-contrast:text-white"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all high-contrast:bg-black high-contrast:border-gray-700 high-contrast:text-white"
                  placeholder="john@example.com"
                />
              </div>
              
              {!editingUser && (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Initial Password</label>
                  <input 
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all high-contrast:bg-black high-contrast:border-gray-700 high-contrast:text-white"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all high-contrast:bg-black high-contrast:border-gray-700 high-contrast:text-white"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Disability (if any)</label>
                  <select 
                    value={formData.disabilityType}
                    onChange={(e) => setFormData({...formData, disabilityType: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all high-contrast:bg-black high-contrast:border-gray-700 high-contrast:text-white"
                  >
                    <option value="none">None</option>
                    <option value="visual">Visual</option>
                    <option value="hearing">Hearing</option>
                    <option value="motor">Motor</option>
                    <option value="cognitive">Cognitive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-black text-white font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 high-contrast:bg-yellow-400 high-contrast:text-black"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                  {editingUser ? 'Save Updates' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
