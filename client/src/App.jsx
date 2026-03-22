import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import { PostProvider } from './context/PostContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import CreatePostModal from './components/CreatePostModal';
import { SearchProvider } from './context/SearchContext';
import SearchResults from './pages/SearchResults';
import Notifications from './pages/Notifications';
import Community from './pages/Community';
import Favorites from './pages/Favorites';
import Saved from './pages/Saved';
import Events from './pages/Events';
import LiveStream from './pages/LiveStream';
import Resources from './pages/Resources';

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
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

              <Route path="/search" element={
                <ProtectedRoute>
                  <SearchResults />
                </ProtectedRoute>
              } />

              {/* Functional routes */}
              <Route path="/network" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/live" element={<ProtectedRoute><LiveStream /></ProtectedRoute>} />
              <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
              <Route path="/connections" element={<Navigate to="/community" replace />} />
              <Route path="/profile/:id" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={<Navigate to="/feed" replace />} />

            </Routes>
            <CreatePostModal />
          </Router>
        </PostProvider>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;