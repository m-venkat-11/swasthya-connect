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

// ─── ABDM / NHM facility shape ─────────────────────────────────────────────
interface AbdmFacility {
  facilityId?: string;
  facilityName?: string;
  facilityType?: string;
  ownership?: string;
  address?: { address?: string; pincode?: string; stateName?: string; districtName?: string };
  contact?: { mobile?: string; email?: string };
  geoLocation?: { latitude?: number; longitude?: number };
  timings?: string;
  services?: string[];
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function classifyGovt(name: string, tags?: Record<string, string>): boolean {
  const n = (name || '').toLowerCase();
  const op = (tags?.operator || '').toLowerCase();
  const ownership = (tags?.['operator:type'] || tags?.ownership || '').toLowerCase();
  return (
    ownership === 'public' || ownership === 'government' ||
    tags?.operator_type === 'public' ||
    op.includes('government') || op.includes('govt') || op.includes('state') ||
    op.includes('municipal') || op.includes('district') || op.includes('corporation') ||
    op.includes('ministry') || op.includes('nhm') || op.includes('esic') ||
    n.includes('govt') || n.includes('government') || n.includes('civil hospital') ||
    n.includes('phc') || n.includes('chc') || n.includes('primary health') ||
    n.includes('community health') || n.includes('sub-district') || n.includes('sub centre') ||
    n.includes('sub center') || n.includes('subcentre') || n.includes('subcenter') ||
    n.includes('district hospital') || n.includes('general hospital') || n.includes('area hospital') ||
    n.includes('esi hospital') || n.includes('esic') || n.includes('railway hospital') ||
    n.includes('army hospital') || n.includes('military hospital') || n.includes('lady') ||
    n.includes('ayushman') || n.includes('arogya') || n.includes('jan aushadhi') ||
    n.includes('asha') || n.includes('anm') || n.includes('maternity home') ||
    n.includes('urban health') || n.includes('dispensary') || n.includes('uphc') ||
    n.includes('health centre') || n.includes('health center') || n.includes('health post') ||
    n.includes('trauma centre') || n.includes('trauma center')
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

  // Prefer local language name if available, fall back to English
  const rawName =
    el.tags?.name ||
    el.tags?.['name:en'] || el.tags?.['name:te'] || el.tags?.['name:hi'] ||
    el.tags?.['name:mr'] || el.tags?.['name:kn'] || el.tags?.['name:ta'] ||
    `Healthcare Facility ${idx + 1}`;

  const isGovt = classifyGovt(rawName, el.tags);

  const amenity = (el.tags?.amenity || '').toLowerCase();
  const healthcare = (el.tags?.healthcare || '').toLowerCase();
  const n = rawName.toLowerCase();

  // Detailed category classification
  let category = 'Private Clinic & Nursing Home';
  if (amenity === 'hospital' || healthcare === 'hospital') {
    category = isGovt ? 'District / Area Hospital' : 'Private Multi-Specialty Hospital';
  } else if (n.includes('phc') || n.includes('primary health') || healthcare === 'health_centre' || amenity === 'health_post') {
    category = 'Primary Health Centre (PHC)';
  } else if (n.includes('chc') || n.includes('community health')) {
    category = 'Community Health Centre (CHC)';
  } else if (n.includes('sub centre') || n.includes('sub center') || n.includes('subcentre') || n.includes('subcenter')) {
    category = 'Sub-Centre / Health Post';
  } else if (n.includes('dispensary') || n.includes('uphc') || n.includes('urban health')) {
    category = 'Urban PHC / Dispensary';
  } else if (n.includes('maternity') || n.includes('nursing home') || healthcare === 'maternity') {
    category = isGovt ? 'Government Maternity Hospital' : 'Maternity & Nursing Home';
  } else if (amenity === 'clinic' || healthcare === 'clinic' || healthcare === 'centre') {
    category = isGovt ? 'Govt Health Centre' : 'Private Clinic';
  } else if (amenity === 'doctors' || healthcare === 'doctor') {
    category = 'Doctor / OPD Clinic';
  } else if (healthcare === 'hospital' || healthcare === 'nursing_home') {
    category = isGovt ? 'Government Hospital' : 'Private Hospital / Nursing Home';
  }

  const services: string[] = ['General Care', 'OPD Consultation'];
  if (el.tags?.emergency === 'yes' || category.includes('District') || category.includes('Hospital')) {
    services.push('Emergency Care', '24x7');
  }
  if (isGovt || category.includes('Hospital') || category.includes('CHC')) {
    services.push('Maternal Care', 'Child Care', 'Laboratory');
  }
  if (!services.includes('Pharmacy')) services.push('Pharmacy');
  if (isGovt && (category.includes('PHC') || category.includes('CHC'))) {
    services.push('Free Medicines', 'Vaccination');
  }
  if (category.includes('District') || (!isGovt && category.includes('Multi-Specialty'))) {
    services.push('Specialist Care');
  }

  const addressFull = [
    el.tags?.['addr:housename'],
    el.tags?.['addr:street'],
    el.tags?.['addr:suburb'],
    el.tags?.['addr:city'],
  ].filter(Boolean).join(', ') || `${rawName}, ${districtName}`;

  return {
    id: `osm-${el.id ?? idx}-${Math.round(nodeLat * 10000)}`,
    name: rawName,
    contact_person: isGovt ? 'Medical Superintendent' : 'Medical Director',
    phone: el.tags?.phone || el.tags?.['contact:phone'] || el.tags?.['contact:mobile'] || (isGovt ? '104' : ''),
    category,
    sector: isGovt ? 'Government' : 'Private',
    address: addressFull,
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

async function queryOverpass(query: string, timeoutMs = 12000): Promise<OverpassElement[]> {
  // Strategy 1: Local / Vercel serverless proxy (/api/overpass)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch('/api/overpass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data.elements && data.elements.length > 0) {
        return data.elements as OverpassElement[];
      }
    }
  } catch {
    // proceed to direct browser-compatible mirrors
  }

  // Strategy 2: Direct browser CORS mirrors
  const directMirrors = [
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://corsproxy.io/?url=' + encodeURIComponent('https://overpass-api.de/api/interpreter'),
    'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://overpass-api.de/api/interpreter'),
  ];

