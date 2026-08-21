import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { IPTVChannel } from '../../types';
import { Tv, Play, Plus, RefreshCw, Radio, Search, Upload, CheckCircle2, ShieldCheck, Filter, Trash2, Globe } from 'lucide-react';

export const IPTVPlayer: React.FC = () => {
  const { iptvChannels, setIptvChannels, selectedIPTVChannel, setSelectedIPTVChannel, showToast } = useApp();
  const [m3uText, setM3uText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isLoadingDefault, setIsLoadingDefault] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // M3U Playlist Parser Logic
  const parseM3UContent = (content: string): IPTVChannel[] => {
    const lines = content.split('\n');
    const parsedChannels: IPTVChannel[] = [];

    let currentName = 'Live Channel';
    let currentCategory = 'General';
    let currentLogo = '📺';
    let currentCountry = 'Global';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('#EXTINF:')) {
        const groupMatch = line.match(/group-title="([^"]+)"/i);
        if (groupMatch && groupMatch[1]) {
          currentCategory = groupMatch[1];
        }

        const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
        if (logoMatch && logoMatch[1]) {
          currentLogo = logoMatch[1];
        }

        const countryMatch = line.match(/tvg-country="([^"]+)"/i);
        if (countryMatch && countryMatch[1]) {
          currentCountry = countryMatch[1];
        }

        const commaIndex = line.lastIndexOf(',');
        if (commaIndex !== -1) {
          currentName = line.substring(commaIndex + 1).trim();
        }
      } else if (line.length > 0 && !line.startsWith('#')) {
        const streamUrl = line;
        parsedChannels.push({
          id: `iptv-${Date.now()}-${parsedChannels.length}-${Math.random().toString(36).substring(2, 6)}`,
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
      }
    }

    return parsedChannels;
  };

  const handleLoadDefaultM3U = async () => {
    setIsLoadingDefault(true);
    try {
      showToast('Loading Playlist', 'Fetching default iptv-org playlist...', 'info');
      const res = await fetch('https://iptv-org.github.io/iptv/index.m3u');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const newChannels = parseM3UContent(text);
      if (newChannels.length > 0) {
        setIptvChannels((prev) => [...newChannels, ...prev]);
        if (!selectedIPTVChannel) setSelectedIPTVChannel(newChannels[0]);
        showToast('Default Playlist Loaded', `Imported ${newChannels.length} channels from iptv-org`, 'success');
      } else {
        showToast('Parse Warning', 'No channels found in default playlist', 'warning');
      }
    } catch (err: any) {
      showToast('Load Error', `Failed to load default playlist: ${err.message}`, 'error');
    } finally {
      setIsLoadingDefault(false);
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
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-2xl text-purple-400">
            <Tv className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Live IPTV Stream Tuner</h3>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono rounded flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" /> Real-time M3U Parser
              </span>
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
            className="liquid-glass-btn px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isLoadingDefault ? 'Loading...' : 'Load Default Playlist'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="liquid-glass-btn px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
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
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-md border border-purple-500/30 font-bold">
                {selectedIPTVChannel.category} • {selectedIPTVChannel.country}
              </span>
            )}
          </div>

          <div className="relative flex-1 bg-slate-950 flex items-center justify-center min-h-[340px]">
            {selectedIPTVChannel ? (
              <video
                key={selectedIPTVChannel.id}
                controls
                autoPlay
                className="w-full h-full object-contain max-h-[420px]"
                src={selectedIPTVChannel.streamUrl}
                onError={() => {
                  showToast('Stream Error', `Unable to decode stream at ${selectedIPTVChannel.streamUrl}`, 'error');
                }}
              />
            ) : (
              <div className="text-center text-slate-500 p-8 space-y-3">
                <Radio className="w-14 h-14 mx-auto text-purple-500/40 animate-pulse" />
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
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Load Custom M3U Playlist</span>
            </h4>

            <form onSubmit={handleImportM3uText} className="space-y-2">
              <textarea
                value={m3uText}
                onChange={(e) => setM3uText(e.target.value)}
                placeholder="Paste raw M3U playlist file content (#EXTM3U ...)"
                rows={3}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 resize-none font-mono placeholder-slate-600"
              />
              <button
                type="submit"
                disabled={!m3uText.trim()}
                className="liquid-glass-btn w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
              <span className="text-[10px] font-mono text-purple-400">Total: {iptvChannels.length}</span>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search channels, country, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
              />
            </div>

            {/* Category Filter Pills */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`liquid-glass-btn px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-purple-600 text-white'
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
                        ? 'bg-purple-600 text-white'
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
                          ? 'bg-purple-950/90 border-purple-500 text-white shadow-lg'
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
                        <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0 ml-2">LIVE</span>
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
