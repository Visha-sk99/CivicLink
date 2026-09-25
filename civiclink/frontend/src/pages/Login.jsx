import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdLocationPin
} from 'react-icons/md';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Animated blob
const Blob = ({ className }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
    animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
    transition={{ duration: 8, repeat: Infinity }}
  />
);

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [focus, setFocus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await API.post('/auth/login', form);
      login(data);

      toast.success(`Welcome back, ${data.name} 👋`);
      navigate(data.role === 'authority' ? '/dashboard' : '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816] relative overflow-hidden">

      {/* Background */}
      <Blob className="w-96 h-96 bg-blue-600 top-[-100px] left-[-100px]" />
      <Blob className="w-80 h-80 bg-purple-600 bottom-[-80px] right-[-80px]" />
      <Blob className="w-64 h-64 bg-indigo-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
      >

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-r from-blue-500 to-purple-600">
            <MdLocationPin size={28} color="white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            CivicLink
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Smart Civic Issue Reporting
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl text-red-300 bg-red-500/10 border border-red-500/20"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div className="relative">
            <MdEmail className="absolute top-3.5 left-3 text-white/40" />
            <input
              type="email"
              required
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocus('email')}
              onBlur={() => setFocus('')}
              className="w-full pl-10 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <MdLock className="absolute top-3.5 left-3 text-white/40" />
            <input
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <span
              onClick={() => setShowPass(!showPass)}
              className="absolute top-3.5 right-3 text-white/40 cursor-pointer"
            >
              {showPass ? <MdVisibilityOff /> : <MdVisibility />}
            </span>
          </div>

          {/* Forgot */}
          <div className="text-right text-sm text-indigo-400 hover:underline cursor-pointer">
            Forgot password?
          </div>

          {/* Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 rounded-xl text-white font-bold bg-gradient-to-r from-blue-500 to-purple-600"
          >
            {loading ? 'Signing in...' : 'Login'}
          </motion.button>
        </form>

        {/* Register */}
        <p className="text-center text-white/40 text-sm mt-5">
          No account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}