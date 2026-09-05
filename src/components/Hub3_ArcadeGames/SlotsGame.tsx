/**
 * SlotsGame Component: 3-Reel Animated Casino Slots with Better UI
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Coins, RefreshCw, Trophy, Zap } from 'lucide-react';

const SYMBOLS = [
  { emoji: '🎰', name: 'Jackpot', multiplier: 10 },
  { emoji: '💎', name: 'Diamond', multiplier: 8 },
  { emoji: '🚀', name: 'Rocket', multiplier: 6 },
  { emoji: '🍒', name: 'Cherry', multiplier: 4 },
  { emoji: '7️⃣', name: 'Lucky 7', multiplier: 7 },
  { emoji: '🔔', name: 'Bell', multiplier: 5 },
  { emoji: '⭐', name: 'Star', multiplier: 3 },
];

type Difficulty = 'easy' | 'medium' | 'hard';
const BET_LEVELS: Record<Difficulty, number[]> = {
  easy: [5, 10, 25],
  medium: [10, 25, 50, 100],
  hard: [25, 50, 100, 200],
};
const INITIAL_BALANCE: Record<Difficulty, number> = { easy: 1000, medium: 500, hard: 250 };

export const SlotsGame: React.FC = () => {
  const { showToast } = useApp();
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [balance, setBalance] = useState(() => INITIAL_BALANCE['medium']);
  const [bet, setBet] = useState(() => BET_LEVELS['medium'][1]);
  const [reels, setReels] = useState(['🎰', '🎰', '🎰']);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [totalWins, setTotalWins] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const spinRef = useRef<number | null>(null);

  useEffect(() => {
    if (!gameStarted) return;
    const saved = localStorage.getItem('slots_balance');
    if (saved) setBalance(parseInt(saved));
  }, [gameStarted]);

  const saveBalance = (newBalance: number) => {
    try { localStorage.setItem('slots_balance', newBalance.toString()); } catch {}
  };

  const handleSpin = () => {
    if (balance < bet) {
      showToast('Insufficient Credits', 'Top up or reduce bet amount.', 'warning');
      return;
    }

    setBalance((b) => { const nb = b - bet; saveBalance(nb); return nb; });
    setSpinning(true);
    setLastWin(0);
    setTotalSpins((prev) => prev + 1);

    if (spinRef.current) clearInterval(spinRef.current);
    let count = 0;
    spinRef.current = window.setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].emoji,
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].emoji,
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].emoji,
      ]);
      count++;

      if (count > 15) {
        if (spinRef.current) clearInterval(spinRef.current);
        setSpinning(false);

        const finalSymbols = [
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        ];
        const finalReels = finalSymbols.map((s) => s.emoji);
        setReels(finalReels);

        const [s1, s2, s3] = finalSymbols;
        if (s1.emoji === s2.emoji && s2.emoji === s3.emoji) {
          const winAmount = bet * s1.multiplier;
          setBalance((b) => { const nb = b + winAmount; saveBalance(nb); return nb; });
          setLastWin(winAmount);
          setTotalWins((prev) => prev + winAmount);
          showToast('JACKPOT!', `Matched 3x ${s1.name}! Won ${winAmount} Credits!`, 'success');
        } else if (
          finalReels[0] === finalReels[1] ||
          finalReels[1] === finalReels[2] ||
          finalReels[0] === finalReels[2]
        ) {
          const winAmount = bet * 2;
          setBalance((b) => { const nb = b + winAmount; saveBalance(nb); return nb; });
          setLastWin(winAmount);
          setTotalWins((prev) => prev + winAmount);
          showToast('Match 2!', `Matched 2 symbols! Won ${winAmount} Credits!`, 'success');
        }
      }
    }, 80);
  };

  const startGame = () => {
    setBalance(INITIAL_BALANCE[difficulty]);
    setBet(BET_LEVELS[difficulty][1]);
    setGameStarted(true);
    setShowTutorial(false);
    setTotalWins(0);
    setTotalSpins(0);
    saveBalance(INITIAL_BALANCE[difficulty]);
  };

  if (showTutorial || (!gameStarted)) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-6 text-center">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Casino Slots</h3>
          </div>
          <button onClick={() => setShowTutorial(false)} className="text-[11px] text-zinc-400 hover:text-white">Skip</button>
        </div>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-left">
          <h4 className="text-sm font-bold text-white flex items-center gap-2"><Zap className="w-4 h-4 text-rose-400" /> How to Play</h4>
          <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
            <li>Choose your bet amount and spin the reels.</li>
            <li>Match 3 identical symbols for a jackpot (3x symbol multiplier).</li>
            <li>Match 2 symbols for a smaller win (2x your bet).</li>
            <li>Higher multiplier symbols give bigger payouts!</li>
            <li>Your balance is saved between sessions.</li>
          </ul>
          <div className="space-y-1 pt-2">
            {SYMBOLS.map((s) => (
              <div key={s.emoji} className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded-lg">
                <span className="text-lg">{s.emoji}</span>
                <span className="text-zinc-300 font-medium">{s.name}</span>
                <span className="text-amber-400 font-bold">{s.multiplier}x</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-2">Starting Balance</label>
            <div className="flex gap-2 justify-center">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} onClick={() => { setDifficulty(d); setBet(BET_LEVELS[d][1]); }} className={`skeuo-btn px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${difficulty === d ? 'bg-red-500 text-slate-950' : 'bg-slate-800 text-zinc-300 hover:bg-slate-700'}`}>
                  {d} ({INITIAL_BALANCE[d]} cr)
                </button>
              ))}
            </div>
          </div>
          <button onClick={startGame} className="skeuo-btn w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
            <Coins className="w-4 h-4" />Start Playing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-6 text-center">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Casino Slots</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          <Coins className="w-4 h-4" />
          <span>{balance} Credits</span>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border-2 border-red-500/20 shadow-2xl flex items-center justify-center gap-4">
        {reels.map((sym, i) => (
          <div
            key={i}
            className={`skeuo-btn w-24 h-28 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-red-500/30 flex items-center justify-center text-5xl shadow-inner transition-all ${spinning ? 'animate-pulse scale-95' : 'scale-100'}`}
          >
            {sym}
          </div>
        ))}
      </div>

      {lastWin > 0 && (
        <p className="text-sm font-black font-mono text-amber-400 animate-pulse flex items-center justify-center gap-2">
          <Trophy className="w-4 h-4" />🎉 YOU WON +{lastWin} CREDITS! 🎉
        </p>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Bet:</span>
          {BET_LEVELS[difficulty].map((val) => (
            <button
              key={val}
              onClick={() => setBet(val)}
              disabled={spinning}
              className={`skeuo-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${bet === val && !spinning ? 'bg-red-500 text-slate-950 font-black shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50'}`}
            >
              {val}
            </button>
          ))}
        </div>

        <button
          onClick={handleSpin}
          disabled={spinning}
          className="skeuo-btn w-full py-4 bg-gradient-to-r from-red-500 via-red-600 to-rose-500 hover:scale-[1.02] active:scale-95 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
          <span>{spinning ? 'SPINNING...' : 'SPIN REELS'}</span>
        </button>

        <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-500">
          <span>Spins: {totalSpins}</span>
          <span>Wins: {totalWins}</span>
          <button onClick={() => { setGameStarted(false); setShowTutorial(true); }} className="text-zinc-400 hover:text-white">Exit</button>
        </div>
      </div>
    </div>
  );
};
