import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BrainCircuit, Frown, Meh, Smile, Zap } from 'lucide-react';

interface SassySimonProps {
  onBack: () => void;
}

const COLORS = [
  { id: 0, color: 'bg-rose-500', active: 'bg-rose-300', shadow: 'shadow-rose-500/50' },
  { id: 1, color: 'bg-emerald-500', active: 'bg-emerald-300', shadow: 'shadow-emerald-500/50' },
  { id: 2, color: 'bg-sky-500', active: 'bg-sky-300', shadow: 'shadow-sky-500/50' },
  { id: 3, color: 'bg-amber-500', active: 'bg-amber-300', shadow: 'shadow-amber-500/50' },
];

const SASSY_COMMENTS = {
  start: [
    "Oh, you think you have a good memory? Cute.",
    "Let's see how fast you mess this up.",
    "I'll type slowly so you can keep up.",
    "Prepare to be humbled by a few blinking lights."
  ],
  success: [
    "Wow, you pressed a button. Do you want a medal?",
    "Lucky guess.",
    "My grandmother could do this faster.",
    "Okay, not terrible. Don't let it go to your head.",
    "Are you writing these down?"
  ],
  fail: [
    { threshold: 0, msg: "Did you even try? Or did your cat walk on the keyboard?" },
    { threshold: 3, msg: "A goldfish has a 3-second memory. You have less." },
    { threshold: 6, msg: "Average. Just like your code." },
    { threshold: 10, msg: "Okay, you're not completely useless. Just mostly." },
    { threshold: 15, msg: "Nerd alert. Go touch some grass." },
  ]
};

export default function SassySimon({ onBack }: SassySimonProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [sassyMessage, setSassyMessage] = useState(SASSY_COMMENTS.start[0]);
  const [score, setScore] = useState(0);

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  useEffect(() => {
    return clearTimeouts;
  }, []);

  const startGame = () => {
    clearTimeouts();
    setSequence([]);
    setPlayerStep(0);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setSassyMessage(SASSY_COMMENTS.start[Math.floor(Math.random() * SASSY_COMMENTS.start.length)]);
    
    // Start first round after a short delay
    const t = setTimeout(() => {
      nextRound([]);
    }, 1000);
    timeoutRefs.current.push(t);
  };

  const nextRound = (currentSeq: number[]) => {
    const nextColor = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextColor];
    setSequence(newSeq);
    setPlayerStep(0);
    playSequence(newSeq);
  };

  const playSequence = (seq: number[]) => {
    setIsShowingSequence(true);
    
    seq.forEach((colorIdx, i) => {
      const t1 = setTimeout(() => {
        setActiveColor(colorIdx);
      }, (i * 800) + 400);
      
      const t2 = setTimeout(() => {
        setActiveColor(null);
      }, (i * 800) + 800);
      
      timeoutRefs.current.push(t1, t2);
    });

    const t3 = setTimeout(() => {
      setIsShowingSequence(false);
      if (seq.length > 1) {
        setSassyMessage(SASSY_COMMENTS.success[Math.floor(Math.random() * SASSY_COMMENTS.success.length)]);
      }
    }, (seq.length * 800) + 400);
    
    timeoutRefs.current.push(t3);
  };

  const handleColorClick = (colorIdx: number) => {
    if (!isPlaying || isShowingSequence || gameOver) return;

    // Flash the clicked color
    setActiveColor(colorIdx);
    setTimeout(() => setActiveColor(null), 200);

    if (colorIdx === sequence[playerStep]) {
      // Correct click
      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);

      if (nextStep === sequence.length) {
        // Completed the sequence
        setScore(sequence.length);
        setIsShowingSequence(true); // Prevent clicks while waiting
        const t = setTimeout(() => {
          nextRound(sequence);
        }, 1000);
        timeoutRefs.current.push(t);
      }
    } else {
      // Wrong click
      handleGameOver();
    }
  };

  const handleGameOver = () => {
    setIsPlaying(false);
    setGameOver(true);
    
    // Find appropriate sassy message
    const failMsg = SASSY_COMMENTS.fail.slice().reverse().find(f => score >= f.threshold)?.msg || "You failed.";
    setSassyMessage(failMsg);
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
          <h2 className="text-3xl font-bold text-white mb-1">Sassy Simon</h2>
          <p className="text-fuchsia-400 text-sm font-mono">He judges your memory.</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full shadow-2xl flex flex-col items-center">
        
        {/* Sassy AI Avatar / Message Box */}
        <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-fuchsia-500" />
          <div className="flex items-start gap-4">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <BrainCircuit className={`w-8 h-8 ${gameOver ? 'text-rose-500' : isShowingSequence ? 'text-sky-400 animate-pulse' : 'text-fuchsia-400'}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-mono mb-1">SASSY_SIMON.EXE</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={sassyMessage}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-slate-200 font-medium"
                >
                  "{sassyMessage}"
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="text-xl font-mono font-bold text-slate-400 mb-8">
          Score: <span className="text-white">{score}</span>
        </div>

        {/* Simon Pad */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8 p-4 sm:p-8 bg-slate-950 rounded-full border-8 border-slate-800 relative">
          {/* Center piece */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24 bg-slate-900 rounded-full border-8 border-slate-800 z-10 flex items-center justify-center">
            {gameOver ? <Frown className="w-8 h-8 text-rose-500" /> : 
             isShowingSequence ? <Zap className="w-8 h-8 text-amber-500" /> : 
             <Meh className="w-8 h-8 text-slate-500" />}
          </div>

          {COLORS.map((colorObj, idx) => {
            const isActive = activeColor === colorObj.id;
            // Determine border radius based on position (top-left, top-right, bottom-left, bottom-right)
            const roundedClass = 
              idx === 0 ? 'rounded-tl-full rounded-tr-3xl rounded-bl-3xl rounded-br-xl' :
              idx === 1 ? 'rounded-tr-full rounded-tl-3xl rounded-br-3xl rounded-bl-xl' :
              idx === 2 ? 'rounded-bl-full rounded-br-3xl rounded-tl-3xl rounded-tr-xl' :
              'rounded-br-full rounded-bl-3xl rounded-tr-3xl rounded-tl-xl';

            return (
              <button
                key={colorObj.id}
                onClick={() => handleColorClick(colorObj.id)}
                disabled={!isPlaying || isShowingSequence || gameOver}
                className={`
                  w-24 h-24 sm:w-32 sm:h-32 transition-all duration-150
                  ${roundedClass}
                  ${isActive ? `${colorObj.active} ${colorObj.shadow} shadow-[0_0_30px_rgba(0,0,0,0.5)] scale-95` : `${colorObj.color} opacity-80 hover:opacity-100`}
                  ${(!isPlaying || isShowingSequence) ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02] active:scale-95'}
                `}
              />
            );
          })}
        </div>

        {(!isPlaying || gameOver) && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={startGame}
            className="px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-fuchsia-500/20"
          >
            {gameOver ? 'Try Again (If You Dare)' : 'Start Being Judged'}
          </motion.button>
        )}
      </div>
    </div>
  );
}
