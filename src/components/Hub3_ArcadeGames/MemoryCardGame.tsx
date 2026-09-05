/**
 * MemoryCardGame Component: Card Matching Memory Game
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Brain, Trophy, RotateCcw, Timer } from 'lucide-react';

const EMOJIS = ['🚀', '💎', '🌟', '🎮', '🔥', '🎯', '🎪', '🎨', '🎭', '🎪', '🎵', '🎸', '🎲', '🎳', '🎰', '🎬'];

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };

export const MemoryCardGame: React.FC = () => {
  const { showToast } = useApp();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [showTutorial, setShowTutorial] = useState(true);

  const GRID_SIZES = { easy: 8, medium: 12, hard: 16 };
  const TIME_LIMITS = { easy: 180, medium: 120, hard: 90 };

  const initGame = useCallback(() => {
    const gridSize = GRID_SIZES[difficulty];
    const pairsCount = gridSize / 2;
    const selectedEmojis = EMOJIS.slice(0, pairsCount);
    const deck: Card[] = [];
    selectedEmojis.forEach((emoji, i) => {
      deck.push({ id: i * 2, emoji, flipped: false, matched: false });
      deck.push({ id: i * 2 + 1, emoji, flipped: false, matched: false });
    });
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    deck.forEach((card, idx) => { card.id = idx; });
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setScore(0);
    setMatchedPairs(0);
    setGameOver(false);
    setGameStarted(true);
    setShowTutorial(false);
    setTimeLeft(TIME_LIMITS[difficulty]);
  }, [difficulty]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          showToast('Time Up!', `You matched ${matchedPairs} pairs.`, 'warning');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, matchedPairs, showToast]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first]?.emoji === cards[second]?.emoji) {
        setCards((prev) => prev.map((c) => (c.id === first || c.id === second ? { ...c, matched: true, flipped: true } : c)));
        setMatchedPairs((prev) => {
          const newPairs = prev + 1;
          const bonus = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
          setScore((s) => s + bonus + Math.floor(timeLeft / 10));
          if (newPairs === GRID_SIZES[difficulty] / 2) {
            setTimeout(() => {
              setGameOver(true);
              showToast('Victory!', `All pairs matched in ${moves + 1} moves!`, 'success');
            }, 400);
          }
          return newPairs;
        });
        setFlipped([]);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === first || c.id === second ? { ...c, flipped: false } : c)));
          setFlipped([]);
        }, 800);
      }
    }
  }, [flipped, cards, difficulty, moves, timeLeft, showToast]);

  const handleCardClick = (id: number) => {
    if (flipped.length === 2 || cards[id].flipped || cards[id].matched || gameOver) return;
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)));
    setFlipped((prev) => [...prev, id]);
    if (flipped.length === 1) {
      setMoves((prev) => prev + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (showTutorial || (!gameStarted && !gameOver)) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-6 text-center">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <Brain className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Memory Match</h3>
          </div>
          <button onClick={() => setShowTutorial(false)} className="text-[11px] text-zinc-400 hover:text-white">Skip</button>
        </div>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-left">
          <h4 className="text-sm font-bold text-white flex items-center gap-2"><Brain className="w-4 h-4 text-rose-400" /> How to Play</h4>
          <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
            <li>Click cards to flip them and reveal the emoji underneath.</li>
            <li>Match pairs of identical emojis to score points.</li>
            <li>Fewer moves and faster completion give higher scores.</li>
            <li>Beat the clock before time runs out!</li>
            <li>Choose your grid size: Easy (8), Medium (12), or Hard (16 cards).</li>
          </ul>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-2">Difficulty (Grid Size)</label>
            <div className="flex gap-2 justify-center">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`skeuo-btn px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${difficulty === d ? 'bg-red-500 text-slate-950' : 'bg-slate-800 text-zinc-300 hover:bg-slate-700'}`}>
                  {d} ({GRID_SIZES[d]} cards)
                </button>
              ))}
            </div>
          </div>
          <button onClick={initGame} className="skeuo-btn w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
            <Brain className="w-4 h-4" /><span>Start Game</span>
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const totalPossible = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 400 : 600;
    const accuracy = Math.max(0, Math.round((1 - moves / (GRID_SIZES[difficulty])) * 100));
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-6 text-center">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400"><Trophy className="w-5 h-5" /><h3 className="text-base font-bold text-white">Game Over</h3></div>
        </div>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="text-5xl mb-2">{matchedPairs === GRID_SIZES[difficulty] / 2 ? '🎉' : '⏰'}</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-[10px] text-zinc-400 uppercase">Score</p><p className="text-lg font-black text-red-400">{score}</p></div>
            <div><p className="text-[10px] text-zinc-400 uppercase">Moves</p><p className="text-lg font-black text-white">{moves}</p></div>
            <div><p className="text-[10px] text-zinc-400 uppercase">Efficiency</p><p className="text-lg font-black text-amber-400">{accuracy}%</p></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setGameStarted(false); setShowTutorial(false); setGameOver(false); }} className="skeuo-btn flex-1 py-3 bg-slate-800 text-white font-bold text-xs rounded-xl">Menu</button>
          <button onClick={initGame} className="skeuo-btn flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" />Play Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-4 text-center">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400"><Brain className="w-5 h-5" /><h3 className="text-base font-bold text-white">Memory Match</h3></div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-red-400 font-bold">Score: {score}</span>
          <span className="text-zinc-400 font-bold flex items-center gap-1"><Timer className="w-3 h-3" />{formatTime(timeLeft)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>Moves: {moves}</span>
        <span>Pairs: {matchedPairs}/{GRID_SIZES[difficulty] / 2}</span>
        <span className="capitalize">{difficulty}</span>
      </div>
      <div className={`grid gap-2 mx-auto ${difficulty === 'easy' ? 'grid-cols-4' : difficulty === 'medium' ? 'grid-cols-4' : 'grid-cols-4'}`}>
        {cards.map((card) => (
          <button key={card.id} onClick={() => handleCardClick(card.id)} disabled={card.flipped || card.matched} className={`skeuo-btn aspect-square rounded-xl border text-2xl flex items-center justify-center transition-all ${card.flipped || card.matched ? 'bg-slate-800 border-red-500/30 rotate-0' : 'bg-slate-950 border-slate-800 hover:border-red-500/50 rotate-180'} `}>
            {card.flipped || card.matched ? card.emoji : '?'}
          </button>
        ))}
      </div>
      <button onClick={() => { setGameStarted(false); setShowTutorial(false); setGameOver(false); }} className="text-[11px] text-zinc-400 hover:text-white">← Exit</button>
    </div>
  );
};
