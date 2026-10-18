import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import API from '../api/axios';
import socket from '../utils/socket';
import IssueCard from '../components/citizen/IssueCard';
import IssueForm from '../components/citizen/IssueForm';
import ProfileSidebar from '../components/citizen/ProfileSidebar';
import LeaderboardPanel from '../components/citizen/LeaderboardPanel';
import AnalyticsPanel from '../components/citizen/AnalyticsPanel';

const CATEGORIES = ['pothole', 'water', 'garbage', 'electricity', 'other'];

const mergeIssue = (old, incoming) => {
  const merged = { ...old, ...incoming };
  ['raisedBy', 'assignedTo', 'resolvedBy'].forEach((k) => {
    if (incoming[k] && typeof incoming[k] !== 'object' && old[k] && typeof old[k] === 'object') {
      merged[k] = old[k];
    }
  });
  return merged;
};

const idOf = (v) => String(v?._id || v || '');
const handlerIdOf = (issue) => idOf(issue.assignedTo) || idOf(issue.resolvedBy);

const field =
  'rounded-xl border border-white/10 bg-[#131926] px-3 py-2.5 text-sm text-[#F5EDD6] outline-none focus:border-[#E8714A] focus:ring-1 focus:ring-[#E8714A]';

const sticky =
  'lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto [scrollbar-width:thin]';

export default function CitizenFeed() {
  const [issues, setIssues]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [status, setStatus]         = useState('');
  const [category, setCategory]     = useState('');
  const [authority, setAuthority]   = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);

  const fetchIssues = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      const { data } = await API.get('/issues', { params: { limit: 100 } });
      setIssues(Array.isArray(data) ? data : data.issues || []);
    } catch {
      setError('Could not load issues.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  useEffect(() => {
    const onNew = (issue) =>
      setIssues((prev) => (prev.some((i) => i._id === issue._id) ? prev : [issue, ...prev]));
    const onUpdated = (issue) =>
      setIssues((prev) => prev.map((i) => (i._id === issue._id ? mergeIssue(i, issue) : i)));
    const onDeleted = ({ _id }) =>
      setIssues((prev) => prev.filter((i) => i._id !== _id));

    socket.on('new_issue', onNew);
    socket.on('issue_updated', onUpdated);
    socket.on('issue_deleted', onDeleted);
    socket.on('leaderboard_refresh', bump);
    return () => {
      socket.off('new_issue', onNew);
      socket.off('issue_updated', onUpdated);
      socket.off('issue_deleted', onDeleted);
      socket.off('leaderboard_refresh', bump);
    };
  }, [bump]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...issues]
      .filter((i) => !authority || handlerIdOf(i) === authority.id)
      .filter((i) => !status || i.status === status)
      .filter((i) => !category || i.category === category)
      .filter(
        (i) =>
          !q ||
          [i.title, i.description, i.location?.address, i.constituency]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(q)
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [issues, search, status, category, authority]);

  const hasFilters = search || status || category || authority;
  const clearFilters = () => { setSearch(''); setStatus(''); setCategory(''); setAuthority(null); };

  const handleAuthorityClick = (row) => {
    setAuthority((prev) =>
      prev?.id === row.userId
        ? null
        : { id: row.userId, name: row.name, designation: row.designation }
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const afterVote   = () => { fetchIssues(true); bump(); };
  const afterCreate = () => { setShowForm(false); fetchIssues(true); bump(); };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#F5EDD6]">
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)_300px] lg:px-6">

        {/* LEFT */}
        <aside className={`order-2 lg:order-1 ${sticky}`}>
          <div className="pb-20">
            <ProfileSidebar refreshKey={refreshKey} />
          </div>
        </aside>

        {/* MIDDLE */}
        <main className="order-1 min-w-0 space-y-5 lg:order-2">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F5EDD6]/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search issues..."
                className={`${field} w-full pl-9 placeholder-[#F5EDD6]/40`}
              />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
              <option value="">All Types</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          {authority && (
            <div className="flex items-center justify-between rounded-xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-4 py-2.5 text-sm">
              <span className="text-[#C9A84C]">
                Showing issues handled by <strong>{authority.name}</strong>
                {authority.designation && (
                  <span className="capitalize opacity-70"> · {authority.designation}</span>
                )}
              </span>
              <button
                onClick={() => setAuthority(null)}
                className="flex items-center gap-1 text-[#E8714A] hover:underline"
              >
                <X size={14} /> Clear
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-[#F5EDD6]/50">
            <span>Showing {visible.length} issues · newest first</span>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-[#E8714A] hover:underline">
                <X size={14} /> Clear filters
              </button>
            )}
          </div>

          {loading && <p className="py-10 text-center text-[#F5EDD6]/50">Loading feed…</p>}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}{' '}
              <button onClick={() => fetchIssues()} className="underline text-[#E8714A]">Retry</button>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <p className="py-10 text-center text-[#F5EDD6]/50">
              {authority
                ? `No issues handled by ${authority.name} match your filters.`
                : 'No issues match your filters.'}
            </p>
          )}

          <div className="space-y-5">
            {visible.map((issue) => (
              <IssueCard key={issue._id} issue={issue} onVote={afterVote} />
            ))}
          </div>
        </main>

        {/* RIGHT */}
        <aside className={`order-3 ${sticky}`}>
          <div className="space-y-5 pb-20">
            <LeaderboardPanel
              refreshKey={refreshKey}
              activeUserId={authority?.id}
              onUserClick={handleAuthorityClick}
            />
            <AnalyticsPanel
              refreshKey={refreshKey}
              activeStatus={status}
              activeCategory={category}
              onStatusClick={setStatus}
              onCategoryClick={(c) => setCategory((prev) => (prev === c ? '' : c))}
            />
          </div>
        </aside>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E8714A] to-[#C9A84C] px-5 py-3 font-bold text-[#0B0F1A] shadow-xl hover:opacity-90 transition"
      >
        <Plus size={18} /> Report Issue
      </button>

      {showForm && (
        <IssueForm
          onClose={() => setShowForm(false)}
          onSuccess={afterCreate}
          onCreated={afterCreate}
        />
      )}
    </div>
  );
}