/**
 * Hub 2: Media & Nightcore Streaming Container
 * Includes Nightcore Music/Video Player, IPTV Stream Player, and RSS News Reader
 */

import React, { useState } from 'react';
import { NightcorePlayer } from './NightcorePlayer';
import { IPTVPlayer } from './IPTVPlayer';
import { RSSReader } from './RSSReader';
import { Music, Tv, Rss } from 'lucide-react';

export const MediaStreamingHub: React.FC = () => {
  const [subTab, setSubTab] = useState<'nightcore' | 'iptv' | 'rss'>('nightcore');

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab('nightcore')}
          className={`liquid-glass-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'nightcore'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Nightcore Music & Video Player</span>
        </button>

        <button
          onClick={() => setSubTab('iptv')}
          className={`liquid-glass-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'iptv'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>IPTV Live Streams</span>
        </button>

        <button
          onClick={() => setSubTab('rss')}
          className={`liquid-glass-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'rss'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Rss className="w-4 h-4" />
          <span>RSS News Reader</span>
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
