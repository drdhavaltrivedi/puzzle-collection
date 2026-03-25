import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, ArrowLeft, Hash, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const GRID_SIZE = 4;

type Board = number[][];

const getEmptyBoard = (): Board => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

const spawnTile = (board: Board): Board => {
  const emptyCells: {r: number, c: number}[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === 0) emptyCells.push({r, c});
    }
  }
  if (emptyCells.length === 0) return board;
  
  const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
};

const initializeGame = () => spawnTile(spawnTile(getEmptyBoard()));

const getTileColor = (value: number) => {
  switch (value) {
    case 2: return 'bg-slate-200 text-slate-800';
    case 4: return 'bg-slate-300 text-slate-800';
    case 8: return 'bg-orange-300 text-orange-900';
    case 16: return 'bg-orange-400 text-orange-950';
    case 32: return 'bg-orange-500 text-white';
    case 64: return 'bg-orange-600 text-white';
    case 128: return 'bg-yellow-400 text-yellow-900 shadow-[0_0_15px_rgba(250,204,21,0.5)]';
    case 256: return 'bg-yellow-500 text-yellow-950 shadow-[0_0_20px_rgba(234,179,8,0.6)]';
    case 512: return 'bg-yellow-600 text-white shadow-[0_0_25px_rgba(202,138,4,0.7)]';
    case 1024: return 'bg-amber-500 text-white shadow-[0_0_30px_rgba(245,158,11,0.8)]';
    case 2048: return 'bg-amber-600 text-white shadow-[0_0_40px_rgba(217,119,6,0.9)]';
    default: return 'bg-slate-800 text-slate-200'; // 0 or >2048
  }
};

export default function Game2048({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Board>(initializeGame());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [hasContinued, setHasContinued] = useState(false);

  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (isGameOver || (isWon && !hasContinued)) return;

    let newBoard = board.map(row => [...row]);
    let newScore = score;
    let moved = false;

    const slide = (row: number[]) => {
      let arr = row.filter(val => val !== 0);
      let missing = GRID_SIZE - arr.length;
      let zeros = Array(missing).fill(0);
      return arr.concat(zeros);
    };

    const combine = (row: number[]) => {
      for (let i = 0; i < row.length - 1; i++) {
        if (row[i] !== 0 && row[i] === row[i + 1]) {
          row[i] *= 2;
          row[i + 1] = 0;
          newScore += row[i];
          moved = true;
        }
      }
      return row;
    };

    if (direction === 'LEFT' || direction === 'RIGHT') {
      for (let r = 0; r < GRID_SIZE; r++) {
        let row = newBoard[r];
        if (direction === 'RIGHT') row.reverse();
        row = slide(row);
        row = combine(row);
        row = slide(row);
        if (direction === 'RIGHT') row.reverse();
        
        for (let c = 0; c < GRID_SIZE; c++) {
          if (newBoard[r][c] !== row[c]) moved = true;
          newBoard[r][c] = row[c];
        }
      }
    } else {
      for (let c = 0; c < GRID_SIZE; c++) {
        let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        if (direction === 'DOWN') col.reverse();
        col = slide(col);
        col = combine(col);
        col = slide(col);
        if (direction === 'DOWN') col.reverse();
        
        for (let r = 0; r < GRID_SIZE; r++) {
          if (newBoard[r][c] !== col[r]) moved = true;
          newBoard[r][c] = col[r];
        }
      }
    }

    if (moved) {
      newBoard = spawnTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);
      if (newScore > bestScore) setBestScore(newScore);

      if (!isWon && newBoard.some(row => row.includes(2048))) {
        setIsWon(true);
      }

      let canMove = false;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (newBoard[r][c] === 0) canMove = true;
          if (c < GRID_SIZE - 1 && newBoard[r][c] === newBoard[r][c + 1]) canMove = true;
          if (r < GRID_SIZE - 1 && newBoard[r][c] === newBoard[r + 1][c]) canMove = true;
        }
      }
      if (!canMove) setIsGameOver(true);
    }
  }, [board, score, bestScore, isGameOver, isWon, hasContinued]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move('UP');
      else if (e.key === 'ArrowDown') move('DOWN');
      else if (e.key === 'ArrowLeft') move('LEFT');
      else if (e.key === 'ArrowRight') move('RIGHT');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const restartGame = () => {
    setBoard(initializeGame());
    setScore(0);
    setIsGameOver(false);
    setIsWon(false);
    setHasContinued(false);
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
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          2048
        </h1>
        <p className="text-slate-400 text-sm">Join the numbers and get to the 2048 tile!</p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm text-center">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Score</p>
          <p className="font-mono text-xl text-white">{score}</p>
        </div>
        <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm text-center">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Best</p>
          <p className="font-mono text-xl text-white">{bestScore}</p>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="grid grid-cols-4 gap-2 aspect-square">
          {board.map((row, r) => 
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`
                  relative flex items-center justify-center rounded-xl text-2xl font-bold
                  transition-all duration-200
                  ${val === 0 ? 'bg-slate-950/50' : getTileColor(val)}
                `}
              >
                {val !== 0 && (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={`${r}-${c}-${val}`}
                  >
                    {val}
                  </motion.span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Overlays */}
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center space-y-6 p-6 text-center"
          >
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
              <p className="text-slate-300">
                You scored <span className="text-orange-400 font-mono">{score}</span> points.
              </p>
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

        {isWon && !hasContinued && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center space-y-6 p-6 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-2">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">You Win!</h2>
              <p className="text-slate-300">
                You reached the 2048 tile!
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setHasContinued(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 border border-slate-700"
              >
                Keep Playing
              </button>
              <button
                onClick={restartGame}
                className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/25"
              >
                Restart
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto md:hidden">
        <div />
        <button onClick={() => move('UP')} className="p-4 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 active:bg-slate-600"><ChevronUp className="w-6 h-6" /></button>
        <div />
        <button onClick={() => move('LEFT')} className="p-4 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 active:bg-slate-600"><ChevronLeft className="w-6 h-6" /></button>
        <button onClick={() => move('DOWN')} className="p-4 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 active:bg-slate-600"><ChevronDown className="w-6 h-6" /></button>
        <button onClick={() => move('RIGHT')} className="p-4 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 active:bg-slate-600"><ChevronRight className="w-6 h-6" /></button>
      </div>

      {/* Controls */}
      <div className="flex justify-center hidden md:flex">
        <button
          onClick={restartGame}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart Game</span>
        </button>
      </div>
    </div>
  );
}
