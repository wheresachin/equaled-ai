import React, { useState, useEffect } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import Sidebar from '../components/Sidebar';
import { Search, Filter, ArrowRight } from 'lucide-react';
import API_BASE from '../utils/api';

const StudentProgress = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const res = await fetch(`${API_BASE}/api/progress`, {
          headers: { Authorization: `Bearer ${storedUser?.token}` },
        });
        const data = await res.json();
        if (res.ok) setStudents(data);
        else setError(data.message || 'Failed to load student progress');
      } catch (err) {
        setError('Could not connect to server');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex bg-gray-50 min-h-screen high-contrast:bg-black">
      <div className="fixed h-full z-10">
        <Sidebar />
      </div>
      
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <DashboardNavbar />
        <main className="flex-1 pt-24 px-8 pb-8 overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 high-contrast:text-yellow-400">Student Progress</h1>
                <p className="text-gray-500 high-contrast:text-gray-300">Monitor engagement and performance.</p>
            </header>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 high-contrast:bg-gray-900 high-contrast:border-gray-800 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search student..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 high-contrast:bg-black high-contrast:border-gray-700 high-contrast:text-white"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 high-contrast:border-gray-700 high-contrast:text-white high-contrast:hover:bg-gray-800">
                    <Filter size={20} /> Filter
                </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 high-contrast:border-yellow-400"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 high-contrast:bg-gray-900 high-contrast:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 high-contrast:text-white">No students found</h3>
                <p className="text-gray-500 mt-2 high-contrast:text-gray-400">
                  {searchQuery ? 'Try a different search term.' : 'No student progress data available yet.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden high-contrast:bg-gray-900 high-contrast:border-gray-800">
                  <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-100 high-contrast:bg-gray-800 high-contrast:border-gray-700">
                          <tr>
                              <th className="text-left py-4 px-6 text-gray-500 font-medium high-contrast:text-gray-300">Name</th>
                              <th className="text-left py-4 px-6 text-gray-500 font-medium high-contrast:text-gray-300">Lessons Completed</th>
                              <th className="text-left py-4 px-6 text-gray-500 font-medium high-contrast:text-gray-300">Avg. Score</th>
                              <th className="text-left py-4 px-6 text-gray-500 font-medium high-contrast:text-gray-300">Last Active</th>
                              <th className="text-right py-4 px-6 text-gray-500 font-medium high-contrast:text-gray-300">Details</th>
                          </tr>
                      </thead>
                      <tbody>
                          {filtered.map((student) => (
                              <tr key={student._id || student.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-none high-contrast:border-gray-800 high-contrast:hover:bg-gray-800">
                                  <td className="py-4 px-6">
                                      <div>
                                          <p className="font-bold text-gray-900 high-contrast:text-white">{student.name || student.student?.name}</p>
                                          <p className="text-xs text-gray-500 high-contrast:text-gray-400">{student.email || student.student?.email}</p>
                                      </div>
                                  </td>
                                  <td className="py-4 px-6 text-gray-700 high-contrast:text-gray-300">{student.lessonsCompleted ?? student.completedLessons ?? '—'}</td>
                                  <td className="py-4 px-6">
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                          (student.avgScore ?? 0) >= 90 ? 'bg-green-50 text-green-600' : 
                                          (student.avgScore ?? 0) >= 80 ? 'bg-blue-50 text-blue-600' :
                                          'bg-yellow-50 text-yellow-600'
                                      } high-contrast:bg-gray-700 high-contrast:text-yellow-400`}>
                                          {student.avgScore != null ? `${student.avgScore}%` : '—'}
                                      </span>
                                  </td>
                                  <td className="py-4 px-6 text-gray-500 high-contrast:text-gray-400">
                                    {student.updatedAt ? new Date(student.updatedAt).toLocaleDateString() : '—'}
                                  </td>
                                  <td className="py-4 px-6 text-right">
                                      <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors high-contrast:text-yellow-400 high-contrast:hover:bg-gray-700">
                                          <ArrowRight size={20} />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default StudentProgress;
