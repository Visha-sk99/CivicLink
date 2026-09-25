import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Login from './pages/Login';
import Register from './pages/Register';
import CitizenFeed from './pages/CitizenFeed';
import IssueDetail from './pages/IssueDetail';
import AuthorityDashboard from './pages/AuthorityDashboard';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile'; // ✅ ADDED

import ProtectedRoute from './components/common/ProtectedRoute';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/" />}
      />

      {/* Main Feed */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'authority', 'admin']}>
            <CitizenFeed />
          </ProtectedRoute>
        }
      />

      {/* Issue Detail */}
      <Route
        path="/issue/:id"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'authority', 'admin']}>
            <IssueDetail />
          </ProtectedRoute>
        }
      />

      {/* Authority Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['authority', 'admin']}>
            <AuthorityDashboard />
          </ProtectedRoute>
        }
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'authority', 'admin']}>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Analytics */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'authority', 'admin']}>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* Leaderboard */}
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'authority', 'admin']}>
            <Leaderboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}