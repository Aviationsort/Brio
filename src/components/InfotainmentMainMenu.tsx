import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getWeather, type WeatherData } from '../utils/weatherService';
import { ClockSuiteModal } from './ClockSuiteModal';
import QRCode from 'qrcode';

// Hub Imports
import { ConnectSocialHub } from './Hub1_ConnectSocial/ConnectSocialHub';
import { MediaStreamingHub } from './Hub2_MediaStreaming/MediaStreamingHub';
import { ArcadeGamesHub } from './Hub3_ArcadeGames/ArcadeGamesHub';
import { ProductivityOfficeHub } from './Hub4_ProductivityOffice/ProductivityOfficeHub';
import { AviationTelemetryHub } from './Hub5_AviationTelemetry/AviationTelemetryHub';

import {
  Home,
  CloudSun,
  User,
  Moon,
  Sun,
  Clock,
  X,
  ChevronRight,
  MessageSquare,
  Music,
  Gamepad2,
  Briefcase,
  Plane,
  ShieldCheck,
  LogOut,
  UserCheck,
  Key,
  Activity,
  Sparkles,
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
    user,
    logoutUser,
    setShowAuthModal,
    setMasterPassphrase,
    authRequired,
  } = useApp();

  const [screenView, setScreenView] = useState<'home' | 'connect' | 'media' | 'arcade' | 'office' | 'telemetry'>(
    () => activeHub || 'home'
  );

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

  const [activeOverlay, setActiveOverlay] = useState<'NONE' | 'WEATHER' | 'ACCOUNT' | 'CLOCK'>('NONE');

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
    } catch (err: any) {
      showToast('QR Error', err.message || 'Failed to generate QR code', 'error');
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
        showToast('Navigation Error', 'Failed to switch screen view', 'error');
      }
    },
    [activeHub, setActiveHub, onNavigateTab, showToast]
  );

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

      {/* IFE Main Display Frame */}
      <div className="liquid-glass relative flex flex-col gap-4 min-h-[640px] p-3 sm:p-5 aero-bubbles">
        
        {/* IFE Header with Logo */}
        <header className="wiiu-header relative z-10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Brio" className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(200,16,46,0.4)]" />
            <div>
              <h1 className="text-base font-black tracking-[0.12em] uppercase text-white">Brio</h1>
              <p className="text-[9px] font-mono text-red-400 uppercase tracking-wider">In-Flight Entertainment</p>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            {/* Live Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/50 border border-red-500/30">
              <div className="ife-status-indicator" />
              <span className="text-[9px] font-mono font-bold text-red-300 uppercase tracking-wider">Live</span>
            </div>

            {/* Clock */}
            <button
              onClick={() => {
                playAudioTone(700, 0.1);
                setActiveOverlay('CLOCK');
              }}
              className="ife-btn px-3 py-1.5 flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-red-400" />
              <span className="text-xs font-mono font-bold text-white tracking-wider">{currentTime || '00:00:00'}</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 relative z-10 overflow-y-auto ife-scrollbar">
          {screenView === 'home' && (
            <div className="space-y-5">
              {/* Welcome Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-red-500" />
                    Home Menu
                  </h2>
                  <p className="text-[10px] font-mono text-zinc-400 mt-1">SELECT YOUR DESTINATION</p>
                </div>
              </div>

              {/* Wii U Tile Grid */}
              <div className="wiiu-grid">
                {/* TILE 1: CONNECT */}
                <div
                  onClick={() => switchScreenView('connect')}
                  className="wiiu-tile"
                >
                  <div className="wiiu-tile-icon text-red-400">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <span className="wiiu-tile-label">Connect</span>
                  <span className="wiiu-tile-badge">Encrypted</span>
                </div>

                {/* TILE 2: MEDIA */}
                <div
                  onClick={() => switchScreenView('media')}
                  className="wiiu-tile"
                >
                  <div className="wiiu-tile-icon text-red-400">
                    <Music className="w-7 h-7" />
                  </div>
                  <span className="wiiu-tile-label">Media</span>
                  <span className="wiiu-tile-badge">Streams</span>
                </div>

                {/* TILE 3: ARCADE */}
                <div
                  onClick={() => switchScreenView('arcade')}
                  className="wiiu-tile"
                >
                  <div className="wiiu-tile-icon text-red-400">
                    <Gamepad2 className="w-7 h-7" />
                  </div>
                  <span className="wiiu-tile-label">Arcade</span>
                  <span className="wiiu-tile-badge">Games</span>
                </div>

                {/* TILE 4: OFFICE */}
                <div
                  onClick={() => switchScreenView('office')}
                  className="wiiu-tile"
                >
                  <div className="wiiu-tile-icon text-red-400">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <span className="wiiu-tile-label">Office</span>
                  <span className="wiiu-tile-badge">Secure</span>
                </div>

                {/* TILE 5: TELEMETRY */}
                <div
                  onClick={() => switchScreenView('telemetry')}
                  className="wiiu-tile"
                >
                  <div className="wiiu-tile-icon text-red-400">
                    <Plane className="w-7 h-7" />
                  </div>
                  <span className="wiiu-tile-label">Telemetry</span>
                  <span className="wiiu-tile-badge">Aviation</span>
                </div>

                {/* TILE 6: WEATHER */}
                <div
                  onClick={() => setActiveOverlay('WEATHER')}
                  className="wiiu-tile"
                >
                  <div className="wiiu-tile-icon text-red-400">
                    <CloudSun className="w-7 h-7" />
                  </div>
                  <span className="wiiu-tile-label">Weather</span>
                  <span className="wiiu-tile-badge">Global</span>
                </div>

                {/* TILE 7: ACCOUNT */}
                <div
                  onClick={() => setActiveOverlay('ACCOUNT')}
                  className="wiiu-tile"
                >
                  <div className="wiiu-tile-icon text-red-400">
                    <User className="w-7 h-7" />
                  </div>
                  <span className="wiiu-tile-label">Account</span>
                  <span className="wiiu-tile-badge">Profile</span>
                </div>

                {/* TILE 8: SETTINGS */}
                <div
                  onClick={() => {
                    // Theme toggle placeholder
                  }}
                  className="wiiu-tile"
                >
                  <div className="wiiu-tile-icon text-red-400">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <span className="wiiu-tile-label">Security</span>
                  <span className="wiiu-tile-badge">Vault</span>
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

        {/* IFE Footer Status Bar */}
        <footer className="ife-status-bar relative z-10 rounded-xl">
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

      {/* WEATHER OVERLAY */}
      {activeOverlay === 'WEATHER' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl flash-panel p-6 text-white space-y-5 max-h-[90vh] overflow-y-auto aero-glossy">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-red-400">
                <CloudSun className="w-6 h-6" />
                <h2 className="text-xl font-bold uppercase tracking-wider">Live Global Weather</h2>
              </div>
              <button
                onClick={() => setActiveOverlay('NONE')}
                className="liquid-glass p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5"
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
              <input
                type="text"
                value={weatherSearchInput}
                onChange={(e) => setWeatherSearchInput(e.target.value)}
                placeholder="Search city..."
                className="flex-1 px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 placeholder-zinc-500"
              />
              <button
                type="submit"
                disabled={!weatherSearchInput.trim()}
                className="flash-btn px-4 py-2.5 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Units:</span>
              <button
                onClick={() => setWeatherUnits('metric')}
                className={`flash-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  weatherUnits === 'metric' ? 'bg-red-700 text-white' : 'bg-white/5 text-zinc-300'
                }`}
              >
                °C / m/s
              </button>
              <button
                onClick={() => setWeatherUnits('imperial')}
                className={`flash-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  weatherUnits === 'imperial' ? 'bg-red-700 text-white' : 'bg-white/5 text-zinc-300'
                }`}
              >
                °F / mph
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{weatherData.city}</h3>
                  <p className="text-xs text-red-400 font-mono">
                    {weatherData.country ? `${weatherData.country} • ` : ''}{weatherData.datetime || '—'}
                  </p>
                  <p className="text-xs text-zinc-400 capitalize">{weatherData.description}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  {weatherData.icon && (
                    <img
                      src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                      alt={weatherData.description}
                      className="w-14 h-14"
                    />
                  )}
                  <span className="text-3xl font-black text-red-300">
                    {weatherUnits === 'metric' ? `${weatherData.tempC}°C` : `${weatherData.tempF}°F`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                  <span className="text-zinc-400 block">Forecast</span>
                  <span className="font-bold text-white">{weatherData.condition}</span>
                </div>
                <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                  <span className="text-zinc-400 block">Humidity</span>
                  <span className="font-bold text-white">{weatherData.humidity}%</span>
                </div>
                <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                  <span className="text-zinc-400 block">Wind</span>
                  <span className="font-bold text-white">
                    {weatherUnits === 'metric'
                      ? `${weatherData.windSpeedMs.toFixed(1)} m/s`
                      : `${(weatherData.windSpeedMs * 2.237).toFixed(1)} mph`}
                    {' '}{weatherData.windDirection}
                  </span>
                </div>
                <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                  <span className="text-zinc-400 block">Pressure</span>
                  <span className="font-bold text-white">{weatherData.pressure} hPa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT OVERLAY */}
      {activeOverlay === 'ACCOUNT' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-md flash-panel p-6 text-white space-y-5 aero-glossy">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-red-400">
                <UserCheck className="w-6 h-6" />
                <h2 className="text-lg font-bold uppercase tracking-wider">{t.accountSecuritySettings}</h2>
              </div>
              <button
                onClick={() => setActiveOverlay('NONE')}
                className="liquid-glass p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-red-800 flex items-center justify-center font-bold text-xl text-white border-2 border-red-400/30">
                  {(user?.username || 'O').charAt(0).toUpperCase()}
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
                className="flash-btn w-full py-3 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer"
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
                  className="liquid-glass w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.signOut}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CLOCK OVERLAY */}
      {activeOverlay === 'CLOCK' && (
        <ClockSuiteModal onClose={() => setActiveOverlay('NONE')} />
      )}
    </div>
  );
};