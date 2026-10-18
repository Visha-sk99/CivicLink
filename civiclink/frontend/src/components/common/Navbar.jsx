import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';
import { joinUserRoom } from '../../utils/socket';
import {
  LogOut, MapPin, Sun, Moon, LayoutDashboard,
  BarChart2, Trophy, Rss, ChevronDown, User, Shield
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (user?._id) {
      joinUserRoom(user._id);
    }
  }, [user?._id]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinks = [
    ...(user?.role === 'citizen'   ? [{ to: '/',          label: 'Feed',      icon: <Rss size={15}/> }] : []),
    ...(user?.role === 'authority' ? [{ to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15}/> }] : []),
    ...(user?.role === 'authority' ? [{ to: '/',          label: 'Feed',      icon: <Rss size={15}/> }] : []),
    { to: '/analytics',   label: 'Analytics',   icon: <BarChart2 size={15}/> },
    { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={15}/> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0B0F1A]/90 border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#E8714A] to-[#C9A84C] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
            <MapPin size={16} className="text-[#0B0F1A]"/>
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-[#E8714A] to-[#C9A84C] bg-clip-text text-transparent">
            CivicLink
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.to + link.label} to={link.to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive(link.to)
                  ? 'bg-white/10 text-[#E8714A]'
                  : 'text-[#F5EDD6]/70 hover:bg-white/5 hover:text-[#F5EDD6]'}`}
            >
              {link.icon} {link.label}
              {isActive(link.to) && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#E8714A] inline-block"/>
              )}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user?.role === 'authority' && <NotificationBell />}

          <button onClick={toggleTheme}
            className="p-2 rounded-xl text-[#F5EDD6]/70 hover:bg-white/10 transition-all duration-200">
            {darkMode ? <Sun size={17}/> : <Moon size={17}/>}
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-all duration-200 group"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#E8714A] to-[#C9A84C] flex items-center justify-center text-[#0B0F1A] text-xs font-bold shadow-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-[#F5EDD6]">
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown size={14}
                className={`text-[#F5EDD6]/60 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}/>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#131926] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
                <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#E8714A] to-[#C9A84C] flex items-center justify-center text-[#0B0F1A] font-bold shadow-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#F5EDD6]">{user?.name}</p>
                      <p className="text-xs text-[#F5EDD6]/50">{user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E8714A]/20 text-[#E8714A]">
                      <Shield size={10}/>
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </span>
                    {user?.constituency && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#7BAF7B]/20 text-[#7BAF7B]">
                        <MapPin size={9}/>
                        <span className="capitalize">{user.constituency}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#F5EDD6]/80 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <User size={15}/> Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#E8714A] hover:bg-[#E8714A]/10 rounded-xl transition-colors mt-1"
                  >
                    <LogOut size={15}/> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;