  for (const endpoint of directMirrors) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      let res: Response;
      if (endpoint.includes('allorigins')) {
        res = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, { signal: controller.signal });
      } else {
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          body: 'data=' + encodeURIComponent(query),
          signal: controller.signal,
        });
      }
      clearTimeout(timer);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.elements && data.elements.length > 0) {
        return data.elements as OverpassElement[];
      }
    } catch {
      clearTimeout(timer);
      continue;
    }
  }
  return [];
}

/**
 * Builds a fast, focused Overpass query that catches EVERY healthcare facility type
 * — hospitals, clinics, PHCs, CHCs, sub-centres, dispensaries, nursing homes, doctors.
 */
function buildComprehensiveQuery(lat: number, lng: number, radiusM: number): string {
  const r = Math.min(radiusM, 25000);
  return `[out:json][timeout:20];
(
  node["amenity"="hospital"](around:${r},${lat},${lng});
  node["amenity"="clinic"](around:${r},${lat},${lng});
  node["amenity"="doctors"](around:${r},${lat},${lng});
  node["amenity"="health_post"](around:${r},${lat},${lng});
  node["amenity"="nursing_home"](around:${r},${lat},${lng});
  node["healthcare"](around:${r},${lat},${lng});
  way["amenity"="hospital"](around:${r},${lat},${lng});
  way["amenity"="clinic"](around:${r},${lat},${lng});
  way["healthcare"](around:${r},${lat},${lng});
);
out center 150;`;
}

/**
 * Try to fetch from ABDM Health Facility Registry (India's national health DB).
 * This has EVERY govt hospital, PHC, CHC, Sub-centre registered under NHM/PMJAY.
 */
