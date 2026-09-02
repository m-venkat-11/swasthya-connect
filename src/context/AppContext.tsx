import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { 
  Facility, 
  HealthNeedType, 
  LanguageCode, 
  UserMedicalProfile, 
  ImportResult,
  UserAuth,
  MedicalAppointment,
  ReferralRecord,
  FollowUpItem
} from '../types';
import seedData from '../data/facilities_seed.json';
import { TRANSLATIONS } from '../data/translations';
import { DISTRICT_COORDINATES } from '../data/districtCoordinates';
import { authService } from '../services/authService';
import { persistenceService } from '../services/persistenceService';

interface AppContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedNeed: HealthNeedType;
  setSelectedNeed: (need: HealthNeedType) => void;
  facilities: Facility[];
  isOffline: boolean;
  userCoords: { lat: number; lng: number } | null;
  setUserCoords: (coords: { lat: number; lng: number } | null) => void;
  isLiveGpsActive: boolean;
  t: (key: string) => string;
  updateFacilityAdmin: (facilityId: string, updates: Partial<Facility>) => void;
  resetMasterData: () => void;
  // Medical Profile
  userProfile: UserMedicalProfile | null;
  saveUserProfile: (profile: UserMedicalProfile) => void;
  // Sidebar State (synchronized with App layout)
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
  toggleSidebar: () => void;
  // Secret Admin & Data Import
  isAdminUnlocked: boolean;
  unlockAdmin: (pin: string) => boolean;
  lockAdmin: () => void;
  importFacilitiesData: (newFacilities: Facility[]) => ImportResult;
  allAvailableStates: string[];

  // Just-In-Time Authentication
  user: UserAuth | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authActionDescription: string;
  requireAuthentication: (actionDesc: string, onVerified: () => void) => void;
  loginWithOtp: (otp: string, phone: string) => Promise<boolean>;
  logout: () => void;
  closeAuthModal: () => void;

  // Persistent Cloud & Local Records
  appointments: MedicalAppointment[];
  referrals: ReferralRecord[];
  followUps: FollowUpItem[];
  bookAppointment: (appointment: Omit<MedicalAppointment, 'id'>) => Promise<MedicalAppointment>;
  cancelAppointment: (id: string) => void;

  // Voice Assistant Global State
  isVoiceAssistantOpen: boolean;
  openVoiceAssistant: () => void;
  closeVoiceAssistant: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_FACILITIES = 'swasthya_facilities_overrides';
const STORAGE_KEY_CUSTOM_FACILITIES = 'swasthya_custom_imported_facilities';
const STORAGE_KEY_LANG = 'swasthya_lang';
const STORAGE_KEY_DISTRICT = 'swasthya_district';
const STORAGE_KEY_STATE = 'swasthya_state';
const STORAGE_KEY_USER_PROFILE = 'swasthya_user_medical_profile';
const STORAGE_KEY_ADMIN_AUTH = 'swasthya_admin_unlocked';
const STORAGE_KEY_SIDEBAR = 'swasthya_sidebar_expanded';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PASSCODE || 'sih2026';

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

