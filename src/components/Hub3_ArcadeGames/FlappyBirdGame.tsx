/**
 * FlappyBirdGame Component: Canvas Aircraft Flight Physics Game
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Bird, Play, RotateCcw, ShieldCheck } from 'lucide-react';

export const FlappyBirdGame: React.FC = () => {
  const { showToast } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(18);

  const birdYRef = useRef(150);
  const velocityRef = useRef(0);
  const pipesRef = useRef<{ x: number; top: number; bottom: number; passed?: boolean }[]>([]);

  const jump = () => {
    if (!isPlaying) return;
    velocityRef.current = -7;
  };

  const startGame = () => {
    birdYRef.current = 150;
    velocityRef.current = 0;
    pipesRef.current = [
      { x: 300, top: 100, bottom: 220 },
      { x: 480, top: 140, bottom: 260 },
    ];
    setScore(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      // Physics
      velocityRef.current += 0.45;
      birdYRef.current += velocityRef.current;

      // Clear Canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Aircraft
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(60, birdYRef.current, 12, 0, Math.PI * 2);
      ctx.fill();

      // Wing detail
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(50, birdYRef.current - 2, 14, 4);

      // Pipes
      for (let i = 0; i < pipesRef.current.length; i++) {
        const p = pipesRef.current[i];
        p.x -= 2.5;

        // Draw top pipe
        ctx.fillStyle = '#10b981';
        ctx.fillRect(p.x, 0, 35, p.top);
        // Draw bottom pipe
        ctx.fillRect(p.x, p.bottom, 35, canvas.height - p.bottom);

        // Score Check
        if (!p.passed && p.x < 60) {
          p.passed = true;
          setScore((s) => {
            const next = s + 1;
            if (next > highScore) setHighScore(next);
            return next;
          });
        }

        // Collision Check
        if (
          60 + 12 > p.x &&
          60 - 12 < p.x + 35 &&
          (birdYRef.current - 12 < p.top || birdYRef.current + 12 > p.bottom)
        ) {
          setIsPlaying(false);
          showToast('Aircraft Crashed!', `Score: ${score}`, 'info');
          return;
        }
      }

      // Spawn Pipe
      if (pipesRef.current.length > 0 && pipesRef.current[0].x < -40) {
        pipesRef.current.shift();
        const top = Math.random() * 120 + 40;
        pipesRef.current.push({ x: 320, top, bottom: top + 110 });
      }

      // Ground Check
      if (birdYRef.current >= canvas.height - 10 || birdYRef.current <= 0) {
        setIsPlaying(false);
        showToast('Aircraft Crashed!', `Score: ${score}`, 'info');
        return;
      }

      animId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, score, highScore]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-6 text-center">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Bird className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Aircraft Flappy</h3>
        </div>
        <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5" /> High Score: {highScore}
        </span>
      </div>

      <div onClick={jump} className="cursor-pointer">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="w-full h-80 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-inner"
        />
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-slate-300">
        <span>Score: {score}</span>
        <span>Click / Tap canvas to flap wings!</span>
      </div>

      {!isPlaying ? (
        <button
          onClick={startGame}
          className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          <span>Takeoff Aircraft</span>
        </button>
      ) : (
        <button
          onClick={startGame}
          className="w-full py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
        >
          Restart Flight
        </button>
      )}
    </div>
  );
};
