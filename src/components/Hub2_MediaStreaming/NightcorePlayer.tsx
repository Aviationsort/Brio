/**
 * Media Player: Music / Video with Nightcore Pitch & Visualizer
 * Supports local files and YouTube embeds
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
  Globe2,
  Search,
  Compass,
  Signal,
  RotateCw,
  Activity,
  ShieldCheck,
  Disc,
  Youtube,
  Video,
  Monitor,
  Maximize2,
} from 'lucide-react';

interface MediaSource {
  id: string;
  name: string;
  type: 'local' | 'youtube' | 'stream';
  url: string;
  thumbnail?: string;
}

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;

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

  const [mediaType, setMediaType] = useState<'audio' | 'video'>('audio');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [customStreamUrl, setCustomStreamUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showYouTubeInput, setShowYouTubeInput] = useState(false);
  const [showStreamInput, setShowStreamInput] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Nightcore pitch shift effect
  useEffect(() => {
    const el = mediaType === 'audio' ? audioRef.current : videoRef.current;
    if (el && mediaType === 'audio') {
      (el as HTMLAudioElement).playbackRate = nightcorePitch;
      if ('preservesPitch' in el) {
        (el as HTMLAudioElement & { preservesPitch: boolean }).preservesPitch = false;
      }
    }
  }, [nightcorePitch, mediaType]);

  // Audio Canvas Visualizer Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 32;
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
    if (mediaType === 'audio' && audioRef.current) {
      if (isPlayingMusic) {
        audioRef.current.pause();
        setIsPlayingMusic(false);
      } else {
        audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {
          showToast('Playback Notice', 'Unable to start audio playback', 'info');
        });
      }
    } else if (mediaType === 'video' && videoRef.current) {
      if (isPlayingMusic) {
        videoRef.current.pause();
        setIsPlayingMusic(false);
      } else {
        videoRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {
          showToast('Playback Notice', 'Unable to start video playback', 'info');
        });
      }
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(YOUTUBE_REGEX);
    return match ? match[4] : null;
  };

  const handleYouTubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    const youtubeId = extractYouTubeId(youtubeUrl.trim());
    if (!youtubeId) {
      showToast('Invalid URL', 'Please enter a valid YouTube video URL', 'error');
      return;
    }

    const track: MediaTrack = {
      id: `yt-${Date.now()}`,
      title: `YouTube Video (${youtubeId})`,
      artist: 'YouTube',
      coverUrl: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
      audioUrl: `https://www.youtube.com/embed/${youtubeId}`,
      durationSeconds: 0,
      isYoutube: true,
      youtubeId,
    };

    setCurrentTrack(track);
    setIsPlayingMusic(false);
    setMediaType('video');
    setShowYouTubeInput(false);
    setYoutubeUrl('');
    showToast('YouTube Loaded', 'Video ready for playback', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');

    const track: MediaTrack = {
      id: `local-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local Media',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
      audioUrl: fileUrl,
      durationSeconds: 0,
      isYoutube: false,
    };

    setCurrentTrack(track);
    setMediaType(isVideo ? 'video' : 'audio');
    setIsPlayingMusic(false);
    showToast('Media Loaded', `Loaded ${file.name}`, 'success');
  };

  const handleCustomStreamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStreamUrl.trim()) return;

    const track: MediaTrack = {
      id: `stream-${Date.now()}`,
      title: 'Custom Stream',
      artist: customStreamUrl,
      coverUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&h=300&fit=crop',
      audioUrl: customStreamUrl,
      durationSeconds: 0,
      isYoutube: false,
    };

    setCurrentTrack(track);
    setMediaType('audio');
    setIsPlayingMusic(false);
    setCustomStreamUrl('');
    setShowStreamInput(false);
    showToast('Stream Connected', 'Custom stream loaded', 'success');
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const isYouTube = currentTrack?.isYoutube;
  const youtubeId = currentTrack?.youtubeId;

  return (
    <div className="space-y-6">
      {/* Hidden Audio Player */}
      {currentTrack && mediaType === 'audio' && (
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl}
          onEnded={() => setIsPlayingMusic(false)}
        />
      )}

      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-2xl text-cyan-400">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Media Player</h3>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono rounded flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" /> Nightcore Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Music & Video player with local files, YouTube, and nightcore pitch shifter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMediaType('audio')}
            className={`liquid-glass-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mediaType === 'audio'
                ? 'bg-cyan-500 text-black shadow-lg'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Music className="w-3.5 h-3.5 inline mr-1" /> Audio
          </button>
          <button
            onClick={() => setMediaType('video')}
            className={`liquid-glass-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mediaType === 'video'
                ? 'bg-purple-500 text-black shadow-lg'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Video className="w-3.5 h-3.5 inline mr-1" /> Video
          </button>
        </div>
      </div>

      {/* Main Player Display */}
      <div ref={playerContainerRef} className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 border-2 border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Cover Art & Visualizer */}
          <div className="flex flex-col items-center">
            <div className="relative group w-44 h-44 rounded-2xl overflow-hidden shadow-2xl border border-cyan-400/30 mb-3 bg-black">
              {currentTrack ? (
                <>
                  {isYouTube && youtubeId ? (
                    <img
                      src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                      alt="YouTube Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={currentTrack.coverUrl}
                      alt="Cover"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
                    <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded-md border border-cyan-500/40 w-max">
                      {mediaType.toUpperCase()}
                    </span>
                    <span className="text-xs font-extrabold text-white truncate mt-1">
                      {currentTrack.title}
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <Monitor className="w-16 h-16" />
                </div>
              )}
            </div>

            <canvas ref={canvasRef} width={200} height={36} className="w-44 h-9 rounded-lg bg-black/60 border border-cyan-500/20" />
          </div>

          {/* Player Controls */}
          <div className="lg:col-span-2 space-y-4">
            {/* Now Playing Info */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">
                  {currentTrack ? currentTrack.title : 'No Media Loaded'}
                </h4>
                <p className="text-xs text-slate-400">
                  {currentTrack ? currentTrack.artist : 'Load a file or paste a URL to begin'}
                </p>
              </div>
              {currentTrack && (
                <button
                  onClick={toggleFullscreen}
                  className="liquid-glass-btn p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
                  title="Toggle Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Media Display Area */}
            <div className="bg-black rounded-2xl overflow-hidden border border-slate-800 min-h-[200px] flex items-center justify-center">
              {currentTrack ? (
                isYouTube && youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isPlayingMusic ? 1 : 0}&rel=0`}
                    title="YouTube Video"
                    className="w-full aspect-video max-h-[400px]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : mediaType === 'video' ? (
                  <video
                    ref={videoRef}
                    controls
                    autoPlay={isPlayingMusic}
                    className="w-full max-h-[400px] object-contain"
                    src={currentTrack.audioUrl}
                    onPlay={() => setIsPlayingMusic(true)}
                    onPause={() => setIsPlayingMusic(false)}
                    onEnded={() => setIsPlayingMusic(false)}
                  />
                ) : (
                  <audio
                    ref={audioRef}
                    controls
                    autoPlay={isPlayingMusic}
                    className="w-full"
                    src={currentTrack.audioUrl}
                    onPlay={() => setIsPlayingMusic(true)}
                    onPause={() => setIsPlayingMusic(false)}
                    onEnded={() => setIsPlayingMusic(false)}
                  />
                )
              ) : (
                <div className="text-center text-slate-500 p-8 space-y-3">
                  <Upload className="w-12 h-12 mx-auto text-slate-600" />
                  <p className="text-sm font-mono">Load local media or paste a URL</p>
                </div>
              )}
            </div>

            {/* Play Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={togglePlay}
                disabled={!currentTrack}
                className="liquid-glass-btn px-8 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:scale-105 text-white font-black text-sm rounded-2xl shadow-xl shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPlayingMusic ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isPlayingMusic ? 'Pause' : 'Play'}</span>
              </button>
            </div>

            {/* Nightcore Speed / Pitch Shift Controls */}
            <div className="bg-slate-950/60 border border-purple-500/20 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-pink-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Nightcore Speed / Pitch ({nightcorePitch.toFixed(2)}x)
                </span>
                <span className="text-[10px] text-slate-400">0.80x Slow ➔ 1.50x Fast</span>
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
          </div>
        </div>
      </div>

      {/* Source Selection & Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Local File Upload */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Local Media</span>
          </h4>
          <label className="flex items-center justify-center gap-2 p-4 bg-slate-950 border border-dashed border-slate-700 hover:border-cyan-400 rounded-xl text-xs text-slate-300 cursor-pointer transition-colors">
            <Music className="w-4 h-4 text-cyan-400" />
            <span>Choose Audio or Video File...</span>
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* YouTube Input */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Youtube className="w-4 h-4 text-red-400" />
            <span>YouTube Video</span>
          </h4>
          {!showYouTubeInput ? (
            <button
              onClick={() => setShowYouTubeInput(true)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Youtube className="w-4 h-4" /> Paste YouTube URL
            </button>
          ) : (
            <form onSubmit={handleYouTubeSubmit} className="space-y-2">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 placeholder-slate-600"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!youtubeUrl.trim()}
                  className="liquid-glass-btn flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  Load Video
                </button>
                <button
                  type="button"
                  onClick={() => { setShowYouTubeInput(false); setYoutubeUrl(''); }}
                  className="liquid-glass-btn px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Custom Stream URL */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-cyan-400" />
            <span>Stream URL</span>
          </h4>
          {!showStreamInput ? (
            <button
              onClick={() => setShowStreamInput(true)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Globe2 className="w-4 h-4" /> Paste Stream URL
            </button>
          ) : (
            <form onSubmit={handleCustomStreamSubmit} className="space-y-2">
              <input
                type="text"
                value={customStreamUrl}
                onChange={(e) => setCustomStreamUrl(e.target.value)}
                placeholder="https://example.com/stream.mp3"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!customStreamUrl.trim()}
                  className="liquid-glass-btn flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  Load Stream
                </button>
                <button
                  type="button"
                  onClick={() => { setShowStreamInput(false); setCustomStreamUrl(''); }}
                  className="liquid-glass-btn px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
