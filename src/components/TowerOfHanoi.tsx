import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';

interface TowerOfHanoiProps {
  onBack: () => void;
}

export default function TowerOfHanoi({ onBack }: TowerOfHanoiProps) {
  const [numDisks, setNumDisks] = useState(4);
  const [pegs, setPegs] = useState<number[][]>([[], [], []]);
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const initGame = useCallback(() => {
    const initialPegs: number[][] = [[], [], []];
    for (let i = numDisks; i > 0; i--) {
      initialPegs[0].push(i);
    }
    setPegs(initialPegs);
    setSelectedPeg(null);
    setMoves(0);
    setWon(false);
  }, [numDisks]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handlePegClick = (pegIndex: number) => {
    if (won) return;

    if (selectedPeg === null) {
      // Select a peg if it has disks
      if (pegs[pegIndex].length > 0) {
        setSelectedPeg(pegIndex);
      }
    } else {
      // Deselect if clicking the same peg
      if (selectedPeg === pegIndex) {
        setSelectedPeg(null);
        return;
      }

      const sourcePeg = pegs[selectedPeg];
      const targetPeg = pegs[pegIndex];
      const diskToMove = sourcePeg[sourcePeg.length - 1];

      // Check if move is valid (target peg is empty or top disk is larger)
      if (targetPeg.length === 0 || targetPeg[targetPeg.length - 1] > diskToMove) {
        const newPegs = [...pegs];
        newPegs[selectedPeg] = sourcePeg.slice(0, -1);
        newPegs[pegIndex] = [...targetPeg, diskToMove];
        
        setPegs(newPegs);
        setMoves(m => m + 1);
        setSelectedPeg(null);

        // Check win condition (all disks on the last peg)
        if (pegIndex === 2 && newPegs[2].length === numDisks) {
          setWon(true);
        }
      } else {
        // Invalid move, just deselect
        setSelectedPeg(null);
      }
    }
  };

  const getDiskColor = (size: number) => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-400', 
      'bg-green-500', 'bg-emerald-400', 'bg-cyan-500', 
      'bg-blue-500', 'bg-indigo-500', 'bg-purple-500'
    ];
    return colors[(size - 1) % colors.length];
  };

  const getDiskWidth = (size: number) => {
    const minWidth = 30;
    const maxWidth = 100;
    const percentage = size / numDisks;
    return `${minWidth + (maxWidth - minWidth) * percentage}%`;
  };

  return (
    <div className="max-w-3xl w-full mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-200">Tower of Hanoi</h2>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="text-sm text-slate-400">Moves: <span className="text-white font-bold">{moves}</span></span>
            <span className="text-sm text-slate-400">Optimal: <span className="text-white font-bold">{Math.pow(2, numDisks) - 1}</span></span>
          </div>
        </div>
        <button onClick={initGame} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Difficulty Selector */}
      <div className="flex justify-center gap-2">
        {[3, 4, 5, 6, 7].map(n => (
          <button
            key={n}
            onClick={() => setNumDisks(n)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              numDisks === n 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {n} Disks
          </button>
        ))}
      </div>

      {/* Game Board */}
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="flex justify-between items-end h-64 sm:h-80 relative z-10">
          {pegs.map((peg, pegIndex) => (
            <div 
              key={pegIndex}
              onClick={() => handlePegClick(pegIndex)}
              className={`flex-1 flex flex-col items-center justify-end relative cursor-pointer group h-full ${
                selectedPeg === pegIndex ? 'bg-indigo-500/5 rounded-t-3xl' : 'hover:bg-slate-800/50 rounded-t-3xl transition-colors'
              }`}
            >
              {/* The Peg Pole */}
              <div className={`absolute bottom-0 w-3 sm:w-4 h-[80%] rounded-t-full transition-colors ${
                selectedPeg === pegIndex ? 'bg-indigo-400' : 'bg-slate-700 group-hover:bg-slate-600'
              }`} />
              
              {/* The Disks */}
              <div className="w-full flex flex-col items-center justify-end pb-0 z-10">
                {peg.map((diskSize, diskIndex) => {
                  const isTop = diskIndex === peg.length - 1;
                  const isSelected = selectedPeg === pegIndex && isTop;
                  
                  return (
                    <motion.div
                      key={diskSize}
                      layoutId={`disk-${diskSize}`}
                      initial={false}
                      animate={{ 
                        y: isSelected ? -30 : 0,
                        scale: isSelected ? 1.05 : 1
                      }}
                      className={`h-6 sm:h-8 rounded-full border-2 border-black/20 shadow-md flex items-center justify-center text-xs font-bold text-white/80 ${getDiskColor(diskSize)}`}
                      style={{ width: getDiskWidth(diskSize), marginTop: '2px' }}
                    >
                      {diskSize}
                    </motion.div>
                  );
                })}
              </div>
              
              {/* The Base */}
              <div className="w-[90%] h-4 bg-slate-700 rounded-full mt-1 z-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Win Overlay */}
      {won && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center space-y-4 max-w-sm mx-auto"
        >
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-2xl font-bold text-white">Puzzle Solved!</h3>
          <p className="text-slate-300">
            You completed the {numDisks}-disk tower in <span className="font-bold text-white">{moves}</span> moves.
          </p>
          {moves === Math.pow(2, numDisks) - 1 && (
            <p className="text-emerald-400 font-medium text-sm">Perfect score! Minimum moves used.</p>
          )}
          <button
            onClick={initGame}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors mt-4"
          >
            Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
