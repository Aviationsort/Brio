/**
 * MinesweeperGame Component: Classic Minesweeper Grid
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bomb, Flag, RefreshCw } from 'lucide-react';

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  count: number;
}

export const MinesweeperGame: React.FC = () => {
  const { showToast } = useApp();
  const [size, setSize] = useState(8);
  const [mineCount, setMineCount] = useState(10);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initGrid = () => {
    const newGrid: Cell[][] = [];
    for (let r = 0; r < size; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < size; c++) {
        row.push({ r, c, isMine: false, revealed: false, flagged: false, count: 0 });
      }
      newGrid.push(row);
    }

    // Place mines
    let placed = 0;
    while (placed < mineCount) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate numbers
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < size && nc >= 0 && nc < size && newGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          newGrid[r][c].count = count;
        }
      }
    }

    setGrid(newGrid);
    setGameOver(false);
    setWon(false);
  };

  React.useEffect(() => {
    initGrid();
  }, [size]);

  const revealCell = (r: number, c: number) => {
    if (gameOver || won || grid[r][c].flagged || grid[r][c].revealed) return;

    const newGrid = grid.map((row) => [...row]);
    if (newGrid[r][c].isMine) {
      // Reveal all mines
      newGrid.forEach((row) => row.forEach((cell) => {
        if (cell.isMine) cell.revealed = true;
      }));
      setGrid(newGrid);
      setGameOver(true);
      showToast('BOOM!', 'You hit a mine.', 'error');
      return;
    }

    // Cascade reveal
    const cascade = (currR: number, currC: number) => {
      if (currR < 0 || currR >= size || currC < 0 || currC >= size) return;
      if (newGrid[currR][currC].revealed || newGrid[currR][currC].flagged) return;

      newGrid[currR][currC].revealed = true;
      if (newGrid[currR][currC].count === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) cascade(currR + dr, currC + dc);
          }
        }
      }
    };

    cascade(r, c);
    setGrid(newGrid);

    // Check Win
    let unrevealedSafe = 0;
    newGrid.forEach((row) => row.forEach((cell) => {
      if (!cell.isMine && !cell.revealed) unrevealedSafe++;
    }));

    if (unrevealedSafe === 0) {
      setWon(true);
      showToast('VICTORY!', 'Cleared all safe mine cells!', 'success');
    }
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || won || grid[r][c].revealed) return;

    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c].flagged = !newGrid[r][c].flagged;
    setGrid(newGrid);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-6 text-center">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Bomb className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Minesweeper</h3>
        </div>
        <button
          onClick={initGrid}
          className="liquid-glass-btn p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid Board */}
      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 inline-block shadow-inner">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {grid.map((row) =>
            row.map((cell) => (
              <button
                key={`${cell.r}-${cell.c}`}
                onClick={() => revealCell(cell.r, cell.c)}
                onContextMenu={(e) => toggleFlag(e, cell.r, cell.c)}
                className={`liquid-glass-btn w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                  cell.revealed
                    ? cell.isMine
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-cyan-400'
                    : cell.flagged
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {cell.revealed ? (
                  cell.isMine ? (
                    '💣'
                  ) : cell.count > 0 ? (
                    cell.count
                  ) : (
                    ''
                  )
                ) : cell.flagged ? (
                  '🚩'
                ) : (
                  ''
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
