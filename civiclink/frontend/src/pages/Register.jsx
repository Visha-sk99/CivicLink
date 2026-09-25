import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Eye, EyeOff } from 'lucide-react';

const CONSTITUENCIES = ['vasai', 'virar', 'nalasopara', 'miraroad', 'bhayander'];

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'citizen', constituency: '', designation: ''
  });
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.role === 'authority' && !form.constituency) {
      toast.error('Please select your constituency');
      return;
    }
    setLoading(true);
    try {
      // Only send constituency for authority
      const payload = {
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     form.role,
        ...(form.role === 'authority' && {
          constituency: form.constituency,
          designation:  form.designation,
        }),
      };
      const { data } = await API.post('/auth/register', payload);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl w-full max-w-md p-8 border border-gray-100 dark:border-gray-700">

        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <MapPin size={18} className="text-white"/>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CivicLink
          </span>
        </div>

        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Create account</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Join CivicLink to make your city better</p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <input
            required placeholder="Full name"
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />

          {/* Email */}
          <input
            type="email" required placeholder="Email"
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
          />

          {/* Password with show/hide */}
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              required placeholder="Password (min 6 chars)"
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2">
            {['citizen', 'authority'].map(r => (
              <button
                key={r} type="button"
                onClick={() => setForm({...form, role: r, constituency: '', designation: ''})}
                className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all border
                  ${form.role === r
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
              >
                {r === 'citizen' ? '👤 Citizen' : '🏛️ Authority'}
              </button>
            ))}
          </div>

          {/* Authority-only fields */}
          {form.role === 'authority' && (
            <div className="space-y-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                Authority Details
              </p>

              <input
                placeholder="Designation (e.g. MLA, Corporator)"
                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={form.designation}
                onChange={e => setForm({...form, designation: e.target.value})}
              />

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <MapPin size={14} className="text-purple-400"/>
                </div>
                <select
                  required={form.role === 'authority'}
                  className="w-full pl-9 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  value={form.constituency}
                  onChange={e => setForm({...form, constituency: e.target.value})}
                >
                  <option value="">Select your constituency *</option>
                  {CONSTITUENCIES.map(c => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {form.constituency && (
                <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <MapPin size={11}/>
                  You will receive notifications for issues in
                  <strong className="capitalize ml-0.5">{form.constituency}</strong>
                </p>
              )}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-5">
          Have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;