import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Facility, HealthNeedType, LanguageCode, UserMedicalProfile, ImportResult } from '../types';
import seedData from '../data/facilities_seed.json';
import { TRANSLATIONS } from '../data/translations';
import { DISTRICT_COORDINATES } from '../data/districtCoordinates';

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
  // Secret Admin & Data Import
  isAdminUnlocked: boolean;
  unlockAdmin: (pin: string) => boolean;
  lockAdmin: () => void;
  importFacilitiesData: (newFacilities: Facility[]) => ImportResult;
  allAvailableStates: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_FACILITIES = 'swasthya_facilities_overrides';
const STORAGE_KEY_CUSTOM_FACILITIES = 'swasthya_custom_imported_facilities';
const STORAGE_KEY_LANG = 'swasthya_lang';
const STORAGE_KEY_DISTRICT = 'swasthya_district';
const STORAGE_KEY_STATE = 'swasthya_state';
const STORAGE_KEY_USER_PROFILE = 'swasthya_user_medical_profile';
const STORAGE_KEY_ADMIN_AUTH = 'swasthya_admin_unlocked';

const ADMIN_PIN = 'sih2026';

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

  // Secret Admin Lock state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true';
  });

  // User Medical Profile
  const [userProfile, setUserProfile] = useState<UserMedicalProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Load facilities with localStorage overrides + custom imported facilities
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

  // Available states dynamically computed from dataset
  const allAvailableStates = Array.from(new Set(facilities.map(f => f.state))).sort();

  // Auto-Geolocation on initial website load
  const autoDetectLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setIsLiveGpsActive(true);

        // Find closest district in our coordinates dataset
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

        // If reasonably close (< 250km from a known district center), auto-select it
        if (closestDistrict && closestDistance < 250) {
          setSelectedDistrictState(closestDistrict);
          setSelectedStateState(matchedState);
          localStorage.setItem(STORAGE_KEY_DISTRICT, closestDistrict);
          localStorage.setItem(STORAGE_KEY_STATE, matchedState);
        }
      },
      (err) => {
        console.log("GPS permission not granted or timeout; using district default:", err.message);
        setIsLiveGpsActive(false);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, []);

  useEffect(() => {
    autoDetectLocation();
  }, [autoDetectLocation]);

  // Offline event listeners
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

  // Secret Admin PIN authentication
  const unlockAdmin = (pin: string): boolean => {
    if (pin.trim() === ADMIN_PIN || pin.trim() === 'swasthya123') {
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

  // Dynamic CSV/Excel Import
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
        isAdminUnlocked,
        unlockAdmin,
        lockAdmin,
        importFacilitiesData,
        allAvailableStates
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
