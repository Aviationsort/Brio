/**
 * Top Header Component with Branding, Master Lock Indicator, Auth, and Clock
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Unlock, User, Radio, Smartphone } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    user,
    masterKeySet,
    showMobileGUI,
    setShowMobileGUI,
    t,
    setShowAuthModal,
  } = useApp();
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
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0a0a0c] via-[#1a1a1a]/90 to-[#0a0a0c] backdrop-blur-2xl border-b border-red-500/30 px-4 py-3 text-white shadow-xl shadow-black/40 skeuo-panel">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-red-400 via-red-600 to-[#8B0000] border-t border-red-200 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-900/30 group-hover:scale-105 transition-all">
                B
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-[#0a0a0c] rounded-full animate-pulse shadow-sm shadow-red-500/50" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-white to-red-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  BRIO
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-900/30 to-red-950/30 border border-red-500/40 text-[10px] font-mono font-bold text-red-300 shadow-inner">
                  v2.6 Aero E2E
                </span>
              </div>
              <p className="text-[11px] text-red-200/80 font-medium tracking-tight hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Center Info / Master Encryption Status */}
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-b from-[#0a0a0c]/80 to-[#1a1a1a]/90 border border-red-500/30 text-xs shadow-inner backdrop-blur-md">
            {masterKeySet ? (
              <div className="flex items-center gap-2 text-red-300 font-mono text-[11px] font-bold">
                <ShieldCheck className="w-4 h-4 text-red-400 animate-pulse" />
                <span>AES-GCM 256 VAULT ACTIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-300 font-mono text-[11px] font-bold">
                <Unlock className="w-4 h-4 text-red-400" />
                <span>DEFAULT ENCRYPTION KEY</span>
              </div>
            )}
            <span className="text-red-900">|</span>
            <div className="flex items-center gap-1.5 text-red-200 font-mono text-[11px] font-bold">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>{currentTime}</span>
            </div>
          </div>

          {/* Right Controls: Auth */}
          <div className="flex items-center gap-2">
            {/* Show device view toggle only if explicitly in mobile mode */}
            {showMobileGUI && (
              <button
                onClick={() => {
                  setShowMobileGUI(false);
                }}
                className="skeuo-btn flex items-center gap-1.5 px-3 py-1.5 bg-red-900/30 border border-red-300 text-red-200 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-red-300" />
                <span className="hidden sm:inline">{t.mobileMode || 'WP7 Mobile'}</span>
              </button>
            )}

            {/* Auth Button */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="skeuo-btn-primary flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-b from-red-500 via-red-600 to-[#8B0000] hover:from-red-400 hover:to-red-700 border-t border-red-300 text-xs font-bold text-white transition-all shadow-lg shadow-red-900/20 active:scale-95 cursor-pointer"
            >
              {user ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-[10px] font-black text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">{user.username}</span>
                  <Lock className="w-3.5 h-3.5 text-red-200" />
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
    </>
  );
};
