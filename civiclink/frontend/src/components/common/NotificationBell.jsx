import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, MapPin, X } from 'lucide-react';
import API from '../../api/axios';
import socket from '../../utils/socket';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Listen for real-time notifications
  useEffect(() => {
    socket.on('new_notification', (notif) => {
      toast(`📍 ${notif.message}`, {
        duration: 5000,
        style: { background: '#1e1b4b', color: '#c7d2fe', border: '1px solid #4f46e5' },
      });
      setUnreadCount(prev => prev + 1);
      fetchNotifications();
    });
    return () => socket.off('new_notification');
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? {...n, read: true} : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({...n, read: true})));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = (notif) => {
    markAsRead(notif._id);
    setOpen(false);
    navigate(`/issue/${notif.issue?._id}`);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days > 0)  return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0)  return `${mins}m ago`;
    return 'just now';
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
      >
        <Bell size={18}/>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[999] overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-blue-500"/>
              <span className="font-semibold text-gray-800 dark:text-white text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  <CheckCheck size={12}/> All read
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={15}/>
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl h-16"/>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2"/>
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No notifications yet</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                  Issues in your area will appear here
                </p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => handleNotifClick(notif)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0
                    ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5
                    ${!notif.read ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <MapPin size={14} className={!notif.read ? 'text-blue-500' : 'text-gray-400'}/>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${!notif.read ? 'text-gray-800 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {timeAgo(notif.createdAt)}
                      </span>
                      {notif.issue?.constituency && (
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full capitalize font-medium">
                          {notif.issue.constituency}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5"/>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                Showing last {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;