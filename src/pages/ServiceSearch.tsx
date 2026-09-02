import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { HealthNeedType } from '../types';
import { 
  Baby, 
  Flame, 
  Stethoscope, 
  HeartPulse, 
  TestTube, 
  Pill, 
  Activity, 
  ArrowRight,
  ArrowLeft,
  MapPin,
  Sparkles
} from 'lucide-react';

export const ServiceSearch: React.FC = () => {
  const { setSelectedNeed, selectedDistrict, selectedState, t } = useApp();
  const navigate = useNavigate();

  const services = [
    {
      id: 'general' as HealthNeedType,
      title: 'General Care (OPD)',
      titleKey: 'needGeneral',
      descKey: 'needGeneralDesc',
      icon: <Stethoscope className="w-8 h-8 text-teal-700" />,
      color: 'bg-teal-50/70 border-teal-200/90 hover:border-teal-500'
    },
    {
      id: 'maternity' as HealthNeedType,
      title: 'Maternal Care',
      titleKey: 'needMaternity',
      descKey: 'needMaternityDesc',
      icon: <Baby className="w-8 h-8 text-pink-600" />,
      color: 'bg-pink-50/70 border-pink-200/90 hover:border-pink-500'
    },
    {
      id: 'child_care' as HealthNeedType,
      title: 'Child Care',
      titleKey: 'needChildCare',
      descKey: 'needChildCareDesc',
      icon: <HeartPulse className="w-8 h-8 text-purple-600" />,
      color: 'bg-purple-50/70 border-purple-200/90 hover:border-purple-500'
    },
    {
      id: 'emergency' as HealthNeedType,
      title: 'Emergency Care',
      titleKey: 'needEmergency',
      descKey: 'needEmergencyDesc',
      icon: <Flame className="w-8 h-8 text-red-600" />,
      color: 'bg-red-50/70 border-red-200/90 hover:border-red-500'
    },
    {
      id: 'pharmacy' as HealthNeedType,
      title: 'Pharmacy',
      titleKey: 'needPharmacy',
      descKey: 'needPharmacyDesc',
      icon: <Pill className="w-8 h-8 text-emerald-600" />,
      color: 'bg-emerald-50/70 border-emerald-200/90 hover:border-emerald-500'
    },
    {
      id: 'diagnostics' as HealthNeedType,
      title: 'Laboratory',
      titleKey: 'needDiagnostics',
      descKey: 'needDiagnosticsDesc',
      icon: <TestTube className="w-8 h-8 text-blue-600" />,
      color: 'bg-blue-50/70 border-blue-200/90 hover:border-blue-500'
    },
    {
      id: 'specialist' as HealthNeedType,
      title: 'Specialist Care',
      titleKey: 'needSpecialist',
      descKey: 'needSpecialistDesc',
      icon: <Activity className="w-8 h-8 text-indigo-600" />,
      color: 'bg-indigo-50/70 border-indigo-200/90 hover:border-indigo-500'
    }
  ];

  const handleSelect = (needId: HealthNeedType) => {
    setSelectedNeed(needId);
    navigate('/results');
  };

  return (
    <div className="w-full space-y-6 pb-14 animate-in fade-in duration-200">
      
      {/* Top Back & Location Bar (Matches Emergency Tab Fitting) */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all tap-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-teal-600" />
          <span>Active: <strong>{selectedDistrict}</strong> ({selectedState})</span>
        </div>
      </div>

      {/* Full-Width Hero Callout Header */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden border border-teal-800/40">
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>STEP 1 OF 3 • CLINICAL NEED SELECTION</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Search by Healthcare Service
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-3xl">
            Choose your medical requirement below to instantly filter government hospitals, CHCs, and PHCs in {selectedDistrict} verified with equipment, doctors, and bed readiness for that exact condition.
          </p>
        </div>
      </div>

      {/* Service Cards Grid (Full-Width Responsive 3-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services.map((srv) => (
          <button
            key={srv.id}
            onClick={() => handleSelect(srv.id)}
            className={`p-6 rounded-3xl border text-left transition-all hover:shadow-card hover:-translate-y-1 flex flex-col justify-between min-h-[170px] tap-target group bg-white shadow-soft ${srv.color}`}
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-200/60 group-hover:scale-105 transition-transform">
                {srv.icon}
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 group-hover:text-teal-900 transition-colors">
                  {t(srv.titleKey)}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {t(srv.descKey)}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs font-extrabold text-teal-800 group-hover:text-teal-950">
              <span>View Matching Facilities</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>

    </div>
  );
};
