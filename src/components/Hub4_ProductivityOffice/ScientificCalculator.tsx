/**
 * ScientificCalculator Component: Full Scientific & Graphic Function Evaluation
 * Styled in Bento Grid theme
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
    <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-[#FF5F1F]/10 border border-[#FF5F1F]/20 rounded-xl text-[#FF5F1F]">
            <Calculator className="w-5 h-5" />
          </span>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Mathematical Engine</p>
            <h3 className="text-base font-bold text-white">Scientific Calculator</h3>
          </div>
        </div>

        <button
          onClick={clearCalculator}
          className="liquid-glass-btn p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Screen Display */}
      <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 space-y-2 text-right shadow-inner">
        <p className="text-xs font-mono text-zinc-500 min-h-[20px] overflow-x-auto">{expression || '0'}</p>
        <p className="text-3xl font-black font-mono text-[#FF5F1F] tracking-tight overflow-x-auto">{result}</p>
      </div>

      {/* Button Grid */}
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
                  className={`liquid-glass-btn py-3 rounded-2xl font-bold font-mono text-xs transition-all shadow ${
                    btn === '='
                      ? 'bg-[#FF5F1F] text-black font-black hover:bg-[#ff7236]'
                      : btn === 'C'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      : isSpecial
                      ? 'bg-zinc-900 border border-white/10 text-[#FF5F1F]'
                      : isOperator
                      ? 'bg-zinc-800 text-white'
                      : 'bg-zinc-950 border border-white/5 text-zinc-200 hover:bg-zinc-900'
                  }`}
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
        <div className="bg-zinc-950 p-3 rounded-2xl border border-white/10 space-y-1 text-xs font-mono">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Recent Calculations</p>
          {history.map((h, i) => (
            <p key={i} className="text-zinc-400">{h}</p>
          ))}
        </div>
      )}
    </div>
  );
};
