import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Trophy, Clock, Move, ArrowLeft, Lightbulb } from 'lucide-react';

const GRID_SIZE = 5;

const generateSolvableBoard = () => {
  // Start with all lights off (false)
  let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
  
  // Simulate random clicks to guarantee solvability
  for (let i = 0; i < 15; i++) {
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);
    grid = toggleLights(grid, r, c);
  }
  
  // If it accidentally solved itself, toggle one
  if (grid.every(row => row.every(cell => !cell))) {
    grid = toggleLights(grid, 0, 0);
  }
  
  return grid;
};

const toggleLights = (grid: boolean[][], r: number, c: number) => {
  const newGrid = grid.map(row => [...row]);
  const dirs = [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]];
  
  dirs.forEach(([dr, dc]) => {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
      newGrid[nr][nc] = !newGrid[nr][nc];
    }
  });
  
  return newGrid;
};

export default function LightsOut({ onBack }: { onBack: () => void }) {
  const [grid, setGrid] = useState<boolean[][]>(() => generateSolvableBoard());
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

  const handleCellClick = (r: number, c: number) => {
    if (!isStarted || isWon) return;
    
    const newGrid = toggleLights(grid, r, c);
    setGrid(newGrid);
    setMoves(m => m + 1);
    
    if (newGrid.every(row => row.every(cell => !cell))) {
      setIsWon(true);
      setIsStarted(false);
    }
  };

  const startGame = () => {
    setGrid(generateSolvableBoard());
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
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
          Lights Out
        </h1>
        <p className="text-slate-400 text-sm">Turn off all the lights to win.</p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-slate-300">
          <Clock className="w-5 h-5 text-emerald-400" />
          <span className="font-mono text-lg">{formatTime(time)}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <Move className="w-5 h-5 text-teal-400" />
          <span className="font-mono text-lg">{moves} moves</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="grid grid-cols-5 gap-2 aspect-square">
          {grid.map((row, r) => 
            row.map((isOn, c) => (
              <motion.button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`
                  relative flex items-center justify-center rounded-xl
                  shadow-sm transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
                  ${isOn 
                    ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] border border-emerald-300' 
                    : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                  }
                `}
                whileHover={{ scale: isStarted && !isWon ? 0.95 : 1 }}
                whileTap={{ scale: isStarted && !isWon ? 0.9 : 1 }}
              >
                {isOn && <Lightbulb className="w-6 h-6 text-emerald-900 opacity-50" />}
              </motion.button>
            ))
          )}
        </div>

        {/* Overlays */}
        {!isStarted && !isWon && (
          <div className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <button
              onClick={startGame}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25"
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
                Solved in <span className="text-emerald-400 font-mono">{formatTime(time)}</span> with <span className="text-teal-400 font-mono">{moves}</span> moves.
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
