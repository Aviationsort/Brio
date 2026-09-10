/**
 * HangmanGame Component: Classic Word Guessing Hangman
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, RotateCcw, Brain, Heart, HelpCircle } from 'lucide-react';

const WORDS = [
  'airplane', 'runway', 'cockpit', 'radar', 'turbine',
  'hangar', 'fuselage', 'tailfin', 'thrust', 'altitude',
  'aviation', 'weather', 'takeoff', 'landing', 'runway',
  'pilot', 'crew', 'passenger', 'cargo', 'hangar',
  'airport', 'terminal', 'baggage', 'fuel', 'engine',
];

const MAX_LIVES = 6;

type LetterStatus = 'hidden' | 'revealed' | 'wrong';

export const HangmanGame: React.FC = () => {
  const { showToast } = useApp();
  const [secret, setSecret] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('hangman_highscore') || '0'));
  const [showTutorial, setShowTutorial] = useState(true);

  const remainingLives = MAX_LIVES - wrong.length;
  const isWin = secret.split('').every((ch) => guessed.includes(ch));
  const isLoss = wrong.length >= MAX_LIVES;

  useEffect(() => {
    if (gameOver) {
      if (isWin && score > highScore) {
        setHighScore(score);
        localStorage.setItem('hangman_highscore', score.toString());
        showToast('New High Score!', `Hangman score: ${score}`, 'success');
      }
    }
  }, [gameOver, isWin, score, highScore, showToast]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    if (isWin) {
      setGameOver(true);
      setScore((prev) => prev + secret.length * 10 + remainingLives * 5);
      showToast('You Won!', `The word was "${secret}"`, 'success');
    } else if (isLoss) {
      setGameOver(true);
      showToast('Game Over', `The word was "${secret}"`, 'error');
    }
  }, [guessed, wrong, gameStarted, gameOver, secret, remainingLives, isWin, isLoss, showToast]);

  const handleGuess = (letter: string) => {
    if (!gameStarted) setGameStarted(true);
    if (gameOver || guessed.includes(letter) || wrong.includes(letter)) return;

    if (secret.includes(letter)) {
      setGuessed((prev) => [...prev, letter]);
    } else {
      setWrong((prev) => [...prev, letter]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key.toLowerCase();
    if (/^[a-z]$/.test(key)) {
      handleGuess(key);
    }
  };

  const resetGame = () => {
    const newWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setSecret(newWord);
    setGuessed([]);
    setWrong([]);
    setGameOver(false);
    setGameStarted(false);
    setScore(0);
    setShowTutorial(false);
  };

  const wordDisplay = useMemo(() => {
    return secret
      .split('')
      .map((ch) => ({ char: ch, status: guessed.includes(ch) ? 'revealed' : 'hidden' }));
  }, [secret, guessed]);

  const usedLetters = useMemo(() => [...guessed, ...wrong], [guessed, wrong]);

  return (
    <div className="space-y-4" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="skeuo-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 skeuo-inset-panel border border-red-500/40 rounded-xl text-red-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="skeuo-text-embossed">Hangman</h3>
              <p className="text-xs text-red-200/90 font-medium">
                {gameStarted ? (gameOver ? 'Game Over' : 'Guess the word') : 'Press any letter to start'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-zinc-400 font-mono">Score: {score}</div>
            <button onClick={resetGame} className="skeuo-btn-primary px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      {showTutorial && !gameStarted && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-rose-400">
              <HelpCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Hangman - Instructions</h3>
            </div>
            <button onClick={() => setShowTutorial(false)} className="text-[11px] text-zinc-400 hover:text-white">Close</button>
          </div>
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 rounded-xl"><Brain className="w-6 h-6 text-red-400" /></div>
              <div>
                <h4 className="text-sm font-bold text-white">Hangman</h4>
                <span className="text-[10px] text-zinc-400">Trivia • Word Game</span>
              </div>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Guess the aviation-themed word one letter at a time. Each wrong guess costs a life. You have {MAX_LIVES} lives. Win by revealing all letters before running out of lives.
            </p>
            {highScore > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
                <Trophy className="w-4 h-4" />
                <span>High Score: {highScore} pts</span>
              </div>
            )}
          </div>
          <button onClick={resetGame} className="skeuo-btn w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2">
            Play Now
          </button>
        </div>
      )}

      {gameStarted && (
        <div className="space-y-4">
          <div className="skeuo-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: MAX_LIVES }).map((_, i) => (
                    <Heart key={i} className={`w-5 h-5 ${i < remainingLives ? 'text-red-400 fill-red-400' : 'text-zinc-600'}`} />
                  ))}
                </div>
                <div className="text-xs text-zinc-400 font-mono">Lives: {remainingLives}</div>
              </div>
              <div className="text-xs text-zinc-400 font-mono">Score: {score}</div>
            </div>
          </div>

          <div className="skeuo-panel">
            <div className="flex flex-wrap items-center justify-center gap-3 py-8">
              {wordDisplay.map((item, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-black transition-all ${
                    item.status === 'revealed'
                      ? 'border-red-500/40 bg-red-500/10 text-white'
                      : 'border-white/20 bg-white/5 text-transparent'
                  }`}
                >
                  {item.char}
                </div>
              ))}
            </div>
            {gameOver && (
              <div className="text-center py-4 space-y-2">
                <p className="text-sm font-bold text-white">
                  {isWin ? '🎉 You Won!' : '💀 Game Over'}
                </p>
                <p className="text-xs text-zinc-400">The word was: <span className="text-red-400 font-bold">{secret}</span></p>
                <button onClick={resetGame} className="skeuo-btn-primary px-4 py-2 text-xs font-bold rounded-xl">
                  Play Again
                </button>
              </div>
            )}
          </div>

          <div className="skeuo-panel">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {'abcdefghijklmnopqrstuvwxyz'.split('').map((letter) => {
                const isUsed = usedLetters.includes(letter);
                const isWrong = wrong.includes(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => handleGuess(letter)}
                    disabled={isUsed || gameOver}
                    className={`w-9 h-9 rounded-lg border text-xs font-bold transition-all ${
                      isUsed
                        ? isWrong
                          ? 'border-red-500/40 bg-red-500/10 text-red-400 line-through opacity-50'
                          : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
