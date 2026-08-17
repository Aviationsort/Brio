/**
 * FlagQuizGame Component: Multiple Choice Country Flag Quiz
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flag, Sparkles, Check, X } from 'lucide-react';

interface Question {
  id: string;
  flag: string;
  correctAnswer: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  { id: 'q1', flag: '🇱🇧', correctAnswer: 'Lebanon', options: ['Lebanon', 'Cyprus', 'Syria', 'Jordan'] },
  { id: 'q2', flag: '🇨🇾', correctAnswer: 'Cyprus', options: ['Greece', 'Cyprus', 'Malta', 'Italy'] },
  { id: 'q3', flag: '🇯🇵', correctAnswer: 'Japan', options: ['South Korea', 'Japan', 'China', 'Singapore'] },
  { id: 'q4', flag: '🇨🇦', correctAnswer: 'Canada', options: ['United States', 'Canada', 'United Kingdom', 'Australia'] },
  { id: 'q5', flag: '🇫🇷', correctAnswer: 'France', options: ['Italy', 'Netherlands', 'France', 'Belgium'] },
  { id: 'q6', flag: '🇦🇲', correctAnswer: 'Armenia', options: ['Armenia', 'Georgia', 'Greece', 'Romania'] },
];

export const FlagQuizGame: React.FC = () => {
  const { showToast } = useApp();
  const [currIdx, setCurrIdx] = useState(0);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  const currentQ = QUESTIONS[currIdx];

  const handleAnswer = (option: string) => {
    setSelectedOpt(option);
    if (option === currentQ.correctAnswer) {
      const newScore = score + 10;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      showToast('Correct!', `Streak ${newStreak}🔥 +10 Points!`, 'success');
    } else {
      setStreak(0);
      showToast('Incorrect', `Correct answer was ${currentQ.correctAnswer}`, 'error');
    }

    setTimeout(() => {
      setSelectedOpt(null);
      setCurrIdx((prev) => (prev + 1) % QUESTIONS.length);
    }, 1200);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-6 text-center">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Flag className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Country Flag Quiz</h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-amber-400 font-bold">Streak: {streak}🔥</span>
          <span className="text-cyan-400 font-bold">Score: {score}</span>
        </div>
      </div>

      {/* Flag Display */}
      <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-inner">
        <span className="text-7xl leading-none">{currentQ.flag}</span>
        <p className="text-xs text-slate-400 font-mono mt-4">Which country does this flag belong to?</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {currentQ.options.map((opt) => {
          let btnClass = 'bg-slate-950 border-slate-800 hover:border-cyan-500/50 text-slate-200';
          if (selectedOpt) {
            if (opt === currentQ.correctAnswer) {
              btnClass = 'bg-emerald-600 border-emerald-500 text-white font-bold';
            } else if (opt === selectedOpt) {
              btnClass = 'bg-rose-600 border-rose-500 text-white font-bold';
            }
          }

          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={selectedOpt !== null}
              className={`liquid-glass-btn p-3.5 rounded-2xl border text-xs font-bold shadow-md transition-all ${btnClass}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
