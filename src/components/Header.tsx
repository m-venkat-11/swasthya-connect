import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { LanguageCode } from '../types';
import { 
  HeartPulse, 
  PhoneCall, 
  Globe, 
  WifiOff, 
  ShieldCheck, 
  Settings,
  MapPin
} from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, isOffline, selectedDistrict, t } = useApp();
  const location = useLocation();
  const isEmergencyPage = location.pathname === '/emergency';

  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      {/* Offline Status Warning Bar */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-center gap-2 text-center animate-pulse">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>{t('offlineNotice')}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Brand & Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-teal-600 rounded-lg p-1"
          aria-label="SwasthyaConnect Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white shadow-md shadow-teal-900/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight leading-none group-hover:text-teal-700 transition-colors">
                {t('appName')}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                <ShieldCheck className="w-3 h-3" /> SIH 26133
              </span>
            </div>
            <p className="text-[11px] text-slate-700 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-teal-600" />
              <span className="truncate max-w-[150px] sm:max-w-[220px] font-medium">{selectedDistrict}</span>
            </p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <Globe className="w-4 h-4 text-slate-500 ml-1 mr-0.5 shrink-0 hidden xs:block" />
            <div className="flex items-center gap-0.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-all tap-target ${
                    language === lang.code
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  aria-label={`Switch language to ${lang.label}`}
                >
                  {lang.native}
                </button>
              ))}
            </div>
          </div>

          {/* Admin Link */}
          <Link
            to="/admin"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors tap-target flex items-center justify-center hidden md:flex"
            title={t('adminLink')}
            aria-label="Health Staff Portal"
          >
            <Settings className="w-5 h-5" />
          </Link>

          {/* Emergency 24x7 Button (Prominent Red) */}
          {!isEmergencyPage && (
            <Link
              to="/emergency"
              className="bg-emergency-600 hover:bg-emergency-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-md shadow-emergency-600/30 flex items-center gap-1.5 transition-all tap-target animate-bounce duration-1000"
              aria-label="24x7 Emergency Assistance"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span className="tracking-wide uppercase font-extrabold">{t('emergencyBtn')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
