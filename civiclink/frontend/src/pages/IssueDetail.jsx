import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import StatusBadge from '../components/common/StatusBadge';
import ResolveModal from '../components/authority/ResolveModal';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ThumbsUp, ThumbsDown, Send,
  MapPin, Calendar, User, CheckCircle,
  Clock, ArrowRight, ZoomIn, X
} from 'lucide-react';

const categoryColors = {
  pothole:     'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  water:       'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  garbage:     'text-green-600 bg-green-50 dark:bg-green-900/20',
  electricity: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  other:       'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
};

// Image zoom overlay
const ImageZoom = ({ src, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    onClick={onClose}>
    <button className="absolute top-4 right-4 text-white/60 hover:text-white">
      <X size={24}/>
    </button>
    <img src={src} alt="zoom" className="max-w-full max-h-full rounded-2xl object-contain"/>
  </div>
);

// Before vs After comparison component
const BeforeAfterSection = ({ issue }) => {
  const [zoomImg, setZoomImg] = useState(null);

  const beforeImg = issue.media?.[0];
  const afterImg  = issue.resolvedImage;

  if (!afterImg) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-4 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
          <CheckCircle size={14} className="text-green-500"/>
          <span className="text-xs font-bold text-green-700 dark:text-green-400">Verified Resolution ✅</span>
        </div>
        {issue.resolvedBy && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            by {issue.resolvedBy.name} ({issue.resolvedBy.designation})
          </span>
        )}
      </div>

      {/* Before / After images */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Before */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400"/>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Before
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">(Reported Issue)</span>
          </div>
          {beforeImg ? (
            <div className="relative group overflow-hidden rounded-xl cursor-zoom-in"
              onClick={() => setZoomImg(beforeImg)}>
              <img src={beforeImg} alt="before"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"/>
              <div className="absolute inset-0 bg-red-500/10 group-hover:bg-red-500/20 transition-colors"/>
              <div className="absolute top-2 left-2 bg-red-500/80 text-white text-xs px-2 py-0.5 rounded-lg font-semibold backdrop-blur-sm">
                BEFORE
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={24} className="text-white drop-shadow-lg"/>
              </div>
            </div>
          ) : (
            <div className="w-full h-48 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <p className="text-xs text-gray-400">No before image</p>
            </div>
          )}
        </div>

        {/* Arrow in middle */}
        <div className="relative">
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden sm:flex">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <ArrowRight size={16} className="text-white"/>
            </div>
          </div>

          {/* After */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"/>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                After
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">(Resolved Proof)</span>
            </div>
            <div className="relative group overflow-hidden rounded-xl cursor-zoom-in"
              onClick={() => setZoomImg(afterImg)}>
              <img src={afterImg} alt="after"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"/>
              <div className="absolute inset-0 bg-green-500/10 group-hover:bg-green-500/20 transition-colors"/>
              <div className="absolute top-2 left-2 bg-green-500/80 text-white text-xs px-2 py-0.5 rounded-lg font-semibold backdrop-blur-sm">
                AFTER
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={24} className="text-white drop-shadow-lg"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resolution note */}
      {issue.resolutionNote && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 border border-green-100 dark:border-green-800">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Authority note</p>
          <p className="text-sm text-green-800 dark:text-green-300">{issue.resolutionNote}</p>
        </div>
      )}

      {/* Resolution timeline */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Resolution Timeline
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { label: 'Reported',    color: 'bg-gray-400',  date: issue.createdAt },
            { label: 'In Progress', color: 'bg-blue-400',  date: issue.statusHistory?.find(h => h.status === 'in_progress')?.updatedAt },
            { label: 'Resolved',    color: 'bg-green-500', date: issue.resolvedAt },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 shrink-0">
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full ${step.color} mx-auto mb-1`}/>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{step.label}</p>
                {step.date && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(step.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                )}
              </div>
              {i < 2 && <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-600 shrink-0"/>}
            </div>
          ))}
        </div>
      </div>

      {/* Citizen feedback */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Was this resolved properly?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => toast.success('Thanks for your feedback! 👍')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-100 dark:border-green-800 text-sm font-medium transition-all hover:scale-105"
          >
            <ThumbsUp size={15}/> Yes, looks good
          </button>
          <button
            onClick={() => toast.error('Thanks for your feedback. We will look into it. 👎')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-800 text-sm font-medium transition-all hover:scale-105"
          >
            <ThumbsDown size={15}/> Not really
          </button>
        </div>
      </div>

      {/* Image zoom overlay */}
      {zoomImg && <ImageZoom src={zoomImg} onClose={() => setZoomImg(null)}/>}
    </div>
  );
};

const IssueDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [issue,       setIssue]       = useState(null);
  const [comment,     setComment]     = useState('');
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [votingType,  setVotingType]  = useState(null);
  const [showResolve, setShowResolve] = useState(false);

  const fetchIssue = async () => {
    try {
      const { data } = await API.get(`/issues/${id}`);
      setIssue(data);
    } catch {
      toast.error('Could not load issue');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchIssue(); }, [id]);

  const handleVote = async (voteType) => {
    setVotingType(voteType);
    try {
      const { data } = await API.post(`/votes/${id}`, { voteType });
      setIssue(prev => ({ ...prev, upvotes: data.upvotes, downvotes: data.downvotes }));
      toast.success(voteType === 'upvote' ? '👍 Upvoted!' : '👎 Downvoted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not vote');
    } finally {
      setVotingType(null);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await API.post(`/issues/${id}/comment`, { text: comment });
      setComment('');
      toast.success('Comment posted!');
      fetchIssue();
    } catch {
      toast.error('Could not post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (status === 'resolved') {
      setShowResolve(true);
      return;
    }
    try {
      await API.put(`/issues/${id}/status`, { status });
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      fetchIssue();
    } catch {
      toast.error('Could not update status');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar/>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"/>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"/>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"/>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"/>
        </div>
      </div>
    </div>
  );

  if (!issue) return null;

  const isAuthority = user?.role === 'authority' || user?.role === 'admin';
  const isAssigned  = issue.assignedTo?._id === user?._id || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar/>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-5 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-200"/>
          Back to feed
        </button>

        {/* Issue card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <span className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg ${categoryColors[issue.category] || 'text-gray-500 bg-gray-100 dark:bg-gray-700'}`}>
              {issue.category}
            </span>
            <StatusBadge status={issue.status}/>
          </div>

          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2 leading-snug">
            {issue.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
            {issue.description}
          </p>

          {/* Before images (original report) */}
          {issue.media?.length > 0 && (
            <div className={`grid gap-2 mb-5 ${issue.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {issue.media.map((url, i) => (
                <div key={i} className="overflow-hidden rounded-xl">
                  <img src={url} alt="issue media"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"/>
                </div>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 dark:text-gray-500 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-blue-400"/>
              {issue.location?.address || 'Location not set'}
            </span>
            <span className="flex items-center gap-1">
              <User size={11} className="text-purple-400"/>
              Posted by <span className="text-gray-600 dark:text-gray-300 font-medium ml-1">{issue.raisedBy?.name}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={11} className="text-green-400"/>
              {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Assigned to */}
          {issue.assignedTo && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-xl px-4 py-2.5 mb-4 border border-blue-100 dark:border-blue-800">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {issue.assignedTo.name?.[0]?.toUpperCase()}
              </div>
              Assigned to <strong className="ml-1">{issue.assignedTo.name}</strong>
              <span className="text-blue-400 dark:text-blue-500">({issue.assignedTo.designation})</span>
            </div>
          )}

          {/* Vote buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={() => handleVote('upvote')} disabled={votingType !== null}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-100 dark:border-green-800 transition-all duration-200 font-medium hover:scale-105 disabled:opacity-60">
              <ThumbsUp size={16} className={votingType === 'upvote' ? 'animate-bounce' : ''}/>
              {issue.upvotes} Upvote
            </button>
            <button onClick={() => handleVote('downvote')} disabled={votingType !== null}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-800 transition-all duration-200 font-medium hover:scale-105 disabled:opacity-60">
              <ThumbsDown size={16} className={votingType === 'downvote' ? 'animate-bounce' : ''}/>
              {issue.downvotes} Downvote
            </button>
          </div>

          {/* Authority status controls */}
          {isAuthority && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Update status
              </p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'pending',     label: 'Pending',     color: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 hover:border-yellow-200' },
                  { key: 'in_progress', label: 'In Progress', color: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 hover:border-blue-200' },
                ].map(s => (
                  <button key={s.key}
                    onClick={() => handleStatusUpdate(s.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all duration-200 border
                      ${issue.status === s.key
                        ? 'bg-blue-600 text-white border-blue-600'
                        : `bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 ${s.color}`}`}>
                    {s.label}
                  </button>
                ))}

                {/* Resolve button — opens modal */}
                {issue.status !== 'resolved' && (
                  <button
                    onClick={() => setShowResolve(true)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all duration-200 flex items-center gap-1.5 hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 15px rgba(34,197,94,0.3)' }}
                  >
                    <CheckCircle size={13}/> Mark Resolved
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ✅ Before vs After section — shows when resolved */}
        {issue.status === 'resolved' && issue.resolvedImage && (
          <BeforeAfterSection issue={issue}/>
        )}

        {/* Comments section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            Comments
            <span className="text-xs font-normal bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {issue.comments?.length || 0}
            </span>
          </h2>

          <div className="space-y-3 mb-4">
            {issue.comments?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 dark:text-gray-500">No comments yet. Be the first!</p>
              </div>
            )}
            {issue.comments?.map((c, i) => {
              const isAuth = c.user?.role === 'authority' || c.user?.role === 'admin';
              return (
                <div key={i} className="flex gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm
                    ${isAuth ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {c.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 flex-1
                    ${isAuth ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50' : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700'}`}>
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-gray-800 dark:text-white">{c.user?.name || 'User'}</span>
                      {isAuth && (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                            <circle cx="12" cy="12" r="12" fill="#2563eb"/>
                            <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{c.user?.designation || 'Authority'}</span>
                        </>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleComment} className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-200"
            />
            <button type="submit" disabled={submitting || !comment.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 hover:scale-105">
              <Send size={16} className={submitting ? 'animate-pulse' : ''}/>
            </button>
          </form>
        </div>

      </div>

      {/* Resolve with proof modal */}
      {showResolve && (
        <ResolveModal
          issue={issue}
          onClose={() => setShowResolve(false)}
          onResolved={(updated) => {
            setIssue(updated);
            fetchIssue();
          }}
        />
      )}
    </div>
  );
};

export default IssueDetail;