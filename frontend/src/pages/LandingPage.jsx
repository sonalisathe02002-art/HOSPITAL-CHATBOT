import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartPulse, 
  Calendar, 
  Bot, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  Award, 
  Clock, 
  Users, 
  Building2, 
  PhoneCall, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  Activity,
  Stethoscope,
  Microscope,
  Ambulance,
  Lock
} from 'lucide-react';
import { deptAPI, doctorAPI, serviceAPI } from '../api/client';

const LandingPage = ({ onOpenBooking }) => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, docRes, srvRes] = await Promise.all([
          deptAPI.getAll(),
          doctorAPI.getAll(),
          serviceAPI.getAll({ featured_only: true })
        ]);
        setDepartments(deptRes.data);
        setFeaturedDoctors(docRes.data.slice(0, 4));
        setServices(srvRes.data);
      } catch (err) {
        console.error("Error loading landing page data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 1. LUXURY HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-36">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Next-Generation Quaternary Care & AI Concierge</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.1] text-white">
                Precision Medicine <br />
                <span className="bg-gradient-to-r from-teal-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                  Meets Empathetic Care.
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
                AuraCare combines board-certified clinical faculty, Da Vinci robotic surgery, 
                high-resolution 3T MRI diagnostics, and an intelligent AI Concierge available 24/7 to manage your health journey.
              </p>

              {/* Quick Search Bar */}
              <form onSubmit={handleSearchSubmit} className="pt-2">
                <div className="flex flex-col sm:flex-row items-center gap-2 max-w-xl bg-slate-900/90 p-2 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3 px-3 py-2 flex-1 w-full">
                    <Search className="w-5 h-5 text-teal-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search doctor name, specialty (e.g. Cardiology, Dr. Julian)..."
                      className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 shadow-lg shadow-teal-500/25 transition-all shrink-0"
                  >
                    Find Specialist
                  </button>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={onOpenBooking}
                  className="px-6 py-3.5 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center gap-2 transform active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  Book Consultation Now
                </button>
                <Link
                  to="/chat"
                  className="px-6 py-3.5 rounded-2xl font-bold text-xs text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-teal-400/50 shadow-md transition-all flex items-center gap-2"
                >
                  <Bot className="w-4 h-4 text-teal-400" />
                  Consult Aura AI Concierge
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>JCI Gold Seal Accredited</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-sky-400" />
                  <span>99.4% Patient Satisfaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>24/7 Level-1 Emergency Center</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 backdrop-blur-md p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white font-heading">
                        AuraCare Medical Hub
                      </h3>
                      <p className="text-[11px] text-teal-400">Live Campus Status: Normal Operations</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Current ER Wait Time</span>
                      <span className="font-bold text-emerald-400">3 - 6 mins</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[25%]" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Next Available Consultation</p>
                      <p className="text-sm font-bold text-white mt-0.5">Today at 10:00 AM</p>
                      <p className="text-[11px] text-teal-400 mt-0.5">Dr. Julian Sterling (Cardiology)</p>
                    </div>
                    <button
                      onClick={onOpenBooking}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-colors shadow-xs"
                    >
                      Book Slot
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/60 to-sky-950/60 border border-teal-500/30 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">Ask Aura AI Anything</p>
                      <p className="text-[11px] text-slate-300">"What are cardiology consultation fees?"</p>
                    </div>
                    <Link
                      to="/chat"
                      className="text-teal-400 hover:text-teal-300 text-xs font-bold flex items-center gap-0.5"
                    >
                      Try <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Emergency Hotline:</span>
                  <a href="tel:18002872227" className="font-extrabold text-rose-400 hover:underline">
                    1-800-AURACARE
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="bg-white border-y border-slate-200/80 py-8 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
                250+
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                Specialist Physicians
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-teal-600 font-heading">
                99.4%
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                Patient Satisfaction
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
                8 Centers
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                Centers of Excellence
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-teal-600 font-heading">
                24/7/365
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                Emergency & Ambulance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CLINICAL DEPARTMENTS DIRECTORY PREVIEW */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold mb-3">
              <Building2 className="w-3.5 h-3.5" /> Specialized Healthcare
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
              Centres of Medical Excellence
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xl leading-relaxed">
              Equipped with dedicated inpatient suites, modern diagnostics, and internationally trained clinical faculties.
            </p>
          </div>
          <Link
            to="/departments"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors"
          >
            Explore All Departments <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.slice(0, 4).map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {dept.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">📍 {dept.location_floor}</span>
                <button
                  onClick={onOpenBooking}
                  className="font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
                >
                  Book <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED SPECIALIST DOCTORS */}
      <section className="py-20 bg-slate-100/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold mb-3">
                <Stethoscope className="w-3.5 h-3.5" /> Accredited Faculty
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
                Meet Our Leading Specialists
              </h2>
              <p className="text-slate-500 text-sm mt-2 max-w-xl leading-relaxed">
                Consult with internationally recognized department heads and surgeons committed to patient-first care.
              </p>
            </div>
            <Link
              to="/doctors"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors"
            >
              View All Doctors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs card-hover flex flex-col"
              >
                <div className="flex justify-end p-5 pb-0">
                  <div className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-extrabold flex items-center gap-1">
                    ★ {doc.rating}
                  </div>
                </div>

                <div className="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 font-heading">
                      Dr. {doc.name}
                    </h3>
                    <p className="text-xs font-semibold text-teal-700 mt-0.5">
                      {doc.specialization}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {doc.qualification}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Experience: <span className="font-bold text-slate-700">{doc.experience_years}+ years</span>
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block text-[10px]">Fee</span>
                      <span className="text-sm font-extrabold text-slate-900">₹{doc.consultation_fee}</span>
                    </div>
                    <button
                      onClick={onOpenBooking}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-colors"
                    >
                      Book Consult
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ADVANCED HOSPITAL SERVICES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-3">
            <Microscope className="w-3.5 h-3.5" /> Clinical Infrastructure
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            World-Class Hospital Services
          </h2>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            From emergency trauma triage to Da Vinci robotic surgery, our hospital provides complete care on one campus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.slice(0, 6).map((srv) => (
            <div
              key={srv.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs card-hover flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-50 to-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600">
                    {srv.category}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {srv.availability}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  {srv.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium text-[11px]">{srv.price_range}</span>
                <Link to="/services" className="font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. AI CONCIERGE BANNER */}
      <section className="py-16 bg-gradient-to-r from-slate-950 via-teal-950 to-sky-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" /> Intelligent Healthcare Navigation
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
                Have a Question? Ask Aura Virtual Concierge.
              </h2>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Our artificial intelligence system is trained on all hospital doctors, departments, available slots, 
                visiting hours, and insurance plans. Get instant, accurate institutional answers 24/7.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                to="/chat"
                className="px-6 py-3.5 rounded-2xl font-extrabold text-xs text-slate-900 bg-teal-400 hover:bg-teal-300 text-center shadow-xl shadow-teal-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4" />
                Open Aura AI Concierge
              </Link>
              <button
                onClick={onOpenBooking}
                className="px-6 py-3.5 rounded-2xl font-bold text-xs text-white border border-slate-700 hover:bg-white/10 text-center transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book Directly Online
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. EMERGENCY CALLOUT */}
      <section className="py-8 bg-rose-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Ambulance className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight font-heading">
                Acute Medical Emergency or Ambulance Dispatch?
              </h3>
              <p className="text-xs text-rose-100">
                Ground Floor Wing A • Dedicated resuscitation bays • Resuscitation team on site 24/7
              </p>
            </div>
          </div>
          <a
            href="tel:18002872227"
            className="px-6 py-3 rounded-2xl font-extrabold text-xs text-rose-900 bg-white hover:bg-rose-50 shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-rose-600" />
            Call ER: 1-800-AURACARE / 911
          </a>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
