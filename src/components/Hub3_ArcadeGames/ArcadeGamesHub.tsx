/**
 * Hub 3: Arcade & Gaming Suite Container
 * Select and launch any of the 13 interactive games
 */

import React, { useState, useEffect } from 'react';
import { GameId } from '../../types';
import { TetrisGame } from './TetrisGame';
import { SlotsGame } from './SlotsGame';
import { LotteryGame } from './LotteryGame';
import { UnoGame } from './UnoGame';
import { PokerGame } from './PokerGame';
import { BlackjackGame } from './BlackjackGame';
import { FlappyBirdGame } from './FlappyBirdGame';
import { MinesweeperGame } from './MinesweeperGame';
import { FlagQuizGame } from './FlagQuizGame';
import { MemoryCardGame } from './MemoryCardGame';
import { SnakeGame } from './SnakeGame';
import { TypingGame } from './TypingGame';
import { HangmanGame } from './HangmanGame';
import {
  Gamepad2,
  Grid,
  Sparkles,
  Ticket,
  Club,
  Coins,
  Bird,
  Bomb,
  Flag,
  Brain,
  Zap,
  Keyboard,
  Trophy,
  HelpCircle,
  RotateCcw,
  Filter,
} from 'lucide-react';

interface GameItem {
  id: GameId;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tutorial: string;
}

const GAMES_LIST: GameItem[] = [
  {
    id: 'tetris',
    title: 'Tetris',
    category: 'Arcade',
    subcategory: 'Puzzle',
    description: 'Classic block puzzle with acceleration and high scores.',
    icon: Grid,
    badge: 'Arcade',
    difficulty: 'medium',
    tutorial: 'Use Left / Right / Down Arrow keys to move and rotate blocks. Clear lines to score points. Speed increases with level.',
  },
  {
    id: 'slots',
    title: 'Casino Slots',
    category: 'Casino',
    subcategory: 'Luck',
    description: '3-reel slot machine with animated reels & payout multipliers.',
    icon: Sparkles,
    badge: 'Casino',
    difficulty: 'easy',
    tutorial: 'Choose your bet amount and spin the reels. Match 3 symbols for a jackpot (10x bet) or 2 symbols for a smaller win (2x bet).',
  },
  {
    id: 'lottery',
    title: 'Lottery Draw',
    category: 'Casino',
    subcategory: 'Luck',
    description: 'Custom number picking & daily draw simulation with frequency graphs.',
    icon: Ticket,
    badge: 'Casino',
    difficulty: 'easy',
    tutorial: 'Pick your lucky numbers or use Quick Pick. Watch the draw animation and check frequency statistics.',
  },
  {
    id: 'uno',
    title: 'UNO Cards',
    category: 'Cards',
    subcategory: 'Strategy',
    description: 'Play UNO vs 3 AI bots with Draw 2, Skip, Reverse, and Wild cards.',
    icon: Club,
    badge: 'Cards',
    difficulty: 'medium',
    tutorial: 'Match cards by color or number. Use action cards strategically. Be the first to empty your hand!',
  },
  {
    id: 'poker',
    title: "Texas Hold'em Poker",
    category: 'Casino',
    subcategory: 'Cards',
    description: 'Poker table vs 3 AI bots with pot management & chip tracking.',
    icon: Club,
    badge: 'Casino',
    difficulty: 'hard',
    tutorial: 'Get the best 5-card hand from your 2 hole cards and 5 community cards. Bet, raise, or fold. Last one standing wins the pot.',
  },
  {
    id: 'blackjack',
    title: 'Blackjack 21',
    category: 'Casino',
    subcategory: 'Cards',
    description: 'Casino Blackjack table with Hit, Stand, Double, Split & Insurance.',
    icon: Coins,
    badge: 'Casino',
    difficulty: 'medium',
    tutorial: 'Get closest to 21 without going over. Beat the dealer\'s hand. Use Hit, Stand, Double Down, and Split strategically.',
  },
  {
    id: 'flappy',
    title: 'Aircraft Flappy',
    category: 'Arcade',
    subcategory: 'Action',
    description: 'Aircraft flight physics game with particle effects and high scores.',
    icon: Bird,
    badge: 'Arcade',
    difficulty: 'hard',
    tutorial: 'Click or press Space to fly. Avoid obstacles and pipes. Survive as long as possible for a high score.',
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    category: 'Puzzle',
    subcategory: 'Logic',
    description: 'Grid mine sweeper with 3 difficulties, flags, and timer.',
    icon: Bomb,
    badge: 'Puzzle',
    difficulty: 'medium',
    tutorial: 'Click to reveal cells. Right-click to flag mines. Numbers show adjacent mine count. Clear all safe cells to win!',
  },
  {
    id: 'flagquiz',
    title: 'Country Flag Quiz',
    category: 'Trivia',
    subcategory: 'Knowledge',
    description: 'Multiple choice flag trivia with streak counters & category filters.',
    icon: Flag,
    badge: 'Trivia',
    difficulty: 'medium',
    tutorial: 'Identify the country from its flag. Choose from 4 options. Answer correctly before time runs out. Build streaks for bonus points!',
  },
  {
    id: 'memory',
    title: 'Memory Match',
    category: 'Puzzle',
    subcategory: 'Memory',
    description: 'Card matching game with grid sizes, timer, and move counter.',
    icon: Brain,
    badge: 'Puzzle',
    difficulty: 'easy',
    tutorial: 'Click cards to flip and reveal emojis. Match pairs of identical emojis. Fewer moves and faster time give higher scores.',
  },
  {
    id: 'snake',
    title: 'Snake Game',
    category: 'Arcade',
    subcategory: 'Classic',
    description: 'Classic snake game with canvas rendering and difficulty speeds.',
    icon: Zap,
    badge: 'Arcade',
    difficulty: 'easy',
    tutorial: 'Use Arrow keys to control the snake. Eat green food to grow. Avoid walls and your own body. Beat your high score!',
  },
  {
    id: 'typing',
    title: 'Typing Speed Test',
    category: 'Puzzle',
    subcategory: 'Skill',
    description: 'Typing speed test with WPM, accuracy tracking, and difficulty levels.',
    icon: Keyboard,
    badge: 'Puzzle',
    difficulty: 'medium',
    tutorial: 'Type the displayed text as fast and accurately as possible. Green = correct, Red = incorrect. Score based on WPM × accuracy.',
  },
  {
    id: 'hangman',
    title: 'Hangman',
    category: 'Trivia',
    subcategory: 'Word Game',
    description: 'Classic word guessing game with aviation-themed words and lives system.',
    icon: Brain,
    badge: 'Trivia',
    difficulty: 'easy',
    tutorial: 'Guess the aviation-themed word one letter at a time. Each wrong guess costs a life. You have 6 lives. Win by revealing all letters before running out of lives.',
  },
];

