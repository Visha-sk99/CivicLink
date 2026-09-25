import { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { X, MapPin } from 'lucide-react';

const CATEGORIES      = ['pothole', 'water', 'garbage', 'electricity', 'other'];
const CONSTITUENCIES  = ['vasai', 'virar', 'nalasopara', 'miraroad', 'bhayander'];

const IssueForm = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    title:        '',
    description:  '',
    category:     'pothole',
    constituency: '',
  });
  const [files,   setFiles]   = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.constituency) {
      toast.error('Please select your area/constituency');
      return;
    }
    setLoading(true);

    const data = new FormData();
    data.append('title',        form.title);
    data.append('description',  form.description);
    data.append('category',     form.category);
    data.append('constituency', form.constituency);
    data.append('coordinates',  JSON.stringify([0, 0]));
    data.append('address',      form.constituency);
    files.forEach(f => data.append('media', f));

    try {
      await API.post('/issues', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Issue reported! Authorities in your area have been notified 📍');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Report an Issue</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required placeholder="Issue title"
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={form.title} onChange={e => setForm({...form, title: e.target.value})}
          />

          <select
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>

          {/* Constituency dropdown */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <MapPin size={15} className="text-blue-400"/>
            </div>
            <select
              required
              className="w-full pl-9 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={form.constituency}
              onChange={e => setForm({...form, constituency: e.target.value})}>
              <option value="">Select your area / constituency</option>
              {CONSTITUENCIES.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          {form.constituency && (
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-xl border border-blue-100 dark:border-blue-800">
              <MapPin size={12}/>
              Authorities in <strong className="capitalize ml-1">{form.constituency}</strong> will be notified
            </div>
          )}

          <textarea
            required rows={3} placeholder="Describe the issue..."
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})}
          />

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Attach photos/videos (max 5)
            </label>
            <input
              type="file" multiple accept="image/*,video/*"
              onChange={e => setFiles(Array.from(e.target.files).slice(0, 5))}
              className="text-sm text-gray-500 dark:text-gray-400"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit Issue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueForm;