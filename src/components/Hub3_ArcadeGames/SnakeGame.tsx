/**
 * SnakeGame Component: Classic Snake Game with Canvas
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, RotateCcw, Gamepad2, Zap } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 16;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

type Direction = { x: number; y: number };
type SnakeSegment = { x: number; y: number };

export const SnakeGame: React.FC = () => {
  const { showToast } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('snake_highscore') || '0'));
  const snakeRef = useRef<SnakeSegment[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>({ x: 1, y: 0 });
  const foodRef = useRef<{ x: number; y: number }>({ x: 15, y: 10 });
  const gameLoopRef = useRef<number | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);

  const SPEEDS = { easy: 150, medium: 100, hard: 60 };

  const spawnFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    const snake = snakeRef.current;
    if (snake.some((seg) => seg.x === newFood.x && seg.y === newFood.y)) {
      return spawnFood();
    }
    foodRef.current = newFood;
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    spawnFood();
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setShowTutorial(false);
  }, [spawnFood]);

  const handleGameOver = useCallback(() => {
    setGameOver(true);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake_highscore', score.toString());
      showToast('New High Score!', `Snake score: ${score}`, 'success');
    } else {
      showToast('Game Over', `Snake score: ${score}`, 'info');
    }
  }, [score, highScore, showToast]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const speed = SPEEDS[difficulty];
    gameLoopRef.current = window.setInterval(() => {
      const snake = snakeRef.current;
      const food = foodRef.current;
      const dir = directionRef.current;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        handleGameOver();
        return;
      }
      if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
        handleGameOver();
        return;
      }

      const newSnake = [head, ...snake];
      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => prev + 10);
        spawnFood();
      } else {
        newSnake.pop();
      }
      snakeRef.current = newSnake;
    }, speed);
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, difficulty, spawnFood, handleGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      const current = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (current.y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (current.y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (current.x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (current.x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
    const snake = snakeRef.current;
    snake.forEach((seg, idx) => {
      const alpha = 1 - idx / (snake.length + 10);
      ctx.fillStyle = idx === 0 ? '#f87171' : `rgba(244, 63, 94, ${alpha})`;
      ctx.fillRect(seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
    const food = foodRef.current;
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
  });

  const TutorialScreen = () => {
    if (!showTutorial || gameStarted || gameOver) return null;
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-6 text-center">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <Zap className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Snake Game</h3>
          </div>
          <button onClick={() => setShowTutorial(false)} className="text-[11px] text-zinc-400 hover:text-white">Skip</button>
        </div>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-left">
          <h4 className="text-sm font-bold text-white">How to Play</h4>
          <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
            <li>Use Arrow keys to control the snake.</li>
            <li>Eat the green food to grow and score points.</li>
            <li>Avoid hitting the walls or your own body.</li>
            <li>Choose difficulty: Easy (slow), Medium, or Hard (fast).</li>
            <li>Try to beat your high score!</li>
          </ul>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-2">Speed</label>
            <div className="flex gap-2 justify-center">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`skeuo-btn px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${difficulty === d ? 'bg-red-500 text-slate-950' : 'bg-slate-800 text-zinc-300 hover:bg-slate-700'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <button onClick={resetGame} className="skeuo-btn w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            <span>Start Game</span>
          </button>
        </div>
      </div>
    );
  };

  if (showTutorial && !gameStarted && !gameOver) {
    return <TutorialScreen />;
  }

  if (gameOver) {
    const isNewRecord = score > highScore && score > 0;
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-6 text-center">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <Trophy className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Game Over</h3>
          </div>
        </div>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="text-5xl mb-2">{isNewRecord ? '🏆' : '🐍'}</div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase">Score</p>
              <p className="text-lg font-black text-red-400">{score}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase">Best</p>
              <p className="text-lg font-black text-amber-400">{highScore}</p>
            </div>
          </div>
          {isNewRecord && <p className="text-xs text-emerald-400 font-bold">New High Score! 🎉</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setGameStarted(false); setShowTutorial(true); setGameOver(false); }} className="skeuo-btn flex-1 py-3 bg-slate-800 text-white font-bold text-xs rounded-xl">Menu</button>
          <button onClick={resetGame} className="skeuo-btn flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-4 text-center">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Zap className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Snake</h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-red-400 font-bold">Score: {score}</span>
          <span className="text-amber-400 font-bold">Best: {highScore}</span>
        </div>
      </div>
      <div className="flex justify-center">
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="rounded-2xl border border-slate-800 shadow-inner" />
      </div>
      <p className="text-[10px] text-zinc-500 font-mono">Use Arrow Keys to move. Eat green food. Avoid walls and yourself.</p>
      <button onClick={() => { setGameStarted(false); setShowTutorial(true); setGameOver(false); }} className="text-[11px] text-zinc-400 hover:text-white">← Exit</button>
    </div>
  );
};
