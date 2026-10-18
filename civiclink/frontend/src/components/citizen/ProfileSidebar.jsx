import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ThumbsUp } from 'lucide-react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { countOf, STATUS, timeAgo } from '../../utils/helpers';

const roleStyle = {
  authority: 'border-[#C9A84C]/50 bg-[#C9A84C]/10 text-[#C9A84C]',
  admin:     'border-[#E8714A]/50 bg-[#E8714A]/10 text-[#E8714A]',
  citizen:   'border-[#7BAF7B]/50 bg-[#7BAF7B]/10 text-[#7BAF7B]',
};

const fetchProfile = async () => {
  try {
    return await API.get('/profile/me');
  } catch (err) {
    if (err.response?.status === 404) return await API.get('/api/profile/me');
    throw err;
  }
};

const describe = (err) => {
  if (!err.response) return 'Cannot reach the server. Is the backend running on port 5000?';
  const msg = err.response.data?.message || err.response.statusText || '';
  return `${err.response.status} ${msg}`;
};

export default function ProfileSidebar({ refreshKey }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [data, setData]         = useState(null);
  const [state, setState]       = useState('loading');
  const [errorText, setErrorText] = useState('');
  const [retrying, setRetrying] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetchProfile();
      setData(res.data);
      setErrorText('');
      setState('ready');
    } catch (err) {
      setErrorText(describe(err));
      setState((s) => (s === 'ready' ? s : 'error'));
    } finally {
      setRetrying(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  if (state === 'loading') {
    return <div className="h-96 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />;
  }

  const user = data?.user || authUser;
  const failed = state === 'error';

  if (!user) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center text-sm">
        <p className="mb-2 text-[#F5EDD6]/60">Couldn't load your profile.</p>
        <p className="mb-3 break-words text-xs text-red-400">{errorText}</p>
        <button
          onClick={() => { setRetrying(true); load(); }}
          className="rounded-xl bg-gradient-to-r from-[#E8714A] to-[#C9A84C] px-4 py-1.5 text-[#0B0F1A] font-bold"
        >
          {retrying ? 'Retrying…' : 'Retry'}
        </button>
      </div>
    );
  }

  const stats = data?.stats || {};
  const isAuthority = data?.isAuthority ?? ['authority', 'admin'].includes(user.role);
  const postedIssues = data?.postedIssues || [];
  const assignedIssues = data?.assignedIssues || [];
  const username = user.username || user.email?.split('@')[0] || '';

  const show = (v) => (failed ? '–' : v ?? 0);
  const tiles = isAuthority
    ? [['Assigned', show(stats.totalAssigned)], ['Resolved', show(stats.resolved)], ['Raised', show(stats.totalIssues)]]
    : [['Raised', show(stats.totalIssues)], ['Resolved', show(stats.resolved)], ['Upvotes', show(stats.totalUpvotes)]];

  const recent = (isAuthority ? assignedIssues : postedIssues).slice(0, 4);

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-xl">
      {failed && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          <p className="font-semibold">Couldn't load your stats.</p>
          <p className="mt-1 break-words">{errorText}</p>
          <button
            onClick={() => { setRetrying(true); load(); }}
            className="mt-2 rounded-lg bg-gradient-to-r from-[#E8714A] to-[#C9A84C] text-[#0B0F1A] font-semibold px-3 py-1"
          >
            {retrying ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      )}

      {/* Identity */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-[#E8714A] to-[#C9A84C] text-3xl font-bold text-[#0B0F1A] shadow-lg">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <h2 className="mt-3 text-lg font-semibold text-[#F5EDD6]">{user.name}</h2>
        {username && <p className="text-sm text-[#F5EDD6]/50">@{username}</p>}

        <span
          className={`mt-2 rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${
            roleStyle[user.role] || roleStyle.citizen
          }`}
        >
          {user.role}
        </span>

        {user.designation && <p className="mt-1 text-xs text-[#F5EDD6]/60">{user.designation}</p>}
        {user.constituency && (
          <p className="mt-2 flex items-center gap-1 text-xs capitalize text-[#F5EDD6]/60">
            <MapPin size={11} className="text-[#E8714A]" /> {user.constituency}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/10 py-4 text-center">
        {tiles.map(([label, value]) => (
          <div key={label}>
            <div className="text-xl font-bold text-[#F5EDD6]">{value}</div>
            <div className="text-xs text-[#F5EDD6]/50">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent posts */}
      <h3 className="mb-3 mt-4 text-sm font-semibold text-[#E8714A]">
        📋 {isAuthority ? 'Recently Assigned' : 'Recent Posts'}
      </h3>

      {recent.length === 0 ? (
        <p className="text-sm text-[#F5EDD6]/40">
          {failed ? 'Recent posts unavailable.' : isAuthority ? 'No issues assigned yet.' : "You haven't reported anything yet."}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {recent.map((i) => (
            <li
              key={i._id}
              onClick={() => navigate(`/issue/${i._id}`)}
              className="cursor-pointer rounded-xl bg-white/5 p-3 border border-white/5 transition hover:bg-white/10"
            >
              <p className="truncate text-sm font-medium text-[#F5EDD6]">{i.title}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-[#F5EDD6]/50">
                <span className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${STATUS[i.status]?.dot || 'bg-[#C9A84C]'}`} />
                  {STATUS[i.status]?.label || i.status}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp size={11} className="text-[#E8714A]" /> {countOf(i.upvotes)} · {timeAgo(i.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => navigate('/profile')}
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-sm font-medium text-[#F5EDD6] transition hover:bg-white/10"
      >
        View full profile & activity
      </button>
    </div>
  );
}