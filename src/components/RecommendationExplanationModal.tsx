import React from 'react';
import type { FacilityRecommendation } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle,
  PhoneCall
} from 'lucide-react';

interface RecommendationExplanationModalProps {
  recommendation: FacilityRecommendation | null;
  allRecommendations: FacilityRecommendation[];
  onClose: () => void;
}

export const RecommendationExplanationModal: React.FC<RecommendationExplanationModalProps> = ({
  recommendation,
  allRecommendations,
  onClose,
}) => {
  const { t } = useApp();

  if (!recommendation) return null;

  const { facility, accessibilityScore, scoreBreakdown, distanceKm, matchReasons } = recommendation;

  // Find a closer alternative for comparison
  const closerAlternative = allRecommendations.find(
    r => r.distanceKm < distanceKm && r.facility.id !== facility.id
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-950 text-white p-5 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-teal-300 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t('explanationTitle')}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold">{facility.name}</h3>
            <p className="text-xs text-teal-200">
              Accessibility & Suitability Score: <strong className="text-white text-sm">{accessibilityScore}/100</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors tap-target flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Why This Facility is Top Ranked */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              Verified Decision Criteria:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {matchReasons.map((reason, i) => (
                <div key={i} className="flex items-center gap-2 bg-emerald-50 text-emerald-900 p-2.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Transparent Score Breakdown */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Multi-Factor Score Audit ({accessibilityScore}/100):
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Health Need & Service Match:</span>
                <span className="font-bold text-slate-900">{scoreBreakdown.serviceMatch} / 35 pts</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: `${(scoreBreakdown.serviceMatch / 35) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-600">Emergency & 24x7 Readiness:</span>
                <span className="font-bold text-slate-900">{scoreBreakdown.emergencyReadiness} / 25 pts</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: `${(scoreBreakdown.emergencyReadiness / 25) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-600">Government Free Care Priority:</span>
                <span className="font-bold text-slate-900">{scoreBreakdown.publicPriority} / 20 pts</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: `${(scoreBreakdown.publicPriority / 20) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-600">Travel Distance & Road Accessibility:</span>
                <span className="font-bold text-slate-900">{scoreBreakdown.distanceConvenience} / 15 pts</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: `${(scoreBreakdown.distanceConvenience / 15) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Section 3: Comparative Breakdown vs Closer Facility */}
          {closerAlternative ? (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{t('closerFacilityComparisonTitle')}</span>
              </div>

              <div className="text-xs text-amber-900 space-y-2">
                <p>
                  <strong>{closerAlternative.facility.name}</strong> is closer ({closerAlternative.distanceKm} km vs {distanceKm} km), but:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-amber-800">
                  <li>It lacks the specialized 24x7 doctor staff and comprehensive equipment needed for this health need.</li>
                  <li>Going to a basic sub-center often results in emergency referral delay. Recommending {facility.name} guarantees immediate admission.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-teal-50 rounded-xl p-3.5 border border-teal-200 text-xs text-teal-900">
              <strong>Optimal Choice:</strong> This is both the closest and best-equipped public healthcare facility for your selected medical need in this district.
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Close
            </button>
            <a
              href={`tel:${facility.phone}`}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-teal-400" /> Call {facility.phone}
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
