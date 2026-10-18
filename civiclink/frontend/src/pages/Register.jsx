import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const CONSTITUENCIES = ['vasai', 'virar', 'nalasopara', 'miraroad', 'bhayander'];

const Blob = ({ className }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
    animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
    transition={{ duration: 8, repeat: Infinity }}
  />
);

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
    <div className="min-h-screen bg-[#0B0F1A] text-[#F5EDD6] relative overflow-hidden flex items-center justify-center p-4">
      <Blob className="w-96 h-96 bg-[#E8714A] top-[-100px] left-[-100px]" />
      <Blob className="w-80 h-80 bg-[#7BAF7B] bottom-[-80px] right-[-80px]" />
      <Blob className="w-64 h-64 bg-[#C9A84C] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 border border-white/10">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#E8714A] to-[#C9A84C] flex items-center justify-center shadow-lg">
            <MapPin size={20} className="text-[#0B0F1A]"/>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#E8714A] to-[#C9A84C] bg-clip-text text-transparent">
            CivicLink
          </span>
        </div>

        <h1 className="text-xl font-semibold text-[#F5EDD6] mb-1">Create account</h1>
        <p className="text-sm text-[#F5EDD6]/60 mb-6">Join CivicLink to make your city better</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Full name"
            className="w-full bg-white/5 border border-white/10 text-[#F5EDD6] placeholder-[#F5EDD6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8714A]"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />

          <input
            type="email"
            required
            placeholder="Email address"
            className="w-full bg-white/5 border border-white/10 text-[#F5EDD6] placeholder-[#F5EDD6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8714A]"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
          />

          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Password (min 6 chars)"
              className="w-full bg-white/5 border border-white/10 text-[#F5EDD6] placeholder-[#F5EDD6]/40 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8714A]"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F5EDD6]/60 hover:text-[#F5EDD6]"
            >
              {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {['citizen', 'authority'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({...form, role: r, constituency: '', designation: ''})}
                className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all border ${
                  form.role === r
                    ? 'bg-gradient-to-r from-[#E8714A] to-[#C9A84C] text-[#0B0F1A] border-transparent font-bold'
                    : 'bg-white/5 text-[#F5EDD6]/70 border-white/10 hover:bg-white/10'
                }`}
              >
                {r === 'citizen' ? '👤 Citizen' : '🏛️ Authority'}
              </button>
            ))}
          </div>

          {form.role === 'authority' && (
            <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-[#C9A84C]/30">
              <p className="text-xs font-semibold text-[#C9A84C] uppercase tracking-wide">
                Authority Details
              </p>

              <input
                placeholder="Designation (e.g. MLA, Corporator)"
                className="w-full bg-white/5 border border-white/10 text-[#F5EDD6] placeholder-[#F5EDD6]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8714A]"
                value={form.designation}
                onChange={e => setForm({...form, designation: e.target.value})}
              />

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <MapPin size={14} className="text-[#E8714A]"/>
                </div>
                <select
                  required={form.role === 'authority'}
                  className="w-full pl-9 bg-[#131926] border border-white/10 text-[#F5EDD6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8714A]"
                  value={form.constituency}
                  onChange={e => setForm({...form, constituency: e.target.value})}
                >
                  <option value="">Select your constituency *</option>
                  {CONSTITUENCIES.map(c => (
                    <option key={c} value={c} className="bg-[#131926] text-[#F5EDD6]">
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-[#0B0F1A] font-bold bg-gradient-to-r from-[#E8714A] to-[#C9A84C] hover:opacity-95 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-[#F5EDD6]/60 mt-5">
          Have an account?{' '}
          <Link to="/login" className="text-[#E8714A] hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;