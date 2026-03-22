import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login             from './pages/Login';
import Register          from './pages/Register';
import CitizenFeed       from './pages/CitizenFeed';
import IssueDetail       from './pages/IssueDetail';
import AuthorityDashboard from './pages/AuthorityDashboard';
import Analytics         from './pages/Analytics';
import Leaderboard       from './pages/Leaderboard';
import ProtectedRoute    from './components/common/ProtectedRoute';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login"    element={!user ? <Login />    : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

      {/* Citizen routes */}
      <Route path="/" element={
        <ProtectedRoute allowedRoles={['citizen', 'admin']}>
          <CitizenFeed />
        </ProtectedRoute>
      }/>
      <Route path="/issue/:id" element={
        <ProtectedRoute allowedRoles={['citizen', 'authority', 'admin']}>
          <IssueDetail />
        </ProtectedRoute>
      }/>

      {/* Authority routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['authority', 'admin']}>
          <AuthorityDashboard />
        </ProtectedRoute>
      }/>

      {/* Shared routes */}
      <Route path="/analytics"   element={<ProtectedRoute allowedRoles={['citizen','authority','admin']}><Analytics /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute allowedRoles={['citizen','authority','admin']}><Leaderboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}