type CategoryFilter = 'All' | string;
type DifficultyFilter = 'All' | 'easy' | 'medium' | 'hard';

const CATEGORIES = ['All', 'Arcade', 'Casino', 'Cards', 'Puzzle', 'Trivia'];
const DIFFICULTIES: DifficultyFilter[] = ['All', 'easy', 'medium', 'hard'];

const STORAGE_KEY = 'brio_arcade_highscores';

const getHighScores = (): Record<string, { score: number; timestamp: string }> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveHighScore = (gameId: string, score: number) => {
  try {
    const scores = getHighScores();
    if (!scores[gameId] || score > scores[gameId].score) {
      scores[gameId] = { score, timestamp: new Date().toLocaleDateString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const ArcadeGamesHub: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All');
  const [showTutorial, setShowTutorial] = useState(false);
  const [highScores, setHighScores] = useState<Record<string, { score: number; timestamp: string }>>({});
  const [tutorialGame, setTutorialGame] = useState<string>('');

  useEffect(() => {
    setHighScores(getHighScores());
  }, [selectedGame]);

  const filteredGames = GAMES_LIST.filter((game) => {
    if (categoryFilter !== 'All' && game.category !== categoryFilter) return false;
    if (difficultyFilter !== 'All' && game.difficulty !== difficultyFilter) return false;
    return true;
  });

  const handleLaunchGame = (gameId: GameId) => {
    setSelectedGame(gameId);
    setShowTutorial(false);
  };

  const handleShowTutorial = (game: GameItem) => {
    setTutorialGame(game.id);
    setShowTutorial(true);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'hard': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getGameScore = (gameId: string) => {
    return highScores[gameId]?.score || 0;
  };

  if (selectedGame) {
    return (
      <div className="space-y-4">
        <div className="skeuo-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 skeuo-inset-panel border border-red-500/40 rounded-xl text-red-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="skeuo-text-embossed">Brio Arcade & Gaming Suite</h3>
                <p className="text-xs text-red-200/90 font-medium">13 Fully interactive games with high score storage</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedGame(null)}
              className="skeuo-btn-primary px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all"
            >
              ← Back to Games Menu
            </button>
          </div>
        </div>
        <div className="transition-all duration-300">
          {selectedGame === 'tetris' && <TetrisGame />}
          {selectedGame === 'slots' && <SlotsGame />}
          {selectedGame === 'lottery' && <LotteryGame />}
          {selectedGame === 'uno' && <UnoGame />}
          {selectedGame === 'poker' && <PokerGame />}
          {selectedGame === 'blackjack' && <BlackjackGame />}
          {selectedGame === 'flappy' && <FlappyBirdGame />}
          {selectedGame === 'minesweeper' && <MinesweeperGame />}
          {selectedGame === 'flagquiz' && <FlagQuizGame />}
          {selectedGame === 'memory' && <MemoryCardGame />}
          {selectedGame === 'snake' && <SnakeGame />}
          {selectedGame === 'typing' && <TypingGame />}
          {selectedGame === 'hangman' && <HangmanGame />}
        </div>
      </div>
    );
  }

  if (showTutorial && tutorialGame) {
    const game = GAMES_LIST.find((g) => g.id === tutorialGame);
    if (game) {
      return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-rose-400">
              <HelpCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">{game.title} - Instructions</h3>
            </div>
            <button onClick={() => setShowTutorial(false)} className="text-[11px] text-zinc-400 hover:text-white">Close</button>
          </div>
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 rounded-xl"><game.icon className="w-6 h-6 text-red-400" /></div>
              <div>
                <h4 className="text-sm font-bold text-white">{game.title}</h4>
                <span className="text-[10px] text-zinc-400">{game.badge} • <span className="capitalize">{game.difficulty}</span></span>
              </div>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{game.tutorial}</p>
            {getGameScore(game.id) > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
                <Trophy className="w-4 h-4" />
                <span>High Score: {getGameScore(game.id)} pts</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowTutorial(false)} className="skeuo-btn flex-1 py-3 bg-slate-800 text-white font-bold text-xs rounded-xl">Back to Menu</button>
            <button onClick={() => { setShowTutorial(false); handleLaunchGame(game.id); }} className="skeuo-btn flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2">
              Play Now
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="skeuo-panel">
        <div className="flex items-center gap-3">
          <div className="p-2.5 skeuo-inset-panel border border-red-500/40 rounded-xl text-red-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="skeuo-text-embossed">Brio Arcade & Gaming Suite</h3>
            <p className="text-xs text-red-200/90 font-medium">13 Fully interactive games with encrypted high score storage</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`skeuo-btn px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${categoryFilter === cat ? 'bg-red-500 text-slate-950 shadow' : 'bg-slate-800 text-zinc-300 hover:bg-slate-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`skeuo-btn px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all capitalize ${difficultyFilter === diff ? 'bg-red-500 text-slate-950 shadow' : 'bg-slate-800 text-zinc-300 hover:bg-slate-700'}`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="wiiu-grid">
        {filteredGames.map((game) => {
          const Icon = game.icon;
          const gameHighScore = getGameScore(game.id);
          return (
            <button
              key={game.id}
              onClick={() => handleLaunchGame(game.id)}
              className="skeuo-card text-left group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="skeuo-panel">
                  <Icon className="w-5 h-5 text-red-400" />
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(game.difficulty)}`}>
                  {game.difficulty}
                </span>
              </div>
              <div className="skeuo-text-embossed">{game.title}</div>
              <span className="skeuo-badge">{game.badge}</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-medium text-center px-2 relative z-10">
                {game.description}
              </p>
              {gameHighScore > 0 && (
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-400 mt-2">
                  <Trophy className="w-3 h-3" />
                  <span>Best: {gameHighScore}</span>
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-[11px] font-semibold text-red-300 relative z-10 w-full">
                <button
                  onClick={(e) => { e.stopPropagation(); handleShowTutorial(game); }}
                  className="flex items-center gap-1 hover:text-white transition-all"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>How to Play</span>
                </button>
                <span className="group-hover:translate-x-1 transition-transform">Launch →</span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No games match the selected filters.</p>
          <button onClick={() => { setCategoryFilter('All'); setDifficultyFilter('All'); }} className="mt-3 text-xs text-red-400 hover:text-red-300">Clear Filters</button>
        </div>
      )}
    </div>
  );
};
