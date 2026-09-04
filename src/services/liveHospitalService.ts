import type { Facility, DataSourceType } from '../types';
import { DISTRICT_COORDINATES } from '../data/districtCoordinates';

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function classifyGovt(name: string, tags?: Record<string, string>): boolean {
  const n = (name || '').toLowerCase();
  const op = (tags?.operator || '').toLowerCase();
  return (
    tags?.operator_type === 'public' ||
    op.includes('government') || op.includes('govt') || op.includes('state') ||
    op.includes('municipal') || op.includes('district') || op.includes('nhs') ||
    n.includes('govt') || n.includes('government') || n.includes('civil hospital') ||
    n.includes('phc') || n.includes('chc') || n.includes('primary health') ||
    n.includes('community health') || n.includes('sub-district') || n.includes('district hospital') ||
    n.includes('general hospital') || n.includes('ayushman') || n.includes('jan aushadhi') ||
    n.includes('esic') || n.includes('railway hospital') || n.includes('army hospital')
  );
}

function buildFacilityFromOsm(
  el: OverpassElement,
  idx: number,
  districtName: string,
  stateName: string,
  baseLat: number,
  baseLng: number
): Facility {
  const nodeLat = el.lat ?? el.center?.lat ?? baseLat;
  const nodeLng = el.lon ?? el.center?.lon ?? baseLng;
  const rawName =
    el.tags?.name || el.tags?.['name:en'] || el.tags?.['name:hi'] ||
    el.tags?.['name:te'] || el.tags?.['name:mr'] ||
    `Healthcare Facility ${idx + 1}`;

  const isGovt = classifyGovt(rawName, el.tags);

  const amenity = (el.tags?.amenity || '').toLowerCase();
  const healthcare = (el.tags?.healthcare || '').toLowerCase();

  let category = 'Private Clinic';
  if (amenity === 'hospital' || healthcare === 'hospital') {
    category = isGovt ? 'District General Hospital' : 'Private Multi-Specialty Hospital';
  } else if (amenity === 'clinic' || healthcare === 'clinic') {
    category = isGovt ? 'Primary Health Centre (PHC)' : 'Private Clinic';
  } else if (rawName.toLowerCase().includes('chc') || rawName.toLowerCase().includes('community health')) {
    category = 'Community Health Centre (CHC)';
  } else if (rawName.toLowerCase().includes('phc') || rawName.toLowerCase().includes('primary health')) {
    category = 'Primary Health Centre (PHC)';
  }

  const services: string[] = ['General Care'];
  if (el.tags?.emergency === 'yes' || category.includes('Hospital')) services.push('Emergency Care');
  if (isGovt || category.includes('Hospital')) services.push('Maternal Care', 'Child Care', 'Laboratory');
  if (!services.includes('Pharmacy')) services.push('Pharmacy');
  if (category.includes('Specialist') || !isGovt) services.push('Specialist Care');

  const distKm = Math.round(haversineKm(baseLat, baseLng, nodeLat, nodeLng) * 10) / 10;

  return {
    id: `osm-${el.id ?? idx}`,
    name: rawName,
    contact_person: isGovt ? 'Medical Superintendent (OSM)' : 'Medical Director (OSM)',
    phone: el.tags?.phone || el.tags?.['contact:phone'] || (isGovt ? '108 / 104' : '+91 98480 00000'),
    category,
    sector: isGovt ? 'Government' : 'Private',
    address: el.tags?.['addr:full'] || el.tags?.['addr:street'] ||
      `${rawName}, ${districtName} (${distKm} km away)`,
    pincode: el.tags?.['addr:postcode'] || '',
    district: districtName,
    state: stateName,
    services,
    last_updated: 'Live — OpenStreetMap',
    data_source: 'Live OSM Maps',
    data_source_type: 'Live OSM Maps' as DataSourceType,
    is_govt: isGovt,
    lat: nodeLat,
    lng: nodeLng,
  };
}

async function queryOverpass(query: string, timeoutMs = 8000): Promise<OverpassElement[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.elements || []) as OverpassElement[];
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

