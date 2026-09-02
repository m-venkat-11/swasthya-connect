import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from '../components/InteractiveMap';
import { rankFacilitiesForNeed } from '../utils/recommendationEngine';
import { 
  ArrowLeft, 
  MapPin, 
  PhoneCall, 
  User, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Navigation, 
  Clock
} from 'lucide-react';

export const FacilityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { facilities, selectedNeed, t } = useApp();

  const facility = facilities.find(f => f.id === id);

  if (!facility) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto my-12">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Facility Not Found</h2>
        <p className="text-xs text-slate-700">The healthcare facility requested could not be located in the current district records.</p>
        <button
          onClick={() => navigate('/results')}
          className="px-5 py-2.5 bg-teal-700 text-white font-bold text-xs rounded-xl"
        >
          Back to Results
        </button>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${facility.name}, ${facility.address}, ${facility.district}, ${facility.state}`
  )}`;

  // Wrap in recommendation structure for mini map
  const singleRec = rankFacilitiesForNeed([facility], selectedNeed, facility.district)[0] || {
    facility,
    accessibilityScore: 90,
    distanceKm: 12,
    estimatedTravelMinutes: 25,
    isRecommended: true,
    hasRequiredService: true,
    hasEmergencyCapability: facility.services.includes('Emergency Care'),
    is24x7: true,
    matchReasons: ['Verified District Facility'],
    missingServices: [],
    scoreBreakdown: { serviceMatch: 35, emergencyReadiness: 20, publicPriority: 20, distanceConvenience: 10, freshnessTrust: 5 }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-14">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all tap-target"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('back')}</span>
      </button>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-950 text-white p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              facility.is_govt 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
            }`}>
              <Building2 className="w-3.5 h-3.5" />
              {facility.is_govt ? 'Government Public Facility' : 'Empanelled Private Hospital'}
            </span>

            <span className="bg-white/10 text-teal-100 border border-white/15 px-3 py-1 rounded-full">
              {facility.category}
            </span>

            {facility.services.includes('Emergency Care') && (
              <span className="bg-red-500/20 text-red-200 border border-red-400/30 px-3 py-1 rounded-full font-bold">
                24x7 Casualty & Emergency
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
            {facility.name}
          </h1>

          <p className="text-xs sm:text-sm text-teal-100 flex items-start sm:items-center gap-1.5 max-w-2xl">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
            <span>{facility.address}, {facility.district}, {facility.state} — Pincode: <strong>{facility.pincode}</strong></span>
          </p>
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Direct Contact:</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">{facility.phone}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={`tel:${facility.phone}`}
              className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all tap-target shadow-md"
            >
              <PhoneCall className="w-4 h-4 text-teal-300" />
              <span>{t('callNow')}</span>
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all tap-target shadow-md shadow-teal-700/20"
            >
              <Navigation className="w-4 h-4" />
              <span>{t('getDirections')} (Google Maps)</span>
            </a>
          </div>
        </div>

        {/* Detail Content Grid */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Key Meta Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold uppercase tracking-wider">
                <User className="w-4 h-4 text-teal-700" />
                <span>Medical In-Charge</span>
              </div>
              <p className="font-bold text-sm text-slate-900">{facility.contact_person || "Civil Surgeon / Medical Superintendent"}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4 text-teal-700" />
                <span>Operating Hours</span>
              </div>
              <p className="font-bold text-sm text-slate-900">
                {facility.services.includes('Emergency Care') ? "24 Hours (Emergency & Inpatient)" : "8:00 AM – 4:00 PM (OPD)"}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Public Health Coverage</span>
              </div>
              <p className="font-bold text-sm text-emerald-800">
                {facility.is_govt ? "100% Free Public Hospital" : "Cashless Aarogyasri / PMJAY"}
              </p>
            </div>

          </div>

          {/* Services Offered */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700" />
              <span>{t('servicesOffered')} at this Facility:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {facility.services.map((service, index) => (
                <div 
                  key={index}
                  className="bg-teal-50/60 border border-teal-200/80 p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-teal-900"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Map Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-700" />
                <span>Facility Map Pin & Surroundings:</span>
              </h3>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
              >
                <span>Open in Full Navigation</span>
                <Navigation className="w-3 h-3" />
              </a>
            </div>

            <InteractiveMap
              recommendations={[singleRec]}
              height="300px"
            />
          </div>

          {/* Trust Metadata & Verification Note */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5 text-teal-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Data Freshness & Provenance</span>
              </span>
              <span className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                {t('lastUpdated')}: {facility.last_updated}
              </span>
            </div>
            <p className="leading-relaxed">
              <strong>Source:</strong> {facility.data_source}. Compiled from official State Health Department master facility records.
            </p>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
              {t('callAheadDisclaimer')}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