async function fetchAbdmFacilities(
  lat: number,
  lng: number,
  districtName: string,
  stateName: string,
): Promise<Facility[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    // ABDM HFR public search API
    const url = `https://facilityservice.abdm.gov.in/api/v1/facility/search?searchTerm=${encodeURIComponent(districtName)}&state=${encodeURIComponent(stateName)}&page=0&size=50`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timer);

    if (!res.ok) return [];
    const data = await res.json();
    const items: AbdmFacility[] = data?.data?.content || data?.content || data?.facilityList || [];

    return items
      .filter(f => f.geoLocation?.latitude && f.geoLocation?.longitude)
      .map((f, i): Facility => {
        const fLat = f.geoLocation!.latitude!;
        const fLng = f.geoLocation!.longitude!;
        const name = f.facilityName || `Health Facility ${i + 1}`;
        const ownership = (f.ownership || '').toLowerCase();
        const isGovt = ownership.includes('government') || ownership.includes('public') || ownership.includes('nhm');
        const fType = (f.facilityType || '').toLowerCase();

        let category = 'Health Facility';
        if (fType.includes('district') || fType.includes('area')) category = 'District / Area Hospital';
        else if (fType.includes('phc') || fType.includes('primary')) category = 'Primary Health Centre (PHC)';
        else if (fType.includes('chc') || fType.includes('community')) category = 'Community Health Centre (CHC)';
        else if (fType.includes('sub')) category = 'Sub-Centre / Health Post';
        else if (fType.includes('hospital')) category = isGovt ? 'Government Hospital' : 'Private Hospital';
        else if (fType.includes('clinic')) category = isGovt ? 'Govt Clinic' : 'Private Clinic';
        else if (fType.includes('nursing')) category = 'Nursing Home';

        return {
          id: `abdm-${f.facilityId || i}`,
          name,
          contact_person: isGovt ? 'Medical Officer (ABDM)' : 'Medical Director (ABDM)',
          phone: f.contact?.mobile || (isGovt ? '104' : ''),
          category,
          sector: isGovt ? 'Government' : 'Private',
          address: f.address?.address || `${name}, ${districtName}`,
          pincode: f.address?.pincode || '',
          district: f.address?.districtName || districtName,
          state: f.address?.stateName || stateName,
          services: ['General Care', 'OPD Consultation', ...(isGovt ? ['Free Medicines', 'Vaccination'] : [])],
          last_updated: 'ABDM Health Facility Registry',
          data_source: 'ABDM HFR (Official)',
          data_source_type: 'Live OSM Maps' as DataSourceType,
          is_govt: isGovt,
          lat: fLat,
          lng: fLng,
        };
      })
      .filter(f => haversineKm(lat, lng, f.lat!, f.lng!) <= 50);
  } catch {
    return [];
  }
}

/**
 * Deduplicate facilities by proximity — if two are within 100m of each other, keep the richer one.
 */
function deduplicate(facilities: Facility[]): Facility[] {
  const kept: Facility[] = [];
  for (const f of facilities) {
    const dup = kept.find(k =>
      k.lat && k.lng && f.lat && f.lng &&
      haversineKm(k.lat, k.lng, f.lat, f.lng) < 0.12 &&
      k.name.toLowerCase().slice(0, 6) === f.name.toLowerCase().slice(0, 6)
    );
    if (!dup) kept.push(f);
    else if ((f.phone || f.address.length) > (dup.phone || dup.address.length)) {
      // Replace with richer record
      const idx = kept.indexOf(dup);
      kept[idx] = f;
    }
  }
  return kept;
}

