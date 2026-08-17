/**
 * Hub 1: Connect & Social Suite Container
 * Includes Messaging, Social Feed, Call Dialer, and Stickers Vault
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Messaging } from './Messaging';
import { SocialFeed } from './SocialFeed';
import { CallDialer } from './CallDialer';
import { StickersVault } from './StickersVault';
import { MessageSquare, Rss, Phone, Smile } from 'lucide-react';

export const ConnectSocialHub: React.FC = () => {
  const { t } = useApp();
  const [subTab, setSubTab] = useState<'messaging' | 'feed' | 'dialer' | 'stickers'>('messaging');

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 aero-panel overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab('messaging')}
          className={`skeuo-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'messaging'
              ? ''
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t.messaging}</span>
        </button>

        <button
          onClick={() => setSubTab('feed')}
          className={`skeuo-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'feed'
              ? ''
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          <Rss className="w-4 h-4" />
          <span>{t.socialFeed}</span>
        </button>

        <button
          onClick={() => setSubTab('dialer')}
          className={`skeuo-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'dialer'
              ? ''
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>{t.phoneDialer}</span>
        </button>

        <button
          onClick={() => setSubTab('stickers')}
          className={`skeuo-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'stickers'
              ? ''
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>{t.stickers}</span>
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
