/**
 * Hub 2: Media & Nightcore Streaming Container
 * Includes Nightcore Music/Video Player, IPTV Stream Player, and RSS News Reader
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NightcorePlayer } from './NightcorePlayer';
import { IPTVPlayer } from './IPTVPlayer';
import { RSSReader } from './RSSReader';
import { Music, Tv, Rss } from 'lucide-react';

export const MediaStreamingHub: React.FC = () => {
  const { t } = useApp();
  const [subTab, setSubTab] = useState<'nightcore' | 'iptv' | 'rss'>('nightcore');

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 aero-panel overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab('nightcore')}
          className={`ife-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'nightcore'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg shadow-red-900/30 border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>{t.nightcorePlayer}</span>
        </button>

        <button
          onClick={() => setSubTab('iptv')}
          className={`ife-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'iptv'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg shadow-red-900/30 border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>{t.iptvPlayer}</span>
        </button>

        <button
          onClick={() => setSubTab('rss')}
          className={`ife-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'rss'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg shadow-red-900/30 border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Rss className="w-4 h-4" />
          <span>{t.rssReader}</span>
        </button>
      </div>

      {/* Sub-tab Content */}
      <div className="transition-all duration-300">
        {subTab === 'nightcore' && <NightcorePlayer />}
        {subTab === 'iptv' && <IPTVPlayer />}
        {subTab === 'rss' && <RSSReader />}
      </div>
    </div>
  );
};
