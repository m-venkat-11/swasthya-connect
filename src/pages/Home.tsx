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
  Heart,
  Building2,
  Calendar,
  FileText,
  Clock,
  HelpCircle
} from 'lucide-react';
import { VoiceAssistantModal } from '../components/VoiceAssistantModal';

export const Home: React.FC = () => {
  const { 
    selectedState, 
    selectedDistrict, 
    isLiveGpsActive, 
    userProfile, 
    setSelectedNeed, 
    requireAuthentication,
    openVoiceAssistant,
    t 
  } = useApp();

  const navigate = useNavigate();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

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

  const handleTalkToDoctor = () => {
    // 104 National Health Telemedicine consultation line
    window.location.href = "tel:104";
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
              onClick={() => openVoiceAssistant()}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-extrabold px-3.5 py-1.5 rounded-xl transition-all tap-target flex items-center gap-1.5 shadow-sm ml-auto"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PRIMARY "HOW CAN WE HELP YOU TODAY?" GETTING HELP FIRST ACTION HUB */}
      {/* ========================================================================= */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-black text-teal-800 uppercase tracking-widest block">
              PATIENT ACCESS & FIRST-RESPONSE
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              How can we help you today?
            </h2>
          </div>

          <button
            onClick={() => openVoiceAssistant()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 shadow-2xs transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-amber-700" />
            <span>Speak in Telugu / Hindi / EN</span>
          </button>
        </div>

        {/* 8 Intuitive Healthcare Assistance Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          
          {/* 1. I Don't Feel Well */}
          <button
            onClick={() => navigate('/screening')}
            className="p-4 rounded-2xl bg-white hover:bg-rose-50/60 border border-slate-200/90 hover:border-rose-300 transition-all text-left shadow-soft hover:shadow-card group tap-target flex flex-col justify-between min-h-[120px]"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 group-hover:text-rose-950">
                I Don't Feel Well
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Symptom triaging & right care tier
              </p>
            </div>
          </button>

          {/* 2. Find a Hospital */}
          <button
            onClick={() => navigate('/services')}
            className="p-4 rounded-2xl bg-white hover:bg-teal-50/60 border border-slate-200/90 hover:border-teal-300 transition-all text-left shadow-soft hover:shadow-card group tap-target flex flex-col justify-between min-h-[120px]"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 group-hover:text-teal-950">
                Find a Hospital
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Nearby PHC, CHC & Civil Hospitals
              </p>
            </div>
          </button>

          {/* 3. Book an Appointment */}
          <button
            onClick={() => {
              requireAuthentication("BOOK_APPOINTMENT", () => {
                navigate('/profile');
              });
            }}
            className="p-4 rounded-2xl bg-white hover:bg-blue-50/60 border border-slate-200/90 hover:border-blue-300 transition-all text-left shadow-soft hover:shadow-card group tap-target flex flex-col justify-between min-h-[120px]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 group-hover:text-blue-950">
                Book Appointment
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                OPD, ANC & Doctor consultations
              </p>
            </div>
          </button>

          {/* 4. Talk to a Doctor */}
          <button
            onClick={handleTalkToDoctor}
            className="p-4 rounded-2xl bg-white hover:bg-emerald-50/60 border border-slate-200/90 hover:border-emerald-300 transition-all text-left shadow-soft hover:shadow-card group tap-target flex flex-col justify-between min-h-[120px]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 group-hover:text-emerald-950 flex items-center gap-1">
                <span>Talk to a Doctor</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 rounded">104</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Free government telemedicine advice
              </p>
            </div>
          </button>

          {/* 5. My Referral */}
          <button
            onClick={() => navigate('/profile')}
            className="p-4 rounded-2xl bg-white hover:bg-amber-50/60 border border-slate-200/90 hover:border-amber-300 transition-all text-left shadow-soft hover:shadow-card group tap-target flex flex-col justify-between min-h-[120px]"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 group-hover:text-amber-950">
                My Referral
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Track primary to district transfers
              </p>
            </div>
          </button>

          {/* 6. My Follow-Up */}
          <button
            onClick={() => navigate('/profile')}
            className="p-4 rounded-2xl bg-white hover:bg-purple-50/60 border border-slate-200/90 hover:border-purple-300 transition-all text-left shadow-soft hover:shadow-card group tap-target flex flex-col justify-between min-h-[120px]"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 group-hover:text-purple-950">
                My Follow-Up
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Maternal ANC & vaccine reminders
              </p>
            </div>
          </button>

          {/* 7. Ask by Voice */}
          <button
            onClick={() => openVoiceAssistant()}
            className="p-4 rounded-2xl bg-white hover:bg-yellow-50/60 border border-slate-200/90 hover:border-yellow-300 transition-all text-left shadow-soft hover:shadow-card group tap-target flex flex-col justify-between min-h-[120px]"
          >
            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 group-hover:text-yellow-950 flex items-center gap-1">
                <span>🎙 Ask by Voice</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Speech-guided triage in Telugu/EN
              </p>
            </div>
          </button>

          {/* 8. I'm Not Sure What I Need */}
          <button
            onClick={() => navigate('/services')}
            className="p-4 rounded-2xl bg-white hover:bg-indigo-50/60 border border-slate-200/90 hover:border-indigo-300 transition-all text-left shadow-soft hover:shadow-card group tap-target flex flex-col justify-between min-h-[120px]"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 group-hover:text-indigo-950">
                I'm Not Sure
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Browse by clinical symptoms
              </p>
            </div>
          </button>

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
          onClick={() => navigate('/profile')}
          className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 tap-target shrink-0"
        >
          <span>{userProfile ? 'View / Edit Health Pass' : 'Create My Health Card'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Healthcare Need Category Picker ("What Healthcare Do You Need?") */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Step 1 of 3
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t('step1Title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t('step1Subtitle')}
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Verified Public Facilities: <span className="font-bold text-teal-800">4,720+</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {healthNeeds.map((need) => (
            <button
              key={need.id}
              onClick={() => handleSelectNeed(need.id)}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all hover:shadow-card hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px] tap-target bg-gradient-to-br ${need.colorTheme}`}
            >
              <div className="space-y-2.5">
                <div className="w-12 h-12 rounded-xl bg-white/80 shadow-xs flex items-center justify-center">
                  {getNeedIcon(need.iconName)}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    {t(need.titleKey)}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2 mt-0.5">
                    {t(need.descKey)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>View Facilities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Priority Rural Districts Focus Banner */}
      <section className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs text-teal-400 font-bold uppercase tracking-wider">
              Rural & Underserved Focus
            </div>
            <h3 className="text-lg font-bold">
              Demonstrating Remote Agency & Tribal Districts
            </h3>
          </div>

          <button
            onClick={() => navigate('/location')}
            className="text-xs text-teal-300 hover:text-white font-bold flex items-center gap-1"
          >
            <span>Change Active District</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          SwasthyaConnect prioritizes public healthcare facilities across remote tribal belts in Maharashtra (Gadchiroli, Nandurbar, Palghar) and Andhra Pradesh (Alluri Sitharama Raju, Parvathipuram Manyam) where tertiary private hospitals do not exist.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
            <span className="font-bold text-teal-400 block">Gadchiroli Agency</span>
            <span className="text-slate-300">Forest tribal belt, sub-centres & river-crossing CHC network</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
            <span className="font-bold text-teal-400 block">Nandurbar Satpura</span>
            <span className="text-slate-300">Hilly mountain clusters with dedicated maternal emergency response</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
            <span className="font-bold text-teal-400 block">Alluri Sitharama Raju</span>
            <span className="text-slate-300">Agency tribal tracts with high institutional delivery focus</span>
          </div>
        </div>
      </section>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />

    </div>
  );
};
