// Geographic coordinates for Maharashtra and Andhra Pradesh districts

export const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number; state: string; isTribalOrRural?: boolean }> = {
  // Maharashtra Districts
  'Gadchiroli (Tribal Agency)': { lat: 20.1809, lng: 79.9984, state: 'Maharashtra', isTribalOrRural: true },
  'Nandurbar (Satpura Tribal Belt)': { lat: 21.3700, lng: 74.2400, state: 'Maharashtra', isTribalOrRural: true },
  'Palghar (Coastal & Sahyadri Tribal)': { lat: 19.6967, lng: 72.7699, state: 'Maharashtra', isTribalOrRural: true },
  'Pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  'Chhatrapati Sambhajinagar (Aurangabad)': { lat: 19.8762, lng: 75.3433, state: 'Maharashtra' },
  'Nashik': { lat: 19.9975, lng: 73.7898, state: 'Maharashtra' },
  'Nagpur': { lat: 21.1458, lng: 79.0882, state: 'Maharashtra' },
  'Mumbai City': { lat: 18.9388, lng: 72.8354, state: 'Maharashtra' },
  'Mumbai Suburban': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  'Thane': { lat: 19.2183, lng: 72.9781, state: 'Maharashtra' },
  'Raigad': { lat: 18.5158, lng: 72.9866, state: 'Maharashtra' },
  'Ratnagiri': { lat: 16.9902, lng: 73.3120, state: 'Maharashtra' },
  'Sindhudurg': { lat: 16.1158, lng: 73.6961, state: 'Maharashtra' },
  'Satara': { lat: 17.6805, lng: 73.9935, state: 'Maharashtra' },
  'Sangli': { lat: 16.8524, lng: 74.5815, state: 'Maharashtra' },
  'Kolhapur': { lat: 16.7050, lng: 74.2433, state: 'Maharashtra' },
  'Solapur': { lat: 17.6599, lng: 75.9064, state: 'Maharashtra' },
  'Dhule': { lat: 20.9042, lng: 74.7749, state: 'Maharashtra' },
  'Jalgaon': { lat: 21.0077, lng: 75.5626, state: 'Maharashtra' },
  'Ahilyanagar (Ahmednagar)': { lat: 19.0952, lng: 74.7496, state: 'Maharashtra' },
  'Jalna': { lat: 19.8347, lng: 75.8816, state: 'Maharashtra' },
  'Parbhani': { lat: 19.2611, lng: 76.7767, state: 'Maharashtra' },
  'Hingoli': { lat: 19.7196, lng: 77.1471, state: 'Maharashtra' },
  'Nanded': { lat: 19.1383, lng: 77.3210, state: 'Maharashtra' },
  'Beed': { lat: 18.9891, lng: 75.7601, state: 'Maharashtra' },
  'Latur': { lat: 18.4088, lng: 76.5604, state: 'Maharashtra' },
  'Dharashiv (Osmanabad)': { lat: 18.1856, lng: 76.0422, state: 'Maharashtra' },
  'Amravati': { lat: 20.9374, lng: 77.7796, state: 'Maharashtra' },
  'Akola': { lat: 20.7002, lng: 77.0082, state: 'Maharashtra' },
  'Buldhana': { lat: 20.5293, lng: 76.1843, state: 'Maharashtra' },
  'Washim': { lat: 20.1112, lng: 77.1352, state: 'Maharashtra' },
  'Yavatmal': { lat: 20.3888, lng: 78.1204, state: 'Maharashtra' },
  'Wardha': { lat: 20.7453, lng: 78.6022, state: 'Maharashtra' },
  'Bhandara': { lat: 21.1718, lng: 79.6543, state: 'Maharashtra' },
  'Gondia (Tribal Forest)': { lat: 21.4598, lng: 80.1961, state: 'Maharashtra', isTribalOrRural: true },
  'Chandrapur': { lat: 19.9615, lng: 79.2961, state: 'Maharashtra' },

  // Andhra Pradesh Districts
  'Alluri Sitharama Raju': { lat: 18.0833, lng: 82.6667, state: 'Andhra Pradesh', isTribalOrRural: true },
  'Parvathipuram Manyam': { lat: 18.7833, lng: 83.4333, state: 'Andhra Pradesh', isTribalOrRural: true },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh' },
  'Srikakulam': { lat: 18.2949, lng: 83.8938, state: 'Andhra Pradesh' },
  'Vizianagaram': { lat: 18.1067, lng: 83.3956, state: 'Andhra Pradesh' },
  'Anakapalli': { lat: 17.6913, lng: 83.0039, state: 'Andhra Pradesh' },
  'Kakinada': { lat: 16.9891, lng: 82.2475, state: 'Andhra Pradesh' },
  'Dr. B.R. Ambedkar Konaseema': { lat: 16.5787, lng: 82.0061, state: 'Andhra Pradesh' },
  'East Godavari': { lat: 17.0005, lng: 81.8040, state: 'Andhra Pradesh' },
  'West Godavari': { lat: 16.5449, lng: 81.5212, state: 'Andhra Pradesh' },
  'Eluru': { lat: 16.7107, lng: 81.0952, state: 'Andhra Pradesh' },
  'Krishna': { lat: 16.1809, lng: 81.1303, state: 'Andhra Pradesh' },
  'NTR': { lat: 16.5062, lng: 80.6480, state: 'Andhra Pradesh' },
  'Guntur': { lat: 16.3067, lng: 80.4365, state: 'Andhra Pradesh' },
  'Bapatla': { lat: 15.9042, lng: 80.4674, state: 'Andhra Pradesh' },
  'Palnadu': { lat: 16.2359, lng: 80.0499, state: 'Andhra Pradesh' },
  'Prakasam': { lat: 15.5057, lng: 80.0499, state: 'Andhra Pradesh' },
  'Sri Potti Sriramulu Nellore': { lat: 14.4426, lng: 79.9865, state: 'Andhra Pradesh' },
  'Kurnool': { lat: 15.8281, lng: 78.0373, state: 'Andhra Pradesh' },
  'Nandyal': { lat: 15.4776, lng: 78.4836, state: 'Andhra Pradesh' },
  'Ananthapuramu': { lat: 14.6819, lng: 77.6006, state: 'Andhra Pradesh' },
  'Sri Sathya Sai': { lat: 14.1683, lng: 77.8119, state: 'Andhra Pradesh' },
  'YSR Kadapa': { lat: 14.4673, lng: 78.8242, state: 'Andhra Pradesh' },
  'Annamayya': { lat: 14.0531, lng: 78.7520, state: 'Andhra Pradesh' },
  'Chittoor': { lat: 13.2172, lng: 79.1003, state: 'Andhra Pradesh' },
  'Tirupati': { lat: 13.6288, lng: 79.4192, state: 'Andhra Pradesh' },
};

