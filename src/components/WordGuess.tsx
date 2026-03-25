import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';

const WORDS = [
  'APPLE', 'BRAIN', 'CRANE', 'DANCE', 'EAGLE', 'FLAME', 'GRAPE', 'HEART', 'IMAGE', 'JUICE',
  'KNIFE', 'LEMON', 'MOUSE', 'NIGHT', 'OCEAN', 'PIZZA', 'QUEEN', 'RIVER', 'SNAKE', 'TRAIN',
  'UMBRA', 'VOICE', 'WATER', 'XENON', 'YACHT', 'ZEBRA', 'GHOST', 'PLANT', 'STORM', 'WORLD',
  'LIGHT', 'SOUND', 'SPACE', 'EARTH', 'MAGIC', 'MUSIC', 'POWER', 'SUGAR', 'SMILE', 'LAUGH'
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

interface Guess {
  word: string;
  states: LetterState[];
}

interface WordGuessProps {
  onBack: () => void;
}

export default function WordGuess({ onBack }: WordGuessProps) {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [message, setMessage] = useState('');

  const MAX_GUESSES = 6;
  const WORD_LENGTH = 5;

  const initGame = useCallback(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(randomWord);
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setWon(false);
    setMessage('');
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const onKeyPress = useCallback((key: string) => {
    if (gameOver) return;

    if (key === 'ENTER') {
      if (currentGuess.length !== WORD_LENGTH) {
        showMessage('Not enough letters');
        return;
      }

      // Check guess
      const newStates: LetterState[] = Array(WORD_LENGTH).fill('absent');
      const targetChars = targetWord.split('');
      const guessChars = currentGuess.split('');

      // First pass: correct letters
      for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessChars[i] === targetChars[i]) {
          newStates[i] = 'correct';
          targetChars[i] = '#'; // Mark as used
          guessChars[i] = '*'; // Mark as processed
        }
      }

      // Second pass: present letters
      for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessChars[i] !== '*') {
          const index = targetChars.indexOf(guessChars[i]);
          if (index !== -1) {
            newStates[i] = 'present';
            targetChars[index] = '#'; // Mark as used
          }
        }
      }

      const newGuess: Guess = { word: currentGuess, states: newStates };
      const newGuesses = [...guesses, newGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess === targetWord) {
        setWon(true);
        setGameOver(true);
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameOver(true);
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < WORD_LENGTH && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, gameOver, guesses, targetWord]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        onKeyPress('BACKSPACE');
      } else {
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) {
          onKeyPress(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);

  const getLetterState = (letter: string): LetterState => {
    let state: LetterState = 'empty';
    for (const guess of guesses) {
      for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess.word[i] === letter) {
          if (guess.states[i] === 'correct') return 'correct';
          if (guess.states[i] === 'present' && state !== 'correct') state = 'present';
          if (guess.states[i] === 'absent' && state === 'empty') state = 'absent';
        }
      }
    }
    return state;
  };

  const getKeyClass = (key: string) => {
    if (key === 'ENTER' || key === 'BACKSPACE') {
      return 'px-2 py-3 bg-slate-700 text-slate-200 rounded text-xs font-bold hover:bg-slate-600 transition-colors';
    }
    
    const state = getLetterState(key);
    let bgClass = 'bg-slate-700 hover:bg-slate-600 text-slate-200';
    
    if (state === 'correct') bgClass = 'bg-emerald-500 text-white';
    else if (state === 'present') bgClass = 'bg-amber-500 text-white';
    else if (state === 'absent') bgClass = 'bg-slate-800 text-slate-500';

    return `w-8 sm:w-10 h-12 sm:h-14 ${bgClass} rounded font-bold text-sm sm:text-base transition-colors flex items-center justify-center`;
  };

  const getCellClass = (state: LetterState, isCurrent: boolean, isFilled: boolean) => {
    let baseClass = 'w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-2xl font-bold rounded uppercase transition-all duration-300';
    
    if (isCurrent) {
      if (isFilled) return `${baseClass} border-slate-400 text-slate-100 scale-105`;
      return `${baseClass} border-slate-700 text-slate-100`;
    }

    if (state === 'correct') return `${baseClass} bg-emerald-500 border-emerald-500 text-white`;
    if (state === 'present') return `${baseClass} bg-amber-500 border-amber-500 text-white`;
    if (state === 'absent') return `${baseClass} bg-slate-800 border-slate-800 text-slate-400`;
    
    return `${baseClass} border-slate-800 text-slate-100`;
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6 animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-200">Word Guess</h2>
          <p className="text-xs text-slate-500">Guess the 5-letter word</p>
        </div>
        <button
          onClick={initGame}
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Message Toast */}
      <div className="h-8 flex items-center justify-center">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium"
          >
            {message}
          </motion.div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-rows-6 gap-2 justify-center">
        {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
          const isCurrentRow = rowIndex === guesses.length;
          const guess = guesses[rowIndex];
          const word = isCurrentRow ? currentGuess : guess?.word || '';
          
          return (
            <div key={rowIndex} className="grid grid-cols-5 gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                const letter = word[colIndex] || '';
                const state = guess?.states[colIndex] || 'empty';
                const isFilled = letter !== '';
                
                return (
                  <motion.div
                    key={colIndex}
                    initial={false}
                    animate={
                      isCurrentRow && isFilled ? { scale: [1, 1.1, 1] } : 
                      !isCurrentRow && guess ? { rotateX: [0, 90, 0] } : {}
                    }
                    transition={{ duration: 0.2, delay: !isCurrentRow && guess ? colIndex * 0.1 : 0 }}
                    className={getCellClass(state, isCurrentRow, isFilled)}
                  >
                    {letter}
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Game Over Overlay */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center space-y-4"
        >
          <div className="flex justify-center mb-2">
            {won ? (
              <Trophy className="w-12 h-12 text-amber-400" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl">
                🤔
              </div>
            )}
          </div>
          <h3 className="text-2xl font-bold text-white">
            {won ? 'You Won!' : 'Game Over'}
          </h3>
          <p className="text-slate-300">
            The word was <span className="font-bold text-white uppercase">{targetWord}</span>
          </p>
          <button
            onClick={initGame}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
          >
            Play Again
          </button>
        </motion.div>
      )}

      {/* Keyboard */}
      <div className="space-y-2 pt-4">
        {KEYBOARD_ROWS.map((row, i) => (
          <div key={i} className="flex justify-center gap-1 sm:gap-2">
            {row.map(key => (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={getKeyClass(key)}
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
