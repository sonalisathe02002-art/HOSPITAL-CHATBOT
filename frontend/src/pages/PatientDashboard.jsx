import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Bot, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  PhoneCall, 
  Building2, 
  ArrowRight, 
  Sparkles, 
  Heart,
  Droplet,
  ShieldCheck,
  RefreshCw,
  XCircle,
  Stethoscope
} from 'lucide-react';
import { appointmentAPI, serviceAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import RescheduleModal from '../components/RescheduleModal';

const PatientDashboard = ({ onOpenBooking }) => {
  const { user } = useAuth();
  const { showToast, fetchNotifications } = useNotifications();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleApt, setRescheduleApt] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [aptRes, srvRes] = await Promise.all([
        appointmentAPI.getMy(),
        serviceAPI.getAll({ featured_only: true })
      ]);
      setAppointments(aptRes.data);
      setServices(srvRes.data);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelAppointment = async (aptId) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled appointment?")) {
      return;
    }
    try {
      await appointmentAPI.cancel(aptId);
      showToast("Appointment Cancelled", "Your booking has been successfully cancelled.", "info");
      fetchNotifications();
      fetchDashboardData();
    } catch (err) {
      showToast("Cancellation Failed", err.response?.data?.detail || "Could not cancel appointment.", "danger");
    }
  };

  // Find upcoming confirmed appointment
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingApt = appointments.find(a => a.status === 'confirmed' && a.appointment_date >= todayStr) ||
    appointments.find(a => a.status === 'confirmed');

  const recentApts = appointments.filter(a => a.id !== upcomingApt?.id).slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* 1. WELCOME BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold border border-teal-500/30">
                Patient Health Portal
              </span>
              <span className="text-slate-400 text-xs">MRN-2026-00{user?.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Welcome back, {user?.name || 'Patient'} 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Track your upcoming clinical consultations, medical department guidance, and AI concierge assistance.
            </p>

            {/* Quick Profile Indicators */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <div className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-1.5 text-slate-200">
                <Droplet className="w-3.5 h-3.5 text-rose-400" />
                <span>Blood: <strong>{user?.blood_group || 'O+'}</strong></span>
              </div>
              <div className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-1.5 text-slate-200">
                <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
                <span>Emergency: <strong>{user?.emergency_contact || 'None listed'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onOpenBooking}
              className="px-5 py-3 rounded-2xl font-extrabold text-xs text-slate-900 bg-teal-400 hover:bg-teal-300 shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </button>
            <Link
              to="/chat"
              className="px-5 py-3 rounded-2xl font-bold text-xs text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-teal-400" />
              Chat with Aura AI
            </Link>
          </div>
        </div>
      </div>

      {/* 2. UPCOMING APPOINTMENT HIGHLIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900 font-heading">
                  Next Scheduled Consultation
                </h2>
              </div>
              <Link to="/my-appointments" className="text-xs font-bold text-teal-600 hover:text-teal-800">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading appointments...</div>
            ) : upcomingApt ? (
              <div className="mt-5 space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/50 to-slate-50 border border-teal-100/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900 font-heading">
                            Dr. {upcomingApt.doctor?.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                            {upcomingApt.status}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-teal-700 mt-0.5">
                          {upcomingApt.department?.name}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          📍 {upcomingApt.department?.location_floor || 'Main Clinic Tower'}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Reference Code
                      </span>
                      <p className="text-sm font-mono font-extrabold text-teal-800">
                        {upcomingApt.appointment_code}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-teal-100/60 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Date</span>
                      <span className="font-bold text-slate-800 text-sm">{upcomingApt.appointment_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Time Slot</span>
                      <span className="font-bold text-teal-700 text-sm">{upcomingApt.appointment_time}</span>
                    </div>
                  </div>

                  {upcomingApt.reason && (
                    <div className="mt-3 pt-3 border-t border-teal-100/60 text-xs">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Reason</span>
                      <p className="text-slate-700 mt-0.5">{upcomingApt.reason}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleCancelAppointment(upcomingApt.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Cancel Booking
                  </button>
                  <button
                    onClick={() => setRescheduleApt(upcomingApt)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-teal-700 hover:bg-teal-50 border border-teal-300 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">No Upcoming Appointments</p>
                  <p className="text-xs text-slate-400 mt-0.5">Need a checkup or specialist opinion?</p>
                </div>
                <button
                  onClick={onOpenBooking}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-colors"
                >
                  Schedule an Appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. AI HEALTH CONCIERGE PROMPT CARD */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
                  <Bot className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  Aura AI Health Navigator
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mt-3 font-heading">
                Instant Hospital Assistance
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Ask questions regarding doctor qualifications, preparation for scans, visiting rules, or department locations.
              </p>

              {/* Sample Prompts */}
              <div className="mt-4 space-y-2">
                <Link
                  to="/chat?q=Who is the senior cardiologist?"
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs text-slate-200 block transition-all"
                >
                  "Who is the senior cardiologist and what are their consultation fees?"
                </Link>
                <Link
                  to="/chat?q=What are the visiting hours?"
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs text-slate-200 block transition-all"
                >
                  "What are the visiting hours for general wards and ICU?"
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-teal-400 font-semibold">Live 24/7 AI System</span>
              <Link
                to="/chat"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-teal-400 hover:bg-teal-300 transition-colors flex items-center gap-1"
              >
                Open Concierge <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT CONSULTATIONS TABLE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 font-heading">
              Recent Consultations & History
            </h2>
          </div>
          <Link to="/my-appointments" className="text-xs font-bold text-teal-600 hover:text-teal-800">
            View All History
          </Link>
        </div>

        {recentApts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No previous consultation records found.
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Reference ID</th>
                  <th className="py-3 px-3">Specialist Doctor</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentApts.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                      {apt.appointment_code}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      Dr. {apt.doctor?.name}
                    </td>
                    <td className="py-3.5 px-3 text-teal-700">
                      {apt.department?.name}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {apt.appointment_date} • {apt.appointment_time}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        apt.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {apt.status === 'confirmed' ? (
                        <button
                          onClick={() => setRescheduleApt(apt)}
                          className="text-xs font-bold text-teal-600 hover:underline"
                        >
                          Reschedule
                        </button>
                      ) : (
                        <button
                          onClick={onOpenBooking}
                          className="text-xs font-bold text-slate-500 hover:text-teal-600"
                        >
                          Book Again
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. HOSPITAL SERVICES QUICK ACCESS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-900 font-heading">
            Hospital Services & Clinical Centers
          </h2>
          <Link to="/services" className="text-xs font-bold text-teal-600 hover:text-teal-800">
            View All Services
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.slice(0, 3).map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs card-hover flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                  {srv.category}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1 font-heading">
                  {srv.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {srv.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">🕒 {srv.availability}</span>
                <Link to="/services" className="font-bold text-teal-600 hover:underline">
                  Inquire
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <RescheduleModal
          isOpen={!!rescheduleApt}
          appointment={rescheduleApt}
          onClose={() => setRescheduleApt(null)}
          onRescheduled={fetchDashboardData}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
