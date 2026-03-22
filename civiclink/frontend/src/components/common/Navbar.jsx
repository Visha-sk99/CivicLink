import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, MapPin } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 font-bold text-blue-600 text-xl">
        <MapPin size={20} />
        CivicLink
      </Link>

      <div className="flex items-center gap-6 text-sm text-gray-600">
        {user?.role === 'citizen' && <Link to="/" className="hover:text-blue-600">Feed</Link>}
        {user?.role === 'authority' && <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>}
        <Link to="/analytics"   className="hover:text-blue-600">Analytics</Link>
        <Link to="/leaderboard" className="hover:text-blue-600">Leaderboard</Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          {user?.name} · <span className="capitalize text-blue-600">{user?.role}</span>
        </span>
        <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;