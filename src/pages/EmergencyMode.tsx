import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { rankFacilitiesForNeed } from '../utils/recommendationEngine';
import { HELPLINES } from '../data/translations';
import { 
  PhoneCall, 
  AlertCircle, 
  MapPin, 
  ArrowLeft, 
  Navigation, 
  Ambulance,
  HeartPulse,
  Baby,
  ShieldAlert
} from 'lucide-react';

export const EmergencyMode: React.FC = () => {
  const { facilities, selectedDistrict, t } = useApp();
  const navigate = useNavigate();

  // Find all emergency-equipped facilities in the current district
  const emergencyFacilities = useMemo(() => {
    const recs = rankFacilitiesForNeed(facilities, 'emergency', selectedDistrict);
    return recs.filter(r => r.hasEmergencyCapability || r.is24x7);
  }, [facilities, selectedDistrict]);

  const getHelplineIcon = (icon: string) => {
    switch (icon) {
      case 'Ambulance': return <Ambulance className="w-6 h-6" />;
      case 'Baby': return <Baby className="w-6 h-6" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6" />;
      default: return <PhoneCall className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6 pb-14">
      
      {/* Top Back and Location Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all tap-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <div className="flex items-center gap-1 text-xs text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          <MapPin className="w-3.5 h-3.5 text-emergency-600" />
          <span>Active: <strong>{selectedDistrict}</strong></span>
          <Link to="/location" className="text-teal-700 font-bold ml-1 hover:underline">
            (Change)
          </Link>
        </div>
      </div>

      {/* Big Urgent Red Callout Header */}
      <div className="bg-gradient-to-br from-emergency-700 via-emergency-600 to-rose-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase">
          <AlertCircle className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>URGENT MEDICAL RESPONSE 24x7</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          {t('emergencyModeTitle')}
        </h1>

        <p className="text-xs sm:text-sm text-rose-100 max-w-2xl leading-relaxed">
          {t('emergencySubtitle')} Tap any helpline below for direct 1-tap connection or head to the nearest emergency public hospital.
        </p>
      </div>

      {/* Primary Emergency Helplines Grid (Large Tap-to-Call Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {HELPLINES.map((helpline) => (
          <a
            key={helpline.number}
            href={`tel:${helpline.number}`}
            className="group bg-white hover:bg-rose-50/50 border-2 border-slate-200 hover:border-emergency-600 rounded-2xl p-5 shadow-soft hover:shadow-lg transition-all duration-200 flex items-center justify-between gap-4 tap-target"
            aria-label={`Call ${helpline.number}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emergency-100 text-emergency-700 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-emergency-600 group-hover:text-white transition-all shadow-sm">
                {getHelplineIcon(helpline.icon)}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {t(helpline.titleKey)}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight group-hover:text-emergency-700 transition-colors">
                  {helpline.number}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {helpline.descKey}
                </p>
              </div>
            </div>

            <div className="bg-emergency-600 group-hover:bg-emergency-700 text-white p-3 rounded-xl shadow-md shrink-0 flex items-center justify-center">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
          </a>
        ))}
      </div>

      {/* Nearest Emergency-Ready Public Hospitals in District */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-emergency-600" />
              <span>{t('nearestEmergencyHospitals')}</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Government hospitals & CHCs with 24x7 casualty departments in {selectedDistrict}.
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {emergencyFacilities.map((rec) => {
            const { facility, distanceKm, estimatedTravelMinutes } = rec;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${facility.name}, ${facility.address}, ${facility.district}, ${facility.state}`
            )}`;

            return (
              <div 
                key={facility.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-soft hover:shadow-md transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                      <span className="bg-emergency-100 text-emergency-800 px-2.5 py-0.5 rounded-full border border-emergency-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-emergency-600" /> 24x7 Casualty & Trauma
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {facility.is_govt ? 'Government Hospital' : 'Empanelled Private'}
                      </span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
                      <Link to={`/facility/${facility.id}`} className="hover:text-emergency-700 transition-colors">
                        {facility.name}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{facility.address}</span>
                    </p>
                  </div>

                  {/* Distance & Travel Time */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center shrink-0 self-start sm:self-auto">
                    <span className="text-xs text-slate-500 font-medium block">Distance</span>
                    <span className="text-sm sm:text-base font-black text-slate-900">{distanceKm} km</span>
                    <span className="text-[10px] text-teal-700 font-bold block">~{estimatedTravelMinutes} mins</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs font-mono font-bold text-slate-700">
                    Phone: {facility.phone}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${facility.phone}`}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all tap-target shadow-sm"
                    >
                      <PhoneCall className="w-4 h-4 text-teal-300" />
                      <span>{t('callNow')}</span>
                    </a>

                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emergency-600 hover:bg-emergency-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all tap-target shadow-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
