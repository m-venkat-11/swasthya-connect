import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DISTRICT_COORDINATES } from '../data/districtCoordinates';
import { liveLocationService } from '../services/liveLocationService';
import { 
  Navigation, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Building2, 
  Trees,
  Search,
  MapPin,
  Compass
} from 'lucide-react';

export const LocationStep: React.FC = () => {
  const { 
    selectedState, 
    setSelectedState, 
    selectedDistrict, 
    setSelectedDistrict, 
    setUserCoords,
    setIsLiveGpsActive,
    loadLiveNearbyHospitals,
    t 
  } = useApp();
  
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>('');

  // ── When user lands on /location, always clear GPS mode ──
  // This ensures selecting a district starts fresh without old GPS coords.
  useEffect(() => {
    setIsLiveGpsActive(false);
    setUserCoords(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Extract unique districts per state
  const allDistricts = Object.keys(DISTRICT_COORDINATES).map(name => ({
    name,
    ...DISTRICT_COORDINATES[name]
  }));

  const filteredDistricts = allDistricts.filter(d => 
    d.state === selectedState && 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Rural/tribal focus districts for direct demonstration
  const featuredRuralDistricts = [
    { name: "Gadchiroli (Tribal Agency)", state: "Maharashtra", desc: "Remote forest & tribal belt with limited connectivity" },
    { name: "Nandurbar (Satpura Tribal Belt)", state: "Maharashtra", desc: "Satpura mountain tribal belt with primary health focus" },
    { name: "Palghar (Coastal & Sahyadri Tribal)", state: "Maharashtra", desc: "Sahyadri tribal hilly clusters & coastal rural PHCs" },
    { name: "Alluri Sitharama Raju", state: "Andhra Pradesh", desc: "Agency tribal hills & high maternal priority area" },
    { name: "Parvathipuram Manyam", state: "Andhra Pradesh", desc: "Remote agency valley with specialized CHC network" },
    { name: "Pune", state: "Maharashtra", desc: "Mixed rural and semi-urban tertiary referral network" }
  ];

  const handleSimulateGPS = async () => {
    setIsDetecting(true);
    setGpsError(null);
    setGpsStatus('Requesting location...');
    try {
      setGpsStatus('Trying device GPS (high accuracy)...');
      const loc = await liveLocationService.detectCurrentLocation();
      const srcLabel = loc.source === 'DEVICE_GPS'
        ? `Device GPS (±${loc.accuracy ?? '?'} m)`
        : 'Network IP Geolocation';
      setGpsStatus(`Detected via ${srcLabel}`);
      setSelectedState(loc.state);
      setSelectedDistrict(loc.district);
      setUserCoords({ lat: loc.lat, lng: loc.lng });
      setIsLiveGpsActive(true);
      await loadLiveNearbyHospitals(loc.lat, loc.lng, loc.district, loc.state);
      setIsDetecting(false);
      navigate('/results');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Location detection failed. Please select your district manually.';
      setGpsError(msg);
      setGpsStatus('');
      setIsDetecting(false);
    }
  };

  const handleSelectDistrict = (districtName: string, stateName: string) => {
    // Manually selected district — clear GPS mode entirely
    setIsLiveGpsActive(false);
    setUserCoords(null);
    setSelectedState(stateName);
    setSelectedDistrict(districtName);
    navigate('/results');
  };

  return (
    <div className="w-full space-y-6 pb-14 animate-in fade-in duration-200">
      
      {/* Top Back and Active Location Bar (Matches Emergency Tab Fitting) */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all tap-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-teal-600" />
          <span>Active: <strong>{selectedDistrict}</strong></span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">{selectedState}</span>
        </div>
      </div>

      {/* Full-Width Hero Callout Header */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden border border-teal-800/40">
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>STEP 2 OF 3 • DISTRICT GEO-ACCESSIBILITY</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {t('whereAreYou')}
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-3xl">
            {t('locationSubtitle')}
          </p>

          {/* GPS Simulation Action */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimulateGPS}
              disabled={isDetecting}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 tap-target"
            >
              <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>{isDetecting ? (gpsStatus || 'Detecting...') : t('useGps')}</span>
            </button>
            {gpsError && (
              <div className="text-xs text-rose-200 bg-rose-900/40 rounded-xl px-3 py-2 text-center max-w-xs">
                ⚠️ {gpsError}
              </div>
            )}
            {isDetecting && gpsStatus && !gpsError && (
              <div className="text-xs text-emerald-200 bg-teal-900/30 rounded-xl px-3 py-2 text-center">
                🛰️ {gpsStatus}
              </div>
            )}
            <span className="text-xs text-teal-200/80">
              Or pick your priority rural district below
            </span>
          </div>
        </div>
      </div>

      {/* Featured Priority Rural & Tribal Districts (Full Width Grid) */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
          <Trees className="w-4 h-4 text-emerald-600" />
          <span>Priority Rural & Tribal Districts (Featured SIH Focus):</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredRuralDistricts.map((item, idx) => {
            const isSelected = selectedDistrict === item.name;
            return (
              <button
                key={idx}
                onClick={() => handleSelectDistrict(item.name, item.state)}
                className={`p-5 rounded-2xl border text-left transition-all tap-target flex flex-col justify-between group ${
                  isSelected 
                    ? 'border-teal-600 bg-teal-50/90 ring-2 ring-teal-600/30 shadow-md' 
                    : 'border-slate-200/90 bg-white hover:border-teal-400 hover:shadow-card hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-black text-teal-800 bg-teal-100/90 px-2.5 py-0.5 rounded-full border border-teal-200/70">
                      {item.state}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-700" />}
                  </div>
                  <h4 className="font-black text-base text-slate-900 group-hover:text-teal-900 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-teal-700 flex items-center justify-between">
                  <span>Select this District</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual State & District Browser (Full Width Card) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-6">
        
        {/* State Toggle Tabs */}
        <div className="space-y-2.5">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
            Choose State / Province:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedState('Maharashtra')}
              className={`p-4 rounded-2xl font-black text-xs sm:text-sm border transition-all tap-target flex items-center justify-center gap-2.5 ${
                selectedState === 'Maharashtra'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-md shadow-teal-700/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Maharashtra (36 Verified Districts)</span>
            </button>

            <button
              onClick={() => setSelectedState('Andhra Pradesh')}
              className={`p-4 rounded-2xl font-black text-xs sm:text-sm border transition-all tap-target flex items-center justify-center gap-2.5 ${
                selectedState === 'Andhra Pradesh'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-md shadow-teal-700/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Andhra Pradesh (26 Verified Districts)</span>
            </button>
          </div>
        </div>

        {/* District Search Filter Input */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
            Search District in {selectedState}:
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder={`Type district name (e.g., Gadchiroli, Nandurbar, Nellore)...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
            />
          </div>
        </div>

        {/* District Grid Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
          {filteredDistricts.map((d) => {
            const isSelected = selectedDistrict === d.name;
            return (
              <button
                key={d.name}
                onClick={() => handleSelectDistrict(d.name, d.state)}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all tap-target flex items-center justify-between ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:border-teal-500 hover:bg-teal-50/50'
                }`}
              >
                <span className="truncate">{d.name}</span>
                {d.isTribalOrRural && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ml-1 shrink-0 ${
                    isSelected ? 'bg-teal-800 text-teal-100' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Rural
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
};