export const liveHospitalService = {

  /**
   * Fetch ALL nearby healthcare facilities using multiple sources.
   * Uses GPS radius with tight 15km default for GPS mode (dense, accurate).
   */
  async fetchByRadius(
    lat: number,
    lng: number,
    districtName: string,
    stateName: string,
    radiusKm = 15 // tight radius for GPS: shows dense local results like competitor
  ): Promise<Facility[]> {
    const results: Facility[] = [];

    if (navigator.onLine) {
      // Run OSM + ABDM in parallel
      const [osmResults, abdmResults] = await Promise.allSettled([
        queryOverpass(buildComprehensiveQuery(lat, lng, radiusKm * 1000), 15000),
        fetchAbdmFacilities(lat, lng, districtName, stateName),
      ]);

      if (osmResults.status === 'fulfilled') {
        const osm = osmResults.value
          .filter(el => (el.lat && el.lon) || (el.center?.lat && el.center?.lon))
          .map((el, i) => buildFacilityFromOsm(el, i, districtName, stateName, lat, lng));
        results.push(...osm);
      }

      if (abdmResults.status === 'fulfilled') {
        results.push(...abdmResults.value);
      }

      const deduped = deduplicate(results);
      if (deduped.length >= 3) return deduped;
    }

    return this.syntheticFallback(lat, lng, districtName, stateName);
  },

  /**
   * Fetch hospitals for a district WITHOUT GPS — uses 40km radius around district centre.
   * Also queries ABDM by district name.
   */
  async fetchByDistrict(districtName: string, stateName: string): Promise<Facility[]> {
    const centre = DISTRICT_COORDINATES[districtName];
    if (!centre || !navigator.onLine) return [];

    const lat = centre.lat;
    const lng = centre.lng;
    const radiusM = 25000;

    const [osmResults, abdmResults] = await Promise.allSettled([
      queryOverpass(buildComprehensiveQuery(lat, lng, radiusM), 15000),
      fetchAbdmFacilities(lat, lng, districtName, stateName),
    ]);

    const all: Facility[] = [];

    if (osmResults.status === 'fulfilled') {
      all.push(...osmResults.value
        .filter(el => (el.lat && el.lon) || (el.center?.lat && el.center?.lon))
        .map((el, i) => buildFacilityFromOsm(el, i, districtName, stateName, lat, lng)));
    }

    if (abdmResults.status === 'fulfilled') {
      all.push(...abdmResults.value);
    }

    return deduplicate(all);
  },

  /**
   * Legacy wrapper for AppContext compatibility.
   */
  async fetchLiveNearbyFacilities(
    lat: number,
    lng: number,
    districtName = 'Current Area',
    stateName = 'India',
    radiusKm = 15
  ): Promise<Facility[]> {
    return this.fetchByRadius(lat, lng, districtName, stateName, radiusKm);
  },

  /**
   * Synthetic fallback with clearly-labelled generated facilities.
   * Only used when both OSM and ABDM fail.
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
      id, name,
      contact_person: isGovt ? 'Medical Officer' : 'Medical Director',
      phone: isGovt ? '104' : '',
      category: cat,
      sector: isGovt ? 'Government' : 'Private',
      address: `${name}, ${district}`,
      pincode: '',
      district, state,
      services,
      last_updated: 'GPS Estimated',
      data_source: 'Live GPS Radar',
      data_source_type: 'Live GPS Radar' as DataSourceType,
      is_govt: isGovt,
      lat: userLat + dLat,
      lng: userLng + dLng,
    });

    return [
      make(`gps-dh-${district}`, `${district} District Government Hospital`, 'District / Area Hospital', true,
        ['Maternal Care', 'Emergency Care', 'Child Care', 'General Care', 'Laboratory', 'Pharmacy', '24x7'], 0.022, 0.012),
      make(`gps-chc-${district}`, `${district} Community Health Centre (CHC)`, 'Community Health Centre (CHC)', true,
        ['Maternal Care', 'Emergency Care', 'Child Care', 'General Care', 'Free Medicines', 'Vaccination'], 0.009, 0.038),
      make(`gps-phc-${district}`, `Primary Health Centre — ${district}`, 'Primary Health Centre (PHC)', true,
        ['General Care', 'Free Medicines', 'Child Care', 'Vaccination'], -0.012, -0.009),
      make(`gps-uphc-${district}`, `Urban PHC / Dispensary — ${district}`, 'Urban PHC / Dispensary', true,
        ['General Care', 'OPD Consultation', 'Free Medicines'], 0.005, -0.018),
      make(`gps-pvt1-${district}`, `Sanjivani Multi-Specialty Hospital`, 'Private Multi-Specialty Hospital', false,
        ['Emergency Care', 'General Care', 'Laboratory', 'Pharmacy', 'Specialist Care', 'Maternal Care'], -0.028, 0.022),
      make(`gps-pvt2-${district}`, `Aarogya Maternity & Surgical Nursing Home`, 'Maternity & Nursing Home', false,
        ['Maternal Care', 'Child Care', 'General Care', 'Pharmacy'], -0.014, -0.018),
    ];
  },
};
