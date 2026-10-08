import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ChevronLeft,
  Sparkles,
  Stethoscope,
  DollarSign
} from 'lucide-react';
import { deptAPI, doctorAPI, appointmentAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const AppointmentModal = ({ isOpen, onClose, initialDoctorId, initialDeptId }) => {
  const { isAuthenticated, user } = useAuth();
  const { showToast, fetchNotifications } = useNotifications();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [error, setError] = useState('');

  // Booking Form State
  const [selectedDeptId, setSelectedDeptId] = useState(initialDeptId || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId || '');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Result state
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  // Set min date to tomorrow
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setStep(1);
      setError('');
      setConfirmedAppointment(null);
      return;
    }

    const loadInitialData = async () => {
      setLoading(true);
      try {
        const deptRes = await deptAPI.getAll();
        setDepartments(deptRes.data);

        if (initialDeptId) {
          setSelectedDeptId(initialDeptId);
          const docRes = await doctorAPI.getAll({ department_id: initialDeptId });
          setDoctors(docRes.data);
          if (initialDoctorId) {
            setSelectedDoctorId(initialDoctorId);
            setStep(3); // jump to date selection
          } else {
            setStep(2);
          }
        } else if (initialDoctorId) {
          const docRes = await doctorAPI.getById(initialDoctorId);
          setSelectedDoctorId(initialDoctorId);
          setSelectedDeptId(docRes.data.department_id);
          setDoctors([docRes.data]);
          setStep(3);
        } else {
          setStep(1);
        }
      } catch (err) {
        console.error("Failed to load booking data:", err);
        setError("Unable to load departments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [isOpen, initialDoctorId, initialDeptId]);

  // Load doctors when department changes
  const handleSelectDepartment = async (deptId) => {
    setSelectedDeptId(deptId);
    setSelectedDoctorId('');
    setSelectedTimeSlot('');
    setLoading(true);
    setError('');
    try {
      const docRes = await doctorAPI.getAll({ department_id: deptId });
      setDoctors(docRes.data);
      setStep(2);
    } catch (err) {
      setError("Failed to load specialists for this department.");
    } finally {
      setLoading(false);
    }
  };

  // Load slots when date or doctor changes
  useEffect(() => {
    if (!selectedDoctorId || !appointmentDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setSlotLoading(true);
      setError('');
      try {
        const res = await doctorAPI.getSlots(selectedDoctorId, appointmentDate);
        setAvailableSlots(res.data.slots);
      } catch (err) {
        console.error("Failed to load time slots:", err);
        setError("Could not retrieve available appointment slots for this date.");
      } finally {
        setSlotLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, appointmentDate]);

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast("Authentication Required", "Please sign in to confirm your appointment booking.", "warning");
      navigate('/login');
      onClose();
      return;
    }

    if (!selectedDeptId || !selectedDoctorId || !appointmentDate || !selectedTimeSlot) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        department_id: Number(selectedDeptId),
        doctor_id: Number(selectedDoctorId),
        appointment_date: appointmentDate,
        appointment_time: selectedTimeSlot,
        reason: reason || "General Medical Consultation",
        notes: notes || ""
      };

      const res = await appointmentAPI.create(payload);
      setConfirmedAppointment(res.data);
      showToast("Appointment Booked!", `Appointment ID: ${res.data.appointment_code}`, "success");
      fetchNotifications();
      setStep(5); // Success confirmation step
    } catch (err) {
      console.error("Booking error:", err);
      const msg = err.response?.data?.detail || "Booking failed. The slot may have just been taken.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentDept = departments.find(d => d.id === Number(selectedDeptId));
  const currentDoctor = doctors.find(d => d.id === Number(selectedDoctorId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight font-heading">
                Book Medical Consultation
              </h3>
              <p className="text-xs text-slate-300">
                Step {step < 5 ? step : 4} of 4 — {
                  step === 1 ? 'Select Department' :
                  step === 2 ? 'Choose Specialist' :
                  step === 3 ? 'Date & Time Slot' :
                  step === 4 ? 'Review & Confirm' : 'Appointment Confirmed'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {step < 5 && (
          <div className="w-full bg-slate-100 h-1.5 flex">
            <div 
              className="bg-gradient-to-r from-sky-500 to-teal-500 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Select Department */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 font-medium">
                Please select the medical department corresponding to your healthcare inquiry:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => handleSelectDepartment(dept.id)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all text-left group flex items-start gap-3.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                        {dept.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {dept.description}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                        📍 {dept.location_floor}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Select Doctor */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Departments
                </button>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  {currentDept?.name}
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {doctors.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No doctors currently listed in this department.
                  </div>
                ) : (
                  doctors.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoctorId(doc.id);
                        setStep(3);
                      }}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700">
                              Dr. {doc.name}
                            </h4>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              ★ {doc.rating}
                            </span>
                          </div>
                          <p className="text-xs text-teal-700 font-medium">{doc.specialization}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{doc.qualification}</p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            📅 Available: <span className="font-semibold">{doc.available_days}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-slate-900">
                          ₹{doc.consultation_fee}
                        </span>
                        <p className="text-[10px] text-slate-400">Consultation fee</p>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-teal-600 group-hover:translate-x-1 transition-transform">
                          Select <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Select Date & Available Time Slot */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Specialists
                </button>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">Dr. {currentDoctor?.name}</p>
                  <p className="text-[10px] text-teal-600">{currentDoctor?.specialization}</p>
                </div>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Consultation Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={appointmentDate}
                  onChange={(e) => {
                    setAppointmentDate(e.target.value);
                    setSelectedTimeSlot('');
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Doctor's standard working schedule: {currentDoctor?.available_days}
                </p>
              </div>

              {/* Time Slots */}
              {appointmentDate && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Available Appointment Slots for {appointmentDate}
                  </label>
                  {slotLoading ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Checking live slot availability...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs text-center">
                      No consultation slots configured or available on this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          disabled={!slot.available}
                          onClick={() => setSelectedTimeSlot(slot.time)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                            selectedTimeSlot === slot.time
                              ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                              : slot.available
                              ? 'border-slate-200 text-slate-800 hover:border-teal-400 hover:bg-teal-50/50'
                              : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {slot.time}
                          </div>
                          <span className="text-[9px] block font-normal opacity-80 mt-0.5">
                            {slot.available ? 'Available' : 'Booked'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Next Step CTA */}
              <div className="pt-2 flex justify-end">
                <button
                  disabled={!appointmentDate || !selectedTimeSlot}
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all flex items-center gap-1.5"
                >
                  Continue to Review <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review and Reason */}
          {step === 4 && (
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Slots
                </button>
                <span className="text-xs font-bold text-teal-700">Review Booking Summary</span>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/50 via-sky-50/30 to-slate-50 border border-teal-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Dr. {currentDoctor?.name}</h4>
                      <p className="text-xs text-teal-700 font-medium">{currentDept?.name}</p>
                      <p className="text-[10px] text-slate-400">{currentDoctor?.qualification}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{currentDoctor?.consultation_fee}
                    </span>
                    <p className="text-[10px] text-slate-400">Total Consult Fee</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-teal-100/60 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Date</span>
                    <span className="font-bold text-slate-800">{appointmentDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Time Slot</span>
                    <span className="font-bold text-teal-700">{selectedTimeSlot}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Location</span>
                    <span className="font-bold text-slate-800">{currentDept?.location_floor}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Patient Name</span>
                    <span className="font-bold text-slate-800">{user?.name || 'Guest Patient'}</span>
                  </div>
                </div>
              </div>

              {/* Symptoms / Reason Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Consultation / Symptoms <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows="2"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="E.g., Routine cardiovascular checkup, persistent chest pressure, follow-up on medication..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Notes or Allergies (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g., Penicillin allergy, wheelchair assistance required"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-600 via-teal-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Confirming with Hospital System...' : 'Confirm & Reserve Appointment'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: Success Confirmation */}
          {step === 5 && confirmedAppointment && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider">
                  Confirmed & Registered
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2 font-heading">
                  Appointment Scheduled Successfully!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  A confirmation notification has been sent to your patient account. Please arrive 15 minutes prior to your slot.
                </p>
              </div>

              {/* Code Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white max-w-sm mx-auto shadow-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">
                  Appointment Reference ID
                </span>
                <p className="text-2xl font-mono font-extrabold text-teal-400 mt-0.5 tracking-wider">
                  {confirmedAppointment.appointment_code}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                  <span>{confirmedAppointment.appointment_date}</span>
                  <span className="font-bold text-teal-300">{confirmedAppointment.appointment_time}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/my-appointments');
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-colors"
                >
                  View in My Appointments
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
