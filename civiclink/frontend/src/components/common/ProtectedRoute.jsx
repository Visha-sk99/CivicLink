import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#0B0F1A]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#E8714A] border-t-transparent rounded-full animate-spin"/>
        <p className="text-sm text-[#F5EDD6]/60">Loading...</p>
      </div>
    </div>
  );

  // ✅ Send unauthenticated users to "/" (which displays Landing via HomeGate)
  if (!user) return <Navigate to="/" replace />;

  // If role not allowed → also send to "/"
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;