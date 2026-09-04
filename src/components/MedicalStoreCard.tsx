import React from 'react';
import type { MedicalStore } from '../types';
import { MapPin, Phone, Clock, Navigation, Building2, ShoppingBag, Landmark, Wifi } from 'lucide-react';

interface MedicalStoreCardProps {
  store: MedicalStore;
}

const storeConfig = {
  govt: {
    label: 'Govt / Jan Aushadhi',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: <Landmark className="w-3.5 h-3.5" />,
    dot: 'bg-emerald-500',
  },
  chain: {
    label: 'Chain Pharmacy',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <ShoppingBag className="w-3.5 h-3.5" />,
    dot: 'bg-blue-500',
  },
  local: {
    label: 'Local Medical Store',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: <Building2 className="w-3.5 h-3.5" />,
    dot: 'bg-amber-500',
  },
};

export const MedicalStoreCard: React.FC<MedicalStoreCardProps> = ({ store }) => {
  const cfg = storeConfig[store.storeType];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${store.name}, ${store.address}`
  )}`;

  return (
    <div className={`relative bg-white rounded-2xl border ${cfg.border} shadow-soft overflow-hidden transition-all hover:shadow-card`}>
      
      {/* Left accent stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.dot}`} />

      <div className="pl-4 pr-4 py-4 sm:py-5 space-y-3">

        {/* Top: badges + name */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${cfg.badge}`}>
                {cfg.icon}
                {store.chainBrand || cfg.label}
              </span>

              {store.isOpen24h && (
                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold">
                  <Wifi className="w-3 h-3" />24×7 Open
                </span>
              )}

              {store.data_source === 'Live OSM Maps' && (
                <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full text-[10px]">
                  🗺️ Live OSM
                </span>
              )}
            </div>

            <h3 className="font-bold text-base text-slate-900 leading-snug">{store.name}</h3>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="truncate max-w-[220px]">{store.address}</span>
              </span>
              {store.distanceKm !== undefined && (
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                  {store.distanceKm} km away
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hours + phone row */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          {store.openHours && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {store.openHours}
            </span>
          )}
          {store.phone && (
            <a
              href={`tel:${store.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-1 text-teal-700 font-semibold hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              {store.phone}
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          {store.phone && (
            <a
              href={`tel:${store.phone.replace(/[^0-9+]/g, '')}`}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 text-teal-300" />
              Call Store
            </a>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5" />
            Directions
          </a>
        </div>
      </div>
    </div>
  );
};
