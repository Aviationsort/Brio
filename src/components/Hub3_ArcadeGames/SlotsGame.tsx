/**
 * SlotsGame Component: 3-Reel Animated Casino Slots
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Coins, RefreshCw } from 'lucide-react';

const SYMBOLS = ['🎰', '💎', '🚀', '🍒', '7️⃣', '🔔', '⭐'];

export const SlotsGame: React.FC = () => {
  const { showToast } = useApp();
  const [balance, setBalance] = useState(500);
  const [bet, setBet] = useState(20);
  const [reels, setReels] = useState(['🎰', '🎰', '🎰']);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);

  const handleSpin = () => {
    if (balance < bet) {
      showToast('Insufficient Credits', 'Top up or reduce bet amount.', 'warning');
      return;
    }

    setBalance((b) => b - bet);
    setSpinning(true);
    setLastWin(0);

    let count = 0;
    const interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
      count++;

      if (count > 15) {
        clearInterval(interval);
        setSpinning(false);

        // Final Result
        const finalReels = [
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        ];
        setReels(finalReels);

        // Check Win
        if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
          const winAmount = bet * 10;
          setBalance((b) => b + winAmount);
          setLastWin(winAmount);
          showToast('JACKPOT!', `Matched 3x ${finalReels[0]}! Won ${winAmount} Credits!`, 'success');
        } else if (
          finalReels[0] === finalReels[1] ||
          finalReels[1] === finalReels[2] ||
          finalReels[0] === finalReels[2]
        ) {
          const winAmount = bet * 2;
          setBalance((b) => b + winAmount);
          setLastWin(winAmount);
          showToast('Match 2!', `Matched 2 symbols! Won ${winAmount} Credits!`, 'success');
        }
      }
    }, 100);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-6 text-center">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-amber-400">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Casino Slots</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
          <Coins className="w-4 h-4" />
          <span>{balance} Credits</span>
        </div>
      </div>

      {/* 3 Reels Display */}
      <div className="bg-slate-950 p-6 rounded-3xl border-2 border-amber-500/30 shadow-2xl flex items-center justify-center gap-4">
        {reels.map((sym, i) => (
          <div
            key={i}
            className={`liquid-glass-btn w-20 h-24 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 flex items-center justify-center text-4xl shadow-inner transition-all ${
              spinning ? 'animate-bounce' : ''
            }`}
          >
            {sym}
          </div>
        ))}
      </div>

      {lastWin > 0 && (
        <p className="text-sm font-black font-mono text-emerald-400 animate-pulse">
          🎉 YOU WON +{lastWin} CREDITS!
        </p>
      )}

      {/* Bet & Spin Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs font-semibold text-slate-300">Bet:</span>
          {[10, 20, 50, 100].map((val) => (
            <button
              key={val}
              onClick={() => setBet(val)}
              className={`liquid-glass-btn px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                bet === val
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {val}
            </button>
          ))}
        </div>

        <button
          onClick={handleSpin}
          disabled={spinning}
          className="liquid-glass-btn w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:scale-[1.02] active:scale-95 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
          <span>{spinning ? 'SPINNING...' : 'SPIN REELS'}</span>
        </button>
      </div>
    </div>
  );
};
