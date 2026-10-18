import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { card, STATUS } from '../../utils/helpers';

export default function AnalyticsStrip({ refreshKey }) {
  const [a, setA] = useState(null);

  useEffect(() => {
    api.get('/api/analytics').then((r) => setA(r.data)).catch(() => setA(false));
  }, [refreshKey]);

  if (a === null) return <div className={`${card} h-40 animate-pulse`} />;
  if (a === false) return null;

  const rate = a.total ? Math.round((a.resolved / a.total) * 100) : 0;
  const tiles = [
    ['Total', a.total, 'text-slate-900 dark:text-white'],
    ['Pending', a.pending, 'text-yellow-400'],
    ['In Progress', a.inProgress, 'text-blue-400'],
    ['Resolved', a.resolved, 'text-green-400'],
  ];
  const max = Math.max(...(a.byCategory || []).map((c) => c.count), 1);

  return (
    <div className={`${card} p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">📊 Community Analytics</h2>
        <span className="text-sm text-slate-400">{rate}% resolved</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(([label, value, color]) => (
          <div key={label} className="rounded-xl bg-slate-100 p-3 text-center dark:bg-slate-900/50">
            <div className={`text-2xl font-bold ${color}`}>{value ?? 0}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* resolution progress */}
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className={`h-full ${STATUS.resolved.bar} transition-all`} style={{ width: `${rate}%` }} />
      </div>

      {/* top categories */}
      {a.byCategory?.length > 0 && (
        <div className="mt-4 space-y-2">
          {a.byCategory.map((c) => (
            <div key={c.category} className="flex items-center gap-3 text-xs">
              <span className="w-24 truncate capitalize text-slate-400">{c.category}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${(c.count / max) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right">{c.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
