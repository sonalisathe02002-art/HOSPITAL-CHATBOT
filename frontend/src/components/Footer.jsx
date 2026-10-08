import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, PhoneCall, Mail, MapPin, ShieldCheck, Award, Clock, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Column 1: Hospital Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight font-heading">
                Aura<span className="text-teal-400">Care</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              AuraCare Health Medical & Surgical Center is a globally accredited quaternary care institution. 
              Merging advanced clinical precision, robotic therapeutics, and artificial intelligence to deliver exceptional patient outcomes.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-teal-400">
                <ShieldCheck className="w-3.5 h-3.5" /> JCI Gold Seal
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-sky-400">
                <Award className="w-3.5 h-3.5" /> HIPAA Certified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
                <Clock className="w-3.5 h-3.5" /> 24/7 Level-1 ER
              </span>
            </div>
          </div>

          {/* Column 2: Clinical Departments */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Clinical Departments
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/doctors?dept=Cardiology" className="hover:text-teal-400 transition-colors">Cardiovascular Center</Link></li>
              <li><Link to="/doctors?dept=Neurology" className="hover:text-teal-400 transition-colors">Neurology & Spine Institute</Link></li>
              <li><Link to="/doctors?dept=Orthopedics" className="hover:text-teal-400 transition-colors">Orthopedics & Joint Care</Link></li>
              <li><Link to="/doctors?dept=Pediatrics" className="hover:text-teal-400 transition-colors">Pediatrics & Neonatology</Link></li>
              <li><Link to="/doctors?dept=Oncology" className="hover:text-teal-400 transition-colors">Precision Oncology</Link></li>
              <li><Link to="/departments" className="text-teal-400 hover:underline flex items-center gap-1 font-semibold pt-1">View All 8 Specialties <ArrowRight className="w-3 h-3" /></Link></li>
            </ul>
          </div>

          {/* Column 3: Patient Care */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Patient Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/chat" className="hover:text-teal-400 transition-colors">Aura AI Virtual Concierge</Link></li>
              <li><Link to="/services" className="hover:text-teal-400 transition-colors">3T MRI & Diagnostic Imaging</Link></li>
              <li><Link to="/services" className="hover:text-teal-400 transition-colors">Robotic Surgical Pavilion</Link></li>
              <li><Link to="/services" className="hover:text-teal-400 transition-colors">24/7 In-House Pharmacy</Link></li>
              <li><Link to="/my-appointments" className="hover:text-teal-400 transition-colors">Manage Appointments</Link></li>
              <li><Link to="/services" className="hover:text-teal-400 transition-colors">Accepted Insurance Plans</Link></li>
            </ul>
          </div>

          {/* Column 4: Emergency & Campus */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Campus & Emergency
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>100 Medical Center Blvd, Metro Health District, Tower A & B</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-rose-300 font-bold">1-800-AURACARE (24/7 ER)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>concierge@auracarehealth.com</span>
              </div>
              <div className="pt-2 text-[11px] text-slate-500">
                Visitor Hours: Daily 10 AM – 12 PM & 4 PM – 7 PM. Free valet parking for patients.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AuraCare Health System Inc. All rights reserved.</p>
          <p className="text-[11px] text-slate-500 max-w-xl text-center md:text-right">
            Medical Disclaimer: AuraCare AI and portal resources are for healthcare guidance and scheduling. 
            In case of sudden life-threatening emergency, call 911 immediately.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
