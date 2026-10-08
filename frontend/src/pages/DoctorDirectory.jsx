import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar, 
  Star, 
  Clock, 
  Award, 
  Building2,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { doctorAPI, deptAPI } from '../api/client';

const DoctorDirectory = ({ onOpenBooking }) => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialDept = searchParams.get('dept') || '';

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('rating'); // rating, fee-low, fee-high, exp
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [docRes, deptRes] = await Promise.all([
          doctorAPI.getAll(),
          deptAPI.getAll()
        ]);
        setDoctors(docRes.data);
        setDepartments(deptRes.data);
      } catch (err) {
        console.error("Error loading doctors directory:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter & Sort
  const filteredDoctors = doctors.filter((doc) => {
    const matchesDept = !selectedDept || 
      doc.department_id === Number(selectedDept) || 
      doc.department?.name.toLowerCase().includes(selectedDept.toLowerCase());

    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.qualification.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'fee-low') return a.consultation_fee - b.consultation_fee;
    if (sortBy === 'fee-high') return b.consultation_fee - a.consultation_fee;
    if (sortBy === 'exp') return b.experience_years - a.experience_years;
    return b.rating - a.rating;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold mb-2">
          <Stethoscope className="w-3.5 h-3.5" /> Specialist Physician Directory
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Find Your Specialist Physician
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed">
          Search across all clinical departments, review credentials, check consultation fees, and schedule an appointment directly.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by physician or specialty..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-700">Department:</span>
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-semibold focus:outline-none shrink-0"
          >
            <option value="">All Specialties</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-semibold focus:outline-none shrink-0"
          >
            <option value="rating">Sort by Rating</option>
            <option value="exp">Sort by Experience</option>
            <option value="fee-low">Fee: Low to High</option>
            <option value="fee-high">Fee: High to Low</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading specialists directory...
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <p className="text-base font-bold text-slate-800">No Specialists Found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any doctors matching your search or department filter. Try clearing filters or searching another keyword.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedDept(''); }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 p-6 pb-0">
                  <div className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-extrabold uppercase border border-teal-100">
                    {doc.department?.name || 'Specialist'}
                  </div>
                  <div className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-extrabold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> {doc.rating}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                      Dr. {doc.name}
                    </h3>
                    <p className="text-xs font-semibold text-teal-700 mt-0.5">
                      {doc.specialization}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {doc.qualification}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {doc.bio || 'Compassionate physician dedicated to delivering personalized clinical care.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Days: <span className="font-semibold text-slate-700">{doc.available_days}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      Experience: <span className="font-semibold text-slate-700">{doc.experience_years}+ years</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="p-6 pt-0">
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fee</span>
                    <span className="text-base font-extrabold text-slate-900">₹{doc.consultation_fee}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (onOpenBooking) onOpenBooking(doc.id, doc.department_id);
                    }}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book Consultation
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDirectory;
