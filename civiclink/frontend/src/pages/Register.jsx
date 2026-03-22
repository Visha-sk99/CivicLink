import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = ['citizen', 'authority'];

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'citizen', constituency: '', designation: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data);
      toast.success('Account created!');
      navigate(data.role === 'authority' ? '/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-1">Create account</h1>
        <p className="text-sm text-gray-400 mb-6">Join CivicLink to make your city better</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Full name"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
          <input type="email" required placeholder="Email"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>
          <input type="password" required placeholder="Password (min 6 chars)"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})}/>

          <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>

          {/* Extra fields for government authorities */}
          {form.role === 'authority' && <>
            <input placeholder="Designation (e.g. MLA, Corporator)"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={form.designation} onChange={e => setForm({...form, designation: e.target.value})}/>
            <input placeholder="Constituency"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={form.constituency} onChange={e => setForm({...form, constituency: e.target.value})}/>
          </>}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;