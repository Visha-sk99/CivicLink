import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import StatusBadge from '../components/common/StatusBadge';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Shield, FileText, Activity,
  ThumbsUp, ThumbsDown, CheckCircle, Clock,
  TrendingUp, ChevronRight, Filter, ClipboardList
} from 'lucide-react';

const roleColors = {
  citizen:   'bg-[#7BAF7B]/15 text-[#7BAF7B] border border-[#7BAF7B]/30',
  authority: 'bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30',
  admin:     'bg-[#E8714A]/15 text-[#E8714A] border border-[#E8714A]/30',
};

const actionConfig = {
  CREATE_ISSUE: {
    icon:  <FileText size={14}/>,
    label: 'Created issue',
    color: 'bg-[#E8714A]/15 text-[#E8714A] border border-[#E8714A]/30',
    dot:   'bg-[#E8714A]',
  },
  UPVOTE: {
    icon:  <ThumbsUp size={14}/>,
    label: 'Upvoted issue',
    color: 'bg-[#7BAF7B]/15 text-[#7BAF7B] border border-[#7BAF7B]/30',
    dot:   'bg-[#7BAF7B]',
  },
  DOWNVOTE: {
    icon:  <ThumbsDown size={14}/>,
    label: 'Downvoted issue',
    color: 'bg-red-500/15 text-red-400 border border-red-500/30',
    dot:   'bg-red-500',
  },
};

const categoryColors = {
  pothole:     'text-[#E8714A] bg-[#E8714A]/10 border border-[#E8714A]/30',
  water:       'text-[#7BAF7B] bg-[#7BAF7B]/10 border border-[#7BAF7B]/30',
  garbage:     'text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30',
  electricity: 'text-[#E8714A] bg-[#E8714A]/10 border border-[#E8714A]/30',
  other:       'text-[#F5EDD6]/80 bg-white/5 border border-white/10',
};

