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
  MapPin
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
      color: 'bg-teal-50 border-teal-200 hover:border-teal-500'
    },
    {
      id: 'maternity' as HealthNeedType,
      title: 'Maternal Care',
      titleKey: 'needMaternity',
      descKey: 'needMaternityDesc',
      icon: <Baby className="w-8 h-8 text-pink-600" />,
      color: 'bg-pink-50 border-pink-200 hover:border-pink-500'
    },
    {
      id: 'child_care' as HealthNeedType,
      title: 'Child Care',
      titleKey: 'needChildCare',
      descKey: 'needChildCareDesc',
      icon: <HeartPulse className="w-8 h-8 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200 hover:border-purple-500'
    },
    {
      id: 'emergency' as HealthNeedType,
      title: 'Emergency Care',
      titleKey: 'needEmergency',
      descKey: 'needEmergencyDesc',
      icon: <Flame className="w-8 h-8 text-red-600" />,
      color: 'bg-red-50 border-red-200 hover:border-red-500'
    },
    {
      id: 'pharmacy' as HealthNeedType,
      title: 'Pharmacy',
      titleKey: 'needPharmacy',
      descKey: 'needPharmacyDesc',
      icon: <Pill className="w-8 h-8 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-500'
    },
    {
      id: 'diagnostics' as HealthNeedType,
      title: 'Laboratory',
      titleKey: 'needDiagnostics',
      descKey: 'needDiagnosticsDesc',
      icon: <TestTube className="w-8 h-8 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 hover:border-blue-500'
    },
    {
      id: 'specialist' as HealthNeedType,
      title: 'Specialist Care',
      titleKey: 'needSpecialist',
      descKey: 'needSpecialistDesc',
      icon: <Activity className="w-8 h-8 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-500'
    }
  ];

  const handleSelect = (needId: HealthNeedType) => {
    setSelectedNeed(needId);
    navigate('/results');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all tap-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <div className="flex items-center gap-1 text-xs text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          <MapPin className="w-3.5 h-3.5 text-teal-600" />
          <span>{selectedDistrict}, {selectedState}</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft space-y-2">
        <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">
          Category Picker
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Search by Health Service
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Choose a medical category to immediately filter verified facilities equipped with that capability.
        </p>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv) => (
          <button
            key={srv.id}
            onClick={() => handleSelect(srv.id)}
            className={`p-5 rounded-2xl border text-left transition-all hover:shadow-card hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px] tap-target ${srv.color}`}
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                {srv.icon}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{t(srv.titleKey)}</h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{t(srv.descKey)}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-900">
              <span>View Matching Facilities</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>

    </div>
  );
};
