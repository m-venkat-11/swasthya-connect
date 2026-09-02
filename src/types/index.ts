export interface Facility {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  category: string;
  sector: 'Government' | 'Private' | string;
  address: string;
  pincode: string;
  district: string;
  state: string;
  services: string[];
  last_updated: string;
  data_source: string;
  is_govt: boolean;
  lat?: number;
  lng?: number;
}

export type HealthNeedType = 
  | 'emergency' 
  | 'maternity' 
  | 'child_care' 
  | 'general' 
  | 'diagnostics' 
  | 'pharmacy' 
  | 'specialist';

export interface HealthNeed {
  id: HealthNeedType;
  titleKey: string;
  descKey: string;
  iconName: string;
  requiredServices: string[];
  urgency: 'critical' | 'high' | 'normal';
  colorTheme: string;
}

export interface FacilityRecommendation {
  facility: Facility;
  accessibilityScore: number;
  distanceKm: number;
  estimatedTravelMinutes: number;
  isRecommended: boolean;
  hasRequiredService: boolean;
  hasEmergencyCapability: boolean;
  is24x7: boolean;
  matchReasons: string[];
  missingServices: string[];
  comparisonNote?: string;
  scoreBreakdown: {
    serviceMatch: number;
    emergencyReadiness: number;
    publicPriority: number;
    distanceConvenience: number;
    freshnessTrust: number;
  };
}

export type LanguageCode = 'en' | 'mr' | 'te';

export interface Helpline {
  number: string;
  title: string;
  description: string;
  icon: string;
  available: string;
  category: 'ambulance' | 'maternal' | 'health_info' | 'general_emergency';
}

export interface UserMedicalProfile {
  name: string;
  age: string;
  gender: string;
  bloodGroup: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyKinName?: string;
  emergencyKinPhone?: string;
  conditions: string[];
  pregnancyTrimester?: string;
  allergies?: string;
  schemeCardNumber?: string;
  pincode?: string;
  lastUpdated: string;
}

export interface ImportResult {
  success: boolean;
  addedCount: number;
  newStates: string[];
  newDistricts: string[];
  errors: string[];
}
