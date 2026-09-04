import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { rankFacilitiesForNeed } from '../utils/recommendationEngine';
import { FacilityCard } from '../components/FacilityCard';
import { MedicalStoreCard } from '../components/MedicalStoreCard';
import { InteractiveMap } from '../components/InteractiveMap';
import { RecommendationExplanationModal } from '../components/RecommendationExplanationModal';
import type { FacilityRecommendation } from '../types';
import { DISTRICT_COORDINATES } from '../data/districtCoordinates';
import {
  MapPin, Sparkles, List, Map, Building2, HelpCircle, ArrowLeft,
  Search, ShieldCheck, RefreshCw, ChevronDown, Pill, Hospital,
  Loader2, Wifi
} from 'lucide-react';

type MainTab = 'hospitals' | 'stores';

export const RecommendedFacilities: React.FC = () => {
  const {
    facilities,
    selectedNeed,
    selectedDistrict,
    setSelectedDistrict,
    selectedState,
    setSelectedState,
    userCoords,
    isLiveGpsActive,
    loadLiveNearbyHospitals,
    loadOsmDistrictHospitals,
    medicalStores,
    isLoadingStores,
    loadMedicalStores,
  } = useApp();

  const navigate = useNavigate();

  // Tab states
  const [mainTab, setMainTab] = useState<MainTab>('hospitals');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sectorFilter, setSectorFilter] = useState<'all' | 'govt' | 'private'>('all');
  const [keywordFilter, setKeywordFilter] = useState('');
  const [isRefreshingRadar, setIsRefreshingRadar] = useState(false);
  const [isLoadingOsm, setIsLoadingOsm] = useState(false);
  const [selectedFacilityForExplanation, setSelectedFacilityForExplanation] = useState<FacilityRecommendation | null>(null);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');

  // All available districts for quick-switch
  const allDistricts = useMemo(() =>
    Object.entries(DISTRICT_COORDINATES).map(([name, data]) => ({ name, state: data.state }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const filteredDistrictList = useMemo(() =>
    districtSearch.trim()
      ? allDistricts.filter(d =>
          d.name.toLowerCase().includes(districtSearch.toLowerCase()) ||
          d.state.toLowerCase().includes(districtSearch.toLowerCase()))
      : allDistricts,
    [allDistricts, districtSearch]
  );

  // Load OSM hospitals for this district on mount and when district changes
  useEffect(() => {
    setIsLoadingOsm(true);
    loadOsmDistrictHospitals(selectedDistrict, selectedState)
      .finally(() => setIsLoadingOsm(false));
  }, [selectedDistrict, selectedState]);

  // Load medical stores on mount and when district/gps changes
  useEffect(() => {
    if (isLiveGpsActive && userCoords) {
      loadMedicalStores(selectedDistrict, selectedState, userCoords.lat, userCoords.lng);
    } else {
      loadMedicalStores(selectedDistrict, selectedState);
    }
  }, [selectedDistrict, selectedState, isLiveGpsActive, userCoords]);

  const handleRefreshRadar = async () => {
    if (isLiveGpsActive && userCoords) {
      setIsRefreshingRadar(true);
      await loadLiveNearbyHospitals(userCoords.lat, userCoords.lng, selectedDistrict, selectedState);
      await loadMedicalStores(selectedDistrict, selectedState, userCoords.lat, userCoords.lng);
      setTimeout(() => setIsRefreshingRadar(false), 800);
    }
  };

  const handleDistrictSwitch = (districtName: string, stateName: string) => {
    setSelectedDistrict(districtName);
    setSelectedState(stateName);
    setShowDistrictPicker(false);
    setDistrictSearch('');
  };

  // Only use GPS coords when GPS mode is truly active
  const effectiveCoords = (isLiveGpsActive && userCoords) ? userCoords : undefined;

  const allRecommendations = useMemo(() =>
    rankFacilitiesForNeed(facilities, selectedNeed, selectedDistrict, effectiveCoords),
    [facilities, selectedNeed, selectedDistrict, effectiveCoords]
  );

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

  // Count by source for stats
  const osmCount = allRecommendations.filter(r =>
    (r.facility.data_source || '').toLowerCase().includes('osm')).length;
  const excelCount = allRecommendations.length - osmCount;

  return (
    <div className="space-y-5 pb-12">

      {/* ── Top Breadcrumb Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/')} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors tap-target flex items-center justify-center" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
              Evaluated for: <span className="text-slate-900 capitalize">{selectedNeed.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              {/* District Quick-Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowDistrictPicker(v => !v)}
                  className="flex items-center gap-1 font-semibold text-slate-900 hover:text-teal-700 transition-colors"
                >
                  <span>{selectedDistrict}, {selectedState}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {showDistrictPicker && (
                  <div className="absolute top-7 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-72 overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search district or state..."
                          value={districtSearch}
                          onChange={e => setDistrictSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredDistrictList.slice(0, 60).map(d => (
                        <button
                          key={d.name}
                          onClick={() => handleDistrictSwitch(d.name, d.state)}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-teal-50 transition-colors flex items-center justify-between ${
                            d.name === selectedDistrict ? 'bg-teal-50 font-bold text-teal-800' : 'text-slate-700'
                          }`}
                        >
                          <span>{d.name}</span>
                          <span className="text-[10px] text-slate-400">{d.state}</span>
                        </button>
                      ))}
                    </div>
                    <div className="p-2 border-t border-slate-100">
                      <Link to="/location" className="block text-center text-xs text-teal-700 font-bold hover:underline">
                        See All Districts & State Map →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all tap-target flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            <List className="w-4 h-4" /><span>List</span>
          </button>
          <button onClick={() => setViewMode('map')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all tap-target flex items-center gap-1.5 ${viewMode === 'map' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            <Map className="w-4 h-4" /><span>Map</span>
          </button>
        </div>
      </div>

      {/* ── GPS / District Mode Banner ── */}
      {isLiveGpsActive && userCoords ? (
        <div className="bg-emerald-50 border border-emerald-300/80 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <div className="text-xs text-emerald-950 font-medium">
              <strong className="font-bold text-emerald-900">Live Device GPS Active:</strong>{' '}
              Showing hospitals & stores within 35 km of your location
              <span className="text-emerald-700 text-[11px] block sm:inline sm:ml-1.5 font-semibold">
                (GPS: {userCoords.lat.toFixed(4)}°N, {userCoords.lng.toFixed(4)}°E)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full">📡 Live GPS</span>
            <button
              onClick={handleRefreshRadar}
              disabled={isRefreshingRadar}
              className="text-[11px] font-bold text-teal-800 hover:text-teal-950 bg-white hover:bg-emerald-100/60 border border-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-2xs transition-all active:scale-95"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshingRadar ? 'animate-spin' : ''}`} />
              <span>Rescan</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              <strong>District Directory:</strong> {selectedDistrict}, {selectedState} —{' '}
              {isLoadingOsm ? (
                <span className="text-teal-600 font-semibold inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading live OSM data...
                </span>
              ) : (
                <span>
                  <span className="text-teal-700 font-bold">{osmCount} live OSM</span> + <span className="text-slate-600 font-semibold">{excelCount} official</span> records
                </span>
              )}
            </span>
          </div>
          <Link to="/location" className="text-[11px] font-bold text-teal-800 hover:text-teal-950 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs shrink-0 flex items-center gap-1 hover:bg-slate-100 transition-colors">
            <Wifi className="w-3 h-3" /> Use Live GPS
          </Link>
        </div>
      )}

      {/* ── Data source stats strip ── */}
      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full font-semibold">
          🗺️ Live OSM Maps: {osmCount}
        </span>
        <span className="flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full font-medium">
          📋 Official Excel DB: {excelCount}
        </span>
        {isLiveGpsActive && (
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
            📡 GPS Active
          </span>
        )}
      </div>

      {/* ── Main Tabs: Hospitals | Stores ── */}
      <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 gap-1.5 shadow-soft">
        <button
          onClick={() => setMainTab('hospitals')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
            mainTab === 'hospitals'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Hospital className="w-4 h-4" />
          Hospitals & Clinics
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${mainTab === 'hospitals' ? 'bg-teal-600 text-teal-100' : 'bg-slate-100 text-slate-600'}`}>
            {allRecommendations.length}
          </span>
        </button>
        <button
          onClick={() => setMainTab('stores')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
            mainTab === 'stores'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Pill className="w-4 h-4" />
          Medical Stores
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${mainTab === 'stores' ? 'bg-purple-500 text-purple-100' : 'bg-slate-100 text-slate-600'}`}>
            {medicalStores.length}
          </span>
        </button>
      </div>

      {/* ══════════ HOSPITALS TAB ══════════ */}
      {mainTab === 'hospitals' && (
        <>
          {/* Top recommended card */}
          {topRecommended && (
            <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white rounded-2xl p-5 sm:p-6 shadow-card space-y-3 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-48 h-48 bg-teal-600/20 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 bg-teal-700/80 border border-teal-500/40 text-teal-100 text-xs font-bold px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  SMART RECOMMENDATION
                </div>
                <button onClick={() => setSelectedFacilityForExplanation(topRecommended)} className="text-xs font-bold text-teal-200 hover:text-white underline flex items-center gap-1 tap-target">
                  <HelpCircle className="w-3.5 h-3.5" /> Full Audit
                </button>
              </div>
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-extrabold text-white">Recommended: {topRecommended.facility.name}</h2>
                <p className="text-xs sm:text-sm text-teal-100 leading-relaxed max-w-3xl">{topRecommended.comparisonNote}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-teal-200">
                <span className="flex items-center gap-1 font-semibold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Score: <strong className="text-emerald-300 text-sm">{topRecommended.accessibilityScore}/100</strong>
                </span>
                <span>•</span>
                <span>Distance: <strong className="text-white">{topRecommended.distanceKm} km</strong> (~{topRecommended.estimatedTravelMinutes} mins)</span>
                <span>•</span>
                <span className={topRecommended.facility.is_govt ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                  {topRecommended.facility.is_govt ? '100% Free Public Care' : 'Private Facility'}
                </span>
                <span>•</span>
                <span className="text-teal-200 text-[11px]">
                  {(topRecommended.facility.data_source || '').includes('OSM') ? '🗺️ Live OSM' :
                   (topRecommended.facility.data_source || '').includes('GPS') ? '📡 GPS' : '📋 Official DB'}
                </span>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-soft">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button onClick={() => setSectorFilter('all')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-target ${sectorFilter === 'all' ? 'bg-teal-800 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                All ({allRecommendations.length})
              </button>
              <button onClick={() => setSectorFilter('govt')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-target flex items-center gap-1.5 ${sectorFilter === 'govt' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                <Building2 className="w-3.5 h-3.5" />
                Government ({allRecommendations.filter(r => r.facility.is_govt).length})
              </button>
              <button onClick={() => setSectorFilter('private')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-target ${sectorFilter === 'private' ? 'bg-blue-700 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                Private ({allRecommendations.filter(r => !r.facility.is_govt).length})
              </button>
            </div>
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, category, area..."
                value={keywordFilter}
                onChange={(e) => setKeywordFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
              />
            </div>
          </div>

          {/* Map View */}
          {viewMode === 'map' && (
            <div className="space-y-2">
              <InteractiveMap
                recommendations={filteredRecommendations}
                medicalStores={[]}
                userCoords={userCoords}
                isLiveGps={isLiveGpsActive}
                height="520px"
              />
              <p className="text-[11px] text-slate-600 text-center font-medium">
                🗺️ Green = Govt (Excel) | 🔵 Blue = Govt (Live OSM) | 🟣 Purple = Private | ⭐ = Best Recommended
              </p>
            </div>
          )}

          {/* Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-700 font-semibold px-1">
              <span>Showing {filteredRecommendations.length} facilities ranked by score</span>
              <span className="text-slate-500">{selectedDistrict}</span>
            </div>
            {filteredRecommendations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No matching facilities</h3>
                <button onClick={() => { setSectorFilter('all'); setKeywordFilter(''); }} className="px-4 py-2 bg-teal-700 text-white text-xs font-bold rounded-xl">
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
        </>
      )}

      {/* ══════════ MEDICAL STORES TAB ══════════ */}
      {mainTab === 'stores' && (
        <div className="space-y-5">
          {/* Map view for stores */}
          {viewMode === 'map' && (
            <div className="space-y-2">
              <InteractiveMap
                recommendations={[]}
                medicalStores={medicalStores}
                userCoords={userCoords}
                isLiveGps={isLiveGpsActive}
                height="480px"
              />
              <p className="text-[11px] text-slate-600 text-center">💊 Purple pins = Medical stores</p>
            </div>
          )}

          {/* Filter strip */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold">
              🏥 Govt/Jan Aushadhi: {medicalStores.filter(s => s.storeType === 'govt').length}
            </span>
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-full text-xs font-bold">
              🏪 Chain Pharmacy: {medicalStores.filter(s => s.storeType === 'chain').length}
            </span>
            <span className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-bold">
              💊 Local Store: {medicalStores.filter(s => s.storeType === 'local').length}
            </span>
          </div>

          {isLoadingStores ? (
            <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
              <span className="text-sm font-medium">Finding nearby medical stores...</span>
            </div>
          ) : medicalStores.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
              <Pill className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No stores found nearby</h3>
              <p className="text-xs text-slate-500">Try enabling GPS for more accurate nearby results.</p>
              <Link to="/location" className="inline-block px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl">
                Enable GPS →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 font-semibold px-1">
                {medicalStores.length} medical stores found near {selectedDistrict}
              </div>
              {medicalStores.map(store => (
                <MedicalStoreCard key={store.id} store={store} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommendation Audit Modal */}
      <RecommendationExplanationModal
        recommendation={selectedFacilityForExplanation}
        allRecommendations={allRecommendations}
        onClose={() => setSelectedFacilityForExplanation(null)}
      />

      {/* Close district picker on outside click */}
      {showDistrictPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDistrictPicker(false)} />
      )}
    </div>
  );
};
