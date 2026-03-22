import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, MessageCircle, MapPin } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const IssueCard = ({ issue, onVote }) => {
  const navigate = useNavigate();

  const handleVote = async (voteType) => {
    try {
      await API.post(`/votes/${issue._id}`, { voteType });
      onVote(); // refresh parent
    } catch {
      toast.error('Could not cast vote');
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/issue/${issue._id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
            {issue.category}
          </span>
          <h3 className="font-semibold text-gray-800 mt-1 text-base">{issue.title}</h3>
        </div>
        <StatusBadge status={issue.status} />
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{issue.description}</p>

      {/* Media preview */}
      {issue.media?.length > 0 && (
        <img
          src={issue.media[0]}
          alt="issue"
          className="w-full h-44 object-cover rounded-xl mb-3"
        />
      )}

      {/* Location */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
        <MapPin size={12} />
        <span>{issue.location?.address || 'Location not specified'}</span>
      </div>

      {/* Footer — votes + comments */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100"
           onClick={e => e.stopPropagation()} // prevent card click
      >
        <button
          onClick={() => handleVote('upvote')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors"
        >
          <ThumbsUp size={15} /> {issue.upvotes}
        </button>
        <button
          onClick={() => handleVote('downvote')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <ThumbsDown size={15} /> {issue.downvotes}
        </button>
        <span className="flex items-center gap-1 text-sm text-gray-400">
          <MessageCircle size={15} /> {issue.comments?.length || 0}
        </span>
        <span className="ml-auto text-xs text-gray-400">
          by {issue.raisedBy?.name} · {new Date(issue.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default IssueCard;