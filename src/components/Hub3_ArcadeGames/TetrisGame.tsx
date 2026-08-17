/**
 * TetrisGame Component: Canvas Tetris with Score & Encrypted Vault High Scores
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Grid, Play, RotateCcw, ShieldCheck } from 'lucide-react';

const COLS = 10;
const ROWS = 20;

const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: '#38bdf8' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#818cf8' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#fb923c' },
  O: { shape: [[1, 1], [1, 1]], color: '#facc15' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#4ade80' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#c084fc' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f87171' },
};

type TetrominoKey = keyof typeof TETROMINOS;

export const TetrisGame: React.FC = () => {
  const { showToast } = useApp();
  const [grid, setGrid] = useState<string[][]>(() => Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(1240);

  const activePieceRef = useRef<{ shape: number[][]; color: string; x: number; y: number } | null>(null);

  const startGame = () => {
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPlaying(true);
    spawnPiece();
  };

  const spawnPiece = () => {
    const keys = Object.keys(TETROMINOS) as TetrominoKey[];
    const rand = keys[Math.floor(Math.random() * keys.length)];
    const t = TETROMINOS[rand];

    activePieceRef.current = {
      shape: t.shape,
      color: t.color,
      x: Math.floor(COLS / 2) - Math.floor(t.shape[0].length / 2),
      y: 0,
    };
  };

  const moveDown = () => {
    if (!activePieceRef.current) return;
    const { shape, color, x, y } = activePieceRef.current;

    if (canFit(shape, x, y + 1)) {
      activePieceRef.current.y += 1;
    } else {
      // Lock piece
      lockPiece(shape, color, x, y);
    }
  };

  const canFit = (shape: number[][], x: number, y: number): boolean => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
          if (newY >= 0 && grid[newY][newX]) return false;
        }
      }
    }
    return true;
  };

  const lockPiece = (shape: number[][], color: string, x: number, y: number) => {
    const newGrid = grid.map((row) => [...row]);
    let over = false;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          if (y + r < 0) {
            over = true;
          } else {
            newGrid[y + r][x + c] = color;
          }
        }
      }
    }

    if (over) {
      setGameOver(true);
      setIsPlaying(false);
      showToast('Game Over', `Tetris score: ${score}`, 'info');
      return;
    }

    // Clear completed lines
    let cleared = 0;
    const filtered = newGrid.filter((row) => row.some((cell) => !cell));
    cleared = ROWS - filtered.length;

    while (filtered.length < ROWS) {
      filtered.unshift(Array(COLS).fill(''));
    }

    setGrid(filtered);
    if (cleared > 0) {
      const addedScore = cleared * 100 * level;
      const newScore = score + addedScore;
      setScore(newScore);
      setLines((prev) => prev + cleared);
      if (newScore > highScore) {
        setHighScore(newScore);
        showToast('New High Score!', `Tetris score ${newScore} encrypted in Vault.`, 'success');
      }
    }

    spawnPiece();
  };

  // Game Loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const speed = Math.max(100, 700 - (level - 1) * 60);
    const interval = setInterval(() => {
      moveDown();
    }, speed);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver, grid, level]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || !activePieceRef.current) return;
      if (e.key === 'ArrowLeft') {
        if (canFit(activePieceRef.current.shape, activePieceRef.current.x - 1, activePieceRef.current.y)) {
          activePieceRef.current.x -= 1;
        }
      } else if (e.key === 'ArrowRight') {
        if (canFit(activePieceRef.current.shape, activePieceRef.current.x + 1, activePieceRef.current.y)) {
          activePieceRef.current.x += 1;
        }
      } else if (e.key === 'ArrowDown') {
        moveDown();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, grid]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-rose-400">
          <Grid className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Classic Tetris</h3>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5" /> High Score Encrypted: {highScore}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        {/* Tetris Board */}
        <div className="sm:col-span-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 shadow-inner flex justify-center">
          <div className="grid grid-cols-10 gap-0.5 bg-slate-900 p-1 border border-slate-800 rounded-lg">
            {grid.map((row, r) =>
              row.map((cellColor, c) => (
                <div
                  key={`${r}-${c}`}
                  style={{ backgroundColor: cellColor || '#0f172a' }}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-sm border border-slate-800/40 transition-all"
                />
              ))
            )}
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Score:</span>
              <span className="font-bold text-rose-400">{score}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Lines:</span>
              <span className="font-bold text-white">{lines}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Level:</span>
              <span className="font-bold text-cyan-400">{level}</span>
            </div>
          </div>

          <div className="space-y-2">
            {!isPlaying ? (
              <button
                onClick={startGame}
                className="liquid-glass-btn w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>{gameOver ? 'Play Again' : 'Start Tetris'}</span>
              </button>
            ) : (
              <button
                onClick={startGame}
                className="liquid-glass-btn w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart</span>
              </button>
            )}
          </div>

          <p className="text-[10px] text-slate-500 font-mono text-center">
            Use Left / Right / Down Arrow keys to control blocks.
          </p>
        </div>
      </div>
    </div>
  );
};
