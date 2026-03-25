import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Trophy, Clock, Move, ArrowLeft } from 'lucide-react';

const GRID_SIZE = 4;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

const getSolvedBoard = () => [...Array(TOTAL_TILES - 1).keys()].map(n => n + 1).concat(0);

const shuffleBoard = () => {
  let currentBoard = getSolvedBoard();
  let emptyIdx = TOTAL_TILES - 1;
  let lastMove = -1;
  
  for(let i = 0; i < 200; i++) {
    const validMoves = [];
    const row = Math.floor(emptyIdx / GRID_SIZE);
    const col = emptyIdx % GRID_SIZE;
    
    if (row > 0 && emptyIdx - GRID_SIZE !== lastMove) validMoves.push(emptyIdx - GRID_SIZE);
    if (row < GRID_SIZE - 1 && emptyIdx + GRID_SIZE !== lastMove) validMoves.push(emptyIdx + GRID_SIZE);
    if (col > 0 && emptyIdx - 1 !== lastMove) validMoves.push(emptyIdx - 1);
    if (col < GRID_SIZE - 1 && emptyIdx + 1 !== lastMove) validMoves.push(emptyIdx + 1);

    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    [currentBoard[emptyIdx], currentBoard[randomMove]] = [currentBoard[randomMove], currentBoard[emptyIdx]];
    lastMove = emptyIdx;
    emptyIdx = randomMove;
  }
  
  return currentBoard;
};

export default function FifteenPuzzle({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<number[]>(getSolvedBoard());
  const [isStarted, setIsStarted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && !isWon) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, isWon]);

  const checkWin = useCallback((currentBoard: number[]) => {
    const solved = getSolvedBoard();
    if (currentBoard.every((val, i) => val === solved[i])) {
      setIsWon(true);
      setIsStarted(false);
    }
  }, []);

  const handleTileClick = useCallback((index: number) => {
    if (!isStarted || isWon) return;
    
    const emptyIdx = board.indexOf(0);
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const emptyRow = Math.floor(emptyIdx / GRID_SIZE);
    const emptyCol = emptyIdx % GRID_SIZE;

    // Only allow moves in same row or same column
    if (row !== emptyRow && col !== emptyCol) return;

    const newBoard = [...board];
    
    if (row === emptyRow) {
      // Horizontal slide
      const start = Math.min(col, emptyCol);
      const end = Math.max(col, emptyCol);
      const direction = col < emptyCol ? 1 : -1;
      
      // Shift tiles
      if (direction === 1) {
        // Move tiles right towards empty slot
        for (let c = emptyCol; c > col; c--) {
          newBoard[row * GRID_SIZE + c] = newBoard[row * GRID_SIZE + c - 1];
        }
      } else {
        // Move tiles left towards empty slot
        for (let c = emptyCol; c < col; c++) {
          newBoard[row * GRID_SIZE + c] = newBoard[row * GRID_SIZE + c + 1];
        }
      }
      newBoard[row * GRID_SIZE + col] = 0;
    } else {
      // Vertical slide
      const start = Math.min(row, emptyRow);
      const end = Math.max(row, emptyRow);
      const direction = row < emptyRow ? 1 : -1;
      
      // Shift tiles
      if (direction === 1) {
        // Move tiles down towards empty slot
        for (let r = emptyRow; r > row; r--) {
          newBoard[r * GRID_SIZE + col] = newBoard[(r - 1) * GRID_SIZE + col];
        }
      } else {
        // Move tiles up towards empty slot
        for (let r = emptyRow; r < row; r++) {
          newBoard[r * GRID_SIZE + col] = newBoard[(r + 1) * GRID_SIZE + col];
        }
      }
      newBoard[row * GRID_SIZE + col] = 0;
    }

    setBoard(newBoard);
    const diff = Math.abs(row - emptyRow) + Math.abs(col - emptyCol);
    setMoves(m => m + 1); // We count 1 slide move as 1 "move" in most puzzles, even if multiple tiles slide.
    checkWin(newBoard);
  }, [board, isStarted, isWon, checkWin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted || isWon) return;
      
      const emptyIdx = board.indexOf(0);
      const row = Math.floor(emptyIdx / GRID_SIZE);
      const col = emptyIdx % GRID_SIZE;

      let targetIdx = -1;
      if (e.key === 'ArrowUp' && row < GRID_SIZE - 1) targetIdx = emptyIdx + GRID_SIZE;
      else if (e.key === 'ArrowDown' && row > 0) targetIdx = emptyIdx - GRID_SIZE;
      else if (e.key === 'ArrowLeft' && col < GRID_SIZE - 1) targetIdx = emptyIdx + 1;
      else if (e.key === 'ArrowRight' && col > 0) targetIdx = emptyIdx - 1;

      if (targetIdx !== -1) {
        handleTileClick(targetIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, isStarted, isWon, handleTileClick]);

  const startGame = () => {
    setBoard(shuffleBoard());
    setIsStarted(true);
    setIsWon(false);
    setMoves(0);
    setTime(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          15 Puzzle
        </h1>
        <p className="text-slate-400 text-sm">Slide the tiles to put them in order.</p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-slate-300">
          <Clock className="w-5 h-5 text-indigo-400" />
          <span className="font-mono text-lg">{formatTime(time)}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <Move className="w-5 h-5 text-cyan-400" />
          <span className="font-mono text-lg">{moves} moves</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="grid grid-cols-4 gap-2 aspect-square">
          {board.map((tile, index) => {
            if (tile === 0) {
              return <div key="empty" className="rounded-xl bg-slate-950/50" />;
            }

            const isCorrect = tile === index + 1;

            return (
              <motion.button
                layout
                initial={false}
                key={tile}
                onClick={() => handleTileClick(index)}
                className={`
                  relative flex items-center justify-center rounded-xl text-2xl font-bold
                  shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                  ${isCorrect 
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                  }
                `}
                whileHover={{ scale: isStarted && !isWon ? 0.98 : 1 }}
                whileTap={{ scale: isStarted && !isWon ? 0.95 : 1 }}
              >
                {tile}
              </motion.button>
            );
          })}
        </div>

        {/* Overlays */}
        {!isStarted && !isWon && (
          <div className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <button
              onClick={startGame}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25"
            >
              <Play className="w-5 h-5" />
              <span>Start Game</span>
            </button>
          </div>
        )}

        {isWon && (
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
                Solved in <span className="text-indigo-400 font-mono">{formatTime(time)}</span> with <span className="text-cyan-400 font-mono">{moves}</span> moves.
              </p>
            </div>
            <button
              onClick={startGame}
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
          onClick={startGame}
          disabled={!isStarted && !isWon}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            !isStarted && !isWon
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart</span>
        </button>
      </div>
    </div>
  );
}