/**
 * Calculates deterministic pseudo coordinates for a facility based on its ID and district center
 */
export function getFacilityCoordinates(facilityId: string, districtName: string): { lat: number; lng: number } {
  const center = DISTRICT_COORDINATES[districtName] || { lat: 19.7515, lng: 75.7139 }; // Maharashtra default center
  
  // Deterministic seed from ID (e.g. F0042 -> numeric hash)
  let hash = 0;
  for (let i = 0; i < facilityId.length; i++) {
    hash = (hash << 5) - hash + facilityId.charCodeAt(i);
    hash |= 0;
  }
  
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  const distanceDeg = (Math.abs(hash % 100) / 100) * 0.18 + 0.02; // Roughly 2km to 20km from district center
  
  return {
    lat: center.lat + Math.sin(angle) * distanceDeg,
    lng: center.lng + Math.cos(angle) * distanceDeg,
  };
}

/**
 * Estimated travel time in minutes based on distance and rural road conditions (avg ~35 km/h)
 */
export function estimateTravelMinutes(distanceKm: number, isRural = true): number {
  const avgSpeedKmh = isRural ? 32 : 45;
  const minutes = Math.round((distanceKm / avgSpeedKmh) * 60) + 5; // +5 mins buffer for rural navigation
  return Math.max(minutes, 8);
}
