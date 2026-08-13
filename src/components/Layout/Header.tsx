/**
 * Top Header Component with Branding, Master Lock Indicator, Language Switcher (24 Locales), Auth, and Clock
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../../utils/translations';
import { LanguageCode } from '../../types';
import { ShieldCheck, Lock, Unlock, Globe, User, Radio, Smartphone, Tablet } from 'lucide-react';
import { AuthModal } from './AuthModal';

export const Header: React.FC = () => {
  const {
    user,
    masterKeySet,
    language,
    setLanguage,
    setShowLanguagePicker,
    showMobileGUI,
    setShowMobileGUI,
    showTabletGUI,
    setShowTabletGUI,
    t,
  } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-950 via-blue-950/90 to-slate-950 backdrop-blur-2xl border-b border-sky-400/30 px-4 py-3 text-white shadow-xl shadow-sky-950/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-sky-300 via-sky-500 to-blue-600 border-t border-sky-100 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-all">
                B
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse shadow-sm shadow-emerald-400/50" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-sky-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  BRIO
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-500/20 to-blue-500/20 border border-sky-400/40 text-[10px] font-mono font-bold text-sky-300 shadow-inner">
                  v2.6 Aero E2E
                </span>
              </div>
              <p className="text-[11px] text-sky-200/80 font-medium tracking-tight hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Center Info / Master Encryption Status */}
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-b from-sky-950/80 to-slate-950/90 border border-sky-400/30 text-xs shadow-inner backdrop-blur-md">
            {masterKeySet ? (
              <div className="flex items-center gap-2 text-emerald-300 font-mono text-[11px] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>AES-GCM 256 VAULT ACTIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-300 font-mono text-[11px] font-bold">
                <Unlock className="w-4 h-4 text-amber-400" />
                <span>DEFAULT ENCRYPTION KEY</span>
              </div>
            )}
            <span className="text-sky-800">|</span>
            <div className="flex items-center gap-1.5 text-sky-200 font-mono text-[11px] font-bold">
              <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>{currentTime}</span>
            </div>
          </div>

          {/* Right Controls: 25-Language Selector & Auth */}
          <div className="flex items-center gap-2">
            {/* Show device view toggles only if explicitly in mobile or tablet mode */}
            {(showTabletGUI || showMobileGUI) && (
              <>
                {showTabletGUI && (
                  <button
                    onClick={() => {
                      setShowTabletGUI(false);
                      setShowMobileGUI(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/40 border border-sky-200 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Tablet className="w-4 h-4 text-sky-300" />
                    <span className="hidden sm:inline">{t.tabletMode || 'Tablet IFE'}</span>
                  </button>
                )}

                {showMobileGUI && (
                  <button
                    onClick={() => {
                      setShowMobileGUI(false);
                      setShowTabletGUI(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/30 border border-amber-300 text-amber-200 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-sky-300" />
                    <span className="hidden sm:inline">{t.mobileMode || 'WP7 Mobile'}</span>
                  </button>
                )}
              </>
            )}

            {/* Launch IFE Welcome Screen Button */}
            <button
              onClick={() => setShowLanguagePicker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-500/20 to-blue-600/30 hover:from-sky-400/30 hover:to-blue-500/40 border border-sky-300/40 rounded-xl text-xs font-bold text-sky-200 transition-all shadow-md active:scale-95 cursor-pointer"
              title="Open 5x5 Language Welcome Screen"
            >
              <Globe className="w-4 h-4 text-sky-300 animate-pulse" />
              <span className="hidden lg:inline">Language IFE</span>
            </button>

            {/* Locale Dropdown */}
            <div className="relative flex items-center">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="px-2.5 py-1.5 bg-gradient-to-b from-slate-900 to-sky-950 border border-sky-400/30 hover:border-sky-300 rounded-xl text-xs font-medium text-sky-100 focus:outline-none focus:border-sky-300 transition-colors cursor-pointer appearance-none shadow-md"
              >
                {SUPPORTED_LANGUAGES.filter(
                  (l) => l.parentFamily === 'French' || l.code === 'en' || !l.parentFamily
                ).map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Auth Button */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-b from-sky-400 via-sky-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 border-t border-sky-200 text-xs font-bold text-white transition-all shadow-lg shadow-sky-500/20 active:scale-95 cursor-pointer"
            >
              {user ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-[10px] font-black text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">{user.username}</span>
                  <Lock className="w-3.5 h-3.5 text-emerald-200" />
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-white" />
                  <span>{t.login}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
