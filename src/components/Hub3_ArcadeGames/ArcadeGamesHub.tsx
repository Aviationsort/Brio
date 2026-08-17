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
import { TacticalRiskGame } from './TacticalRiskGame';
import { TankeryGame } from './TankeryGame';
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
  MapPin,
  Shield,
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
    id: 'risk',
    title: 'HOI4 / Risk Tactical Map',
    category: 'Strategy',
    description: 'Tactical map simulator for Lebanon & Cyprus with troop logistics & battle sim.',
    icon: MapPin,
    badge: 'Lebanon & Cyprus',
  },
  {
    id: 'tankery',
    title: 'Girls und Panzer Tankery',
    category: 'Tactical',
    description: 'Anime GuP style tank battle simulator with armor penetration & crew stats.',
    icon: Shield,
    badge: 'GuP Tactical',
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 nightcore-panel border border-pink-500/50 rounded-xl text-pink-300">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white drop-shadow-md">Brio Arcade & Gaming Suite</h3>
            <p className="text-xs text-pink-200/90 font-medium">11 Fully interactive games with encrypted high score storage</p>
          </div>
        </div>

        {selectedGame && (
          <button
            onClick={() => setSelectedGame(null)}
            className="skeuo-button px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all"
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
          {selectedGame === 'risk' && <TacticalRiskGame />}
          {selectedGame === 'tankery' && <TankeryGame />}
          {selectedGame === 'flagquiz' && <FlagQuizGame />}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {GAMES_LIST.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className="glossy-card bg-slate-900/80 border border-slate-700/50 hover:border-pink-500/70 rounded-2xl p-5 shadow-xl flex flex-col justify-between text-left transition-all hover:scale-[1.02] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 flash-panel border border-slate-600 rounded-xl text-pink-500 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-500/50 shadow-inner">
                      {game.badge}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors mb-1 drop-shadow-sm">
                    {game.title}
                  </h4>
                  <p className="text-xs text-slate-200/90 leading-relaxed font-medium">{game.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/30 flex items-center justify-between text-[11px] font-semibold text-pink-300">
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
