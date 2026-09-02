import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Home, 
  PhoneCall, 
  MapPin, 
  Settings, 
  Lock, 
  KeyRound,
  Heart,
  Sparkles,
  Search,
  X
} from 'lucide-react';
import { MedicalProfileModal } from './MedicalProfileModal';

export const NavigationDock: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    selectedDistrict, 
    isLiveGpsActive, 
    isAdminUnlocked, 
    unlockAdmin, 
    lockAdmin, 
    t 
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const isCurrent = (path: string) => location.pathname === path;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockAdmin(enteredPin);
    if (success) {
      setIsPinModalOpen(false);
      setEnteredPin('');
      setPinError(false);
      navigate('/admin');
    } else {
      setPinError(true);
    }
  };

  return (
    <>
      {/* DESKTOP FLOATING FROSTED DOCK (Inspired by Image 2 design) */}
      <aside className="hidden lg:block fixed left-6 top-24 z-40 w-64 bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-card p-4 transition-all space-y-6">
        
        {/* Brand Widget Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-700 via-teal-800 to-teal-950 flex items-center justify-center text-white shadow-md shadow-teal-900/25">
            <Sparkles className="w-5 h-5 text-teal-200" />
          </div>
          <div>
            <span className="font-black text-sm text-slate-900 tracking-tight block leading-none">
              SwasthyaConnect
            </span>
            <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">
              Rural Access System
            </span>
          </div>
        </div>

        {/* SECTION 1: PRIMARY ACTIONS */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-3 mb-1.5">
            Primary Care
          </div>

          <Link
            to="/"
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              isCurrent('/') 
                ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20' 
                : 'text-slate-700 hover:bg-teal-50/70 hover:text-teal-900'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>{t('navHome')}</span>
          </Link>

          {/* Emergency 24x7 Highlight */}
          <Link
            to="/emergency"
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all ${
              isCurrent('/emergency') 
                ? 'bg-emergency-600 text-white shadow-md shadow-emergency-600/30' 
                : 'bg-emergency-50/80 text-emergency-700 hover:bg-emergency-100/80 border border-emergency-200/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>{t('navEmergency')}</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emergency-500 animate-ping"></span>
          </Link>

          {/* Medical Profile Pass */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-teal-50/70 hover:text-teal-900 transition-all text-left"
          >
            <Heart className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{t('navProfile')}</span>
          </button>
        </div>

        {/* SECTION 2: LOCATION & NEEDS */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-3 mb-1.5">
            Location & Services
          </div>

          <Link
            to="/location"
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              isCurrent('/location') 
                ? 'bg-teal-700 text-white shadow-sm' 
                : 'text-slate-700 hover:bg-teal-50/70 hover:text-teal-900'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="truncate">{selectedDistrict}</span>
            </div>
            {isLiveGpsActive && (
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-extrabold shrink-0">
                GPS
              </span>
            )}
          </Link>

          <Link
            to="/services"
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              isCurrent('/services') 
                ? 'bg-teal-700 text-white shadow-sm' 
                : 'text-slate-700 hover:bg-teal-50/70 hover:text-teal-900'
            }`}
          >
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{t('navNeeds')}</span>
          </Link>
        </div>

        {/* SECTION 3: LANGUAGE & SECRET ADMIN */}
        <div className="space-y-1 pt-2 border-t border-slate-200/60">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-3 mb-1.5">
            Settings & Admin
          </div>

          {/* Trilingual Toggle Chips */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
            {(['mr', 'en', 'te'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`py-1 rounded-lg text-[11px] font-bold transition-all ${
                  language === l 
                    ? 'bg-teal-700 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l === 'mr' ? 'मराठी' : l === 'en' ? 'EN' : 'తెలుగు'}
              </button>
            ))}
          </div>

          {/* Secret Admin Gated Button */}
          {isAdminUnlocked ? (
            <div className="pt-2 flex items-center gap-1.5">
              <Link
                to="/admin"
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-teal-700" />
                <span>Admin Excel/CSV</span>
              </Link>
              <button
                onClick={lockAdmin}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Lock Admin Mode"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-[11px] font-semibold text-slate-600 hover:text-slate-700 transition-colors group mt-1"
            >
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                <span>Admin Security Gate</span>
              </span>
              <span className="text-[10px] text-slate-300">PIN</span>
            </button>
          )}
        </div>

      </aside>

      {/* MOBILE BOTTOM FLOATING DOCK (Thumb-Friendly Glass Bar) */}
      <nav className="lg:hidden fixed bottom-3 inset-x-3 z-50 bg-white/90 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl p-2 flex items-center justify-around gap-1">
        
        <Link
          to="/"
          className={`flex flex-col items-center justify-center p-2 rounded-xl tap-target flex-1 transition-all ${
            isCurrent('/') ? 'text-teal-700 font-bold bg-teal-50/80' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        {/* 24x7 Emergency Quick Dialer */}
        <Link
          to="/emergency"
          className="flex flex-col items-center justify-center p-2 rounded-xl tap-target flex-1 bg-emergency-600 text-white font-bold shadow-md shadow-emergency-600/30 active:scale-95 transition-transform"
        >
          <PhoneCall className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] mt-0.5 font-extrabold uppercase tracking-tight">108 Help</span>
        </Link>

        {/* My Medical Card Profile */}
        <button
          onClick={() => setIsProfileOpen(true)}
          className="flex flex-col items-center justify-center p-2 rounded-xl tap-target flex-1 text-slate-600 hover:text-rose-600 transition-colors"
        >
          <Heart className="w-5 h-5 text-rose-500" />
          <span className="text-[10px] mt-0.5">My Pass</span>
        </button>

        {/* Location / GPS */}
        <Link
          to="/location"
          className={`flex flex-col items-center justify-center p-2 rounded-xl tap-target flex-1 transition-all ${
            isCurrent('/location') ? 'text-teal-700 font-bold bg-teal-50/80' : 'text-slate-500'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 truncate max-w-[50px]">{selectedDistrict.split(' ')[0]}</span>
        </Link>

        {/* Secret Admin / Settings Toggle */}
        <button
          onClick={() => {
            if (isAdminUnlocked) navigate('/admin');
            else setIsPinModalOpen(true);
          }}
          className="flex flex-col items-center justify-center p-2 rounded-xl tap-target flex-1 text-slate-500 hover:text-slate-800"
        >
          {isAdminUnlocked ? <Settings className="w-5 h-5 text-teal-700" /> : <Lock className="w-5 h-5" />}
          <span className="text-[10px] mt-0.5">{isAdminUnlocked ? 'Admin' : 'Lock'}</span>
        </button>

      </nav>

      {/* MEDICAL PROFILE MODAL */}
      <MedicalProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* SECRET ADMIN PIN MODAL */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                <KeyRound className="w-5 h-5" />
                <span>{t('secretAdminGateTitle')}</span>
              </div>
              <button 
                onClick={() => setIsPinModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {t('secretAdminGateSubtitle')}
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter Admin PIN (default: sih2026)"
                value={enteredPin}
                onChange={(e) => { setEnteredPin(e.target.value); setPinError(false); }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
              />

              {pinError && (
                <p className="text-xs text-rose-600 font-bold text-center">
                  Incorrect PIN. Hint: use default "sih2026".
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors tap-target"
              >
                {t('unlockBtn')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