// Default initial sample profile with prescriptions & appointments
const DEFAULT_INITIAL_PROFILE: UserMedicalProfile = {
  name: "Savita Ramesh Shinde",
  age: "26",
  gender: "Female",
  bloodGroup: "O+",
  emergencyContactName: "Ramesh Shinde (Husband)",
  emergencyContactPhone: "9822123456",
  emergencyKinName: "Ramesh Shinde (Husband)",
  emergencyKinPhone: "9822123456",
  conditions: ["Pregnancy", "Mild Anemia"],
  pregnancyTrimester: "3rd Trimester (Months 7-9, Near Delivery)",
  allergies: "None / No known drug allergies",
  schemeCardNumber: "PMJAY-MH-84920194",
  pincode: "442605",
  lastUpdated: new Date().toISOString().split('T')[0],
  prescriptions: [
    {
      id: "rx-1",
      medicineName: "Iron & Folic Acid Tablets (IFA)",
      dosage: "100mg elemental iron + 500mcg folic acid",
      frequency: "1 tablet once daily after lunch",
      prescribedBy: "Dr. A. K. Sharma (District Civil Hospital)",
      startDate: "2026-08-15",
      durationDays: "90 Days",
      isActive: true
    },
    {
      id: "rx-2",
      medicineName: "Calcium Carbonate + Vitamin D3",
      dosage: "500mg calcium",
      frequency: "1 tablet twice daily after meals",
      prescribedBy: "Medical Officer, PHC Kurkheda",
      startDate: "2026-08-20",
      durationDays: "60 Days",
      isActive: true
    },
    {
      id: "rx-3",
      medicineName: "Paracetamol 500mg (SOS for fever)",
      dosage: "500mg",
      frequency: "Only if fever > 100°F (Max 3 times daily)",
      prescribedBy: "Medical Officer, PHC Kurkheda",
      startDate: "2026-08-20",
      durationDays: "As needed",
      isActive: false
    }
  ],
  appointments: [
    {
      id: "apt-1",
      title: "Antenatal Checkup #4 (36-Week Ultrasound & Delivery Plan)",
      facilityName: "Sub-District Hospital / Civil Hospital",
      doctorName: "Dr. Sneha Deshmukh (Gynecologist)",
      date: "2026-09-10",
      time: "10:30 AM",
      status: "upcoming",
      notes: "Carry previous sonography reports and maternal MCP card"
    },
    {
      id: "apt-2",
      title: "ASHA Worker Home Visit & Nutrition Counseling",
      facilityName: "Sub-Centre / Anganwadi",
      doctorName: "Meena Tai (ASHA Facilitator)",
      date: "2026-09-05",
      time: "02:00 PM",
      status: "upcoming",
      notes: "Janani Suraksha Yojana (JSY) direct benefit transfer form verification"
    },
    {
      id: "apt-3",
      title: "Routine Blood Glucose & Hb Screening (Completed)",
      facilityName: "Primary Health Centre (PHC)",
      doctorName: "Lab Technician Rahul",
      date: "2026-08-18",
      time: "09:00 AM",
      status: "completed",
      notes: "Hb report: 11.2 g/dL. Blood pressure: 118/76 mmHg. Normal."
    }
  ],
  vaccinations: [
    {
      id: "vac-1",
      vaccineName: "Tetanus & adult Diphtheria (Td 1)",
      dateGiven: "2026-03-12",
      centerName: "PHC Health Sub-Centre"
    },
    {
      id: "vac-2",
      vaccineName: "Tetanus & adult Diphtheria (Td 2 / Booster)",
      dateGiven: "2026-04-15",
      centerName: "Sub-District Hospital"
    }
  ],
  labReports: [
    {
      id: "lab-1",
      testName: "Hemoglobin (Hb)",
      resultValue: "11.2 g/dL",
      normalRange: "11.0 - 15.0 g/dL",
      testDate: "2026-08-18",
      status: "Normal"
    },
    {
      id: "lab-2",
      testName: "Random Blood Sugar (RBS)",
      resultValue: "104 mg/dL",
      normalRange: "70 - 140 mg/dL",
      testDate: "2026-08-18",
      status: "Normal"
    },
    {
      id: "lab-3",
      testName: "Blood Group & Rh Typing",
      resultValue: "O Positive (Rh+)",
      normalRange: "Verified Record",
      testDate: "2026-03-10",
      status: "Normal"
    }
  ]
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem(STORAGE_KEY_LANG) as LanguageCode) || 'mr';
  });

  const [selectedState, setSelectedStateState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_STATE) || 'Maharashtra';
  });

  const [selectedDistrict, setSelectedDistrictState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_DISTRICT) || 'Gadchiroli (Tribal Agency)';
  });

  const [selectedNeed, setSelectedNeed] = useState<HealthNeedType>('maternity');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLiveGpsActive, setIsLiveGpsActive] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Sidebar expanded state synchronized across app
  const [isSidebarExpanded, setIsSidebarExpandedState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SIDEBAR);
    return saved !== null ? saved === 'true' : false;
  });

  const setIsSidebarExpanded = (expanded: boolean) => {
    setIsSidebarExpandedState(expanded);
    localStorage.setItem(STORAGE_KEY_SIDEBAR, String(expanded));
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Secret Admin Lock state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true';
  });

  // User Medical Profile
  const [userProfile, setUserProfile] = useState<UserMedicalProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_INITIAL_PROFILE,
          ...parsed,
          prescriptions: parsed.prescriptions || DEFAULT_INITIAL_PROFILE.prescriptions,
          appointments: parsed.appointments || DEFAULT_INITIAL_PROFILE.appointments,
          vaccinations: parsed.vaccinations || DEFAULT_INITIAL_PROFILE.vaccinations,
          labReports: parsed.labReports || DEFAULT_INITIAL_PROFILE.labReports
        };
      }
      return DEFAULT_INITIAL_PROFILE;
    } catch {
      return DEFAULT_INITIAL_PROFILE;
    }
  });

  // Load facilities
  const [facilities, setFacilities] = useState<Facility[]>(() => {
    let baseList = seedData as Facility[];
    try {
      const customRaw = localStorage.getItem(STORAGE_KEY_CUSTOM_FACILITIES);
      if (customRaw) {
        const customItems: Facility[] = JSON.parse(customRaw);
        baseList = [...baseList, ...customItems];
      }

      const savedOverrides = localStorage.getItem(STORAGE_KEY_FACILITIES);
      if (savedOverrides) {
        const overridesMap = JSON.parse(savedOverrides);
        return baseList.map(fac => overridesMap[fac.id] ? { ...fac, ...overridesMap[fac.id] } : fac);
      }
    } catch (e) {
      console.warn("Failed to load custom facilities", e);
    }
    return baseList;
  });

  const allAvailableStates = Array.from(new Set(facilities.map(f => f.state))).sort();

  // =========================================================================
  // JUST-IN-TIME AUTHENTICATION & MOBILE OTP
  // =========================================================================
  const [user, setUser] = useState<UserAuth | null>(() => authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authActionDescription, setAuthActionDescription] = useState<string>('');
  const pendingAuthActionRef = useRef<(() => void) | null>(null);

  const requireAuthentication = (actionDesc: string, onVerified: () => void) => {
    if (user) {
      onVerified();
    } else {
      setAuthActionDescription(actionDesc);
      pendingAuthActionRef.current = onVerified;
      setIsAuthModalOpen(true);
    }
  };

  const loginWithOtp = async (otp: string, phone: string): Promise<boolean> => {
    const res = await authService.verifyOtp(otp, phone);
    if (res.success && res.user) {
      setUser(res.user);
      setIsAuthModalOpen(false);
      // Run the queued pending action seamlessly!
      if (pendingAuthActionRef.current) {
        pendingAuthActionRef.current();
        pendingAuthActionRef.current = null;
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    authService.signOut();
    setUser(null);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    pendingAuthActionRef.current = null;
  };

  // =========================================================================
  // PERSISTENT RECORDS: APPOINTMENTS, REFERRALS, FOLLOW-UPS
  // =========================================================================
  const [appointments, setAppointments] = useState<MedicalAppointment[]>(() => {
    const local = persistenceService.getLocalAppointments();
    return local.length > 0 ? local : (DEFAULT_INITIAL_PROFILE.appointments || []);
  });

  const [referrals] = useState<ReferralRecord[]>(() => {
    return persistenceService.getLocalReferrals();
  });

  const [followUps] = useState<FollowUpItem[]>(() => {
    return persistenceService.getLocalFollowUps();
  });

  const bookAppointment = async (appointmentData: Omit<MedicalAppointment, 'id'>): Promise<MedicalAppointment> => {
    const newApt: MedicalAppointment = {
      ...appointmentData,
      id: `apt-${Date.now()}`,
      userId: user?.uid || 'guest',
      createdAt: new Date().toISOString()
    };
    const saved = await persistenceService.saveAppointment(newApt, user?.uid);
    setAppointments(prev => [saved, ...prev]);
    return saved;
  };

  const cancelAppointment = (id: string) => {
    const updated = appointments.filter(a => a.id !== id);
    setAppointments(updated);
    localStorage.setItem('swasthya_user_appointments', JSON.stringify(updated));
  };

  // =========================================================================
  // VOICE ASSISTANT GLOBAL MODAL STATE
  // =========================================================================
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);
  const openVoiceAssistant = () => setIsVoiceAssistantOpen(true);
  const closeVoiceAssistant = () => setIsVoiceAssistantOpen(false);

  // Auto-Geolocation
  const autoDetectLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setIsLiveGpsActive(true);

        let closestDistrict = '';
        let closestDistance = Infinity;
        let matchedState = '';

        for (const [distName, data] of Object.entries(DISTRICT_COORDINATES)) {
          const d = calculateDistance(latitude, longitude, data.lat, data.lng);
          if (d < closestDistance) {
            closestDistance = d;
            closestDistrict = distName;
            matchedState = data.state;
          }
        }

        if (closestDistrict && closestDistance < 250) {
          setSelectedDistrictState(closestDistrict);
          setSelectedStateState(matchedState);
          localStorage.setItem(STORAGE_KEY_DISTRICT, closestDistrict);
          localStorage.setItem(STORAGE_KEY_STATE, matchedState);
        }
      },
      (err) => {
        console.log("GPS not granted; using district default:", err.message);
        setIsLiveGpsActive(false);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, []);

  useEffect(() => {
    autoDetectLocation();
  }, [autoDetectLocation]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  };

  const setSelectedState = (state: string) => {
    setSelectedStateState(state);
    localStorage.setItem(STORAGE_KEY_STATE, state);
  };

  const setSelectedDistrict = (district: string) => {
    setSelectedDistrictState(district);
    localStorage.setItem(STORAGE_KEY_DISTRICT, district);
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  const saveUserProfile = (profile: UserMedicalProfile) => {
    setUserProfile(profile);
    localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(profile));
  };

  const unlockAdmin = (pin: string): boolean => {
    if (pin.trim() === ADMIN_PIN) {
      setIsAdminUnlocked(true);
      localStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
  };

  const importFacilitiesData = (newFacilities: Facility[]): ImportResult => {
    if (!newFacilities || newFacilities.length === 0) {
      return { success: false, addedCount: 0, newStates: [], newDistricts: [], errors: ['No valid records found to import'] };
    }

    try {
      const existingCustomRaw = localStorage.getItem(STORAGE_KEY_CUSTOM_FACILITIES);
      const existingCustom: Facility[] = existingCustomRaw ? JSON.parse(existingCustomRaw) : [];

      const existingIds = new Set([...facilities.map(f => f.id), ...existingCustom.map(f => f.id)]);
      const uniqueNewItems: Facility[] = [];
      const newStatesSet = new Set<string>();
      const newDistrictsSet = new Set<string>();

      newFacilities.forEach((item, idx) => {
        let finalId = item.id;
        if (!finalId || existingIds.has(finalId)) {
          finalId = `IMP_${Date.now()}_${idx + 1}`;
        }
        existingIds.add(finalId);

        const stateName = item.state ? item.state.trim() : 'Other State';
        const distName = item.district ? item.district.trim() : 'District Area';
        newStatesSet.add(stateName);
        newDistrictsSet.add(distName);

        uniqueNewItems.push({
          ...item,
          id: finalId,
          state: stateName,
          district: distName,
          is_govt: item.sector?.toLowerCase().includes('govt') || item.sector?.toLowerCase().includes('public') || item.is_govt !== false,
          last_updated: item.last_updated || new Date().toISOString().split('T')[0],
          data_source: item.data_source || 'Imported via District Admin Excel/CSV'
        });
      });

      const updatedCustom = [...existingCustom, ...uniqueNewItems];
      localStorage.setItem(STORAGE_KEY_CUSTOM_FACILITIES, JSON.stringify(updatedCustom));
      setFacilities(prev => [...prev, ...uniqueNewItems]);

      return {
        success: true,
        addedCount: uniqueNewItems.length,
        newStates: Array.from(newStatesSet),
        newDistricts: Array.from(newDistrictsSet),
        errors: []
      };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Import failed';
      return { success: false, addedCount: 0, newStates: [], newDistricts: [], errors: [message] };
    }
  };

  const updateFacilityAdmin = (facilityId: string, updates: Partial<Facility>) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedFacilities = facilities.map(fac => {
      if (fac.id === facilityId) {
        return {
          ...fac,
          ...updates,
          last_updated: today,
          data_source: 'District Health Officer Manual Update (Verified in Registry)'
        };
      }
      return fac;
    });

    setFacilities(updatedFacilities);

    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY_FACILITIES);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      existing[facilityId] = {
        ...updates,
        last_updated: today,
        data_source: 'District Health Officer Manual Update (Verified in Registry)'
      };
      localStorage.setItem(STORAGE_KEY_FACILITIES, JSON.stringify(existing));
    } catch (e) {
      console.error("Failed to save facility override", e);
    }
  };

  const resetMasterData = () => {
    localStorage.removeItem(STORAGE_KEY_FACILITIES);
    localStorage.removeItem(STORAGE_KEY_CUSTOM_FACILITIES);
    setFacilities(seedData as Facility[]);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        selectedState,
        setSelectedState,
        selectedDistrict,
        setSelectedDistrict,
        selectedNeed,
        setSelectedNeed,
        facilities,
        isOffline,
        userCoords,
        setUserCoords,
        isLiveGpsActive,
        t,
        updateFacilityAdmin,
        resetMasterData,
        userProfile,
        saveUserProfile,
        isSidebarExpanded,
        setIsSidebarExpanded,
        toggleSidebar,
        isAdminUnlocked,
        unlockAdmin,
        lockAdmin,
        importFacilitiesData,
        allAvailableStates,
        // Just-in-time auth
        user,
        isAuthenticated: Boolean(user),
        isAuthModalOpen,
        authActionDescription,
        requireAuthentication,
        loginWithOtp,
        logout,
        closeAuthModal,
        // Records
        appointments,
        referrals,
        followUps,
        bookAppointment,
        cancelAppointment,
        // Voice
        isVoiceAssistantOpen,
        openVoiceAssistant,
        closeVoiceAssistant
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
