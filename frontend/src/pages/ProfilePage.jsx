import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Droplet, 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  Edit3, 
  Save, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    blood_group: user?.blood_group || 'O+',
    emergency_contact: user?.emergency_contact || '',
    address: user?.address || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      showToast("Profile Updated", "Your patient details have been saved.", "success");
      setIsEditing(false);
    } catch (err) {
      showToast("Update Failed", "Could not update profile details.", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold mb-2">
            <User className="w-3.5 h-3.5" /> Patient Identification & Medical Records
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            Patient Profile & Vitals
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your personal contact details, emergency contacts, and vital clinical notes.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 ${
            isEditing
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {/* Banner with Avatar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-8 border-b border-slate-100">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white text-2xl font-extrabold flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                {user?.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-50 text-teal-700 border border-teal-200">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
              <span>Medical Record No: <strong>MRN-2026-00{user?.id}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-teal-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Verified Patient
              </span>
            </div>
          </div>
        </div>

        {/* Form / Details View */}
        <form onSubmit={handleSave} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Legal Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              ) : (
                <p className="text-xs font-semibold text-slate-900 py-1">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registered Email Address
              </label>
              <p className="text-xs font-semibold text-slate-900 py-1 text-slate-500">
                {user?.email} <span className="text-[10px] text-teal-600">(Verified Primary)</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Phone
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              ) : (
                <p className="text-xs font-semibold text-slate-900 py-1">{user?.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Blood Group
              </label>
              {isEditing ? (
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              ) : (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {user?.blood_group || 'O+'}
                </span>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Emergency Contact (Name & Phone)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  placeholder="E.g. Jane Doe (Spouse) - +1 (555) 234-5678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              ) : (
                <p className="text-xs font-semibold text-slate-900 py-1">
                  {user?.emergency_contact || 'None specified'}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Residential Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full street address..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              ) : (
                <p className="text-xs font-semibold text-slate-900 py-1">
                  {user?.address || 'Not specified'}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
