import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartPulse, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      showToast("Welcome Back", `Signed in as ${user.name}`, "success");
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Luxury Branding Panel */}
        <div className="bg-gradient-to-br from-slate-950 via-sky-950 to-teal-950 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-lg">
                <HeartPulse className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight font-heading">
                Aura<span className="text-teal-400">Care</span>
              </span>
            </Link>

            <div className="mt-12 space-y-4">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/40">
                Secure Patient & Staff Portal
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading leading-tight">
                Access Your Medical Records & Appointments
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Log in to securely consult your appointments, view specialist recommendations, communicate with Aura AI, and update health profiles.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-teal-400">
              <ShieldCheck className="w-4 h-4" /> 256-bit Encrypted
            </span>
            <span>HIPAA Compliant</span>
          </div>
        </div>

        {/* Right Side: Login Form & One-Click Demo Buttons */}
        <div className="p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-heading">
              Sign In to Your Account
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your authorized email and password below
            </p>

            {/* Quick Demo Access Bar */}
            <div className="mt-6 p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 mb-2">
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span>Instant Demo Login (One Click):</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('patient@hospital.com', 'patient123')}
                  className="px-3 py-2 rounded-xl bg-white border border-teal-300 hover:bg-teal-100 text-slate-800 font-bold shadow-2xs text-left transition-colors"
                >
                  <span className="block text-[10px] text-teal-700 font-semibold uppercase">Patient Demo</span>
                  patient@hospital.com
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin@hospital.com', 'admin123')}
                  className="px-3 py-2 rounded-xl bg-white border border-teal-300 hover:bg-teal-100 text-slate-800 font-bold shadow-2xs text-left transition-colors"
                >
                  <span className="block text-[10px] text-teal-700 font-semibold uppercase">Admin Demo</span>
                  admin@hospital.com
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-600 via-teal-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-teal-600 hover:underline">
              Create a Patient Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
