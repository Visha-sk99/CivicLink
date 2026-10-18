import { useEffect, useState } from 'react';
import { BarChart2 } from 'lucide-react';
import API from '../../api/axios';
import { card } from '../../utils/helpers';

export default function AnalyticsPanel({
  refreshKey,
  activeStatus,
  activeCategory,
  onStatusClick,
  onCategoryClick,
}) {
  const [a, setA] = useState(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    API.get('/analytics')
      .then((r) => setA(r.data))
      .catch(() => setA((prev) => prev || false));
  }, [refreshKey, tries]);

  if (a === null) return <div className={`${card} h-72 animate-pulse`} />;

  if (a === false) {
    return (
      <div className={`${card} p-5 text-center text-sm`}>
        <p className="mb-3 text-gray-400">Analytics unavailable right now.</p>
        <button
          onClick={() => { setA(null); setTries((t) => t + 1); }}
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  const total      = a.total || 0;
  const pending    = a.pending || 0;
  const inProgress = a.inProgress || 0;
  const resolved   = a.resolved || 0;

  const pPending  = total ? (pending / total) * 100 : 0;
  const pProgress = total ? (inProgress / total) * 100 : 0;
  const rate      = total ? Math.round((resolved / total) * 100) : 0;

  const stops = total
    ? `#facc15 0 ${pPending}%, #3b82f6 ${pPending}% ${pPending + pProgress}%, #22c55e ${pPending + pProgress}% 100%`
    : '#6b7280 0 100%';

  const statusRows = [
    { key: '',            label: 'All',         value: total,      dot: 'bg-gray-400' },
    { key: 'pending',     label: 'Pending',     value: pending,    dot: 'bg-yellow-400' },
    { key: 'in_progress', label: 'In Progress', value: inProgress, dot: 'bg-blue-500' },
    { key: 'resolved',    label: 'Resolved',    value: resolved,   dot: 'bg-green-500' },
  ];

  const cats = (a.byCategory || [])
    .map((c) => ({ name: c.category || c._id, count: c.count }))
    .filter((c) => c.name);
  const max = Math.max(...cats.map((c) => c.count), 1);

  return (
    <div className={`${card} p-5`}>
      <h2 className="mb-1 flex items-center gap-2 font-semibold text-gray-800 dark:text-white">
        <BarChart2 size={18} className="text-blue-500" /> Analytics
      </h2>
      <p className="mb-4 text-xs text-gray-400">Click a row to filter the feed</p>

      {/* Donut + status legend */}
      <div className="flex items-center gap-4">
        <div
          className="relative h-24 w-24 shrink-0 rounded-full transition-all duration-500"
          style={{ background: `conic-gradient(${stops})` }}
        >
          <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white dark:bg-gray-800">
            <span className="text-lg font-bold leading-none text-gray-800 dark:text-white">{rate}%</span>
            <span className="mt-0.5 text-[10px] text-gray-400">resolved</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          {statusRows.map((t) => {
            const active = t.key !== '' && activeStatus === t.key;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => onStatusClick?.(active ? '' : t.key)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-xs transition ${
                  active
                    ? 'bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-900/60'
                }`}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${t.dot}`} />
                <span className="flex-1 truncate text-left text-gray-600 dark:text-gray-300">{t.label}</span>
                <span className="font-semibold text-gray-800 dark:text-white">{t.value}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Issues by category */}
      {cats.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-700">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">By category</h3>
          <div className="space-y-1">
            {cats.map((c) => {
              const active = activeCategory === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => onCategoryClick?.(c.name)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-xs transition ${
                    active
                      ? 'bg-indigo-50 ring-1 ring-indigo-500 dark:bg-indigo-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-900/60'
                  }`}
                >
                  <span className="w-16 truncate text-left capitalize text-gray-500 dark:text-gray-400">{c.name}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <span
                      className="block h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${(c.count / max) * 100}%` }}
                    />
                  </span>
                  <span className="w-5 text-right font-medium text-gray-700 dark:text-gray-200">{c.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-gray-400">
        👥 {a.citizens ?? 0} citizens · 🛡️ {a.authorities ?? 0} authorities
      </p>
    </div>
  );
}