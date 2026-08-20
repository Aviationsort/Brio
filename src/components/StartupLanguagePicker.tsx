import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LanguageCode } from '../types';
import {
  Globe,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/translations';
import { encryptionService } from '../utils/crypto';

interface LanguageGridItem {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const StartupLanguagePicker: React.FC = () => {
  const { setLanguage, setShowLanguagePicker, setShowAuthModal, setActiveHub, showToast, setAuthRequired, t } = useApp();
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('en');

  const playTactileClick = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio fallback
    }
  };

  const handleSelectLang = async (code: LanguageCode) => {
    playTactileClick();
    setSelectedLang(code);
    try {
      await encryptionService.encrypt({
        event: 'LANGUAGE_GRID_SELECTED',
        code,
        timestamp: Date.now(),
      });
    } catch {
      // Encrypt log fallback
    }
  };

  const handleConfirmAndProceed = async () => {
    playTactileClick();
    setLanguage(selectedLang);
    setShowLanguagePicker(false);
    setActiveHub('home');
    // Do not show auth modal - user can access app directly and login later if needed

    const found = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang);
    showToast(
      t.systemLocaleConfigured,
      `${t.selectedLabel} ${found?.nativeName || selectedLang}.`,
      'success'
    );
  };

  const GRID_ITEMS: LanguageGridItem[] = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇬🇧',
    },
    {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 select-none font-sans">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#d8dce2] via-[#c8cdd6] to-[#b0b7c3] rounded-[28px] p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.9)] border-2 border-[#e6eaf0] text-slate-800 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b5e50]/15 text-[#1b5e50] text-xs font-bold font-mono">
            <Globe className="w-4 h-4 animate-spin" />
            <span>{t.selectSystemLanguage}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#162e28]">
            {t.automotiveSystemLocale}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 bg-[#b5bcc7]/60 rounded-2xl border border-white/60 shadow-inner">
          {GRID_ITEMS.map((item) => {
            const isSelected = selectedLang === item.code;
            return (
              <button
                key={item.code}
                onClick={() => handleSelectLang(item.code)}
                className={`liquid-glass-btn relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl transition-all duration-150 cursor-pointer text-center group h-28 sm:h-32 ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#216c5c] via-[#1a584b] to-[#124238] text-white border-2 border-[#38a892] shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)] translate-y-1'
                    : 'bg-gradient-to-b from-[#f7f9fc] via-[#e8ecf2] to-[#d2d7e0] hover:from-[#ffffff] hover:to-[#dfe4ed] border-t-2 border-l-2 border-white/90 border-b-2 border-r-2 border-slate-500/50 shadow-[0_6px_14px_rgba(0,0,0,0.25)] active:translate-y-1 active:shadow-inner'
                }`}
              >
                <div className="mb-2 transition-transform group-hover:scale-110 flex items-center justify-center text-2xl">
                  {item.flag}
                </div>
                <span
                  className={`liquid-glass-btn text-xs sm:text-sm font-semibold tracking-wide leading-tight ${
                    isSelected ? 'text-white font-extrabold' : 'text-[#1d352e]'
                  }`}
                >
                  {item.nativeName}
                </span>
                <span
                  className={`liquid-glass-btn text-[10px] font-mono mt-0.5 ${
                    isSelected ? 'text-emerald-200' : 'text-slate-500'
                  }`}
                >
                  {item.name}
                </span>

                {isSelected && (
                  <div className="absolute top-2 right-2 p-1 bg-emerald-400 text-black rounded-full shadow">
                    <CheckCircle2 className="liquid-glass-btn w-3 h-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-400/40">
          <div className="text-xs font-mono text-[#1d352e] flex items-center gap-2">
            <span className="font-bold">{t.selectedLabel}</span>
            <span className="px-2.5 py-1 bg-[#1b5e50]/10 border border-[#1b5e50]/30 rounded-lg font-bold text-[#1b5e50]">
              {GRID_ITEMS.find((i) => i.code === selectedLang)?.nativeName || selectedLang}
            </span>
          </div>

          <button
            onClick={handleConfirmAndProceed}
            className="liquid-glass-btn w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#1b5e50] via-[#1f7362] to-[#278e79] hover:from-[#154c41] hover:to-[#1e6f5e] text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_6px_20px_rgba(27,94,80,0.4)] border-t border-emerald-300/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>{t.confirmProceedToHome}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
