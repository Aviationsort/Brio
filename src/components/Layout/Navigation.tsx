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
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'media',
    labelKey: 'mediaHub',
    icon: Music,
    badge: 'Nightcore & IPTV',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'arcade',
    labelKey: 'arcadeHub',
    icon: Gamepad2,
    badge: '11 Arcade Games',
    gradient: 'from-amber-500 to-rose-600',
  },
  {
    id: 'office',
    labelKey: 'officeHub',
    icon: Briefcase,
    badge: 'PDF & Notes & Calc',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'telemetry',
    labelKey: 'telemetryHub',
    icon: Plane,
    badge: 'Optics & Timetables',
    gradient: 'from-sky-500 to-indigo-600',
  },
];

export const Navigation: React.FC = () => {
  const { activeHub, setActiveHub, t } = useApp();

  return (
    <nav className="bg-[#0A0A0A]/90 border-b border-white/10 px-4 py-2.5 sticky top-[61px] z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2.5">
        {HUBS.map((hub) => {
          const Icon = hub.icon;
          const isActive = activeHub === hub.id;
          const label = t[hub.labelKey];

          return (
            <button
              key={hub.id}
              onClick={() => setActiveHub(hub.id)}
              className={`liquid-glass-btn relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 select-none ${
                isActive
                  ? 'bg-[#FF5F1F] text-black shadow-lg shadow-[#FF5F1F]/20'
                  : 'bg-[#141414] border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <div
                className={`liquid-glass-btn p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-black text-[#FF5F1F]' : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="text-left">
                <p className="leading-tight font-extrabold">{label}</p>
                <p className={`text-[9px] font-medium hidden lg:block mt-0.5 ${isActive ? 'text-black/70' : 'text-zinc-500'}`}>
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
