/**
 * TacticalRiskGame Component: HOI4 / Risk Tactical Map Simulator for Lebanon & Cyprus
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Shield, Swords, Sun, CloudRain } from 'lucide-react';

interface Territory {
  id: string;
  name: string;
  country: 'Lebanon' | 'Cyprus';
  troops: number;
  controlledBy: 'Blue Force' | 'Red Force' | 'Neutral';
  strategicValue: number;
}

const LEBANON_TERRITORIES: Territory[] = [
  { id: 'leb-1', name: 'Beirut Central HQ', country: 'Lebanon', troops: 45, controlledBy: 'Blue Force', strategicValue: 100 },
  { id: 'leb-2', name: 'Mount Lebanon Sector', country: 'Lebanon', troops: 30, controlledBy: 'Blue Force', strategicValue: 70 },
  { id: 'leb-3', name: 'North / Tripoli Port', country: 'Lebanon', troops: 25, controlledBy: 'Red Force', strategicValue: 80 },
  { id: 'leb-4', name: 'South / Sidon-Tyre', country: 'Lebanon', troops: 35, controlledBy: 'Blue Force', strategicValue: 85 },
  { id: 'leb-5', name: 'Bekaa Valley Logistics', country: 'Lebanon', troops: 20, controlledBy: 'Red Force', strategicValue: 60 },
];

const CYPRUS_TERRITORIES: Territory[] = [
  { id: 'cyp-1', name: 'Nicosia Capital Sector', country: 'Cyprus', troops: 50, controlledBy: 'Blue Force', strategicValue: 100 },
  { id: 'cyp-2', name: 'Larnaca International Port', country: 'Cyprus', troops: 40, controlledBy: 'Blue Force', strategicValue: 90 },
  { id: 'cyp-3', name: 'Limassol Maritime Command', country: 'Cyprus', troops: 35, controlledBy: 'Blue Force', strategicValue: 85 },
  { id: 'cyp-4', name: 'Paphos Airbase Sector', country: 'Cyprus', troops: 25, controlledBy: 'Red Force', strategicValue: 75 },
  { id: 'cyp-5', name: 'Famagusta Bay', country: 'Cyprus', troops: 30, controlledBy: 'Red Force', strategicValue: 70 },
  { id: 'cyp-6', name: 'Kyrenia Range Sector', country: 'Cyprus', troops: 20, controlledBy: 'Red Force', strategicValue: 65 },
];

export const TacticalRiskGame: React.FC = () => {
  const { showToast } = useApp();
  const [selectedCountry, setSelectedCountry] = useState<'Lebanon' | 'Cyprus'>('Lebanon');
  const [territories, setTerritories] = useState<Territory[]>(LEBANON_TERRITORIES);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(LEBANON_TERRITORIES[0]);
  const [weather, setWeather] = useState<'Clear Sky' | 'Heavy Storm' | 'Foggy'>('Clear Sky');
  const [commandPoints, setCommandPoints] = useState(120);

  const switchMap = (country: 'Lebanon' | 'Cyprus') => {
    setSelectedCountry(country);
    const newTer = country === 'Lebanon' ? LEBANON_TERRITORIES : CYPRUS_TERRITORIES;
    setTerritories(newTer);
    setSelectedTerritory(newTer[0]);
  };

  const handleDeployTroops = (id: string) => {
    if (commandPoints < 10) return;
    setCommandPoints((cp) => cp - 10);
    setTerritories((prev) =>
      prev.map((t) => (t.id === id ? { ...t, troops: t.troops + 5 } : t))
    );
    showToast('Logistics Dispatched', 'Reinforced +5 Divisions to sector.', 'success');
  };

  const handleLaunchOffensive = (id: string) => {
    if (commandPoints < 25) return;
    setCommandPoints((cp) => cp - 25);

    const victory = Math.random() > 0.35;
    if (victory) {
      setTerritories((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, controlledBy: 'Blue Force', troops: Math.floor(t.troops * 1.2) } : t
        )
      );
      showToast('OFFENSIVE VICTORY!', `Captured ${selectedTerritory?.name} sector!`, 'success');
    } else {
      showToast('Offensive Repelled', 'Heavy defensive resistance encountered.', 'warning');
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">HOI4 / Risk Tactical Command</h3>
            <p className="text-xs text-slate-400">Lebanon & Cyprus Map Operations</p>
          </div>
        </div>

        {/* Country Selector */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
          <button
            onClick={() => switchMap('Lebanon')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCountry === 'Lebanon'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇱🇧 Lebanon Map
          </button>
          <button
            onClick={() => switchMap('Cyprus')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCountry === 'Cyprus'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇨🇾 Cyprus Map
          </button>
        </div>
      </div>

      {/* Map Overview & Territory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Territory Cards */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {selectedCountry} Strategic Sectors
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {territories.map((t) => {
              const isSelected = selectedTerritory?.id === t.id;
              const isBlue = t.controlledBy === 'Blue Force';

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTerritory(t)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[110px] ${
                    isSelected
                      ? 'bg-slate-800 border-rose-500 shadow-xl'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{t.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isBlue ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {t.controlledBy}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-3">
                    <span>Troops: {t.troops} Div</span>
                    <span>Value: {t.strategicValue}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Command Panel */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Command Points:</span>
            <span className="font-bold text-amber-400">{commandPoints} CP</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <p className="font-bold text-white">{selectedTerritory?.name}</p>
            <p className="text-[11px] text-slate-400">Control: {selectedTerritory?.controlledBy}</p>
            <p className="text-[11px] text-slate-400">Divisions: {selectedTerritory?.troops}</p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => selectedTerritory && handleDeployTroops(selectedTerritory.id)}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Deploy +5 Divisions (10 CP)</span>
            </button>

            <button
              onClick={() => selectedTerritory && handleLaunchOffensive(selectedTerritory.id)}
              className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
            >
              <Swords className="w-4 h-4" />
              <span>Launch Tactical Assault (25 CP)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
