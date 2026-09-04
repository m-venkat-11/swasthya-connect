import { DISTRICT_COORDINATES } from '../data/districtCoordinates';

export interface DetectedLocation {
  lat: number;
  lng: number;
  district: string;
  state: string;
  source: 'DEVICE_GPS' | 'NETWORK_IP';
  accuracy?: number; // metres, only for DEVICE_GPS
  displayAddress?: string;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const liveLocationService = {
  /**
   * Resolves the closest district and state from lat/lng using our district coordinate table.
   */
  resolveDistrictFromCoords(lat: number, lng: number): { district: string; state: string } {
    let closestDistrict = 'Tirupati';
    let matchedState = 'Andhra Pradesh';
    let closestDistance = Infinity;

    for (const [distName, data] of Object.entries(DISTRICT_COORDINATES)) {
      const d = calculateDistance(lat, lng, data.lat, data.lng);
      if (d < closestDistance) {
        closestDistance = d;
        closestDistrict = distName;
        matchedState = data.state;
      }
    }
    return { district: closestDistrict, state: matchedState };
  },

  /**
   * Try browser's native HTML5 Geolocation API — most accurate.
   * Uses high accuracy mode with 10s timeout.
   */
  async getBrowserGps(): Promise<DetectedLocation | null> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return null;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 11000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeout);
          const { latitude, longitude, accuracy } = pos.coords;
          const resolved = this.resolveDistrictFromCoords(latitude, longitude);
          resolve({
            lat: latitude,
            lng: longitude,
            district: resolved.district,
            state: resolved.state,
            source: 'DEVICE_GPS',
            accuracy: Math.round(accuracy),
          });
        },
        (err) => {
          clearTimeout(timeout);
          console.warn('Browser GPS denied/unavailable:', err.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  },

  /**
   * Fetch location from multiple IP geolocation providers in parallel.
   * Uses the fastest successful response.
   */
  async getIpLocation(): Promise<DetectedLocation | null> {
    const providers = [
      async () => {
        const r = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
        if (!r.ok) throw new Error('ipapi failed');
        const d = await r.json();
        if (!d.latitude || !d.longitude) throw new Error('no coords');
        return { lat: parseFloat(d.latitude), lng: parseFloat(d.longitude), city: d.city || '' };
      },
      async () => {
        const r = await fetch('https://ip-api.com/json/?fields=lat,lon,city,status', { signal: AbortSignal.timeout(5000) });
        if (!r.ok) throw new Error('ip-api failed');
        const d = await r.json();
        if (d.status !== 'success') throw new Error('ip-api bad status');
        return { lat: d.lat, lng: d.lon, city: d.city || '' };
      },
      async () => {
        const r = await fetch('https://ipwhois.app/json/', { signal: AbortSignal.timeout(5000) });
        if (!r.ok) throw new Error('ipwhois failed');
        const d = await r.json();
        if (!d.latitude || !d.longitude) throw new Error('no coords');
        return { lat: parseFloat(d.latitude), lng: parseFloat(d.longitude), city: d.city || '' };
      },
    ];

    // Race all providers
    const results = await Promise.allSettled(providers.map(p => p()));
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { lat, lng, city } = result.value;
        const resolved = this.resolveDistrictFromCoords(lat, lng);
        return {
          lat,
          lng,
          district: resolved.district,
          state: resolved.state,
          source: 'NETWORK_IP',
          displayAddress: city || resolved.district,
        };
      }
    }
    return null;
  },

  /**
   * Main detector — tries Device GPS first (most accurate), then IP geolocation.
   * Never falls back to a hardcoded city.
   */
  async detectCurrentLocation(): Promise<DetectedLocation> {
    // 1. Try Device GPS (accurate to metres when allowed)
    const gpsResult = await this.getBrowserGps();
    if (gpsResult) return gpsResult;

    // 2. Fall back to IP-based geolocation (accurate to city level)
    const ipResult = await this.getIpLocation();
    if (ipResult) return ipResult;

    // 3. Last resort — tell user detection failed instead of silently returning wrong city
    throw new Error('Could not detect location. Please select your district manually.');
  },
};
