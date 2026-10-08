import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HeartPulse, 
  PhoneCall, 
  Calendar, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Bell, 
  ChevronDown,
  LayoutDashboard,
  Stethoscope,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ onOpenBooking }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Specialists', path: '/doctors' },
    { label: 'Departments', path: '/departments' },
    { label: 'Hospital Services', path: '/services' },
    { label: 'Aura AI Concierge', path: '/chat', badge: 'AI' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Emergency & Accreditation Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-status-pulse inline-block" />
            24/7 Emergency Trauma & Ambulance:
          </div>
          <a href="tel:18002872227" className="text-white font-bold hover:underline tracking-wide">
            1-800-AURACARE / 911
          </a>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">Ground Floor Wing A, 100 Medical Center Blvd</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400">
          <span className="hidden sm:inline flex items-center gap-1 text-teal-400">
            <ShieldCheck className="w-3.5 h-3.5" /> JCI Gold Seal Certified
          </span>
          <span className="hidden lg:inline text-slate-300">Visiting Hours: 10AM-12PM & 4PM-7PM</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-heading">
                Aura<span className="text-teal-600">Care</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-teal-50 text-teal-700 border border-teal-200">
                Health
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 tracking-wider uppercase -mt-0.5">
              Medical & Surgical Center
            </p>
          </div>
        </Link>

        {/* Center Desktop Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all relative flex items-center gap-1.5 ${
                  isActive
                    ? 'text-teal-700 bg-teal-50/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="px-1.5 py-0.2 text-[10px] font-extrabold uppercase rounded-full bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-xs">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Account Area */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {isAuthenticated ? (
            <>
              {/* Notification Bell Dropdown */}
              <NotificationDropdown />

              {/* Portal Quick Link */}
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4 text-teal-600" />
                {isAdmin ? 'Admin Panel' : 'My Dashboard'}
              </Link>

              {/* User Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-teal-400 transition-all bg-white"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-teal-600 uppercase font-semibold">
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to={isAdmin ? '/admin' : '/dashboard'}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </Link>
                    {!isAdmin && (
                      <Link
                        to="/my-appointments"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Calendar className="w-4 h-4 text-slate-400" />
                        My Appointments
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Patient Profile
                    </Link>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-teal-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-xl hover:border-slate-800 transition-colors"
              >
                Register
              </Link>
            </>
          )}

          {/* Book Appointment CTA Button */}
          <button
            onClick={() => {
              if (onOpenBooking) onOpenBooking();
              else navigate('/doctors');
            }}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-600 via-teal-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 shadow-md shadow-teal-600/20 hover:shadow-teal-600/30 transition-all flex items-center gap-2 transform active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            Book Appointment
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          {isAuthenticated && <NotificationDropdown />}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-sm font-bold text-slate-800 hover:text-teal-600 flex items-center justify-between"
              >
                {link.label}
                {link.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-500 text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          
          <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-slate-100 text-slate-800"
                >
                  {isAdmin ? 'Admin Dashboard' : 'Patient Dashboard'}
                </Link>
                <Link
                  to="/my-appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold rounded-xl border border-slate-200 text-slate-800"
                >
                  My Appointments
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold rounded-xl text-rose-600 bg-rose-50"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold rounded-xl border border-slate-200 text-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold rounded-xl bg-teal-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenBooking) onOpenBooking();
                else navigate('/doctors');
              }}
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-600 to-teal-500 shadow-md flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
