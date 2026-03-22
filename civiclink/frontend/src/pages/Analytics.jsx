import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import API from '../api/axios';
import { CheckCircle, AlertTriangle, Clock, Users } from 'lucide-react';

const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm`}>
    <div className={`inline-flex p-2 rounded-xl mb-3 ${color}`}>{icon}</div>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
  </div>
);

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get('/analytics').then(r => setData(r.data)).catch(console.error);
  }, []);

  if (!data) return <div className="min-h-screen bg-gray-50"><Navbar/><div className="text-center py-20 text-gray-400">Loading analytics...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics Overview</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Issues"   value={data.total}       icon={<AlertTriangle size={18}/>} color="bg-blue-50 text-blue-600"/>
          <StatCard label="Resolved"       value={data.resolved}    icon={<CheckCircle size={18}/>}   color="bg-green-50 text-green-600"/>
          <StatCard label="In Progress"    value={data.inProgress}  icon={<Clock size={18}/>}         color="bg-yellow-50 text-yellow-600"/>
          <StatCard label="Satisfaction %" value={`${data.satisfactionRate}%`} icon={<Users size={18}/>} color="bg-purple-50 text-purple-600"/>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Issues by Category</h2>
          <div className="space-y-3">
            {data.byCategory.map(cat => (
              <div key={cat._id} className="flex items-center gap-3">
                <span className="w-24 text-sm capitalize text-gray-600">{cat._id}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min((cat.count / data.total) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8 text-right">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;