import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { FacilityRecommendation } from '../types';
import { Navigation, PhoneCall, ShieldCheck } from 'lucide-react';

interface InteractiveMapProps {
  recommendations: FacilityRecommendation[];
  selectedFacilityId?: string;
  onSelectFacility?: (facilityId: string) => void;
  userCoords?: { lat: number; lng: number } | null;
  height?: string;
}

// Custom DivIcons with pure inline SVG to avoid Vite asset loader issues
const createCustomIcon = (isRecommended: boolean, isGovt: boolean, isSelected: boolean) => {
  const bgColor = isRecommended ? '#0E7C61' : isGovt ? '#059669' : '#6366f1';
  const size = isRecommended ? 38 : isSelected ? 34 : 28;
  const pulseClass = isRecommended ? 'animate-pulse' : '';

  const html = `
    <div style="
      background-color: ${bgColor};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      border: 2px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      cursor: pointer;
      position: relative;
    " class="${pulseClass}">
      <svg width="${size * 0.55}" height="${size * 0.55}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        ${isRecommended 
          ? '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>'
          : '<path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15M9 9h1M9 13h1M9 17h1M15 9h1M15 13h1M15 17h1"/>'
        }
      </svg>
      ${isRecommended ? '<span style="position:absolute; top:-4px; right:-4px; background:#e11d48; color:white; border-radius:50%; width:14px; height:14px; font-size:9px; display:flex; align-items:center; justify-content:center; font-weight:bold;">★</span>' : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-facility-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const userLocationIcon = L.divIcon({
  html: `
    <div style="
      background-color: #2563eb;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.4);
    "></div>
  `,
  className: 'user-loc-pin',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Map auto-focuser
const MapViewAdjuster: React.FC<{ coords: [number, number]; zoom?: number }> = ({ coords, zoom = 11 }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, zoom, { animate: true });
  }, [coords, zoom, map]);
  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  recommendations,
  selectedFacilityId,
  onSelectFacility,
  userCoords,
  height = '360px',
}) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="w-full bg-slate-100 rounded-xl flex items-center justify-center p-8 text-slate-500 text-sm" style={{ height }}>
        No facilities to display on map for current selection.
      </div>
    );
  }

  // Determine center point
  const firstRecommended = recommendations.find(r => r.isRecommended) || recommendations[0];
  const centerLat = userCoords?.lat || firstRecommended.facility.lat || 19.7515;
  const centerLng = userCoords?.lng || firstRecommended.facility.lng || 75.7139;

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-soft" style={{ height }}>
      {/* Legend Badge */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg shadow-md border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-teal-700 inline-block"></span>
          <span>Best Recommended</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
          <span>Govt PHC/Hospital</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span>
          <span>Private</span>
        </div>
      </div>

      <MapContainer
        center={[centerLat, centerLng]}
        zoom={11}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewAdjuster coords={[centerLat, centerLng]} zoom={11} />

        {/* User Location Radar */}
        {userCoords && (
          <>
            <Marker position={[userCoords.lat, userCoords.lng]} icon={userLocationIcon}>
              <Popup>
                <div className="text-xs font-bold text-slate-800">Your Current Village / Location</div>
              </Popup>
            </Marker>
            <Circle 
              center={[userCoords.lat, userCoords.lng]} 
              radius={8000} 
              pathOptions={{ fillColor: '#0E7C61', fillOpacity: 0.06, color: '#0E7C61', weight: 1.5, dashArray: '4, 4' }} 
            />
          </>
        )}

        {/* Facility Markers */}
        {recommendations.map(rec => {
          const { facility, isRecommended, accessibilityScore, distanceKm, estimatedTravelMinutes } = rec;
          if (!facility.lat || !facility.lng) return null;

          const isSelected = facility.id === selectedFacilityId;
          const icon = createCustomIcon(isRecommended, facility.is_govt, isSelected);

          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${facility.name}, ${facility.address}, ${facility.district}, ${facility.state}`
          )}`;

          return (
            <Marker
              key={facility.id}
              position={[facility.lat, facility.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectFacility && onSelectFacility(facility.id)
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 min-w-[210px] max-w-[260px] text-slate-900">
                  {isRecommended && (
                    <div className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-teal-700" /> #1 Recommended for your Need
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-snug">{facility.name}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{facility.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 py-1 border-y border-slate-100 text-[11px]">
                    <div className="bg-slate-50 p-1.5 rounded">
                      <span className="text-[10px] text-slate-600 block">Accessibility</span>
                      <span className="font-bold text-teal-700">{accessibilityScore}/100</span>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded">
                      <span className="text-[10px] text-slate-600 block">Distance</span>
                      <span className="font-bold text-slate-800">{distanceKm} km (~{estimatedTravelMinutes}m)</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-700">
                    <span className="font-semibold">Services: </span>
                    <span>{facility.services.slice(0, 3).join(', ')}</span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <a
                      href={`tel:${facility.phone}`}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <PhoneCall className="w-3 h-3" /> Call
                    </a>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <Navigation className="w-3 h-3" /> Directions
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
