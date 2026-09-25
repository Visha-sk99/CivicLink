import { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../components/common/Navbar';
import API from '../api/axios';
import socket from '../utils/socket';
import {
  Trophy, Star, Zap, Award, CheckCircle,
  Clock, Timer, Users, RefreshCw
} from 'lucide-react';

const BadgeIcon = ({ icon, size = 14 }) => {
  const icons = {
    Award:       <Award size={size}/>,
    Zap:         <Zap size={size}/>,
    CheckCircle: <CheckCircle size={size}/>,
    Clock:       <Clock size={size}/>,
    Star:        <Star size={size}/>,
  };
  return icons[icon] || <Star size={size}/>;
};

const getRankStyle = (rank) => {
  if (rank === 0) return {
    number: 'text-yellow-400 font-black text-2xl',
    card:   'border-yellow-400/50 dark:border-yellow-500/50 ring-2 ring-yellow-400/30 dark:ring-yellow-500/30',
    glow:   true
  };
  if (rank === 1) return {
    number: 'text-gray-300 font-black text-2xl',
    card:   'border-gray-300/30 dark:border-gray-500/30',
    glow:   false
  };
  if (rank === 2) return {
    number: 'text-amber-600 font-black text-2xl',
    card:   'border-amber-600/30 dark:border-amber-700/30',
    glow:   false
  };
  return {
    number: 'text-gray-500 dark:text-gray-600 font-bold text-xl',
    card:   'border-gray-100 dark:border-gray-700/50',
    glow:   false
  };
};

const Leaderboard = () => {
  const [leaders,     setLeaders]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [tooltip,     setTooltip]     = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data } = await API.get('/badges/leaderboard');
      setLeaders(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  // Real-time refresh via socket
  useEffect(() => {
    socket.on('leaderboard_refresh', () => {
      fetchLeaderboard(true);
    });
    return () => socket.off('leaderboard_refresh');
  }, [fetchLeaderboard]);

  // Format avg resolution time cleanly
  const formatTime = useCallback((days) => {
    if (days === null || days === undefined) return 'No data';
    const totalMinutes = Math.round(days * 24 * 60);
    if (totalMinutes < 60)  return `${totalMinutes}m avg`;
    const hours = Math.round(days * 24);
    if (hours < 24) return `${hours}h avg`;
    return `${days.toFixed(1)}d avg`;
  }, []);

  // Summary stats using useMemo for performance
  const summaryStats = useMemo(() => ({
    totalResolved: leaders.reduce((sum, l) => sum + (l.totalResolved || 0), 0),
    bestTime:      leaders.find(l => l.avgResolutionTime !== null)?.avgResolutionTime,
    totalUpvotes:  leaders.reduce((sum, l) => sum + (l.totalUpvotes  || 0), 0),
  }), [leaders]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Trophy size={20} className="text-white"/>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Politician Leaderboard
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Ranked by fastest issue resolution · Live updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Last updated */}
            {lastUpdated && (
              <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {/* Manual refresh button */}
            <button
              onClick={() => fetchLeaderboard(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''}/>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl">
              <Users size={12}/>
              {leaders.length} authorities
            </div>
          </div>
        </div>

        {/* Stats bar */}
        {leaders.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 text-center">
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {summaryStats.totalResolved}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Total resolved</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 text-center">
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {summaryStats.bestTime !== undefined && summaryStats.bestTime !== null
                  ? formatTime(summaryStats.bestTime)
                  : 'N/A'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Best avg time</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 text-center">
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {summaryStats.totalUpvotes}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Total upvotes</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded"/>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"/>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"/>
                  </div>
                  <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && leaders.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trophy size={24} className="text-gray-400"/>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No authorities yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Register authority accounts to see rankings
            </p>
          </div>
        )}

        {/* Leaderboard list */}
        {!loading && (
          <div className="space-y-3">
            {leaders.map((auth, i) => {
              const rankStyle = getRankStyle(i);
              return (
                <div
                  key={auth._id}
                  style={{ zIndex: tooltip === auth._id ? 50 : 'auto' }}
                  className={`relative overflow-visible bg-white dark:bg-gray-800 rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${rankStyle.card}`}
                  onMouseEnter={() => setTooltip(auth._id)}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {/* Gold glow */}
                  {rankStyle.glow && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-500/5 via-amber-500/5 to-yellow-500/5 pointer-events-none"/>
                  )}

                  {/* Rank */}
                  <span className={`w-10 text-center shrink-0 ${rankStyle.number}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                  </span>

                  {/* Name + designation */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 dark:text-white truncate">
                        {auth.name}
                      </p>
                      {i === 0 && <Trophy size={14} className="text-yellow-400 shrink-0"/>}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {auth.designation} · {auth.constituency}
                    </p>
                  </div>

                  {/* Tooltip — shows above card with correct data from API */}
                  {tooltip === auth._id && (
                    <div className="absolute left-14 bottom-full mb-2 z-[999] bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap pointer-events-none">
                      <div className="flex items-center gap-3">
                        <span>✅ {auth.totalResolved} resolved</span>
                        <span>⏱ {formatTime(auth.avgResolutionTime)}</span>
                        <span>👍 {auth.totalUpvotes} upvotes</span>
                      </div>
                      <div className="absolute left-5 top-full w-0 h-0
                        border-l-[6px] border-r-[6px] border-t-[6px]
                        border-l-transparent border-r-transparent
                        border-t-gray-900 dark:border-t-gray-700"/>
                    </div>
                  )}

                  {/* Resolved count pill */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1.5 rounded-xl shrink-0">
                    <CheckCircle size={12} className="text-green-400"/>
                    {auth.totalResolved} solved
                  </div>

                  {/* Resolution time */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1.5 rounded-xl shrink-0">
                    <Timer size={12} className="text-blue-400"/>
                    {formatTime(auth.avgResolutionTime)}
                  </div>

                  {/* Badge */}
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl shrink-0 ${auth.badge?.color}`}>
                    <BadgeIcon icon={auth.badge?.icon}/>
                    {auth.badge?.label}
                  </span>

                  {/* Score */}
                  <div className="flex items-center gap-1 text-sm font-bold text-gray-700 dark:text-gray-200 shrink-0">
                    <Star size={14} className="text-yellow-400"/>
                    {auth.reputationScore}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Badge Guide */}
        {!loading && leaders.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Badge Guide
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: 'Zap',         color: 'bg-green-500/20 text-green-400',   label: 'Fast Responder',   desc: 'Resolves in <3 hours' },
                { icon: 'Award',       color: 'bg-yellow-500/20 text-yellow-400', label: 'Quality Champion', desc: '10+ issues resolved' },
                { icon: 'CheckCircle', color: 'bg-blue-500/20 text-blue-400',     label: 'Issue Resolver',   desc: '5+ issues resolved' },
                { icon: 'Clock',       color: 'bg-red-500/20 text-red-400',       label: 'Slow Performer',   desc: 'Avg >5 days to resolve' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg shrink-0 ${b.color}`}>
                    <BadgeIcon icon={b.icon} size={11}/>
                    {b.label}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{b.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Leaderboard;