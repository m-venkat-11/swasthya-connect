import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { HealthNeedType, HealthNeed } from '../types';
import { 
  Baby, 
  Flame, 
  Stethoscope, 
  Activity, 
  TestTube, 
  Pill, 
  Sparkles, 
  MapPin, 
  PhoneCall, 
  Mic, 
  ArrowRight,
  HeartPulse,
  Lock,
  Heart
} from 'lucide-react';
import { VoiceAssistantModal } from '../components/VoiceAssistantModal';
import { MedicalProfileModal } from '../components/MedicalProfileModal';

export const Home: React.FC = () => {
  const { 
    selectedState, 
    selectedDistrict, 
    isLiveGpsActive, 
    userProfile, 
    setSelectedNeed, 
    t 
  } = useApp();

  const navigate = useNavigate();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);

  const healthNeeds: HealthNeed[] = [
    {
      id: 'maternity',
      titleKey: 'needMaternity',
      descKey: 'needMaternityDesc',
      iconName: 'Baby',
      requiredServices: ['Maternal Care', 'Child Care', 'Emergency Care'],
      urgency: 'high',
      colorTheme: 'from-pink-500/10 to-rose-500/10 border-pink-200 text-pink-700 hover:border-pink-500'
    },
    {
      id: 'emergency',
      titleKey: 'needEmergency',
      descKey: 'needEmergencyDesc',
      iconName: 'Flame',
      requiredServices: ['Emergency Care', 'Pharmacy'],
      urgency: 'critical',
      colorTheme: 'from-red-500/10 to-amber-500/10 border-red-200 text-red-700 hover:border-red-500'
    },
    {
      id: 'child_care',
      titleKey: 'needChildCare',
      descKey: 'needChildCareDesc',
      iconName: 'HeartPulse',
      requiredServices: ['Child Care', 'General Care'],
      urgency: 'high',
      colorTheme: 'from-purple-500/10 to-indigo-500/10 border-purple-200 text-purple-700 hover:border-purple-500'
    },
    {
      id: 'general',
      titleKey: 'needGeneral',
      descKey: 'needGeneralDesc',
      iconName: 'Stethoscope',
      requiredServices: ['General Care', 'Pharmacy'],
      urgency: 'normal',
      colorTheme: 'from-teal-500/10 to-emerald-500/10 border-teal-200 text-teal-700 hover:border-teal-500'
    },
    {
      id: 'diagnostics',
      titleKey: 'needDiagnostics',
      descKey: 'needDiagnosticsDesc',
      iconName: 'TestTube',
      requiredServices: ['Laboratory', 'General Care'],
      urgency: 'normal',
      colorTheme: 'from-blue-500/10 to-cyan-500/10 border-blue-200 text-blue-700 hover:border-blue-500'
    },
    {
      id: 'pharmacy',
      titleKey: 'needPharmacy',
      descKey: 'needPharmacyDesc',
      iconName: 'Pill',
      requiredServices: ['Pharmacy'],
      urgency: 'normal',
      colorTheme: 'from-emerald-500/10 to-green-500/10 border-emerald-200 text-emerald-700 hover:border-emerald-500'
    },
    {
      id: 'specialist',
      titleKey: 'needSpecialist',
      descKey: 'needSpecialistDesc',
      iconName: 'Activity',
      requiredServices: ['Specialist Care', 'Laboratory'],
      urgency: 'normal',
      colorTheme: 'from-indigo-500/10 to-violet-500/10 border-indigo-200 text-indigo-700 hover:border-indigo-500'
    }
  ];

  const getNeedIcon = (name: string) => {
    switch (name) {
      case 'Baby': return <Baby className="w-7 h-7" />;
      case 'Flame': return <Flame className="w-7 h-7" />;
      case 'HeartPulse': return <HeartPulse className="w-7 h-7" />;
      case 'Stethoscope': return <Stethoscope className="w-7 h-7" />;
      case 'TestTube': return <TestTube className="w-7 h-7" />;
      case 'Pill': return <Pill className="w-7 h-7" />;
      default: return <Activity className="w-7 h-7" />;
    }
  };

  const handleSelectNeed = (needId: HealthNeedType) => {
    setSelectedNeed(needId);
    navigate('/results');
  };

  return (
    <div className="space-y-7 pb-12">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-9 shadow-xl overflow-hidden border border-teal-800/40">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-teal-800/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-teal-100 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>{t('subTagline')}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
            {t('tagline')}
          </h1>

          {/* Location & GPS Status Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2 font-medium">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Location: <strong className="text-white font-bold">{selectedDistrict}</strong> ({selectedState})</span>
              {isLiveGpsActive && (
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-md font-bold border border-emerald-400/30">
                  Live GPS
                </span>
              )}
            </div>

            <button
              onClick={() => navigate('/location')}
              className="bg-white text-teal-950 hover:bg-teal-50 text-xs font-bold px-3 py-1.5 rounded-xl transition-all tap-target flex items-center gap-1 shadow-sm"
            >
              <span>Change</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => setIsVoiceOpen(true)}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-extrabold px-3.5 py-1.5 rounded-xl transition-all tap-target flex items-center gap-1.5 shadow-sm ml-auto"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice</span>
            </button>
          </div>
        </div>
      </section>

      {/* Emergency Mode Callout Banner */}
      <section className="bg-gradient-to-r from-emergency-600 via-emergency-700 to-rose-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-emergency-500/40">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
            <PhoneCall className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base sm:text-lg uppercase tracking-wide">
                {t('emergencyModeTitle')}
              </h2>
              <span className="bg-white text-emergency-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                108 / 104 / 102
              </span>
            </div>
            <p className="text-xs text-rose-100 mt-0.5">
              1-Tap emergency dispatch & nearest 24x7 public casualty hospitals in {selectedDistrict}.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/emergency')}
          className="w-full sm:w-auto bg-white hover:bg-rose-50 text-emergency-700 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 tap-target shrink-0 uppercase tracking-wider"
        >
          <span>Open Emergency Mode</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* User Info / Personal Offline Medical Card Snapshot */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 text-rose-600 fill-rose-100" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {userProfile ? `Emergency Pass: ${userProfile.name}` : t('medicalCardTitle')}
              </h3>
              {userProfile && (
                <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Blood: {userProfile.bloodGroup}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              {userProfile 
                ? `Kin Contact: ${userProfile.emergencyKinName || userProfile.emergencyContactName || 'Saved'} (${userProfile.emergencyKinPhone || userProfile.emergencyContactPhone}) • Offline Ready`
                : t('noProfileYet')
              }
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsMedicalModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 tap-target shrink-0"
        >
          <span>{userProfile ? 'View / Edit Health Pass' : 'Create My Health Card'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* Healthcare Need Category Picker ("What Healthcare Do You Need?") */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Step 1 of 3
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              What Healthcare Do You Need?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Select your medical requirement. The system will calculate which government hospital actually has the right doctors and equipment.
            </p>
          </div>

          <button
            onClick={() => setIsVoiceOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-900 bg-teal-50 px-3.5 py-2 rounded-xl border border-teal-200 self-start sm:self-auto shadow-2xs"
          >
            <Mic className="w-3.5 h-3.5 text-teal-700" />
            <span>Speak in Marathi / Telugu / English</span>
          </button>
        </div>

        {/* Needs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthNeeds.map((need) => (
            <button
              key={need.id}
              onClick={() => handleSelectNeed(need.id)}
              className={`group text-left p-5 rounded-2xl border-2 transition-all duration-200 bg-white hover:shadow-card hover:-translate-y-0.5 flex flex-col justify-between min-h-[160px] tap-target ${need.colorTheme}`}
              aria-label={`Select ${t(need.titleKey)}`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-white flex items-center justify-center shadow-xs transition-colors">
                    {getNeedIcon(need.iconName)}
                  </div>
                  {need.urgency === 'critical' && (
                    <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2.5 py-0.5 rounded-full animate-pulse">
                      Urgent 24x7
                    </span>
                  )}
                  {need.urgency === 'high' && (
                    <span className="text-[10px] font-bold uppercase bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">
                      Priority Care
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-900 transition-colors">
                    {t(need.titleKey)}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {t(need.descKey)}
                  </p>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs font-bold text-teal-800 group-hover:text-teal-900">
                <span>Find Equipped Facilities</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Trust & Rural Relevance Stats Bar */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x-0 md:divide-x divide-slate-100">
          <div className="p-2 space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-teal-800 block">955+</span>
            <span className="text-xs font-semibold text-slate-600">Verified Facilities</span>
          </div>
          <div className="p-2 space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">100%</span>
            <span className="text-xs font-semibold text-slate-600">Free Public Consultation</span>
          </div>
          <div className="p-2 space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block">62</span>
            <span className="text-xs font-semibold text-slate-600">Districts (MH & AP)</span>
          </div>
          <div className="p-2 space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 block">24x7</span>
            <span className="text-xs font-semibold text-slate-600">Emergency & Ambulance</span>
          </div>
        </div>
      </section>

      {/* Future Pitch Vision Roadmap */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Future Health Vision Roadmap (SIH Prototype Stage)
          </h3>
          <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Roadmap Preview
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-3.5 flex items-start justify-between opacity-80">
            <div className="space-y-1">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('teleconsultBadge')}</span>
              </div>
              <p className="text-[11px] text-slate-600">eSanjeevani rural video consults with city specialists</p>
            </div>
            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
              {t('comingSoon')}
            </span>
          </div>

          <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-3.5 flex items-start justify-between opacity-80">
            <div className="space-y-1">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('schemeCheckerBadge')}</span>
              </div>
              <p className="text-[11px] text-slate-600">Instant eligibility check for MPJAY & PMJAY</p>
            </div>
            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
              {t('comingSoon')}
            </span>
          </div>

          <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-3.5 flex items-start justify-between opacity-80">
            <div className="space-y-1">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('medicineStockBadge')}</span>
              </div>
              <p className="text-[11px] text-slate-600">Live dispensary drug availability and stock counts</p>
            </div>
            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
              {t('comingSoon')}
            </span>
          </div>
        </div>
      </section>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />

      {/* Medical Profile Modal */}
      <MedicalProfileModal isOpen={isMedicalModalOpen} onClose={() => setIsMedicalModalOpen(false)} />

    </div>
  );
};
