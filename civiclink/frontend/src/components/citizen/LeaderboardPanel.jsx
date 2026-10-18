import { useEffect, useState } from 'react';
import { Trophy, MapPin } from 'lucide-react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { card } from '../../utils/helpers';

const medal = ['🥇', '🥈', '🥉'];

const fmtHours = (h) => {
  if (h === null || h === undefined) return '–';
  if (h < 1) return '<1h';
  if (h < 48) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
};

export default function LeaderboardPanel({ refreshKey, activeUserId, onUserClick }) {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    API.get('/analytics/leaderboard', { params: { limit: 10 } })
      .then((r) => setRows(r.data))
      .catch(() => setRows((prev) => prev || false));
  }, [refreshKey, tries]);

  const myId = user?._id || user?.id;

  return (
    <div className={`${card} p-5`}>
      <h2 className="mb-1 flex items-center gap-2 font-semibold text-gray-800 dark:text-white">
        <Trophy size={18} className="text-yellow-500" /> Authority Leaderboard
      </h2>
      <p className="text-xs text-gray-400">20 pts per resolved · 5 per in progress · 1 per upvote</p>
      <p className="mb-4 text-xs text-gray-400">Click an authority to see the issues they handle</p>

      {rows === null && <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900/60" />}

      {rows === false && (
        <div className="text-sm text-gray-400">
          Couldn't load leaderboard.{' '}
          <button
            onClick={() => { setRows(null); setTries((t) => t + 1); }}
            className="text-blue-500 underline"
          >
            Retry
          </button>
        </div>
      )}

      {Array.isArray(rows) && rows.length === 0 && (
        <p className="text-sm text-gray-400">No authorities registered yet.</p>
      )}

      <ol className="space-y-2">
        {Array.isArray(rows) &&
          rows.map((r) => {
            const me = r.userId === myId;
            const active = activeUserId === r.userId;
            const rate = r.assigned ? Math.round((r.resolved / r.assigned) * 100) : 0;

            return (
              <li key={r.userId}>
                <button
                  type="button"
                  onClick={() => onUserClick?.(r)}
                  title={`Show issues handled by ${r.name}`}
                  aria-pressed={active}
                  className={`w-full rounded-xl p-2.5 text-left text-sm transition hover:-translate-y-0.5 ${
                    active
                      ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20'
                      : me
                      ? 'bg-indigo-500/10 ring-1 ring-indigo-500/40 hover:bg-indigo-500/20'
                      : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 text-center font-semibold text-gray-600 dark:text-gray-300">
                      {medal[r.rank - 1] || r.rank}
                    </span>

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-xs font-bold text-white">
                      {r.name?.[0]?.toUpperCase()}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-gray-800 dark:text-gray-100">
                        {r.name}{me && ' (you)'}
                      </span>
                      <span className="flex items-center gap-1 truncate text-xs capitalize text-gray-400">
                        {r.designation || 'Authority'}
                        {r.constituency && (
                          <>
                            <span>·</span>
                            <MapPin size={10} className="shrink-0 text-blue-400" />
                            <span className="truncate">{r.constituency}</span>
                          </>
                        )}
                      </span>
                    </span>

                    <span className="font-bold text-indigo-500">{r.score}</span>
                  </span>

                  {/* resolution rate bar */}
                  <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <span
                      className="block h-full rounded-full bg-green-500 transition-all duration-500"
                      style={{ width: `${rate}%` }}
                    />
                  </span>
                  <span className="mt-1 block text-[11px] text-gray-400">
                    {r.assigned === 0
                      ? 'No issues handled yet'
                      : `${r.resolved} of ${r.assigned} resolved · ${rate}%`}
                  </span>
                </button>

                {/* Details when selected */}
                {active && (
                  <div className="mx-1 mt-1 rounded-xl bg-blue-50 p-2.5 text-center text-[11px] dark:bg-blue-900/20">
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        ['Assigned', r.assigned],
                        ['Resolved', r.resolved],
                        ['Active', r.inProgress],
                        ['Pending', r.pending],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div className="text-sm font-bold text-gray-800 dark:text-white">{value}</div>
                          <div className="text-gray-400">{label}</div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      ⏱ Avg resolution: <strong>{fmtHours(r.avgHours)}</strong> · 👍 {r.upvotes} citizen upvotes
                    </p>
                  </div>
                )}
              </li>
            );
          })}
      </ol>
    </div>
  );
}