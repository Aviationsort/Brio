/**
 * PokerGame Component: Texas Hold'em Poker Table vs 3 AI Bots
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Club, Coins, Sparkles, RotateCcw } from 'lucide-react';

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

interface PlayerState {
  id: string;
  name: string;
  cards: Card[];
  chips: number;
  currentBet: number;
  folded: boolean;
  isAI: boolean;
  aggression: number;
  handName?: string;
}

type GamePhase = 'idle' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUE: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const ANT_E = 25;
const STARTING_CHIPS = 1000;
const AI_NAMES = ['Bot Alpha', 'Bot Bravo', 'Bot Charlie'];
const AI_AGGRESSION = [0.3, 0.6, 0.85];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, value: RANK_VALUE[rank] });
    }
  }
  return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function cardString(c: Card): string {
  return c.rank + c.suit;
}

function isRed(suit: Suit): boolean {
  return suit === '♥' || suit === '♦';
}

function evaluate5(cards: Card[]): { rank: number; name: string; score: number } {
  const values = cards.map(c => c.value).sort((a, b) => a - b);
  const suits = cards.map(c => c.suit);
  const isFlush = suits[0] === suits[1] && suits[1] === suits[2] && suits[2] === suits[3] && suits[3] === suits[4];
  const isStraight = values[4] - values[3] === 1 && values[3] - values[2] === 1 && values[2] - values[1] === 1 && values[1] - values[0] === 1;

  const counts: Record<number, number> = {};
  for (const v of values) counts[v] = (counts[v] || 0) + 1;
  const freqs = Object.values(counts).sort((a, b) => b - a);
  const unique = Object.keys(counts).map(Number).sort((a, b) => b - a);

  if (isFlush && isStraight && values[4] === 14 && values[0] === 10) {
    return { rank: 10, name: 'Royal Flush', score: 10000 + values[4] };
  }
  if (isFlush && isStraight) {
    return { rank: 9, name: 'Straight Flush', score: 9000 + values[4] };
  }
  if (freqs[0] === 4) {
    return { rank: 8, name: 'Four of a Kind', score: 8000 + unique[0] * 100 + unique[1] };
  }
  if (freqs[0] === 3 && freqs[1] === 2) {
    return { rank: 7, name: 'Full House', score: 7000 + unique[0] * 100 + unique[1] };
  }
  if (isFlush) {
    return { rank: 6, name: 'Flush', score: 6000 + values[4] * 1000 + values[3] * 100 + values[2] * 10 + values[1] + values[0] * 0.1 };
  }
  if (isStraight) {
    return { rank: 5, name: 'Straight', score: 5000 + values[4] };
  }
  if (freqs[0] === 3) {
    return { rank: 4, name: 'Three of a Kind', score: 4000 + unique[0] * 100 + unique[1] * 10 + unique[2] };
  }
  if (freqs[0] === 2 && freqs[1] === 2) {
    const highPair = Math.max(...unique.filter(v => counts[v] === 2));
    const lowPair = Math.min(...unique.filter(v => counts[v] === 2));
    const kicker = unique.find(v => counts[v] === 1)!;
    return { rank: 3, name: 'Two Pair', score: 3000 + highPair * 100 + lowPair * 10 + kicker };
  }
  if (freqs[0] === 2) {
    const pair = unique.find(v => counts[v] === 2)!;
    const kickers = unique.filter(v => counts[v] === 1).sort((a, b) => b - a);
    return { rank: 2, name: 'Pair', score: 2000 + pair * 100 + kickers[0] * 10 + kickers[1] };
  }
  return { rank: 1, name: 'High Card', score: 1000 + values[4] * 100 + values[3] * 10 + values[2] + values[1] * 0.1 + values[0] * 0.01 };
}

function bestHand(hole: Card[], community: Card[]): { rank: number; name: string; score: number } {
  const all = [...hole, ...community];
  let best: { rank: number; name: string; score: number } = { rank: 0, name: '', score: -1 };
  if (all.length < 5) return best;
  const n = all.length;
  const combos: number[] = [];
  function generate(i: number, k: number, mask: number) {
    if (k === 0) { combos.push(mask); return; }
    for (let j = i; j <= n - k; j++) generate(j + 1, k - 1, mask | (1 << j));
  }
  generate(0, 5, 0);
  for (const mask of combos) {
    const hand = all.filter((_, idx) => (mask & (1 << idx)) !== 0);
    const ev = evaluate5(hand);
    if (ev.score > best.score) best = ev;
  }
  return best;
}

export const PokerGame: React.FC = () => {
  const { showToast } = useApp();
  const [playerChips, setPlayerChips] = useState(STARTING_CHIPS);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [pot, setPot] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [deck, setDeck] = useState<Card[]>([]);
  const [player, setPlayer] = useState<PlayerState>({
    id: 'player', name: 'You', cards: [], chips: STARTING_CHIPS, currentBet: 0, folded: false, isAI: false, aggression: 0
  });
  const [bots, setBots] = useState<PlayerState[]>(() =>
    AI_NAMES.map((name, i) => ({
      id: `bot-${i}`, name, cards: [], chips: 800 + i * 200, currentBet: 0, folded: false, isAI: true, aggression: AI_AGGRESSION[i]
    }))
  );
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [message, setMessage] = useState('');
  const [roundBets, setRoundBets] = useState<Record<string, number>>({});

  const allPlayers = useMemo(() => [player, ...bots], [player, bots]);
  const activePlayers = useMemo(() => allPlayers.filter(p => !p.folded), [allPlayers]);

  const resetHand = useCallback(() => {
    const d = shuffleDeck(createDeck());
    setDeck(d);
    setCommunityCards([]);
    setPot(0);
    setCurrentBet(0);
    setRoundBets({});
    setPhase('idle');
    setMessage('Press Deal to start a new hand');
  }, []);

  const initHand = useCallback(() => {
    if (playerChips < ANT_E) {
      showToast('Low Chips', 'Please rebuy chips to continue.', 'warning');
      return;
    }
    const d = shuffleDeck(createDeck());
    setDeck(d);
    setCommunityCards([]);
    setPot(ANT_E * 4);
    setCurrentBet(0);
    setRoundBets({});
    setPlayerChips(c => c - ANT_E);
    setPlayer(p => ({ ...p, cards: [d[0], d[1]], currentBet: ANT_E, folded: false, handName: undefined }));
    setBots(bots => bots.map((b, i) => ({
      ...b,
      cards: [d[2 + i * 2], d[3 + i * 2]],
      currentBet: ANT_E,
      folded: false,
      handName: undefined
    })));
    setPhase('preflop');
    setMessage('Pre-flop betting round');
  }, [playerChips, showToast, bots]);

  const advancePhase = useCallback(() => {
    if (phase === 'preflop') {
      setCommunityCards([deck[12], deck[13], deck[14]]);
      setPhase('flop');
      setCurrentBet(0);
      setRoundBets({});
      setMessage('Flop dealt. Betting round.');
    } else if (phase === 'flop') {
      setCommunityCards(c => [...c, deck[15]]);
      setPhase('turn');
      setCurrentBet(0);
      setRoundBets({});
      setMessage('Turn dealt. Betting round.');
    } else if (phase === 'turn') {
      setCommunityCards(c => [...c, deck[16]]);
      setPhase('river');
      setCurrentBet(0);
      setRoundBets({});
      setMessage('River dealt. Final betting round.');
    } else if (phase === 'river') {
      setPhase('showdown');
      const results = allPlayers.map(p => {
        if (p.folded) return { ...p, handName: 'Folded', score: -1 };
        const best = bestHand(p.cards, communityCards);
        return { ...p, handName: best.name, score: best.score, handRank: best.rank };
      });
      const sorted = [...results].filter(r => !r.folded).sort((a, b) => (b.score as number) - (a.score as number));
      const winner = sorted[0];
      if (winner) {
        setPlayer(p => ({ ...p, handName: winner.handName }));
        setBots(bots => bots.map(b => ({ ...b, handName: winner.handName })));
        setMessage(`Winner: ${winner.name} with ${winner.handName}!`);
        if (winner.id === 'player') {
          setPlayerChips(c => c + pot);
          showToast('SHOWDOWN WIN!', `You won ${pot} chips with ${winner.handName}!`, 'success');
        } else {
          showToast('Showdown', `${winner.name} wins ${pot} chips with ${winner.handName}.`, 'info');
        }
      }
    }
  }, [phase, deck, communityCards, allPlayers, pot, showToast]);

  useEffect(() => {
    if (phase === 'showdown') {
      const t = setTimeout(() => resetHand(), 4000);
      return () => clearTimeout(t);
    }
  }, [phase, resetHand]);

  const aiDecide = useCallback((bot: PlayerState): { action: 'call' | 'raise' | 'fold'; raiseAmount?: number } => {
    if (bot.folded) return { action: 'fold' };
    const best = bestHand(bot.cards, communityCards);
    const strength = best.rank / 10;
    const r = Math.random();
    const toCall = currentBet - bot.currentBet;

    if (phase === 'preflop') {
      if (strength > 0.7 && r < bot.aggression) return { action: 'raise', raiseAmount: currentBet + ANT_E * 2 };
      if (strength > 0.3 || r > 0.5) return { action: 'call' };
      return { action: 'fold' };
    }

    if (strength > 0.6 && r < bot.aggression * 0.8) return { action: 'raise', raiseAmount: currentBet + pot * 0.3 };
    if (strength > 0.2 || r > 0.4) return { action: 'call' };
    return { action: 'fold' };
  }, [phase, currentBet, pot, communityCards]);

  useEffect(() => {
    if (phase === 'idle' || phase === 'showdown') return;
    const activeBots = bots.filter(b => !b.folded);
    if (activeBots.length === 0) {
      advancePhase();
      return;
    }
    const bot = activeBots[0];
    const decide = aiDecide(bot);
    const timeout = setTimeout(() => {
      if (decide.action === 'fold') {
        setBots(bs => bs.map(b => b.id === bot.id ? { ...b, folded: true } : b));
        setMessage(`${bot.name} folds.`);
      } else if (decide.action === 'call') {
        const callAmt = Math.min(currentBet - bot.currentBet, bot.chips);
        if (callAmt > 0) {
          setBots(bs => bs.map(b => b.id === bot.id ? { ...b, chips: b.chips - callAmt, currentBet: b.currentBet + callAmt } : b));
          setPot(p => p + callAmt);
        }
      } else if (decide.action === 'raise' && decide.raiseAmount) {
        const raiseAmt = Math.min(decide.raiseAmount - bot.currentBet, bot.chips);
        if (raiseAmt > 0) {
          setBots(bs => bs.map(b => b.id === bot.id ? { ...b, chips: b.chips - raiseAmt, currentBet: b.currentBet + raiseAmt } : b));
          setPot(p => p + raiseAmt);
          setCurrentBet(decide.raiseAmount);
        }
      }
      if (activePlayers.filter(p => !p.folded).every(p => p.currentBet === currentBet)) {
        advancePhase();
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [phase, bots, currentBet, pot, aiDecide, advancePhase, activePlayers]);

  const handlePlayerCall = () => {
    if (phase === 'idle' || phase === 'showdown') return;
    const toCall = currentBet - player.currentBet;
    if (toCall > playerChips) return;
    setPlayerChips(c => c - toCall);
    setPlayer(p => ({ ...p, currentBet: p.currentBet + toCall }));
    setPot(p => p + toCall);
    setMessage('You called.');
    if (activePlayers.filter(p => !p.folded).every(p => p.currentBet === currentBet)) {
      advancePhase();
    }
  };

  const handlePlayerRaise = () => {
    if (phase === 'idle' || phase === 'showdown') return;
    const raiseAmt = currentBet + ANT_E * 2;
    const total = raiseAmt - player.currentBet;
    if (total > playerChips) return;
    setPlayerChips(c => c - total);
    setPlayer(p => ({ ...p, currentBet: p.currentBet + total }));
    setPot(p => p + total);
    setCurrentBet(raiseAmt);
    setMessage(`You raised to ${raiseAmt}.`);
  };

  const handlePlayerFold = () => {
    if (phase === 'idle' || phase === 'showdown') return;
    setPlayer(p => ({ ...p, folded: true }));
    setMessage('You folded.');
    const remaining = activePlayers.filter(p => !p.folded && p.id !== 'player');
    if (remaining.length === 1) {
      const winner = remaining[0];
      setMessage(`Winner: ${winner.name} (everyone else folded)`);
      if (winner.id.startsWith('bot')) {
        showToast('Opponent Wins', `${winner.name} wins ${pot} chips.`, 'info');
      } else {
        setPlayerChips(c => c + pot);
        showToast('Opponent Folded', `You win ${pot} chips!`, 'success');
      }
      setPhase('showdown');
    } else if (activePlayers.filter(p => !p.folded).length <= 1) {
      setPhase('showdown');
    }
  };

  const rebuy = () => {
    setPlayerChips(STARTING_CHIPS);
    setPlayer(p => ({ ...p, chips: STARTING_CHIPS }));
    showToast('Rebuy', 'You received 1000 chips.', 'success');
  };

  const getCardColor = (suit: Suit) => (isRed(suit) ? 'text-red-500' : 'text-slate-900');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Club className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Texas Hold'em Poker</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 bg-red-950/80 px-3 py-1 rounded-full border border-red-500/30">
          <Coins className="w-4 h-4" />
          <span>{playerChips} Chips</span>
        </div>
      </div>

      <div className="bg-green-950/90 border-4 border-green-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
        <div className="flex justify-between text-xs font-mono text-green-200">
          {bots.map(b => (
            <div key={b.id} className={b.folded ? 'opacity-40 line-through' : ''}>
              {b.name} (${b.chips})
              {b.handName && <div className="text-green-400 font-bold">{b.handName}</div>}
            </div>
          ))}
        </div>

        <div className="inline-block px-4 py-1.5 bg-black/60 border border-green-500/40 rounded-full font-mono text-xs font-bold text-green-300">
          POT: {pot} CHIPS | BET: {currentBet}
        </div>

        <div>
          <p className="text-[10px] text-green-300 font-mono mb-2">Community Cards</p>
          <div className="flex justify-center gap-2">
            {communityCards.length > 0 ? (
              communityCards.map((c, i) => (
                <div
                  key={i}
                  className={`w-12 h-16 rounded-xl bg-white border border-slate-300 text-sm flex items-center justify-center shadow-md ${getCardColor(c.suit)} font-black`}
                >
                  {cardString(c)}
                </div>
              ))
            ) : (
              <p className="text-xs text-green-400 italic font-mono">Press Deal to start</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-green-300 font-mono mb-2">Your Hole Cards</p>
          <div className="flex justify-center gap-3">
            {player.cards.length > 0 ? (
              player.cards.map((c, i) => (
                <div
                  key={i}
                  className={`w-14 h-20 rounded-xl bg-slate-900 border-2 border-green-400 text-sm flex items-center justify-center shadow-xl ${getCardColor(c.suit)} font-black`}
                >
                  {cardString(c)}
                </div>
              ))
            ) : (
              <div className="w-14 h-20 rounded-xl bg-green-900/40 border border-green-600/30 flex items-center justify-center text-xs text-green-300">
                🂠
              </div>
            )}
          </div>
          {player.handName && <div className="text-xs text-green-400 font-bold mt-2">{player.handName}</div>}
        </div>
      </div>

      <p className="text-xs font-bold font-mono text-center text-green-300">{message}</p>

      <div className="space-y-3">
        {phase === 'idle' ? (
          <button
            onClick={initHand}
            className="skeuo-btn w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Deal New Hand (${ANT_E})</span>
          </button>
        ) : phase === 'showdown' ? (
          <div className="flex gap-3">
            <button onClick={resetHand} className="skeuo-btn flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl shadow transition-all">
              Next Hand
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handlePlayerCall} className="skeuo-btn py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl shadow transition-all">
              Call ${currentBet - player.currentBet}
            </button>
            <button onClick={handlePlayerRaise} className="skeuo-btn py-3 bg-green-500 hover:bg-green-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all">
              Raise
            </button>
            <button onClick={handlePlayerFold} className="skeuo-btn py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition-all">
              Fold
            </button>
          </div>
        )}
        {playerChips < ANT_E && phase === 'idle' && (
          <button onClick={rebuy} className="skeuo-btn w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Rebuy Chips ($1000)
          </button>
        )}
      </div>
    </div>
  );
};
