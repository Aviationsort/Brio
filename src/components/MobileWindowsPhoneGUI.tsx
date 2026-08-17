import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { encryptionService } from '../utils/crypto';
import {
  Phone,
  MessageSquare,
  Globe,
  Gamepad2,
  Plane,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Search,
  Grid,
  ShieldCheck,
  Users,
  Settings,
  Calculator,
  Camera,
  FileText,
  Bus,
  Radio,
  Sparkles,
  X,
  Lock,
  Wifi,
  BatteryCharging,
  Zap,
  Music,
  Tv,
  Briefcase,
  User,
  UserCheck,
  Key,
  Award,
  Layers,
  LogOut,
  Sliders,
  CheckCircle2,
  Activity,
  BarChart3,
  Languages,
  Mic,
  MapPin,
  Home,
  Menu,
  RotateCcw,
  QrCode,
  Image as ImageIcon,
  Cloud,
  Sun,
  CloudRain,
  CloudSun,
  Clock,
  Keyboard,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Newspaper,
  ArrowLeft,
  ArrowRight,
  Wind,
  Droplets,
  Thermometer,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
} from 'lucide-react';
import QRCode from 'qrcode';
import { fetchAccurateWeather } from '../utils/weatherService';
import { ConnectSocialHub } from './Hub1_ConnectSocial/ConnectSocialHub';
import { MediaStreamingHub } from './Hub2_MediaStreaming/MediaStreamingHub';
import { ArcadeGamesHub } from './Hub3_ArcadeGames/ArcadeGamesHub';
import { ProductivityOfficeHub } from './Hub4_ProductivityOffice/ProductivityOfficeHub';
import { AviationTelemetryHub } from './Hub5_AviationTelemetry/AviationTelemetryHub';
import { ClockSuiteModal } from './ClockSuiteModal';
import { ProfilePage } from './ProfilePage';

interface MobileWindowsPhoneGUIProps {
  onNavigateTab: (tabKey: string) => void;
  onCloseMobileView?: () => void;
}