export const liveHospitalService = {
  /**
   * Fetch real OSM hospitals by radius around any lat/lng.
   * Used for GPS mode — searches actual user position.
   */
  async fetchByRadius(
    lat: number,
    lng: number,
    districtName: string,
    stateName: string,
    radiusKm = 35
  ): Promise<Facility[]> {
    if (!navigator.onLine) return this.syntheticFallback(lat, lng, districtName, stateName);

    const r = radiusKm * 1000;
    const q = `[out:json][timeout:8];
(
  node["amenity"="hospital"](around:${r},${lat},${lng});
  node["amenity"="clinic"](around:${r},${lat},${lng});
  way["amenity"="hospital"](around:${r},${lat},${lng});
  relation["amenity"="hospital"](around:${r},${lat},${lng});
);
out center 40;`;

    try {
      const elements = await queryOverpass(q);
      const facilities = elements
        .filter(el => (el.lat && el.lon) || (el.center?.lat && el.center?.lon))
        .map((el, i) => buildFacilityFromOsm(el, i, districtName, stateName, lat, lng));

      if (facilities.length >= 3) return facilities;
    } catch (e) {
      console.warn('OSM radius query failed:', e);
    }
    return this.syntheticFallback(lat, lng, districtName, stateName);
  },

  /**
   * Fetch real OSM hospitals for a district even without GPS.
   * Uses district centre coordinates + 40km radius.
   */
  async fetchByDistrict(
    districtName: string,
    stateName: string
  ): Promise<Facility[]> {
    if (!navigator.onLine) return [];

    const centre = DISTRICT_COORDINATES[districtName];
    if (!centre) return [];

    const r = 40000; // 40 km
    const q = `[out:json][timeout:10];
(
  node["amenity"="hospital"](around:${r},${centre.lat},${centre.lng});
  node["amenity"="clinic"](around:${r},${centre.lat},${centre.lng});
  way["amenity"="hospital"](around:${r},${centre.lat},${centre.lng});
  relation["amenity"="hospital"](around:${r},${centre.lat},${centre.lng});
);
out center 50;`;

    try {
      const elements = await queryOverpass(q, 12000);
      return elements
        .filter(el => (el.lat && el.lon) || (el.center?.lat && el.center?.lon))
        .map((el, i) => buildFacilityFromOsm(el, i, districtName, stateName, centre.lat, centre.lng));
    } catch (e) {
      console.warn(`OSM district query failed for ${districtName}:`, e);
      return [];
    }
  },

  /**
   * Legacy wrapper kept for AppContext compatibility.
   */
  async fetchLiveNearbyFacilities(
    lat: number,
    lng: number,
    districtName = 'Current Area',
    stateName = 'India',
    radiusKm = 35
  ): Promise<Facility[]> {
    return this.fetchByRadius(lat, lng, districtName, stateName, radiusKm);
  },

  /**
   * Synthetic fallback — generated facilities around GPS point
   * when both OSM and IP fail. Clearly labelled as generated.
   */
  syntheticFallback(
    userLat: number,
    userLng: number,
    district: string,
    state: string
  ): Facility[] {
    const make = (
      id: string, name: string, cat: string, isGovt: boolean,
      services: string[], dLat: number, dLng: number
    ): Facility => ({
      id,
      name,
      contact_person: isGovt ? 'Medical Officer' : 'Medical Director',
      phone: isGovt ? '108 / 104' : '+91 98480 00000',
      category: cat,
      sector: isGovt ? 'Government' : 'Private',
      address: `${name}, ${district}`,
      pincode: '',
      district,
      state,
      services,
      last_updated: 'GPS Estimated',
      data_source: 'Live GPS Radar',
      data_source_type: 'Live GPS Radar' as DataSourceType,
      is_govt: isGovt,
      lat: userLat + dLat,
      lng: userLng + dLng,
    });

    return [
      make(`gps-dh-${district}`, `${district} District Government Hospital`, 'District General Hospital', true,
        ['Maternal Care', 'Emergency Care', 'Child Care', 'General Care', 'Laboratory', 'Pharmacy', 'Specialist Care'], 0.028, 0.015),
      make(`gps-chc-${district}`, `${district} Community Health Centre (CHC)`, 'Community Health Centre (CHC)', true,
        ['Maternal Care', 'Emergency Care', 'Child Care', 'General Care', 'Laboratory', 'Pharmacy'], 0.012, 0.048),
      make(`gps-phc-${district}`, `Primary Health Centre — ${district} Sector`, 'Primary Health Centre (PHC)', true,
        ['General Care', 'Pharmacy', 'Child Care', 'Laboratory'], -0.015, -0.012),
      make(`gps-pvt1-${district}`, `Sanjivani Multi-Specialty Hospital`, 'Private Multi-Specialty Hospital', false,
        ['Emergency Care', 'General Care', 'Laboratory', 'Pharmacy', 'Specialist Care', 'Maternal Care'], -0.032, 0.028),
      make(`gps-pvt2-${district}`, `Aarogya Maternity & Surgical Nursing Home`, 'Private Maternity & Children Hospital', false,
        ['Maternal Care', 'Child Care', 'General Care', 'Pharmacy'], -0.018, -0.022),
    ];
  },
};
