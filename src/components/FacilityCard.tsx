import React from 'react';
import { Link } from 'react-router-dom';
import type { FacilityRecommendation } from '../types';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  MapPin, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle,
  Building2,
  Navigation,
  AlertTriangle
} from 'lucide-react';

interface FacilityCardProps {
  recommendation: FacilityRecommendation;
  onOpenExplanation?: (rec: FacilityRecommendation) => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({ 
  recommendation,
  onOpenExplanation
}) => {
  const { t } = useApp();
  const { 
    facility, 
    accessibilityScore, 
    distanceKm, 
    estimatedTravelMinutes, 
    isRecommended, 
    hasRequiredService,
    hasEmergencyCapability,
    comparisonNote 
  } = recommendation;

  // Score color coding
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 70) return 'bg-teal-100 text-teal-800 border-teal-300';
    return 'bg-amber-100 text-amber-800 border-amber-300';
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${facility.name}, ${facility.address}, ${facility.district}, ${facility.state}`
  )}`;

  // Mobile dialer sanitized phone
  const cleanPhone = facility.phone.replace(/[^0-9+]/g, '');

  return (
    <div className={`relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
      isRecommended 
        ? 'border-teal-600 ring-2 ring-teal-600/20 shadow-card bg-gradient-to-b from-teal-50/30 to-white' 
        : 'border-slate-200 hover:border-slate-300 shadow-soft'
    }`}>
      
      {/* Top Banner for Top Recommendation */}
      {isRecommended && (
        <div className="bg-teal-700 text-white px-4 py-2 flex items-center justify-between text-xs font-bold tracking-wide">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span className="uppercase">TOP RECOMMENDED PUBLIC FACILITY</span>
          </div>
          <span className="bg-teal-800 text-teal-100 px-2 py-0.5 rounded-full text-[11px]">
            Best Match for Need
          </span>
        </div>
      )}

      <div className="p-4 sm:p-5 space-y-3.5">
        
        {/* Header: Name, Badges & Accessibility Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${
                facility.is_govt 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                <Building2 className="w-3 h-3" />
                {facility.is_govt ? t('govtBadge') : t('privateBadge')}
              </span>

              <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full">
                {facility.category}
              </span>

              {hasEmergencyCapability && (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold">
                  24x7 Emergency
                </span>
              )}
            </div>

            {/* Facility Name */}
            <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
              <Link to={`/facility/${facility.id}`} className="hover:text-teal-700 transition-colors">
                {facility.name}
              </Link>
            </h3>

            {/* Location & Distance */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="truncate max-w-[200px]">{facility.address}</span>
              </span>
              <span className="flex items-center gap-1 font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{distanceKm} km (~{estimatedTravelMinutes} mins)</span>
              </span>
            </div>
          </div>

          {/* Accessibility Score Pill */}
          <div className="shrink-0 text-center">
            <div className={`border rounded-xl px-2.5 py-1.5 shadow-sm ${getScoreColor(accessibilityScore)}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider block leading-none">Score</span>
              <span className="text-lg sm:text-xl font-extrabold leading-tight">{accessibilityScore}</span>
              <span className="text-[10px] text-slate-600 block">/100</span>
            </div>
          </div>
        </div>

        {/* Comparative Decision / Why We Recommend Callout */}
        {comparisonNote && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs text-slate-700 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-900 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-teal-600" /> Why this facility:
              </span>
              {onOpenExplanation && (
                <button
                  onClick={() => onOpenExplanation(recommendation)}
                  className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold underline flex items-center gap-0.5"
                >
                  <HelpCircle className="w-3 h-3" /> Compare details
                </button>
              )}
            </div>
            <p className="text-slate-600 leading-relaxed">
              {comparisonNote}
            </p>
          </div>
        )}

        {/* Warning if closer facility lacks services */}
        {!hasRequiredService && (
          <div className="bg-amber-50 text-amber-800 p-2.5 rounded-lg text-xs flex items-center gap-2 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Note: This facility offers general care but lacks specialized staff for this exact need.</span>
          </div>
        )}

        {/* Services Chips */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Available Services:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {facility.services.map((srv, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md border border-slate-200/60"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {srv}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Meta & Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Trust indicator timestamp */}
          <div className="text-[11px] text-slate-700">
            <span>{t('lastUpdated')}: {facility.last_updated}</span>
            <span className="text-slate-300 mx-1.5">•</span>
            <span className="text-emerald-700 font-medium">Public Records</span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${cleanPhone || facility.phone}`}
              className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all tap-target shadow-sm"
              aria-label={`Call ${facility.name} on ${facility.phone}`}
            >
              <PhoneCall className="w-4 h-4 text-teal-300" />
              <span>{t('callNow')}</span>
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all tap-target shadow-sm"
              aria-label={`Directions to ${facility.name}`}
            >
              <Navigation className="w-4 h-4" />
              <span>{t('getDirections')}</span>
            </a>

            <Link
              to={`/facility/${facility.id}`}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-3 py-2.5 rounded-xl transition-all tap-target flex items-center justify-center"
            >
              {t('viewDetails')}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
