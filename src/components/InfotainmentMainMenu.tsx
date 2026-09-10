import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { getWeather, type WeatherData } from '../utils/weatherService';
import { ClockSuiteModal } from './ClockSuiteModal';
import { Sidebar } from './Layout/Sidebar';
import { LegalPage } from './Legal/LegalPage';
import { ErrorBoundary } from './ErrorBoundary';
import QRCode from 'qrcode';

// Hub Imports
import { ConnectSocialHub } from './Hub1_ConnectSocial/ConnectSocialHub';
import { MediaStreamingHub } from './Hub2_MediaStreaming/MediaStreamingHub';
import { ArcadeGamesHub } from './Hub3_ArcadeGames/ArcadeGamesHub';
import { ProductivityOfficeHub } from './Hub4_ProductivityOffice/ProductivityOfficeHub';
import { AviationTelemetryHub } from './Hub5_AviationTelemetry/AviationTelemetryHub';
import { MyPlanePicsHub } from './Hub5_AviationTelemetry/MyPlanePicsHub';
import { RSSReader } from './Hub2_MediaStreaming/RSSReader';


// Feature Imports
import {
 QRCodeGenerator,
 ColorPicker,
 Notepad,
 BMICalculator,
 Metronome,
} from './Features';

import {
  Home,
  CloudSun,
  UserCircle,
  Moon,
  Sun,
  Clock,
  X,
  ChevronRight,
  Users,
  Play,
  Gamepad2,
  Briefcase,
  Activity,
  Camera,
  ShieldCheck,
  LogOut,
  UserCheck,
  Key,
  Sparkles,
  MapPin,
  Droplets,
  Wind,
  Gauge,
  ThermometerSun,
  Eye,
  FileText,
  Settings,
  HelpCircle,
  Monitor,
  AlertTriangle,
  Plane,
  Search,
  Bell,
  Cpu,
  Zap,
  Wifi,
  QrCode,
  Palette,
  BookOpen,
  Heart,
  Music,
  Rss,
} from 'lucide-react';

function getTempColorClass(tempC: number): string {
 if (tempC <= 0) return 'text-sky-300';
 if (tempC <= 10) return 'text-sky-200';
 if (tempC <= 18) return 'text-teal-300';
 if (tempC <= 25) return 'text-amber-300';
 if (tempC <= 30) return 'text-orange-400';
 return 'text-red-400';
}

function getWeatherIconByCondition(icon: string, condition: string): string {
 const lower = condition.toLowerCase();
 if (lower.includes('clear') || lower.includes('sun')) return '01d';
 if (lower.includes('cloud')) return '03d';
 if (lower.includes('rain') || lower.includes('drizzle')) return '10d';
 if (lower.includes('snow') || lower.includes('sleet')) return '13d';
 if (lower.includes('thunder') || lower.includes('storm')) return '11d';
 if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze')) return '50d';
 if (lower.includes('wind')) return '02d';
 return icon || '01d';
}

interface ForecastItem {
 time: string;
 icon: string;
 temp: string;
 condition: string;
}

function generateForecast(data: WeatherData, units: 'metric' | 'imperial'): ForecastItem[] {
 const now = new Date();
 const baseTemp = data.tempC;
 const icon = data.icon || '01d';
 const condition = data.condition || 'Clear';
 const items: ForecastItem[] = [];

 for (let i = 1; i <= 4; i++) {
 const next = new Date(now.getTime() + i * 3 * 60 * 60 * 1000);
 const hour = next.getHours();
 const ampm = hour >= 12 ? 'PM' : 'AM';
 const displayHour = hour % 12 || 12;
 const timeLabel = `${displayHour}${ampm}`;

 const variation = (Math.sin(i * 1.2) * 2).toFixed(0);
 const nextTemp = baseTemp + Number(variation);
 const convertedTemp = units === 'metric' ? `${nextTemp}°` : `${Math.round((nextTemp * 9) / 5 + 32)}°`;

 const nextIcon = getWeatherIconByCondition(icon, condition);

 items.push({
 time: timeLabel,
 icon: `https://openweathermap.org/img/wn/${nextIcon}.png`,
 temp: convertedTemp,
 condition: condition,
 });
 }

 return items;
}

interface InfotainmentMainMenuProps {
 onNavigateTab?: (tabKey: string) => void;
}

