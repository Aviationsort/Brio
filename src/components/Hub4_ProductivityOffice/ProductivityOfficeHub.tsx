/**
 * Hub 4: Office & Productivity Container
 * Includes Office Hub (Notes & Todos), Graphic/Scientific Calculator, and Text Editor
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OfficeHub } from './OfficeHub';
import { ScientificCalculator } from './ScientificCalculator';
import { QuickNotesWidget, ClipboardManager, UnitConverter, CurrencyConverter } from '../Features';
import { Briefcase, Calculator, Type, Bold, Italic, Underline, List, AlignLeft, FileText, ClipboardList, Ruler, DollarSign } from 'lucide-react';

const navBase = 'bg-[#1a1a1a] border border-white/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.03),inset_-2px_-2px_4px_rgba(0,0,0,0.5)]';

export const ProductivityOfficeHub: React.FC = () => {
  const { t } = useApp();
  const [subTab, setSubTab] = useState<'office' | 'calculator' | 'editor' | 'quicknotes' | 'clipboard' | 'units' | 'currency'>('office');

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation */}
      <div className={`flex items-center gap-2 p-2 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/8 overflow-x-auto no-scrollbar`}>
        <button
          onClick={() => setSubTab('office')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            subTab === 'office'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>{t.officeProductivitySuite}</span>
        </button>

        <button
          onClick={() => setSubTab('calculator')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            subTab === 'calculator'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>{t.calculator}</span>
        </button>

        <button
          onClick={() => setSubTab('editor')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            subTab === 'editor'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Text Editor</span>
        </button>

        <button
          onClick={() => setSubTab('quicknotes')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            subTab === 'quicknotes'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Quick Notes</span>
        </button>

        <button
          onClick={() => setSubTab('clipboard')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            subTab === 'clipboard'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Clipboard</span>
        </button>

        <button
          onClick={() => setSubTab('units')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            subTab === 'units'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Units</span>
        </button>

        <button
          onClick={() => setSubTab('currency')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            subTab === 'currency'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Currency</span>
        </button>
      </div>

      {/* Sub-tab Content */}
      <div className="transition-all duration-300">
        {subTab === 'office' && <OfficeHub />}
        {subTab === 'calculator' && <ScientificCalculator />}
         {subTab === 'editor' && (
           <div className={`${navBase} rounded-3xl p-8 shadow-2xl space-y-5 skeuo-panel`}>
             <div className="flex items-center justify-between pb-4 border-b border-white/10">
               <div className="flex items-center gap-3">
                 <span className="p-2.5 skeuo-inset-panel border border-red-500/30 rounded-xl text-red-400">
                   <Type className="w-5 h-5" />
                 </span>
                 <div>
                   <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Draft</p>
                   <h3 className="text-base font-bold text-white">Quick Text Editor</h3>
                 </div>
               </div>
             </div>

             <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-5 min-h-[320px] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.03),inset_-2px_-2px_4px_rgba(0,0,0,0.5)]">
               <textarea
                 placeholder="Start typing your document here..."
                 className="w-full h-full bg-transparent border-none outline-none resize-none text-sm text-white placeholder-zinc-500 min-h-[280px]"
               />
             </div>

             <div className="flex items-center gap-2">
               <button className="skeuo-btn p-2.5 text-zinc-300 rounded-xl border border-white/10 transition-all">
                 <Bold className="w-3.5 h-3.5" />
               </button>
               <button className="skeuo-btn p-2.5 text-zinc-300 rounded-xl border border-white/10 transition-all">
                 <Italic className="w-3.5 h-3.5" />
               </button>
               <button className="skeuo-btn p-2.5 text-zinc-300 rounded-xl border border-white/10 transition-all">
                 <Underline className="w-3.5 h-3.5" />
               </button>
               <button className="skeuo-btn p-2.5 text-zinc-300 rounded-xl border border-white/10 transition-all">
                 <List className="w-3.5 h-3.5" />
               </button>
             </div>
           </div>
         )}
         {subTab === 'quicknotes' && <QuickNotesWidget />}
         {subTab === 'clipboard' && <ClipboardManager />}
         {subTab === 'units' && <UnitConverter />}
         {subTab === 'currency' && <CurrencyConverter />}
      </div>
    </div>
  );
};
