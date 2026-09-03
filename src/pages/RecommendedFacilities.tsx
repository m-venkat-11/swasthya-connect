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
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const RecommendedFacilities: React.FC = () => {
  const { 
    facilities, 
    selectedNeed, 
    selectedDistrict, 
    selectedState, 
    userCoords,
    isLiveGpsActive,
    loadLiveNearbyHospitals
  } = useApp();

  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sectorFilter, setSectorFilter] = useState<'all' | 'govt' | 'private'>('all');
  const [keywordFilter, setKeywordFilter] = useState('');
  const [isRefreshingRadar, setIsRefreshingRadar] = useState(false);
  const [selectedFacilityForExplanation, setSelectedFacilityForExplanation] = useState<FacilityRecommendation | null>(null);

  const handleRefreshRadar = async () => {
    if (userCoords) {
      setIsRefreshingRadar(true);
      await loadLiveNearbyHospitals(userCoords.lat, userCoords.lng, selectedDistrict, selectedState);
      setTimeout(() => setIsRefreshingRadar(false), 800);
    }
  };

  // Compute recommendations
  const allRecommendations = useMemo(() => {
    return rankFacilitiesForNeed(facilities, selectedNeed, selectedDistrict, userCoords || undefined);
  }, [facilities, selectedNeed, selectedDistrict, userCoords]);

  // Filter based on sector (all, govt, private) and keyword
  const filteredRecommendations = useMemo(() => {
    return allRecommendations.filter(rec => {
      let matchesSector = true;
      if (sectorFilter === 'govt') matchesSector = rec.facility.is_govt;
      else if (sectorFilter === 'private') matchesSector = !rec.facility.is_govt;

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

      {/* Live GPS Radar vs District Master Database Banner */}
      {isLiveGpsActive && userCoords ? (
        <div className="bg-emerald-50 border border-emerald-300/80 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <div className="text-xs text-emerald-950 font-medium">
              <strong className="font-bold text-emerald-900">Live Device GPS Active:</strong> Showing nearby Government & Private hospitals within 45 km radius of your physical coordinates.
              <span className="text-emerald-700 text-[11px] block sm:inline sm:ml-1.5 font-semibold">
                (GPS: {userCoords.lat.toFixed(4)}°N, {userCoords.lng.toFixed(4)}°E)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full">
              Live GPS Satellite Radar
            </span>
            <button
              onClick={handleRefreshRadar}
              disabled={isRefreshingRadar}
              className="text-[11px] font-bold text-teal-800 hover:text-teal-950 bg-white hover:bg-emerald-100/60 border border-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-2xs transition-all active:scale-95"
              title="Rescan nearby hospitals"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshingRadar ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Rescan</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              <strong>District Master Directory:</strong> Showing verified healthcare facilities in <strong>{selectedDistrict}, {selectedState}</strong> from official database. Distances measured from district center.
            </span>
          </div>
          <Link
            to="/location"
            className="text-[11px] font-bold text-teal-800 hover:text-teal-950 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs shrink-0 flex items-center gap-1 hover:bg-slate-100 transition-colors"
          >
            <span>📡 Use Current GPS</span>
          </Link>
        </div>
      )}

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
            <span>Distance: <strong className="text-white">{topRecommended.distanceKm} km</strong> (~{topRecommended.estimatedTravelMinutes} mins) {isLiveGpsActive ? '(from GPS)' : '(from District Center)'}</span>
            <span>•</span>
            <span className={topRecommended.facility.is_govt ? "text-emerald-300 font-bold" : "text-amber-300 font-bold"}>
              {topRecommended.facility.is_govt ? "100% Free Public Care" : "Private Multi-Specialty Facility"}
            </span>
          </div>
        </div>
      )}

      {/* Filter & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-soft">
        
        {/* Sector Tabs: All vs Govt vs Private */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setSectorFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-target ${
              sectorFilter === 'all'
                ? 'bg-teal-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Facilities (Govt & Private: {allRecommendations.length})</span>
          </button>

          <button
            onClick={() => setSectorFilter('govt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-target flex items-center gap-1.5 ${
              sectorFilter === 'govt'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Government ({allRecommendations.filter(r => r.facility.is_govt).length})</span>
          </button>

          <button
            onClick={() => setSectorFilter('private')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-target flex items-center gap-1.5 ${
              sectorFilter === 'private'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Private Hospitals ({allRecommendations.filter(r => !r.facility.is_govt).length})</span>
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
