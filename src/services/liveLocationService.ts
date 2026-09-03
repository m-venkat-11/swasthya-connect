import { DISTRICT_COORDINATES } from '../data/districtCoordinates';

export interface DetectedLocation {
  lat: number;
  lng: number;
  district: string;
  state: string;
  source: 'DEVICE_GPS' | 'NETWORK_IP';
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const liveLocationService = {
  /**
   * Resolves the closest district and state name from coordinates in India
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
   * Tries to fetch location via IP lookup (works seamlessly even when browser GPS is blocked/unavailable)
   */
  async getIpLocation(): Promise<DetectedLocation | null> {
    // 1. Try ipapi.co (HTTPS)
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);
          const resolved = this.resolveDistrictFromCoords(lat, lng);
          return {
            lat,
            lng,
            district: resolved.district,
            state: resolved.state,
            source: 'NETWORK_IP'
          };
        }
      }
    } catch {
      // Fall through to next
    }

    // 2. Try ipwhois.app (HTTPS)
    try {
      const res = await fetch('https://ipwhois.app/json/', { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);
          const resolved = this.resolveDistrictFromCoords(lat, lng);
          return {
            lat,
            lng,
            district: resolved.district,
            state: resolved.state,
            source: 'NETWORK_IP'
          };
        }
      }
    } catch {
      // Fall through
    }

    return null;
  },

  /**
   * Main location detector: Tries Browser GPS first, and falls back to real Network IP
   * NEVER defaults to the previously selected district!
   */
  async detectCurrentLocation(): Promise<DetectedLocation> {
    // 1. Try Browser HTML5 Geolocation API
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: true,
            maximumAge: 10000
          });
        });

        const { latitude, longitude } = pos.coords;
        const resolved = this.resolveDistrictFromCoords(latitude, longitude);
        return {
          lat: latitude,
          lng: longitude,
          district: resolved.district,
          state: resolved.state,
          source: 'DEVICE_GPS'
        };
      } catch (gpsError) {
        console.warn("Device GPS unavailable or blocked, querying Network IP location:", gpsError);
      }
    }

    // 2. Fallback to real Network IP location
    const ipLoc = await this.getIpLocation();
    if (ipLoc) {
      return ipLoc;
    }

    // 3. Default center fallback
    const def = DISTRICT_COORDINATES['Tirupati'] || { lat: 13.6288, lng: 79.4192, state: 'Andhra Pradesh' };
    return {
      lat: def.lat,
      lng: def.lng,
      district: 'Tirupati',
      state: 'Andhra Pradesh',
      source: 'NETWORK_IP'
    };
  }
};