export const MobileWindowsPhoneGUI: React.FC<MobileWindowsPhoneGUIProps> = ({
  onNavigateTab,
  onCloseMobileView,
}) => {
  const {
    t,
    showToast,
    language,
    user,
    logoutUser,
    setShowAuthModal,
    setShowLanguagePicker,
    setMasterPassphrase,
    authRequired,
    myPlanePics,
    notes,
    saveNote,
    currentTrack,
    setCurrentTrack,
    isPlayingMusic,
    setIsPlayingMusic,
    iptvChannels,
    nightcorePitch,
    setNightcorePitch,
    socialPosts,
  } = useApp();

  // Screen States: 'HOME' | 'APP_DRAWER' | 'SEARCH' | 'ACCOUNT_OVERLAY' | 'QR_ACCOUNT' | 'FEATURE'
  const [screenMode, setScreenMode] = useState<'HOME' | 'APP_DRAWER' | 'SEARCH' | 'ACCOUNT_OVERLAY' | 'QR_ACCOUNT' | 'FEATURE' | 'connect' | 'media' | 'arcade' | 'office' | 'telemetry' | 'profile'>('HOME');
  const [activeOverlay, setActiveOverlay] = useState<'NONE' | 'WEATHER' | 'CLOCK'>('NONE');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('2:55 PM');
  const [currentFeature, setCurrentFeature] = useState<string>('');

  // QR Code state
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const qrCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Account passphrase state
  const [passphraseInput, setPassphraseInput] = useState('');
  const [vaultStatus, setVaultStatus] = useState<string>('Vault Active • AES-256');

  // MyPlanePics paging state
  const [planePicsPage, setPlanePicsPage] = useState(0);
  const [planePicsPerPage, setPlanePicsPerPage] = useState(12);

  // Weather widget state
  const [weatherIcao, setWeatherIcao] = useState('KJFK');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Live Weather State
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

  useEffect(() => {
    loadWeatherForStation('KJFK');
  }, []);

  // Quick dialer state
  const [dialNumber, setDialNumber] = useState('');
  const [callActive, setCallActive] = useState(false);

  // Notes preview state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteBody, setNewNoteBody] = useState('');

  // Responsive paging calculation
  useEffect(() => {
    const calculatePerPage = () => {
      const width = window.innerWidth;
      if (width < 350) return 6;
      if (width < 400) return 9;
      return 12;
    };
    setPlanePicsPerPage(Math.min(calculatePerPage(), 50));
    const handleResize = () => setPlanePicsPerPage(Math.min(calculatePerPage(), 50));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Live Clock Update
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Audio touch tone feedback with error catching
  const playTouchSound = (freq = 520) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      // Ignore web audio policies
    }
  };

  const handleAppClick = (tabKey: string, actionName: string) => {
    try {
      playTouchSound(580);
      if (tabKey === 'account') {
        setScreenMode('ACCOUNT_OVERLAY');
        return;
      }
      if (['connect', 'media', 'arcade', 'office', 'telemetry'].includes(tabKey)) {
        setScreenMode(tabKey as any);
        showToast(t.brioDroidMobile, `${t.launching} ${actionName}...`, 'info');
        return;
      }
      if (authRequired && !user) {
        setShowAuthModal(true);
        showToast(t.authRequired, t.pleaseSignIn, 'warning');
        return;
      }
      showToast(t.brioDroidMobile, `${t.launching} ${actionName}...`, 'info');
    } catch (err: any) {
      showToast(t.navigationError, err.message || 'Failed to navigate', 'error');
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
          width: 300,
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
        setScreenMode('QR_ACCOUNT');
        showToast('Success', 'Account QR code generated successfully', 'success');
      } catch (qrErr: any) {
        console.error('QR generation failed:', qrErr);
        showToast(t.qrError, `QR generation failed: ${qrErr.message || 'No usable data'}`, 'error');
      }
    } catch (err: any) {
      console.error('QR setup error:', err);
      showToast(t.qrError, err.message || 'Failed to generate QR code. Please try again.', 'error');
    }
  };

  const handleSetPassphrase = async () => {
    try {
      if (!passphraseInput.trim()) {
        showToast(t.vaultCheck, t.pleaseEnterValidPassphrase, 'warning');
        return;
      }
      const encryptedTest = await encryptionService.encrypt(`Vault check: ${Date.now()}`);
      if (encryptedTest) {
        setMasterPassphrase(passphraseInput);
        setVaultStatus('Custom Passphrase Active • Encrypted');
        showToast(t.vaultSecurityUpdated, 'Master passphrase successfully set and verified.', 'success');
        setPassphraseInput('');
      }
    } catch (err: any) {
      showToast('Encryption Error', err.message || 'Failed to set passphrase', 'error');
    }
  };

  const drawerApps = [
    { name: 'Connect & Mesh Social Hub', hub: 'connect', icon: MessageSquare, category: 'Connect' },
    { name: 'P2P Mesh Network', hub: 'connect', icon: Users, category: 'Connect' },
    { name: 'Encrypted Phone Dialer', hub: 'connect', icon: Phone, category: 'Connect' },
    { name: 'P2P Encrypted Messaging', hub: 'connect', icon: MessageSquare, category: 'Connect' },
    { name: 'Mesh Social Feed', hub: 'connect', icon: Users, category: 'Connect' },

    { name: 'Media & Streams Hub', hub: 'media', icon: Music, category: 'Media' },
    { name: 'IPTV Live TV Streams', hub: 'media', icon: Tv, category: 'Media' },
    { name: 'Nightcore Audio Player', hub: 'media', icon: Radio, category: 'Media' },
    { name: 'Audio Equalizer Synthesizer', hub: 'media', icon: Sliders, category: 'Media' },
    { name: 'RSS News Vault', hub: 'media', icon: Globe, category: 'Media' },

    { name: 'Arcade & Games Hub', hub: 'arcade', icon: Gamepad2, category: 'Arcade' },
    { name: 'Space Invaders Arcade', hub: 'arcade', icon: Gamepad2, category: 'Arcade' },
    { name: 'Retro Snake Game', hub: 'arcade', icon: Gamepad2, category: 'Arcade' },
    { name: 'Tetris Arcade', hub: 'arcade', icon: Layers, category: 'Arcade' },
    { name: 'Asteroids & Cyber Defense', hub: 'arcade', icon: ShieldCheck, category: 'Arcade' },

    { name: 'Productivity & Office Hub', hub: 'office', icon: Briefcase, category: 'Office' },
    { name: 'PDF Annotator & Editor', hub: 'office', icon: FileText, category: 'Office' },
    { name: 'Encrypted Markdown Notes', hub: 'office', icon: FileText, category: 'Office' },
    { name: 'Task Checklist Manager', hub: 'office', icon: CheckCircle2, category: 'Office' },
    { name: 'Graphic Calculator', hub: 'office', icon: Calculator, category: 'Office' },

    { name: 'Aviation & Telemetry Hub', hub: 'telemetry', icon: Plane, category: 'Telemetry' },
    { name: 'MyPlanePics 3D Vault', hub: 'telemetry', icon: Camera, category: 'Telemetry' },
    { name: 'Spotter Airline Rankings', hub: 'telemetry', icon: Award, category: 'Telemetry' },
    { name: 'System Telemetry Monitor', hub: 'telemetry', icon: Zap, category: 'Telemetry' },

    { name: 'Account Settings', hub: 'account', icon: Settings, category: 'Account' },
    { name: 'AES-256 Vault Security', hub: 'account', icon: ShieldCheck, category: 'Account' },
    { name: 'Language Selector', hub: 'account', icon: Languages, category: 'Account' },
  ];

  const filteredDrawerApps = drawerApps.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[660px] w-full p-2 sm:p-4 my-2">
      {/* MOTOROLA DROID / MILESTONE PHYSICAL HARDWARE CASING */}
      <div className="relative w-full max-w-[370px] bg-gradient-to-b from-zinc-900 via-black to-zinc-950 rounded-[36px] p-4 shadow-[0_30px_70px_rgba(0,0,0,0.95)] border-4 border-zinc-800 flex flex-col items-center select-none overflow-hidden ring-1 ring-white/10">
        
        {/* Glossy Hardware Bezel Reflection */}
        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

        {/* TOP HARDWARE BEZEL - MOTOROLA BRANDING & EAR PIECE */}
        <div className="w-full flex flex-col items-center justify-center pt-1 pb-2 z-10">
          <div className="w-14 h-1.5 bg-zinc-800 rounded-full border border-zinc-700 shadow-inner mb-1.5" />
          <div className="text-[11px] font-black italic tracking-[0.25em] text-zinc-300 uppercase font-sans">
            MOTOROLA
          </div>
        </div>

        {/* DIGITAL SCREEN DISPLAY VIEWPORT */}
        <div className="relative w-full h-[530px] bg-[#1a1c1e] rounded-xl border border-zinc-800 flex flex-col overflow-hidden text-white shadow-2xl">
          
          {/* ANDROID 2.x CLASSIC WHITE STATUS BAR */}
          <div className="w-full bg-white text-zinc-900 px-2.5 py-0.5 flex items-center justify-between text-[11px] font-bold font-sans z-30 shadow-sm border-b border-zinc-300">
            <div className="flex items-center gap-1 text-[10px]">
              <span className="font-extrabold text-zinc-800">BRIO 3G</span>
              <div className="flex items-center gap-0.5 ml-1">
                <SignalHigh className="w-3 h-3 text-emerald-600" />
                <span className="text-[9px] text-zinc-600 font-mono">4G</span>
              </div>
              <Wifi className="w-3 h-3 text-zinc-700 ml-1" />
            </div>
            <div className="flex items-center gap-1.5">
              {/* Battery Icon with Green Level */}
              <div className="flex items-center gap-0.5 bg-zinc-200 px-1 py-0.2 rounded border border-zinc-400 text-[9px]">
                <div className="w-3.5 h-2 bg-emerald-600 rounded-xs" />
                <span className="text-[8px] text-zinc-700 font-mono">85%</span>
              </div>
              <span className="font-bold text-zinc-900 text-[11px]">{currentTime}</span>
              <button
                onClick={() => setActiveOverlay('CLOCK')}
                className="liquid-glass-btn p-0.5 rounded hover:bg-zinc-300 ml-1"
                title="Clock Suite"
              >
                <Clock className="w-3 h-3 text-indigo-600" />
              </button>
            </div>
          </div>

          {/* MAIN SCREEN CANVAS - TEXTURED CONCRETE/STONE WALLPAPER */}
          <div 
            className="flex-1 relative flex flex-col justify-between overflow-y-auto z-10 scrollbar-none"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.85) 100%), linear-gradient(135deg, #2b2e33 0%, #17181c 50%, #0d0e11 100%)`,
              backgroundBlendMode: 'overlay',
            }}
          >
            {/* GOOGLE SEARCH WIDGET FLOATING NEAR TOP */}
            <div className="p-3 pt-3">
              <button
                onClick={() => {
                  playTouchSound(550);
                  setScreenMode('SEARCH');
                }}
                className="liquid-glass-btn w-full bg-white/95 hover:bg-white text-zinc-800 rounded-lg px-3 py-2 shadow-lg border border-white/40 flex items-center justify-between transition-transform active:scale-98 cursor-pointer group"
                title="Search Apps & Features"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-red-500 to-amber-500 bg-clip-text text-transparent">
                    Google
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">| Search</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-800">
                  <Search className="w-4 h-4" />
                  <Mic className="w-4 h-4 text-blue-500" />
                </div>
              </button>
            </div>

             {/* SCREEN CONTENT VIEW SWITCHER */}
             <div className="flex-1 p-3">
               
               {/* VIEW 1: BRIO DROID HOME SCREEN WITH LIVE FEATURE WIDGETS */}
               {screenMode === 'HOME' && (
                 <div className="space-y-3 pt-1">
                    {/* Weather Widget */}
                    <button
                      onClick={() => { setCurrentFeature('weather'); setScreenMode('FEATURE'); playTouchSound(580); }}
                      className="liquid-glass-btn w-full p-3 bg-gradient-to-r from-sky-500/20 to-blue-600/20 border border-sky-400/30 rounded-2xl text-left active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-mono text-sky-300 uppercase tracking-wider">{t.weatherWidget}</p>
                          <p className="text-lg font-black text-white font-mono">{weatherData ? `${weatherData.temp || '--'}°C` : '--°C'}</p>
                          <p className="text-[10px] text-sky-200">{weatherData?.name || weatherIcao}</p>
                        </div>
                        <div className="p-2 bg-sky-500/20 rounded-xl border border-sky-400/30">
                          <Cloud className="w-6 h-6 text-sky-300" />
                        </div>
                      </div>
                    </button>

                    {/* Quick Dialer Widget */}
                    <button
                      onClick={() => { setCurrentFeature('dialer'); setScreenMode('FEATURE'); playTouchSound(580); }}
                      className="liquid-glass-btn w-full p-3 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 border border-emerald-400/30 rounded-2xl text-left active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider">{t.quickDialer}</p>
                          <p className="text-sm font-bold text-white font-mono">{dialNumber || t.dialNumber}</p>
                        </div>
                        <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
                          <Phone className="w-6 h-6 text-emerald-300" />
                        </div>
                      </div>
                    </button>

                    {/* Notes Widget */}
                    <button
                      onClick={() => { setCurrentFeature('notes'); setScreenMode('FEATURE'); playTouchSound(580); }}
                      className="liquid-glass-btn w-full p-3 bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-400/30 rounded-2xl text-left active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-mono text-amber-300 uppercase tracking-wider">{t.recentNotes}</p>
                          <p className="text-sm font-bold text-white truncate max-w-[180px]">{notes.length > 0 ? notes[0].title : t.noValidMedia}</p>
                        </div>
                        <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-400/30">
                          <FileText className="w-6 h-6 text-amber-300" />
                        </div>
                      </div>
                    </button>

                    {/* Now Playing Widget */}
                    <button
                      onClick={() => { setCurrentFeature('music'); setScreenMode('FEATURE'); playTouchSound(580); }}
                      className="liquid-glass-btn w-full p-3 bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-400/30 rounded-2xl text-left active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-mono text-purple-300 uppercase tracking-wider">{t.nowPlaying}</p>
                          <p className="text-sm font-bold text-white truncate max-w-[180px]">{currentTrack ? currentTrack.title : t.noValidMedia}</p>
                        </div>
                        <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-400/30">
                          <Music className="w-6 h-6 text-purple-300" />
                        </div>
                      </div>
                    </button>

                    {/* Recent Photos Widget with Paging */}
                    <button
                      onClick={() => { setCurrentFeature('photos'); setScreenMode('FEATURE'); playTouchSound(580); }}
                      className="liquid-glass-btn w-full p-3 bg-gradient-to-r from-[#FF5F1F]/20 to-red-600/20 border border-[#FF5F1F]/30 rounded-2xl text-left active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-[10px] font-mono text-[#FF5F1F] uppercase tracking-wider">{t.recentPhotos}</p>
                          <p className="text-xs text-white">{myPlanePics.length} {t.media.toLowerCase()}</p>
                        </div>
                        <div className="p-2 bg-[#FF5F1F]/20 rounded-xl border border-[#FF5F1F]/30">
                          <Camera className="w-6 h-6 text-[#FF5F1F]" />
                        </div>
                      </div>
                      {myPlanePics.length > 0 ? (
                        <div className="grid grid-cols-4 gap-1">
                          {myPlanePics.slice(planePicsPage * planePicsPerPage, (planePicsPage + 1) * planePicsPerPage).slice(0, 8).map((photo) => (
                            <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-black border border-white/10">
                               {photo.mediaType === 'video' && photo.videoUrl ? (
                                 <video src={photo.videoUrl} className="liquid-glass-btn w-full h-full object-cover" muted />
                               ) : (
                                 <img src={photo.thumbnailUrl || photo.imageUrl} alt={photo.registration} className="w-full h-full object-cover" />
                               )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-400">{t.noPhotosYet}</p>
                      )}
                      {myPlanePics.length > planePicsPerPage && (
                        <div className="flex items-center justify-between mt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setPlanePicsPage(p => Math.max(0, p - 1)); }}
                            disabled={planePicsPage === 0}
                            className="liquid-glass-btn p-1 bg-black/50 rounded text-white disabled:opacity-30"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <span className="text-[9px] text-zinc-400 font-mono">{t.page} {planePicsPage + 1} {t.of} {Math.ceil(myPlanePics.length / planePicsPerPage)}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setPlanePicsPage(p => Math.min(Math.ceil(myPlanePics.length / planePicsPerPage) - 1, p + 1)); }}
                            disabled={planePicsPage >= Math.ceil(myPlanePics.length / planePicsPerPage) - 1}
                            className="liquid-glass-btn p-1 bg-black/50 rounded text-white disabled:opacity-30"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </button>

                    {/* News Ticker Widget */}
                    <button
                      onClick={() => { setCurrentFeature('news'); setScreenMode('FEATURE'); playTouchSound(580); }}
                      className="liquid-glass-btn w-full p-3 bg-gradient-to-r from-cyan-500/20 to-sky-600/20 border border-cyan-400/30 rounded-2xl text-left active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider">{t.newsTicker}</p>
                          <p className="text-xs text-white truncate">{socialPosts.length > 0 ? socialPosts[0].content : t.noArticlesFound}</p>
                        </div>
                        <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-400/30 shrink-0 ml-2">
                          <Newspaper className="w-6 h-6 text-cyan-300" />
                        </div>
                      </div>
                    </button>
                  </div>
                )}

              {/* VIEW 2: APP DRAWER OVERLAY */}
              {screenMode === 'APP_DRAWER' && (
                <div className="bg-zinc-950/95 border border-zinc-700/80 rounded-2xl p-3 shadow-2xl space-y-3 max-h-[380px] overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                      All Applications ({filteredDrawerApps.length})
                    </span>
                    <button
                      onClick={() => setScreenMode('HOME')}
                      className="liquid-glass-btn p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                      <X className="liquid-glass-btn w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {filteredDrawerApps.map((app, idx) => {
                      const Icon = app.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleAppClick(app.hub, app.name)}
                          className="liquid-glass-btn w-full p-2 rounded-xl bg-zinc-900 hover:bg-sky-600/30 border border-zinc-800 flex items-center justify-between transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">{app.name}</span>
                              <span className="text-[9px] text-zinc-400 font-mono">{app.category}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 3: SEARCH OVERLAY */}
              {screenMode === 'SEARCH' && (
                <div className="bg-zinc-950/95 border border-zinc-700 rounded-2xl p-3 shadow-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search apps..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400 font-mono"
                    />
                    <button
                      onClick={() => setScreenMode('HOME')}
                      className="liquid-glass-btn p-2 rounded-xl bg-zinc-800 text-zinc-400"
                    >
                      <X className="liquid-glass-btn w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {filteredDrawerApps.map((app, idx) => {
                      const Icon = app.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleAppClick(app.hub, app.name)}
                          className="liquid-glass-btn w-full p-2 rounded-xl bg-zinc-900 hover:bg-sky-600/30 border border-zinc-800 flex items-center justify-between text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-sky-400 shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-white block">{app.name}</span>
                              <span className="text-[9px] text-zinc-400 font-mono">{app.category}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 4: ACCOUNT OVERLAY */}
              {screenMode === 'ACCOUNT_OVERLAY' && (
                <div className="bg-zinc-950/95 border border-zinc-700 rounded-2xl p-3 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-xs font-bold text-white">{t.accountVaultSettings}</span>
                    <button
                      onClick={() => setScreenMode('HOME')}
                      className="liquid-glass-btn p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                      <X className="liquid-glass-btn w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {user ? user.username.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{user ? user.username : t.operatorGuest}</h4>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          {user ? t.authenticatedSession : t.localEncryptionMode}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      {!user ? (
                        <button
                          onClick={() => {
                            setShowAuthModal(true);
                            showToast('Auth Modal', 'Opening login modal', 'info');
                          }}
                          className="liquid-glass-btn flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg text-center"
                        >
                          {t.loginSignUp}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            logoutUser();
                            showToast(t.loggedOut, t.userSessionTerminated, 'info');
                          }}
                          className="liquid-glass-btn flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg text-center flex items-center justify-center gap-1"
                        >
                          <LogOut className="w-3 h-3" /> {t.signOut}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* QR Code Button */}
                  {user && (
                    <button
                      onClick={generateAccountQR}
                      className="liquid-glass-btn w-full p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5"
                    >
                      <div className="p-2 bg-[#FF5F1F]/20 rounded-lg border border-[#FF5F1F]/30">
                        <QrCode className="w-5 h-5 text-[#FF5F1F]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{t.accountQRCode}</span>
                         <span className="text-[9px] text-zinc-400 font-mono">{t.scanToOpenBrioProfile}</span>
                      </div>
                    </button>
                  )}

                  {/* Encryption Security Key Input */}
                  <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t.aes256VaultKey}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono">{vaultStatus}</p>
                    <input
                      type="password"
                      placeholder={t.masterPassphrase}
                      value={passphraseInput}
                      onChange={(e) => setPassphraseInput(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 font-mono"
                    />
                    <button
                      onClick={handleSetPassphrase}
                      className="liquid-glass-btn w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs rounded-lg cursor-pointer"
                    >
                      {t.verifySetKey}
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 5: QR ACCOUNT INFO */}
              {screenMode === 'QR_ACCOUNT' && (
                <div className="bg-zinc-950/95 border border-zinc-700 rounded-2xl p-3 shadow-2xl space-y-3 max-h-[460px] overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-xs font-bold text-white">{t.accountInfoMyPlanePics}</span>
                    <button
                      onClick={() => setScreenMode('ACCOUNT_OVERLAY')}
                      className="liquid-glass-btn p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                      <X className="liquid-glass-btn w-4 h-4" />
                    </button>
                  </div>

                   <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                         {user ? user.username.charAt(0).toUpperCase() : '?'}
                       </div>
                       <div>
                         <h4 className="text-sm font-bold text-white">{user ? user.username : 'Guest'}</h4>
                         <p className="text-[10px] text-zinc-400 font-mono">{user ? user.email : 'operator@brio.vault'}</p>
                         <span className="text-[9px] text-emerald-400 font-mono">{t.brioDroidAccountActive}</span>
                       </div>
                     </div>

                     <div className="p-4 bg-white rounded-xl flex items-center justify-center">
                       {qrDataUrl ? (
                         <img src={qrDataUrl} alt="Account QR Code" className="w-48 h-48" />
                       ) : (
                         <div className="text-zinc-400 text-xs font-mono">{t.qrCodeWillAppearHere}</div>
                       )}
                     </div>

                     <div className="text-[10px] text-zinc-400 font-mono text-center">
                       {t.scanToOpenBrioProfile}
                     </div>

                     <button
                       onClick={() => setScreenMode('profile')}
                       className="liquid-glass-btn w-full py-2 bg-[#FF5F1F] hover:bg-[#FF5F1F]/90 text-black font-bold text-xs rounded-lg flex items-center justify-center gap-2"
                     >
                       <User className="w-4 h-4" /> {t.viewFullProfile}
                     </button>
                   </div>

                  {myPlanePics.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">{t.myplanePicsAlbum} ({myPlanePics.length})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {myPlanePics.slice(0, 9).map((photo) => (
                          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-black border border-white/10">
                            {photo.mediaType === 'video' && photo.videoUrl ? (
                              <video src={photo.videoUrl} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={photo.thumbnailUrl || photo.imageUrl} alt={photo.registration} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-[8px] font-mono text-white text-center truncate">
                              {photo.registration}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                   <button
                     onClick={() => setScreenMode('HOME')}
                     className="liquid-glass-btn w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-lg"
                   >
                     {t.backToHome}
                   </button>
                 </div>
               )}

               {/* VIEW 6: FEATURE SCREENS */}
               {screenMode === 'FEATURE' && (
                 <div className="bg-zinc-950/95 border border-zinc-700 rounded-2xl p-3 shadow-2xl space-y-3 max-h-[460px] overflow-y-auto">
                   <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                     <span className="text-xs font-bold text-white capitalize">{currentFeature}</span>
                     <button
                       onClick={() => setScreenMode('HOME')}
                       className="liquid-glass-btn p-1 rounded-lg bg-zinc-800 text-zinc-400"
                     >
                       <X className="liquid-glass-btn w-4 h-4" />
                     </button>
                   </div>

                   {/* Weather Feature */}
                   {currentFeature === 'weather' && (
                     <div className="space-y-3">
                       <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                         <div className="flex items-center gap-2">
                           <input
                             type="text"
                             value={weatherIcao}
                             onChange={(e) => setWeatherIcao(e.target.value.toUpperCase())}
                             placeholder="ICAO code..."
                             className="flex-1 bg-black border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono uppercase"
                           />
                           <button
                             onClick={async () => {
                               setWeatherLoading(true);
                               try {
                                 const res = await fetch(`/api/weather?ids=${weatherIcao || 'KJFK'}`);
                                 const data = await res.json();
                                 setWeatherData(data[0] || data);
                               } catch (e) {
                                 showToast(t.error, String(e), 'error');
                               } finally {
                                 setWeatherLoading(false);
                               }
                             }}
                             className="liquid-glass-btn px-3 py-1.5 bg-sky-600 text-white text-xs rounded-lg"
                           >
                             {t.refresh}
                           </button>
                         </div>
                         {weatherLoading && <p className="text-[10px] text-zinc-400">{t.loading}...</p>}
                         {weatherData && (
                           <div className="grid grid-cols-2 gap-2">
                             <div className="p-2 bg-black/50 rounded-lg">
                               <p className="text-[9px] text-zinc-500 uppercase">{t.temperature}</p>
                               <p className="text-sm font-bold text-white">{weatherData.temp}°C</p>
                             </div>
                             <div className="p-2 bg-black/50 rounded-lg">
                               <p className="text-[9px] text-zinc-500 uppercase">{t.windSpeedLabel}</p>
                               <p className="text-sm font-bold text-white">{weatherData.wspd} kts</p>
                             </div>
                             <div className="p-2 bg-black/50 rounded-lg">
                               <p className="text-[9px] text-zinc-500 uppercase">{t.humidityLabel}</p>
                               <p className="text-sm font-bold text-white">{weatherData.dewp}°C</p>
                             </div>
                             <div className="p-2 bg-black/50 rounded-lg">
                               <p className="text-[9px] text-zinc-500 uppercase">{t.condition}</p>
                               <p className="text-sm font-bold text-white">{weatherData.cover || 'N/A'}</p>
                             </div>
                           </div>
                         )}
                       </div>
                     </div>
                   )}

                   {/* Quick Dialer Feature */}
                   {currentFeature === 'dialer' && (
                     <div className="space-y-3">
                       <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                         <div className="text-center">
                           <p className="text-2xl font-mono font-bold text-white tracking-widest">{dialNumber || '—'}</p>
                         </div>
                         <div className="grid grid-cols-3 gap-2">
                           {['1','2','3','4','5','6','7','8','9','*','0','#'].map((key) => (
                             <button
                               key={key}
                               onClick={() => { setDialNumber(d => d + key); playTouchSound(700 + parseInt(key) * 50); }}
                               className="liquid-glass-btn p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-bold text-lg"
                             >
                               {key}
                             </button>
                           ))}
                         </div>
                         <div className="flex gap-2">
                           <button
                             onClick={() => setDialNumber(d => d.slice(0, -1))}
                             className="liquid-glass-btn flex-1 py-2 bg-zinc-800 text-white text-xs rounded-lg"
                           >
                             {t.clear}
                           </button>
                           <button
                             onClick={() => {
                               if (dialNumber) {
                                 setCallActive(true);
                                 showToast(t.phoneDialer, `Calling ${dialNumber}...`, 'info');
                                 setTimeout(() => setCallActive(false), 3000);
                               }
                             }}
                             className="liquid-glass-btn flex-1 py-2 bg-emerald-600 text-black font-bold text-xs rounded-lg"
                           >
                             {callActive ? t.endCall : t.dialCall}
                           </button>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Notes Feature */}
                   {currentFeature === 'notes' && (
                     <div className="space-y-3">
                       <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                         <input
                           type="text"
                           value={newNoteTitle}
                           onChange={(e) => setNewNoteTitle(e.target.value)}
                           placeholder="Note title..."
                           className="w-full bg-black border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                         />
                         <textarea
                           value={newNoteBody}
                           onChange={(e) => setNewNoteBody(e.target.value)}
                           placeholder="Note content..."
                           className="w-full bg-black border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white h-20 resize-none"
                         />
                          <button
                            onClick={async () => {
                              if (newNoteTitle.trim() && newNoteBody.trim()) {
                                await saveNote(newNoteTitle, newNoteBody, [], true);
                                setNewNoteTitle('');
                                setNewNoteBody('');
                                showToast(t.success, t.save, 'success');
                              }
                            }}
                            className="liquid-glass-btn w-full py-1.5 bg-amber-600 text-black font-bold text-xs rounded-lg"
                          >
                            {t.save}
                          </button>
                       </div>
                       <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                         {notes.slice(0, 5).map((note: any) => (
                           <div key={note.id} className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                             <p className="text-xs font-bold text-white">{note.title}</p>
                             <p className="text-[10px] text-zinc-400 line-clamp-2">{note.content}</p>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Music Feature */}
                   {currentFeature === 'music' && (
                     <div className="space-y-3">
                       <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                         <p className="text-sm font-bold text-white text-center truncate">{currentTrack?.title || t.noValidMedia}</p>
                         <div className="flex items-center justify-center gap-4">
                           <button
                             onClick={() => {
                               const idx = iptvChannels.findIndex((c: any) => c.id === currentTrack?.id);
                               const prev = iptvChannels[(idx - 1 + iptvChannels.length) % iptvChannels.length];
                               if (prev) setCurrentTrack(prev as any);
                             }}
                             className="liquid-glass-btn p-2 bg-zinc-800 rounded-full text-white"
                           >
                             <SkipBack className="w-5 h-5" />
                           </button>
                           <button
                             onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                             className="liquid-glass-btn p-3 bg-purple-600 rounded-full text-white"
                           >
                             {isPlayingMusic ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                           </button>
                           <button
                             onClick={() => {
                               const idx = iptvChannels.findIndex((c: any) => c.id === currentTrack?.id);
                               const next = iptvChannels[(idx + 1) % iptvChannels.length];
                               if (next) setCurrentTrack(next as any);
                             }}
                             className="liquid-glass-btn p-2 bg-zinc-800 rounded-full text-white"
                           >
                             <SkipForward className="w-5 h-5" />
                           </button>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] text-zinc-400">Pitch</span>
                           <input
                             type="range"
                             min="0.5"
                             max="2"
                             step="0.05"
                             value={nightcorePitch}
                             onChange={(e) => setNightcorePitch(parseFloat(e.target.value))}
                             className="flex-1"
                           />
                           <span className="text-[10px] text-zinc-400 font-mono w-8">{nightcorePitch.toFixed(2)}x</span>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Recent Photos Feature */}
                   {currentFeature === 'photos' && (
                     <div className="space-y-3">
                       <p className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                         {t.myplanePicsAlbum} ({myPlanePics.length})
                       </p>
                       {myPlanePics.length === 0 ? (
                         <div className="text-center py-8">
                           <Camera className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                           <p className="text-xs text-zinc-400">{t.noPhotosYet}</p>
                           <p className="text-[10px] text-zinc-500">{t.importPhotosToGetStarted}</p>
                         </div>
                       ) : (
                         <>
                           <div className="grid grid-cols-3 gap-2">
                             {myPlanePics.slice(planePicsPage * planePicsPerPage, (planePicsPage + 1) * planePicsPerPage).map((photo) => (
                               <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-black border border-white/10">
                                  {photo.mediaType === 'video' && photo.videoUrl ? (
                                    <video src={photo.videoUrl} className="w-full h-full object-cover" muted />
                                  ) : (
                                    <img src={photo.thumbnailUrl || photo.imageUrl} alt={photo.registration} className="w-full h-full object-cover" />
                                  )}
                                 <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-[8px] font-mono text-white text-center truncate">
                                   {photo.registration}
                                 </div>
                               </div>
                             ))}
                           </div>
                           {Math.ceil(myPlanePics.length / planePicsPerPage) > 1 && (
                             <div className="flex items-center justify-between">
                               <button
                                 onClick={() => setPlanePicsPage(p => Math.max(0, p - 1))}
                                 disabled={planePicsPage === 0}
                                 className="liquid-glass-btn flex items-center gap-1 px-3 py-1.5 bg-zinc-800 rounded-lg text-white text-xs disabled:opacity-30"
                               >
                                 <ArrowLeft className="w-3 h-3" /> {t.previous}
                               </button>
                               <span className="text-[10px] text-zinc-400 font-mono">
                                 {t.page} {planePicsPage + 1} {t.of} {Math.ceil(myPlanePics.length / planePicsPerPage)} • {planePicsPerPage} {t.perPage}
                               </span>
                               <button
                                 onClick={() => setPlanePicsPage(p => Math.min(Math.ceil(myPlanePics.length / planePicsPerPage) - 1, p + 1))}
                                 disabled={planePicsPage >= Math.ceil(myPlanePics.length / planePicsPerPage) - 1}
                                 className="liquid-glass-btn flex items-center gap-1 px-3 py-1.5 bg-zinc-800 rounded-lg text-white text-xs disabled:opacity-30"
                               >
                                 {t.next} <ArrowRight className="w-3 h-3" />
                               </button>
                             </div>
                           )}
                         </>
                       )}
                     </div>
                   )}

                    {/* News Feature */}
                    {currentFeature === 'news' && (
                      <div className="space-y-2 max-h-[350px] overflow-y-auto">
                        {socialPosts.length === 0 ? (
                          <p className="text-xs text-zinc-400 text-center py-4">{t.noArticlesFound}</p>
                        ) : (
                          socialPosts.slice(0, 10).map((post: any) => (
                            <div key={post.id} className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                              <p className="text-xs text-white line-clamp-3">{post.content}</p>
                              <p className="text-[9px] text-zinc-500 mt-1 font-mono">{post.timestamp || 'Recent'}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

               {/* VIEW 7: HUB NAVIGATION BAR */}
               {['connect', 'media', 'arcade', 'office', 'telemetry'].includes(screenMode) && (
                 <div className="flex items-center gap-2 mb-3 p-2 bg-zinc-900/90 border border-zinc-700 rounded-xl">
                   <button
                     onClick={() => setScreenMode('HOME')}
                     className="liquid-glass-btn p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                   >
                     <ArrowLeft className="w-4 h-4" />
                   </button>
                   <span className="text-xs font-bold text-white">
                     {screenMode === 'connect' && 'Connect & Social'}
                     {screenMode === 'media' && 'Media & Streams'}
                     {screenMode === 'arcade' && 'Arcade & Games'}
                     {screenMode === 'office' && 'Productivity & Office'}
                     {screenMode === 'telemetry' && 'Aviation & Telemetry'}
                   </span>
                 </div>
               )}

               {/* VIEW 8: HUB COMPONENTS */}
               {screenMode === 'connect' && <ConnectSocialHub />}
               {screenMode === 'media' && <MediaStreamingHub />}
               {screenMode === 'arcade' && <ArcadeGamesHub />}
               {screenMode === 'office' && <ProductivityOfficeHub />}
               {screenMode === 'telemetry' && <AviationTelemetryHub />}

             </div>

            {/* APP DRAWER TAB BUTTON AT BOTTOM CENTER OF SCREEN */}
            {screenMode === 'HOME' && (
              <div className="w-full flex justify-center pb-2">
                <button
                  onClick={() => {
                    playTouchSound(620);
                    setScreenMode('APP_DRAWER');
                  }}
                  className="liquid-glass-btn px-6 py-1 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-t-xl shadow-lg flex items-center gap-1.5 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer"
                  title="Open App Drawer"
                >
                  <ChevronUp className="w-4 h-4 text-emerald-400 animate-bounce" />
                  <span>Apps</span>
                </button>
              </div>
            )}

          </div>

           {/* HARDWARE CAPACITIVE TOUCH BUTTONS AT BOTTOM OF PHONE BEZEL */}
           <div className="w-full bg-black py-2.5 px-6 border-t border-zinc-800 flex items-center justify-between text-zinc-400 z-30">
             {/* 1. Back Key */}
             <button
               onClick={() => {
                 playTouchSound(450);
                 if (screenMode !== 'HOME') {
                   setScreenMode('HOME');
                 } else {
                   showToast('BRIO DROID', 'Home Screen Active', 'info');
                 }
               }}
               className="liquid-glass-btn p-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors active:scale-90 cursor-pointer"
               title="Back Key"
             >
               <RotateCcw className="w-5 h-5 text-zinc-300" />
             </button>

             {/* 2. Menu Key */}
             <button
               onClick={() => {
                 playTouchSound(500);
                 setScreenMode('ACCOUNT_OVERLAY');
               }}
               className="liquid-glass-btn p-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors active:scale-90 cursor-pointer"
               title="Menu Key"
             >
               <Menu className="w-5 h-5 text-zinc-300" />
             </button>

             {/* 3. Home Key */}
             <button
               onClick={() => {
                 playTouchSound(650);
                 setScreenMode('HOME');
               }}
               className="liquid-glass-btn p-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors active:scale-90 cursor-pointer"
               title="Home Key"
             >
               <Home className="w-5 h-5 text-zinc-300" />
             </button>

             {/* 4. Search Key */}
             <button
               onClick={() => {
                 playTouchSound(580);
                 setScreenMode('SEARCH');
               }}
               className="liquid-glass-btn p-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors active:scale-90 cursor-pointer"
               title="Search Key"
             >
               <Search className="w-5 h-5 text-zinc-300" />
             </button>
           </div>

           {/* WEATHER OVERLAY */}
           {activeOverlay === 'WEATHER' && (
             <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
               <div className="relative w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl text-slate-100 space-y-4 max-h-full overflow-y-auto">
                 <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                   <div className="flex items-center gap-2 text-sky-400">
                     <CloudSun className="w-5 h-5" />
                     <h2 className="text-sm font-bold">Aviation Weather</h2>
                   </div>
                   <button
                     onClick={() => setActiveOverlay('NONE')}
                     className="liquid-glass-btn p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800"
                   >
                     <X className="liquid-glass-btn w-4 h-4" />
                   </button>
                 </div>

                 <div className="flex gap-2 overflow-x-auto pb-2">
                   {['KJFK', 'EGLL', 'RJTT', 'OMDB', 'LFPB'].map((icao) => (
                     <button
                       key={icao}
                       onClick={() => loadWeatherForStation(icao)}
                       className={`liquid-glass-btn px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all shrink-0 ${
                         weatherStationData.icao === icao
                           ? 'bg-sky-500 text-black font-extrabold'
                           : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                       }`}
                     >
                       {icao}
                     </button>
                   ))}
                 </div>

                 <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                   <div className="flex items-center justify-between">
                     <div>
                       <h3 className="text-sm font-bold text-white">{weatherStationData.airportName}</h3>
                       <p className="text-[10px] text-sky-400 font-mono">ICAO: {weatherStationData.icao}</p>
                     </div>
                     <div className="text-right">
                       <span className="text-2xl font-black text-sky-300">{weatherStationData.tempC}°C</span>
                       <p className="text-[10px] text-slate-400">{weatherStationData.tempF}°F</p>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                     <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                       <span className="text-slate-400 block">Condition</span>
                       <span className="font-bold text-white">{weatherStationData.condition}</span>
                     </div>
                     <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                       <span className="text-slate-400 block">Humidity</span>
                       <span className="font-bold text-white">{weatherStationData.humidity}%</span>
                     </div>
                     <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                       <span className="text-slate-400 block">Wind</span>
                       <span className="font-bold text-white">{weatherStationData.windSpeedKts} kts ({weatherStationData.windDirection})</span>
                     </div>
                     <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                       <span className="text-slate-400 block">Air Quality</span>
                       <span className="font-bold text-emerald-400">AQI {weatherStationData.aqi}</span>
                     </div>
                   </div>

                   <div className="space-y-1 pt-2 border-t border-slate-800">
                     <p className="text-[10px] font-mono text-slate-400"><strong className="liquid-glass-btn text-sky-300">METAR:</strong> {weatherStationData.metar}</p>
                     <p className="text-[10px] font-mono text-slate-400"><strong className="liquid-glass-btn text-sky-300">TAF:</strong> {weatherStationData.taf}</p>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* CLOCK OVERLAY */}
           {activeOverlay === 'CLOCK' && (
             <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
               <div className="relative w-full max-w-sm">
                 <ClockSuiteModal onClose={() => setActiveOverlay('NONE')} />
               </div>
             </div>
           )}

         </div>

        {/* BOTTOM HARDWARE CHIN WITH VERIZON / BRIO LOGO */}
        <div className="w-full pt-2.5 pb-0.5 flex items-center justify-between px-3 text-[10px] font-mono font-bold text-zinc-400">
          <span className="tracking-widest">DROID</span>
          <div className="flex items-center gap-1 italic text-zinc-300">
            <span className="text-red-500 font-black">✓</span>
            <span className="tracking-wider">verizon / brio</span>
          </div>
        </div>

      </div>
    </div>
  );
};
