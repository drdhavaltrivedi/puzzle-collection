import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, Trophy, HelpCircle } from 'lucide-react';

const COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-400',
  'bg-purple-500',
  'bg-orange-500'
];

const CODE_LENGTH = 4;
const MAX_GUESSES = 10;

interface GuessRecord {
  code: string[];
  exact: number;
  partial: number;
}

interface MastermindProps {
  onBack: () => void;
}

export default function Mastermind({ onBack }: MastermindProps) {
  const [secretCode, setSecretCode] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<GuessRecord[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initGame = useCallback(() => {
    const newCode = Array.from({ length: CODE_LENGTH }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
    setSecretCode(newCode);
    setGuesses([]);
    setCurrentGuess([]);
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleColorClick = (color: string) => {
    if (gameOver || currentGuess.length >= CODE_LENGTH) return;
    setCurrentGuess([...currentGuess, color]);
  };

  const handleRemoveColor = () => {
    if (gameOver || currentGuess.length === 0) return;
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const handleSubmit = () => {
    if (currentGuess.length !== CODE_LENGTH || gameOver) return;

    let exact = 0;
    let partial = 0;
    const secretCopy = [...secretCode];
    const guessCopy = [...currentGuess];

    // Check exact matches (correct color and position)
    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        exact++;
        secretCopy[i] = 'MATCHED';
        guessCopy[i] = 'CHECKED';
      }
    }

    // Check partial matches (correct color, wrong position)
    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessCopy[i] !== 'CHECKED') {
        const matchIndex = secretCopy.indexOf(guessCopy[i]);
        if (matchIndex !== -1) {
          partial++;
          secretCopy[matchIndex] = 'MATCHED';
        }
      }
    }

    const newGuesses = [...guesses, { code: currentGuess, exact, partial }];
    setGuesses(newGuesses);
    setCurrentGuess([]);

    if (exact === CODE_LENGTH) {
      setWon(true);
      setGameOver(true);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6 animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-200">Code Breaker</h2>
          <p className="text-xs text-slate-500">Crack the 4-color code</p>
        </div>
        <button onClick={initGame} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Game Board */}
      <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        
        {/* Guesses History */}
        <div className="space-y-2">
          {Array.from({ length: MAX_GUESSES }).map((_, i) => {
            const guess = guesses[i];
            const isCurrent = i === guesses.length && !gameOver;
            
            return (
              <div key={i} className={`flex items-center justify-between p-2 rounded-xl border ${isCurrent ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-800 bg-slate-950/50'}`}>
                <div className="flex gap-2">
                  {Array.from({ length: CODE_LENGTH }).map((_, j) => {
                    let colorClass = 'bg-slate-800';
                    if (guess) colorClass = guess.code[j];
                    else if (isCurrent && currentGuess[j]) colorClass = currentGuess[j];
                    
                    return (
                      <div key={j} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-inner border-2 border-black/20 ${colorClass} transition-all duration-200`} />
                    );
                  })}
                </div>
                
                {/* Feedback Pegs */}
                <div className="grid grid-cols-2 gap-1 w-8 h-8 sm:w-10 sm:h-10">
                  {guess ? (
                    <>
                      {Array.from({ length: guess.exact }).map((_, j) => (
                        <div key={`exact-${j}`} className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-500 shadow-sm" title="Exact Match" />
                      ))}
                      {Array.from({ length: guess.partial }).map((_, j) => (
                        <div key={`partial-${j}`} className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white shadow-sm" title="Color Match" />
                      ))}
                      {Array.from({ length: CODE_LENGTH - guess.exact - guess.partial }).map((_, j) => (
                        <div key={`empty-${j}`} className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-slate-800 shadow-inner" />
                      ))}
                    </>
                  ) : (
                    Array.from({ length: CODE_LENGTH }).map((_, j) => (
                      <div key={`empty-${j}`} className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-slate-800/50" />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Secret Code Reveal (Game Over) */}
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 rounded-xl border border-amber-500/30 bg-amber-500/10"
          >
            <div className="font-bold text-amber-500">Secret Code:</div>
            <div className="flex gap-2">
              {secretCode.map((color, i) => (
                <div key={i} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-inner border-2 border-black/20 ${color}`} />
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {/* Controls */}
      {!gameOver && (
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-center gap-2 sm:gap-4">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => handleColorClick(color)}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg border-2 border-white/10 hover:scale-110 transition-transform ${color}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRemoveColor}
              disabled={currentGuess.length === 0}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded-xl font-bold transition-colors"
            >
              Undo
            </button>
            <button
              onClick={handleSubmit}
              disabled={currentGuess.length !== CODE_LENGTH}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Game Over State */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center space-y-4"
        >
          <div className="flex justify-center mb-2">
            {won ? <Trophy className="w-12 h-12 text-amber-400" /> : <div className="text-4xl">💥</div>}
          </div>
          <h3 className="text-2xl font-bold text-white">
            {won ? 'Code Cracked!' : 'Out of Guesses'}
          </h3>
          <p className="text-slate-300">
            {won ? `You solved it in ${guesses.length} attempts.` : 'Better luck next time!'}
          </p>
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
