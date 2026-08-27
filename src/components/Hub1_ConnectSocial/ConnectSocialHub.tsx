/**
 * Hub 1: Connect & Social Suite Container
 * Includes Encrypted Messaging only
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Messaging } from './Messaging';
import { MessageSquare } from 'lucide-react';

export const ConnectSocialHub: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="space-y-4 aero-panel p-5 aero-glossy">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 flash-panel border border-red-500/40 rounded-xl text-red-400">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white drop-shadow-md">Connect & Social Suite</h3>
          <p className="text-xs text-red-200/90 font-medium">Encrypted messaging & secure communications</p>
        </div>
      </div>
      <Messaging />
    </div>
  );
};
