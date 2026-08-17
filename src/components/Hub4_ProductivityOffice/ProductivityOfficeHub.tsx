/**
 * Hub 4: Office & Productivity Container
 * Includes Office Hub (Notes & Todos) and Graphic/Scientific Calculator
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OfficeHub } from './OfficeHub';
import { ScientificCalculator } from './ScientificCalculator';
import { Briefcase, Calculator } from 'lucide-react';

export const ProductivityOfficeHub: React.FC = () => {
  const { t } = useApp();
  const [subTab, setSubTab] = useState<'office' | 'calculator'>('office');

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
          <span>{t.graphicScientificCalculator}</span>
        </button>
      </div>

      {/* Sub-tab Content */}
      <div className="transition-all duration-300">
        {subTab === 'office' && <OfficeHub />}
        {subTab === 'calculator' && <ScientificCalculator />}
      </div>
    </div>
  );
};
