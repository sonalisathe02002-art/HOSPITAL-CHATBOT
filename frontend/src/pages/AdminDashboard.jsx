import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Building2, 
  Calendar, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Activity,
  Layers
} from 'lucide-react';
import { adminAPI, deptAPI, doctorAPI } from '../api/client';
import { useNotifications } from '../context/NotificationContext';

const AdminDashboard = () => {
  const { showToast } = useNotifications();

  // Overview Stats
  const [stats, setStats] = useState({
    total_patients: 0,
    total_doctors: 0,
    total_departments: 0,
    total_appointments: 0,
    todays_appointments: 0,
    pending_appointments: 0,
    confirmed_appointments: 0,
    completed_appointments: 0
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState('appointments'); // appointments, doctors, departments, patients
  const [loading, setLoading] = useState(true);

  // Tab Data Lists
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);

  // Modals
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  // Doctor Form State
  const [docFormData, setDocFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department_id: '',
    specialization: '',
    qualification: '',
    experience_years: 5,
    consultation_fee: 100,
    bio: '',
    available_days: 'Mon, Tue, Wed, Thu, Fri',
    time_slots: '09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM'
  });

  // Department Form State
  const [deptFormData, setDeptFormData] = useState({
    name: '',
    description: '',
    location_floor: 'Level 1',
    head_doctor: '',
    phone: '',
    is_emergency: false
  });

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, aptRes, docRes, deptRes, patRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAppointments(),
        doctorAPI.getAll(),
        deptAPI.getAll(),
        adminAPI.getPatients()
      ]);
      setStats(statsRes.data);
      setAppointments(aptRes.data);
      setDoctors(docRes.data);
      setDepartments(deptRes.data);
      setPatients(patRes.data);
    } catch (err) {
      console.error("Admin data load error:", err);
      showToast("Error", "Could not load administrative data.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // --- Appointment Status Update ---
  const handleUpdateAptStatus = async (aptId, newStatus) => {
    try {
      await adminAPI.updateAppointmentStatus(aptId, newStatus);
      showToast("Status Updated", `Appointment status set to ${newStatus}`, "success");
      loadAllAdminData();
    } catch (err) {
      showToast("Update Failed", "Could not update appointment status", "danger");
    }
  };

  // --- Doctor CRUD ---
  const openAddDoctor = () => {
    setEditingDoctor(null);
    setDocFormData({
      name: '',
      email: '',
      phone: '',
      department_id: departments[0]?.id || '',
      specialization: '',
      qualification: '',
      experience_years: 5,
      consultation_fee: 120,
      bio: '',
      available_days: 'Mon, Tue, Wed, Thu, Fri',
      time_slots: '09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM'
    });
    setDoctorModalOpen(true);
  };

  const openEditDoctor = (doc) => {
    setEditingDoctor(doc);
    setDocFormData({
      name: doc.name,
      email: doc.email,
      phone: doc.phone || '',
      department_id: doc.department_id,
      specialization: doc.specialization,
      qualification: doc.qualification,
      experience_years: doc.experience_years,
      consultation_fee: doc.consultation_fee,
      bio: doc.bio || '',
      available_days: doc.available_days,
      time_slots: doc.time_slots
    });
    setDoctorModalOpen(true);
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...docFormData,
        department_id: Number(docFormData.department_id),
        experience_years: Number(docFormData.experience_years),
        consultation_fee: Number(docFormData.consultation_fee)
      };

      if (editingDoctor) {
        await adminAPI.updateDoctor(editingDoctor.id, payload);
        showToast("Doctor Updated", `Dr. ${payload.name} details saved.`, "success");
      } else {
        await adminAPI.createDoctor(payload);
        showToast("Doctor Added", `Dr. ${payload.name} has been added.`, "success");
      }
      setDoctorModalOpen(false);
      loadAllAdminData();
    } catch (err) {
      showToast("Error", err.response?.data?.detail || "Could not save doctor.", "danger");
    }
  };

  const handleDeleteDoctor = async (docId, docName) => {
    if (!window.confirm(`Are you sure you want to remove Dr. ${docName}?`)) return;
    try {
      await adminAPI.deleteDoctor(docId);
      showToast("Doctor Removed", `Dr. ${docName} deleted successfully.`, "info");
      loadAllAdminData();
    } catch (err) {
      showToast("Error", "Could not delete doctor.", "danger");
    }
  };

  // --- Department CRUD ---
  const openAddDept = () => {
    setEditingDept(null);
    setDeptFormData({
      name: '',
      description: '',
      location_floor: 'Level 1',
      head_doctor: '',
      phone: '',
      is_emergency: false
    });
    setDeptModalOpen(true);
  };

  const openEditDept = (dept) => {
    setEditingDept(dept);
    setDeptFormData({
      name: dept.name,
      description: dept.description,
      location_floor: dept.location_floor,
      head_doctor: dept.head_doctor || '',
      phone: dept.phone || '',
      is_emergency: dept.is_emergency || false
    });
    setDeptModalOpen(true);
  };

  const handleSaveDept = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await adminAPI.updateDept(editingDept.id, deptFormData);
        showToast("Department Updated", `${deptFormData.name} saved.`, "success");
      } else {
        await adminAPI.createDept(deptFormData);
        showToast("Department Created", `${deptFormData.name} created.`, "success");
      }
      setDeptModalOpen(false);
      loadAllAdminData();
    } catch (err) {
      showToast("Error", err.response?.data?.detail || "Could not save department.", "danger");
    }
  };

  const handleDeleteDept = async (deptId, deptName) => {
    if (!window.confirm(`Are you sure you want to delete ${deptName}? All associated doctors will be affected.`)) return;
    try {
      await adminAPI.deleteDept(deptId);
      showToast("Department Deleted", `${deptName} deleted successfully.`, "info");
      loadAllAdminData();
    } catch (err) {
      showToast("Error", "Could not delete department.", "danger");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-16">
      {/* 1. ADMIN HEADER */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold border border-teal-500/30">
            Administrative Command & Clinical Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-2">
            Hospital Operations Dashboard
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Real-time control over medical departments, specialist faculty, patient appointments, and clinical capacities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddDoctor}
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-500 shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Specialist
          </button>
          <button
            onClick={openAddDept}
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
        </div>
      </div>

      {/* 2. STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Patients</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-heading">
            {stats.total_patients}
          </p>
          <span className="text-[10px] text-teal-600 font-bold mt-1 block">Active Profiles</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Specialists</span>
            <UserCheck className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-heading">
            {stats.total_doctors}
          </p>
          <span className="text-[10px] text-sky-600 font-bold mt-1 block">Board Certified</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Departments</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-heading">
            {stats.total_departments}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Centres of Care</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Bookings</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-heading">
            {stats.total_appointments}
          </p>
          <span className="text-[10px] text-purple-600 font-bold mt-1 block">Lifetime Logs</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Today's Visits</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-2 font-heading">
            {stats.todays_appointments}
          </p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Scheduled Today</span>
        </div>
      </div>

      {/* 3. TAB CONTROLS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'appointments', label: `Appointments (${appointments.length})` },
          { id: 'doctors', label: `Specialist Doctors (${doctors.length})` },
          { id: 'departments', label: `Departments (${departments.length})` },
          { id: 'patients', label: `Patients Directory (${patients.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: APPOINTMENTS CONTROL */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-slate-900 font-heading">
              All Scheduled Consultations
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Specialist Doctor</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                      {apt.appointment_code}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {apt.patient?.name || `Patient #${apt.patient_id}`}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {apt.patient?.phone || apt.patient?.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-800">
                      Dr. {apt.doctor?.name}
                    </td>
                    <td className="py-3.5 px-3 text-teal-700">
                      {apt.department?.name}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {apt.appointment_date} <br />
                      <span className="font-semibold text-slate-800">{apt.appointment_time}</span>
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
                    <td className="py-3.5 px-3 text-right space-x-1">
                      <select
                        value={apt.status}
                        onChange={(e) => handleUpdateAptStatus(apt.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-700"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTORS MANAGEMENT */}
      {activeTab === 'doctors' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-slate-900 font-heading">
              Hospital Specialist Faculty
            </h2>
            <button
              onClick={openAddDoctor}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Doctor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-teal-400 bg-white shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Dr. {doc.name}</h4>
                      <p className="text-xs text-teal-700 font-medium">{doc.specialization}</p>
                      <span className="text-[10px] text-slate-400">{doc.qualification}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1">
                    <p className="text-slate-600">
                      <strong>Department:</strong> {doc.department?.name || 'General'}
                    </p>
                    <p className="text-slate-600">
                      <strong>Experience:</strong> {doc.experience_years} years
                    </p>
                    <p className="text-slate-600">
                      <strong>Fee:</strong> ₹{doc.consultation_fee}
                    </p>
                    <p className="text-slate-600">
                      <strong>Days:</strong> {doc.available_days}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditDoctor(doc)}
                    className="p-2 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                    title="Edit Doctor"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                    className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="Delete Doctor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS MANAGEMENT */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-slate-900 font-heading">
              Clinical Departments
            </h2>
            <button
              onClick={openAddDept}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-teal-400 bg-white shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700">
                      {dept.location_floor}
                    </span>
                    {dept.is_emergency && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                        Emergency Unit
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 mt-2 font-heading">
                    {dept.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                    {dept.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1">
                    <p className="text-slate-600">
                      <strong>Head of Dept:</strong> {dept.head_doctor || 'Senior Board'}
                    </p>
                    <p className="text-slate-600">
                      <strong>Contact:</strong> {dept.phone || 'Ext 101'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditDept(dept)}
                    className="p-2 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDept(dept.id, dept.name)}
                    className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PATIENTS DIRECTORY */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
          <h2 className="text-base font-extrabold text-slate-900 font-heading mb-4">
            Registered Patient Records
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Patient Name</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Contact Phone</th>
                  <th className="py-3 px-3">Blood Group</th>
                  <th className="py-3 px-3">Emergency Contact</th>
                  <th className="py-3 px-3">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {patients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {pat.name}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {pat.email}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {pat.phone || 'N/A'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                        {pat.blood_group || 'O+'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {pat.emergency_contact || 'None listed'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                      {new Date(pat.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- DOCTOR ADD/EDIT MODAL --- */}
      {doctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm font-heading">
                {editingDoctor ? `Edit Dr. ${editingDoctor.name}` : 'Add New Specialist Physician'}
              </h3>
              <button onClick={() => setDoctorModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveDoctor} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    value={docFormData.name}
                    onChange={(e) => setDocFormData({ ...docFormData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="E.g. Marcus Thorne"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={docFormData.email}
                    onChange={(e) => setDocFormData({ ...docFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="doctor@auracare.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department *</label>
                  <select
                    required
                    value={docFormData.department_id}
                    onChange={(e) => setDocFormData({ ...docFormData, department_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Specialization *</label>
                  <input
                    type="text"
                    required
                    value={docFormData.specialization}
                    onChange={(e) => setDocFormData({ ...docFormData, specialization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="E.g. Interventional Cardiologist"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Qualifications *</label>
                  <input
                    type="text"
                    required
                    value={docFormData.qualification}
                    onChange={(e) => setDocFormData({ ...docFormData, qualification: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="MD, Harvard; FACC"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={docFormData.experience_years}
                    onChange={(e) => setDocFormData({ ...docFormData, experience_years: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Consult Fee (₹100–₹500)</label>
                  <input
                    type="number"
                    min="100"
                    max="500"
                    required
                    value={docFormData.consultation_fee}
                    onChange={(e) => setDocFormData({ ...docFormData, consultation_fee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Available Days</label>
                <input
                  type="text"
                  value={docFormData.available_days}
                  onChange={(e) => setDocFormData({ ...docFormData, available_days: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  placeholder="Mon, Tue, Wed, Thu, Fri"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Time Slots (Comma separated)</label>
                <input
                  type="text"
                  value={docFormData.time_slots}
                  onChange={(e) => setDocFormData({ ...docFormData, time_slots: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  placeholder="09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Doctor Bio / Background</label>
                <textarea
                  rows="2"
                  value={docFormData.bio}
                  onChange={(e) => setDocFormData({ ...docFormData, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  placeholder="Clinical experience and research background..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDoctorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-teal-600 hover:bg-teal-700 font-bold shadow-xs"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DEPARTMENT ADD/EDIT MODAL --- */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm font-heading">
                {editingDept ? `Edit ${editingDept.name}` : 'Add Clinical Department'}
              </h3>
              <button onClick={() => setDeptModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveDept} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptFormData.name}
                  onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  placeholder="E.g. Cardiology & Vascular"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description *</label>
                <textarea
                  rows="2"
                  required
                  value={deptFormData.description}
                  onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  placeholder="Specialized diagnostics, surgical procedures..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus Floor Location</label>
                  <input
                    type="text"
                    value={deptFormData.location_floor}
                    onChange={(e) => setDeptFormData({ ...deptFormData, location_floor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="Level 2, Heart Center"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Head of Department</label>
                  <input
                    type="text"
                    value={deptFormData.head_doctor}
                    onChange={(e) => setDeptFormData({ ...deptFormData, head_doctor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="Dr. Julian Sterling, MD"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_emergency"
                  checked={deptFormData.is_emergency}
                  onChange={(e) => setDeptFormData({ ...deptFormData, is_emergency: e.target.checked })}
                  className="rounded text-teal-600"
                />
                <label htmlFor="is_emergency" className="font-bold text-slate-700">
                  Critical / Emergency Department (24/7 Operations)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeptModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-teal-600 hover:bg-teal-700 font-bold shadow-xs"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
