/**
 * FM/AM Radio & Live Media Tuner with Nightcore Pitch & Visualizer
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaTrack } from '../../types';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Upload,
  Music,
  Sliders,
  Volume2,
  Sparkles,
  Radio,
  Globe2,
  Search,
  Compass,
  Signal,
  RotateCw,
  Activity,
  ShieldCheck,
  Disc,
} from 'lucide-react';

interface RadioStation {
  id: string;
  name: string;
  frequency: string; // e.g., "99.1 MHz" or "1020 kHz"
  band: 'FM' | 'AM';
  region: string;
  flag: string;
  genre: string;
  streamUrl: string;
  logoUrl: string;
  bitrate: string;
}

const REGIONAL_STATIONS: RadioStation[] = [
  // Middle East & Levant
  {
    id: 'rad-lb-1',
    name: 'Radio One Lebanon',
    frequency: '105.5 MHz',
    band: 'FM',
    region: 'Middle East',
    flag: '🇱🇧',
    genre: 'Top 40 & Pop Hits',
    streamUrl: 'https://stream.radioone.fm/radioone',
    logoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&h=150&fit=crop',
    bitrate: '320 kbps',
  },
  {
    id: 'rad-lb-2',
    name: 'Virgin Radio Lebanon',
    frequency: '89.5 MHz',
    band: 'FM',
    region: 'Middle East',
    flag: '🇱🇧',
    genre: 'Commercial & Dance',
    streamUrl: 'https://virgin.streamguys1.com/virginlebanon',
    logoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&h=150&fit=crop',
    bitrate: '256 kbps',
  },
  {
    id: 'rad-cy-1',
    name: 'Cyprus Hits Live FM',
    frequency: '92.4 MHz',
    band: 'FM',
    region: 'Middle East',
    flag: '🇨🇾',
    genre: 'Greek & International',
    streamUrl: 'https://s2.stationplaylist.com/cyprushits',
    logoUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop',
    bitrate: '192 kbps',
  },
  {
    id: 'rad-ae-1',
    name: 'Dubai Eye AM News & Talk',
    frequency: '1038 kHz',
    band: 'AM',
    region: 'Middle East',
    flag: '🇦🇪',
    genre: 'News & Talk',
    streamUrl: 'https://arn.streamguys1.com/dubaieye',
    logoUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=150&h=150&fit=crop',
    bitrate: '128 kbps',
  },

  // Europe
  {
    id: 'rad-eu-1',
    name: 'BBC Radio 1 London',
    frequency: '98.8 MHz',
    band: 'FM',
    region: 'Europe',
    flag: '🇬🇧',
    genre: 'Indie & Contemporary',
    streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
    logoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&h=150&fit=crop',
    bitrate: '320 kbps',
  },
  {
    id: 'rad-eu-2',
    name: 'NRJ FM Paris',
    frequency: '100.3 MHz',
    band: 'FM',
    region: 'Europe',
    flag: '🇫🇷',
    genre: 'French Electro & Pop',
    streamUrl: 'https://cdn.nrjaudio.fm/audio/1/fr/30001/mp3_128.mp3',
    logoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&h=150&fit=crop',
    bitrate: '128 kbps',
  },
  {
    id: 'rad-eu-3',
    name: 'Antenne Bayern Synthwave',
    frequency: '101.3 MHz',
    band: 'FM',
    region: 'Europe',
    flag: '🇩🇪',
    genre: 'Chill Synth & Beats',
    streamUrl: 'https://stream.antenne.de/chillout',
    logoUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop',
    bitrate: '256 kbps',
  },

  // North America
  {
    id: 'rad-us-1',
    name: 'KEXP 90.3 Seattle FM',
    frequency: '90.3 MHz',
    band: 'FM',
    region: 'North America',
    flag: '🇺🇸',
    genre: 'Alternative & Electronic',
    streamUrl: 'https://kexp-mp3-128.streamguys1.com/kexp128.mp3',
    logoUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=150&h=150&fit=crop',
    bitrate: '256 kbps',
  },
  {
    id: 'rad-us-2',
    name: 'WNYC Public Radio AM',
    frequency: '820 kHz',
    band: 'AM',
    region: 'North America',
    flag: '🇺🇸',
    genre: 'Global News & Talk',
    streamUrl: 'https://fm939.wnyc.org/wnyc-app',
    logoUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=150&h=150&fit=crop',
    bitrate: '128 kbps',
  },

  // Asia Pacific
  {
    id: 'rad-jp-1',
    name: 'Tokyo J-Pop Synth Radio',
    frequency: '81.3 MHz',
    band: 'FM',
    region: 'Asia Pacific',
    flag: '🇯🇵',
    genre: 'J-Pop & Anime Synth',
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=nightcore-style-beat-11234.mp3',
    logoUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&h=150&fit=crop',
    bitrate: '320 kbps',
  },
];

export const NightcorePlayer: React.FC = () => {
  const {
    currentTrack,
    setCurrentTrack,
    isPlayingMusic,
    setIsPlayingMusic,
    nightcorePitch,
    setNightcorePitch,
    showToast,
    t,
  } = useApp();

  // Tuner State
  const [selectedRegion, setSelectedRegion] = useState<string>('Middle East');
  const [activeBand, setActiveBand] = useState<'FM' | 'AM'>('FM');
  const [fmFrequency, setFmFrequency] = useState<number>(105.5); // MHz
  const [amFrequency, setAmFrequency] = useState<number>(1020); // kHz
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(REGIONAL_STATIONS[0]);
  const [isSeeking, setIsSeeking] = useState(false);
  const [bassBoost, setBassBoost] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [customAudioUrl, setCustomAudioUrl] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto detect user region on load
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('Europe')) setSelectedRegion('Europe');
      else if (tz.includes('America')) setSelectedRegion('North America');
      else if (tz.includes('Asia/Tokyo') || tz.includes('Asia/Singapore')) setSelectedRegion('Asia Pacific');
      else setSelectedRegion('Middle East');
    } catch {
      setSelectedRegion('Middle East');
    }
  }, []);

  // Nightcore pitch shift effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = nightcorePitch;
      if ('preservesPitch' in audioRef.current) {
        (audioRef.current as HTMLAudioElement & { preservesPitch: boolean }).preservesPitch = false;
      }
    }
  }, [nightcorePitch]);

  // Audio Canvas Visualizer Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 28;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const height = isPlayingMusic ? Math.random() * (canvas.height * 0.8) + 8 : 3;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(1, '#ec4899');

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height);
      }
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlayingMusic]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => {
          showToast('Stream Connection Notice', 'Connecting to live radio relay station...', 'info');
        });
    }
  };

  const tuneToStation = (station: RadioStation) => {
    setCurrentStation(station);
    setActiveBand(station.band);
    if (station.band === 'FM') {
      const freq = parseFloat(station.frequency);
      if (!isNaN(freq)) setFmFrequency(freq);
    } else {
      const freq = parseInt(station.frequency);
      if (!isNaN(freq)) setAmFrequency(freq);
    }

    // Convert station to media track
    const track: MediaTrack = {
      id: station.id,
      title: `${station.flag} ${station.name} (${station.frequency})`,
      artist: `${station.genre} • ${station.region}`,
      coverUrl: station.logoUrl,
      audioUrl: station.streamUrl,
      durationSeconds: 0,
    };

    setCurrentTrack(track);
    setIsPlayingMusic(false);
    showToast('Radio Station Locked', `Tuned to ${station.name} on ${station.frequency}`, 'success');
  };

  const handleSeekAutoScan = () => {
    setIsSeeking(true);
    showToast('Auto Scan Active', 'Scanning FM/AM frequency spectrum for active signal...', 'info');

    setTimeout(() => {
      const available = REGIONAL_STATIONS.filter(
        (s) => s.region === selectedRegion && s.band === activeBand
      );
      if (available.length > 0) {
        const randomStation = available[Math.floor(Math.random() * available.length)];
        tuneToStation(randomStation);
      }
      setIsSeeking(false);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const customTrack: MediaTrack = {
      id: `custom-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local Media Audio File',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
      audioUrl: fileUrl,
      durationSeconds: 180,
    };

    setCurrentTrack(customTrack);
    setCurrentStation(null);
    setIsPlayingMusic(false);
    showToast('Media Track Loaded', `Loaded ${file.name} into tuner deck`, 'success');
  };

  const handleCustomStreamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAudioUrl.trim()) return;

    const customTrack: MediaTrack = {
      id: `stream-${Date.now()}`,
      title: 'Custom Stream Relay',
      artist: customAudioUrl,
      coverUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&h=300&fit=crop',
      audioUrl: customAudioUrl,
      durationSeconds: 0,
    };

    setCurrentTrack(customTrack);
    setCurrentStation(null);
    setIsPlayingMusic(false);
    setCustomAudioUrl('');
    showToast('Custom Stream Relay Connected', 'Stream ready on audio deck', 'success');
  };

  const filteredStations = REGIONAL_STATIONS.filter((st) => {
    const matchesRegion = selectedRegion === 'Global' || st.region === selectedRegion;
    const matchesBand = st.band === activeBand;
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.frequency.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRegion && matchesBand && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hidden Audio Player */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl}
          onEnded={() => setIsPlayingMusic(false)}
        />
      )}

      {/* FM/AM REGIONAL RADIO TUNER HEADER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-2xl text-cyan-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Live FM/AM Regional Radio Tuner</h3>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono rounded flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" /> Regional Geo-Tuner
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live FM/AM frequency spectrum tuner with regional stream relays & Nightcore pitch shifter
            </p>
          </div>
        </div>

        {/* Region Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto max-w-full no-scrollbar">
          {['Middle East', 'Europe', 'North America', 'Asia Pacific', 'Global'].map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`liquid-glass-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedRegion === reg
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* ANALOG TUNER DECK DISPLAY */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 border-2 border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Cover / Logo & Frequency Visualizer */}
          <div className="flex flex-col items-center">
            <div className="relative group w-44 h-44 rounded-2xl overflow-hidden shadow-2xl border border-cyan-400/30 mb-3 bg-black">
              <img
                src={
                  currentStation?.logoUrl ||
                  currentTrack?.coverUrl ||
                  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop'
                }
                alt="Station Logo"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
                <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded-md border border-cyan-500/40 w-max">
                  {activeBand}: {activeBand === 'FM' ? `${fmFrequency.toFixed(1)} MHz` : `${amFrequency} kHz`}
                </span>
                <span className="text-xs font-extrabold text-white truncate mt-1">
                  {currentStation?.name || currentTrack?.title || 'Frequency Deck'}
                </span>
              </div>
            </div>

            <canvas ref={canvasRef} width={200} height={36} className="w-44 h-9 rounded-lg bg-black/60 border border-cyan-500/20" />
          </div>

          {/* Tuner Controls & Dial Slider */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveBand('FM')}
                  className={`liquid-glass-btn px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    activeBand === 'FM'
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  FM BAND
                </button>
                <button
                  onClick={() => setActiveBand('AM')}
                  className={`liquid-glass-btn px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    activeBand === 'AM'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  AM BAND
                </button>
              </div>

              <button
                onClick={handleSeekAutoScan}
                disabled={isSeeking}
                className="liquid-glass-btn px-3 py-1 bg-cyan-950 border border-cyan-400/40 text-cyan-300 hover:text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSeeking ? 'animate-spin text-amber-400' : ''}`} />
                <span>{isSeeking ? 'Scanning...' : 'Auto Seek Station'}</span>
              </button>
            </div>

            {/* FREQUENCY SPECTRUM SLIDER */}
            <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Signal className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Frequency Signal Lock:
                </span>
                <span className="text-white font-extrabold text-sm">
                  {activeBand === 'FM' ? `${fmFrequency.toFixed(1)} MHz` : `${amFrequency} kHz`}
                </span>
              </div>

              <input
                type="range"
                min={activeBand === 'FM' ? 87.5 : 530}
                max={activeBand === 'FM' ? 108.0 : 1700}
                step={activeBand === 'FM' ? 0.1 : 10}
                value={activeBand === 'FM' ? fmFrequency : amFrequency}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (activeBand === 'FM') setFmFrequency(val);
                  else setAmFrequency(val);
                }}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>{activeBand === 'FM' ? '87.5 MHz' : '530 kHz'}</span>
                <span>{activeBand === 'FM' ? '98.0 MHz' : '1000 kHz'}</span>
                <span>{activeBand === 'FM' ? '108.0 MHz' : '1700 kHz'}</span>
              </div>
            </div>

            {/* Nightcore Speed / Pitch Shift Controls */}
            <div className="bg-slate-950/60 border border-purple-500/20 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-pink-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> {t.nightcore || 'Nightcore Engine'} {t.speedPitch || 'Speed / Pitch'} ({nightcorePitch.toFixed(2)}x)
                </span>
                <span className="text-[10px] text-slate-400">1.00x Normal ➔ 1.25x Nightcore</span>
              </div>

              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={nightcorePitch}
                onChange={(e) => setNightcorePitch(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Main Play / Tuning Button Bar */}
            <div className="flex items-center justify-center gap-4 pt-1">
              <button
                onClick={togglePlay}
                className="liquid-glass-btn px-8 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:scale-105 text-white font-black text-sm rounded-2xl shadow-xl shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isPlayingMusic ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isPlayingMusic ? 'Mute Radio Stream' : 'Tune & Stream Live'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REGIONAL STATIONS LIST & INPUTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Stations Directory */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <span>{selectedRegion} Regional Directory ({filteredStations.length})</span>
            </h4>

            {/* Search Bar */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter stations or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {filteredStations.map((st) => {
              const isActive = currentStation?.id === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => tuneToStation(st)}
                  className={`liquid-glass-btn p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400/50'
                      : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{st.flag}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-white truncate">{st.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {st.frequency} • {st.genre}
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                      TUNED
                    </span>
                  ) : (
                    <Disc className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Audio & Stream Relay Inputs */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-purple-400" />
              <span>Upload Local MP3 Track</span>
            </h4>
            <label className="flex items-center justify-center gap-2 p-3 bg-slate-950 border border-dashed border-slate-700 hover:border-cyan-400 rounded-xl text-xs text-slate-300 cursor-pointer transition-colors">
              <Music className="w-4 h-4 text-cyan-400" />
              <span>Choose Audio File...</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <form onSubmit={handleCustomStreamSubmit} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Custom Audio Stream URL</span>
            </h4>
            <input
              type="text"
              value={customAudioUrl}
              onChange={(e) => setCustomAudioUrl(e.target.value)}
              placeholder="Paste direct audio stream URL (MP3/AAC)..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 placeholder-slate-600"
            />
            <button
              type="submit"
              disabled={!customAudioUrl.trim()}
              className="liquid-glass-btn w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              Relay Custom Stream
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
