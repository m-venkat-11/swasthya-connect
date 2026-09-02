import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { LanguageCode } from '../types';
import { 
  HeartPulse, 
  PhoneCall, 
  Globe, 
  WifiOff, 
  ShieldCheck, 
  MapPin,
  Unlock,
  KeyRound,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    isOffline, 
    selectedDistrict, 
    isLiveGpsActive,
    isAdminUnlocked, 
    unlockAdmin, 
    t 
  } = useApp();

  const location = useLocation();
  const isEmergencyPage = location.pathname === '/emergency';

  // Secret 5-tap logo knock trigger
  const [logoTaps, setLogoTaps] = useState<number>(0);
  const [showSecretPinModal, setShowSecretPinModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleLogoTap = () => {
    const nextTaps = logoTaps + 1;
    setLogoTaps(nextTaps);
    if (nextTaps >= 5) {
      setLogoTaps(0);
      setShowSecretPinModal(true);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = unlockAdmin(enteredPin);
    if (ok) {
      setShowSecretPinModal(false);
      setEnteredPin('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-white/60 shadow-soft transition-all">
        {/* Offline Status Warning Bar */}
        {isOffline && (
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-center gap-2 text-center animate-pulse">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{t('offlineNotice')}</span>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          
          {/* Luminous Redesigned Brand Identity (with secret 5-tap knock) */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogoTap}
              className="relative flex items-center gap-3 text-left group focus:outline-none rounded-2xl p-1"
              title="SwasthyaConnect — SIH PS 26133"
              aria-label="SwasthyaConnect"
            >
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-600 via-teal-800 to-emerald-950 flex items-center justify-center text-white shadow-lg shadow-teal-700/30 group-hover:scale-105 transition-all">
                <HeartPulse className="w-6 h-6 text-teal-200 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight leading-none text-slate-950">
                    Swasthya<span className="text-teal-700 bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">Connect</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200">
                    <ShieldCheck className="w-3 h-3 text-teal-700" /> SIH 26133
                  </span>
                </div>
                
                {/* Live GPS / Location Subtitle */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-1">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/70">
                    <MapPin className="w-3 h-3 text-teal-700 shrink-0" />
                    <span className="truncate max-w-[140px] sm:max-w-[200px]">{selectedDistrict}</span>
                  </span>
                  {isLiveGpsActive && (
                    <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live GPS
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Selector Chips */}
            <div className="flex items-center bg-slate-100/90 rounded-xl p-1 border border-slate-200/80 shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5 shrink-0 hidden xs:block" />
              <div className="flex items-center gap-0.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all tap-target ${
                      language === lang.code
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                  >
                    {lang.native}
                  </button>
                ))}
              </div>
            </div>

            {/* Secret Admin Unlock Status Badge */}
            {isAdminUnlocked && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors"
                title="Admin Dashboard Unlocked"
              >
                <Unlock className="w-3.5 h-3.5 text-teal-700" />
                <span className="hidden sm:inline">Admin Mode</span>
              </Link>
            )}

            {/* 24x7 Emergency Callout Button */}
            {!isEmergencyPage && (
              <Link
                to="/emergency"
                className="bg-gradient-to-r from-emergency-600 to-rose-700 hover:from-emergency-700 hover:to-rose-800 active:scale-95 text-white text-xs sm:text-sm font-black px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md shadow-emergency-600/30 flex items-center gap-1.5 transition-all tap-target"
                aria-label="24x7 Emergency Assistance"
              >
                <PhoneCall className="w-4 h-4 animate-pulse" />
                <span className="tracking-wide uppercase font-black">{t('emergencyBtn')}</span>
              </Link>
            )}

          </div>

        </div>
      </header>

      {/* SECRET PIN GATE MODAL (Triggered by 5 taps on brand logo) */}
      {showSecretPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                <KeyRound className="w-5 h-5" />
                <span>Secret Admin Unlock</span>
              </div>
              <button 
                onClick={() => setShowSecretPinModal(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Secret administrator access triggered. Enter your admin PIN to unlock the CSV/Excel State Expansion dashboard.
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter PIN (default: sih2026)"
                value={enteredPin}
                onChange={(e) => { setEnteredPin(e.target.value); setPinError(false); }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
              />

              {pinError && (
                <p className="text-xs text-rose-600 font-bold text-center">
                  Incorrect PIN. Default is "sih2026".
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors tap-target"
              >
                Unlock Secret Dashboard
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
