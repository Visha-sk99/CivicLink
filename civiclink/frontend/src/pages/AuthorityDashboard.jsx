import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import StatusBadge from '../components/common/StatusBadge';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, AlertTriangle, Eye, MapPin } from 'lucide-react';

const TABS = [
  { key: 'all',         label: 'All',         icon: <AlertTriangle size={14}/> },
  { key: 'my_area',     label: 'My Area 📍',  icon: <MapPin size={14}/> },
  { key: 'pending',     label: 'Pending',      icon: <Clock size={14}/> },
  { key: 'in_progress', label: 'In Progress',  icon: <Clock size={14}/> },
  { key: 'resolved',    label: 'Resolved',     icon: <CheckCircle size={14}/> },
];

const AuthorityDashboard = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [issues,    setIssues]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab === 'my_area') {
        params.constituency = user?.constituency;
      } else if (activeTab !== 'all') {
        params.status = activeTab;
      }
      const { data } = await API.get('/issues', { params });
      setIssues(data);
    } catch {
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [activeTab, user]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const takeCharge = async (id) => {
    try {
      await API.put(`/issues/${id}/take-charge`);
      toast.success('You have taken charge of this issue');
      fetchIssues();
    } catch {
      toast.error('Failed to take charge');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Authority Dashboard
          </h1>
          {user?.constituency && (
            <div className="flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800">
              <MapPin size={12}/>
              <span className="capitalize font-medium">{user.constituency}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors
                ${activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* My Area info banner */}
        {activeTab === 'my_area' && user?.constituency && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <MapPin size={15} className="text-blue-500"/>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Showing issues from your constituency:
              <strong className="capitalize ml-1">{user.constituency}</strong>
            </p>
          </div>
        )}

        {/* Issues table */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"/>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"/>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"/>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                <tr>
                  {['Issue', 'Area', 'Category', 'Status', 'Raised by', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {issues.map((issue, i) => (
                  <tr
                    key={issue._id}
                    className={`border-b border-gray-50 dark:border-gray-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors
                      ${i % 2 === 0 ? '' : 'bg-gray-50/30 dark:bg-gray-700/20'}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white max-w-xs truncate">
                      {issue.title}
                      {/* My area badge */}
                      {issue.constituency === user?.constituency && (
                        <span className="ml-2 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-semibold">
                          Your area
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-lg">
                        {issue.constituency || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-500 dark:text-gray-400">
                      {issue.category}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={issue.status}/>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {issue.raisedBy?.name}
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/issue/${issue._id}`)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <Eye size={12}/> View
                        </button>
                        {issue.status === 'pending' && !issue.assignedTo && (
                          <button
                            onClick={() => takeCharge(issue._id)}
                            className="flex items-center gap-1 text-xs text-green-600 hover:underline font-semibold"
                          >
                            Take charge
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {issues.length === 0 && (
              <div className="text-center py-12">
                <MapPin size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2"/>
                <p className="text-gray-400 dark:text-gray-500 font-medium">
                  {activeTab === 'my_area'
                    ? `No issues in ${user?.constituency || 'your area'} yet`
                    : 'No issues in this category'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;