import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Facility, HealthNeedType, LanguageCode } from '../types';
import seedData from '../data/facilities_seed.json';
import { TRANSLATIONS } from '../data/translations';

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
  t: (key: string) => string;
  updateFacilityAdmin: (facilityId: string, updates: Partial<Facility>) => void;
  resetMasterData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_FACILITIES = 'swasthya_facilities_overrides';
const STORAGE_KEY_LANG = 'swasthya_lang';
const STORAGE_KEY_DISTRICT = 'swasthya_district';
const STORAGE_KEY_STATE = 'swasthya_state';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Marathi relevance or English
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
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Load facilities with localStorage overrides
  const [facilities, setFacilities] = useState<Facility[]>(() => {
    try {
      const savedOverrides = localStorage.getItem(STORAGE_KEY_FACILITIES);
      if (savedOverrides) {
        const overridesMap = JSON.parse(savedOverrides);
        return (seedData as Facility[]).map(fac => {
          if (overridesMap[fac.id]) {
            return { ...fac, ...overridesMap[fac.id] };
          }
          return fac;
        });
      }
    } catch (e) {
      console.warn("Failed to parse saved facilities", e);
    }
    return seedData as Facility[];
  });

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

  // Translation helper
  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  // Admin update facility
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

    // Save override to localStorage
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
        t,
        updateFacilityAdmin,
        resetMasterData
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
