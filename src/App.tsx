import { useState } from 'react';
import FifteenPuzzle from './components/FifteenPuzzle';
import MemoryMatch from './components/MemoryMatch';
import LightsOut from './components/LightsOut';
import Game2048 from './components/Game2048';
import Minesweeper from './components/Minesweeper';
import WordGuess from './components/WordGuess';
import Sudoku from './components/Sudoku';
import Mastermind from './components/Mastermind';
import TowerOfHanoi from './components/TowerOfHanoi';
import Nonogram from './components/Nonogram';
import WhackABug from './components/WhackABug';
import SassySimon from './components/SassySimon';
import { Gamepad2, LayoutGrid, Brain, Lightbulb, Grid2X2, Bomb, Type, Hash, KeyRound, Layers, Grid3X3, Bug, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';

type GameType = 'menu' | '15-puzzle' | 'memory' | 'lights-out' | '2048' | 'minesweeper' | 'word-guess' | 'sudoku' | 'mastermind' | 'hanoi' | 'nonogram' | 'whack-a-bug' | 'sassy-simon';

export default function App() {
  const [activeGame, setActiveGame] = useState<GameType>('menu');

  const renderGame = () => {
    switch (activeGame) {
      case '15-puzzle':
        return <FifteenPuzzle onBack={() => setActiveGame('menu')} />;
      case 'memory':
        return <MemoryMatch onBack={() => setActiveGame('menu')} />;
      case 'lights-out':
        return <LightsOut onBack={() => setActiveGame('menu')} />;
      case '2048':
        return <Game2048 onBack={() => setActiveGame('menu')} />;
      case 'minesweeper':
        return <Minesweeper onBack={() => setActiveGame('menu')} />;
      case 'word-guess':
        return <WordGuess onBack={() => setActiveGame('menu')} />;
      case 'sudoku':
        return <Sudoku onBack={() => setActiveGame('menu')} />;
      case 'mastermind':
        return <Mastermind onBack={() => setActiveGame('menu')} />;
      case 'hanoi':
        return <TowerOfHanoi onBack={() => setActiveGame('menu')} />;
      case 'nonogram':
        return <Nonogram onBack={() => setActiveGame('menu')} />;
      case 'whack-a-bug':
        return <WhackABug onBack={() => setActiveGame('menu')} />;
      case 'sassy-simon':
        return <SassySimon onBack={() => setActiveGame('menu')} />;
      default:
        return (
          <div className="max-w-5xl w-full space-y-12 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-full mb-4">
                <Gamepad2 className="w-12 h-12 text-indigo-400" />
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Puzzle Collection
              </h1>
              <p className="text-slate-400 text-lg max-w-md mx-auto">
                Choose a game to challenge your mind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 15 Puzzle Card */}
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGame('15-puzzle')}
                className="flex flex-col items-center p-8 bg-slate-900 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-colors group text-left w-full"
              >
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
                  <LayoutGrid className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2 w-full text-center">15 Puzzle</h3>
                <p className="text-slate-400 text-sm text-center">Slide tiles to put them in numerical order.</p>
              </motion.button>

              {/* Memory Match Card */}
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGame('memory')}
                className="flex flex-col items-center p-8 bg-slate-900 rounded-3xl border border-slate-800 hover:border-rose-500/50 transition-colors group text-left w-full"
              >
                <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-500/20 transition-colors">
                  <Brain className="w-8 h-8 text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2 w-full text-center">Memory Match</h3>
                <p className="text-slate-400 text-sm text-center">Find all the matching pairs of cards.</p>
              </motion.button>

              {/* Lights Out Card */}
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGame('lights-out')}
                className="flex flex-col items-center p-8 bg-slate-900 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-colors group text-left w-full"
              >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                  <Lightbulb className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2 w-full text-center">Lights Out</h3>
                <p className="text-slate-400 text-sm text-center">Turn off all the lights on the grid.</p>
              </motion.button>

              {/* 2048 Card */}
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGame('2048')}
                className="flex flex-col items-center p-8 bg-slate-900 rounded-3xl border border-slate-800 hover:border-amber-500/50 transition-colors group text-left w-full"
              >
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                  <Grid2X2 className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2 w-full text-center">2048</h3>
                <p className="text-slate-400 text-sm text-center">Slide and merge tiles to reach 2048.</p>
              </motion.button>

              {/* Minesweeper Card */}
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGame('minesweeper')}
                className="flex flex-col items-center p-8 bg-slate-900 rounded-3xl border border-slate-800 hover:border-red-500/50 transition-colors group text-left w-full"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
                  <Bomb className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2 w-full text-center">Minesweeper</h3>
                <p className="text-slate-400 text-sm text-center">Clear the board without hitting mines.</p>
              </motion.button>

              {/* Word Guess Card */}
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGame('word-guess')}
                className="flex flex-col items-center p-8 bg-slate-900 rounded-3xl border border-slate-800 hover:border-cyan-500/50 transition-colors group text-left w-full"
              >
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
                  <Type className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2 w-full text-center">Word Guess</h3>
                <p className="text-slate-400 text-sm text-center">Guess the hidden 5-letter word.</p>
              </motion.button>

              {/* Sudoku Card */}
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGame('sudoku')}
                className="flex flex-col items-center p-8 bg-slate-900 rounded-3xl border border-slate-800 hover:border-fuchsia-500/50 transition-colors group text-left w-full"
              >
                <div className="w-16 h-16 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-fuchsia-500/20 transition-colors">
                  <Hash className="w-8 h-8 text-fuchsia-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2 w-full text-center">Sudoku</h3>
                <p className="text-slate-400 text-sm text-center">Fill the 9x9 grid with numbers 1-9.</p>
              </motion.button>

              {/* Mastermind Card */}
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGame('mastermind')}
                className="flex flex-col items-center p-8 bg-slate-900 rounded-3xl border border-slate-800 hover:border-violet-500/50 transition-colors group text-left w-full"
              >
                <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-violet-500/20 transition-colors">
                  <KeyRound className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2 w-full text-center">Code Breaker</h3>
                <p className="text-slate-400 text-sm text-center">Deduce the secret 4-color combination.</p>
              </motion.button>

              {/* Tower of Hanoi Card */}
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGame('hanoi')}
                className="flex flex-col items-center p-8 bg-slate-900 rounded-3xl border border-slate-800 hover:border-sky-500/50 transition-colors group text-left w-full"
              >
                <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-500/20 transition-colors">
                  <Layers className="w-8 h-8 text-sky-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2 w-full text-center">Tower of Hanoi</h3>
                <p className="text-slate-400 text-sm text-center">Move the entire stack to the last peg.</p>
              </motion.button>

              {/* Nonogram Card */}
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGame('nonogram')}
                className="flex flex-col items-center p-8 bg-slate-900 rounded-3xl border border-slate-800 hover:border-teal-500/50 transition-colors group text-left w-full"
              >
                <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-500/20 transition-colors">
                  <Grid3X3 className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2 w-full text-center">Nonogram</h3>
                <p className="text-slate-400 text-sm text-center">Use number clues to fill the grid.</p>
              </motion.button>

              {/* Whack-a-Bug Card */}
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGame('whack-a-bug')}
                className="flex flex-col items-center p-8 bg-slate-900 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-colors group text-left w-full"
              >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                  <Bug className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2 w-full text-center">Whack-a-Bug</h3>
                <p className="text-slate-400 text-sm text-center">Squash bugs, but don't hit the features!</p>
              </motion.button>

              {/* Sassy Simon Card */}
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGame('sassy-simon')}
                className="flex flex-col items-center p-8 bg-slate-900 rounded-3xl border border-slate-800 hover:border-fuchsia-500/50 transition-colors group text-left w-full"
              >
                <div className="w-16 h-16 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-fuchsia-500/20 transition-colors">
                  <BrainCircuit className="w-8 h-8 text-fuchsia-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2 w-full text-center">Sassy Simon</h3>
                <p className="text-slate-400 text-sm text-center">A memory game that judges your mistakes.</p>
              </motion.button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-indigo-500/30">
      {renderGame()}
    </div>
  );
}
