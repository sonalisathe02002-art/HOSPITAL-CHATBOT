import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  PhoneCall, 
  User, 
  ArrowRight, 
  Activity, 
  AlertCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { deptAPI, doctorAPI } from '../api/client';

const DepartmentDirectory = ({ onOpenBooking }) => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [deptRes, docRes] = await Promise.all([
          deptAPI.getAll(),
          doctorAPI.getAll()
        ]);
        setDepartments(deptRes.data);
        setDoctors(docRes.data);
      } catch (err) {
        console.error("Error loading departments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold mb-2">
          <Building2 className="w-3.5 h-3.5" /> Clinical Infrastructure & Specialties
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Centres of Medical Excellence
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed">
          Explore our sub-specialized clinical departments equipped with cutting-edge surgical suites, intensive recovery rooms, and dedicated outpatient centers.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading hospital departments...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {departments.map((dept) => {
            const deptDocs = doctors.filter((d) => d.department_id === dept.id);

            return (
              <div
                key={dept.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-50 to-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center font-bold">
                        <Activity className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                          {dept.name}
                        </h2>
                        <span className="text-xs text-teal-700 font-semibold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-teal-500" /> {dept.location_floor}
                        </span>
                      </div>
                    </div>

                    {dept.is_emergency && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        24/7 Critical
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                    {dept.description}
                  </p>

                  <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Head of Department:</span>
                      <span className="font-bold text-slate-800">{dept.head_doctor || 'Senior Clinical Faculty'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Direct Campus Line:</span>
                      <span className="font-bold text-slate-800">{dept.phone || '+1 (555) 019-2834'}</span>
                    </div>
                  </div>

                  {/* Specialist Faculty Preview */}
                  <div className="mt-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Department Specialists ({deptDocs.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {deptDocs.length === 0 ? (
                        <span className="text-xs text-slate-400">Specialists available on rotation</span>
                      ) : (
                        deptDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold"
                          >
                            <span>Dr. {doc.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/doctors?dept=${encodeURIComponent(dept.name)}`}
                    className="text-xs font-bold text-slate-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    View Roster <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      if (onOpenBooking) onOpenBooking(null, dept.id);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book in {dept.name.split(' ')[0]}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DepartmentDirectory;
