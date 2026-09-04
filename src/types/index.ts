export type DataSourceType = 'Official Excel DB' | 'Live OSM Maps' | 'OSM+Excel Verified' | 'Live GPS Radar';

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
  data_source_type?: DataSourceType;
  is_govt: boolean;
  lat?: number;
  lng?: number;
}

export interface MedicalStore {
  id: string;
  name: string;
  storeType: 'govt' | 'chain' | 'local';
  chainBrand?: string; // Apollo, MedPlus, Jan Aushadhi etc.
  address: string;
  phone?: string;
  openHours?: string;
  district: string;
  state: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  data_source: string;
  isOpen24h?: boolean;
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

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  durationDays: string;
  isActive: boolean;
}

export interface MedicalAppointment {
  id: string;
  title: string;
  facilityName: string;
  doctorName?: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  userId?: string;
  createdAt?: string;
}

export interface VaccinationRecord {
  id: string;
  vaccineName: string;
  dateGiven: string;
  nextDueDate?: string;
  centerName: string;
}

export interface LabReportItem {
  id: string;
  testName: string;
  resultValue: string;
  normalRange: string;
  testDate: string;
  status: 'Normal' | 'Attention' | 'Critical';
}

export interface ReferralRecord {
  id: string;
  patientName: string;
  fromFacility: string;
  destinationFacility: string;
  specialty: string;
  reason: string;
  urgency: 'urgent' | 'routine';
  status: 'active' | 'completed' | 'pending';
  date: string;
  userId?: string;
}

export interface FollowUpItem {
  id: string;
  patientName: string;
  title: string;
  facilityName: string;
  date: string;
  type: 'maternal' | 'chronic' | 'vaccine' | 'general';
  status: 'pending' | 'completed';
  notes?: string;
}

export interface UserAuth {
  uid: string;
  phoneNumber: string;
  displayName?: string;
  isAnonymous?: boolean;
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
  prescriptions?: PrescriptionItem[];
  appointments?: MedicalAppointment[];
  vaccinations?: VaccinationRecord[];
  labReports?: LabReportItem[];
  referrals?: ReferralRecord[];
  followUps?: FollowUpItem[];
  lastUpdated: string;
}

export interface SymptomItem {
  id: string;
  labelEn: string;
  labelTe: string;
  labelMr: string;
  labelHi: string;
  category: 'respiratory' | 'fever' | 'maternal' | 'cardiac' | 'digestive' | 'trauma' | 'general';
  isRedFlagEmergency: boolean;
}

export interface ScreeningTriageResult {
  symptoms: string[];
  duration: string;
  severity: 'mild' | 'moderate' | 'emergency';
  riskLevel: string;
  recommendedLevel: string;
  recommendedServiceNeed: HealthNeedType;
  adviceSummary: string;
  isEmergency: boolean;
}

export type VoiceIntentType = 
  | 'EMERGENCY_DISPATCH'
  | 'SCREEN_SYMPTOMS'
  | 'FIND_FACILITY'
  | 'BOOK_APPOINTMENT'
  | 'VIEW_REFERRAL'
  | 'VIEW_FOLLOWUP'
  | 'GENERAL_INFO'
  | 'UNKNOWN';

export interface VoiceParseResult {
  intent: VoiceIntentType;
  languageDetected: 'en' | 'te' | 'hi' | 'mr';
  rawTranscript: string;
  extractedSymptoms: string[];
  targetRoute?: string;
  voiceResponse: string;
  isEmergency: boolean;
}

export interface ImportResult {
  success: boolean;
  addedCount: number;
  newStates: string[];
  newDistricts: string[];
  errors: string[];
}
