import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { encryptionService } from '../utils/crypto';
import { fetchAccurateWeather } from '../utils/weatherService';
import { ClockSuiteModal } from './ClockSuiteModal';
import QRCode from 'qrcode';

// Hub Imports
import { ConnectSocialHub } from './Hub1_ConnectSocial/ConnectSocialHub';
import { MediaStreamingHub } from './Hub2_MediaStreaming/MediaStreamingHub';
import { ArcadeGamesHub } from './Hub3_ArcadeGames/ArcadeGamesHub';
import { ProductivityOfficeHub } from './Hub4_ProductivityOffice/ProductivityOfficeHub';
import { AviationTelemetryHub } from './Hub5_AviationTelemetry/AviationTelemetryHub';

import {
  Volume2,
  VolumeX,
  Home,
  Menu,
  RotateCcw,
  Sun,
  Moon,
  MapPin,
  Music,
  Radio,
  Sliders,
  Phone,
  Camera,
  Info,
  Clock,
  Settings,
  Compass,
  Bluetooth,
  Wifi,
  Battery,
  ShieldCheck,
  Grid,
  BarChart3,
  FileText,
  Lock,
  Unlock,
  Key,
  Gauge,
  Zap,
  Disc,
  PhoneCall,
  Search,
  X,
  ChevronRight,
  Tv,
  Users,
  Sparkles,
  User,
  Power,
  MessageSquare,
  Gamepad2,
  Briefcase,
  Plane,
  Activity,
  CloudSun,
  Wind,
  Droplets,
  Globe,
  SlidersHorizontal,
  LogOut,
  UserCheck,
  QrCode,
} from 'lucide-react';

interface InfotainmentMainMenuProps {
  onNavigateTab?: (tabKey: string) => void;
}

