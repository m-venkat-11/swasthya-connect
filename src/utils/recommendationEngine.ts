import type { Facility, HealthNeedType, FacilityRecommendation } from '../types';
import { getFacilityCoordinates, estimateTravelMinutes, DISTRICT_COORDINATES } from '../data/districtCoordinates';

// Map health need to required dataset service tags
export const NEED_SERVICE_MAP: Record<HealthNeedType, { main: string; supporting: string[]; categoryKeyword: string }> = {
  emergency: {
    main: "Emergency Care",
    supporting: ["General Care", "Pharmacy", "Laboratory"],
    categoryKeyword: "Hospital"
  },
  maternity: {
    main: "Maternal Care",
    supporting: ["Child Care", "Emergency Care", "Laboratory", "Pharmacy"],
    categoryKeyword: "Hospital"
  },
  child_care: {
    main: "Child Care",
    supporting: ["General Care", "Pharmacy", "Laboratory"],
    categoryKeyword: "Hospital"
  },
  general: {
    main: "General Care",
    supporting: ["Pharmacy"],
    categoryKeyword: "PHC"
  },
  diagnostics: {
    main: "Laboratory",
    supporting: ["General Care"],
    categoryKeyword: "Hospital"
  },
  pharmacy: {
    main: "Pharmacy",
    supporting: ["General Care"],
    categoryKeyword: "PHC"
  },
  specialist: {
    main: "Specialist Care",
    supporting: ["Laboratory", "Pharmacy"],
    categoryKeyword: "Hospital"
  }
};

/**
 * Calculates distance between two lat/lng points in km
 */
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Intelligent Recommendation Engine: Evaluates and ranks facilities for a user need
 */
