import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import StatusBadge from '../components/common/StatusBadge';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, AlertTriangle, Eye } from 'lucide-react';

const AuthorityDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const fetchIssues = async () => {
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const { data } = await API.get('/issues', { params });
      setIssues(data);
    } catch { toast.error('Failed to load issues'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchIssues(); }, [activeTab]);

  const takeCharge = async (id) => {
    try {
      await API.put(`/issues/${id}/take-charge`);
      toast.success('You have taken charge of this issue');
      fetchIssues();
    } catch { toast.error('Failed to take charge'); }
  };

  const TABS = [
    { key: 'all',         label: 'All',         icon: <AlertTriangle size={14}/> },
    { key: 'pending',     label: 'Pending',      icon: <Clock size={14}/> },
    { key: 'in_progress', label: 'In Progress',  icon: <Clock size={14}/> },
    { key: 'resolved',    label: 'Resolved',     icon: <CheckCircle size={14}/> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Authority Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors
                ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Issues table */}
        {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Issue', 'Category', 'Status', 'Raised by', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {issues.map((issue, i) => (
                  <tr key={issue._id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{issue.title}</td>
                    <td className="px-4 py-3 capitalize text-gray-500">{issue.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={issue.status}/></td>
                    <td className="px-4 py-3 text-gray-500">{issue.raisedBy?.name}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(issue.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/issue/${issue._id}`)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          <Eye size={12}/> View
                        </button>
                        {issue.status === 'pending' && !issue.assignedTo && (
                          <button onClick={() => takeCharge(issue._id)}
                            className="flex items-center gap-1 text-xs text-green-600 hover:underline font-semibold">
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
              <div className="text-center py-12 text-gray-400">No issues in this category.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;