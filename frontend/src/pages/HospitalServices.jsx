import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BriefcaseMedical, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  Sparkles, 
  Bot,
  Calendar
} from 'lucide-react';
import { serviceAPI } from '../api/client';

const HospitalServices = ({ onOpenBooking }) => {
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await serviceAPI.getAll({ category: selectedCategory || undefined });
        setServices(res.data);
      } catch (err) {
        console.error("Error loading services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [selectedCategory]);

  const categories = ['All', 'Emergency', 'Surgery', 'Diagnostics', 'Inpatient', 'Specialized', 'Wellness'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold mb-2">
          <BriefcaseMedical className="w-3.5 h-3.5" /> Clinical Infrastructure & Inpatient Capabilities
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Institutional Hospital Services
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed">
          Comprehensive diagnostic and therapeutic facilities operating with international quality protocols and patient-first safety standards.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
              (cat === 'All' && !selectedCategory) || selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading hospital services...
        </div>
      ) : services.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          No services currently listed under this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-50 to-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold">
                    <Activity className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-50 text-teal-700 border border-teal-200">
                    {srv.category}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                  {srv.name}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {srv.description}
                </p>

                <div className="mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 font-semibold">Availability:</span>
                    <span className="font-bold text-slate-800">{srv.availability}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 font-semibold">Coverage:</span>
                    <span className="font-bold text-teal-700">{srv.price_range}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/chat?q=Tell me about the ${srv.name}`}
                  className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
                >
                  <Bot className="w-3.5 h-3.5" /> Ask AI Concierge
                </Link>
                <button
                  onClick={onOpenBooking}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HospitalServices;
