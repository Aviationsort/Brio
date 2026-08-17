/**
 * PokerGame Component: Texas Hold'em Poker Table vs 3 AI Bots
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Club, Coins, Sparkles } from 'lucide-react';

export const PokerGame: React.FC = () => {
  const { showToast } = useApp();
  const [chips, setChips] = useState(1000);
  const [pot, setPot] = useState(150);
  const [currentBet, setCurrentBet] = useState(50);
  const [inHand, setInHand] = useState(false);
  const [playerCards, setPlayerCards] = useState<string[]>([]);
  const [communityCards, setCommunityCards] = useState<string[]>([]);

  const startHand = () => {
    if (chips < 50) {
      showToast('Low Chips', 'Top up chips to play.', 'warning');
      return;
    }
    setChips((c) => c - 50);
    setPot(200); // blinds + bets
    setPlayerCards(['A♠', 'K♠']);
    setCommunityCards(['Q♠', 'J♠', '10♦', '2♣', '7♥']);
    setInHand(true);
    showToast('Hand Dealt', 'Royal Flush draw on the flop!', 'success');
  };

  const handleCall = () => {
    if (chips < currentBet) return;
    setChips((c) => c - currentBet);
    setPot((p) => p + currentBet * 2);
    showToast('Call Placed', `Added ${currentBet} chips to pot.`, 'info');
  };

  const handleShowdown = () => {
    const win = pot;
    setChips((c) => c + win);
    showToast('SHOWDOWN WIN!', `Royal Flush! Won ${win} Chips!`, 'success');
    setInHand(false);
    setPot(0);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Club className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Texas Hold'em Poker</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
          <Coins className="w-4 h-4" />
          <span>{chips} Chips</span>
        </div>
      </div>

      {/* Poker Felt Table */}
      <div className="bg-emerald-950/90 border-4 border-amber-800 rounded-3xl p-6 shadow-2xl text-center space-y-6">
        <div className="flex justify-between text-xs font-mono text-emerald-200">
          <div>AI Bot 1 ($450)</div>
          <div>AI Bot 2 ($820)</div>
          <div>AI Bot 3 ($310)</div>
        </div>

        {/* Pot */}
        <div className="inline-block px-4 py-1.5 bg-black/60 border border-amber-500/40 rounded-full font-mono text-xs font-bold text-amber-300">
          POT: {pot} CHIPS
        </div>

        {/* Community Cards */}
        <div>
          <p className="text-[10px] text-emerald-300 font-mono mb-2">Community Cards</p>
          <div className="flex justify-center gap-2">
            {communityCards.length > 0 ? (
              communityCards.map((c, i) => (
                <div
                  key={i}
                  className="w-12 h-16 rounded-xl bg-white border border-slate-300 text-slate-900 font-black text-sm flex items-center justify-center shadow-md"
                >
                  {c}
                </div>
              ))
            ) : (
              <p className="text-xs text-emerald-400 italic font-mono">Press Deal to start hand</p>
            )}
          </div>
        </div>

        {/* Player Cards */}
        <div>
          <p className="text-[10px] text-emerald-300 font-mono mb-2">Your Hole Cards</p>
          <div className="flex justify-center gap-3">
            {playerCards.length > 0 ? (
              playerCards.map((c, i) => (
                <div
                  key={i}
                  className="w-14 h-20 rounded-xl bg-slate-900 border-2 border-amber-400 text-amber-300 font-black text-base flex items-center justify-center shadow-xl"
                >
                  {c}
                </div>
              ))
            ) : (
              <div className="w-14 h-20 rounded-xl bg-emerald-900/40 border border-emerald-600/30 flex items-center justify-center text-xs text-emerald-300">
                🂠
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {!inHand ? (
          <button
            onClick={startHand}
            className="liquid-glass-btn w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Deal New Hand ($50)</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCall}
              className="liquid-glass-btn py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition-all"
            >
              Call ${currentBet}
            </button>
            <button
              onClick={handleShowdown}
              className="liquid-glass-btn py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all"
            >
              Showdown
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
