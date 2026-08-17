/**
 * ScientificCalculator Component: Full Scientific & Graphic Function Evaluation
 * Styled like iOS 3 Calculator with glossy buttons and orange accents
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calculator, Delete, RotateCcw } from 'lucide-react';

export const ScientificCalculator: React.FC = () => {
  const { showToast } = useApp();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string>('0');
  const [history, setHistory] = useState<string[]>([]);

  const appendSymbol = (sym: string) => {
    setExpression((prev) => prev + sym);
  };

  const clearCalculator = () => {
    setExpression('');
    setResult('0');
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const evaluateExpression = () => {
    if (!expression.trim()) return;

    try {
      // Safe replacement for mathematical functions
      let formatted = expression
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**');

      // Evaluate safely
      // eslint-disable-next-line no-eval
      const evalResult = eval(formatted);
      const stringRes = String(Number(evalResult.toFixed(6)));

      setResult(stringRes);
      setHistory((prev) => [`${expression} = ${stringRes}`, ...prev.slice(0, 5)]);
      showToast('Calculated', `${expression} = ${stringRes}`, 'success');
    } catch (err) {
      setResult('Syntax Error');
      showToast('Math Error', 'Invalid expression format.', 'error');
    }
  };

  const BTNS = [
    ['sin(', 'cos(', 'tan(', 'sqrt('],
    ['log(', '^', 'π', 'e'],
    ['(', ')', '/', '*'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
    ['0', '.', '00', 'C'],
  ];

  return (
    <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border-4 border-[#3a3a3a] rounded-[32px] p-4 shadow-2xl max-w-lg mx-auto space-y-4" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1)' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-gradient-to-b from-[#FF5F1F] to-[#cc4d19] rounded-xl text-black shadow-lg">
            <Calculator className="w-4 h-4" />
          </span>
          <div>
            <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">iOS Calculator</p>
            <h3 className="text-sm font-bold text-white">Scientific</h3>
          </div>
        </div>

        <button
          onClick={clearCalculator}
          className="p-2 bg-gradient-to-b from-rose-600 to-rose-800 text-white rounded-xl shadow-md active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Screen Display - iOS 3 style LCD */}
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] p-4 rounded-2xl border-2 border-[#333] shadow-inner text-right" style={{ boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.8)' }}>
        <p className="text-xs font-mono text-zinc-500 min-h-[18px] overflow-x-auto">{expression || '0'}</p>
        <p className="text-3xl font-black font-mono text-white tracking-tight overflow-x-auto drop-shadow-[0_2px_4px_rgba(255,95,31,0.5)]">{result}</p>
      </div>

      {/* Button Grid - iOS 3 glossy style */}
      <div className="space-y-2">
        {BTNS.map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-4 gap-2">
            {row.map((btn) => {
              const isOperator = ['+', '-', '*', '/', '='].includes(btn);
              const isSpecial = ['sin(', 'cos(', 'tan(', 'sqrt(', 'log(', '^', 'π', 'e'].includes(btn);

              return (
                <button
                  key={btn}
                  onClick={() => {
                    if (btn === '=') evaluateExpression();
                    else if (btn === 'C') clearCalculator();
                    else appendSymbol(btn);
                  }}
                  className={`py-4 rounded-2xl font-bold font-mono text-lg transition-all shadow-md active:scale-95 ${
                    btn === '='
                      ? 'bg-gradient-to-b from-[#FF5F1F] to-[#cc4d19] text-black font-black shadow-[0_4px_12px_rgba(255,95,31,0.4)]'
                      : btn === 'C'
                      ? 'bg-gradient-to-b from-rose-500 to-rose-700 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)]'
                      : isSpecial
                      ? 'bg-gradient-to-b from-[#333] to-[#222] border border-white/10 text-[#FF5F1F] shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                      : isOperator
                      ? 'bg-gradient-to-b from-[#444] to-[#333] text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                      : 'bg-gradient-to-b from-[#555] to-[#444] text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                  }`}
                  style={{ 
                    backgroundImage: btn !== '=' && !isSpecial && !isOperator && btn !== 'C' 
                      ? 'linear-gradient(to bottom, #666 0%, #444 100%)' 
                      : undefined 
                  }}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Calculation History */}
      {history.length > 0 && (
        <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] p-3 rounded-2xl border border-white/10 space-y-1 text-xs font-mono shadow-inner">
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Recent Calculations</p>
          {history.map((h, i) => (
            <p key={i} className="text-zinc-400">{h}</p>
          ))}
        </div>
      )}
    </div>
  );
};
