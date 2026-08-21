/**
 * Hub 4: Office & Productivity Container
 * Includes Office Hub (Notes & Todos), Graphic/Scientific Calculator, and Text Editor
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OfficeHub } from './OfficeHub';
import { ScientificCalculator } from './ScientificCalculator';
import { Briefcase, Calculator, Type, Bold, Italic, Underline, List, AlignLeft } from 'lucide-react';

export const ProductivityOfficeHub: React.FC = () => {
  const { t } = useApp();
  const [subTab, setSubTab] = useState<'office' | 'calculator' | 'editor'>('office');

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 aero-panel overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab('office')}
          className={`skeuo-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'office'
              ? ''
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{t.officeProductivitySuite}</span>
        </button>

        <button
          onClick={() => setSubTab('calculator')}
          className={`skeuo-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'calculator'
              ? ''
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{t.calculator}</span>
        </button>

        <button
          onClick={() => setSubTab('editor')}
          className={`skeuo-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'editor'
              ? ''
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Text Editor</span>
        </button>
      </div>

      {/* Sub-tab Content */}
      <div className="transition-all duration-300">
        {subTab === 'office' && <OfficeHub />}
        {subTab === 'calculator' && <ScientificCalculator />}
        {subTab === 'editor' && (
          <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                  <Type className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Draft</p>
                  <h3 className="text-base font-bold text-white">Quick Text Editor</h3>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-4 min-h-[300px] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.03),inset_-2px_-2px_4px_rgba(0,0,0,0.5)]">
              <textarea
                placeholder="Start typing your document here..."
                className="w-full h-full bg-transparent border-none outline-none resize-none text-sm text-white placeholder-zinc-500 min-h-[250px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="liquid-glass-btn p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-white/10 transition-all">
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button className="liquid-glass-btn p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-white/10 transition-all">
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button className="liquid-glass-btn p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-white/10 transition-all">
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button className="liquid-glass-btn p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-white/10 transition-all">
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
