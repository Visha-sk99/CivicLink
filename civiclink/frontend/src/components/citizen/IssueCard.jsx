import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, MessageCircle, MapPin } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const categoryColors = {
  pothole:     'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  water:       'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  garbage:     'text-green-600 bg-green-50 dark:bg-green-900/20',
  electricity: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  other:       'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
};

const IssueCard = ({ issue, onVote }) => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const sendVote = async (voteType) => {
    try {
      return await API.post(`/votes/${issue._id}`, { voteType });
    } catch (err) {
      // fall back to the route style from the handoff doc: POST /votes/upvote
      if (err.response?.status === 404) {
        return await API.post(`/votes/${voteType}`, { issueId: issue._id, voteType });
      }
      throw err;
    }
  };

  const handleVote = async (e, voteType) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);

    try {
      await sendVote(voteType);
      toast.dismiss('vote-error');
      toast.success(voteType === 'upvote' ? '👍 Upvoted!' : '👎 Downvoted!', { id: 'vote-ok' });
    } catch (err) {
      const status = err.response?.status;
      const msg =
        err.response?.data?.message ||
        (err.response ? `Vote failed (${status})` : 'Cannot reach the server');
      console.error('Vote failed:', status, err.config?.baseURL, err.config?.url, err.response?.data);
      toast.error(msg, { id: 'vote-error' });
      setBusy(false);
      return;
    }

    setBusy(false);
    onVote?.(); // refresh the feed and side panels
  };

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/issue/${issue._id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg ${categoryColors[issue.category] || 'text-gray-500 bg-gray-100 dark:bg-gray-700'}`}>
            {issue.category}
          </span>
          <h3 className="font-semibold text-gray-800 dark:text-white mt-2 text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {issue.title}
          </h3>
        </div>
        <StatusBadge status={issue.status} />
      </div>

      {/* Description */}
      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3 leading-relaxed">
        {issue.description}
      </p>

      {/* Media preview */}
      {issue.media?.length > 0 && (
        <div className="relative overflow-hidden rounded-xl mb-3">
          <img
            src={issue.media[0]}
            alt="issue"
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {issue.media.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-lg">
              +{issue.media.length - 1} more
            </span>
          )}
        </div>
      )}

      {/* Location */}
      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mb-3">
        <MapPin size={11} className="text-blue-400"/>
        <span>{issue.location?.address || 'Location not specified'}</span>
      </div>

      {/* Footer */}
      <div
        className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <button
          disabled={busy}
          onClick={(e) => handleVote(e, 'upvote')}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 px-2.5 py-1 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ThumbsUp size={14}/> {issue.upvotes}
        </button>
        <button
          disabled={busy}
          onClick={(e) => handleVote(e, 'downvote')}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ThumbsDown size={14}/> {issue.downvotes}
        </button>
        <span className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 px-2.5 py-1">
          <MessageCircle size={14}/> {issue.comments?.length || 0}
        </span>
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          by <span className="font-medium text-gray-600 dark:text-gray-300">{issue.raisedBy?.name}</span> · {new Date(issue.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default IssueCard;