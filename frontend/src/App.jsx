import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AccessibilityProvider } from './context/AccessibilityContext';
import Layout from './components/Layout';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';

function App() {
  return (
    <AccessibilityProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="lesson/:id" element={<Lesson />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AccessibilityProvider>
  );
}

export default App;
