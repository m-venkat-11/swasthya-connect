import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { rankFacilitiesForNeed } from '../utils/recommendationEngine';
import { FacilityCard } from '../components/FacilityCard';
import { InteractiveMap } from '../components/InteractiveMap';
import { RecommendationExplanationModal } from '../components/RecommendationExplanationModal';
import type { FacilityRecommendation } from '../types';
import { 
  MapPin, 
  Sparkles, 
  List, 
  Map, 
  Building2, 
  HelpCircle, 
  ArrowLeft,
  Search,
  ShieldCheck
} from 'lucide-react';

export const RecommendedFacilities: React.FC = () => {
  const { 
    facilities, 
    selectedNeed, 
    selectedDistrict, 
    selectedState, 
    userCoords
  } = useApp();

  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sectorFilter, setSectorFilter] = useState<'all' | 'govt'>('govt');
  const [keywordFilter, setKeywordFilter] = useState('');
  const [selectedFacilityForExplanation, setSelectedFacilityForExplanation] = useState<FacilityRecommendation | null>(null);

  // Compute recommendations
  const allRecommendations = useMemo(() => {
    return rankFacilitiesForNeed(facilities, selectedNeed, selectedDistrict, userCoords || undefined);
  }, [facilities, selectedNeed, selectedDistrict, userCoords]);

  // Filter based on sector and keyword
  const filteredRecommendations = useMemo(() => {
    return allRecommendations.filter(rec => {
      const matchesSector = sectorFilter === 'all' ? true : rec.facility.is_govt;
      const matchesKeyword = keywordFilter.trim() === '' ? true : (
        rec.facility.name.toLowerCase().includes(keywordFilter.toLowerCase()) ||
        rec.facility.address.toLowerCase().includes(keywordFilter.toLowerCase()) ||
        rec.facility.category.toLowerCase().includes(keywordFilter.toLowerCase())
      );
      return matchesSector && matchesKeyword;
    });
  }, [allRecommendations, sectorFilter, keywordFilter]);

  const topRecommended = allRecommendations.find(r => r.isRecommended);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Breadcrumb / Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors tap-target flex items-center justify-center"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
              Evaluated for: <span className="text-slate-900 capitalize">{selectedNeed.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="font-semibold text-slate-900">{selectedDistrict}, {selectedState}</span>
              <Link to="/location" className="text-teal-700 hover:underline text-[11px] ml-1 font-bold">
                (Change)
              </Link>
            </div>
          </div>
        </div>

        {/* View Switcher: List vs Map */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all tap-target flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>List</span>
          </button>

          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all tap-target flex items-center gap-1.5 ${
              viewMode === 'map'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Decision Intelligence Highlight: Why We Recommend Top Facility */}
      {topRecommended && (
        <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white rounded-2xl p-5 sm:p-6 shadow-card space-y-3 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-teal-600/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 bg-teal-700/80 border border-teal-500/40 text-teal-100 text-xs font-bold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>SMART DECISION RECOMMENDATION</span>
            </div>

            <button
              onClick={() => setSelectedFacilityForExplanation(topRecommended)}
              className="text-xs font-bold text-teal-200 hover:text-white underline flex items-center gap-1 tap-target"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Full Decision Audit</span>
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Recommended: {topRecommended.facility.name}
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed max-w-3xl">
              {topRecommended.comparisonNote}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-teal-200">
            <span className="flex items-center gap-1 font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Suitability Score: <strong className="text-emerald-300 text-sm">{topRecommended.accessibilityScore}/100</strong>
            </span>
            <span>•</span>
            <span>Distance: <strong className="text-white">{topRecommended.distanceKm} km</strong> (~{topRecommended.estimatedTravelMinutes} mins)</span>
            <span>•</span>
            <span className="text-emerald-300 font-bold">100% Free Public Care</span>
          </div>
        </div>
      )}

      {/* Filter & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-soft">
        
        {/* Sector Tabs: Govt vs All */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSectorFilter('govt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-target flex items-center gap-1.5 ${
              sectorFilter === 'govt'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Government First</span>
          </button>

          <button
            onClick={() => setSectorFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-target ${
              sectorFilter === 'all'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Facilities ({allRecommendations.length})</span>
          </button>
        </div>

        {/* Keyword Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search name, category, mandal..."
            value={keywordFilter}
            onChange={(e) => setKeywordFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
          />
        </div>
      </div>

      {/* Interactive Map View */}
      {viewMode === 'map' && (
        <div className="space-y-2">
          <InteractiveMap
            recommendations={filteredRecommendations}
            userCoords={userCoords}
            height="460px"
          />
          <p className="text-[11px] text-slate-700 text-center font-medium">
            💡 Tap any pin on the map to view hospital details, accessibility score, and turn-by-turn directions.
          </p>
        </div>
      )}

      {/* Facility Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-700 font-semibold px-1">
          <span>Showing {filteredRecommendations.length} facilities ranked by accessibility score</span>
          <span>District: {selectedDistrict}</span>
        </div>

        {filteredRecommendations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No matching facilities found</h3>
            <p className="text-xs text-slate-700 max-w-md mx-auto">
              Try switching the filter to "All Facilities" or searching in an adjacent district.
            </p>
            <button
              onClick={() => { setSectorFilter('all'); setKeywordFilter(''); }}
              className="px-4 py-2 bg-teal-700 text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.map((rec) => (
              <FacilityCard
                key={rec.facility.id}
                recommendation={rec}
                onOpenExplanation={(r) => setSelectedFacilityForExplanation(r)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recommendation Audit Modal */}
      <RecommendationExplanationModal
        recommendation={selectedFacilityForExplanation}
        allRecommendations={allRecommendations}
        onClose={() => setSelectedFacilityForExplanation(null)}
      />

    </div>
  );
};
