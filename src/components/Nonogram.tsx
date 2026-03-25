import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';

type CellState = 0 | 1 | 2; // 0: empty, 1: filled, 2: crossed

interface NonogramProps {
  onBack: () => void;
}

export default function Nonogram({ onBack }: NonogramProps) {
  const [size, setSize] = useState<5 | 10>(5);
  const [targetGrid, setTargetGrid] = useState<boolean[][]>([]);
  const [grid, setGrid] = useState<CellState[][]>([]);
  const [rowClues, setRowClues] = useState<number[][]>([]);
  const [colClues, setColClues] = useState<number[][]>([]);
  const [won, setWon] = useState(false);

  const calculateClues = (line: boolean[]) => {
    const clues: number[] = [];
    let count = 0;
    for (const val of line) {
      if (val) {
        count++;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    return clues.length > 0 ? clues : [0];
  };

  const initGame = useCallback(() => {
    // Generate a solvable random grid (bias towards filled to make it interesting)
    const newTarget = Array.from({ length: size }, () => 
      Array.from({ length: size }, () => Math.random() > 0.4)
    );
    
    // Ensure at least one cell is filled to avoid empty puzzles
    if (!newTarget.some(row => row.some(cell => cell))) {
      newTarget[0][0] = true;
    }

    setTargetGrid(newTarget);
    setGrid(Array.from({ length: size }, () => Array(size).fill(0)));
    
    // Calculate row clues
    const rClues = newTarget.map(row => calculateClues(row));
    setRowClues(rClues);
    
    // Calculate col clues
    const cClues = [];
    for (let c = 0; c < size; c++) {
      const col = newTarget.map(row => row[c]);
      cClues.push(calculateClues(col));
    }
    setColClues(cClues);
    
    setWon(false);
  }, [size]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCellClick = (r: number, c: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent context menu on right click
    if (won) return;

    const newGrid = grid.map(row => [...row]);
    
    if (e.type === 'contextmenu' || e.button === 2) {
      // Right click: toggle cross
      newGrid[r][c] = newGrid[r][c] === 2 ? 0 : 2;
    } else {
      // Left click: toggle fill
      newGrid[r][c] = newGrid[r][c] === 1 ? 0 : 1;
    }
    
    setGrid(newGrid);
    checkWin(newGrid);
  };

  const checkWin = (currentGrid: CellState[][]) => {
    let isWin = true;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isFilled = currentGrid[r][c] === 1;
        if (isFilled !== targetGrid[r][c]) {
          isWin = false;
          break;
        }
      }
    }
    if (isWin) setWon(true);
  };

  // Find max clues length for padding
  const maxRowClues = Math.max(...rowClues.map(c => c.length), 1);
  const maxColClues = Math.max(...colClues.map(c => c.length), 1);

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6 animate-in fade-in zoom-in duration-300 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-200">Nonogram</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <button
              onClick={() => setSize(5)}
              className={`text-xs px-2 py-1 rounded ${size === 5 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}
            >
              5x5
            </button>
            <button
              onClick={() => setSize(10)}
              className={`text-xs px-2 py-1 rounded ${size === 10 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}
            >
              10x10
            </button>
          </div>
        </div>
        <button onClick={initGame} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      <div className="text-sm text-slate-400 text-center max-w-md">
        Left-click to fill (■), Right-click to mark empty (×). Numbers show consecutive filled blocks.
      </div>

      {/* Game Board */}
      <div className="bg-slate-900 p-4 sm:p-8 rounded-3xl border border-slate-800 overflow-auto max-w-full">
        <div className="flex">
          {/* Top-Left Empty Space */}
          <div 
            className="flex-shrink-0" 
            style={{ 
              width: `${maxRowClues * (size === 5 ? 1.5 : 1.2)}rem`, 
              height: `${maxColClues * (size === 5 ? 1.5 : 1.2)}rem` 
            }} 
          />
          
          {/* Column Clues */}
          <div className="flex">
            {colClues.map((clue, c) => (
              <div 
                key={`col-clue-${c}`} 
                className={`flex flex-col justify-end items-center pb-1 border-b-2 border-slate-500 ${c % 5 === 4 && c !== size - 1 ? 'border-r-2 border-slate-500' : 'border-r border-slate-700'}`}
                style={{ width: size === 5 ? '2.5rem' : '1.5rem' }}
              >
                {clue.map((num, i) => (
                  <span key={i} className={`text-slate-300 font-bold ${size === 5 ? 'text-sm' : 'text-xs'}`}>{num}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex">
          {/* Row Clues */}
          <div className="flex flex-col">
            {rowClues.map((clue, r) => (
              <div 
                key={`row-clue-${r}`} 
                className={`flex justify-end items-center pr-2 border-r-2 border-slate-500 ${r % 5 === 4 && r !== size - 1 ? 'border-b-2 border-slate-500' : 'border-b border-slate-700'}`}
                style={{ height: size === 5 ? '2.5rem' : '1.5rem', width: `${maxRowClues * (size === 5 ? 1.5 : 1.2)}rem` }}
              >
                <div className="flex gap-1">
                  {clue.map((num, i) => (
                    <span key={i} className={`text-slate-300 font-bold ${size === 5 ? 'text-sm' : 'text-xs'}`}>{num}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex flex-col border-l-2 border-t-2 border-slate-500 bg-slate-800">
            {grid.map((row, r) => (
              <div key={`row-${r}`} className="flex">
                {row.map((cell, c) => (
                  <div
                    key={`cell-${r}-${c}`}
                    onMouseDown={(e) => handleCellClick(r, c, e)}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`
                      flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors
                      ${size === 5 ? 'w-10 h-10' : 'w-6 h-6'}
                      ${c % 5 === 4 ? 'border-r-2 border-slate-500' : 'border-r border-slate-700'}
                      ${r % 5 === 4 ? 'border-b-2 border-slate-500' : 'border-b border-slate-700'}
                      ${cell === 1 ? 'bg-indigo-500 hover:bg-indigo-400' : ''}
                    `}
                  >
                    {cell === 2 && <span className="text-slate-500 text-xs font-bold">×</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Win Overlay */}
      {won && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center space-y-4 max-w-sm w-full"
        >
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-2xl font-bold text-white">Puzzle Solved!</h3>
          <p className="text-slate-300">You successfully decoded the image.</p>
          <button
            onClick={initGame}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
          >
            Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
