import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AccessibilityProvider } from './context/AccessibilityContext';
import AuthProvider from './context/AuthContext';
import Layout from './components/Layout';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Lesson from './pages/Lesson';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ManageLessons from './pages/ManageLessons';
import CreateLesson from './pages/CreateLesson';
import CreateQuiz from './pages/CreateQuiz';
import StudentProgress from './pages/StudentProgress';
import SubmissionReview from './pages/SubmissionReview';
import ManageStudents from './pages/ManageStudents';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AccessibilityProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/manage-lessons" element={<ManageLessons />} />
            <Route path="/create-lesson" element={<CreateLesson />} />
            <Route path="/create-quiz" element={<CreateQuiz />} />
            <Route path="/student-progress" element={<StudentProgress />} />
            <Route path="/submission-review" element={<SubmissionReview />} />
            <Route path="/manage-students" element={<ManageStudents />} />
            
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/lesson/:id" element={<Lesson />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AccessibilityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
