/**
 * Core 5-Hub Navigation Component
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { HubId } from '../../types';
import { MessageSquare, Music, Gamepad2, Briefcase, Plane } from 'lucide-react';

interface HubTab {
  id: HubId;
  labelKey: 'connectHub' | 'mediaHub' | 'arcadeHub' | 'officeHub' | 'telemetryHub';
  icon: React.ElementType;
  badge?: string;
  gradient: string;
}

const HUBS: HubTab[] = [
  {
    id: 'connect',
    labelKey: 'connectHub',
    icon: MessageSquare,
    badge: 'Messaging & Feed',
    gradient: 'from-red-500 to-[#8B0000]',
  },
  {
    id: 'media',
    labelKey: 'mediaHub',
    icon: Music,
    badge: 'Nightcore & IPTV',
    gradient: 'from-red-600 to-[#8B0000]',
  },
  {
    id: 'arcade',
    labelKey: 'arcadeHub',
    icon: Gamepad2,
    badge: '11 Arcade Games',
    gradient: 'from-red-500 to-[#8B0000]',
  },
  {
    id: 'office',
    labelKey: 'officeHub',
    icon: Briefcase,
    badge: 'PDF & Notes & Calc',
    gradient: 'from-red-600 to-[#8B0000]',
  },
  {
    id: 'telemetry',
    labelKey: 'telemetryHub',
    icon: Plane,
    badge: 'Optics & Timetables',
    gradient: 'from-red-500 to-[#8B0000]',
  },
];

export const Navigation: React.FC = () => {
  const { activeHub, setActiveHub, t } = useApp();

  return (
    <nav className="bg-[#0a0a0c]/90 border-b border-white/10 px-4 py-2.5 sticky top-[61px] z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2.5">
        {HUBS.map((hub) => {
          const Icon = hub.icon;
          const isActive = activeHub === hub.id;
          const label = t[hub.labelKey];

          return (
            <button
              key={hub.id}
              onClick={() => setActiveHub(hub.id)}
              className={`skeuo-tab relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 select-none ${
                  isActive
                    ? 'skeuo-tab--active bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg shadow-red-900/20 border border-red-400/40'
                    : 'bg-[#1a1a1a] border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
            >
              <div
                className={`skeuo-btn p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-black text-red-400' : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="text-left">
                <p className="leading-tight font-extrabold">{label}</p>
                <p className={`text-[9px] font-medium hidden lg:block mt-0.5 ${isActive ? 'text-white/70' : 'text-zinc-500'}`}>
                  {hub.badge}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
