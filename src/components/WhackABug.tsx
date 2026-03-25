import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Bug, Sparkles, Coffee, AlertCircle } from 'lucide-react';

interface WhackABugProps {
  onBack: () => void;
}

type EntityType = 'bug' | 'feature' | 'coffee' | null;

interface Hole {
  id: number;
  entity: EntityType;
  active: boolean;
}

const COMMENTS = [
  "Production is on fire! Do something!",
  "Have you tried turning it off and on again?",
  "It compiles, ship it!",
  "That's not a bug, it's an undocumented feature.",
  "Who wrote this spaghetti code?",
];

export default function WhackABug({ onBack }: WhackABugProps) {
  const [holes, setHoles] = useState<Hole[]>(Array.from({ length: 9 }, (_, i) => ({ id: i, entity: null, active: false })));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("Squash the bugs! Don't whack the features!");
  const [funnyComment, setFunnyComment] = useState(COMMENTS[0]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setGameOver(false);
    setMessage("Go! Go! Go!");
    setHoles(Array.from({ length: 9 }, (_, i) => ({ id: i, entity: null, active: false })));
  };

  const spawnEntity = useCallback(() => {
    if (!isPlaying) return;

    setHoles(prev => {
      const emptyHoles = prev.filter(h => !h.active);
      if (emptyHoles.length === 0) return prev;

      const randomHole = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
      const rand = Math.random();
      
      let entity: EntityType = 'bug';
      if (rand > 0.85) entity = 'coffee';
      else if (rand > 0.65) entity = 'feature';

      const newHoles = [...prev];
      newHoles[randomHole.id] = { ...randomHole, entity, active: true };
      return newHoles;
    });
  }, [isPlaying]);

  const despawnEntity = useCallback(() => {
    if (!isPlaying) return;
    
    setHoles(prev => {
      const activeHoles = prev.filter(h => h.active);
      if (activeHoles.length === 0) return prev;

      // Randomly despawn an active hole
      const randomHole = activeHoles[Math.floor(Math.random() * activeHoles.length)];
      const newHoles = [...prev];
      newHoles[randomHole.id] = { ...randomHole, entity: null, active: false };
      return newHoles;
    });
  }, [isPlaying]);

  useEffect(() => {
    let spawnInterval: NodeJS.Timeout;
    let despawnInterval: NodeJS.Timeout;
    let timerInterval: NodeJS.Timeout;
    let commentInterval: NodeJS.Timeout;

    if (isPlaying) {
      spawnInterval = setInterval(spawnEntity, 600);
      despawnInterval = setInterval(despawnEntity, 800);
      
      timerInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      commentInterval = setInterval(() => {
        setFunnyComment(COMMENTS[Math.floor(Math.random() * COMMENTS.length)]);
      }, 5000);
    }

    return () => {
      clearInterval(spawnInterval);
      clearInterval(despawnInterval);
      clearInterval(timerInterval);
      clearInterval(commentInterval);
    };
  }, [isPlaying, spawnEntity, despawnEntity]);

  const handleWhack = (id: number, entity: EntityType) => {
    if (!isPlaying || !entity) return;

    setHoles(prev => {
      const newHoles = [...prev];
      newHoles[id] = { ...newHoles[id], entity: null, active: false };
      return newHoles;
    });

    if (entity === 'bug') {
      setScore(s => s + 10);
      setMessage("Squashed! +10");
    } else if (entity === 'feature') {
      setScore(s => s - 15);
      setMessage("Hey! That was a feature! -15");
    } else if (entity === 'coffee') {
      setScore(s => s + 20);
      setTimeLeft(t => t + 2);
      setMessage("Caffeine! +20 pts, +2 sec");
    }
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-1">Whack-a-Bug</h2>
          <p className="text-emerald-400 text-sm font-mono">{funnyComment}</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-mono font-bold text-emerald-400">
            Score: {score}
          </div>
          <div className={`text-2xl font-mono font-bold ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-sky-400'}`}>
            Time: {timeLeft}s
          </div>
        </div>

        <div className="h-8 mb-4 text-center text-slate-300 font-medium flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={message}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {message}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {holes.map((hole) => (
            <div 
              key={hole.id} 
              className="aspect-square bg-slate-950 rounded-2xl border-4 border-slate-800 overflow-hidden relative flex items-end justify-center pb-2 cursor-pointer"
              onClick={() => handleWhack(hole.id, hole.entity)}
            >
              {/* The "hole" shadow */}
              <div className="absolute bottom-2 w-3/4 h-4 bg-black/50 rounded-[100%] blur-[2px]" />
              
              <AnimatePresence>
                {hole.active && hole.entity && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative z-10"
                  >
                    {hole.entity === 'bug' && (
                      <div className="bg-rose-500 p-4 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                        <Bug className="w-10 h-10 text-white" />
                      </div>
                    )}
                    {hole.entity === 'feature' && (
                      <div className="bg-amber-500 p-4 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                    )}
                    {hole.entity === 'coffee' && (
                      <div className="bg-sky-500 p-4 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)]">
                        <Coffee className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {(!isPlaying || gameOver) && (
          <div className="text-center">
            {gameOver && (
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Sprint Over!</h3>
                <p className="text-slate-400">
                  You squashed enough bugs to score <span className="text-emerald-400 font-bold">{score}</span> points.
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  {score < 0 ? "You fired yourself." : 
                   score < 100 ? "The client is still complaining." : 
                   score < 200 ? "Not bad, junior dev." : 
                   "Promoted to Senior Bug Squasher!"}
                </p>
              </div>
            )}
            <button
              onClick={startGame}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
            >
              {gameOver ? 'Play Again' : 'Start Debugging'}
            </button>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-rose-500" /> Bug (+10)
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Feature (-15)
          </div>
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-sky-500" /> Coffee (+20, +2s)
          </div>
        </div>
      </div>
    </div>
  );
}