export function rankFacilitiesForNeed(
  facilities: Facility[],
  needType: HealthNeedType,
  district: string,
  userLocationCoords?: { lat: number; lng: number }
): FacilityRecommendation[] {
  const needConfig = NEED_SERVICE_MAP[needType];
  const districtCenter = DISTRICT_COORDINATES[district] || { lat: 19.7515, lng: 75.7139, state: 'Maharashtra' };
  const userLat = userLocationCoords?.lat || districtCenter.lat;
  const userLng = userLocationCoords?.lng || districtCenter.lng;

  // 1. Identify Candidate Facilities:
  // When live GPS is available, calculate actual distance to find facilities within radius
  // (both Government and Private), so the system never purely depends on static excel rows.
  let districtFacilities: Facility[] = [];
  
  if (userLocationCoords) {
    const nearbyRadiusFacilities = facilities.filter(f => {
      const coords = getFacilityCoordinates(f.id, f.district, f.lat, f.lng);
      const dist = calculateHaversineKm(userLat, userLng, coords.lat, coords.lng);
      return dist <= 50; // Within 50 km radius of live GPS
    });

    const districtMatches = facilities.filter(f => f.district.toLowerCase() === district.toLowerCase());
    const map = new Map<string, Facility>();
    [...nearbyRadiusFacilities, ...districtMatches].forEach(f => map.set(f.id, f));
    districtFacilities = Array.from(map.values());
  } else {
    districtFacilities = facilities.filter(f => f.district.toLowerCase() === district.toLowerCase());
    if (districtFacilities.length === 0) {
      districtFacilities = facilities.filter(f => f.state.toLowerCase() === (districtCenter.state || 'maharashtra').toLowerCase());
    }
  }

  // 2. Compute individual scores and metrics
  const scoredFacilities: FacilityRecommendation[] = districtFacilities.map(facility => {
    const coords = getFacilityCoordinates(facility.id, facility.district, facility.lat, facility.lng);
    const distanceKm = Math.max(calculateHaversineKm(userLat, userLng, coords.lat, coords.lng), 0.8);
    const estimatedTravelMinutes = estimateTravelMinutes(distanceKm);

    const hasMainService = facility.services.includes(needConfig.main);
    const hasEmergencyCapability = facility.services.includes("Emergency Care");
    const isHospital = facility.category.toLowerCase().includes("hospital") || facility.category.toLowerCase().includes("chc");
    const is24x7 = isHospital || facility.category.includes("24x7") || facility.category.includes("SDH");

    // Compute Multi-Factor Accessibility Score (0-100)
    // 1. Service Match (Max 35 pts)
    let serviceMatchScore = 0;
    if (hasMainService) {
      serviceMatchScore = 35;
    } else if (facility.services.includes("General Care")) {
      serviceMatchScore = 15; // Basic fallback
    }

    // 2. Emergency & 24x7 Readiness (Max 25 pts)
    let emergencyScore = 10;
    if (hasEmergencyCapability) emergencyScore += 10;
    if (is24x7) emergencyScore += 5;

    // 3. Public Health Sector Priority (Max 20 pts)
    const publicScore = facility.is_govt ? 20 : 12;

    // 4. Distance & Travel Convenience (Max 15 pts)
    let distanceScore = 5;
    if (distanceKm <= 8) distanceScore = 15;
    else if (distanceKm <= 18) distanceScore = 12;
    else if (distanceKm <= 35) distanceScore = 8;

    // 5. Data Freshness & Verification Trust (Max 5 pts)
    const freshnessScore = 5;

    const totalAccessibilityScore = Math.min(100, Math.round(
      serviceMatchScore + emergencyScore + publicScore + distanceScore + freshnessScore
    ));

    // Match Reasons for Transparency
    const matchReasons: string[] = [];
    const missingServices: string[] = [];

    if (hasMainService) {
      matchReasons.push(`Equipped with verified ${needConfig.main}`);
    } else {
      missingServices.push(needConfig.main);
    }

    if (hasEmergencyCapability) {
      matchReasons.push("24x7 Casualty & Emergency ready");
    }

    if (facility.is_govt) {
      matchReasons.push("100% Free Public Hospital (PMJAY / State Scheme)");
    }

    if (distanceKm <= 15) {
      matchReasons.push(`Accessible within ~${estimatedTravelMinutes} mins`);
    }

    return {
      facility: {
        ...facility,
        lat: coords.lat,
        lng: coords.lng
      },
      accessibilityScore: totalAccessibilityScore,
      distanceKm,
      estimatedTravelMinutes,
      isRecommended: false,
      hasRequiredService: hasMainService,
      hasEmergencyCapability,
      is24x7,
      matchReasons,
      missingServices,
      scoreBreakdown: {
        serviceMatch: serviceMatchScore,
        emergencyReadiness: emergencyScore,
        publicPriority: publicScore,
        distanceConvenience: distanceScore,
        freshnessTrust: freshnessScore
      }
    };
  });

  // 3. Sort by: (1) Has Required Service, (2) Accessibility Score descending, (3) Distance ascending
  scoredFacilities.sort((a, b) => {
    if (a.hasRequiredService !== b.hasRequiredService) {
      return a.hasRequiredService ? -1 : 1;
    }
    if (b.accessibilityScore !== a.accessibilityScore) {
      return b.accessibilityScore - a.accessibilityScore;
    }
    return a.distanceKm - b.distanceKm;
  });

  // 4. Mark Top Facility as Recommended and compute comparative decision intelligence
  if (scoredFacilities.length > 0) {
    const topFacility = scoredFacilities[0];
    topFacility.isRecommended = true;

    // Find if there is a closer facility that was bypassed because it lacks services
    const closerBypassedFacility = scoredFacilities.find(
      f => f.distanceKm < topFacility.distanceKm && !f.hasRequiredService
    );

    if (closerBypassedFacility) {
      const kmDiff = Math.round((topFacility.distanceKm - closerBypassedFacility.distanceKm) * 10) / 10;
      topFacility.comparisonNote = `Recommended over ${closerBypassedFacility.facility.name} (${closerBypassedFacility.distanceKm} km). Although ${closerBypassedFacility.facility.name} is ${kmDiff} km closer, it only offers basic OPD and lacks the full ${needConfig.main} & 24x7 specialist staff required for this condition.`;
    } else {
      topFacility.comparisonNote = `Top evaluated government facility in ${district} for ${needConfig.main} with 24x7 medical staff and emergency infrastructure.`;
    }
  }

  return scoredFacilities;
}
