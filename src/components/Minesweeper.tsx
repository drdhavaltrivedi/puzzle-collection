import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, Clock, ArrowLeft, Bomb, Flag, Skull } from 'lucide-react';

const ROWS = 10;
const COLS = 10;
const MINES = 15;

type Cell = {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

const generateBoard = (firstR: number = -1, firstC: number = -1): Cell[][] => {
  let board: Cell[][] = Array(ROWS).fill(null).map((_, r) => 
    Array(COLS).fill(null).map((_, c) => ({
      r, c, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0
    }))
  );

  let minesPlaced = 0;
  while (minesPlaced < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    
    // Don't place mine on first click or if already a mine
    if (!board[r][c].isMine && !(r === firstR && c === firstC)) {
      board[r][c].isMine = true;
      minesPlaced++;
    }
  }

  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c].isMine) {
        let count = 0;
        dirs.forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) {
            count++;
          }
        });
        board[r][c].neighborMines = count;
      }
    }
  }
  return board;
};

export default function Minesweeper({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Cell[][]>(() => generateBoard());
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [time, setTime] = useState(0);
  const [flagsLeft, setFlagsLeft] = useState(MINES);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isFirstClick && !isGameOver && !isWon) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isFirstClick, isGameOver, isWon]);

  const checkWin = (currentBoard: Cell[][]) => {
    let won = true;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = currentBoard[r][c];
        if (!cell.isMine && !cell.isRevealed) {
          won = false;
          break;
        }
      }
    }
    if (won) {
      setIsWon(true);
      // Flag all remaining mines
      setBoard(prev => prev.map(row => row.map(cell => cell.isMine ? { ...cell, isFlagged: true } : cell)));
      setFlagsLeft(0);
    }
  };

  const revealCell = (r: number, c: number) => {
    if (isGameOver || isWon || board[r][c].isRevealed || board[r][c].isFlagged) return;

    let currentBoard = board;

    if (isFirstClick) {
      setIsFirstClick(false);
      currentBoard = generateBoard(r, c);
    }

    const newBoard = currentBoard.map(row => [...row]);
    
    if (newBoard[r][c].isMine) {
      // Game Over
      newBoard.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      }));
      setBoard(newBoard);
      setIsGameOver(true);
      return;
    }

    // Flood fill
    const stack = [[r, c]];
    while (stack.length > 0) {
      const [currR, currC] = stack.pop()!;
      if (!newBoard[currR][currC].isRevealed && !newBoard[currR][currC].isFlagged) {
        newBoard[currR][currC].isRevealed = true;
        if (newBoard[currR][currC].neighborMines === 0) {
          const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
          dirs.forEach(([dr, dc]) => {
            const nr = currR + dr, nc = currC + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              stack.push([nr, nc]);
            }
          });
        }
      }
    }

    setBoard(newBoard);
    checkWin(newBoard);
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (isGameOver || isWon || board[r][c].isRevealed) return;

    const newBoard = board.map(row => [...row]);
    const cell = newBoard[r][c];
    
    if (!cell.isFlagged && flagsLeft > 0) {
      cell.isFlagged = true;
      setFlagsLeft(f => f - 1);
    } else if (cell.isFlagged) {
      cell.isFlagged = false;
      setFlagsLeft(f => f + 1);
    }
    
    setBoard(newBoard);
  };

  const restartGame = () => {
    setBoard(generateBoard());
    setIsFirstClick(true);
    setIsGameOver(false);
    setIsWon(false);
    setTime(0);
    setFlagsLeft(MINES);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getNumberColor = (count: number) => {
    switch (count) {
      case 1: return 'text-blue-400';
      case 2: return 'text-green-400';
      case 3: return 'text-red-400';
      case 4: return 'text-purple-400';
      case 5: return 'text-yellow-400';
      case 6: return 'text-cyan-400';
      case 7: return 'text-orange-400';
      case 8: return 'text-pink-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Header */}
      <div className="relative text-center space-y-2">
        <button 
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-600">
          Minesweeper
        </h1>
        <p className="text-slate-400 text-sm">Clear the board without detonating any mines.</p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-slate-300">
          <Clock className="w-5 h-5 text-slate-400" />
          <span className="font-mono text-lg">{formatTime(time)}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <Flag className="w-5 h-5 text-rose-500" />
          <span className="font-mono text-lg">{flagsLeft}</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div 
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) => 
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={(e) => toggleFlag(e, r, c)}
                className={`
                  aspect-square flex items-center justify-center rounded text-sm font-bold
                  transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500
                  ${cell.isRevealed 
                    ? cell.isMine 
                      ? 'bg-red-500/20 border border-red-500/50' 
                      : 'bg-slate-950/50 border border-slate-800'
                    : 'bg-slate-700 hover:bg-slate-600 border border-slate-600 shadow-sm'
                  }
                `}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    <Bomb className="w-4 h-4 text-red-500" />
                  ) : (
                    cell.neighborMines > 0 && (
                      <span className={getNumberColor(cell.neighborMines)}>
                        {cell.neighborMines}
                      </span>
                    )
                  )
                ) : (
                  cell.isFlagged && <Flag className="w-4 h-4 text-rose-500" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Overlays */}
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-6 p-6 text-center"
          >
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
              <Skull className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
              <p className="text-slate-300">You hit a mine.</p>
            </div>
            <button
              onClick={restartGame}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 border border-slate-700"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
          </motion.div>
        )}

        {isWon && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6 p-6 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-2">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">You Win!</h2>
              <p className="text-slate-300">
                Cleared in <span className="text-rose-400 font-mono">{formatTime(time)}</span>.
              </p>
            </div>
            <button
              onClick={restartGame}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 border border-slate-700"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Play Again</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <button
          onClick={restartGame}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart</span>
        </button>
      </div>
    </div>
  );
}
