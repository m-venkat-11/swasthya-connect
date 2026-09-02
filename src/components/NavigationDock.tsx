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
  X,
  ShieldCheck, 
  WifiOff,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export const NavigationDock: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    selectedDistrict, 
    isLiveGpsActive, 
    isAdminUnlocked, 
    unlockAdmin, 
    lockAdmin, 
    isOffline,
    isSidebarExpanded,
    toggleSidebar,
    t 
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();
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
      {/* DESKTOP FROSTED DOCK (COLLAPSIBLE LIKE FLOWLY UI: THIN ICON RAIL OR FULL DRAWER) */}
      <aside 
        className={`hidden lg:flex fixed left-4 top-20 bottom-4 z-40 bg-white/90 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-xl transition-all duration-300 flex-col justify-between overflow-y-auto ${
          isSidebarExpanded ? 'w-72 p-5' : 'w-20 p-3 items-center'
        }`}
      >
        
        {/* TOP CONTENT GROUP */}
        <div className="w-full space-y-5">
          
          {/* Header & Toggle Button (Exact Flowly Header with Arrow Button) */}
          <div className={`flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'} w-full border-b border-slate-100 pb-3`}>
            {isSidebarExpanded ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-950 flex items-center justify-center text-white shadow-md shadow-teal-900/20 shrink-0">
                  <Sparkles className="w-4 h-4 text-teal-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-black text-xs text-slate-900 tracking-wider uppercase block leading-tight truncate">
                    MAIN MENU
                  </span>
                  <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block">
                    SwasthyaConnect
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-900 flex items-center justify-center text-white shadow-md shrink-0">
                <Sparkles className="w-5 h-5 text-teal-200" />
              </div>
            )}

            {/* Collapse/Expand Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              aria-label="Toggle Sidebar"
            >
              {isSidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* SECTION 1: PRIMARY CARE */}
          <div className="w-full space-y-1.5">
            {isSidebarExpanded && (
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-1">
                PRIMARY CARE
              </div>
            )}

            <Link
              to="/"
              title="Home"
              className={`relative flex items-center ${isSidebarExpanded ? 'gap-3 px-3.5' : 'justify-center px-2'} py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isCurrent('/') 
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20' 
                  : 'text-slate-700 hover:bg-teal-50/70 hover:text-teal-900'
              }`}
            >
              {isCurrent('/') && (
                <span className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-amber-400 rounded-full"></span>
              )}
              <Home className="w-5 h-5 shrink-0" />
              {isSidebarExpanded && <span>{t('navHome')}</span>}
            </Link>

            {/* Emergency 24x7 Urgent Highlight */}
            <Link
              to="/emergency"
              title="24x7 Emergency"
              className={`relative flex items-center ${isSidebarExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-2xl text-xs font-black transition-all ${
                isCurrent('/emergency') 
                  ? 'bg-emergency-600 text-white shadow-md shadow-emergency-600/30' 
                  : 'bg-emergency-50/90 text-emergency-700 hover:bg-emergency-100 border border-emergency-200/80'
              }`}
            >
              {isCurrent('/emergency') && (
                <span className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-white rounded-full"></span>
              )}
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-5 h-5 animate-pulse shrink-0" />
                {isSidebarExpanded && <span className="uppercase tracking-wide">{t('navEmergency')}</span>}
              </div>
              {isSidebarExpanded && <span className="w-2 h-2 rounded-full bg-emergency-500 animate-ping"></span>}
            </Link>

            {/* Medical Profile Pass Tab (REGULAR FULL-SIZED TAB) */}
            <Link
              to="/profile"
              title="My Emergency Medical Pass"
              className={`relative flex items-center ${isSidebarExpanded ? 'gap-3 px-3.5' : 'justify-center px-2'} py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isCurrent('/profile') 
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20' 
                  : 'text-slate-700 hover:bg-teal-50/70 hover:text-teal-900'
              }`}
            >
              {isCurrent('/profile') && (
                <span className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-amber-400 rounded-full"></span>
              )}
              <Heart className="w-5 h-5 text-rose-500 shrink-0" />
              {isSidebarExpanded && <span>{t('navProfile')}</span>}
            </Link>
          </div>

          {/* SECTION 2: LOCATION & SERVICES */}
          <div className="w-full space-y-1.5">
            {isSidebarExpanded && (
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-1">
                LOCATION & SERVICES
              </div>
            )}

            <Link
              to="/location"
              title={`Location: ${selectedDistrict}`}
              className={`relative flex items-center ${isSidebarExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isCurrent('/location') 
                  ? 'bg-teal-700 text-white shadow-md' 
                  : 'text-slate-700 hover:bg-teal-50/70 hover:text-teal-900'
              }`}
            >
              {isCurrent('/location') && (
                <span className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-amber-400 rounded-full"></span>
              )}
              <div className="flex items-center gap-2.5 truncate">
                <MapPin className="w-5 h-5 text-teal-600 shrink-0" />
                {isSidebarExpanded && <span className="truncate max-w-[150px]">{selectedDistrict}</span>}
              </div>
              {isSidebarExpanded && isLiveGpsActive && (
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-black shrink-0">
                  GPS
                </span>
              )}
            </Link>

            <Link
              to="/services"
              title="Search Healthcare Needs"
              className={`relative flex items-center ${isSidebarExpanded ? 'gap-3 px-3.5' : 'justify-center px-2'} py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isCurrent('/services') 
                  ? 'bg-teal-700 text-white shadow-md' 
                  : 'text-slate-700 hover:bg-teal-50/70 hover:text-teal-900'
              }`}
            >
              {isCurrent('/services') && (
                <span className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-amber-400 rounded-full"></span>
              )}
              <Search className="w-5 h-5 text-slate-500 shrink-0" />
              {isSidebarExpanded && <span>{t('navNeeds')}</span>}
            </Link>
          </div>

        </div>

        {/* BOTTOM CONTENT GROUP: LANGUAGE & ADMIN SETTINGS */}
        <div className="w-full space-y-3 pt-3 border-t border-slate-200/70">
          
          {isSidebarExpanded ? (
            <div className="space-y-1.5">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-1">
                LANGUAGE & SETTINGS
              </div>

              {/* Trilingual Toggle Chips in Dashboard */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                {(['mr', 'en', 'te'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`py-1 rounded-lg text-[11px] font-black transition-all ${
                      language === l 
                        ? 'bg-teal-700 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {l === 'mr' ? 'मराठी' : l === 'en' ? 'EN' : 'తెలుగు'}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Collapsed Language Quick Switcher */
            <button
              onClick={() => setLanguage(language === 'en' ? 'mr' : language === 'mr' ? 'te' : 'en')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase text-teal-800 text-center"
              title="Cycle Language"
            >
              {language.toUpperCase()}
            </button>
          )}

          {/* Secret Admin Gated Button */}
          {isAdminUnlocked ? (
            <div className={`flex items-center gap-1.5 ${isSidebarExpanded ? '' : 'justify-center'}`}>
              <Link
                to="/admin"
                className={`flex-1 flex items-center ${isSidebarExpanded ? 'gap-2 px-3' : 'justify-center p-2'} py-2 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 hover:bg-teal-100 transition-colors`}
                title="Admin Excel/CSV Portal"
              >
                <Settings className="w-4 h-4 text-teal-700 shrink-0" />
                {isSidebarExpanded && <span>Admin Excel/CSV</span>}
              </Link>
              {isSidebarExpanded && (
                <button
                  onClick={lockAdmin}
                  className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Lock Admin Mode"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsPinModalOpen(true)}
              className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between px-3' : 'justify-center p-2'} py-2 text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/70 transition-colors group`}
              title="Admin Security Gate"
            >
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0" />
                {isSidebarExpanded && <span>Admin Security Gate</span>}
              </span>
              {isSidebarExpanded && (
                <span className="text-[9px] bg-slate-200 text-slate-700 font-mono font-bold px-1.5 py-0.5 rounded">
                  PIN
                </span>
              )}
            </button>
          )}

          {/* System Status Footer in Sidebar */}
          {isSidebarExpanded && (
            <div className="p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Offline Ready</span>
              </span>
              {isOffline && (
                <span className="flex items-center gap-1 text-amber-700 font-bold">
                  <WifiOff className="w-3 h-3" /> Offline
                </span>
              )}
              <span>v1.2</span>
            </div>
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

        {/* My Medical Card Profile (Link to full tab) */}
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center p-2 rounded-xl tap-target flex-1 transition-all ${
            isCurrent('/profile') ? 'text-teal-700 font-bold bg-teal-50/80' : 'text-slate-500'
          }`}
        >
          <Heart className="w-5 h-5 text-rose-500" />
          <span className="text-[10px] mt-0.5">My Pass</span>
        </Link>

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
