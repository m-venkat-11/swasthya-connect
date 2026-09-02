import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  HeartPulse, 
  MapPin, 
  ShieldCheck, 
  WifiOff, 
  KeyRound, 
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { 
    isOffline, 
    selectedDistrict, 
    isLiveGpsActive,
    unlockAdmin, 
  } = useApp();

  const navigate = useNavigate();

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
      navigate('/admin');
    } else {
      setPinError(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-slate-200/80 shadow-soft transition-all">
        {/* Offline Status Warning Bar */}
        {isOffline && (
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-center gap-2 text-center animate-pulse">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>OFFLINE MODE ACTIVE — VIEWING CACHED VERIFIED DISTRICT RECORDS</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* PROMINENT ALL-CAPS WEBSITE BRANDING (HIGHLIGHTED) */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={handleLogoTap}
              className="relative flex items-center gap-3.5 text-left group focus:outline-none rounded-2xl p-1"
              aria-label="SWASTHYA CONNECT"
            >
              {/* Luminous Glowing Brand Icon */}
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 via-teal-800 to-emerald-950 flex items-center justify-center text-white shadow-xl shadow-teal-700/35 group-hover:scale-105 transition-all ring-2 ring-teal-500/20">
                <HeartPulse className="w-7 h-7 text-teal-200 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-2xl sm:text-3xl tracking-wider uppercase text-slate-950 leading-none drop-shadow-2xs">
                    SWASTHYA <span className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 bg-clip-text text-transparent">CONNECT</span>
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-700" /> SIH PS 26133
                  </span>
                </div>
                
                <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-teal-800/80 mt-1 flex items-center gap-1.5">
                  <span>RURAL HEALTHCARE ACCESS ASSISTANT</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-bold">RIGHT CARE → RIGHT PLACE → RIGHT TIME</span>
                </p>
              </div>
            </button>
          </div>

          {/* RIGHT SIDE: LOCATION & LIVE GPS STATUS (CLEAN & NON-DUPLICATED) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/location')}
              className="bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 px-3.5 py-2 rounded-2xl text-xs flex items-center gap-2 transition-all group tap-target"
            >
              <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-slate-500 block leading-tight">ACTIVE LOCATION</span>
                <span className="font-extrabold text-slate-900 truncate max-w-[170px] sm:max-w-[220px] block leading-tight">
                  {selectedDistrict}
                </span>
              </div>
              {isLiveGpsActive ? (
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ml-1 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> GPS ACTIVE
                </span>
              ) : (
                <span className="text-[10px] text-teal-700 font-bold group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
                  Change →
                </span>
              )}
            </button>
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
                <span>SECRET ADMIN UNLOCK</span>
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
