export const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const units = [['y', 31536000], ['mo', 2592000], ['d', 86400], ['h', 3600], ['m', 60]];
  for (const [label, sec] of units) {
    const v = Math.floor(s / sec);
    if (v >= 1) return `${v}${label} ago`;
  }
  return 'just now';
};

// works whether upvotes is a number or an array of user ids
export const countOf = (v) => (Array.isArray(v) ? v.length : Number(v) || 0);

export const STATUS = {
  pending:     { label: 'Pending',     dot: 'bg-yellow-400', bar: 'bg-yellow-400' },
  in_progress: { label: 'In Progress', dot: 'bg-blue-400',   bar: 'bg-blue-400' },
  resolved:    { label: 'Resolved',    dot: 'bg-green-400',  bar: 'bg-green-400' },
};

export const card =
  'rounded-2xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-800/60';