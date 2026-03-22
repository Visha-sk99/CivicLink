import { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const CATEGORIES = ['pothole', 'water', 'garbage', 'electricity', 'other'];

const IssueForm = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', description: '', category: 'pothole', address: '' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Get user's current location from browser
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const coords = [pos.coords.longitude, pos.coords.latitude];
      const data = new FormData();
      data.append('title',       form.title);
      data.append('description', form.description);
      data.append('category',    form.category);
      data.append('coordinates', JSON.stringify(coords));
      data.append('address',     form.address);
      files.forEach(f => data.append('media', f));

      try {
        await API.post('/issues', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Issue reported successfully!');
        onCreated();
        onClose();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to post issue');
      } finally {
        setLoading(false);
      }
    }, () => {
      toast.error('Please allow location access');
      setLoading(false);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Report an Issue</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required placeholder="Issue title"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={form.title} onChange={e => setForm({...form, title: e.target.value})}
          />

          <select
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={form.category} onChange={e => setForm({...form, category: e.target.value})}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>

          <textarea
            required rows={3} placeholder="Describe the issue..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})}
          />

          <input
            placeholder="Address / landmark (optional)"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={form.address} onChange={e => setForm({...form, address: e.target.value})}
          />

          <div>
            <label className="block text-xs text-gray-500 mb-1">Attach photos/videos (max 5)</label>
            <input
              type="file" multiple accept="image/*,video/*"
              onChange={e => setFiles(Array.from(e.target.files).slice(0, 5))}
              className="text-sm text-gray-500"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Submit Issue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueForm;