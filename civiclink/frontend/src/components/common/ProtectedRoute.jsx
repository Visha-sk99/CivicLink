import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/>
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  // If role not allowed → send to login, NOT to "/" (avoids infinite loop)
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;