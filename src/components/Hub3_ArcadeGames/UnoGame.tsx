/**
 * UnoGame Component: Playable UNO Card Game vs 3 AI Bots
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Club, RotateCcw, Sparkles } from 'lucide-react';

interface UnoCard {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'wild';
  value: string; // '0'-'9', 'Skip', 'Reverse', '+2', 'Wild', '+4'
}

const COLORS: UnoCard['color'][] = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];

export const UnoGame: React.FC = () => {
  const { showToast } = useApp();
  const [playerHand, setPlayerHand] = useState<UnoCard[]>([]);
  const [botHands, setBotHands] = useState<number[]>([7, 7, 7]);
  const [topCard, setTopCard] = useState<UnoCard>({ id: 'top-1', color: 'blue', value: '7' });
  const [gameStarted, setGameStarted] = useState(false);
  const [turn, setTurn] = useState<'player' | 'bot1' | 'bot2' | 'bot3'>('player');

  const createDeck = (): UnoCard[] => {
    const deck: UnoCard[] = [];
    let count = 1;
    COLORS.forEach((color) => {
      VALUES.forEach((value) => {
        deck.push({ id: `c-${count++}`, color, value });
      });
    });
    // Add Wilds
    deck.push({ id: `c-${count++}`, color: 'wild', value: 'Wild' });
    deck.push({ id: `c-${count++}`, color: 'wild', value: '+4' });
    return deck;
  };

  const startUno = () => {
    const deck = createDeck();
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setPlayerHand(deck.slice(0, 7));
    setBotHands([7, 7, 7]);
    setTopCard(deck[22] || { id: 'top-def', color: 'red', value: '5' });
    setGameStarted(true);
    setTurn('player');
    showToast('UNO Game Started!', 'Your turn. Play matching color or number.', 'success');
  };

  const playCard = (card: UnoCard) => {
    if (turn !== 'player') return;

    // Check validity
    if (card.color === 'wild' || card.color === topCard.color || card.value === topCard.value) {
      setPlayerHand(playerHand.filter((c) => c.id !== card.id));
      setTopCard(card);

      if (playerHand.length === 1) {
        showToast('UNO!', 'You have 1 card remaining!', 'warning');
      } else if (playerHand.length === 0) {
        showToast('VICTORY!', 'You won the UNO match!', 'success');
        setGameStarted(false);
        return;
      }

      // Next turn
      setTurn('bot1');
      setTimeout(simulateBotTurns, 1200);
    } else {
      showToast('Invalid Card', 'Must match top card color or number.', 'warning');
    }
  };

  const drawCard = () => {
    if (turn !== 'player') return;
    const newCard: UnoCard = {
      id: `draw-${Date.now()}`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      value: VALUES[Math.floor(Math.random() * VALUES.length)],
    };
    setPlayerHand([...playerHand, newCard]);
    showToast('Card Drawn', `Added ${newCard.color} ${newCard.value} to hand.`, 'info');
  };

  const simulateBotTurns = () => {
    // Bot 1
    setBotHands((prev) => [Math.max(0, prev[0] - 1), prev[1], prev[2]]);
    setTimeout(() => {
      // Bot 2
      setBotHands((prev) => [prev[0], Math.max(0, prev[1] - 1), prev[2]]);
      setTimeout(() => {
        // Bot 3
        setBotHands((prev) => [prev[0], prev[1], Math.max(0, prev[2] - 1)]);
        setTurn('player');
      }, 800);
    }, 800);
  };

  const getBgColor = (color: UnoCard['color']) => {
    if (color === 'red') return 'bg-rose-600 text-white';
    if (color === 'blue') return 'bg-blue-600 text-white';
    if (color === 'green') return 'bg-emerald-600 text-white';
    if (color === 'yellow') return 'bg-amber-500 text-slate-950 font-bold';
    return 'bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white font-bold';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Club className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">UNO Cards vs AI</h3>
        </div>
        {!gameStarted ? (
          <button
            onClick={startUno}
            className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Start UNO Match
          </button>
        ) : (
          <button
            onClick={startUno}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl"
          >
            Reset Match
          </button>
        )}
      </div>

      {/* Table & Bots */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner space-y-6 text-center">
        {/* Top & Side Bots */}
        <div className="flex justify-around text-xs font-mono text-slate-400">
          <div>Bot 1 ({botHands[0]} cards)</div>
          <div>Bot 2 ({botHands[1]} cards)</div>
          <div>Bot 3 ({botHands[2]} cards)</div>
        </div>

        {/* Discard Pile */}
        <div className="flex justify-center items-center gap-6 py-4">
          <div>
            <p className="text-[10px] text-slate-500 mb-1">Draw Deck</p>
            <button
              onClick={drawCard}
              disabled={!gameStarted}
              className="w-16 h-24 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-white shadow-lg active:scale-95 transition-all"
            >
              DRAW
            </button>
          </div>

          <div>
            <p className="text-[10px] text-slate-500 mb-1">Top Discard</p>
            <div
              className={`w-16 h-24 rounded-2xl flex flex-col items-center justify-center font-black text-sm shadow-2xl border-2 border-white/20 ${getBgColor(
                topCard.color
              )}`}
            >
              <span>{topCard.value}</span>
            </div>
          </div>
        </div>

        {/* Turn Status */}
        <p className="text-xs font-mono text-cyan-400">
          {turn === 'player' ? '👉 Your Turn to Play or Draw' : '🤖 AI Bots taking turn...'}
        </p>
      </div>

      {/* Player Hand */}
      <div>
        <p className="text-xs font-semibold text-slate-300 mb-2">Your Cards ({playerHand.length}):</p>
        <div className="flex flex-wrap gap-2 justify-center max-h-48 overflow-y-auto p-2 bg-slate-950 rounded-2xl border border-slate-800">
          {playerHand.map((card) => (
            <button
              key={card.id}
              onClick={() => playCard(card)}
              disabled={turn !== 'player'}
              className={`w-14 h-20 rounded-xl flex flex-col items-center justify-center font-black text-xs shadow-lg transition-transform hover:scale-110 border border-white/20 ${getBgColor(
                card.color
              )}`}
            >
              <span>{card.value}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
