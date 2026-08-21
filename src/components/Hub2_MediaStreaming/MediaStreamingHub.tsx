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
      <div className="flex items-center gap-2 p-1.5 nightcore-panel overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab('nightcore')}
          className={`skeuo-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'nightcore'
              ? ''
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>{t.nightcorePlayer}</span>
        </button>

        <button
          onClick={() => setSubTab('iptv')}
          className={`skeuo-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'iptv'
              ? ''
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>{t.iptvPlayer}</span>
        </button>

        <button
          onClick={() => setSubTab('rss')}
          className={`skeuo-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'rss'
              ? ''
              : 'opacity-80 hover:opacity-100'
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
