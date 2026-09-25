import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import IssueCard from '../components/citizen/IssueCard';
import IssueForm from '../components/citizen/IssueForm';
import CustomDropdown from '../components/common/CustomDropdown';
import API from '../api/axios';
import socket from '../utils/socket';
import toast from 'react-hot-toast';
import { Plus, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = [
  { value: '',            label: 'All statuses' },
  { value: 'pending',     label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved',    label: 'Resolved' },
];

const CATEGORY_OPTIONS = [
  { value: '',            label: 'All types' },
  { value: 'pothole',     label: 'Pothole' },
  { value: 'water',       label: 'Water' },
  { value: 'garbage',     label: 'Garbage' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'other',       label: 'Other' },
];

const CitizenFeed = () => {
  const { user } = useAuth();
  const [issues, setIssues]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters]   = useState({ status: '', category: '', search: '' });

  const fetchIssues = useCallback(async () => {
    try {
      const params = {};
      if (filters.status)   params.status   = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.search)   params.search   = filters.search;
      const { data } = await API.get('/issues', { params });
      setIssues(data);
    } catch {
      toast.error('Could not load issues');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  useEffect(() => {
    socket.on('new_issue', (issue) => {
      setIssues(prev => [issue, ...prev]);
      toast('New issue reported nearby!', { icon: '📍' });
    });
    socket.on('issue_updated', (updated) => {
      setIssues(prev => prev.map(i => i._id === updated._id ? updated : i));
    });
    return () => { socket.off('new_issue'); socket.off('issue_updated'); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Search + Filter bar */}
        <div className="flex gap-2 mb-6">
          {/* Search input */}
          <div className="relative flex-1 group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200"/>
            <input
              placeholder="Search issues..."
              className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 dark:focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm"
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
            />
            {filters.search && (
              <button
                onClick={() => setFilters({...filters, search: ''})}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={14}/>
              </button>
            )}
          </div>

          {/* Custom dropdowns */}
          <CustomDropdown
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={v => setFilters({...filters, status: v})}
            type="status"
          />
          <CustomDropdown
            options={CATEGORY_OPTIONS}
            value={filters.category}
            onChange={v => setFilters({...filters, category: v})}
            type="category"
          />
        </div>

        {/* Active filters indicator */}
        {(filters.status || filters.category || filters.search) && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">Active filters:</span>
            {filters.status && (
              <span className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                {filters.status.replace('_', ' ')}
                <button onClick={() => setFilters({...filters, status: ''})}><X size={10}/></button>
              </span>
            )}
            {filters.category && (
              <span className="flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">
                {filters.category}
                <button onClick={() => setFilters({...filters, category: ''})}><X size={10}/></button>
              </span>
            )}
            <button
              onClick={() => setFilters({ status: '', category: '', search: '' })}
              className="text-xs text-red-500 hover:underline ml-auto"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Issue count */}
        {!loading && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            Showing {issues.length} issue{issues.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Issue feed */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"/>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"/>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"/>
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"/>
              </div>
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400"/>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No issues found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map(issue => (
              <IssueCard key={issue._id} issue={issue} onVote={fetchIssues} />
            ))}
          </div>
        )}
      </div>

      {/* Floating report button */}
      {user?.role === 'citizen' && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl px-5 py-3.5 shadow-lg shadow-blue-500/30 flex items-center gap-2 font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40"
        >
          <Plus size={20} /> Report Issue
        </button>
      )}

      {showForm && <IssueForm onClose={() => setShowForm(false)} onCreated={fetchIssues} />}
    </div>
  );
};

export default CitizenFeed;