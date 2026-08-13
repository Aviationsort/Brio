import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { encryptionService } from '../utils/crypto';
import {
  Wifi,
  Battery,
  Lock,
  Plane,
  Home,
  Monitor,
  CheckCircle2,
  Ticket,
  Award,
  Clock,
  Bell,
  Utensils,
  Film,
  Wrench,
  Info,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Star,
  Tv,
  Radio,
  FileText,
  Calculator,
  Bus,
  Search,
  Maximize2,
} from 'lucide-react';

interface TabletIFETabletGUIProps {
  onNavigateTab: (tabKey: string) => void;
  onCloseTabletView?: () => void;
}

export const TabletIFETabletGUI: React.FC<TabletIFETabletGUIProps> = ({
  onNavigateTab,
  onCloseTabletView,
}) => {
  const { t, showToast, language, authRequired, setShowAuthModal, user } = useApp();
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>('inflight');
  const [activeCategory, setActiveCategory] = useState<'dining' | 'movies' | 'tools' | 'info'>('movies');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('8:35 PM');
  const [flightProgress, setFlightProgress] = useState<number>(64);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Audio effect handler
  const playTouchTone = (freq = 520) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // Fallback
    }
  };

  const handleSidebarClick = async (tabKey: string, hubTarget: string, label: string) => {
    try {
      if (authRequired && !user) {
        setShowAuthModal(true);
        showToast('Authentication Required', 'Please sign in to access BRIO Air IFE.', 'warning');
        return;
      }
      playTouchTone(580);
      setActiveSidebarTab(tabKey);
      
      // Encrypt logging for IFE interaction
      const encRecord = await encryptionService.encrypt({
        action: 'TABLET_NAVIGATE',
        tabKey,
        timestamp: Date.now(),
      });
      
      showToast('BRIO Air IFE', `${label} Loaded (Encrypted Checksum: ${encRecord.checksum.slice(0, 8)})`, 'info');
      onNavigateTab(hubTarget);
    } catch (err) {
      showToast('IFE Navigation Error', 'Failed to route IFE command securely', 'error');
    }
  };

  const handleWatchNow = async () => {
    try {
      playTouchTone(700);
      setIsPlaying(!isPlaying);
      const log = await encryptionService.encrypt({
        mediaId: 'THE_VISITATION_STREAM',
        action: isPlaying ? 'PAUSE' : 'PLAY',
        time: Date.now(),
      });
      showToast(
        'In-Flight Video',
        isPlaying ? 'Video paused' : 'Streaming HD video in 1080p',
        'success'
      );
    } catch (err) {
      showToast('Media Error', 'Failed to initialize encrypted stream', 'error');
    }
  };

  const handleRemindMe = async () => {
    try {
      playTouchTone(650);
      await encryptionService.encrypt({
        reminder: 'THE_VISITATION',
        savedAt: Date.now(),
      });
      showToast('Reminder Set', 'Added movie to your in-flight watch queue!', 'success');
    } catch (err) {
      showToast('Reminder Error', 'Could not save watch queue alert', 'error');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-4 select-none box-border px-1 sm:px-0">
      {/* TABLET HARDWARE FRAME (PANA AIR / BRIO AIR IN-FLIGHT TABLET) */}
      <div className="relative w-full bg-slate-950 rounded-[36px] border-8 border-slate-800 p-3 sm:p-5 shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden ring-1 ring-white/20">
        
        {/* Glossy Outer Tablet Edge Reflection */}
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-30" />

        {/* SCREEN CONTAINER (16:10 Landscape Ratio Viewport) */}
        <div className="relative w-full h-[580px] bg-gradient-to-b from-sky-950 via-slate-900 to-sky-900 rounded-2xl border border-sky-400/30 shadow-2xl flex flex-col overflow-hidden text-white">
          
          {/* FRUTIGER AERO GLASS HIGHLIGHT BAR */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none z-20" />

          {/* TABLET TOP STATUS BAR */}
          <div className="w-full bg-slate-950/80 backdrop-blur px-4 py-1.5 flex items-center justify-between border-b border-sky-400/20 text-xs font-mono text-sky-200 z-20">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-sky-300 animate-pulse" />
              <span className="text-[11px] font-bold tracking-wider text-sky-300">
                BRIO-InFlight 5G
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-bold text-white tracking-wide">{currentTime}</span>
              <Lock className="w-3.5 h-3.5 text-sky-400" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-300 font-bold">ALT 35,000 FT</span>
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* TABLET BODY: SIDEBAR + MAIN CONTENT */}
          <div className="flex-1 flex overflow-hidden relative z-10">
            
            {/* LEFT VERTICAL SIDEBAR MENU */}
            <aside className="w-56 bg-gradient-to-b from-sky-950 via-slate-900 to-blue-950 border-r border-sky-400/30 flex flex-col justify-between shrink-0 p-2 sm:p-3 overflow-y-auto scrollbar-thin">
              
              {/* BRANDING LOGO (Replacing PANA AIR with BRIO AIR) */}
              <div className="p-2 mb-3 border-b border-sky-400/20">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-xl shadow-lg border border-white/40">
                    <Plane className="w-5 h-5 text-white transform -rotate-12" />
                  </div>
                  <div>
                    <h1 className="font-black text-lg tracking-wider text-white font-sans drop-shadow">
                      BRIO <span className="text-sky-300 font-light">air</span>
                    </h1>
                    <p className="text-[9px] text-sky-300 font-mono tracking-widest uppercase">
                      In-Flight IFE
                    </p>
                  </div>
                </div>
              </div>

              {/* NAVIGATION BUTTONS LIST */}
              <nav className="space-y-1.5 flex-1">
                {/* 1. Home */}
                <button
                  onClick={() => handleSidebarClick('home', 'connect', t.home || 'Home')}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all border cursor-pointer ${
                    activeSidebarTab === 'home'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-300 shadow-md shadow-sky-900/50'
                      : 'text-sky-200/80 hover:bg-sky-900/40 hover:text-white border-transparent'
                  }`}
                >
                  <Home className="w-4 h-4 text-sky-300" />
                  <span>{t.home || 'Home'}</span>
                </button>

                {/* 2. Book a Flight */}
                <button
                  onClick={() => handleSidebarClick('book', 'telemetry', t.bookFlight || 'Book a Flight')}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all border cursor-pointer ${
                    activeSidebarTab === 'book'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-300 shadow-md shadow-sky-900/50'
                      : 'text-sky-200/80 hover:bg-sky-900/40 hover:text-white border-transparent'
                  }`}
                >
                  <Plane className="w-4 h-4 text-sky-300" />
                  <span>{t.bookFlight || 'Book a Flight'}</span>
                </button>

                {/* 3. Manage My Bookings */}
                <button
                  onClick={() => handleSidebarClick('bookings', 'office', t.manageBookings || 'Manage My Bookings')}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all border cursor-pointer ${
                    activeSidebarTab === 'bookings'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-300 shadow-md shadow-sky-900/50'
                      : 'text-sky-200/80 hover:bg-sky-900/40 hover:text-white border-transparent'
                  }`}
                >
                  <Monitor className="w-4 h-4 text-sky-300" />
                  <span>{t.manageBookings || 'Manage My Bookings'}</span>
                </button>

                {/* 4. Check-In Service */}
                <button
                  onClick={() => handleSidebarClick('checkin', 'connect', t.checkIn || 'Check-In Service')}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all border cursor-pointer ${
                    activeSidebarTab === 'checkin'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-300 shadow-md shadow-sky-900/50'
                      : 'text-sky-200/80 hover:bg-sky-900/40 hover:text-white border-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-sky-300" />
                  <span>{t.checkIn || 'Check-In Service'}</span>
                </button>

                {/* 5. Retrieve Boarding Pass */}
                <button
                  onClick={() => handleSidebarClick('boarding', 'office', t.boardingPass || 'Retrieve Boarding Pass')}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all border cursor-pointer ${
                    activeSidebarTab === 'boarding'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-300 shadow-md shadow-sky-900/50'
                      : 'text-sky-200/80 hover:bg-sky-900/40 hover:text-white border-transparent'
                  }`}
                >
                  <Ticket className="w-4 h-4 text-sky-300" />
                  <span>{t.boardingPass || 'Boarding Pass'}</span>
                </button>

                {/* 6. BrioMiles Services */}
                <button
                  onClick={() => handleSidebarClick('briomiles', 'arcade', t.brioMiles || 'BrioMiles Services')}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all border cursor-pointer ${
                    activeSidebarTab === 'briomiles'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-300 shadow-md shadow-sky-900/50'
                      : 'text-sky-200/80 hover:bg-sky-900/40 hover:text-white border-transparent'
                  }`}
                >
                  <Award className="w-4 h-4 text-sky-300" />
                  <span>{t.brioMiles || 'BrioMiles Services'}</span>
                </button>

                {/* 7. Flight Schedules */}
                <button
                  onClick={() => handleSidebarClick('schedules', 'telemetry', t.flightSchedules || 'Flight Schedules')}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all border cursor-pointer ${
                    activeSidebarTab === 'schedules'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-300 shadow-md shadow-sky-900/50'
                      : 'text-sky-200/80 hover:bg-sky-900/40 hover:text-white border-transparent'
                  }`}
                >
                  <Clock className="w-4 h-4 text-sky-300" />
                  <span>{t.flightSchedules || 'Flight Schedules'}</span>
                </button>

                {/* 8. In Flight Services */}
                <button
                  onClick={() => handleSidebarClick('inflight', 'media', t.inFlightServices || 'In Flight Services')}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all border cursor-pointer ${
                    activeSidebarTab === 'inflight'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-300 shadow-md shadow-sky-900/50'
                      : 'text-sky-200/80 hover:bg-sky-900/40 hover:text-white border-transparent'
                  }`}
                >
                  <Bell className="w-4 h-4 text-sky-300" />
                  <span>{t.inFlightServices || 'In Flight Services'}</span>
                </button>
              </nav>

              {/* Bottom Encrypted Status indicator */}
              <div className="pt-2 border-t border-sky-400/20 text-[10px] text-sky-300/80 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>AES-256 Verified</span>
              </div>
            </aside>

            {/* MAIN CONTENT CANVAS */}
            <main className="flex-1 flex flex-col bg-slate-900/80 overflow-y-auto p-4 relative">
              
              {/* TOP CATEGORY ICON NAVIGATION BAR */}
              <div className="w-full bg-sky-950/60 p-2 rounded-2xl border border-sky-400/30 mb-4 flex items-center justify-around shadow-inner">
                {/* Dining / Catering */}
                <button
                  onClick={() => {
                    playTouchTone(480);
                    setActiveCategory('dining');
                  }}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                    activeCategory === 'dining'
                      ? 'bg-gradient-to-b from-sky-400 to-blue-600 text-white border-white shadow-md'
                      : 'text-sky-300 hover:bg-sky-800/40 border-transparent'
                  }`}
                  title="Dining & Bar"
                >
                  <Utensils className="w-5 h-5" />
                </button>

                {/* Media / Movies */}
                <button
                  onClick={() => {
                    playTouchTone(520);
                    setActiveCategory('movies');
                  }}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                    activeCategory === 'movies'
                      ? 'bg-gradient-to-b from-sky-400 to-blue-600 text-white border-white shadow-md'
                      : 'text-sky-300 hover:bg-sky-800/40 border-transparent'
                  }`}
                  title="Movies & Entertainment"
                >
                  <Film className="w-5 h-5" />
                </button>

                {/* Tools & Utilities */}
                <button
                  onClick={() => {
                    playTouchTone(560);
                    setActiveCategory('tools');
                  }}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                    activeCategory === 'tools'
                      ? 'bg-gradient-to-b from-sky-400 to-blue-600 text-white border-white shadow-md'
                      : 'text-sky-300 hover:bg-sky-800/40 border-transparent'
                  }`}
                  title="Controls & Tools"
                >
                  <Wrench className="w-5 h-5" />
                </button>

                {/* Flight Info & Map */}
                <button
                  onClick={() => {
                    playTouchTone(600);
                    setActiveCategory('info');
                  }}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                    activeCategory === 'info'
                      ? 'bg-gradient-to-b from-sky-400 to-blue-600 text-white border-white shadow-md'
                      : 'text-sky-300 hover:bg-sky-800/40 border-transparent'
                  }`}
                  title="Flight Info"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>

              {/* MOVIES & MEDIA SPOTLIGHT VIEW (Replicating exact layout from picture) */}
              {activeCategory === 'movies' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
                  
                  {/* LEFT COLUMN: MOVIE POSTER & METADATA (Span 5) */}
                  <div className="md:col-span-5 bg-slate-950/70 p-3 rounded-2xl border border-sky-400/25 flex flex-col justify-between">
                    <div>
                      {/* Movie Poster Image */}
                      <div className="relative rounded-xl overflow-hidden border border-sky-300/40 shadow-lg mb-3 h-52 group">
                        <img
                          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600"
                          alt="The Visitation"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                          <span className="px-2 py-0.5 bg-sky-500 text-white text-[10px] font-bold rounded">
                            HD IN-FLIGHT
                          </span>
                        </div>
                      </div>

                      {/* Title & Star Rating */}
                      <h3 className="font-black text-base uppercase text-sky-100 tracking-wide mb-1">
                        THE VISITATION
                      </h3>
                      
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-300" />
                        ))}
                        <span className="text-xs font-bold text-amber-300 ml-1">5.0</span>
                      </div>

                      {/* Movie Metadata Table */}
                      <div className="space-y-1 text-[11px] font-sans text-sky-200/90 border-t border-sky-400/20 pt-2">
                        <p><strong className="text-sky-300">{t.genre || 'Genre'}:</strong> Action, Drama, and Thriller</p>
                        <p><strong className="text-sky-300">{t.rating || 'Rating'}:</strong> R (In-Flight Edit)</p>
                        <p><strong className="text-sky-300">{t.duration || 'Duration'}:</strong> 1hr 28m</p>
                        <p className="line-clamp-2"><strong className="text-sky-300">{t.cast || 'Cast'}:</strong> Frank, Oscar Torres, Wolfgang Bodison, Dave Kalu</p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: VIDEO PLAYER & SYNOPSIS & GLOSSY BUTTONS (Span 7) */}
                  <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                    
                    {/* VIDEO PLAYER SCREEN BOX */}
                    <div className="relative bg-black rounded-2xl border border-sky-400/40 p-2 shadow-xl flex flex-col overflow-hidden h-52 justify-between">
                      {/* Video Title Header */}
                      <div className="flex items-center justify-between text-xs font-mono text-sky-200 z-10 px-2 py-1 bg-black/60 rounded">
                        <span>The Visitation - Trailer</span>
                        <Maximize2 className="w-3.5 h-3.5 text-sky-400 cursor-pointer" />
                      </div>

                      {/* Video Artwork Thumbnail + Play Trigger */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src="https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800"
                          alt="Trailer Screen"
                          className="w-full h-full object-cover opacity-60"
                        />
                        
                        <button
                          onClick={handleWatchNow}
                          className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-400 via-blue-500 to-sky-300 border-2 border-white flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.8)] cursor-pointer hover:scale-110 active:scale-95 transition-all z-20"
                        >
                          {isPlaying ? (
                            <Pause className="w-7 h-7 text-white" />
                          ) : (
                            <Play className="w-7 h-7 text-white fill-white ml-1" />
                          )}
                        </button>
                      </div>

                      {/* Bottom Player Scrub Bar Controls */}
                      <div className="z-10 bg-black/80 p-2 rounded flex items-center gap-3 text-xs text-sky-200">
                        <button onClick={() => setIsMuted(!isMuted)}>
                          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-sky-300" />}
                        </button>
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-sky-400/30">
                          <div className={`h-full bg-gradient-to-r from-sky-400 to-blue-500 ${isPlaying ? 'w-2/3 animate-pulse' : 'w-1/3'}`} />
                        </div>
                        <span className="font-mono text-[10px]">0:48 / 1:28</span>
                      </div>
                    </div>

                    {/* SYNOPSIS DESCRIPTION */}
                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-sky-400/20 text-xs text-sky-100/90 leading-relaxed font-sans">
                      <strong className="text-sky-300 block mb-1 uppercase tracking-wide font-mono text-[11px]">
                        {t.synopsis || 'Synopsis'}
                      </strong>
                      Frank Rivera is a self-made man who escaped hardships to build a thriving enterprise. But when high-stakes intrigue threatens his legacy, he relies on swift resolve to protect his family and aircraft fleet.
                    </div>

                    {/* GLOSSY FRUTIGER AERO ACTION BUTTONS (Matching image style) */}
                    <div className="flex items-center justify-end gap-3 pt-1">
                      {/* WATCH NOW BUTTON */}
                      <button
                        onClick={handleWatchNow}
                        className="relative px-6 py-2.5 rounded-xl bg-gradient-to-b from-sky-400 via-blue-600 to-blue-800 border-2 border-sky-200 text-white font-extrabold text-xs tracking-wider shadow-[0_5px_20px_rgba(2,132,199,0.5)] hover:from-sky-300 hover:to-blue-500 active:scale-95 transition-all cursor-pointer overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/30 pointer-events-none rounded-t-lg" />
                        <span className="drop-shadow relative z-10">{t.watchNow || 'Watch Now'}</span>
                      </button>

                      {/* REMIND ME BUTTON */}
                      <button
                        onClick={handleRemindMe}
                        className="relative px-6 py-2.5 rounded-xl bg-gradient-to-b from-sky-500 via-blue-700 to-indigo-900 border-2 border-sky-300 text-sky-100 font-extrabold text-xs tracking-wider shadow-[0_5px_20px_rgba(30,58,138,0.5)] hover:from-sky-400 hover:to-blue-600 active:scale-95 transition-all cursor-pointer overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 pointer-events-none rounded-t-lg" />
                        <span className="drop-shadow relative z-10">{t.remindMe || 'Remind Me'}</span>
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* OTHER CATEGORIES: DINING, TOOLS, INFO */}
              {activeCategory === 'dining' && (
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-sky-400/30 space-y-3">
                  <h3 className="font-bold text-sm text-sky-200 uppercase">In-Flight Catering & Bar</h3>
                  <p className="text-xs text-sky-300/80">Order complimentary beverages, gourmet snacks, and chef presets right to seat 12A.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-sky-950/50 rounded-xl border border-sky-400/20 text-xs font-bold text-white">Espresso & Cappuccino</div>
                    <div className="p-3 bg-sky-950/50 rounded-xl border border-sky-400/20 text-xs font-bold text-white">Gourmet Cheese Platter</div>
                  </div>
                </div>
              )}

              {activeCategory === 'tools' && (
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-sky-400/30 space-y-3">
                  <h3 className="font-bold text-sm text-sky-200 uppercase">Cabin & Utility Controls</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => showToast('Reading Light', 'Toggled seat reading light', 'info')} className="p-3 bg-sky-900/40 hover:bg-sky-700/50 rounded-xl border border-sky-400/30 text-xs font-bold">Reading Light</button>
                    <button onClick={() => showToast('Attendant Call', 'Flight attendant notified', 'info')} className="p-3 bg-sky-900/40 hover:bg-sky-700/50 rounded-xl border border-sky-400/30 text-xs font-bold">Attendant Call</button>
                    <button onClick={() => showToast('Headphones', 'Audio spatial boost enabled', 'info')} className="p-3 bg-sky-900/40 hover:bg-sky-700/50 rounded-xl border border-sky-400/30 text-xs font-bold">Headphones</button>
                  </div>
                </div>
              )}

              {activeCategory === 'info' && (
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-sky-400/30 space-y-2 text-xs">
                  <h3 className="font-bold text-sm text-sky-200 uppercase">Flight Telemetry Progress</h3>
                  <div className="flex justify-between font-mono text-sky-300">
                    <span>Departure: LHR (London)</span>
                    <span>Destination: JFK (New York)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full border border-sky-400/40 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 w-2/3" />
                  </div>
                </div>
              )}

            </main>

          </div>

        </div>

      </div>
    </div>
  );
};
