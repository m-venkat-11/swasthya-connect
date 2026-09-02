import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { ShieldCheck, PhoneCall, Info, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto pt-10 pb-8 text-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
          
          {/* Mission & Purpose */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold">
                SC
              </div>
              <span className="font-bold text-white text-base">{t('appName')}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('tagline')}
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-medium bg-teal-950/80 px-3 py-1.5 rounded-lg border border-teal-800/50">
              <HeartHandshake className="w-4 h-4 shrink-0 text-teal-300" />
              <span>Smart Rural Health Decision Support — SIH PS 26133</span>
            </div>
          </div>

          {/* Quick Helplines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              National Medical Helplines
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a 
                href="tel:108" 
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 p-2.5 rounded-lg text-white font-semibold transition-colors border border-slate-700"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emergency-500" />
                <span>108 Ambulance</span>
              </a>
              <a 
                href="tel:104" 
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 p-2.5 rounded-lg text-white font-semibold transition-colors border border-slate-700"
              >
                <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
                <span>104 Medical Advice</span>
              </a>
              <a 
                href="tel:102" 
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 p-2.5 rounded-lg text-white font-semibold transition-colors border border-slate-700"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>102 Maternal Van</span>
              </a>
              <a 
                href="tel:112" 
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 p-2.5 rounded-lg text-white font-semibold transition-colors border border-slate-700"
              >
                <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
                <span>112 Unified Emergency</span>
              </a>
            </div>
          </div>

          {/* Data Trust & Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Data Trust & Verification
            </h4>
            <div className="text-xs text-slate-400 space-y-2">
              <p className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>955+ Verified public records across 62 districts in Maharashtra & Andhra Pradesh.</span>
              </p>
              <p className="flex items-start gap-1.5 text-[11px] text-slate-400 bg-slate-800/50 p-2 rounded border border-slate-800">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{t('callAheadDisclaimer')}</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 SwasthyaConnect • Built for Public Rural Healthcare Access</p>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="hover:text-teal-400 transition-colors">
              {t('adminLink')}
            </Link>
            <span>•</span>
            <Link to="/emergency" className="hover:text-emergency-400 text-emergency-500 font-semibold transition-colors">
              {t('emergencyBtn')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
