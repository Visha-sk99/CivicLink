import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdLocationPin,
  MdCameraAlt,
  MdNotificationsActive,
  MdLeaderboard,
  MdBarChart,
  MdGroups
} from 'react-icons/md';

const Blob = ({ className }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
    animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
    transition={{ duration: 8, repeat: Infinity }}
  />
);

const features = [
  { icon: MdCameraAlt, title: 'Report with Photo', desc: 'Snap and submit civic issues in seconds.' },
  { icon: MdNotificationsActive, title: 'Real-Time Updates', desc: 'Get notified the moment your issue moves forward.' },
  { icon: MdGroups, title: 'Citizen & Authority Roles', desc: 'Built for both reporters and resolvers.' },
  { icon: MdBarChart, title: 'Live Analytics', desc: 'See category trends and resolution stats.' },
  { icon: MdLeaderboard, title: 'Leaderboard', desc: 'Authorities ranked by issues resolved.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#F5EDD6] relative overflow-hidden">
      {/* Background blobs */}
      <Blob className="w-96 h-96 bg-[#E8714A] top-[-120px] left-[-100px]" />
      <Blob className="w-80 h-80 bg-[#7BAF7B] bottom-[-80px] right-[-80px]" />
      <Blob className="w-64 h-64 bg-[#C9A84C] top-1/3 left-1/2 -translate-x-1/2" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-[#E8714A] to-[#C9A84C]">
            <MdLocationPin size={22} color="#0B0F1A" />
          </div>
          <span className="text-xl font-bold">CivicLink</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition text-sm font-medium"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E8714A] to-[#C9A84C] text-[#0B0F1A] text-sm font-bold hover:opacity-90 transition"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-24">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold max-w-3xl leading-tight"
        >
          Report. Track. Resolve.{' '}
          <span className="bg-gradient-to-r from-[#E8714A] to-[#C9A84C] bg-clip-text text-transparent">
            Together.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 text-lg text-[#F5EDD6]/70 max-w-xl"
        >
          CivicLink connects citizens and local authorities in real time —
          report civic issues, track their progress, and build a better community.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex gap-4"
        >
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#E8714A] to-[#C9A84C] text-[#0B0F1A] font-bold hover:opacity-90 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition font-medium"
          >
            I already have an account
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-16 pb-24">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Everything you need to make your city better
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
            >
              <Icon size={28} className="text-[#E8714A] mb-3" />
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-[#F5EDD6]/60">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-sm text-[#F5EDD6]/40 border-t border-white/10">
        © {new Date().getFullYear()} CivicLink — Built for citizens, by citizens.
      </footer>
    </div>
  );
}