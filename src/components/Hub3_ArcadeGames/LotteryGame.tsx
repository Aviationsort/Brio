/**
 * LotteryGame Component: Ticket Selector & Daily Draw Simulator
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Ticket, Sparkles, RefreshCw } from 'lucide-react';

export const LotteryGame: React.FC = () => {
  const { showToast } = useApp();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [matchedCount, setMatchedCount] = useState<number | null>(null);

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length < 5) {
        setSelectedNumbers([...selectedNumbers, num]);
      } else {
        showToast('Limit Reached', 'You can pick exactly 5 numbers.', 'info');
      }
    }
  };

  const handleQuickPick = () => {
    const picks: number[] = [];
    while (picks.length < 5) {
      const rand = Math.floor(Math.random() * 30) + 1;
      if (!picks.includes(rand)) picks.push(rand);
    }
    setSelectedNumbers(picks);
  };

  const handleRunDraw = () => {
    if (selectedNumbers.length !== 5) {
      showToast('Pick 5 Numbers', 'Please select 5 lucky numbers to play.', 'warning');
      return;
    }

    setDrawing(true);
    setMatchedCount(null);

    setTimeout(() => {
      const draw: number[] = [];
      while (draw.length < 5) {
        const rand = Math.floor(Math.random() * 30) + 1;
        if (!draw.includes(rand)) draw.push(rand);
      }
      setDrawnNumbers(draw);

      const matches = selectedNumbers.filter((n) => draw.includes(n)).length;
      setMatchedCount(matches);
      setDrawing(false);

      if (matches >= 3) {
        showToast('LOTTERY WINNER!', `Matched ${matches}/5 numbers! Prize awarded!`, 'success');
      } else {
        showToast('Draw Completed', `Matched ${matches}/5 numbers. Try again!`, 'info');
      }
    }, 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Ticket className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Daily Lottery Draw</h3>
        </div>
        <button
          onClick={handleQuickPick}
          className="liquid-glass-btn px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 rounded-xl transition-all"
        >
          Quick Pick
        </button>
      </div>

      {/* Grid of 30 Numbers */}
      <div>
        <p className="text-xs text-slate-400 mb-3 text-center">Select 5 numbers from 1 to 30:</p>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => {
            const isSelected = selectedNumbers.includes(num);
            return (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                className={`liquid-glass-btn py-2.5 rounded-xl font-bold font-mono text-xs transition-all ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Drawn Numbers Bar */}
      {drawnNumbers.length > 0 && (
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
          <p className="text-xs font-mono text-slate-400">Winning Drawn Numbers:</p>
          <div className="flex justify-center gap-2">
            {drawnNumbers.map((n) => (
              <span
                key={n}
                className={`liquid-glass-btn w-9 h-9 rounded-full font-bold font-mono text-sm flex items-center justify-center ${
                  selectedNumbers.includes(n)
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 font-black'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {n}
              </span>
            ))}
          </div>

          {matchedCount !== null && (
            <p className="text-xs font-bold text-cyan-400 font-mono mt-1">
              Result: Matched {matchedCount} of 5 Numbers
            </p>
          )}
        </div>
      )}

      {/* Draw Action */}
      <button
        onClick={handleRunDraw}
        disabled={drawing || selectedNumbers.length !== 5}
        className="liquid-glass-btn w-full py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40"
      >
        <Sparkles className={`w-4 h-4 ${drawing ? 'animate-spin' : ''}`} />
        <span>{drawing ? 'Drawing Lucky Balls...' : 'Simulate Daily Draw'}</span>
      </button>
    </div>
  );
};
