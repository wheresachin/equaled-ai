import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AccessibilityProvider } from './context/AccessibilityContext';
import AuthProvider from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import VoiceAssistant from './components/VoiceAssistant'; // Add import
import Layout from './components/Layout';
import { useAccessibility } from './context/AccessibilityContext';
import { useEyeTracking } from './hooks/useEyeTracking';
import { useHandTracking } from './hooks/useHandTracking';

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
import TalkToAI from './pages/TalkToAI';
import Home from './pages/Home';
import ForgotPassword from './pages/ForgotPassword';

// Eye tracking activator — student only
const EyeTrackingActivator = () => {
  const { eyeTrackingEnabled, toggleEyeTracking, setEyeTrackingStatus } = useAccessibility();
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const { status } = useEyeTracking(eyeTrackingEnabled && isStudent);

  React.useEffect(() => {
    setEyeTrackingStatus(isStudent ? status : 'idle');
  }, [status, setEyeTrackingStatus, isStudent]);

  // Close button in the camera preview dispatches this event
  React.useEffect(() => {
    const handler = () => {
      if (eyeTrackingEnabled) toggleEyeTracking();
    };
    window.addEventListener('equaled:eye-close', handler);
    return () => window.removeEventListener('equaled:eye-close', handler);
  }, [eyeTrackingEnabled, toggleEyeTracking]);

  return null;
};

// Hand tracking activator — student only
const HandTrackingActivator = () => {
  const { handTrackingEnabled, toggleHandTracking, setHandTrackingStatus } = useAccessibility();
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const { status } = useHandTracking(handTrackingEnabled && isStudent);

  React.useEffect(() => {
    setHandTrackingStatus(isStudent ? status : 'idle');
  }, [status, setHandTrackingStatus, isStudent]);

  // Close button in the camera preview dispatches this event
  React.useEffect(() => {
    const handler = () => {
      if (handTrackingEnabled) toggleHandTracking();
    };
    window.addEventListener('equaled:hand-close', handler);
    return () => window.removeEventListener('equaled:hand-close', handler);
  }, [handTrackingEnabled, toggleHandTracking]);

  return null;
};

// Voice Assistant Activator — student only OR unauthenticated (for login command)
const VoiceAssistantActivator = () => {
  const { user } = useAuth();
  if (user && user.role !== 'student') return null;
  return <VoiceAssistant />;
};


function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AccessibilityProvider>
            {/* Global activators — student only */}
            <EyeTrackingActivator />
            <HandTrackingActivator />
            <VoiceAssistantActivator />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/manage-lessons" element={<ManageLessons />} />
            <Route path="/create-lesson" element={<CreateLesson />} />
            <Route path="/create-quiz" element={<CreateQuiz />} />
            <Route path="/student-progress" element={<StudentProgress />} />
            <Route path="/submission-review" element={<SubmissionReview />} />
            <Route path="/manage-students" element={<ManageStudents />} />
            
            <Route element={<Layout />}>
              <Route path="/home"       element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/lesson/:id" element={<Lesson />} />
              <Route path="/talk-to-ai" element={<TalkToAI />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AccessibilityProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
