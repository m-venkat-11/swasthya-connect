import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DISTRICT_COORDINATES } from '../data/districtCoordinates';
import { 
  Navigation, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Trees,
  Search
} from 'lucide-react';

export const LocationStep: React.FC = () => {
  const { 
    selectedState, 
    setSelectedState, 
    selectedDistrict, 
    setSelectedDistrict, 
    setUserCoords,
    t 
  } = useApp();
  
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

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

  const handleSimulateGPS = () => {
    setIsDetecting(true);
    setTimeout(() => {
      setIsDetecting(false);
      // Simulate rural location in Gadchiroli
      const target = DISTRICT_COORDINATES['Gadchiroli (Tribal Agency)'];
      setSelectedState('Maharashtra');
      setSelectedDistrict('Gadchiroli (Tribal Agency)');
      setUserCoords({ lat: target.lat + 0.04, lng: target.lng - 0.03 });
      navigate('/results');
    }, 1200);
  };

  const handleSelectDistrict = (districtName: string, stateName: string) => {
    setSelectedState(stateName);
    setSelectedDistrict(districtName);
    const coords = DISTRICT_COORDINATES[districtName];
    if (coords) {
      setUserCoords({ lat: coords.lat, lng: coords.lng });
    }
    navigate('/results');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Title Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft space-y-2">
        <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">
          Step 2 of 3
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('whereAreYou')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {t('locationSubtitle')}
        </p>

        {/* GPS Simulation Button */}
        <div className="pt-3">
          <button
            onClick={handleSimulateGPS}
            disabled={isDetecting}
            className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 tap-target"
          >
            <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? t('detectingLocation') : t('useGps')}</span>
          </button>
        </div>
      </div>

      {/* Featured Rural & Underserved Clusters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Trees className="w-4 h-4 text-emerald-600" />
          <span>Priority Rural & Tribal Districts (Featured Focus):</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {featuredRuralDistricts.map((item, idx) => {
            const isSelected = selectedDistrict === item.name;
            return (
              <button
                key={idx}
                onClick={() => handleSelectDistrict(item.name, item.state)}
                className={`p-4 rounded-xl border text-left transition-all tap-target flex flex-col justify-between ${
                  isSelected 
                    ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600/20 shadow-sm' 
                    : 'border-slate-200 bg-white hover:border-teal-400 hover:bg-slate-50 shadow-soft'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded">
                      {item.state}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-700" />}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{item.name}</h4>
                  <p className="text-[11px] text-slate-600 mt-1">{item.desc}</p>
                </div>

                <div className="mt-3 text-xs font-bold text-teal-700 flex items-center gap-1">
                  <span>Select this District</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual State & District Browser */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft space-y-5">
        
        {/* State Toggle Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Choose State:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedState('Maharashtra')}
              className={`p-3 rounded-xl font-bold text-xs sm:text-sm border transition-all tap-target flex items-center justify-center gap-2 ${
                selectedState === 'Maharashtra'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Maharashtra (36 Districts)</span>
            </button>

            <button
              onClick={() => setSelectedState('Andhra Pradesh')}
              className={`p-3 rounded-xl font-bold text-xs sm:text-sm border transition-all tap-target flex items-center justify-center gap-2 ${
                selectedState === 'Andhra Pradesh'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Andhra Pradesh (26 Districts)</span>
            </button>
          </div>
        </div>

        {/* District Search Filter Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Select District in {selectedState}:
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder={`Search district name in ${selectedState}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
            />
          </div>
        </div>

        {/* District List Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-1">
          {filteredDistricts.map((d) => {
            const isSelected = selectedDistrict === d.name;
            return (
              <button
                key={d.name}
                onClick={() => handleSelectDistrict(d.name, d.state)}
                className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all tap-target flex items-center justify-between ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-500 hover:bg-teal-50/40'
                }`}
              >
                <span className="truncate">{d.name}</span>
                {d.isTribalOrRural && (
                  <span className={`text-[9px] px-1 rounded ml-1 shrink-0 ${isSelected ? 'bg-teal-800 text-teal-100' : 'bg-emerald-100 text-emerald-800'}`}>
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
