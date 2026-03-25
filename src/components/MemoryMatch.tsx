import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Trophy, Clock, Move, ArrowLeft, Star, Heart, Sun, Moon, Cloud, Zap, Snowflake, Flame } from 'lucide-react';

const ICONS = [Star, Heart, Sun, Moon, Cloud, Zap, Snowflake, Flame];

interface Card {
  id: number;
  iconIdx: number;
}

const generateDeck = (): Card[] => {
  const deck = [...ICONS, ...ICONS].map((_, i) => ({
    id: i,
    iconIdx: i % ICONS.length
  }));
  
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
};

export default function MemoryMatch({ onBack }: { onBack: () => void }) {
  const [deck, setDeck] = useState<Card[]>(generateDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
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

  const handleCardClick = (index: number) => {
    if (!isStarted || isWon || flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (deck[first].iconIdx === deck[second].iconIdx) {
        setMatched(m => {
          const newMatched = [...m, first, second];
          if (newMatched.length === deck.length) {
            setIsWon(true);
            setIsStarted(false);
          }
          return newMatched;
        });
        setFlipped([]);
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  const startGame = () => {
    setDeck(generateDeck());
    setFlipped([]);
    setMatched([]);
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
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
          Memory Match
        </h1>
        <p className="text-slate-400 text-sm">Find all the matching pairs.</p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-slate-300">
          <Clock className="w-5 h-5 text-rose-400" />
          <span className="font-mono text-lg">{formatTime(time)}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <Move className="w-5 h-5 text-orange-400" />
          <span className="font-mono text-lg">{moves} moves</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="grid grid-cols-4 gap-2 aspect-square">
          {deck.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(index);
            const isMatched = matched.includes(index);
            const Icon = ICONS[card.iconIdx];

            return (
              <motion.button
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`
                  relative flex items-center justify-center rounded-xl text-2xl
                  shadow-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500
                  preserve-3d
                `}
                style={{ perspective: '1000px' }}
                whileHover={{ scale: isStarted && !isWon && !isFlipped ? 0.98 : 1 }}
                whileTap={{ scale: isStarted && !isWon && !isFlipped ? 0.95 : 1 }}
              >
                <motion.div
                  className="w-full h-full absolute inset-0 rounded-xl"
                  initial={false}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front (Hidden state) */}
                  <div 
                    className={`absolute inset-0 w-full h-full backface-hidden rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 flex items-center justify-center`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="w-4 h-4 rounded-full bg-slate-700/50" />
                  </div>
                  
                  {/* Back (Revealed state) */}
                  <div 
                    className={`absolute inset-0 w-full h-full backface-hidden rounded-xl border flex items-center justify-center
                      ${isMatched ? 'bg-rose-600/20 border-rose-500/30 text-rose-400' : 'bg-slate-700 border-slate-600 text-white'}
                    `}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        {/* Overlays */}
        {!isStarted && !isWon && (
          <div className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <button
              onClick={startGame}
              className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/25"
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
                Solved in <span className="text-rose-400 font-mono">{formatTime(time)}</span> with <span className="text-orange-400 font-mono">{moves}</span> moves.
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
