/**
 * BlackjackGame Component: Casino 21 Blackjack Table
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Coins, Sparkles, RefreshCw } from 'lucide-react';

export const BlackjackGame: React.FC = () => {
  const { showToast } = useApp();
  const [chips, setChips] = useState(800);
  const [bet, setBet] = useState(50);
  const [playerHand, setPlayerHand] = useState<number[]>([]);
  const [dealerHand, setDealerHand] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer' | 'over'>('betting');
  const [message, setMessage] = useState('');

  const calcScore = (hand: number[]) => hand.reduce((a, b) => a + b, 0);

  const startDeal = () => {
    if (chips < bet) return;
    setChips((c) => c - bet);
    const p = [8, 10];
    const d = [9, 7];
    setPlayerHand(p);
    setDealerHand(d);
    setGameState('playing');
    setMessage('Your turn: Hit or Stand?');
  };

  const handleHit = () => {
    const card = Math.floor(Math.random() * 10) + 2;
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    const score = calcScore(newHand);

    if (score > 21) {
      setGameState('over');
      setMessage('BUST! Score over 21.');
      showToast('Bust!', 'You went over 21.', 'error');
    }
  };

  const handleStand = () => {
    const pScore = calcScore(playerHand);
    const dScore = calcScore(dealerHand);
    setGameState('over');

    if (pScore > dScore || dScore > 21) {
      const win = bet * 2;
      setChips((c) => c + win);
      setMessage(`YOU WIN! Won ${win} Chips!`);
      showToast('Blackjack Win!', `Score ${pScore} beat dealer ${dScore}!`, 'success');
    } else {
      setMessage(`Dealer Wins (${dScore} vs ${pScore}).`);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Coins className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Casino Blackjack 21</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
          <span>{chips} Chips</span>
        </div>
      </div>

      {/* Dealer & Player Felt Table */}
      <div className="bg-emerald-950/90 border-4 border-amber-800 rounded-3xl p-6 shadow-2xl space-y-6 text-center">
        {/* Dealer Hand */}
        <div>
          <p className="text-xs font-mono text-emerald-300 mb-2">
            Dealer Score: {gameState === 'playing' ? '?' : calcScore(dealerHand)}
          </p>
          <div className="flex justify-center gap-2">
            {dealerHand.map((val, i) => (
              <div
                key={i}
                className="w-12 h-16 rounded-xl bg-white text-slate-900 font-black text-sm flex items-center justify-center shadow-md"
              >
                {gameState === 'playing' && i === 1 ? '❓' : val}
              </div>
            ))}
          </div>
        </div>

        {/* Message Banner */}
        <p className="text-xs font-bold font-mono text-amber-300">{message || 'Place your bet and press Deal'}</p>

        {/* Player Hand */}
        <div>
          <p className="text-xs font-mono text-emerald-300 mb-2">Your Score: {calcScore(playerHand)}</p>
          <div className="flex justify-center gap-2">
            {playerHand.map((val, i) => (
              <div
                key={i}
                className="w-12 h-16 rounded-xl bg-slate-900 border-2 border-amber-400 text-amber-300 font-black text-sm flex items-center justify-center shadow-xl"
              >
                {val}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      {gameState === 'playing' ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleHit}
            className="py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all"
          >
            HIT CARD
          </button>
          <button
            onClick={handleStand}
            className="py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition-all"
          >
            STAND
          </button>
        </div>
      ) : (
        <button
          onClick={startDeal}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>DEAL HAND ($50)</span>
        </button>
      )}
    </div>
  );
};
