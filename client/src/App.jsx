
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import ProfileDemo from './pages/ProfileDemo';
import { PostProvider } from './context/PostContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import CreatePostModal from './components/CreatePostModal';

function App() {
  return (
    <AuthProvider>
      <PostProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/feed" element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/feed" replace />} />

            {/* Placeholder routes for others using Feed for now until created */}
            <Route path="/network" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/profile/:id" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Profile Demo Page - No Authentication Required */}
            <Route path="/profile-demo" element={<ProfileDemo />} />

            <Route path="/profile" element={<Navigate to="/feed" replace />} />

          </Routes>
          <CreatePostModal />
        </Router>
      </PostProvider>
    </AuthProvider>
  );
}

export default App;
