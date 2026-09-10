/**
 * BlackjackGame Component: Casino 21 Blackjack Table
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Coins, Sparkles, RefreshCw, RotateCcw } from 'lucide-react';

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  suit: Suit;
  rank: Rank;
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const DECK_COUNT = 6;
const RESHUFFLE_THRESHOLD = 0.25;
const STARTING_CHIPS = 800;
const MIN_BET = 25;

function createShoe(): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < DECK_COUNT; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        shoe.push({ suit, rank });
      }
    }
  }
  return shoe;
}

function shuffleShoe(shoe: Card[]): Card[] {
  const s = [...shoe];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

function cardDisplay(c: Card): string {
  return c.rank + c.suit;
}

function cardValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J'].includes(rank)) return 10;
  return parseInt(rank);
}

function handValue(cards: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += cardValue(c.rank);
    if (c.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function isRed(suit: Suit): boolean {
  return suit === '♥' || suit === '♦';
}

function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards) === 21;
}

export const BlackjackGame: React.FC = () => {
  const { showToast } = useApp();
  const [chips, setChips] = useState(STARTING_CHIPS);
  const [bet, setBet] = useState(MIN_BET);
  const [shoe, setShoe] = useState<Card[]>(() => shuffleShoe(createShoe()));
  const [playerHands, setPlayerHands] = useState<Card[][]>([]);
  const [playerBets, setPlayerBets] = useState<number[]>([]);
  const [activeHand, setActiveHand] = useState(0);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer' | 'over'>('betting');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<string>('');

  const canSplit = useMemo(() => {
    if (playerHands.length !== 1) return false;
    const h = playerHands[0];
    return h.length === 2 && h[0].rank === h[1].rank && chips >= bet;
  }, [playerHands, chips, bet]);

  const drawCard = useCallback((s: Card[]): [Card, Card[]] => {
    if (s.length === 0) {
      const newShoe = shuffleShoe(createShoe());
      const card = newShoe[0];
      return [card, newShoe.slice(1)];
    }
    return [s[0], s.slice(1)];
  }, []);

  const ensureShoe = useCallback((currentShoe: Card[]): Card[] => {
    const threshold = Math.floor(DECK_COUNT * 52 * RESHUFFLE_THRESHOLD);
    if (currentShoe.length < threshold) {
      return shuffleShoe(createShoe());
    }
    return currentShoe;
  }, []);

  const startDeal = useCallback(() => {
    if (chips < bet) {
      showToast('Insufficient Chips', 'Lower your bet or rebuy.', 'warning');
      return;
    }
    let s = ensureShoe(shoe);
    setShoe(s);
    setChips(c => c - bet);
    const [p1, s1] = drawCard(s);
    const [d1, s2] = drawCard(s1);
    const [p2, s3] = drawCard(s2);
    const [d2, s4] = drawCard(s3);
    setShoe(s4);
    setPlayerHands([[p1, p2]]);
    setPlayerBets([bet]);
    setActiveHand(0);
    setDealerHand([d1, d2]);
    setGameState('playing');
    setResult('');
    const pv = handValue([p1, p2]);
    if (pv === 21) {
      setMessage('Blackjack! Dealer\'s turn.');
      setGameState('dealer');
      playDealer(s4);
    } else {
      setMessage('Your turn: Hit, Stand, or Double Down?');
    }
  }, [chips, bet, shoe, drawCard, ensureShoe, showToast]);

  const playDealer = useCallback(async (currentShoe: Card[]) => {
    let s = currentShoe;
    let dHand = [...dealerHand];
    let s2 = s;
    while (handValue(dHand) < 17) {
      const [c, ns] = drawCard(s2);
      dHand = [...dHand, c];
      s2 = ns;
    }
    setShoe(s2);
    setDealerHand(dHand);
    setGameState('over');
    const dv = handValue(dHand);
    let msg = '';
    playerHands.forEach((ph, idx) => {
      const pv = handValue(ph);
      const betAmount = playerBets[idx];
      if (pv > 21) {
        msg = 'Bust! Dealer wins.';
      } else if (dv > 21) {
        setChips(c => c + betAmount * 2);
        msg = 'Dealer busts! You win!';
      } else if (pv > dv) {
        setChips(c => c + betAmount * 2);
        msg = 'You win!';
      } else if (pv < dv) {
        msg = 'Dealer wins.';
      } else {
        setChips(c => c + betAmount);
        msg = 'Push. Bet returned.';
      }
    });
    setResult(msg);
    setMessage(msg);
  }, [dealerHand, playerHands, playerBets, drawCard]);

  const handleHit = () => {
    if (gameState !== 'playing' || playerHands.length === 0) return;
    const s = ensureShoe(shoe);
    setShoe(s);
    const [card, ns] = drawCard(s);
    const newHands = [...playerHands];
    newHands[activeHand] = [...newHands[activeHand], card];
    setPlayerHands(newHands);
    const pv = handValue(newHands[activeHand]);
    if (pv > 21) {
      setMessage(`Bust! Score ${pv} over 21.`);
      setGameState('dealer');
      playDealer(ns);
    } else if (pv === 21) {
      setMessage(`21!`);
      setGameState('dealer');
      playDealer(ns);
    } else {
      setMessage(`Score: ${pv}`);
    }
  };

  const handleStand = () => {
    if (gameState !== 'playing') return;
    setMessage('Dealer\'s turn...');
    setGameState('dealer');
    playDealer(shoe);
  };

  const handleDoubleDown = () => {
    if (gameState !== 'playing' || playerHands.length > 1) return;
    const currentBet = playerBets[activeHand];
    if (chips < currentBet) {
      showToast('Insufficient Chips', 'Cannot double down.', 'warning');
      return;
    }
    setChips(c => c - currentBet);
    const newBets = [...playerBets];
    newBets[activeHand] = currentBet * 2;
    setPlayerBets(newBets);
    const s = ensureShoe(shoe);
    setShoe(s);
    const [card, ns] = drawCard(s);
    const newHands = [...playerHands];
    newHands[activeHand] = [...newHands[activeHand], card];
    setPlayerHands(newHands);
    const pv = handValue(newHands[activeHand]);
    if (pv > 21) {
      setMessage(`Bust! Score ${pv} over 21.`);
      setGameState('dealer');
      playDealer(ns);
    } else {
      setMessage('Dealer\'s turn...');
      setGameState('dealer');
      playDealer(ns);
    }
  };

  const handleSplit = () => {
    if (!canSplit || gameState !== 'playing') return;
    const hand = playerHands[0];
    const s = ensureShoe(shoe);
    setShoe(s);
    const [c1, ns1] = drawCard(s);
    const [c2, ns2] = drawCard(ns1);
    setChips(c => c - bet);
    setPlayerHands([[hand[0], c1], [hand[1], c2]]);
    setPlayerBets([bet, bet]);
    setActiveHand(0);
    setShoe(ns2);
    setMessage('Split! Playing first hand.');
  };

  const resetGame = () => {
    setGameState('betting');
    setPlayerHands([]);
    setPlayerBets([]);
    setDealerHand([]);
    setMessage('');
    setResult('');
  };

  const rebuy = () => {
    setChips(STARTING_CHIPS);
    showToast('Rebuy', 'You received 800 chips.', 'success');
  };

  const pv = playerHands.length > 0 ? handValue(playerHands[activeHand] || []) : 0;
  const dv = gameState !== 'betting' && dealerHand.length > 0 ? handValue(dealerHand) : 0;
  const showDealerCard = gameState === 'playing' && dealerHand.length >= 1;

  const getCardColor = (suit: Suit) => (isRed(suit) ? 'text-red-500' : 'text-slate-900');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Coins className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Casino Blackjack 21</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 bg-red-950/80 px-3 py-1 rounded-full border border-red-500/30">
          <span>{chips} Chips</span>
        </div>
      </div>

      <div className="bg-green-950/90 border-4 border-green-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
        <div>
          <p className="text-xs font-mono text-green-300 mb-2">
            Dealer {showDealerCard ? `(${dv})` : '(?)'}
          </p>
          <div className="flex justify-center gap-2">
            {dealerHand.map((c, i) => (
              <div
                key={i}
                className={`w-12 h-16 rounded-xl bg-white text-slate-900 font-black text-sm flex items-center justify-center shadow-md ${showDealerCard ? getCardColor(c.suit) : ''}`}
              >
                {showDealerCard ? cardDisplay(c) : (i === 0 ? '🂠' : '❓')}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs font-bold font-mono text-green-300">{message || 'Place your bet and press Deal'}</p>

        <div>
           <p className="text-xs font-mono text-green-300 mb-2">Your Hand{playerHands.length > 1 ? ` (${activeHand + 1}/${playerHands.length})` : ''} Score: {pv}</p>
          {playerHands.length > 0 ? (
            <div className="flex justify-center gap-2">
              {playerHands[activeHand].map((c, i) => (
                <div
                  key={i}
                  className={`w-12 h-16 rounded-xl bg-slate-900 border-2 border-green-400 text-sm flex items-center justify-center shadow-xl ${getCardColor(c.suit)} font-black`}
                >
                  {cardDisplay(c)}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-12 h-16 mx-auto rounded-xl bg-green-900/40 border border-green-600/30 flex items-center justify-center text-xs text-green-300">
              🂠
            </div>
          )}
        </div>

        {result && <div className="text-sm font-black text-green-400 animate-pulse">{result}</div>}
      </div>

      {gameState === 'betting' && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs font-bold text-green-300">Bet:</span>
            <input
              type="number"
              min={MIN_BET}
              max={chips}
              value={bet}
              onChange={(e) => setBet(Math.max(MIN_BET, Math.min(chips, parseInt(e.target.value) || MIN_BET)))}
              className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-sm font-bold text-white font-mono"
            />
          </div>
          <button
            onClick={startDeal}
            className="skeuo-btn-primary w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>DEAL HAND (${bet})</span>
          </button>
          {chips < MIN_BET && (
            <button onClick={rebuy} className="skeuo-btn w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Rebuy Chips ($800)
            </button>
          )}
        </div>
      )}

      {gameState === 'playing' && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleHit} className="skeuo-btn py-3 bg-green-500 hover:bg-green-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all">
            HIT
          </button>
          <button onClick={handleStand} className="skeuo-btn py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl shadow transition-all">
            STAND
          </button>
          <button onClick={handleDoubleDown} disabled={playerHands.length > 1} className="skeuo-btn py-3 bg-green-700 hover:bg-green-600 text-white font-bold text-xs rounded-xl shadow transition-all disabled:opacity-50">
            DOUBLE DOWN
          </button>
          <button onClick={handleSplit} disabled={!canSplit} className="skeuo-btn py-3 bg-green-700 hover:bg-green-600 text-white font-bold text-xs rounded-xl shadow transition-all disabled:opacity-50">
            SPLIT
          </button>
        </div>
      )}

      {(gameState === 'over' || gameState === 'dealer') && (
        <button onClick={resetGame} className="skeuo-btn w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>NEW HAND</span>
        </button>
      )}
    </div>
  );
};
