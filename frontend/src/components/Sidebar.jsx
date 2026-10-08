import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  UserCheck, 
  Building2, 
  BriefcaseMedical, 
  Bot, 
  User, 
  LogOut, 
  Home, 
  ShieldCheck, 
  Users, 
  HeartPulse,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const patientNav = [
    { label: 'Patient Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Appointments', path: '/my-appointments', icon: Calendar },
    { label: 'Find Specialists', path: '/doctors', icon: UserCheck },
    { label: 'Departments', path: '/departments', icon: Building2 },
    { label: 'Hospital Services', path: '/services', icon: BriefcaseMedical },
    { label: 'Aura AI Assistant', path: '/chat', icon: Bot, badge: '24/7' },
    { label: 'Patient Profile', path: '/profile', icon: User },
  ];

  const adminNav = [
    { label: 'Admin Command', path: '/admin', icon: LayoutDashboard },
    { label: 'Appointments Control', path: '/admin?tab=appointments', icon: Calendar },
    { label: 'Manage Specialists', path: '/admin?tab=doctors', icon: UserCheck },
    { label: 'Departments Roster', path: '/admin?tab=departments', icon: Building2 },
    { label: 'Registered Patients', path: '/admin?tab=patients', icon: Users },
    { label: 'Clinical Services', path: '/admin?tab=services', icon: BriefcaseMedical },
  ];

  const navItems = isAdmin ? adminNav : patientNav;

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 min-h-screen flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <HeartPulse className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold text-white tracking-tight font-heading">
                Aura<span className="text-teal-400">Care</span>
              </span>
            </div>
            <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">
              {isAdmin ? 'Administration Portal' : 'Patient Portal'}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname + location.search === item.path || 
            (item.path.includes('?') && location.pathname === item.path.split('?')[0] && location.search === `?${item.path.split('?')[1]}`) ||
            (!item.path.includes('?') && location.pathname === item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md shadow-teal-600/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[9px] font-bold border border-teal-500/40">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          General
        </div>
        <Link
          to="/"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span>Hospital Main Site</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
        </button>
      </div>

      {/* User Quick Card & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white text-xs font-bold flex items-center justify-center shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate max-w-[110px]">
                {user?.name || 'Patient'}
              </p>
              <span className="text-[10px] text-teal-400 font-semibold uppercase">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
