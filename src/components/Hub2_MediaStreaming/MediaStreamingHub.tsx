/**
 * Hub 2: Media & Streaming Container
 * Includes Nightcore Music/Video Player
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NightcorePlayer } from './NightcorePlayer';
import { Music } from 'lucide-react';

export const MediaStreamingHub: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="space-y-4">
      <div className="skeuo-panel p-1.5 flex items-center gap-2">
        <div className="skeuo-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 bg-gradient-to-b from-[#3a3a40] to-[#1f1f24] text-white border border-white/20 shadow-lg shadow-black/40">
          <div className="skeuo-btn p-1 rounded-lg bg-black text-red-400">
            <Music className="w-4 h-4" />
          </div>
          <span>{t.nightcorePlayer}</span>
        </div>
      </div>

      <div className="transition-all duration-300">
        <NightcorePlayer />
      </div>
    </div>
  );
};
