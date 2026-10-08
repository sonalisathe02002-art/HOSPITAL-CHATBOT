import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { doctorAPI, appointmentAPI } from '../api/client';
import { useNotifications } from '../context/NotificationContext';

const RescheduleModal = ({ isOpen, onClose, appointment, onRescheduled }) => {
  const { showToast, fetchNotifications } = useNotifications();
  const [newDate, setNewDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [rescheduleNote, setRescheduleNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isOpen || !appointment) {
      setNewDate('');
      setSelectedSlot('');
      setAvailableSlots([]);
      setError('');
      return;
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    if (!appointment?.doctor_id || !newDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setSlotLoading(true);
      setError('');
      try {
        const res = await doctorAPI.getSlots(appointment.doctor_id, newDate);
        setAvailableSlots(res.data.slots);
      } catch (err) {
        setError("Could not load slots for this date.");
      } finally {
        setSlotLoading(false);
      }
    };

    fetchSlots();
  }, [appointment?.doctor_id, newDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !selectedSlot) {
      setError("Please select both a new date and an available slot.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await appointmentAPI.reschedule(appointment.id, {
        appointment_date: newDate,
        appointment_time: selectedSlot,
        notes: rescheduleNote
      });

      showToast("Appointment Rescheduled", `Moved to ${newDate} at ${selectedSlot}`, "success");
      fetchNotifications();
      if (onRescheduled) onRescheduled();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reschedule appointment.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-sky-950 text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base tracking-tight font-heading">
              Reschedule Appointment
            </h3>
            <p className="text-xs text-slate-300">
              Ref: <span className="font-mono text-teal-400 font-bold">{appointment.appointment_code}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Info */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <p className="text-slate-500">Currently Scheduled For:</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">
              Dr. {appointment.doctor?.name} ({appointment.department?.name})
            </p>
            <p className="text-teal-700 font-semibold mt-1">
              📅 {appointment.appointment_date} at {appointment.appointment_time}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select New Consultation Date
              </label>
              <input
                type="date"
                min={todayStr}
                required
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  setSelectedSlot('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
              />
            </div>

            {newDate && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select New Available Time Slot
                </label>
                {slotLoading ? (
                  <div className="py-4 text-center text-xs text-slate-400">Loading slots...</div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-500 text-xs text-center">
                    No available slots on this date. Please pick another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot, idx) => (
                      <button
                        type="button"
                        key={idx}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedSlot === slot.time
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : slot.available
                            ? 'border-slate-200 text-slate-800 hover:border-teal-400 hover:bg-teal-50/50'
                            : 'border-slate-100 bg-slate-50 text-slate-300 line-through cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Rescheduling (Optional)
              </label>
              <input
                type="text"
                value={rescheduleNote}
                onChange={(e) => setRescheduleNote(e.target.value)}
                placeholder="E.g., Travel conflict, schedule change"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !newDate || !selectedSlot}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-md transition-colors"
              >
                {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
