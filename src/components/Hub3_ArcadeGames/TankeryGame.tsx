/**
 * TankeryGame Component: Girls und Panzer Anime Style Tank Tactical Simulator
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Flame, Crosshair } from 'lucide-react';

interface Tank {
  id: string;
  name: string;
  school: string;
  gunMm: number;
  armorMm: number;
  hp: number;
  maxHp: number;
  morale: number; // 0-100
}

const TANKS: Tank[] = [
  { id: 't-1', name: 'Panzer IV Ausf. H (Ooarai)', school: 'Ooarai Girls High', gunMm: 75, armorMm: 80, hp: 100, maxHp: 100, morale: 95 },
  { id: 't-2', name: 'Tiger I (Kuromorimine)', school: 'Kuromorimine Girls High', gunMm: 88, armorMm: 100, hp: 140, maxHp: 140, morale: 90 },
  { id: 't-3', name: 'Churchill Mk VII (St. Gloriana)', school: 'St. Gloriana Girls', gunMm: 75, armorMm: 152, hp: 150, maxHp: 150, morale: 88 },
  { id: 't-4', name: 'Sherman Firefly (Saunders)', school: 'Saunders University', gunMm: 76, armorMm: 76, hp: 110, maxHp: 110, morale: 92 },
];

export const TankeryGame: React.FC = () => {
  const { showToast } = useApp();
  const [selectedTank, setSelectedTank] = useState<Tank>(TANKS[0]);
  const [enemyTank, setEnemyTank] = useState<Tank>(TANKS[1]);
  const [log, setLog] = useState<string[]>(['Sensha-do Match Ready! Prepare for match.']);

  const handleFireShell = () => {
    const hitProbability = 0.75;
    const isHit = Math.random() < hitProbability;

    if (isHit) {
      const dmg = Math.floor(25 + Math.random() * 30);
      const newEnemyHp = Math.max(0, enemyTank.hp - dmg);
      setEnemyTank({ ...enemyTank, hp: newEnemyHp });

      const newLog = `💥 Direct Hit! Dealt ${dmg} damage to ${enemyTank.name}!`;
      setLog((prev) => [newLog, ...prev]);

      if (newEnemyHp === 0) {
        showToast('MATCH VICTORY!', `Sensha-do Flag Tank ${enemyTank.name} knocked out!`, 'success');
      } else {
        showToast('Shell Penetrated!', `Dealt ${dmg} damage.`, 'success');
      }
    } else {
      setLog((prev) => ['Ricochet! Shell bounced off front armor.', ...prev]);
      showToast('Ricochet!', 'Shell bounced off sloped armor.', 'warning');
    }

    // Enemy Retaliation
    setTimeout(() => {
      if (enemyTank.hp > 0) {
        const retDmg = Math.floor(15 + Math.random() * 25);
        const newPlayerHp = Math.max(0, selectedTank.hp - retDmg);
        setSelectedTank({ ...selectedTank, hp: newPlayerHp });
        setLog((prev) => [`⚠️ Enemy returned fire! Took ${retDmg} damage.`, ...prev]);
      }
    }, 1000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Shield className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Girls und Panzer Tankery Tactical</h3>
        </div>
        <span className="text-xs font-mono text-pink-400 font-bold bg-pink-950/80 px-3 py-1 rounded-full border border-pink-500/30">
          Sensha-do Official Match
        </span>
      </div>

      {/* Tank vs Tank Display */}
      <div className="grid grid-cols-2 gap-4">
        {/* Player Tank */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] text-pink-400 font-mono font-bold uppercase">{selectedTank.school}</span>
          <h4 className="text-xs font-bold text-white truncate">{selectedTank.name}</h4>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${(selectedTank.hp / selectedTank.maxHp) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-mono text-right">
            HP: {selectedTank.hp} / {selectedTank.maxHp}
          </p>
        </div>

        {/* Enemy Tank */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] text-rose-400 font-mono font-bold uppercase">{enemyTank.school}</span>
          <h4 className="text-xs font-bold text-white truncate">{enemyTank.name}</h4>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-rose-500 h-full transition-all"
              style={{ width: `${(enemyTank.hp / enemyTank.maxHp) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-mono text-right">
            HP: {enemyTank.hp} / {enemyTank.maxHp}
          </p>
        </div>
      </div>

      {/* Combat Actions */}
      <button
        onClick={handleFireShell}
        disabled={selectedTank.hp === 0 || enemyTank.hp === 0}
        className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40"
      >
        <Crosshair className="w-5 h-5" />
        <span>FIRE APHE SHELL</span>
      </button>

      {/* Combat Log */}
      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 max-h-32 overflow-y-auto text-[11px] font-mono text-slate-300">
        {log.map((entry, idx) => (
          <p key={idx}>{entry}</p>
        ))}
      </div>
    </div>
  );
};