export const InfotainmentMainMenu: React.FC<InfotainmentMainMenuProps> = ({ onNavigateTab }) => {
  const {
    t,
    activeHub,
    setActiveHub,
    showToast,
    telemetry,
    user,
    logoutUser,
    setShowAuthModal,
    setMasterPassphrase,
    authRequired,
  } = useApp();

  // Screen View Mode: 'home' | 'connect' | 'media' | 'arcade' | 'office' | 'telemetry'
  const [screenView, setScreenView] = useState<'home' | 'connect' | 'media' | 'arcade' | 'office' | 'telemetry'>(
    () => activeHub || 'home'
  );

  // Audio & Display States
  const [volume, setVolume] = useState(14);
  const [isMuted, setIsMuted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Live Updating Digital Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Modal Overlays State: 'NONE' | 'WEATHER' | 'TELEMETRY' | 'ACCOUNT' | 'CLOCK'
  const [activeOverlay, setActiveOverlay] = useState<'NONE' | 'WEATHER' | 'TELEMETRY' | 'ACCOUNT' | 'CLOCK'>('NONE');

  // Account Settings state
  const [accUsername, setAccUsername] = useState(user?.username || 'Operator-01');
  const [accPass, setAccPass] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live Weather State
  const [weatherSearchInput, setWeatherSearchInput] = useState('');
  const [weatherStationData, setWeatherStationData] = useState({
    airportName: 'John F. Kennedy Intl Airport (New York)',
    icao: 'KJFK',
    tempC: 22,
    tempF: 72,
    condition: 'Partly Cloudy',
    humidity: 58,
    windSpeedKts: 14,
    windDirection: '240° SW',
    aqi: 28,
    aqiStatus: 'Good / Clean Air',
    metar: 'KJFK 101100Z 24014KT 10SM FEW250 22/14 A3012 RMK AO2 SLP201',
    taf: 'TAF KJFK 101130Z 1012/1112 24014KT P6SM SKC FM101800 25018G24KT P6SM BKN200',
  });

  const loadWeatherForStation = async (icaoCode: string) => {
    try {
      showToast('Weather Station', `Fetching NOAA METAR & live weather for ${icaoCode}...`, 'info');
      const liveData = await fetchAccurateWeather(icaoCode);
      setWeatherStationData(liveData);
      showToast('Live Weather Updated', `Loaded live weather for ${liveData.airportName}`, 'success');
    } catch {
      showToast('Weather Error', 'Failed to retrieve live weather METAR', 'error');
    }
  };

  const generateAccountQR = async () => {
    try {
      if (!user) {
        showToast(t.authRequired, t.pleaseSignIn, 'warning');
        return;
      }

      const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, '');
      const username = sanitize(user.username || 'Guest');
      const vaultId = sanitize(user.id || '');
      const payload = `BRIO-ACCOUNT|${username}|${vaultId}|MyPlanePics`;

      if (!payload || payload.trim().length === 0) {
        showToast(t.qrError, 'No data available for QR code', 'error');
        return;
      }

      try {
        const url = await QRCode.toDataURL(payload, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'L',
          type: 'image/png',
        });

        if (!url || url.trim().length === 0 || url === 'data:image/png;base64,') {
          throw new Error('QR generation returned empty data');
        }

        setQrDataUrl(url);
        showToast('Success', 'Account QR code ready for scanning', 'success');
      } catch (qrErr: any) {
        console.error('QR generation failed:', qrErr);
        showToast('QR Error', `QR generation failed: ${qrErr.message || 'No usable data'}`, 'error');
      }
    } catch (err: any) {
      console.error('QR setup error:', err);
      showToast('QR Error', err.message || 'Failed to generate QR code. Please try again.', 'error');
    }
  };

  useEffect(() => {
    loadWeatherForStation('KJFK');
  }, []);

  // Sync with global activeHub if changed externally
  useEffect(() => {
    if (activeHub && activeHub !== screenView) {
      setScreenView(activeHub as any);
    }
  }, [activeHub]);

  // Enforce auth requirement
  useEffect(() => {
    if (authRequired && !user) {
      setShowAuthModal(true);
    }
  }, [authRequired, user, setShowAuthModal]);

  // Navigate view helper
  const switchScreenView = useCallback(
    (view: 'home' | 'connect' | 'media' | 'arcade' | 'office' | 'telemetry') => {
      try {
        setScreenView(view);
        if (view !== 'home' && view !== activeHub) {
          setActiveHub(view as any);
        }
        if (onNavigateTab) {
          onNavigateTab(view);
        }
      } catch {
        showToast('Navigation Error', 'Failed to switch infotainment screen view', 'error');
      }
    },
    [activeHub, setActiveHub, onNavigateTab, showToast]
  );

  // Audio tone feedback synthesizer (Web Audio API)
  const playAudioTone = (freq = 440, duration = 0.12) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio synthesis fallback
    }
  };

  const handleVolUp = () => {
    playAudioTone(523.25, 0.1);
    setVolume((v) => Math.min(30, v + 1));
    setIsMuted(false);
  };

  const handleVolDown = () => {
    playAudioTone(392.0, 0.1);
    setVolume((v) => Math.max(0, v - 1));
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-auto p-2 sm:p-4 font-sans select-none box-border">
      {/* Outer Tactile Physical Bezel Frame */}
      <div className="bg-gradient-to-b from-[#1c1d22] via-[#121316] to-[#08090a] rounded-[36px] p-4 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.15)] border-4 border-[#2d2f36] relative flex flex-col md:flex-row gap-4 items-stretch min-h-[640px]">
        
        {/* LEFT BEZEL PHYSICAL HARDWARE BUTTONS */}
        <div className="flex md:flex-col items-center justify-between gap-3 p-3 bg-[#0d0e11] rounded-2xl border border-white/10 shadow-inner md:w-20 shrink-0">
          {/* POWER BUTTON */}
          <button
            onClick={() => {
              playAudioTone(300, 0.15);
              switchScreenView('home');
              setActiveOverlay('NONE');
              showToast('System Reboot', 'Brio Infotainment set to Touch Home', 'info');
            }}
            className="group flex flex-col items-center gap-1 text-zinc-400 hover:text-amber-400 transition-all cursor-pointer"
            title="System Power / Home Reset"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-white/10 group-hover:border-amber-400/60 flex items-center justify-center shadow-md active:scale-95 transition-all">
              <Power className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[9px] font-bold font-mono uppercase tracking-tighter">POWER</span>
          </button>

          {/* HOME BUTTON (Guaranteed to return home) */}
          <button
            onClick={() => {
              playAudioTone(440, 0.1);
              switchScreenView('home');
              setActiveOverlay('NONE');
              showToast('Home Navigation', 'Returned to Home Menu', 'info');
            }}
            className={`group flex flex-col items-center gap-1 transition-all cursor-pointer ${
              screenView === 'home' && activeOverlay === 'NONE' ? 'text-[#FF5F1F]' : 'text-zinc-400 hover:text-white'
            }`}
            title="Return to Home Menu"
          >
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-900 border flex items-center justify-center shadow-md active:scale-95 transition-all ${
                screenView === 'home' && activeOverlay === 'NONE'
                  ? 'border-[#FF5F1F] bg-[#FF5F1F]/20 text-[#FF5F1F]'
                  : 'border-white/10 group-hover:border-white/40'
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold font-mono uppercase tracking-tighter">HOME</span>
          </button>

          {/* WEATHER BUTTON */}
          <button
            onClick={() => {
              playAudioTone(500, 0.1);
              setActiveOverlay('WEATHER');
            }}
            className={`group flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeOverlay === 'WEATHER' ? 'text-sky-400' : 'text-zinc-400 hover:text-sky-400'
            }`}
            title="Live Weather METAR Station"
          >
            <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-white/10 group-hover:border-sky-400 flex items-center justify-center shadow-md">
              <CloudSun className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-[9px] font-bold font-mono uppercase tracking-tighter">WEATHER</span>
          </button>

          {/* ACCOUNT SETTINGS BUTTON */}
          <button
            onClick={() => {
              playAudioTone(600, 0.1);
              setActiveOverlay('ACCOUNT');
            }}
            className={`group flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeOverlay === 'ACCOUNT' ? 'text-emerald-400' : 'text-zinc-400 hover:text-emerald-400'
            }`}
            title="Account Settings"
          >
            <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-white/10 group-hover:border-emerald-400 flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[9px] font-bold font-mono uppercase tracking-tighter">ACCOUNT</span>
          </button>

          {/* DISPLAY / NIGHT MODE */}
          <button
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              showToast('Display Mode', !isDarkMode ? 'Night Mode Activated' : 'Day Mode Activated', 'info');
            }}
            className="group flex flex-col items-center gap-1 text-zinc-400 hover:text-amber-400 transition-all cursor-pointer"
            title="Toggle Day / Night Mode"
          >
            <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-white/10 group-hover:border-amber-400 flex items-center justify-center shadow-md">
              {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </div>
            <span className="text-[9px] font-bold font-mono uppercase tracking-tighter">THEME</span>
          </button>
        </div>

        {/* MAIN TOUCH SCREEN CONTAINER */}
        <div className="flex-1 rounded-3xl overflow-hidden border-2 border-zinc-800 flex flex-col relative transition-all duration-500 shadow-2xl min-h-[580px] bg-[#0a0a0c]">
          
          {/* Background Wallpaper */}
          {isDarkMode ? (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-slate-950 to-black pointer-events-none">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332] via-[#0f172a] to-[#020617] pointer-events-none" />
          )}

          {/* SINGLE ONLY IFE HEADER IN THE ENTIRE APPLICATION */}
          <header className="relative z-20 bg-black/85 backdrop-blur-md border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-white font-mono text-xs shadow-md">
            {/* Left Live Weather Status */}
            <button
              onClick={() => setActiveOverlay('WEATHER')}
              className="flex items-center gap-2 bg-sky-950/80 hover:bg-sky-900 border border-sky-400/40 px-3 py-1.5 rounded-xl shadow transition-all cursor-pointer"
              title="Open Live NOAA Weather"
            >
              <CloudSun className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-sky-200">
                {weatherStationData.icao}: {weatherStationData.tempC}°C ({weatherStationData.tempF}°F) • {weatherStationData.condition}
              </span>
            </button>

            {/* Center Home Navigation Button */}
            <div className="flex items-center gap-2">
              {screenView !== 'home' ? (
                <button
                  onClick={() => switchScreenView('home')}
                  className="flex items-center gap-2 bg-[#FF5F1F] hover:bg-[#FF5F1F]/90 text-black px-4 py-1.5 rounded-xl font-extrabold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>← Touch Home</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-zinc-900/90 px-4 py-1.5 rounded-xl border border-white/20 shadow-inner">
                  <Grid className="w-4 h-4 text-[#FF5F1F]" />
                  <span className="text-xs font-mono font-extrabold text-white uppercase tracking-wider">
                    Touch Home Menu
                  </span>
                </div>
              )}
            </div>

            {/* Working Clock Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  playAudioTone(700, 0.1);
                  setActiveOverlay('CLOCK');
                }}
                className="text-sm font-black text-[#FF5F1F] font-mono tracking-widest bg-zinc-950 px-3 py-1.5 rounded-xl border border-[#FF5F1F]/40 hover:border-[#FF5F1F] active:scale-95 shadow-inner flex items-center gap-2 transition-all cursor-pointer"
                title="Open Clock, Analog View, Stopwatch, Timer & Calendar"
              >
                <Clock className="w-4 h-4 text-[#FF5F1F] animate-pulse" />
                <span>{currentTime || '12:00:00 AM'}</span>
              </button>
            </div>
          </header>

          {/* SCREEN DISPLAY VIEWPORT */}
          <div className="relative z-10 flex-1 p-4 sm:p-6 overflow-y-auto max-h-[72vh] box-border">
            
            {/* VIEW 1: SPACIOUS & CLEAN BENTO HOME MENU */}
            {screenView === 'home' && (
              <div className="space-y-6">
                <div className="text-center sm:text-left space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
                    <Sparkles className="w-6 h-6 text-[#FF5F1F]" />
                    <span>{t.welcomeToBrio || 'Welcome to Brio'}</span>
                  </h1>
                </div>

                {/* SPACIOUS BENTO GRID LAYOUT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  
                  {/* BENTO HUB 1: CONNECT & MESH SOCIAL */}
                  <div
                    onClick={() => switchScreenView('connect')}
                    className="group bg-gradient-to-br from-[#12141a] via-[#161922] to-[#0d0e12] border-2 border-cyan-500/30 hover:border-cyan-400 rounded-3xl p-6 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-56 relative overflow-hidden group hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
                    
                    <div className="flex items-center justify-between z-10">
                      <div className="p-3.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                        <MessageSquare className="w-7 h-7 text-cyan-400" />
                      </div>
                      <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/40">
                        P2P Mesh + Dialer
                      </span>
                    </div>

                    <div className="z-10 space-y-1">
                      <h2 className="text-xl font-black text-white group-hover:text-cyan-200 transition-colors">
                        Connect & Mesh Social
                      </h2>
                      <p className="text-xs text-zinc-400 font-mono">
                        Encrypted P2P Chat, Algorithmic Social Feed & Phone Dialer
                      </p>
                    </div>

                    <div className="z-10 text-xs font-mono text-cyan-400 font-bold flex items-center justify-between pt-3 border-t border-white/10">
                      <span>Integrated Dialer</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">Launch Hub →</span>
                    </div>
                  </div>

                  {/* BENTO HUB 2: MEDIA & NIGHTCORE STREAMS */}
                  <div
                    onClick={() => switchScreenView('media')}
                    className="group bg-gradient-to-br from-[#18111e] via-[#20152b] to-[#110b18] border-2 border-pink-500/30 hover:border-pink-400 rounded-3xl p-6 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-56 relative overflow-hidden group hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-pink-500/20 transition-all" />
                    
                    <div className="flex items-center justify-between z-10">
                      <div className="p-3.5 rounded-2xl bg-pink-500/20 border border-pink-400/40 text-pink-300">
                        <Music className="w-7 h-7 text-pink-400" />
                      </div>
                      <span className="text-xs font-mono text-pink-300 font-bold bg-pink-950/80 px-3 py-1 rounded-full border border-pink-500/40">
                        IPTV + Nightcore
                      </span>
                    </div>

                    <div className="z-10 space-y-1">
                      <h2 className="text-xl font-black text-white group-hover:text-pink-200 transition-colors">
                        Media & Streams
                      </h2>
                      <p className="text-xs text-zinc-400 font-mono">
                        Nightcore Pitch Audio Equalizer, IPTV Live Streams & RSS Reader
                      </p>
                    </div>

                    <div className="z-10 text-xs font-mono text-pink-400 font-bold flex items-center justify-between pt-3 border-t border-white/10">
                      <span>Live Pitch Synthesizer</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">Launch Hub →</span>
                    </div>
                  </div>

                  {/* BENTO HUB 3: ARCADE RETRO GAMES */}
                  <div
                    onClick={() => switchScreenView('arcade')}
                    className="group bg-gradient-to-br from-[#1f160e] via-[#2a1d12] to-[#140e08] border-2 border-amber-500/30 hover:border-amber-400 rounded-3xl p-6 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-56 relative overflow-hidden group hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
                    
                    <div className="flex items-center justify-between z-10">
                      <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                        <Gamepad2 className="w-7 h-7 text-amber-400" />
                      </div>
                      <span className="text-xs font-mono text-amber-300 font-bold bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40">
                        Arcade Engine
                      </span>
                    </div>

                    <div className="z-10 space-y-1">
                      <h2 className="text-xl font-black text-white group-hover:text-amber-200 transition-colors">
                        Arcade & Games
                      </h2>
                      <p className="text-xs text-zinc-400 font-mono">
                        Snake, Memory Matrix, Cyber Defense & Retro Mini Games
                      </p>
                    </div>

                    <div className="z-10 text-xs font-mono text-amber-400 font-bold flex items-center justify-between pt-3 border-t border-white/10">
                      <span>HighScore Vault</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">Launch Hub →</span>
                    </div>
                  </div>

                  {/* BENTO HUB 4: PRODUCTIVITY OFFICE SUITE */}
                  <div
                    onClick={() => switchScreenView('office')}
                    className="group bg-gradient-to-br from-[#131b18] via-[#182622] to-[#0d1412] border-2 border-emerald-500/30 hover:border-emerald-400 rounded-3xl p-6 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-56 relative overflow-hidden group hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                    
                    <div className="flex items-center justify-between z-10">
                      <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                        <Briefcase className="w-7 h-7 text-emerald-400" />
                      </div>
                      <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                        Encrypted Workspace
                      </span>
                    </div>

                    <div className="z-10 space-y-1">
                      <h2 className="text-xl font-black text-white group-hover:text-emerald-200 transition-colors">
                        Productivity & Office
                      </h2>
                      <p className="text-xs text-zinc-400 font-mono">
                        Markdown Encrypted Notes, Task Manager & Unit Converter
                      </p>
                    </div>

                    <div className="z-10 text-xs font-mono text-emerald-400 font-bold flex items-center justify-between pt-3 border-t border-white/10">
                      <span>AES-GCM Secure</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">Launch Hub →</span>
                    </div>
                  </div>

                  {/* BENTO HUB 5: AVIATION TELEMETRY & MYPLANEPICS */}
                  <div
                    onClick={() => switchScreenView('telemetry')}
                    className="group bg-gradient-to-br from-[#21130d] via-[#2c1a11] to-[#150c08] border-2 border-[#FF5F1F]/40 hover:border-[#FF5F1F] rounded-3xl p-6 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-56 relative overflow-hidden group hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5F1F]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#FF5F1F]/20 transition-all" />
                    
                    <div className="flex items-center justify-between z-10">
                      <div className="p-3.5 rounded-2xl bg-[#FF5F1F]/20 border border-[#FF5F1F]/40 text-[#FF5F1F]">
                        <Plane className="w-7 h-7 text-[#FF5F1F]" />
                      </div>
                      <span className="text-xs font-mono text-[#FF5F1F] font-bold bg-orange-950/80 px-3 py-1 rounded-full border border-[#FF5F1F]/40">
                        MyPlanePics + Telemetry
                      </span>
                    </div>

                    <div className="z-10 space-y-1">
                      <h2 className="text-xl font-black text-white group-hover:text-orange-200 transition-colors">
                        Aviation & Telemetry
                      </h2>
                      <p className="text-xs text-zinc-400 font-mono">
                        MyPlanePics Spotter Album (Airline & Aircraft Ranks) & Telemetry
                      </p>
                    </div>

                    <div className="z-10 text-xs font-mono text-[#FF5F1F] font-bold flex items-center justify-between pt-3 border-t border-white/10">
                      <span>Ranking System</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">Launch Hub →</span>
                    </div>
                  </div>

                  {/* BENTO HUB 6: ACCOUNT SETTINGS & SYSTEM LOCALE */}
                  <div
                    onClick={() => setActiveOverlay('ACCOUNT')}
                    className="group bg-gradient-to-br from-[#12181f] via-[#17202b] to-[#0c1016] border-2 border-indigo-500/30 hover:border-indigo-400 rounded-3xl p-6 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-56 relative overflow-hidden group hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
                    
                    <div className="flex items-center justify-between z-10">
                      <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
                        <User className="w-7 h-7 text-indigo-400" />
                      </div>
                      <span className="text-xs font-mono text-indigo-300 font-bold bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-500/40">
                        Profile & Security
                      </span>
                    </div>

                    <div className="z-10 space-y-1">
                      <h2 className="text-xl font-black text-white group-hover:text-indigo-200 transition-colors">
                        Account Settings
                      </h2>
                      <p className="text-xs text-zinc-400 font-mono">
                        Logged as {user?.username || 'Guest Operator'}. Manage Security & Encryption
                      </p>
                    </div>

                    <div className="z-10 text-xs font-mono text-indigo-400 font-bold flex items-center justify-between pt-3 border-t border-white/10">
                      <span>Account Controls</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">Manage →</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SCREEN VIEW HUBS */}
            {screenView === 'connect' && <ConnectSocialHub />}
            {screenView === 'media' && <MediaStreamingHub />}
            {screenView === 'arcade' && <ArcadeGamesHub />}
            {screenView === 'office' && <ProductivityOfficeHub />}
            {screenView === 'telemetry' && <AviationTelemetryHub />}
          </div>
        </div>
      </div>

      {/* OVERLAY MODALS */}
      {/* 1. WEATHER OVERLAY */}
      {activeOverlay === 'WEATHER' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sky-400">
                <CloudSun className="w-6 h-6" />
                <h2 className="text-xl font-bold">Aviation Weather & METAR Station</h2>
              </div>
              <button
                onClick={() => setActiveOverlay('NONE')}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Airport station selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['KJFK', 'EGLL', 'RJTT', 'OMDB', 'LFPB'].map((icao) => (
                <button
                  key={icao}
                  onClick={() => loadWeatherForStation(icao)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                    weatherStationData.icao === icao
                      ? 'bg-sky-500 text-black font-extrabold shadow-lg'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {icao}
                </button>
              ))}
            </div>

            {/* Weather Details Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{weatherStationData.airportName}</h3>
                  <p className="text-xs text-sky-400 font-mono">ICAO Code: {weatherStationData.icao}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-sky-300">{weatherStationData.tempC}°C</span>
                  <p className="text-xs text-slate-400">{weatherStationData.tempF}°F</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Condition</span>
                  <span className="font-bold text-white">{weatherStationData.condition}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Humidity</span>
                  <span className="font-bold text-white">{weatherStationData.humidity}%</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Wind Speed</span>
                  <span className="font-bold text-white">{weatherStationData.windSpeedKts} kts ({weatherStationData.windDirection})</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Air Quality</span>
                  <span className="font-bold text-emerald-400">AQI {weatherStationData.aqi}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <p className="text-xs font-mono text-slate-400"><strong className="text-sky-300">METAR:</strong> {weatherStationData.metar}</p>
                <p className="text-xs font-mono text-slate-400"><strong className="text-sky-300">TAF:</strong> {weatherStationData.taf}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACCOUNT SETTINGS OVERLAY */}
      {activeOverlay === 'ACCOUNT' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-5">
               <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                 <div className="flex items-center gap-2 text-emerald-400">
                   <UserCheck className="w-6 h-6" />
                   <h2 className="text-lg font-bold">{t.accountSecuritySettings}</h2>
                 </div>
              <button
                onClick={() => setActiveOverlay('NONE')}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

             <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-600 flex items-center justify-center font-bold text-xl text-white">
                   {(user?.username || 'O').charAt(0).toUpperCase()}
                 </div>
                 <div>
                   <p className="font-bold text-white text-base">{user?.username || t.operatorGuest}</p>
                   <p className="text-xs text-slate-400">{user?.email || 'operator@brio.vault'}</p>
                   <span className="text-[10px] text-emerald-400 font-mono">{t.brioCryptographicAccountActive}</span>
                 </div>
               </div>
             </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setActiveOverlay('NONE');
                    setShowAuthModal(true);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>{t.manageVaultPassphrase}</span>
                </button>

                {user && (
                  <>
                    <button
                      onClick={generateAccountQR}
                      className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{t.accountQRCode}</span>
                    </button>

                    {qrDataUrl && (
                      <div className="p-4 bg-white rounded-2xl flex flex-col items-center gap-3">
                        <img src={qrDataUrl} alt="Account QR Code" className="w-40 h-40" />
                        <p className="text-[10px] text-zinc-500 font-mono text-center">
                           {t.scanToOpenBrioProfile}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        logoutUser();
                        setActiveOverlay('NONE');
                      }}
                      className="w-full py-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.signOut}</span>
                    </button>
                  </>
                )}
              </div>
           </div>
         </div>
       )}

      {/* CLOCK & CALENDAR SUITE OVERLAY */}
      {activeOverlay === 'CLOCK' && (
        <ClockSuiteModal onClose={() => setActiveOverlay('NONE')} />
      )}
    </div>
  );
};
