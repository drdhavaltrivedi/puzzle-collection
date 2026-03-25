import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, Trophy, HelpCircle } from 'lucide-react';

// A simple Sudoku generator and solver
const BLANK = 0;

function isValid(board: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
}

function solveSudoku(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === BLANK) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = BLANK;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateSudoku(difficulty: 'easy' | 'medium' | 'hard'): { puzzle: number[][], solution: number[][] } {
  // 1. Create an empty board
  const board = Array.from({ length: 9 }, () => Array(9).fill(BLANK));
  
  // 2. Fill diagonal 3x3 boxes (they are independent)
  for (let i = 0; i < 9; i = i + 3) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    let idx = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        board[i + r][i + c] = nums[idx++];
      }
    }
  }
  
  // 3. Solve the rest of the board to get a full valid grid
  solveSudoku(board);
  
  // Save solution
  const solution = board.map(row => [...row]);
  
  // 4. Remove numbers based on difficulty
  let cellsToRemove = 40; // Easy
  if (difficulty === 'medium') cellsToRemove = 50;
  if (difficulty === 'hard') cellsToRemove = 60;
  
  const puzzle = board.map(row => [...row]);
  let removed = 0;
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== BLANK) {
      puzzle[row][col] = BLANK;
      removed++;
    }
  }
  
  return { puzzle, solution };
}

interface SudokuProps {
  onBack: () => void;
}

export default function Sudoku({ onBack }: SudokuProps) {
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [won, setWon] = useState(false);
  const [errors, setErrors] = useState<boolean[][]>(Array(9).fill(Array(9).fill(false)));

  const initGame = useCallback(() => {
    const { puzzle, solution: sol } = generateSudoku(difficulty);
    setBoard(puzzle);
    setInitialBoard(puzzle.map(row => [...row]));
    setSolution(sol);
    setSelectedCell(null);
    setWon(false);
    setErrors(Array.from({ length: 9 }, () => Array(9).fill(false)));
  }, [difficulty]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCellClick = (row: number, col: number) => {
    if (won) return;
    setSelectedCell([row, col]);
  };

  const handleNumberInput = useCallback((num: number) => {
    if (won || !selectedCell) return;
    const [row, col] = selectedCell;
    
    // Can't modify initial given numbers
    if (initialBoard[row][col] !== BLANK) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);

    // Check for errors
    const newErrors = errors.map(r => [...r]);
    if (num !== BLANK && num !== solution[row][col]) {
      newErrors[row][col] = true;
    } else {
      newErrors[row][col] = false;
    }
    setErrors(newErrors);

    // Check win condition
    let isComplete = true;
    let hasErrors = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (newBoard[r][c] === BLANK) isComplete = false;
        if (newBoard[r][c] !== BLANK && newBoard[r][c] !== solution[r][c]) hasErrors = true;
      }
    }

    if (isComplete && !hasErrors) {
      setWon(true);
      setSelectedCell(null);
    }
  }, [board, initialBoard, selectedCell, solution, won, errors]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleNumberInput(BLANK);
      } else if (selectedCell) {
        const [row, col] = selectedCell;
        if (e.key === 'ArrowUp' && row > 0) setSelectedCell([row - 1, col]);
        if (e.key === 'ArrowDown' && row < 8) setSelectedCell([row + 1, col]);
        if (e.key === 'ArrowLeft' && col > 0) setSelectedCell([row, col - 1]);
        if (e.key === 'ArrowRight' && col < 8) setSelectedCell([row, col + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumberInput, selectedCell]);

  const getCellClass = (row: number, col: number) => {
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
    const isInitial = initialBoard[row]?.[col] !== BLANK;
    const isError = errors[row]?.[col];
    const val = board[row]?.[col];
    
    // Highlight same numbers
    const isSameNumber = !isSelected && val !== BLANK && selectedCell && board[selectedCell[0]][selectedCell[1]] === val;
    
    // Highlight related cells (same row, col, or 3x3 box)
    const isRelated = !isSelected && selectedCell && (
      selectedCell[0] === row || 
      selectedCell[1] === col || 
      (Math.floor(selectedCell[0] / 3) === Math.floor(row / 3) && Math.floor(selectedCell[1] / 3) === Math.floor(col / 3))
    );

    let classes = "w-full aspect-square flex items-center justify-center text-lg sm:text-xl font-medium cursor-pointer transition-colors select-none ";
    
    // Borders for 3x3 grid
    classes += "border-slate-700 ";
    if (col % 3 === 2 && col !== 8) classes += "border-r-2 border-r-slate-500 ";
    else classes += "border-r ";
    if (row % 3 === 2 && row !== 8) classes += "border-b-2 border-b-slate-500 ";
    else classes += "border-b ";
    if (col === 0) classes += "border-l ";
    if (row === 0) classes += "border-t ";

    // Background & Text colors
    if (isSelected) {
      classes += "bg-indigo-500/40 text-white ";
    } else if (isError) {
      classes += "bg-red-500/20 text-red-400 ";
    } else if (isSameNumber) {
      classes += "bg-indigo-500/20 text-indigo-200 ";
    } else if (isRelated) {
      classes += "bg-slate-800 text-slate-300 ";
    } else {
      classes += "bg-slate-900 hover:bg-slate-800 ";
      if (isInitial) classes += "text-slate-200 ";
      else classes += "text-indigo-300 ";
    }

    return classes;
  };

  const getHint = () => {
    if (!selectedCell || won) return;
    const [row, col] = selectedCell;
    if (initialBoard[row][col] !== BLANK) return;
    handleNumberInput(solution[row][col]);
  };

  return (
    <div className="max-w-lg w-full mx-auto space-y-6 animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-200">Sudoku</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            {(['easy', 'medium', 'hard'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`text-xs px-2 py-1 rounded capitalize ${
                  difficulty === diff 
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={initGame}
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Game Board */}
      <div className="relative bg-slate-900 p-2 sm:p-4 rounded-2xl border border-slate-800">
        <div className="grid grid-cols-9 bg-slate-800 border-2 border-slate-500">
          {board.map((row, rIndex) => (
            row.map((cell, cIndex) => (
              <div
                key={`${rIndex}-${cIndex}`}
                className={getCellClass(rIndex, cIndex)}
                onClick={() => handleCellClick(rIndex, cIndex)}
              >
                {cell !== BLANK ? cell : ''}
              </div>
            ))
          ))}
        </div>

        {/* Win Overlay */}
        {won && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10"
          >
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center space-y-4 max-w-xs w-full">
              <Trophy className="w-16 h-16 text-amber-400 mx-auto" />
              <h3 className="text-2xl font-bold text-white">Puzzle Solved!</h3>
              <p className="text-slate-400">Great job completing the {difficulty} puzzle.</p>
              <button
                onClick={initGame}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="py-3 sm:py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xl transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleNumberInput(BLANK)}
            className="py-3 sm:py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl font-bold text-sm transition-colors flex items-center justify-center"
            title="Erase"
          >
            ⌫
          </button>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={getHint}
            disabled={!selectedCell || won}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-indigo-300 rounded-xl font-medium transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            Get Hint
          </button>
        </div>
      </div>
    </div>
  );
}
