/**
 * Hub 1: Connect & Social Suite Container
 * Includes Messaging, Social Feed, Call Dialer, and Stickers Vault
 */

import React, { useState } from 'react';
import { Messaging } from './Messaging';
import { SocialFeed } from './SocialFeed';
import { CallDialer } from './CallDialer';
import { StickersVault } from './StickersVault';
import { MessageSquare, Rss, Phone, Smile } from 'lucide-react';

export const ConnectSocialHub: React.FC = () => {
  const [subTab, setSubTab] = useState<'messaging' | 'feed' | 'dialer' | 'stickers'>('messaging');

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab('messaging')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'messaging'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Encrypted Messaging</span>
        </button>

        <button
          onClick={() => setSubTab('feed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'feed'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Rss className="w-4 h-4" />
          <span>Algorithmic Feed</span>
        </button>

        <button
          onClick={() => setSubTab('dialer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'dialer'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Call Dialer & Emergency</span>
        </button>

        <button
          onClick={() => setSubTab('stickers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'stickers'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>Stickers Vault</span>
        </button>
      </div>

      {/* Render Sub-tab Content */}
      <div className="transition-all duration-300">
        {subTab === 'messaging' && <Messaging />}
        {subTab === 'feed' && <SocialFeed />}
        {subTab === 'dialer' && <CallDialer />}
        {subTab === 'stickers' && <StickersVault />}
      </div>
    </div>
  );
};
