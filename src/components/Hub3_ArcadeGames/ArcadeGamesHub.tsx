/**
 * Hub 3: Arcade & Gaming Suite Container
 * Select and launch any of the 11 interactive games
 */

import React, { useState } from 'react';
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
} from 'lucide-react';

interface GameItem {
  id: GameId;
  title: string;
  category: string;
  description: string;
  icon: React.ElementType;
  badge: string;
}

const GAMES_LIST: GameItem[] = [
  {
    id: 'tetris',
    title: 'Tetris',
    category: 'Arcade',
    description: 'Classic block puzzle with acceleration and encrypted high scores.',
    icon: Grid,
    badge: 'Arcade',
  },
  {
    id: 'slots',
    title: 'Casino Slots',
    category: 'Casino',
    description: '3-reel casino slot machine with animated reels & payout multipliers.',
    icon: Sparkles,
    badge: 'Casino',
  },
  {
    id: 'lottery',
    title: 'Lottery Draw',
    category: 'Casino',
    description: 'Custom number picking & daily draw simulation with frequency graphs.',
    icon: Ticket,
    badge: 'Casino',
  },
  {
    id: 'uno',
    title: 'UNO Cards',
    category: 'Cards',
    description: 'Play UNO vs 3 AI bots with Draw 2, Skip, Reverse, and Wild cards.',
    icon: Club,
    badge: 'Cards',
  },
  {
    id: 'poker',
    title: 'Texas Hold\'em Poker',
    category: 'Casino',
    description: 'Poker table vs 3 AI bots with pot management & chip tracking.',
    icon: Club,
    badge: 'Casino',
  },
  {
    id: 'blackjack',
    title: 'Blackjack 21',
    category: 'Casino',
    description: 'Casino Blackjack table with Hit, Stand, Double, Split & Insurance.',
    icon: Coins,
    badge: 'Casino',
  },
  {
    id: 'flappy',
    title: 'Aircraft Flappy',
    category: 'Arcade',
    description: 'Aircraft flight physics game with particle effects and high scores.',
    icon: Bird,
    badge: 'Arcade',
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    category: 'Puzzle',
    description: 'Grid mine sweeper with 3 difficulties, flags, and timer.',
    icon: Bomb,
    badge: 'Puzzle',
  },
  {
    id: 'flagquiz',
    title: 'Country Flag Quiz',
    category: 'Trivia',
    description: 'Multiple choice flag trivia with streak counters & category filters.',
    icon: Flag,
    badge: 'Trivia',
  },
];

export const ArcadeGamesHub: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  return (
    <div className="space-y-6">
      {/* Selector Header */}
      <div className="wiiu-header aero-glossy">
        <div className="flex items-center gap-3">
          <div className="p-2.5 flash-panel border border-red-500/40 rounded-xl text-red-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="wiiu-header-title">Brio Arcade & Gaming Suite</h3>
            <p className="text-xs text-red-200/90 font-medium">9 Fully interactive games with encrypted high score storage</p>
          </div>
        </div>

        {selectedGame && (
          <button
            onClick={() => setSelectedGame(null)}
            className="flash-btn px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all"
          >
            ← Back to Games Menu
          </button>
        )}
      </div>

      {/* Game Runner or Grid Selector */}
      {selectedGame ? (
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
        </div>
      ) : (
        <div className="wiiu-grid">
          {GAMES_LIST.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className="wiiu-tile text-left"
              >
                <div className="wiiu-tile-icon">
                  <Icon className="w-5 h-5 text-red-400" />
                </div>
                <div className="wiiu-tile-label">{game.title}</div>
                <span className="wiiu-tile-badge">{game.badge}</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium text-center px-2 relative z-10">
                  {game.description}
                </p>
                <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-[11px] font-semibold text-red-300 relative z-10 w-full">
                  <span>Launch Game</span>
                  <span>➔</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
