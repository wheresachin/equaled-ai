import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Star, CheckCircle2, BookOpen, Trophy, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Mock lessons (shown when DB is empty) ─────────────────────────────────
const MOCK_LESSONS = [
  {
    _id: 'mock-1',
    title: 'Introduction to Biology',
    content: '',
    category: 'Science',
    difficulty: 'Beginner',
  },
  {
    _id: 'mock-2',
    title: 'World History: The Romans',
    content: '',
    category: 'History',
    difficulty: 'Intermediate',
  },
  {
    _id: 'mock-3',
    title: 'Physics: Laws of Motion',
    content: '',
    category: 'Science',
    difficulty: 'Advanced',
  },
  {
    _id: 'mock-4',
    title: 'Mathematics: Algebra Basics',
    content: '',
    category: 'Mathematics',
    difficulty: 'Beginner',
  },
];

// ── Mock progress (shown when DB has no records) ──────────────────────────
const MOCK_PROGRESS = {
  totalLessons: 4,
  completedLessons: 1,
  totalTimeSpent: 25,
  avgQuizScore: 78,
  progressPercent: 25,
  records: [
    { lessonId: { _id: 'mock-1' }, isCompleted: true, timeSpent: 15 },
    { lessonId: { _id: 'mock-2' }, isCompleted: false, timeSpent: 10 },
  ],
};

// ── Difficulty color map ──────────────────────────────────────────────────
const diffColor = {
  Beginner:     'bg-green-100 text-green-700',
  Intermediate: 'bg-orange-100 text-orange-700',
  Advanced:     'bg-purple-100 text-purple-700',
};

// ── Stat card ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className={`flex items-center gap-4 p-4 rounded-2xl border ${color} shadow-sm`}>
    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/60">
      <Icon size={22} />
    </div>
    <div>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
      {sub && <p className="text-[10px] opacity-60 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Progress bar ──────────────────────────────────────────────────────────
const ProgressBar = ({ percent }) => (
  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
      style={{ width: `${percent}%` }}
    />
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate    = useNavigate();
  const { user }    = useAuth();

  const [lessons, setLessons]   = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem('user'))?.token; }
    catch { return null; }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    try {
      const [lessonsRes, progressRes] = await Promise.all([
        fetch(`${API}/api/lessons`, { headers }),
        fetch(`${API}/api/progress/me`, { headers }),
      ]);

      const fetchedLessons = lessonsRes.ok ? await lessonsRes.json() : [];
      const fetchedProgress = progressRes.ok ? await progressRes.json() : null;

      // Use mock data as fallback if DB is empty
      setLessons(fetchedLessons.length > 0 ? fetchedLessons : MOCK_LESSONS);
      setProgress(fetchedProgress?.totalLessons > 0 ? fetchedProgress : MOCK_PROGRESS);
    } catch (err) {
      // Always show mock data on error so page isn't blank
      setLessons(MOCK_LESSONS);
      setProgress(MOCK_PROGRESS);
      setError('Showing demo data — could not reach server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build a map of lessonId → progress record for quick lookup
  const progressMap = {};
  progress?.records?.forEach(r => {
    if (r.lessonId?._id) progressMap[r.lessonId._id] = r;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={36} className="animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="space-y-6 pt-4">

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold high-contrast:text-yellow-400">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Continue your learning journey</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
          <button onClick={fetchData} className="ml-3 underline font-medium">Retry</button>
        </div>
      )}

      {/* ── Progress Stats ── */}
      {progress && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={BookOpen}
              label="Lessons Explored"
              value={`${progress.completedLessons}/${progress.totalLessons}`}
              color="bg-blue-50 border-blue-100 text-blue-700"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={`${progress.progressPercent}%`}
              sub="of total lessons"
              color="bg-green-50 border-green-100 text-green-700"
            />
            <StatCard
              icon={Clock}
              label="Time Spent"
              value={`${progress.totalTimeSpent}m`}
              sub="minutes learning"
              color="bg-orange-50 border-orange-100 text-orange-700"
            />
            <StatCard
              icon={Trophy}
              label="Avg Quiz Score"
              value={progress.avgQuizScore > 0 ? `${progress.avgQuizScore}%` : '—'}
              sub={progress.avgQuizScore > 0 ? 'across all quizzes' : 'No quizzes taken yet'}
              color="bg-purple-50 border-purple-100 text-purple-700"
            />
          </div>

          {/* Overall progress bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-500" />
                <span className="font-semibold text-gray-700">Overall Progress</span>
              </div>
              <span className="text-sm font-bold text-indigo-600">{progress.progressPercent}%</span>
            </div>
            <ProgressBar percent={progress.progressPercent} />
            <p className="text-xs text-gray-400 mt-2">
              {progress.completedLessons} of {progress.totalLessons} lessons completed
            </p>
          </div>
        </div>
      )}

      {/* ── Lessons ── */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 high-contrast:text-yellow-400">
          Your Learning Path
        </h2>

        {lessons.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>No lessons available yet.</p>
            <p className="text-xs mt-1">Ask your teacher to add lessons.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          {lessons.map((lesson) => {
            const prog = progressMap[lesson._id];
            const isCompleted = prog?.isCompleted;
            const timeSpent   = prog?.timeSpent || 0;

            return (
              <div
                key={lesson._id}
                onClick={() => navigate(`/lesson/${lesson._id}`)}
                className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden high-contrast:bg-gray-900 high-contrast:border-yellow-400"
              >
                {/* Difficulty badge */}
                <div className={`absolute top-0 right-0 p-2 px-3 rounded-bl-2xl text-xs font-bold uppercase tracking-wider
                  ${diffColor[lesson.difficulty] || 'bg-gray-100 text-gray-600'}
                  high-contrast:bg-yellow-400 high-contrast:text-black`}
                >
                  {lesson.difficulty}
                </div>

                {/* Completed badge */}
                {isCompleted && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    <CheckCircle2 size={10} /> Done
                  </div>
                )}

                <h2 className="text-xl font-bold mb-2 mt-3 group-hover:text-blue-600 transition-colors high-contrast:text-white">
                  {lesson.title}
                </h2>
                <p className="text-gray-500 text-sm mb-2 high-contrast:text-gray-300 capitalize">
                  {lesson.category}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-5">
                  {timeSpent > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {timeSpent}m spent
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star size={14} /> {lesson.difficulty}
                  </span>
                </div>

                {/* Progress mini-bar */}
                {prog && (
                  <div className="mb-4">
                    <ProgressBar percent={isCompleted ? 100 : 50} />
                    <p className="text-[10px] text-gray-400 mt-1">
                      {isCompleted ? 'Lesson completed ✓' : 'In progress'}
                    </p>
                  </div>
                )}

                <button className="w-full py-3 bg-gray-50 rounded-xl text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center gap-2 high-contrast:bg-gray-800 high-contrast:text-yellow-400 high-contrast:group-hover:bg-yellow-400 high-contrast:group-hover:text-black">
                  {isCompleted ? 'Review Lesson' : prog ? 'Continue' : 'Start Lesson'}
                  <Play size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
