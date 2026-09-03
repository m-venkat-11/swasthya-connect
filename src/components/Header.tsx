import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  HeartPulse, 
  MapPin, 
  ShieldCheck, 
  WifiOff, 
  KeyRound, 
  X,
  ChevronDown,
  Globe,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { 
    isOffline, 
    selectedDistrict, 
    isLiveGpsActive,
    unlockAdmin,
    language,
    setLanguage,
    t
  } = useApp();

  const navigate = useNavigate();

  // Language Dropdown state
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);

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

  const languageLabels: Record<string, { short: string; full: string }> = {
    en: { short: 'EN', full: 'English' },
    mr: { short: 'मराठी', full: 'मराठी (Marathi)' },
    te: { short: 'తెలుగు', full: 'తెలుగు (Telugu)' }
  };

  return (
    <>
      {/* 
        Sleek, High-Contrast Header:
        - Deep teal-slate dark gradient background: completely differentiates from the light page body!
        - Compact height: on mobile it takes only ~52px, never overlapping or crowding.
      */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white border-b border-teal-500/25 shadow-lg backdrop-blur-md transition-all">
        {/* Offline Status Warning Bar */}
        {isOffline && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] sm:text-[11px] font-black px-3 py-0.5 sm:py-1 flex items-center justify-center gap-1.5 text-center animate-pulse">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>OFFLINE MODE — USING LOCAL CACHE</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* BRAND LOGO & TITLE */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1 sm:flex-initial">
            <button
              onClick={handleLogoTap}
              className="relative flex items-center gap-2 sm:gap-3 text-left group focus:outline-none min-w-0"
              aria-label="SWASTHYA CONNECT"
            >
              {/* Luminous Glowing Brand Icon */}
              <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-teal-900 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-all ring-2 ring-emerald-400/30 shrink-0">
                <HeartPulse className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-100 animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-black text-sm xs:text-base sm:text-2xl tracking-wide uppercase text-white leading-none whitespace-nowrap truncate">
                    SWASTHYA <span className="text-emerald-400">CONNECT</span>
                  </span>
                  <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> SIH PS 26133
                  </span>
                </div>
                
                {/* Desktop subtitle */}
                <p className="hidden md:flex text-[11px] font-bold uppercase tracking-widest text-teal-200/80 mt-1 items-center gap-1.5">
                  <span>{t('ruralAssistantSubtitle')}</span>
                  <span className="text-teal-600">•</span>
                  <span className="text-emerald-400">{t('subTagline')}</span>
                </p>
              </div>
            </button>
          </div>

          {/* RIGHT SIDE: LANGUAGE SWITCHER + COMPACT LOCATION */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* 🌐 LANGUAGE SWITCHER PILL (MOBILE & DESKTOP) */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="bg-white/10 hover:bg-white/15 border border-white/15 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 text-white font-bold transition-colors tap-target shrink-0 shadow-2xs active:scale-95"
                title="Change Language / भाषा बदला / భాష మార్చండి"
                aria-label="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                <span className="text-[11px] sm:text-xs font-black uppercase text-teal-100">
                  {languageLabels[language]?.short || 'EN'}
                </span>
                <ChevronDown className="w-3 h-3 text-teal-300 shrink-0" />
              </button>

              {/* Language Dropdown Menu */}
              {showLangMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs" 
                    onClick={() => setShowLangMenu(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-teal-500/40 rounded-2xl shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 text-white">
                    <div className="px-3 py-1 text-[10px] font-black uppercase text-teal-400 tracking-wider border-b border-slate-800">
                      Select Language
                    </div>
                    {(['en', 'mr', 'te'] as const).map((langKey) => (
                      <button
                        key={langKey}
                        onClick={() => { 
                          setLanguage(langKey); 
                          setShowLangMenu(false); 
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between transition-colors ${
                          language === langKey 
                            ? 'bg-teal-600/30 text-emerald-300 border-l-2 border-emerald-400' 
                            : 'text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <span>{languageLabels[langKey].full}</span>
                        {language === langKey && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* LOCATION SELECTOR PILL */}
            <button
              onClick={() => navigate('/location')}
              className="bg-white/10 hover:bg-white/15 border border-white/15 px-2 sm:px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 sm:gap-2 transition-all group tap-target shrink-0 active:scale-95 max-w-[110px] xs:max-w-[140px] sm:max-w-[200px]"
              title="Change District"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              
              <div className="text-left min-w-0">
                <span className="font-extrabold text-white truncate block text-[11px] sm:text-xs leading-none">
                  {selectedDistrict.split(' ')[0]}
                </span>
              </div>

              {isLiveGpsActive ? (
                <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/20 px-1 py-0.5 rounded flex items-center gap-1 shrink-0 border border-emerald-400/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> GPS
                </span>
              ) : (
                <ChevronDown className="w-3 h-3 text-teal-300 group-hover:translate-y-0.5 transition-transform shrink-0" />
              )}
            </button>

          </div>

        </div>
      </header>

      {/* Secret 5-Tap Knock PIN Modal for Admin Access */}
      {showSecretPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl text-white space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wider">Secret Knock Triggered</h4>
                  <span className="text-[10px] text-teal-400 font-bold">District Admin Access Gate</span>
                </div>
              </div>
              <button 
                onClick={() => { setShowSecretPinModal(false); setEnteredPin(''); }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Enter the health officer security PIN to access the Excel/CSV master data portal.
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                placeholder="••••••••"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono tracking-widest text-center"
              />

              {pinError && (
                <div className="text-rose-400 text-xs font-bold">
                  Access denied. Invalid administrator passcode.
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSecretPinModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-black text-slate-950 bg-teal-400 hover:bg-teal-300 shadow-md"
                >
                  Unlock Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
