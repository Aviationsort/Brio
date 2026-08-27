import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { IPTVChannel } from '../../types';
import { Tv, Play, Plus, RefreshCw, Radio, Search, Upload, CheckCircle2, ShieldCheck, Filter, Trash2, Globe } from 'lucide-react';
import HLS from 'hls.js';

export const IPTVPlayer: React.FC = () => {
  const { iptvChannels, setIptvChannels, selectedIPTVChannel, setSelectedIPTVChannel, showToast } = useApp();
  const [m3uText, setM3uText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isLoadingDefault, setIsLoadingDefault] = useState(false);
  const [loadProgress, setLoadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<HLS | null>(null);

  const DEFAULT_PLAYLISTS = [
    'https://iptv-org.github.io/iptv/index.m3u',
    'https://raw.githubusercontent.com/iptv-org/iptv/master/index.m3u',
    'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8',
  ];

  const CORS_PROXIES = [
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ];

  const GITHUB_PAGES_PROXY = (url: string) =>
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  const tryFetchWithCors = async (url: string): Promise<string> => {
    const isGitHubPages = url.includes('github.io');
    const attempts: { url: string; label: string }[] = [{ url, label: 'direct' }];
    if (isGitHubPages) attempts.push({ url: GITHUB_PAGES_PROXY(url), label: 'proxy' });
    CORS_PROXIES.forEach((p) => attempts.push({ url: p(url), label: 'proxy' }));

    const errors: { endpoint: string; error: string }[] = [];

    for (const attempt of attempts) {
      try {
        const res = await fetch(attempt.url);
        if (!res.ok) {
          const err = `HTTP ${res.status}${res.status === 404 ? ' (Not Found)' : res.status === 403 ? ' (Forbidden)' : ''}`;
          errors.push({ endpoint: attempt.url, error: err });
          continue;
        }
        return await res.text();
      } catch (err) {
        const classified = err instanceof Error ? err.message : String(err);
        errors.push({ endpoint: attempt.url, error: classified });
      }
    }

    const summary = errors.map((e) => `${new URL(e.endpoint).hostname}: ${e.error}`).join(' | ');
    throw new Error(`All fetch attempts failed. Details: ${summary}`);
  };

  const generateChannelId = (name: string, url: string, index: number): string => {
    const raw = `${name}-${url}-${index}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    }
    return `iptv-${Math.abs(hash).toString(36)}-${index}`;
  };

  const parseM3UContent = (content: string): IPTVChannel[] => {
    const lines = content.split(/\r?\n/);
    const parsedChannels: IPTVChannel[] = [];

    let currentName = 'Live Channel';
    let currentCategory = 'General';
    let currentLogo = '📺';
    let currentCountry = 'Global';
    let currentTvgId = '';
    const extM3u = lines[0] && lines[0].trim().toUpperCase() === '#EXTM3U';

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw.trim();

      if (line.startsWith('#EXTINF:')) {
        currentName = 'Live Channel';
        currentCategory = 'General';
        currentLogo = '📺';
        currentCountry = 'Global';
        currentTvgId = '';

        const groupMatch = line.match(/group-title="([^"]*)"/i);
        if (groupMatch && groupMatch[1]) currentCategory = groupMatch[1];

        const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
        if (logoMatch && logoMatch[1]) currentLogo = logoMatch[1];

        const countryMatch = line.match(/tvg-country="([^"]*)"/i);
        if (countryMatch && countryMatch[1]) currentCountry = countryMatch[1];

        const tvgIdMatch = line.match(/tvg-id="([^"]*)"/i);
        if (tvgIdMatch && tvgIdMatch[1]) currentTvgId = tvgIdMatch[1];

        const tvgNameMatch = line.match(/tvg-name="([^"]*)"/i);
        if (tvgNameMatch && tvgNameMatch[1]) currentName = tvgNameMatch[1];

        const commaIndex = line.lastIndexOf(',');
        if (commaIndex !== -1 && commaIndex < line.length - 1) {
          const afterComma = line.substring(commaIndex + 1).trim();
          if (afterComma) currentName = afterComma;
        }
      } else if (line.length > 0 && !line.startsWith('#')) {
        const streamUrl = line;
        const id = currentTvgId || generateChannelId(currentName, streamUrl, parsedChannels.length);
        parsedChannels.push({
          id,
          name: currentName || `Channel ${parsedChannels.length + 1}`,
          category: currentCategory || 'General',
          streamUrl,
          logoUrl: currentLogo || '📺',
          country: currentCountry || 'Global',
          isFavorite: false,
        });

        currentName = 'Live Channel';
        currentCategory = 'General';
        currentLogo = '📺';
        currentCountry = 'Global';
        currentTvgId = '';
      }
    }

    return parsedChannels;
  };

  const loadM3UFromSource = async (source: string, label: string): Promise<IPTVChannel[]> => {
    setLoadProgress(`Fetching ${label}...`);
    const text = await tryFetchWithCors(source);
    setLoadProgress(`Parsing ${label}...`);
    const channels = parseM3UContent(text);
    setLoadProgress('');
    return channels;
  };

  const handleLoadDefaultM3U = async () => {
    setIsLoadingDefault(true);
    setLoadProgress('');
    try {
      let lastError: Error | null = null;
      let channels: IPTVChannel[] = [];

      for (const url of DEFAULT_PLAYLISTS) {
        try {
          const hostname = new URL(url).hostname;
          setLoadProgress(`Trying ${hostname}...`);
          channels = await loadM3UFromSource(url, 'default playlist');
          if (channels.length > 0) break;
        } catch (err) {
          lastError = err as Error;
        }
      }

      if (channels.length > 0) {
        setIptvChannels((prev) => [...channels, ...prev]);
        if (!selectedIPTVChannel) setSelectedIPTVChannel(channels[0]);
        showToast('Default Playlist Loaded', `Imported ${channels.length} channels from iptv-org directory`, 'success');
      } else {
        const reason = lastError?.message || 'Unknown error';
        const is404 = reason.includes('404');
        if (is404) {
          showToast('Playlist Unavailable', 'iptv-org GitHub Pages returned 404. Check if the repository has moved.', 'warning');
        } else {
          showToast('Load Error', `No channels found (${channels.length} total). Reason: ${reason}`, 'warning');
        }
      }
    } catch (err: any) {
      showToast('Load Error', `Failed to load default playlist: ${err.message}`, 'error');
    } finally {
      setIsLoadingDefault(false);
      setLoadProgress('');
    }
  };

  const handleImportM3uText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!m3uText.trim()) return;

    try {
      const newChannels = parseM3UContent(m3uText);
      if (newChannels.length > 0) {
        setIptvChannels((prev) => [...newChannels, ...prev]);
        if (!selectedIPTVChannel) setSelectedIPTVChannel(newChannels[0]);
        showToast('M3U Playlist Parsed', `Successfully imported ${newChannels.length} live stream channels.`, 'success');
        setM3uText('');
      } else {
        showToast('M3U Parse Warning', 'No valid stream URLs found. Check format (#EXTINF and URL lines).', 'warning');
      }
    } catch (err: any) {
      showToast('Parse Error', `Failed to parse M3U content: ${err.message}`, 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    setLoadProgress(`Reading ${file.name}...`);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setLoadProgress(`Parsing ${file.name}...`);
        const newChannels = parseM3UContent(content);

        if (newChannels.length > 0) {
          setIptvChannels((prev) => [...newChannels, ...prev]);
          if (!selectedIPTVChannel) setSelectedIPTVChannel(newChannels[0]);
          showToast('M3U File Loaded', `Imported ${newChannels.length} live channels from ${file.name}`, 'success');
        } else {
          showToast('M3U Empty', 'No channels extracted from selected file.', 'warning');
        }
      } catch (err: any) {
        showToast('File Read Error', `Error reading M3U file: ${err.message}`, 'error');
      } finally {
        setIsLoadingFile(false);
        setLoadProgress('');
      }
    };

    reader.readAsText(file);
  };

  const handleClearChannels = () => {
    setIptvChannels([]);
    setSelectedIPTVChannel(null);
    showToast('IPTV Cleared', 'Removed all loaded channels.', 'info');
  };

  const filteredChannels = iptvChannels.filter((ch) => {
    const matchesCategory = selectedCategory === 'all' || ch.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.country.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(iptvChannels.map((c) => c.category)));

  useEffect(() => {
    const video = videoRef.current;
    const channel = selectedIPTVChannel;
    if (!video || !channel) return;

    const url = channel.streamUrl;
    const isHls = url.includes('.m3u8') || url.includes('m3u8');

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHls && HLS.isSupported()) {
      const hls = new HLS();
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(HLS.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          const reason = data.type === HLS.ErrorTypes.NETWORK_ERROR
            ? 'Network error - stream may be offline'
            : data.type === HLS.ErrorTypes.MEDIA_ERROR
            ? 'Media decode error'
            : 'Fatal stream error';
          showToast('Stream Error', `${reason}: ${url}`, 'error');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else {
      video.src = url;
    }
  }, [selectedIPTVChannel, showToast]);

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-2xl text-red-400">
            <Tv className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Live IPTV Stream Tuner</h3>
              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono rounded flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" /> Real-time M3U Parser
              </span>
              {iptvChannels.length > 0 && (
                <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono rounded font-semibold">
                  {iptvChannels.length} channels loaded
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste .m3u playlists, upload files, or load the default iptv-org directory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleLoadDefaultM3U}
            disabled={isLoadingDefault}
            className="liquid-glass-btn px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isLoadingDefault ? (loadProgress || 'Loading...') : 'Load Default Playlist'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="liquid-glass-btn px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload .m3u</span>
          </button>

          {iptvChannels.length > 0 && (
            <button
              onClick={handleClearChannels}
              className="liquid-glass-btn px-3 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Clear all loaded IPTV channels"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept=".m3u,.m3u8,.txt"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Display */}
        <div className="lg:col-span-2 bg-black border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between min-h-[420px]">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              <h4 className="text-sm font-bold text-white">
                {selectedIPTVChannel ? selectedIPTVChannel.name : 'No Active Stream Selected'}
              </h4>
            </div>
            {selectedIPTVChannel && (
              <span className="text-[10px] font-mono text-red-400 bg-red-950/80 px-2.5 py-1 rounded-md border border-red-500/30 font-bold">
                {selectedIPTVChannel.category} • {selectedIPTVChannel.country}
              </span>
            )}
          </div>

          <div className="relative flex-1 bg-slate-950 flex items-center justify-center min-h-[340px]">
            {selectedIPTVChannel ? (
              <video
                ref={videoRef}
                key={selectedIPTVChannel.id}
                controls
                autoPlay
                className="w-full h-full object-contain max-h-[420px]"
                onError={() => showToast('Stream Error', `Unable to decode stream at ${selectedIPTVChannel.streamUrl}`, 'error')}
              />
            ) : (
              <div className="text-center text-slate-500 p-8 space-y-3">
                <Radio className="w-14 h-14 mx-auto text-red-500/40 animate-pulse" />
                <h4 className="text-sm font-bold text-white">IPTV Stream Waiting Room</h4>
                <p className="text-xs font-mono max-w-sm mx-auto text-slate-400">
                  Load the default playlist, upload an .m3u file, or paste playlist content to populate channels.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Channel List & M3U Loader Sidebar */}
        <div className="space-y-4">
          {/* M3U Loader Form & File Upload */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-red-400" />
              <span>Load Custom M3U Playlist</span>
            </h4>

            <form onSubmit={handleImportM3uText} className="space-y-2">
              <textarea
                value={m3uText}
                onChange={(e) => setM3uText(e.target.value)}
                placeholder="Paste raw M3U playlist file content (#EXTM3U ...)"
                rows={3}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 resize-none font-mono placeholder-slate-600"
              />
              <button
                type="submit"
                disabled={!m3uText.trim()}
                className="liquid-glass-btn w-full py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-500 hover:to-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Parse & Append Channels</span>
              </button>
            </form>
          </div>

          {/* Search & Channel Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Live Channels ({filteredChannels.length})
              </h4>
              <span className="text-[10px] font-mono text-red-400">Total: {iptvChannels.length}</span>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search channels, country, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans"
              />
            </div>

            {/* Category Filter Pills */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`liquid-glass-btn px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`liquid-glass-btn px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Channel List Items */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredChannels.length > 0 ? (
                filteredChannels.map((ch) => {
                  const isSelected = selectedIPTVChannel?.id === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedIPTVChannel(ch)}
                      className={`liquid-glass-btn w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-red-950/90 border-red-500 text-white shadow-lg'
                          : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {ch.logoUrl.startsWith('http') ? (
                          <img src={ch.logoUrl} alt={ch.name} className="w-5 h-5 rounded object-contain shrink-0" />
                        ) : (
                          <span className="text-base shrink-0">{ch.logoUrl}</span>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{ch.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {ch.category} • {ch.country}
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="text-[10px] font-mono text-red-400 font-bold shrink-0 ml-2">LIVE</span>
                      ) : (
                        <Play className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-500 space-y-1">
                  <Filter className="w-6 h-6 mx-auto text-slate-600" />
                  <p className="text-xs font-mono font-bold">No Channels Loaded</p>
                  <p className="text-[10px]">Load the default playlist, upload an M3U file, or paste playlist content.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
