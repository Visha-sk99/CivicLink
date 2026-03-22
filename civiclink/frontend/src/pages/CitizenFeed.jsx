import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import IssueCard from '../components/citizen/IssueCard';
import IssueForm from '../components/citizen/IssueForm';
import API from '../api/axios';
import socket from '../utils/socket';
import toast from 'react-hot-toast';
import { Plus, Search, Filter } from 'lucide-react';

const STATUSES = ['', 'pending', 'in_progress', 'resolved'];
const CATEGORIES = ['', 'pothole', 'water', 'garbage', 'electricity', 'other'];

const CitizenFeed = () => {
  const [issues, setIssues]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });

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

  // Listen for real-time new issues
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Search + Filter bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-gray-400"/>
            <input
              placeholder="Search issues..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
            value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All statuses'}</option>)}
          </select>
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
            value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All types'}</option>)}
          </select>
        </div>

        {/* Issue feed */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading issues...</div>
        ) : issues.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No issues found. Be the first to report one!</div>
        ) : (
          <div className="space-y-4">
            {issues.map(issue => (
              <IssueCard key={issue._id} issue={issue} onVote={fetchIssues} />
            ))}
          </div>
        )}
      </div>

      {/* Floating report button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center gap-2 font-semibold transition-colors"
      >
        <Plus size={20} /> Report Issue
      </button>

      {showForm && <IssueForm onClose={() => setShowForm(false)} onCreated={fetchIssues} />}
    </div>
  );
};

export default CitizenFeed;