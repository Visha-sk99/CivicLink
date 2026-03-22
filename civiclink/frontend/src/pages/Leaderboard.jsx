import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import API from '../api/axios';
import { Trophy, Star, TrendingDown } from 'lucide-react';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    API.get('/badges/leaderboard').then(r => setLeaders(r.data)).catch(console.error);
  }, []);

  const getBadge = (score, rank) => {
    if (rank === 0) return { label: '🥇 Quality Champion', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 50)  return { label: '🏅 Issue Resolver',   color: 'bg-green-100 text-green-800' };
    if (score < 0)   return { label: '⚠️ Issue Ignorer',     color: 'bg-red-100 text-red-700' };
    return { label: '📋 Active',  color: 'bg-blue-100 text-blue-700' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="text-yellow-500" size={24}/>
          <h1 className="text-2xl font-bold text-gray-800">Politician Leaderboard</h1>
        </div>

        <div className="space-y-3">
          {leaders.map((auth, i) => {
            const badge = getBadge(auth.reputationScore, i);
            return (
              <div key={auth._id}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4
                  ${i === 0 ? 'ring-2 ring-yellow-300' : ''}`}
              >
                <span className="text-2xl font-bold text-gray-300 w-8">#{i + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{auth.name}</p>
                  <p className="text-xs text-gray-400">{auth.designation} · {auth.constituency}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>{badge.label}</span>
                <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                  <Star size={14} className="text-yellow-400"/>
                  {auth.reputationScore}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;