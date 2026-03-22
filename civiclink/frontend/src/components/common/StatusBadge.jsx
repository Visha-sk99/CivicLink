// Reusable pill badge that color-codes issue status
const colors = {
  pending:     'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved:    'bg-green-100 text-green-800',
};

const labels = {
  pending:     '⏳ Pending',
  in_progress: '🔧 In Progress',
  resolved:    '✅ Resolved',
};

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
    {labels[status] || status}
  </span>
);

export default StatusBadge;