const IssueRow = ({ issue, onClick }) => (
  <div
    onClick={onClick}
    className="bg-[#131926] rounded-2xl border border-white/10 p-4 flex items-center gap-4 hover:border-[#E8714A]/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
  >
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 ${categoryColors[issue.category] || categoryColors.other}`}>
      {issue.category}
    </span>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-[#F5EDD6] truncate group-hover:text-[#E8714A] transition-colors">
        {issue.title}
      </p>
      <p className="text-xs text-[#F5EDD6]/50 mt-0.5">
        {new Date(issue.resolvedAt || issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <span className="flex items-center gap-1 text-xs text-[#7BAF7B]">
        <ThumbsUp size={12}/> {issue.upvotes}
      </span>
      <span className="flex items-center gap-1 text-xs text-red-400">
        <ThumbsDown size={12}/> {issue.downvotes}
      </span>
    </div>
    <StatusBadge status={issue.status}/>
    <ChevronRight size={16} className="text-[#F5EDD6]/40 group-hover:text-[#E8714A] transition-colors shrink-0"/>
  </div>
);

const Profile = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [activeTab,   setActiveTab]   = useState('');
  const [profileData, setProfileData] = useState(null);
  const [activities,  setActivities]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [actLoading,  setActLoading]  = useState(false);
  const [actFilter,   setActFilter]   = useState('ALL');

  useEffect(() => {
    API.get('/profile/me')
      .then(r => setProfileData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab !== 'activity') return;
    setActLoading(true);
    const params = actFilter !== 'ALL' ? `?filter=${actFilter}` : '';
    API.get(`/profile/my-activity${params}`)
      .then(r => setActivities(r.data))
      .catch(console.error)
      .finally(() => setActLoading(false));
  }, [activeTab, actFilter]);

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#F5EDD6]">
      <Navbar/>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-[#131926] rounded-2xl p-6 border border-white/10 animate-pulse mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10"/>
            <div className="flex-1">
              <div className="h-5 bg-white/10 rounded w-1/3 mb-2"/>
              <div className="h-4 bg-white/10 rounded w-1/2"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const {
    postedIssues   = [],
    resolvedIssues = [],
    assignedIssues = [],
    stats          = {},
    isAuthority    = false,
  } = profileData || {};

  const tabs = isAuthority
    ? [
        { key: 'resolved',  label: 'Resolved Issues', icon: <CheckCircle size={14}/>,   count: stats.resolved },
        { key: 'assigned',  label: 'All Assigned',    icon: <ClipboardList size={14}/>,  count: stats.totalAssigned },
        { key: 'activity',  label: 'My Activity',     icon: <Activity size={14}/> },
      ]
    : [
        { key: 'issues',    label: 'My Issues',       icon: <FileText size={14}/>,       count: stats.totalIssues },
        { key: 'activity',  label: 'My Activity',     icon: <Activity size={14}/> },
      ];

  const validTabs  = tabs.map(t => t.key);
  const defaultTab = validTabs[0];
  const currentTab = validTabs.includes(activeTab) ? activeTab : defaultTab;

  const statsRow = isAuthority
    ? [
        { label: 'Issues Resolved',  value: stats.resolved       || 0, icon: <CheckCircle size={14}/>,   color: 'text-[#7BAF7B]' },
        { label: 'Total Assigned',   value: stats.totalAssigned  || 0, icon: <ClipboardList size={14}/>,  color: 'text-[#C9A84C]' },
        { label: 'Upvotes Given',    value: stats.totalUpvotes   || 0, icon: <ThumbsUp size={14}/>,       color: 'text-[#7BAF7B]' },
        { label: 'Downvotes Given',  value: stats.totalDownvotes || 0, icon: <ThumbsDown size={14}/>,     color: 'text-red-400' },
      ]
    : [
        { label: 'Issues Posted',    value: stats.totalIssues    || 0, icon: <FileText size={14}/>,       color: 'text-[#E8714A]' },
        { label: 'Resolved',         value: stats.resolved       || 0, icon: <CheckCircle size={14}/>,   color: 'text-[#7BAF7B]' },
        { label: 'Upvotes Given',    value: stats.totalUpvotes   || 0, icon: <ThumbsUp size={14}/>,       color: 'text-[#7BAF7B]' },
        { label: 'Downvotes Given',  value: stats.totalDownvotes || 0, icon: <ThumbsDown size={14}/>,     color: 'text-red-400' },
      ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#F5EDD6] transition-colors duration-200">
      <Navbar/>
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Profile header card */}
        <div className="bg-[#131926] rounded-2xl border border-white/10 shadow-xl p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#E8714A] to-[#C9A84C] flex items-center justify-center text-[#0B0F1A] text-2xl font-bold shadow-lg shadow-[#E8714A]/20 shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-[#F5EDD6]">{user?.name}</h1>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[user?.role] || roleColors.citizen}`}>
                  <Shield size={10}/>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
                {isAuthority && profileData?.user?.designation && (
                  <span className="text-xs text-[#F5EDD6]/70 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                    {profileData.user.designation} · {profileData.user.constituency}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-[#F5EDD6]/60 mb-2">
                <Mail size={13}/> {user?.email}
              </div>
              <div className="flex items-center gap-1 text-xs text-[#F5EDD6]/40">
                <Clock size={12}/>
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10">
            {statsRow.map(s => (
              <div key={s.label} className="text-center">
                <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
                <p className="text-xl font-bold text-[#F5EDD6]">{s.value}</p>
                <p className="text-xs text-[#F5EDD6]/50 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                currentTab === tab.key
                  ? 'bg-gradient-to-r from-[#E8714A] to-[#C9A84C] text-[#0B0F1A] border-transparent shadow-lg shadow-[#E8714A]/20'
                  : 'bg-white/5 text-[#F5EDD6]/70 border-white/10 hover:bg-white/10 hover:text-[#F5EDD6]'
              }`}
            >
              {tab.icon} {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ml-1 ${
                  currentTab === tab.key ? 'bg-[#0B0F1A]/20 text-[#0B0F1A]' : 'bg-white/10 text-[#F5EDD6]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Resolved Issues (Authority) */}
        {currentTab === 'resolved' && (
          <div className="space-y-3">
            {resolvedIssues.length === 0 ? (
              <div className="text-center py-16 bg-[#131926] rounded-2xl border border-white/10">
                <CheckCircle size={22} className="text-[#F5EDD6]/40 mx-auto mb-3"/>
                <p className="font-medium text-[#F5EDD6]/70">No resolved issues yet</p>
              </div>
            ) : resolvedIssues.map(issue => (
              <IssueRow key={issue._id} issue={issue} onClick={() => navigate(`/issue/${issue._id}`)}/>
            ))}
          </div>
        )}

        {/* Tab: All Assigned (Authority) */}
        {currentTab === 'assigned' && (
          <div className="space-y-3">
            {assignedIssues.length === 0 ? (
              <div className="text-center py-16 bg-[#131926] rounded-2xl border border-white/10">
                <ClipboardList size={22} className="text-[#F5EDD6]/40 mx-auto mb-3"/>
                <p className="font-medium text-[#F5EDD6]/70">No assigned issues yet</p>
              </div>
            ) : assignedIssues.map(issue => (
              <IssueRow key={issue._id} issue={issue} onClick={() => navigate(`/issue/${issue._id}`)}/>
            ))}
          </div>
        )}

        {/* Tab: My Issues (Citizen) */}
        {currentTab === 'issues' && (
          <div className="space-y-3">
            {postedIssues.length === 0 ? (
              <div className="text-center py-16 bg-[#131926] rounded-2xl border border-white/10">
                <FileText size={22} className="text-[#F5EDD6]/40 mx-auto mb-3"/>
                <p className="font-medium text-[#F5EDD6]/70">No issues posted yet</p>
                <p className="text-sm text-[#F5EDD6]/50 mt-1">Report a civic issue to get started</p>
              </div>
            ) : postedIssues.map(issue => (
              <IssueRow key={issue._id} issue={issue} onClick={() => navigate(`/issue/${issue._id}`)}/>
            ))}
          </div>
        )}

        {/* Tab: Activity */}
        {currentTab === 'activity' && (
          <div>
            {/* Filter bar */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Filter size={14} className="text-[#F5EDD6]/50"/>
              <span className="text-xs text-[#F5EDD6]/50">Filter:</span>
              {['ALL', 'CREATE_ISSUE', 'UPVOTE', 'DOWNVOTE'].map(f => (
                <button
                  key={f}
                  onClick={() => setActFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all duration-200 border ${
                    actFilter === f
                      ? 'bg-gradient-to-r from-[#E8714A] to-[#C9A84C] text-[#0B0F1A] border-transparent'
                      : 'bg-white/5 text-[#F5EDD6]/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f === 'CREATE_ISSUE' ? '📝 Created' : f === 'UPVOTE' ? '👍 Upvoted' : '👎 Downvoted'}
                </button>
              ))}
            </div>

            {actLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-[#131926] rounded-2xl p-4 border border-white/10 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10"/>
                      <div className="flex-1">
                        <div className="h-4 bg-white/10 rounded w-2/3 mb-2"/>
                        <div className="h-3 bg-white/10 rounded w-1/3"/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-16 bg-[#131926] rounded-2xl border border-white/10">
                <TrendingUp size={22} className="text-[#F5EDD6]/40 mx-auto mb-3"/>
                <p className="font-medium text-[#F5EDD6]/70">No activity yet</p>
                <p className="text-sm text-[#F5EDD6]/50 mt-1">Your votes and posts will appear here</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-white/10"/>
                <div className="space-y-3">
                  {activities.map((act, i) => {
                    const config = actionConfig[act.actionType] || actionConfig.CREATE_ISSUE;
                    return (
                      <div
                        key={act._id || i}
                        onClick={() => act.issue?._id && navigate(`/issue/${act.issue._id}`)}
                        className="relative flex items-start gap-4 pl-12 group cursor-pointer"
                      >
                        <div className={`absolute left-3.5 top-3 w-3 h-3 rounded-full border-2 border-[#0B0F1A] ${config.dot}`}/>
                        <div className="flex-1 bg-[#131926] rounded-2xl border border-white/10 shadow-sm p-4 hover:border-[#E8714A]/40 hover:-translate-y-0.5 transition-all duration-200">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg mb-2 ${config.color}`}>
                                {config.icon} {config.label}
                              </span>
                              <p className="text-sm font-medium text-[#F5EDD6] truncate group-hover:text-[#E8714A] transition-colors">
                                {act.issue?.title || 'Issue deleted'}
                              </p>
                              {act.issue?.category && (
                                <span className={`inline-block text-xs px-2 py-0.5 rounded-lg mt-1 ${categoryColors[act.issue.category] || ''}`}>
                                  {act.issue.category}
                                </span>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs text-[#F5EDD6]/50">
                                {new Date(act.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                              <p className="text-xs text-[#F5EDD6]/40 mt-0.5">
                                {new Date(act.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {act.issue?.status && (
                                <div className="mt-1">
                                  <StatusBadge status={act.issue.status}/>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;