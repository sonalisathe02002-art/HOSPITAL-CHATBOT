import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  RefreshCw, 
  XCircle, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { appointmentAPI } from '../api/client';
import { useNotifications } from '../context/NotificationContext';
import RescheduleModal from '../components/RescheduleModal';

const MyAppointments = ({ onOpenBooking }) => {
  const { showToast, fetchNotifications } = useNotifications();
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, confirmed, completed, cancelled
  const [loading, setLoading] = useState(true);
  const [rescheduleApt, setRescheduleApt] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentAPI.getMy();
      setAppointments(res.data);
    } catch (err) {
      console.error("Error loading appointments:", err);
      showToast("Error", "Could not load your appointments.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (aptId) => {
    if (!window.confirm("Are you sure you wish to cancel this scheduled consultation?")) return;
    try {
      await appointmentAPI.cancel(aptId);
      showToast("Appointment Cancelled", "Your booking has been cancelled.", "info");
      fetchNotifications();
      fetchAppointments();
    } catch (err) {
      showToast("Error", "Could not cancel appointment.", "danger");
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus === 'all') return true;
    return apt.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold mb-2">
            <Calendar className="w-3.5 h-3.5" /> Patient Consultations Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            My Appointments
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            View upcoming doctor consultations, cancel, or reschedule your time slots.
          </p>
        </div>

        <button
          onClick={onOpenBooking}
          className="px-5 py-3 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-sky-600 via-teal-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Book New Appointment
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'all', label: `All (${appointments.length})` },
          { id: 'confirmed', label: `Upcoming (${appointments.filter(a => a.status === 'confirmed').length})` },
          { id: 'completed', label: `Past Completed (${appointments.filter(a => a.status === 'completed').length})` },
          { id: 'cancelled', label: `Cancelled (${appointments.filter(a => a.status === 'cancelled').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2.5 rounded-xl transition-all shrink-0 ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointment Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading appointments...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-slate-800">No Appointments in this Category</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any bookings matching this filter. Schedule a consultation with our specialist doctors today.
          </p>
          <button
            onClick={onOpenBooking}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs"
          >
            Book Appointment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs card-hover flex flex-col justify-between"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Reference ID:
                    </span>
                    <span className="font-mono text-xs font-extrabold text-slate-900">
                      {apt.appointment_code}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      apt.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : apt.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : apt.status === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>

                {/* Doctor & Dept details */}
                <div className="mt-4 flex items-center gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 font-heading">
                      Dr. {apt.doctor?.name}
                    </h3>
                    <p className="text-xs font-semibold text-teal-700">
                      {apt.department?.name}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-0.5 block flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {apt.department?.location_floor || 'Main Clinic Tower'}
                    </span>
                  </div>
                </div>

                {/* Date & Time pill */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Consultation Date</span>
                    <span className="font-bold text-slate-800">{apt.appointment_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Time Slot</span>
                    <span className="font-bold text-teal-700">{apt.appointment_time}</span>
                  </div>
                </div>

                {apt.reason && (
                  <div className="mt-3 text-xs">
                    <span className="text-slate-400 text-[10px] font-semibold uppercase block">Reason</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{apt.reason}</p>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                {apt.status === 'confirmed' ? (
                  <>
                    <button
                      onClick={() => handleCancel(apt.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button
                      onClick={() => setRescheduleApt(apt)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-teal-700 hover:bg-teal-50 border border-teal-300 transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onOpenBooking}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Schedule New Consultation
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <RescheduleModal
          isOpen={!!rescheduleApt}
          appointment={rescheduleApt}
          onClose={() => setRescheduleApt(null)}
          onRescheduled={fetchAppointments}
        />
      )}
    </div>
  );
};

export default MyAppointments;
