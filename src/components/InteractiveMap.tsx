import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { FacilityRecommendation, MedicalStore } from '../types';
import { Navigation, PhoneCall, ShieldCheck } from 'lucide-react';

interface InteractiveMapProps {
  recommendations: FacilityRecommendation[];
  medicalStores?: MedicalStore[];
  selectedFacilityId?: string;
  onSelectFacility?: (facilityId: string) => void;
  userCoords?: { lat: number; lng: number } | null;
  isLiveGps?: boolean;
  height?: string;
}

// Color scheme by data source + sector
function pinColors(isRecommended: boolean, isGovt: boolean, dataSource: string) {
  if (isRecommended) return { bg: '#0E7C61', ring: '#059669' };
  const src = (dataSource || '').toLowerCase();
  if (src.includes('osm')) return isGovt ? { bg: '#0284c7', ring: '#0369a1' } : { bg: '#7c3aed', ring: '#6d28d9' };
  if (src.includes('gps')) return { bg: '#059669', ring: '#047857' };
  // Excel / default
  return isGovt ? { bg: '#15803d', ring: '#166534' } : { bg: '#6366f1', ring: '#4f46e5' };
}

const createFacilityIcon = (isRecommended: boolean, isGovt: boolean, dataSource: string, isSelected: boolean) => {
  const colors = pinColors(isRecommended, isGovt, dataSource);
  const size = isRecommended ? 40 : isSelected ? 36 : 30;
  const srcTag = (dataSource || '').includes('OSM') ? '🗺' : (dataSource || '').includes('GPS') ? '📡' : '';

  const html = `
    <div style="
      background-color: ${colors.bg};
      width: ${size}px; height: ${size}px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white;
      border: 2.5px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35), 0 0 0 2px ${colors.ring}44;
      cursor: pointer; position: relative;
    ">
      <svg width="${size * 0.52}" height="${size * 0.52}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        ${isRecommended
          ? '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>'
          : '<path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15M9 9h1M9 13h1M9 17h1M15 9h1M15 13h1M15 17h1"/>'}
      </svg>
      ${isRecommended ? '<span style="position:absolute;top:-5px;right:-5px;background:#e11d48;color:white;border-radius:50%;width:15px;height:15px;font-size:9px;display:flex;align-items:center;justify-content:center;font-weight:bold;">★</span>' : ''}
      ${srcTag ? `<span style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);font-size:9px;line-height:1;">${srcTag}</span>` : ''}
    </div>
  `;

  return L.divIcon({ html, className: 'facility-pin', iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -size / 2 - 4] });
};

const pharmacyIcon = L.divIcon({
  html: `<div style="background:#a855f7;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:13px;">💊</div>`,
  className: 'pharmacy-pin',
  iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -16],
});

const userLocationIcon = L.divIcon({
  html: `<div style="background-color:#2563eb;width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 5px rgba(37,99,235,0.3);"></div>`,
  className: 'user-loc-pin',
  iconSize: [22, 22], iconAnchor: [11, 11],
});

const MapViewAdjuster: React.FC<{ coords: [number, number]; zoom?: number }> = ({ coords, zoom = 12 }) => {
  const map = useMap();
  useEffect(() => { map.setView(coords, zoom, { animate: true }); }, [coords, zoom, map]);
  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  recommendations,
  medicalStores = [],
  selectedFacilityId,
  onSelectFacility,
  userCoords,
  isLiveGps = false,
  height = '520px',
}) => {
  const hasData = recommendations.length > 0 || medicalStores.length > 0;
  if (!hasData) {
    return (
      <div className="w-full bg-slate-100 rounded-xl flex items-center justify-center p-8 text-slate-500 text-sm" style={{ height }}>
        No facilities to display on map for current selection.
      </div>
    );
  }

  const firstRec = recommendations.find(r => r.isRecommended) || recommendations[0];
  const centerLat = userCoords?.lat || firstRec?.facility.lat || 19.7515;
  const centerLng = userCoords?.lng || firstRec?.facility.lng || 75.7139;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-card" style={{ height }}>
      {/* Legend */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/96 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 text-[10px] font-medium text-slate-700 space-y-1.5">
        <div className="font-bold text-slate-900 text-[11px] mb-1">Map Legend</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-teal-700 inline-block border border-white"></span> Best Recommended</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-700 inline-block border border-white"></span> Govt (Excel)</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-600 inline-block border border-white"></span> Govt (Live OSM 🗺)</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block border border-white"></span> Private</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block border border-white"></span> 💊 Medical Store</div>
        {isLiveGps && <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block border-2 border-white shadow"></span> Your Location</div>}
      </div>

      <MapContainer center={[centerLat, centerLng]} zoom={12} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewAdjuster coords={[centerLat, centerLng]} zoom={isLiveGps ? 13 : 11} />

        {/* User location */}
        {userCoords && isLiveGps && (
          <>
            <Marker position={[userCoords.lat, userCoords.lng]} icon={userLocationIcon}>
              <Popup><div className="text-xs font-bold text-slate-800">📍 Your Current Location</div></Popup>
            </Marker>
            <Circle
              center={[userCoords.lat, userCoords.lng]}
              radius={10000}
              pathOptions={{ fillColor: '#0E7C61', fillOpacity: 0.05, color: '#0E7C61', weight: 1.5, dashArray: '5,5' }}
            />
          </>
        )}

        {/* Hospital markers */}
        {recommendations.map(rec => {
          const { facility, isRecommended, accessibilityScore, distanceKm, estimatedTravelMinutes } = rec;
          if (!facility.lat || !facility.lng) return null;
          const isSelected = facility.id === selectedFacilityId;
          const icon = createFacilityIcon(isRecommended, facility.is_govt, facility.data_source || '', isSelected);
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${facility.name}, ${facility.address}`)}`;

          return (
            <Marker
              key={facility.id}
              position={[facility.lat, facility.lng]}
              icon={icon}
              eventHandlers={{ click: () => onSelectFacility?.(facility.id) }}
            >
              <Popup>
                <div className="p-1 space-y-2 min-w-[210px] max-w-[260px] text-slate-900">
                  {isRecommended && (
                    <div className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-teal-700" /> #1 Recommended
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-snug">{facility.name}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">{facility.category}</p>
                    <p className="text-[10px] text-teal-600 font-semibold mt-0.5">
                      {(facility.data_source || '').includes('OSM') ? '🗺️ Live OSM Maps' :
                       (facility.data_source || '').includes('GPS') ? '📡 GPS Radar' : '📋 Official Excel'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 py-1 border-y border-slate-100 text-[11px]">
                    <div className="bg-slate-50 p-1.5 rounded">
                      <span className="text-[10px] text-slate-600 block">Score</span>
                      <span className="font-bold text-teal-700">{accessibilityScore}/100</span>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded">
                      <span className="text-[10px] text-slate-600 block">Distance</span>
                      <span className="font-bold text-slate-800">{distanceKm}km (~{estimatedTravelMinutes}m)</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <a href={`tel:${facility.phone}`} className="flex-1 bg-slate-900 text-white text-xs font-semibold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1">
                      <PhoneCall className="w-3 h-3" /> Call
                    </a>
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-teal-700 text-white text-xs font-semibold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1">
                      <Navigation className="w-3 h-3" /> Go
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Pharmacy / Medical Store markers */}
        {medicalStores.map(store => {
          if (!store.lat || !store.lng) return null;
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.name}, ${store.address}`)}`;
          return (
            <Marker key={store.id} position={[store.lat, store.lng]} icon={pharmacyIcon}>
              <Popup>
                <div className="p-1 space-y-1.5 min-w-[180px] text-slate-900">
                  <div className="text-[10px] font-bold text-purple-700">
                    {store.storeType === 'govt' ? '🏥 Govt Store' : store.storeType === 'chain' ? '🏪 Chain Pharmacy' : '💊 Local Store'}
                  </div>
                  <h4 className="font-bold text-xs">{store.name}</h4>
                  {store.distanceKm && <p className="text-[11px] text-slate-600">{store.distanceKm} km away</p>}
                  {store.openHours && <p className="text-[10px] text-slate-500">{store.openHours}</p>}
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block w-full bg-purple-600 text-white text-xs font-semibold py-1.5 rounded-lg text-center">
                    Directions
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
