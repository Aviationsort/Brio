/**
 * Hub 4: Office & Productivity Container
 * Includes Office Hub (Notes & Todos), PDF Annotator & Editor, and Graphic/Scientific Calculator
 */

import React, { useState } from 'react';
import { OfficeHub } from './OfficeHub';
import { PDFEditor } from './PDFEditor';
import { ScientificCalculator } from './ScientificCalculator';
import { Briefcase, FileText, Calculator } from 'lucide-react';

export const ProductivityOfficeHub: React.FC = () => {
  const [subTab, setSubTab] = useState<'office' | 'pdf' | 'calculator'>('office');

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab('office')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'office'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Office Productivity Suite</span>
        </button>

        <button
          onClick={() => setSubTab('pdf')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'pdf'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>PDF Annotator & Editor</span>
        </button>

        <button
          onClick={() => setSubTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'calculator'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Graphic & Scientific Calculator</span>
        </button>
      </div>

      {/* Sub-tab Content */}
      <div className="transition-all duration-300">
        {subTab === 'office' && <OfficeHub />}
        {subTab === 'pdf' && <PDFEditor />}
        {subTab === 'calculator' && <ScientificCalculator />}
      </div>
    </div>
  );
};
