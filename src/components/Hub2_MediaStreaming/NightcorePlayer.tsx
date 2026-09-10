/**
 * Media Player: Music / Video with Nightcore Pitch, Visualizer, Playlist, Lyrics, and more
 * Supports local files, YouTube embeds, and custom stream URLs
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaTrack, PlaybackMode } from '../../types';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Upload,
  Music,
  Sliders,
  Volume2,
  VolumeX,
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
  Minimize2,
  ListMusic,
  Repeat,
  Repeat1,
  Shuffle,
  Timer,
  Gauge,
  FileAudio,
  Mic2,
  Type,
  ChevronDown,
  X,
  Plus,
  Trash2,
  Volume1,
} from 'lucide-react';

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;

const BARS = 64;

const EQ_BANDS = [
  { freq: 60, label: '60' },
  { freq: 170, label: '170' },
  { freq: 310, label: '310' },
  { freq: 600, label: '600' },
  { freq: 1000, label: '1k' },
  { freq: 3000, label: '3k' },
  { freq: 6000, label: '6k' },
  { freq: 12000, label: '12k' },
  { freq: 14000, label: '14k' },
  { freq: 16000, label: '16k' },
] as const;

type EqPreset = 'flat' | 'rock' | 'pop' | 'jazz' | 'classical' | 'bass-boost' | 'treble-boost';

const EQ_PRESETS: Record<EqPreset, number[]> = {
  flat:       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  rock:       [5, 4, 2, 0, -2, -1, 2, 4, 5, 5],
  pop:       [-1, 1, 3, 4, 3, 0, -1, -1, 0, 1],
  jazz:      [3, 2, 0, 3, -1, -2, 0, 2, 3, 3],
  classical: [4, 3, 2, 1, -1, -1, 0, 2, 3, 4],
  'bass-boost': [8, 7, 5, 2, 0, 0, 0, 0, 0, 0],
  'treble-boost': [0, 0, 0, 0, 0, 2, 4, 6, 7, 7],
};

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getFileFormat = (file?: File): string | undefined => {
  if (!file) return undefined;
  const ext = file.name.split('.').pop()?.toLowerCase();
  const formats: Record<string, string> = {
    mp3: 'MP3',
    wav: 'WAV',
    flac: 'FLAC',
    aac: 'AAC',
    ogg: 'OGG',
    m4a: 'M4A',
    webm: 'WebM',
    mp4: 'MP4',
    mkv: 'MKV',
    avi: 'AVI',
    mov: 'MOV',
    wmv: 'WMV',
  };
  return ext ? formats[ext] || ext.toUpperCase() : undefined;
};

const hashColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 60%, 40%)`;
};

export const NightcorePlayer: React.FC = () => {
  const { currentTrack, setCurrentTrack, isPlayingMusic, setIsPlayingMusic, nightcorePitch, setNightcorePitch, showToast, t } = useApp();

  const [mediaType, setMediaType] = useState<'audio' | 'video'>('audio');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [customStreamUrl, setCustomStreamUrl] = useState('');
  const [showYouTubeInput, setShowYouTubeInput] = useState(false);
  const [showStreamInput, setShowStreamInput] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);

  const [playlist, setPlaylist] = useState<MediaTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('sequential');
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);

  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const [skipSilence, setSkipSilence] = useState(false);
  const [skipSilenceThreshold, setSkipSilenceThreshold] = useState(0.02);
  const [isSkippingSilence, setIsSkippingSilence] = useState(false);

  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(30);

  const [lyrics, setLyrics] = useState<string>('');
  const [showLyrics, setShowLyrics] = useState(false);
  const [audioFormat, setAudioFormat] = useState<string>('');
  const [fileSize, setFileSize] = useState<number | undefined>(undefined);
  const [isDragOver, setIsDragOver] = useState(false);
  const [coverRotating, setCoverRotating] = useState(false);

  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(BARS).fill(0));
  const [waveformData, setWaveformData] = useState<number[]>(new Array(100).fill(0));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);
  const elapsedIntervalRef = useRef<number | null>(null);
  const silenceCheckIntervalRef = useRef<number | null>(null);
  const sleepTimerRef = useRef<number | null>(null);

  const currentTrackRef = useRef<MediaTrack | null>(null);
  const mediaElementRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);

  const [eqBands, setEqBands] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('brio_eq_bands');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [...EQ_PRESETS.flat];
  });
  const [bassBoost, setBassBoost] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('brio_bass_boost');
      if (saved) return Number(saved);
    } catch { /* ignore */ }
    return 0;
  });
  const [eqPreset, setEqPreset] = useState<EqPreset>(() => {
    try {
      const saved = localStorage.getItem('brio_eq_preset');
      if (saved && saved in EQ_PRESETS) return saved as EqPreset;
    } catch { /* ignore */ }
    return 'flat';
  });
  const [showEqPanel, setShowEqPanel] = useState(false);

  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const eqGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  const getMediaElement = useCallback((): HTMLAudioElement | HTMLVideoElement | null => {
    if (mediaType === 'audio') return audioRef.current;
    if (mediaType === 'video') return videoRef.current;
    return null;
  }, [mediaType]);

  const setupAudioAnalyser = useCallback((element: HTMLAudioElement | HTMLVideoElement) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;

    if (eqFiltersRef.current.length === 0) {
      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 200;
      bass.gain.value = bassBoost;
      bassFilterRef.current = bass;

      const bands: BiquadFilterNode[] = [];
      for (let i = 0; i < EQ_BANDS.length; i++) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = EQ_BANDS[i].freq;
        filter.Q.value = 1.4;
        filter.gain.value = eqBands[i] ?? 0;
        bands.push(filter);
      }
      eqFiltersRef.current = bands;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 1;
      eqGainRef.current = masterGain;
    }

    if (sourceRef.current) {
      try { sourceRef.current.disconnect(); } catch (e) { /* ignore */ }
    }
    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
    }

    try {
      sourceRef.current = ctx.createMediaElementSource(element);
      let node: AudioNode = sourceRef.current;
      if (bassFilterRef.current) {
        node.connect(bassFilterRef.current);
        node = bassFilterRef.current;
      }
      for (const filter of eqFiltersRef.current) {
        node.connect(filter);
        node = filter;
      }
      if (eqGainRef.current) {
        node.connect(eqGainRef.current);
        node = eqGainRef.current;
      }
      node.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);
    } catch (e) {
      // Source already connected
    }
  }, [eqBands, bassBoost]);

  const updateEqFilters = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    for (let i = 0; i < eqFiltersRef.current.length && i < eqBands.length; i++) {
      eqFiltersRef.current[i].gain.value = eqBands[i];
    }
    if (bassFilterRef.current) {
      bassFilterRef.current.gain.value = bassBoost;
    }
  }, [eqBands, bassBoost]);

  useEffect(() => {
    updateEqFilters();
  }, [eqBands, bassBoost, updateEqFilters]);

  useEffect(() => {
    const el = getMediaElement();
    if (el && audioContextRef.current && eqFiltersRef.current.length > 0) {
      if (sourceRef.current) {
        try { sourceRef.current.disconnect(); } catch (e) { /* ignore */ }
      }
      try {
        sourceRef.current = audioContextRef.current.createMediaElementSource(el);
        let node: AudioNode = sourceRef.current;
        if (bassFilterRef.current) {
          node.connect(bassFilterRef.current);
          node = bassFilterRef.current;
        }
        for (const filter of eqFiltersRef.current) {
          node.connect(filter);
          node = filter;
        }
        if (eqGainRef.current) {
          node.connect(eqGainRef.current);
          node = eqGainRef.current;
        }
        node.connect(analyserRef.current!);
      } catch (e) {
        // Source already connected
      }
    }
  }, [currentTrack?.id, mediaType, getMediaElement]);

  const visualize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : BARS);

    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (analyser && isPlayingMusic) {
        analyser.getByteFrequencyData(dataArray);
        const step = Math.floor(dataArray.length / BARS);
        const freqs: number[] = [];
        for (let i = 0; i < BARS; i++) {
          freqs.push(dataArray[i * step] || 0);
        }
        setFrequencyData(freqs);
      }

      const barWidth = canvas.width / BARS;
      for (let i = 0; i < BARS; i++) {
        const freq = frequencyData[i] || 0;
        const height = isPlayingMusic
          ? Math.max(4, (freq / 255) * canvas.height * 0.9)
          : 3;
        const hue = isPlayingMusic ? (i / BARS) * 240 + 180 : 180;
        const saturation = isPlayingMusic ? '80%' : '30%';
        const lightness = isPlayingMusic ? `${50 + (freq / 255) * 30}%` : '30%';

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - height);
        gradient.addColorStop(0, `hsla(${hue}, ${saturation}, ${lightness}, 0.9)`);
        gradient.addColorStop(0.5, `hsla(${hue + 30}, ${saturation}, ${lightness}, 0.7)`);
        gradient.addColorStop(1, `hsla(${hue + 60}, ${saturation}, ${lightness}, 0.5)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 1.5, height);
      }
    };
    render();
  }, [isPlayingMusic, frequencyData]);

  const visualizeWaveform = useCallback(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const timeData = new Uint8Array(analyser ? analyser.fftSize : 128);

    const render = () => {
      if (analyser && isPlayingMusic) {
        analyser.getByteTimeDomainData(timeData);
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerY = canvas.height / 2;
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      const sliceWidth = canvas.width / waveformData.length;
      for (let i = 0; i < waveformData.length; i++) {
        const v = isPlayingMusic ? (timeData[i] || 128) / 128.0 : 0.5;
        const y = centerY + (v - 0.5) * canvas.height * 0.8;
        ctx.lineTo(i * sliceWidth, y);
      }

      ctx.strokeStyle = isPlayingMusic ? '#06b6d4' : '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      const progress = duration > 0 ? elapsed / duration : 0;
      const progressX = progress * canvas.width;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, canvas.height);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    render();
  }, [isPlayingMusic, waveformData, elapsed, duration]);

  useEffect(() => {
    visualize();
    return () => cancelAnimationFrame(rafRef.current);
  }, [visualize]);

  useEffect(() => {
    if (waveformCanvasRef.current) {
      visualizeWaveform();
    }
  }, [visualizeWaveform]);

  useEffect(() => {
    if (isPlayingMusic) {
      setCoverRotating(true);
      const el = getMediaElement();
      if (el) {
        el.playbackRate = playbackRate;
        if ('preservesPitch' in el) {
          (el as HTMLAudioElement & { preservesPitch: boolean }).preservesPitch = false;
        }
        if (analyserRef.current === null) {
          setupAudioAnalyser(el);
        }
      }
    } else {
      setCoverRotating(false);
    }
  }, [isPlayingMusic, setupAudioAnalyser, getMediaElement]);

  useEffect(() => {
    const el = getMediaElement();
    if (el) {
      el.playbackRate = playbackRate;
      if ('preservesPitch' in el) {
        (el as HTMLAudioElement & { preservesPitch: boolean }).preservesPitch = false;
      }
    }
  }, [playbackRate, getMediaElement]);

  useEffect(() => {
    if (currentTrack && currentTrack.audioUrl) {
      const el = getMediaElement();
      if (el) {
        el.volume = isMuted ? 0 : volume;
      }
    }
  }, [volume, isMuted, currentTrack, getMediaElement]);

  useEffect(() => {
    if (currentTrack) {
      setElapsed(0);
      setDuration(currentTrack.durationSeconds || 0);
      setAudioFormat(currentTrack.fileFormat || detectFormatFromUrl(currentTrack.audioUrl));
      setFileSize(currentTrack.fileSize);
      if (currentTrack.lyrics) {
        setLyrics(currentTrack.lyrics);
      } else if (currentTrack.lrcUrl) {
        fetch(currentTrack.lrcUrl)
          .then(res => res.text())
          .then(setLyrics)
          .catch(() => setLyrics(''));
      } else {
        setLyrics('');
      }
    }
  }, [currentTrack?.id]);

  const detectFormatFromUrl = (url: string): string => {
    try {
      const u = new URL(url);
      const path = u.pathname.toLowerCase();
      if (path.endsWith('.mp3')) return 'MP3';
      if (path.endsWith('.wav')) return 'WAV';
      if (path.endsWith('.flac')) return 'FLAC';
      if (path.endsWith('.aac')) return 'AAC';
      if (path.endsWith('.ogg')) return 'OGG Vorbis';
      if (path.endsWith('.m4a')) return 'M4A (AAC)';
      if (path.endsWith('.webm')) return 'WebM';
      if (path.endsWith('.mp4')) return 'MP4';
      if (path.endsWith('.lrc')) return 'LRC Lyrics';
      return 'Audio';
    } catch {
      return 'Stream';
    }
  };

  const startElapsedTimer = useCallback(() => {
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    elapsedIntervalRef.current = window.setInterval(() => {
      const el = getMediaElement();
      if (el && !isSeeking) {
        setElapsed(el.currentTime);
        if (el.duration && isFinite(el.duration)) {
          setDuration(el.duration);
        }
      }
    }, 250);
  }, [getMediaElement, isSeeking]);

  const stopElapsedTimer = useCallback(() => {
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
  }, []);

  const startSilenceDetection = useCallback(() => {
    if (silenceCheckIntervalRef.current) clearInterval(silenceCheckIntervalRef.current);
    silenceCheckIntervalRef.current = window.setInterval(() => {
      const el = getMediaElement();
      if (!el || !skipSilence) return;
      if (analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
        if (avg < skipSilenceThreshold && isPlayingMusic) {
          const wasSkipping = isSkippingSilence;
          setIsSkippingSilence(true);
          if (!wasSkipping) {
            el.currentTime = Math.min(el.currentTime + 5, (el.duration || Infinity) - 1);
          }
        } else {
          if (isSkippingSilence) setIsSkippingSilence(false);
        }
      }
    }, 1000);
  }, [getMediaElement, skipSilence, skipSilenceThreshold, isPlayingMusic, isSkippingSilence]);

  const stopSilenceDetection = useCallback(() => {
    if (silenceCheckIntervalRef.current) {
      clearInterval(silenceCheckIntervalRef.current);
      silenceCheckIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPlayingMusic) {
      startElapsedTimer();
      if (skipSilence) startSilenceDetection();
    } else {
      stopElapsedTimer();
      stopSilenceDetection();
    }
    return () => {
      stopElapsedTimer();
      stopSilenceDetection();
    };
  }, [isPlayingMusic, skipSilence, startElapsedTimer, stopElapsedTimer, startSilenceDetection, stopSilenceDetection]);

  const cancelSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setSleepTimer(null);
  }, []);

  const setSleepTimerMinutes_ = useCallback((minutes: number) => {
    cancelSleepTimer();
    const timeout = window.setTimeout(() => {
      const el = getMediaElement();
      if (el) {
        el.pause();
        setIsPlayingMusic(false);
      }
      setSleepTimer(null);
      showToast('Sleep Timer', 'Playback stopped by sleep timer', 'info');
    }, minutes * 60 * 1000);
    sleepTimerRef.current = timeout;
    setSleepTimer(minutes);
  }, [cancelSleepTimer, getMediaElement, setIsPlayingMusic, showToast]);

  useEffect(() => {
    return () => cancelSleepTimer();
  }, [cancelSleepTimer]);

  const togglePlay = useCallback(() => {
    const el = getMediaElement();
    if (!el || !currentTrackRef.current) return;
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    if (isPlayingMusic) {
      el.pause();
      setIsPlayingMusic(false);
    } else {
      el.play().then(() => setIsPlayingMusic(true)).catch(() => {
        showToast('Playback Notice', 'Unable to start playback', 'info');
      });
    }
  }, [getMediaElement, isPlayingMusic, setIsPlayingMusic, showToast]);

  const handleMediaPlay = useCallback(() => setIsPlayingMusic(true), [setIsPlayingMusic]);
  const handleMediaPause = useCallback(() => setIsPlayingMusic(false), [setIsPlayingMusic]);
  const handleMediaEnded = useCallback(() => {
    setIsPlayingMusic(false);
    playNext();
  }, [setIsPlayingMusic]);

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    let nextIndex: number;
    if (playbackMode === 'repeat-one') {
      nextIndex = currentIndex;
    } else if (playbackMode === 'shuffle') {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else if (playbackMode === 'repeat-all') {
      nextIndex = (currentIndex + 1) % playlist.length;
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) {
        showToast('Playlist', 'End of playlist', 'info');
        return;
      }
    }
    setCurrentIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
    setIsPlayingMusic(false);
    setMediaType(playlist[nextIndex].mediaType || 'audio');
  }, [playlist, currentIndex, playbackMode, setCurrentTrack, setIsPlayingMusic, showToast]);

  const playPrev = useCallback(() => {
    if (playlist.length === 0) return;
    if (elapsed > 3) {
      const el = getMediaElement();
      if (el) el.currentTime = 0;
      setElapsed(0);
      return;
    }
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentTrack(playlist[prevIndex]);
    setIsPlayingMusic(false);
    setMediaType(playlist[prevIndex].mediaType || 'audio');
  }, [playlist, currentIndex, elapsed, setCurrentTrack, setIsPlayingMusic, getMediaElement]);

  const handleMediaLoadedMetadata = useCallback(() => {
    const el = getMediaElement();
    if (el && el.duration && isFinite(el.duration)) {
      setDuration(el.duration);
    }
  }, [getMediaElement]);

  const handleMediaTimeUpdate = useCallback(() => {
    const el = getMediaElement();
    if (el && !isSeeking) {
      setElapsed(el.currentTime);
    }
  }, [getMediaElement, isSeeking]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setElapsed(val);
    setIsSeeking(true);
  }, []);

  const handleSeekCommit = useCallback(() => {
    const el = getMediaElement();
    if (el) {
      el.currentTime = elapsed;
    }
    setIsSeeking(false);
  }, [elapsed, getMediaElement]);

  const seekRelative = useCallback((delta: number) => {
    const el = getMediaElement();
    if (el && currentTrackRef.current) {
      const newTime = Math.max(0, Math.min(el.currentTime + delta, el.duration || 0));
      el.currentTime = newTime;
      setElapsed(newTime);
    }
  }, [getMediaElement]);

  const extractYouTubeId = useCallback((url: string): string | null => {
    const match = url.match(YOUTUBE_REGEX);
    return match ? match[4] : null;
  }, []);

  const buildYouTubeEmbedUrl = useCallback((youtubeId: string, autoplay: boolean): string => {
    return `https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`;
  }, []);

  const getYouTubeThumbnail = useCallback((youtubeId: string): string => {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  }, []);

  const addTrackToPlaylist = useCallback((track: MediaTrack) => {
    setPlaylist(prev => {
      const exists = prev.some(t => t.id === track.id);
      if (exists) {
        showToast('Playlist', 'Track already in playlist', 'info');
        return prev;
      }
      const newPlaylist = [...prev, { ...track, addedAt: Date.now() }];
      if (newPlaylist.length === 1) {
        setCurrentIndex(0);
        setCurrentTrack(newPlaylist[0]);
        setMediaType(newPlaylist[0].mediaType || 'audio');
      }
      showToast('Playlist', `Added: ${track.title}`, 'success');
      return newPlaylist;
    });
  }, [showToast, setMediaType]);

  const removeTrackFromPlaylist = useCallback((trackId: string) => {
    setPlaylist(prev => {
      const idx = prev.findIndex(t => t.id === trackId);
      const newPlaylist = prev.filter(t => t.id !== trackId);
      if (idx === currentIndex && newPlaylist.length > 0) {
        const newIdx = Math.min(idx, newPlaylist.length - 1);
        setCurrentIndex(newIdx);
        setCurrentTrack(newPlaylist[newIdx]);
      } else if (newPlaylist.length === 0) {
        setCurrentTrack(null);
        setCurrentIndex(0);
      }
      return newPlaylist;
    });
  }, [currentIndex, setCurrentTrack]);

  const playTrackFromPlaylist = useCallback((track: MediaTrack, index: number) => {
    setCurrentIndex(index);
    setCurrentTrack(track);
    setIsPlayingMusic(false);
    setMediaType(track.mediaType || 'audio');
  }, [setCurrentTrack, setIsPlayingMusic]);

  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setCurrentTrack(null);
    setCurrentIndex(0);
    showToast('Playlist', 'Playlist cleared', 'info');
  }, [showToast]);

  const handleYouTubeSubmit = useCallback((e: React.FormEvent) => {
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
      coverUrl: getYouTubeThumbnail(youtubeId),
      audioUrl: buildYouTubeEmbedUrl(youtubeId, true),
      durationSeconds: 0,
      isYoutube: true,
      youtubeId,
      mediaType: 'video',
      fileFormat: 'YouTube',
      addedAt: Date.now(),
    };
    addTrackToPlaylist(track);
    setShowYouTubeInput(false);
    setYoutubeUrl('');
  }, [youtubeUrl, extractYouTubeId, showToast, getYouTubeThumbnail, buildYouTubeEmbedUrl, addTrackToPlaylist]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (e.target) e.target.value = '';
  }, []);

  const processFile = useCallback((file: File) => {
    const fileUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    const format = getFileFormat(file) || detectFormatFromUrl(fileUrl);
    const track: MediaTrack = {
      id: `local-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local Media',
      coverUrl: undefined,
      audioUrl: fileUrl,
      durationSeconds: 0,
      isYoutube: false,
      mediaType: isVideo ? 'video' : 'audio',
      fileFormat: format,
      fileSize: file.size,
      addedAt: Date.now(),
    };

    if (file.name.toLowerCase().endsWith('.lrc')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          track.lyrics = ev.target.result as string;
          addTrackToPlaylist(track);
        }
      };
      reader.readAsText(file);
    } else {
      addTrackToPlaylist(track);
    }

    showToast('Media Loaded', `Loaded: ${file.name} (${format})`, 'success');
  }, [addTrackToPlaylist, showToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      files.forEach(file => {
        if (file.type.startsWith('audio/') || file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.lrc')) {
          processFile(file);
        }
      });
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleCustomStreamSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!customStreamUrl.trim()) return;
    let hostname = 'stream';
    try {
      hostname = new URL(customStreamUrl.trim()).hostname;
    } catch {
      hostname = customStreamUrl.trim().slice(0, 30);
    }
    const track: MediaTrack = {
      id: `stream-${Date.now()}`,
      title: `Stream (${hostname})`,
      artist: customStreamUrl.trim(),
      coverUrl: undefined,
      audioUrl: customStreamUrl.trim(),
      durationSeconds: 0,
      isYoutube: false,
      mediaType: 'audio',
      fileFormat: detectFormatFromUrl(customStreamUrl),
      addedAt: Date.now(),
    };
    addTrackToPlaylist(track);
    setShowStreamInput(false);
    setCustomStreamUrl('');
  }, [customStreamUrl, addTrackToPlaylist]);

  const toggleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume > 0 ? prevVolume : 0.8);
      setPrevVolume(prevVolume > 0 ? prevVolume : 0.8);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
    }
  }, [isMuted, volume, prevVolume]);

  const togglePlaybackMode = useCallback(() => {
    setPlaybackMode(prev => {
      if (prev === 'sequential') return 'shuffle';
      if (prev === 'shuffle') return 'repeat-one';
      if (prev === 'repeat-one') return 'repeat-all';
      return 'sequential';
    });
  }, []);

  const handleRateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaybackRate(Number(e.target.value));
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
  }, []);

  const handleSleepTimerSet = useCallback((minutes: number) => {
    setSleepTimerMinutes_(minutes);
    showToast('Sleep Timer', `Timer set for ${minutes} minutes`, 'success');
  }, [setSleepTimerMinutes_, showToast]);

  const cancelSleepTimer_ = useCallback(() => {
    cancelSleepTimer();
    showToast('Sleep Timer', 'Timer cancelled', 'info');
  }, [cancelSleepTimer, showToast]);

  useEffect(() => {
    try { localStorage.setItem('brio_eq_bands', JSON.stringify(eqBands)); } catch { /* ignore */ }
  }, [eqBands]);

  useEffect(() => {
    try { localStorage.setItem('brio_bass_boost', String(bassBoost)); } catch { /* ignore */ }
  }, [bassBoost]);

  useEffect(() => {
    try { localStorage.setItem('brio_eq_preset', eqPreset); } catch { /* ignore */ }
  }, [eqPreset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(-5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(v => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(v => Math.max(0, v - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyN':
          e.preventDefault();
          playNext();
          break;
        case 'KeyP':
          e.preventDefault();
          playPrev();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekRelative, toggleMute, playNext, playPrev]);

  const progressPercent = duration > 0 ? (elapsed / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;
  const ratePercent = ((playbackRate - 0.5) / 1.5) * 100;

  const coverStyle: React.CSSProperties = currentTrack?.coverUrl ? {} : {
    background: `linear-gradient(135deg, ${hashColor(currentTrack?.title || 'default')}, ${hashColor(currentTrack?.artist || 'default')} 100%)`,
  };

  const isYoutube = currentTrack?.isYoutube;
  const youtubeId = currentTrack?.youtubeId;

  const getPlaybackModeIcon = () => {
    if (playbackMode === 'repeat-one') return <Repeat1 className="w-4 h-4" />;
    if (playbackMode === 'repeat-all') return <Repeat className="w-4 h-4" />;
    if (playbackMode === 'shuffle') return <Shuffle className="w-4 h-4" />;
    return <Repeat className="w-4 h-4" />;
  };

  const getPlaybackModeLabel = () => {
    if (playbackMode === 'repeat-one') return 'Repeat One';
    if (playbackMode === 'repeat-all') return 'Repeat All';
    if (playbackMode === 'shuffle') return 'Shuffle';
    return 'Sequential';
  };

  return (
    <div className="space-y-4">
      <audio
        ref={audioRef}
        src={currentTrack && !currentTrack.isYoutube ? currentTrack.audioUrl : undefined}
        onLoadedMetadata={handleMediaLoadedMetadata}
        onTimeUpdate={handleMediaTimeUpdate}
        onPlay={handleMediaPlay}
        onPause={handleMediaPause}
        onEnded={handleMediaEnded}
        preload="metadata"
        style={{ display: 'none' }}
      />

      {isMiniPlayer && currentTrack && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900/95 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl p-3 flex items-center gap-3 w-80 cursor-pointer"
          onClick={() => setIsMiniPlayer(false)}>
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-red-500/20"
            style={currentTrack.coverUrl ? {} : { background: `linear-gradient(135deg, ${hashColor(currentTrack.title)}, ${hashColor(currentTrack.artist)})` }}>
            {currentTrack.coverUrl ? (
              <img src={currentTrack.coverUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60">
                <Music className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentTrack.artist}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="p-2 bg-red-500 hover:bg-red-400 text-black rounded-xl transition-all cursor-pointer"
          >
            {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsMiniPlayer(false); }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div
        className={`bg-slate-900/90 border ${isDragOver ? 'border-red-400 border-dashed' : 'border-slate-800'} rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-2xl text-red-400">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Nightcore Player</h3>
              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono rounded flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" /> Pro
              </span>
              {audioFormat && (
                <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono rounded font-semibold">
                  {audioFormat}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {playlist.length > 0 ? `${playlist.length} tracks in playlist` : 'Playlist, visualizer, lyrics, sleep timer & more'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setMediaType('audio')}
            className={`skeuo-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${mediaType === 'audio' ? 'bg-red-500 text-black shadow-lg' : 'bg-slate-800 text-slate-400'}`}
          >
            <Music className="w-3.5 h-3.5 inline mr-1" /> Audio
          </button>
          <button
            onClick={() => setMediaType('video')}
            className={`skeuo-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${mediaType === 'video' ? 'bg-red-500 text-black shadow-lg' : 'bg-slate-800 text-slate-400'}`}
          >
            <Video className="w-3.5 h-3.5 inline mr-1" /> Video
          </button>
          <button
            onClick={() => setIsMiniPlayer(!isMiniPlayer)}
            className="skeuo-btn px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Mini Player"
          >
            {isMiniPlayer ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isMiniPlayer && (
        <>
          <div ref={playerContainerRef} className="bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 border-2 border-red-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-center">
                <div className="relative group w-44 h-44 rounded-2xl overflow-hidden shadow-2xl border border-red-400/30 mb-3 bg-black flex-shrink-0">
                  {currentTrack ? (
                    <>
                      {isYoutube && youtubeId ? (
                        <img
                          src={getYouTubeThumbnail(youtubeId)}
                          alt="YouTube Thumbnail"
                          className={`w-full h-full object-cover ${coverRotating ? 'animate-spin' : ''}`}
                          style={{ animationDuration: '8s', animationPlayState: isPlayingMusic ? 'running' : 'paused' }}
                        />
                      ) : currentTrack.coverUrl ? (
                        <img
                          src={currentTrack.coverUrl}
                          alt="Cover"
                          className={`w-full h-full object-cover transition-transform ${coverRotating ? 'animate-spin' : 'group-hover:scale-105'}`}
                          style={{ animationDuration: '8s', animationPlayState: isPlayingMusic ? 'running' : 'paused' }}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white/40"
                          style={coverStyle}
                        >
                          <Music className="w-16 h-16" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
                        <span className="text-[10px] font-mono font-black text-red-300 bg-red-950/90 px-2 py-0.5 rounded-md border border-red-500/40 w-max">
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

                <canvas ref={canvasRef} width={BARS * 3} height={36} className="w-44 h-9 rounded-lg bg-black/60 border border-red-500/20" />
              </div>

               <div className="lg:col-span-2 space-y-4">
                 <div className="flex items-center justify-between">
                   <div className="flex-1 min-w-0">
                     <h4 className="text-sm font-bold text-white truncate">
                       {currentTrack ? currentTrack.title : 'No Media Loaded'}
                     </h4>
                     <p className="text-xs text-slate-400 truncate">
                       {currentTrack ? currentTrack.artist : 'Load a file or paste a URL to begin'}
                     </p>
                     {audioFormat && currentTrack && (
                       <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                         <FileAudio className="w-3 h-3" />
                         {audioFormat}
                         {fileSize && ` • ${(fileSize / 1024 / 1024).toFixed(1)} MB`}
                         {currentTrack.durationSeconds > 0 && ` • ${formatTime(currentTrack.durationSeconds)}`}
                       </p>
                     )}
                   </div>
                   {currentTrack && (
                     <button
                       onClick={toggleFullscreen}
                       className="skeuo-btn p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer ml-2"
                       title="Toggle Fullscreen"
                     >
                       <Maximize2 className="w-4 h-4" />
                     </button>
                   )}
                 </div>

                 <div className="space-y-3">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                     <Disc className="w-3.5 h-3.5 text-red-400" />
                     NOW PLAYING
                   </h3>

                   <div className="bg-black rounded-2xl overflow-hidden border border-slate-800 min-h-[200px] flex items-center justify-center relative"
                     onDrop={handleDrop}
                     onDragOver={handleDragOver}
                     onDragLeave={handleDragLeave}>
                     {currentTrack ? (
                       isYoutube && youtubeId ? (
                         <iframe
                           src={buildYouTubeEmbedUrl(youtubeId, false)}
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
                           onPlay={handleMediaPlay}
                           onPause={handleMediaPause}
                           onEnded={handleMediaEnded}
                           onLoadedMetadata={handleMediaLoadedMetadata}
                           onTimeUpdate={handleMediaTimeUpdate}
                         />
                       ) : (
                         <audio
                           ref={audioRef}
                           controls
                           autoPlay={isPlayingMusic}
                           className="w-full"
                           src={currentTrack.audioUrl}
                           onPlay={handleMediaPlay}
                           onPause={handleMediaPause}
                           onEnded={handleMediaEnded}
                           onLoadedMetadata={handleMediaLoadedMetadata}
                           onTimeUpdate={handleMediaTimeUpdate}
                         />
                       )
                     ) : (
                       <div className="text-center text-slate-500 p-8 space-y-3">
                         <Upload className="w-12 h-12 mx-auto text-slate-600" />
                         <p className="text-sm font-mono">Drop files here or use the upload options below</p>
                         <p className="text-xs text-slate-600">Supports MP3, WAV, FLAC, MP4, and more</p>
                       </div>
                     )}
                     {isDragOver && (
                       <div className="absolute inset-0 bg-red-500/10 border-2 border-red-400 border-dashed rounded-2xl flex items-center justify-center">
                         <div className="text-red-300 text-sm font-bold flex items-center gap-2">
                           <Upload className="w-6 h-6" /> Drop files to add to playlist
                         </div>
                       </div>
                     )}
                   </div>

                   <div className="bg-slate-950/60 border border-red-500/10 rounded-2xl p-3 backdrop-blur-xl">
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-mono text-slate-400">{formatTime(elapsed)}</span>
                       <span className="text-xs font-mono text-slate-400">{formatTime(duration)}</span>
                     </div>
                     <div className="relative w-full h-8 bg-slate-900/80 rounded-xl overflow-hidden border border-slate-800 cursor-pointer"
                       onClick={(e) => {
                         const rect = e.currentTarget.getBoundingClientRect();
                         const percent = (e.clientX - rect.left) / rect.width;
                         const newTime = percent * duration;
                         const el = getMediaElement();
                         if (el) {
                           el.currentTime = newTime;
                           setElapsed(newTime);
                         }
                       }}>
                       <canvas ref={waveformCanvasRef} width={300} height={32} className="w-full h-full" />
                       <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-500/20 pointer-events-none"
                         style={{ width: `${progressPercent}%` }} />
                       <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none shadow-lg shadow-red-500/50"
                         style={{ left: `${progressPercent}%` }} />
                     </div>
                     <input
                       type="range"
                       min="0"
                       max={duration || 100}
                       step="0.1"
                       value={elapsed}
                       onChange={handleSeek}
                       onMouseUp={handleSeekCommit}
                       onTouchEnd={handleSeekCommit}
                       className="w-full accent-red-500 cursor-pointer h-1 bg-slate-800 rounded-lg mt-1 opacity-0 absolute"
                       style={{ pointerEvents: 'none' }}
                     />
                   </div>

                   <div className="flex items-center justify-center gap-3 flex-wrap">
                     <button
                       onClick={playPrev}
                       disabled={!currentTrack}
                       className="skeuo-btn p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer disabled:opacity-40"
                       title="Previous (P)"
                     >
                       <SkipBack className="w-5 h-5" />
                     </button>

                     <button
                       onClick={togglePlay}
                       disabled={!currentTrack}
                       className="skeuo-btn px-8 py-3.5 bg-gradient-to-r from-red-500 via-red-500 to-red-600 hover:scale-105 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                     >
                       {isPlayingMusic ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                       <span>{isPlayingMusic ? 'Pause' : 'Play'}</span>
                     </button>

                     <button
                       onClick={playNext}
                       disabled={!currentTrack || playlist.length <= 1}
                       className="skeuo-btn p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer disabled:opacity-40"
                       title="Next (N)"
                     >
                       <SkipForward className="w-5 h-5" />
                     </button>

                     <button
                       onClick={togglePlaybackMode}
                       disabled={!currentTrack}
                       className={`skeuo-btn p-3 rounded-xl border transition-all cursor-pointer disabled:opacity-40 ${playbackMode !== 'sequential' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'}`}
                       title={`${getPlaybackModeLabel()} - Click to change`}
                     >
                       {getPlaybackModeIcon()}
                     </button>

                     <button
                       onClick={toggleMute}
                       className="skeuo-btn p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
                       title="Mute (M)"
                     >
                       {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : volume < 0.5 ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                     </button>

                     <button
                       onClick={() => setShowLyrics(!showLyrics)}
                       disabled={!currentTrack}
                       className={`skeuo-btn p-3 rounded-xl border transition-all cursor-pointer disabled:opacity-40 ${showLyrics ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'}`}
                       title="Lyrics"
                     >
                       <Mic2 className="w-5 h-5" />
                     </button>
                   </div>

                   {showLyrics && lyrics && (
                     <div className="bg-slate-950/80 border border-red-500/20 rounded-2xl p-4 max-h-40 overflow-y-auto backdrop-blur-xl">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-bold text-red-300 flex items-center gap-1">
                           <Type className="w-3.5 h-3.5" /> Lyrics
                         </span>
                         <button onClick={() => setShowLyrics(false)} className="text-slate-400 hover:text-white cursor-pointer">
                           <X className="w-3.5 h-3.5" />
                         </button>
                       </div>
                       <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{lyrics}</pre>
                     </div>
                   )}

                   {showLyrics && !lyrics && currentTrack && (
                     <div className="bg-slate-950/80 border border-red-500/20 rounded-2xl p-4 backdrop-blur-xl">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-bold text-red-300 flex items-center gap-1">
                           <Type className="w-3.5 h-3.5" /> Lyrics
                         </span>
                         <button onClick={() => setShowLyrics(false)} className="text-slate-400 hover:text-white cursor-pointer">
                           <X className="w-3.5 h-3.5" />
                         </button>
                       </div>
                       <p className="text-xs text-slate-500 italic">No lyrics available. Add an .lrc file or embed lyrics in the track metadata.</p>
                     </div>
                   )}
                 </div>

                 <div className="space-y-3">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                     <Sliders className="w-3.5 h-3.5 text-red-400" />
                     AUDIO SETTINGS
                   </h3>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-950/60 border border-red-500/20 rounded-2xl p-3 space-y-2 backdrop-blur-xl">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-red-400 font-bold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Nightcore Pitch ({nightcorePitch.toFixed(2)}x)
                          </span>
                          <span className="text-[10px] text-slate-400">0.5x ➔ 2.0x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.05"
                          value={nightcorePitch}
                          onChange={(e) => setNightcorePitch(Number(e.target.value))}
                          className="skeuo-slider w-full cursor-pointer"
                        />
                      </div>

                     <div className="bg-slate-950/60 border border-red-500/20 rounded-2xl p-3 space-y-2 backdrop-blur-xl">
                       <div className="flex items-center justify-between text-xs font-mono">
                         <span className="text-red-400 font-bold flex items-center gap-1">
                           <Gauge className="w-3.5 h-3.5" /> Playback Speed ({playbackRate.toFixed(1)}x)
                         </span>
                         <span className="text-[10px] text-slate-400">0.5 ➔ 2.0</span>
                       </div>
                       <input
                         type="range"
                         min="0.5"
                         max="2"
                         step="0.1"
                         value={playbackRate}
                         onChange={handleRateChange}
                         className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                       />
                     </div>

                     <div className="bg-slate-950/60 border border-red-500/20 rounded-2xl p-3 space-y-2 backdrop-blur-xl">
                       <div className="flex items-center justify-between text-xs font-mono">
                         <span className="text-red-400 font-bold flex items-center gap-1">
                           <Volume2 className="w-3.5 h-3.5" /> Volume ({Math.round(volumePercent)}%)
                         </span>
                         <span className="text-[10px] text-slate-400">{isMuted ? 'MUTED' : 'ACTIVE'}</span>
                       </div>
                       <input
                         type="range"
                         min="0"
                         max="1"
                         step="0.01"
                         value={isMuted ? 0 : volume}
                         onChange={handleVolumeChange}
                         className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                       />
                     </div>

                     <div className="bg-slate-950/60 border border-red-500/20 rounded-2xl p-3 space-y-2 backdrop-blur-xl md:col-span-2">
                       <div className="flex items-center justify-between text-xs font-mono">
                         <span className="text-red-400 font-bold flex items-center gap-1">
                           <Sliders className="w-3.5 h-3.5" /> EQ & Bass Booster
                         </span>
                         <div className="flex items-center gap-2">
                           <select
                             value={eqPreset}
                             onChange={(e) => {
                               const p = e.target.value as EqPreset;
                               setEqPreset(p);
                               setEqBands([...EQ_PRESETS[p]]);
                             }}
                             className="bg-slate-900 border border-slate-700 text-[10px] text-slate-300 rounded-md px-1.5 py-0.5 cursor-pointer"
                           >
                             <option value="flat">Flat</option>
                             <option value="rock">Rock</option>
                             <option value="pop">Pop</option>
                             <option value="jazz">Jazz</option>
                             <option value="classical">Classical</option>
                             <option value="bass-boost">Bass Boost</option>
                             <option value="treble-boost">Treble Boost</option>
                           </select>
                           <button
                             onClick={() => setShowEqPanel(!showEqPanel)}
                             className="text-[10px] text-red-300 hover:text-red-200 cursor-pointer"
                           >
                             {showEqPanel ? 'Hide Bands' : 'Show Bands'}
                           </button>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <span className="text-[10px] text-slate-400 shrink-0 w-8">Bass</span>
                         <input
                           type="range"
                           min="0"
                           max="200"
                           step="1"
                           value={bassBoost}
                           onChange={(e) => setBassBoost(Number(e.target.value))}
                           className="flex-1 accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                         />
                         <span className="text-[10px] text-red-300 font-mono w-12 text-right">{bassBoost}%</span>
                       </div>
                       {showEqPanel && (
                         <div className="space-y-1.5 pt-1.5 border-t border-slate-800/60">
                           <div className="flex items-end gap-1">
                             {EQ_BANDS.map((band, i) => (
                               <div key={band.freq} className="flex-1 flex flex-col items-center gap-0.5">
                                 <input
                                   type="range"
                                   min="-12"
                                   max="12"
                                   step="0.5"
                                   value={eqBands[i] ?? 0}
                                   onChange={(e) => {
                                     const newBands = [...eqBands];
                                     newBands[i] = Number(e.target.value);
                                     setEqBands(newBands);
                                     setEqPreset('flat');
                                   }}
                                   className="w-full accent-red-400 cursor-pointer"
                                   style={{ writingMode: 'vertical-lr', direction: 'rtl', height: '64px' }}
                                 />
                                 <span className="text-[9px] text-red-300 font-mono">{(eqBands[i] ?? 0) > 0 ? '+' : ''}{eqBands[i] ?? 0}</span>
                                 <span className="text-[9px] text-slate-500 font-mono">{band.label}Hz</span>
                               </div>
                             ))}
                           </div>
                           <button
                             onClick={() => { setEqBands([...EQ_PRESETS.flat]); setEqPreset('flat'); setBassBoost(0); }}
                             className="text-[10px] text-slate-400 hover:text-white cursor-pointer px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700"
                           >
                             Reset All
                           </button>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>

                 <div className="space-y-3">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                     <Timer className="w-3.5 h-3.5 text-red-400" />
                     UTILITIES
                   </h3>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <div className="bg-slate-950/60 border border-red-600/20 rounded-2xl p-3 space-y-2 backdrop-blur-xl">
                       <div className="flex items-center justify-between text-xs font-mono">
                         <span className="text-red-500 font-bold flex items-center gap-1">
                           <Timer className="w-3.5 h-3.5" /> Sleep Timer
                         </span>
                         <span className="text-[10px] text-slate-400">{sleepTimer ? `${sleepTimer}m left` : 'Off'}</span>
                       </div>
                       <div className="flex gap-2">
                         {[15, 30, 60, 90].map(mins => (
                           <button
                             key={mins}
                             onClick={() => handleSleepTimerSet(mins)}
                             disabled={!!sleepTimer}
                             className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:opacity-50 text-slate-300 rounded-lg text-[10px] font-mono cursor-pointer transition-all border border-slate-700"
                           >
                             {mins}m
                           </button>
                         ))}
                         {sleepTimer && (
                           <button
                             onClick={cancelSleepTimer_}
                             className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-mono cursor-pointer transition-all"
                           >
                             <X className="w-3 h-3" />
                           </button>
                         )}
                       </div>
                     </div>

                     <div className="bg-slate-950/60 border border-slate-700/20 rounded-2xl p-3 space-y-2 backdrop-blur-xl">
                       <div className="flex items-center justify-between text-xs font-mono">
                         <span className="text-slate-300 font-bold flex items-center gap-1">
                           <Sliders className="w-3.5 h-3.5" /> Skip Silence {isSkippingSilence ? '(Skipping...)' : ''}
                         </span>
                         <span className="text-[10px] text-slate-400">Threshold: {(skipSilenceThreshold * 100).toFixed(0)}%</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <button
                           onClick={() => setSkipSilence(!skipSilence)}
                           className={`skeuo-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${skipSilence ? 'bg-red-500/20 border-red-500/40 text-green-300' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                         >
                           {skipSilence ? 'ON' : 'OFF'}
                         </button>
                         <input
                           type="range"
                           min="0.005"
                           max="0.1"
                           step="0.005"
                           value={skipSilenceThreshold}
                           onChange={(e) => setSkipSilenceThreshold(Number(e.target.value))}
                           disabled={!skipSilence}
                           className="flex-1 accent-red-600 cursor-pointer h-1 bg-slate-800 rounded-lg disabled:opacity-40"
                         />
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-red-400" />
              <span>Local Media</span>
              {isDragOver && <span className="text-red-300 normal-case">Drop files here...</span>}
            </h4>
            <label className="flex items-center justify-center gap-2 p-4 bg-slate-950 border border-dashed border-slate-700 hover:border-red-400 rounded-xl text-xs text-slate-300 cursor-pointer transition-colors">
              <Music className="w-4 h-4 text-red-400" />
              <span>Choose Audio or Video File...</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*,.lrc"
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
            </label>
          </div>

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
                    className="skeuo-btn flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    Load Video
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowYouTubeInput(false); setYoutubeUrl(''); }}
                    className="skeuo-btn px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-red-400" />
              <span>Stream URL</span>
            </h4>
            {!showStreamInput ? (
              <button
                onClick={() => setShowStreamInput(true)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 placeholder-slate-600"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!customStreamUrl.trim()}
                    className="skeuo-btn flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    Load Stream
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowStreamInput(false); setCustomStreamUrl(''); }}
                    className="skeuo-btn px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ListMusic className="w-4 h-4 text-red-400" />
                <span>Playlist ({playlist.length})</span>
              </h4>
              {playlist.length > 0 && (
                <button
                  onClick={clearPlaylist}
                  className="text-[10px] text-red-400 hover:text-red-300 font-mono cursor-pointer transition-all"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {playlist.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No tracks in playlist. Add media above.</p>
              ) : (
                playlist.map((track, index) => (
                  <div
                    key={track.id}
                    className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all group ${index === currentIndex ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-950/60 border border-transparent hover:border-slate-700'}`}
                    onClick={() => playTrackFromPlaylist(track, index)}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700"
                      style={track.coverUrl ? {} : { background: `linear-gradient(135deg, ${hashColor(track.title)}, ${hashColor(track.artist)})` }}>
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40">
                          <Music className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${index === currentIndex ? 'text-red-300' : 'text-slate-200'}`}>
                        {track.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {track.artist} {track.fileFormat && `• ${track.fileFormat}`}
                      </p>
                    </div>
                    {index === currentIndex && isPlayingMusic && (
                      <div className="flex items-center gap-0.5">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-0.5 bg-red-400 rounded-full animate-pulse" style={{ height: `${8 + Math.random() * 8}px`, animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeTrackFromPlaylist(track.id); }}
                      className="p-1 text-slate-500 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono flex-wrap">
              <span className="text-slate-400">Shortcuts:</span>
              <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">Space</span><span className="text-slate-400">Play/Pause</span>
              <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">←→</span><span className="text-slate-400">Seek 5s</span>
              <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">↑↓</span><span className="text-slate-400">Volume</span>
              <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">M</span><span className="text-slate-400">Mute</span>
              <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">N</span><span className="text-slate-400">Next</span>
              <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">P</span><span className="text-slate-400">Prev</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NightcorePlayer;