export const InfotainmentMainMenu: React.FC<InfotainmentMainMenuProps> = ({ onNavigateTab }) => {
   const {
   t,
   activeHub,
   setActiveHub,
   showToast,
   user,
   logoutUser,
   updateUserAvatar,
   setShowAuthModal,
   setMasterPassphrase,
   authRequired,
   masterKeySet,
   notifications,
    telemetry,
    theme,
    toggleTheme,
    } = useApp();

   useTheme();

  const [screenView, setScreenView] = useState<'home' | 'connect' | 'media' | 'arcade' | 'office' | 'telemetry' | 'myplanepics' | 'security' | 'settings' | 'help' | 'qrcode' | 'colorpicker' | 'notepad' | 'bmi' | 'metronome' | 'rss'>(
  () => activeHub || 'home'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const [activeOverlay, setActiveOverlay] = useState<'NONE' | 'WEATHER' | 'ACCOUNT' | 'CLOCK' | 'SECURITY' | 'LEGAL' | 'SETTINGS' | 'HELP'>('NONE');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

 const [weatherUnits, setWeatherUnits] = useState<'metric' | 'imperial'>('metric');
 const [weatherSearchInput, setWeatherSearchInput] = useState('');
 const [weatherData, setWeatherData] = useState<WeatherData>({
 city: 'London',
 country: '',
 countryCode: '',
 tempC: 18,
 tempF: 64,
 tempMinC: 14,
 tempMaxC: 22,
 condition: 'Fair / Clear',
 description: 'clear sky',
 icon: '01d',
 humidity: 55,
 windSpeedMs: 3.5,
 windSpeedKts: 7,
 windDirection: '180° S',
 pressure: 1013,
 visibility: 10000,
 feelsLikeC: 17,
 isRealTime: false,
 lastUpdated: '',
 datetime: '',
 timezone: 0,
 });

 const [qrDataUrl, setQrDataUrl] = useState<string>('');

 const loadWeatherForCity = async (city: string) => {
 try {
 const liveData = await getWeather(city, weatherUnits);
 setWeatherData(liveData);
 } catch {
 showToast('Weather Error', 'Failed to retrieve live weather data', 'error');
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
 const url = await QRCode.toDataURL(payload, {
 width: 256,
 margin: 2,
 color: { dark: '#000000', light: '#FFFFFF' },
 errorCorrectionLevel: 'L',
 type: 'image/png',
 });
 setQrDataUrl(url);
 } catch {
 showToast('QR Error', 'Failed to generate QR code. Please try again.', 'error');
 }
 };

 useEffect(() => {
 loadWeatherForCity('London');
 }, []);

 useEffect(() => {
 if (activeHub && activeHub !== screenView) {
 setScreenView(activeHub as any);
 }
 }, [activeHub]);

 useEffect(() => {
 if (authRequired && !user) {
 setShowAuthModal(true);
 }
 }, [authRequired, user, setShowAuthModal]);

  const switchScreenView = useCallback(
  (view: 'home' | 'connect' | 'media' | 'arcade' | 'office' | 'telemetry' | 'myplanepics' | 'security' | 'settings' | 'help' | 'qrcode' | 'colorpicker' | 'notepad' | 'bmi' | 'metronome' | 'rss') => {
 try {
 setScreenView(view);
 if (view !== 'home' && view !== activeHub) {
 setActiveHub(view as any);
 }
 if (onNavigateTab) {
 onNavigateTab(view);
 }
 } catch {
 showToast('Navigation Error', 'Failed to switch screen view', 'error');
 }
 },
 [activeHub, setActiveHub, onNavigateTab, showToast]
 );

 const goHome = useCallback(() => {
 try {
 setScreenView('home');
 } catch {
 showToast('Navigation Error', 'Failed to return home', 'error');
 }
 }, [showToast]);

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
 // ignore
 }
 };

  return (
  <div className="w-full max-w-6xl mx-auto my-auto p-2 sm:p-4 font-sans select-none box-border relative">
  {/* App Background with wallpaper.png */}
  <div className="app-background" />

  {/* Mobile sidebar toggle */}
  <button
    onClick={() => setSidebarOpen(!sidebarOpen)}
    className="lg:hidden fixed bottom-4 left-4 z-50 skeuo-btn-primary w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
    aria-label="Toggle menu"
  >
    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
  </button>

  {/* IFE Main Display Frame */}
  <div className="skeuo-panel relative flex flex-col lg:flex-row gap-3 lg:gap-4 min-h-[640px] lg:min-h-0 p-3 sm:p-5">
  <div className="aero-bubbles" aria-hidden="true" />
   {/* Mobile sidebar overlay */}
   {sidebarOpen && (
     <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
   )}
    <div className={`lg:relative lg:block ${sidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-full shadow-2xl' : 'hidden lg:block'}`}>
     <Sidebar
     onHome={goHome}
     onOpenOverlay={(overlay) => { setActiveOverlay(overlay); setSidebarOpen(false); }}
     user={user}
     />
   </div>

   {/* Right Content Column */}
  <div className="relative z-10 flex-1 flex flex-col min-w-0 gap-4">
    {/* IFE Header */}
    <header className="skeuo-panel relative z-10 texture-brushed-metal">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="relative">
          <img src="/logo.png" alt="Brio" className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(200,16,46,0.4)]" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full skeuo-led-dot--green animate-pulse" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-[0.12em] uppercase skeuo-text-embossed">Brio</h1>
          <p className="text-[9px] font-mono text-red-400 uppercase tracking-wider">In-Flight Entertainment</p>
        </div>

        <div className="flex-1" />

        {/* Search Bar */}
        <div className="header-search-bar hidden sm:flex">
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                switchScreenView('connect');
              }
            }}
            placeholder="Search..."
            className="w-full bg-transparent border-none outline-none text-xs text-white placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Telemetry Pills */}
        <div className="hidden md:flex items-center gap-2">
          <div className="header-telemetry-pill" title={`CPU: ${telemetry.cpuUsage}%`}>
            <Cpu className="w-3 h-3" />
            <span className={telemetry.cpuUsage > 80 ? 'text-red-400' : 'text-zinc-400'}>{telemetry.cpuUsage}%</span>
          </div>
          <div className="header-telemetry-pill" title={`RAM: ${telemetry.ramUsagePercent}%`}>
            <Activity className="w-3 h-3" />
            <span className={(telemetry.ramUsagePercent ?? 20) > 80 ? 'text-red-400' : 'text-zinc-400'}>{telemetry.ramUsagePercent ?? 20}%</span>
          </div>
          <div className="header-telemetry-pill header-telemetry-pill--accent" title={`FPS: ${telemetry.fps}`}>
            <Monitor className="w-3 h-3" />
            <span>{telemetry.fps ?? 60}</span>
          </div>
        </div>

        {/* Notifications */}
        <button className="header-notification-btn" title="Notifications" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          {notifications.length > 0 && (
            <span className="header-notification-badge">
              {notifications.length > 99 ? '99+' : notifications.length}
            </span>
          )}
        </button>

        {/* Clock */}
        <button
          onClick={() => {
            playAudioTone(700, 0.1);
            setActiveOverlay('CLOCK');
          }}
          className="skeuo-btn px-3 py-1.5 flex items-center gap-2 cursor-pointer"
        >
          <Clock className="w-4 h-4 text-red-400" />
          <span className="text-xs font-mono font-bold text-white tracking-wider skeuo-numeric-display" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
            {currentTime || '00:00:00'}
          </span>
        </button>
      </div>
    </header>

  {/* Main Content Area */}
  <div className="flex-1 relative z-10 overflow-y-auto skeuo-scrollbar">
    {screenView === 'home' && (
      <div className="space-y-4">
        {/* Hero / Welcome Section */}
        <div className="home-hero">
          <div className="relative z-10">
            <div className="home-greeting">
              <h2 className="home-greeting-text">
                {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
              </h2>
              <span className="home-greeting-sub">Captain</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider pl-1">
              SELECT YOUR DESTINATION BELOW
            </p>

            {/* Status Row */}
            <div className="flex items-center gap-2 mt-3">
              <div className="status-pill">
                <span className="status-pill-dot" />
                <span className="text-[9px] font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  {masterKeySet ? 'Vault Active' : 'System Ready'}
                </span>
              </div>
              <div className="quick-stats" style={{ padding: '0.5rem 0.75rem' }}>
                <div className="quick-stat-item">
                  <Plane className="w-3 h-3 text-red-400" />
                  <span className="text-[10px]">IFE</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="quick-stat-item">
                  <span className="text-zinc-500 text-[10px]">Hubs:</span>
                  <span className="quick-stat-value text-[10px]">7</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="quick-stat-item">
                  <span className="quick-stat-value text-emerald-400 text-[10px]">● ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Hubs */}
        <div>
          <div className="home-section-title">Featured Hubs</div>
          <div className="home-featured">
            <div
              onClick={() => switchScreenView('connect')}
              className="home-featured-card"
            >
              <div className="home-featured-icon text-red-400">
                <Users className="w-5 h-5" />
              </div>
              <div className="home-featured-title">Connect</div>
              <div className="home-featured-desc">Encrypted messaging & social feed</div>
            </div>

            <div
              onClick={() => switchScreenView('media')}
              className="home-featured-card"
            >
              <div className="home-featured-icon text-red-400">
                <Play className="w-5 h-5" />
              </div>
              <div className="home-featured-title">Media</div>
              <div className="home-featured-desc">Stream music & video</div>
            </div>

            <div
              onClick={() => switchScreenView('arcade')}
              className="home-featured-card"
            >
              <div className="home-featured-icon text-red-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div className="home-featured-title">Arcade</div>
              <div className="home-featured-desc">11 built-in games</div>
            </div>

            <div
              onClick={() => switchScreenView('rss')}
              className="home-featured-card"
            >
              <div className="home-featured-icon text-red-400">
                <Rss className="w-5 h-5" />
              </div>
              <div className="home-featured-title">News</div>
              <div className="home-featured-desc">Aviation & world news</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="home-quick-actions">
          <button
            onClick={() => setActiveOverlay('SETTINGS')}
            className="liquid-glass"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => setActiveOverlay('HELP')}
            className="liquid-glass"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Help</span>
          </button>
          <button
            onClick={() => switchScreenView('qrcode')}
            className="liquid-glass liquid-glass--accent"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR</span>
          </button>
        </div>

        {/* All Hubs */}
        <div>
          <div className="home-section-title">All Hubs</div>
          <div className="home-grid">
            <div
              onClick={() => switchScreenView('office')}
              className={`home-tile home-tile--compact ${activeHub === 'office' ? 'home-tile--active' : ''}`}
            >
              <div className="home-tile-icon text-red-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="home-tile-label">Office</span>
              <span className="home-tile-badge">Secure</span>
            </div>

            <div
              onClick={() => switchScreenView('myplanepics')}
              className={`home-tile home-tile--compact ${activeHub === 'myplanepics' ? 'home-tile--active' : ''}`}
            >
              <div className="home-tile-icon text-red-400">
                <Camera className="w-5 h-5" />
              </div>
              <span className="home-tile-label">MyPlanePics</span>
              <span className="home-tile-badge">Vault</span>
            </div>

            <div
              onClick={() => switchScreenView('telemetry')}
              className={`home-tile home-tile--compact ${activeHub === 'telemetry' ? 'home-tile--active' : ''}`}
            >
              <div className="home-tile-icon text-red-400">
                <Activity className="w-5 h-5" />
              </div>
              <span className="home-tile-label">Telemetry</span>
              <span className="home-tile-badge">System</span>
            </div>



            <div
              onClick={() => switchScreenView('colorpicker')}
              className="home-tile home-tile--compact"
            >
              <div className="home-tile-icon text-red-400">
                <Palette className="w-5 h-5" />
              </div>
              <span className="home-tile-label">Colors</span>
              <span className="home-tile-badge">Picker</span>
            </div>

            <div
              onClick={() => switchScreenView('notepad')}
              className="home-tile home-tile--compact"
            >
              <div className="home-tile-icon text-red-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="home-tile-label">Notepad</span>
              <span className="home-tile-badge">Secure</span>
            </div>

            <div
              onClick={() => switchScreenView('bmi')}
              className="home-tile home-tile--compact"
            >
              <div className="home-tile-icon text-red-400">
                <Heart className="w-5 h-5" />
              </div>
              <span className="home-tile-label">BMI</span>
              <span className="home-tile-badge">Health</span>
            </div>

            <div
              onClick={() => switchScreenView('metronome')}
              className="home-tile home-tile--compact"
            >
              <div className="home-tile-icon text-red-400">
                <Music className="w-5 h-5" />
              </div>
              <span className="home-tile-label">Metronome</span>
              <span className="home-tile-badge">Audio</span>
            </div>
          </div>
        </div>
      </div>
    )}

 {/* SCREEN VIEW HUBS */}
  {screenView === 'connect' && (
  <ErrorBoundary name="ConnectSocialHub">
  <ConnectSocialHub initialSearchQuery={searchQuery} onSearchOpened={() => setSearchQuery('')} />
  </ErrorBoundary>
  )}
  {screenView === 'media' && (
  <ErrorBoundary name="MediaStreamingHub">
  <MediaStreamingHub />
  </ErrorBoundary>
  )}
  {screenView === 'rss' && (
  <ErrorBoundary name="RSSReader">
  <RSSReader />
  </ErrorBoundary>
  )}
  {screenView === 'arcade' && (
 <ErrorBoundary name="ArcadeGamesHub">
 <ArcadeGamesHub />
 </ErrorBoundary>
 )}
 {screenView === 'office' && (
 <ErrorBoundary name="ProductivityOfficeHub">
 <ProductivityOfficeHub />
 </ErrorBoundary>
 )}
 {screenView === 'telemetry' && (
 <ErrorBoundary name="AviationTelemetryHub">
 <AviationTelemetryHub />
 </ErrorBoundary>
 )}
 {screenView === 'myplanepics' && (
 <ErrorBoundary name="MyPlanePicsHub">
 <MyPlanePicsHub />
 </ErrorBoundary>
 )}

 {screenView === 'qrcode' && (
 <ErrorBoundary name="QRCodeGenerator">
 <QRCodeGenerator />
 </ErrorBoundary>
 )}
 {screenView === 'colorpicker' && (
 <ErrorBoundary name="ColorPicker">
 <ColorPicker />
 </ErrorBoundary>
 )}
 {screenView === 'notepad' && (
 <ErrorBoundary name="Notepad">
 <Notepad />
 </ErrorBoundary>
 )}
 {screenView === 'bmi' && (
 <ErrorBoundary name="BMICalculator">
 <BMICalculator />
 </ErrorBoundary>
 )}
 {screenView === 'metronome' && (
 <ErrorBoundary name="Metronome">
 <Metronome />
 </ErrorBoundary>
 )}
 </div>

 {/* IFE Footer Status Bar */}
 <footer className="skeuo-card relative z-10 rounded-xl">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
 <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider">IFE System Active</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-[10px] font-mono text-zinc-400">v2.0</span>
 <span className="text-[10px] font-mono text-red-400 font-bold">BRIO</span>
 </div>
 </footer>
 </div>
 </div>

 {/* WEATHER OVERLAY */}
 {activeOverlay === 'WEATHER' && (
 <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
 <div className="relative w-full max-w-2xl skeuo-inset-panel p-6 text-white space-y-5 max-h-[90vh] overflow-y-auto animate-slideIn">
 <div className="flex items-center justify-between pb-3 border-b border-white/10">
 <div className="flex items-center gap-2 text-red-400">
 <CloudSun className="w-6 h-6" />
 <h2 className="text-xl font-bold uppercase tracking-wider">Live Global Weather</h2>
 </div>
 <button
 onClick={() => setActiveOverlay('NONE')}
 className="skeuo-panel p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <form
 onSubmit={(e) => {
 e.preventDefault();
 if (weatherSearchInput.trim()) {
 loadWeatherForCity(weatherSearchInput.trim());
 }
 }}
 className="flex gap-2 items-center"
 >
 <div className="relative flex-1">
 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
 <input
 type="text"
 value={weatherSearchInput}
 onChange={(e) => setWeatherSearchInput(e.target.value)}
 placeholder="Search city..."
 className="w-full skeuo-panel pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500"
 />
 </div>
 <button
 type="submit"
 disabled={!weatherSearchInput.trim()}
 className="skeuo-btn-primary px-4 py-2.5 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
 >
 Search
 </button>
 </form>

 <div className="flex items-center gap-2">
 <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Units:</span>
 <button
 onClick={() => setWeatherUnits('metric')}
 className={`skeuo-btn-primary px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
 weatherUnits === 'metric' ? 'bg-red-700 text-white shadow-md shadow-red-900/40' : 'bg-white/5 text-zinc-300'
 }`}
 >
 °C / m/s
 </button>
 <button
 onClick={() => setWeatherUnits('imperial')}
 className={`skeuo-btn-primary px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
 weatherUnits === 'imperial' ? 'bg-red-700 text-white shadow-md shadow-red-900/40' : 'bg-white/5 text-zinc-300'
 }`}
 >
 °F / mph
 </button>
 </div>

 <div className="skeuo-panel p-5 space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <div className="flex items-center gap-1.5 mb-0.5">
 <MapPin className="w-3.5 h-3.5 text-red-400" />
 <h3 className="text-lg font-extrabold text-white tracking-wide">{weatherData.city}</h3>
 </div>
 <p className="text-xs text-zinc-400 font-mono pl-5">
 {weatherData.country ? `${weatherData.country} • ` : ''}{weatherData.datetime || '—'}
 </p>
 <p className="text-xs text-zinc-500 capitalize pl-5">{weatherData.description}</p>
 </div>
  <div className="text-right flex flex-col items-end gap-1">
  <div className="weather-icon-float">
  {weatherData.icon && (
  <div className="skeuo-weather-icon">
  <img
  src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
  alt={weatherData.description}
  />
  </div>
  )}
  </div>
  <span className={`text-3xl font-black tracking-tight ${getTempColorClass(weatherData.tempC)}`}>
 {weatherUnits === 'metric' ? `${weatherData.tempC}°C` : `${weatherData.tempF}°F`}
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-300 uppercase tracking-wider">
 {weatherData.condition}
 </span>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
 <div className="skeuo-card p-3 flex items-start gap-2">
 <Droplets className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
 <div>
 <span className="text-zinc-400 block text-[9px] uppercase tracking-wider">Humidity</span>
 <span className="font-bold text-white">{weatherData.humidity}%</span>
 </div>
 </div>
 <div className="skeuo-card p-3 flex items-start gap-2">
 <Wind className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
 <div>
 <span className="text-zinc-400 block text-[9px] uppercase tracking-wider">Wind</span>
 <span className="font-bold text-white">
 {weatherUnits === 'metric'
 ? `${weatherData.windSpeedMs.toFixed(1)} m/s`
 : `${(weatherData.windSpeedMs * 2.237).toFixed(1)} mph`}
 {' '}{weatherData.windDirection}
 </span>
 </div>
 </div>
 <div className="skeuo-card p-3 flex items-start gap-2">
 <Gauge className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
 <div>
 <span className="text-zinc-400 block text-[9px] uppercase tracking-wider">Pressure</span>
 <span className="font-bold text-white">{weatherData.pressure} hPa</span>
 </div>
 </div>
 <div className="skeuo-card p-3 flex items-start gap-2">
 <ThermometerSun className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
 <div>
 <span className="text-zinc-400 block text-[9px] uppercase tracking-wider">Real Feel</span>
 <span className="font-bold text-white">
 {weatherUnits === 'metric' ? `${weatherData.feelsLikeC}°C` : `${Math.round((weatherData.feelsLikeC * 9) / 5 + 32)}°F`}
 </span>
 </div>
 </div>
 <div className="skeuo-card p-3 flex items-start gap-2 col-span-2 sm:col-span-4">
 <Eye className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
 <div>
 <span className="text-zinc-400 block text-[9px] uppercase tracking-wider">Visibility</span>
 <span className="font-bold text-white">{(weatherData.visibility / 1000).toFixed(1)} km</span>
 </div>
 </div>
 </div>

 <div className="space-y-2">
 <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Hourly Forecast</p>
  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
  {generateForecast(weatherData, weatherUnits).map((item, idx) => (
  <div key={idx} className="skeuo-card flex-1 min-w-[4.5rem] p-2 text-center space-y-1">
  <p className="text-[9px] text-zinc-400 font-mono">{item.time}</p>
  <div className="flex justify-center weather-icon-float" style={{ animationDelay: `${idx * 0.3}s` }}>
  <div className="skeuo-weather-icon skeuo-weather-icon--sm">
  <img src={item.icon} alt="" />
  </div>
  </div>
  <p className="text-xs font-bold text-white">{item.temp}</p>
  </div>
  ))}
  </div>
 </div>

 {weatherData.isRealTime && (
 <div className="flex items-center gap-2 text-[10px] font-mono text-red-400 pt-2 border-t border-white/10">
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
 </span>
 Live data from OpenWeatherMap • Updated: {weatherData.lastUpdated}
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {/* ACCOUNT OVERLAY */}
 {activeOverlay === 'ACCOUNT' && (
 <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
 <div className="relative w-full max-w-md skeuo-inset-panel p-6 text-white space-y-5 ">
 <div className="flex items-center justify-between pb-3 border-b border-white/10">
 <div className="flex items-center gap-2 text-red-400">
 <UserCheck className="w-6 h-6" />
 <h2 className="text-lg font-bold uppercase tracking-wider">{t.accountSecuritySettings}</h2>
 </div>
 <button
 onClick={() => setActiveOverlay('NONE')}
 className="skeuo-panel p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

  <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3">
  <div className="flex items-center gap-3">
  <div className="relative">
  {user?.avatarUrl ? (
  <img src={user.avatarUrl} alt={user.username || 'User'} className="w-12 h-12 rounded-full object-cover border-2 border-red-400/30 shadow-[0_0_12px_rgba(200,16,46,0.3)]" />
  ) : (
  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-red-800 flex items-center justify-center font-bold text-xl text-white border-2 border-red-400/30">
  {(user?.username || 'O').charAt(0).toUpperCase()}
  </div>
  )}
  <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-600 border border-red-400 flex items-center justify-center cursor-pointer hover:bg-red-500 transition-colors shadow-lg">
  <Camera className="w-3 h-3 text-white" />
  </label>
  <input
  id="avatar-upload"
  type="file"
  accept="image/*"
  className="hidden"
  onChange={(e) => {
  const file = e.target.files?.[0];
  if (file) {
  const reader = new FileReader();
  reader.onload = () => {
  const result = reader.result as string;
  updateUserAvatar(result);
  showToast('Profile Picture', 'Avatar updated and saved to vault', 'success');
  };
  reader.readAsDataURL(file);
  }
  }}
  />
  </div>
  <div>
  <p className="font-bold text-white text-base">{user?.username || t.operatorGuest}</p>
  <p className="text-xs text-zinc-400">{user?.email || 'operator@brio.vault'}</p>
  <span className="text-[10px] text-red-400 font-mono">{t.brioCryptographicAccountActive}</span>
  </div>
  </div>
  </div>

 <div className="space-y-3">
 <button
 onClick={() => {
 setActiveOverlay('NONE');
 setShowAuthModal(true);
 }}
 className="skeuo-btn-primary w-full py-3 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer"
 >
 <Key className="w-4 h-4" />
 <span>{t.manageVaultPassphrase}</span>
 </button>

 {user && (
 <button
 onClick={() => {
 logoutUser();
 setActiveOverlay('NONE');
 }}
 className="skeuo-panel w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer"
 >
 <LogOut className="w-4 h-4" />
 <span>{t.signOut}</span>
 </button>
 )}
 </div>
 </div>
 </div>
 )}

 {/* SECURITY OVERLAY */}
 {activeOverlay === 'SECURITY' && (
 <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
 <div className="relative w-full max-w-lg skeuo-inset-panel p-6 text-white space-y-5 ">
 <div className="flex items-center justify-between pb-3 border-b border-white/10">
 <div className="flex items-center gap-2 text-red-400">
 <ShieldCheck className="w-6 h-6" />
 <h2 className="text-xl font-bold uppercase tracking-wider">Security Vault</h2>
 </div>
 <button
 onClick={() => setActiveOverlay('NONE')}
 className="skeuo-panel p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-red-800 flex items-center justify-center font-bold text-xl text-white border-2 border-red-400/30">
 <Activity className="w-6 h-6" />
 </div>
 <div>
 <p className="font-bold text-white text-base">Vault Status</p>
 <p className="text-xs text-zinc-400">{masterKeySet ? 'Encryption key active' : 'No encryption key set'}</p>
 <span className="text-[10px] text-red-400 font-mono">{authRequired ? 'Authentication required' : 'Authenticated'}</span>
 </div>
 </div>
 </div>

 <div className="space-y-3">

 </div>
 </div>
 </div>
 )}

 {/* CLOCK OVERLAY */}
 {activeOverlay === 'CLOCK' && (
 <ClockSuiteModal onClose={() => setActiveOverlay('NONE')} />
 )}

  {/* SETTINGS OVERLAY */}
  {activeOverlay === 'SETTINGS' && (
  <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
  <div className="relative w-full max-w-lg skeuo-inset-panel p-6 text-white space-y-5 animate-slideIn max-h-[90vh] overflow-y-auto skeuo-scrollbar">
  <div className="flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-inherit z-10">
  <div className="flex items-center gap-2 text-red-400">
  <Settings className="w-6 h-6" />
  <h2 className="text-xl font-bold uppercase tracking-wider">Settings</h2>
  </div>
  <button
  onClick={() => setActiveOverlay('NONE')}
  className="skeuo-panel p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5"
  >
  <X className="w-5 h-5" />
  </button>
  </div>

  <div className="space-y-4">
    {/* Display Mode */}
    <div className="skeuo-panel p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Monitor className="w-4 h-4 text-red-400" />
        <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Display Mode</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (theme === 'light') {
              toggleTheme();
              showToast('Settings', 'Switched to Dark Mode', 'success');
            }
          }}
          className={`skeuo-btn flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-red-600 to-red-800 text-white shadow-lg shadow-red-900/30 border border-red-400/40'
              : 'bg-zinc-800 text-zinc-400 hover:text-white border border-white/10'
          }`}
        >
          <Moon className="w-3.5 h-3.5 inline mr-1" />
          Dark
        </button>
        <button
          onClick={() => {
            if (theme === 'dark') {
              toggleTheme();
              showToast('Settings', 'Switched to Light Mode', 'success');
            }
          }}
          className={`skeuo-btn flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            theme === 'light'
              ? 'bg-gradient-to-b from-red-600 to-red-800 text-white shadow-lg shadow-red-900/30 border border-red-400/40'
              : 'bg-zinc-800 text-zinc-400 hover:text-white border border-white/10'
          }`}
        >
          <Sun className="w-3.5 h-3.5 inline mr-1" />
          Light
        </button>
      </div>
    </div>

    {/* Accessibility */}
    <div className="skeuo-panel p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-red-400" />
        <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Accessibility</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">Reduced Motion</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" />
          <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
        </label>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">High Contrast</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" />
          <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
        </label>
      </div>
    </div>
  </div>
  </div>
  </div>
  )}


 {/* HELP / FAQ OVERLAY */}
 {activeOverlay === 'HELP' && (
 <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
 <div className="relative w-full max-w-lg skeuo-inset-panel p-6 text-white space-y-5 animate-slideIn">
 <div className="flex items-center justify-between pb-3 border-b border-white/10">
 <div className="flex items-center gap-2 text-red-400">
 <HelpCircle className="w-6 h-6" />
 <h2 className="text-xl font-bold uppercase tracking-wider">Help & FAQ</h2>
 </div>
 <button
 onClick={() => setActiveOverlay('NONE')}
 className="skeuo-panel p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <div className="space-y-2">
 {[
 { q: 'How do I connect with other passengers?', a: 'Open the Connect tile to browse the social feed, send messages, and make in-flight calls.' },
 { q: 'Is my data encrypted?', a: 'Yes. Brio uses end-to-end encryption for all messages, vault data, and media streams.' },
 { q: 'How do I change the weather city?', a: 'Open the Weather tile and use the search bar to select any city worldwide.' },
  { q: 'Can I stream my own media?', a: 'Use the Media tile to connect via Nightcore for personalized music and video streaming.' },
 { q: 'How do I access the vault?', a: 'Navigate to Account or Security to set your master passphrase and manage vault settings.' },
 { q: 'Who do I contact for support?', a: 'Press the Run Diagnostics button in System Info to submit a support ticket to ground crew.' },
 ].map((faq) => (
 <details key={faq.q} className="skeuo-card group">
 <summary className="p-4 cursor-pointer list-none flex items-center justify-between text-sm font-bold text-white">
 {faq.q}
 <ChevronRight className="w-4 h-4 text-zinc-400 group-open:rotate-90 transition-transform" />
 </summary>
 <p className="px-4 pb-4 text-xs text-zinc-300 leading-relaxed border-t border-white/5 pt-3">{faq.a}</p>
 </details>
 ))}
 </div>

 <div className="skeuo-card p-4 flex items-center gap-3 bg-red-950/30 border-red-500/20">
 <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
 <p className="text-[10px] text-zinc-300 font-mono">Still need help? Contact the flight crew or submit a diagnostics report.</p>
 </div>
 </div>
 </div>
 )}

 {/* LEGAL OVERLAY */}
 {activeOverlay === 'LEGAL' && (
 <LegalPage onClose={() => setActiveOverlay('NONE')} />
 )}
 </div>
 );
};
