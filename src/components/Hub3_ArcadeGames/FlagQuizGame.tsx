/**
 * FlagQuizGame Component: Multiple Choice Country Flag Quiz with Timer, Streaks & Categories
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Flag, Sparkles, Check, X, Timer, Trophy, RotateCcw, BookOpen } from 'lucide-react';

interface Question {
  id: string;
  flag: string;
  correctAnswer: string;
  options: string[];
  category: 'UN Recognized' | 'Non-UN Recognized' | 'Mixed';
  region: string;
}

const QUESTIONS: Question[] = [
  { id: 'q1', flag: '🇱🇧', correctAnswer: 'Lebanon', options: ['Lebanon', 'Cyprus', 'Syria', 'Jordan'], category: 'UN Recognized', region: 'Middle East' },
  { id: 'q2', flag: '🇨🇾', correctAnswer: 'Cyprus', options: ['Greece', 'Cyprus', 'Malta', 'Italy'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q3', flag: '🇯🇵', correctAnswer: 'Japan', options: ['South Korea', 'Japan', 'China', 'Singapore'], category: 'UN Recognized', region: 'Asia' },
  { id: 'q4', flag: '🇨🇦', correctAnswer: 'Canada', options: ['United States', 'Canada', 'United Kingdom', 'Australia'], category: 'UN Recognized', region: 'North America' },
  { id: 'q5', flag: '🇫🇷', correctAnswer: 'France', options: ['Italy', 'Netherlands', 'France', 'Belgium'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q6', flag: '🇦🇲', correctAnswer: 'Armenia', options: ['Armenia', 'Georgia', 'Greece', 'Romania'], category: 'UN Recognized', region: 'Caucasus' },
  { id: 'q7', flag: '🇽🇰', correctAnswer: 'Kosovo', options: ['Albania', 'Kosovo', 'Montenegro', 'Macedonia'], category: 'Non-UN Recognized', region: 'Balkans' },
  { id: 'q8', flag: '🇹🇼', correctAnswer: 'Taiwan', options: ['Japan', 'South Korea', 'Taiwan', 'China'], category: 'Non-UN Recognized', region: 'Asia' },
  { id: 'q9', flag: '🇦🇫', correctAnswer: 'Afghanistan', options: ['Pakistan', 'Afghanistan', 'Iran', 'Iraq'], category: 'UN Recognized', region: 'Central Asia' },
  { id: 'q10', flag: '🇧🇷', correctAnswer: 'Brazil', options: ['Argentina', 'Brazil', 'Colombia', 'Chile'], category: 'UN Recognized', region: 'South America' },
  { id: 'q11', flag: '🇦🇩', correctAnswer: 'Andorra', options: ['Andorra', 'Monaco', 'Liechtenstein', 'San Marino'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q12', flag: '🇹🇷', correctAnswer: 'Turkey', options: ['Turkey', 'Iran', 'Iraq', 'Syria'], category: 'UN Recognized', region: 'Middle East' },
  { id: 'q13', flag: '🇮🇸', correctAnswer: 'Iceland', options: ['Norway', 'Iceland', 'Ireland', 'Finland'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q14', flag: '🇳🇿', correctAnswer: 'New Zealand', options: ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'], category: 'UN Recognized', region: 'Oceania' },
  { id: 'q15', flag: '🇲🇦', correctAnswer: 'Morocco', options: ['Algeria', 'Morocco', 'Tunisia', 'Libya'], category: 'UN Recognized', region: 'North Africa' },
  { id: 'q16', flag: '🇸🇾', correctAnswer: 'Syria', options: ['Lebanon', 'Jordan', 'Syria', 'Iraq'], category: 'UN Recognized', region: 'Middle East' },
  { id: 'q17', flag: '🇰🇵', correctAnswer: 'North Korea', options: ['South Korea', 'North Korea', 'Japan', 'China'], category: 'UN Recognized', region: 'Asia' },
  { id: 'q18', flag: '🇱🇾', correctAnswer: 'Libya', options: ['Egypt', 'Libya', 'Algeria', 'Tunisia'], category: 'UN Recognized', region: 'North Africa' },
  { id: 'q19', flag: '🇲🇳', correctAnswer: 'Mongolia', options: ['Kazakhstan', 'Mongolia', 'China', 'Russia'], category: 'UN Recognized', region: 'Asia' },
  { id: 'q20', flag: '🇳🇴', correctAnswer: 'Norway', options: ['Sweden', 'Norway', 'Denmark', 'Finland'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q21', flag: '🇵🇰', correctAnswer: 'Pakistan', options: ['India', 'Pakistan', 'Bangladesh', 'Afghanistan'], category: 'UN Recognized', region: 'South Asia' },
  { id: 'q22', flag: '🇶🇦', correctAnswer: 'Qatar', options: ['UAE', 'Qatar', 'Saudi Arabia', 'Bahrain'], category: 'UN Recognized', region: 'Middle East' },
  { id: 'q23', flag: '🇸🇦', correctAnswer: 'Saudi Arabia', options: ['UAE', 'Saudi Arabia', 'Qatar', 'Oman'], category: 'UN Recognized', region: 'Middle East' },
  { id: 'q24', flag: '🇺🇦', correctAnswer: 'Ukraine', options: ['Poland', 'Ukraine', 'Belarus', 'Romania'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q25', flag: '🇿🇦', correctAnswer: 'South Africa', options: ['South Africa', 'Zimbabwe', 'Botswana', 'Namibia'], category: 'UN Recognized', region: 'Africa' },
  { id: 'q26', flag: '🇨🇳', correctAnswer: 'China', options: ['China', 'Japan', 'South Korea', 'Vietnam'], category: 'UN Recognized', region: 'Asia' },
  { id: 'q27', flag: '🇮🇳', correctAnswer: 'India', options: ['India', 'Pakistan', 'Bangladesh', 'Nepal'], category: 'UN Recognized', region: 'South Asia' },
  { id: 'q28', flag: '🇩🇪', correctAnswer: 'Germany', options: ['Germany', 'France', 'Austria', 'Poland'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q29', flag: '🇮🇹', correctAnswer: 'Italy', options: ['Italy', 'Spain', 'France', 'Greece'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q30', flag: '🇪🇸', correctAnswer: 'Spain', options: ['Spain', 'Portugal', 'Italy', 'France'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q31', flag: '🇬🇧', correctAnswer: 'United Kingdom', options: ['United Kingdom', 'Ireland', 'Canada', 'Australia'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q32', flag: '🇷🇺', correctAnswer: 'Russia', options: ['Russia', 'China', 'Kazakhstan', 'Ukraine'], category: 'UN Recognized', region: 'Eurasia' },
  { id: 'q33', flag: '🇲🇽', correctAnswer: 'Mexico', options: ['Mexico', 'Guatemala', 'Cuba', 'Colombia'], category: 'UN Recognized', region: 'North America' },
  { id: 'q34', flag: '🇦🇷', correctAnswer: 'Argentina', options: ['Brazil', 'Argentina', 'Chile', 'Uruguay'], category: 'UN Recognized', region: 'South America' },
  { id: 'q35', flag: '🇨🇭', correctAnswer: 'Switzerland', options: ['Switzerland', 'Austria', 'Liechtenstein', 'Luxembourg'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q36', flag: '🇸🇪', correctAnswer: 'Sweden', options: ['Sweden', 'Norway', 'Finland', 'Denmark'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q37', flag: '🇵🇱', correctAnswer: 'Poland', options: ['Poland', 'Czech Republic', 'Germany', 'Ukraine'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q38', flag: '🇳🇱', correctAnswer: 'Netherlands', options: ['Netherlands', 'Belgium', 'Luxembourg', 'Denmark'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q39', flag: '🇧🇪', correctAnswer: 'Belgium', options: ['Belgium', 'Netherlands', 'France', 'Luxembourg'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q40', flag: '🇦🇹', correctAnswer: 'Austria', options: ['Austria', 'Hungary', 'Czech Republic', 'Switzerland'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q41', flag: '🇬🇷', correctAnswer: 'Greece', options: ['Greece', 'Turkey', 'Italy', 'Albania'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q42', flag: '🇵🇹', correctAnswer: 'Portugal', options: ['Portugal', 'Spain', 'Brazil', 'Angola'], category: 'UN Recognized', region: 'Europe' },
  { id: 'q43', flag: '🇮🇱', correctAnswer: 'Israel', options: ['Israel', 'Lebanon', 'Jordan', 'Egypt'], category: 'UN Recognized', region: 'Middle East' },
  { id: 'q44', flag: '🇮🇶', correctAnswer: 'Iraq', options: ['Iraq', 'Iran', 'Syria', 'Saudi Arabia'], category: 'UN Recognized', region: 'Middle East' },
  { id: 'q45', flag: '🇮🇷', correctAnswer: 'Iran', options: ['Iran', 'Iraq', 'Afghanistan', 'Pakistan'], category: 'UN Recognized', region: 'Middle East' },
  { id: 'q46', flag: '🇪🇬', correctAnswer: 'Egypt', options: ['Egypt', 'Libya', 'Sudan', 'Jordan'], category: 'UN Recognized', region: 'North Africa' },
  { id: 'q47', flag: '🇳🇬', correctAnswer: 'Nigeria', options: ['Nigeria', 'Ghana', 'Kenya', 'South Africa'], category: 'UN Recognized', region: 'Africa' },
  { id: 'q48', flag: '🇰🇪', correctAnswer: 'Kenya', options: ['Kenya', 'Tanzania', 'Uganda', 'Ethiopia'], category: 'UN Recognized', region: 'Africa' },
  { id: 'q49', flag: '🇿🇦', correctAnswer: 'South Africa', options: ['South Africa', 'Zimbabwe', 'Namibia', 'Botswana'], category: 'UN Recognized', region: 'Africa' },
  { id: 'q50', flag: '🇦🇺', correctAnswer: 'Australia', options: ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'], category: 'UN Recognized', region: 'Oceania' },
];

type CategoryFilter = 'All' | 'UN Recognized' | 'Non-UN Recognized';
type Difficulty = 'easy' | 'medium' | 'hard';

const TIMER_SECONDS: Record<Difficulty, number> = { easy: 20, medium: 12, hard: 7 };
const QUESTIONS_PER_ROUND: Record<Difficulty, number> = { easy: 10, medium: 15, hard: 20 };

export const FlagQuizGame: React.FC = () => {
  const { showToast } = useApp();
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [gameStarted, setGameStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currIdx, setCurrIdx] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS['medium']);
  const [gameOver, setGameOver] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  const filteredQuestions = useCallback(() => {
    let pool = [...QUESTIONS];
    if (categoryFilter !== 'All') {
      pool = pool.filter((q) => q.category === categoryFilter);
    }
    if (pool.length === 0) pool = [...QUESTIONS];
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, QUESTIONS_PER_ROUND[difficulty]);
  }, [categoryFilter, difficulty]);

  const startGame = useCallback(() => {
    const qs = filteredQuestions();
    setQuestions(qs);
    setCurrIdx(0);
    setStreak(0);
    setBestStreak(0);
    setScore(0);
    setSelectedOpt(null);
    setTimeLeft(TIMER_SECONDS[difficulty]);
    setGameOver(false);
    setGameStarted(true);
    setShowTutorial(false);
  }, [filteredQuestions, difficulty]);

  const currentQ = questions[currIdx];

  useEffect(() => {
    if (!gameStarted || !currentQ || gameOver || selectedOpt !== null) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSelectedOpt('__timeout__');
          setStreak(0);
          showToast('Time Up!', `Correct answer: ${currentQ.correctAnswer}`, 'warning');
          setTimeout(() => {
            if (currIdx + 1 >= questions.length) {
              setGameOver(true);
            } else {
              setCurrIdx((i) => i + 1);
              setSelectedOpt(null);
              setTimeLeft(TIMER_SECONDS[difficulty]);
            }
          }, 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, currentQ, gameOver, selectedOpt, currIdx, questions.length, difficulty, showToast]);

  const handleAnswer = (option: string) => {
    if (selectedOpt !== null || gameOver) return;
    setSelectedOpt(option);
    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft / 2);
      const newScore = score + 10 + timeBonus;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      setBestStreak((prev) => Math.max(prev, newStreak));
      showToast('Correct!', `Streak ${newStreak}🔥 +${10 + timeBonus} Points!`, 'success');
    } else {
      setStreak(0);
      showToast('Incorrect', `Correct answer was ${currentQ.correctAnswer}`, 'error');
    }
    setTimeout(() => {
      if (currIdx + 1 >= questions.length) {
        setGameOver(true);
      } else {
        setCurrIdx((i) => i + 1);
        setSelectedOpt(null);
        setTimeLeft(TIMER_SECONDS[difficulty]);
      }
    }, 1200);
  };

  const getTimerColor = () => {
    if (timeLeft > 8) return 'text-emerald-400';
    if (timeLeft > 4) return 'text-amber-400';
    return 'text-rose-400';
  };

  if (showTutorial || (!gameStarted && !gameOver)) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-6 text-center">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <Flag className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Country Flag Quiz</h3>
          </div>
          <button onClick={() => setShowTutorial(false)} className="text-[11px] text-zinc-400 hover:text-white">Skip</button>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-left">
          <div className="flex items-center gap-2 text-rose-400">
            <BookOpen className="w-4 h-4" />
            <h4 className="text-sm font-bold text-white">How to Play</h4>
          </div>
          <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
            <li>You'll be shown a country flag and 4 possible answers.</li>
            <li>Select the correct country name before time runs out.</li>
            <li>Correct answers earn points + time bonus. Wrong answers reset your streak.</li>
            <li>Longer streaks give higher scores.</li>
            <li>Includes both UN recognized and non-UN recognized states.</li>
            <li>Use difficulty and category filters to customize your quiz.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-2">Difficulty</label>
            <div className="flex gap-2 justify-center">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`skeuo-btn px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${difficulty === d ? 'bg-red-500 text-slate-950' : 'bg-slate-800 text-zinc-300 hover:bg-slate-700'}`}>
                  {d} ({TIMER_SECONDS[d]}s)
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-2">Category</label>
            <div className="flex gap-2 justify-center">
              {(['All', 'UN Recognized', 'Non-UN Recognized'] as CategoryFilter[]).map((c) => (
                <button key={c} onClick={() => setCategoryFilter(c)} className={`skeuo-btn px-3 py-2 rounded-xl text-[11px] font-bold transition-all ${categoryFilter === c ? 'bg-red-500 text-slate-950' : 'bg-slate-800 text-zinc-300 hover:bg-slate-700'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button onClick={startGame} className="skeuo-btn w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
            <Flag className="w-4 h-4" />
            <span>Start Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const percentage = questions.length > 0 ? Math.round((score / (questions.length * 10 + TIMER_SECONDS[difficulty] * questions.length / 2)) * 100) : 0;
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-6 text-center">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <Trophy className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Quiz Complete!</h3>
          </div>
        </div>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="text-5xl mb-2">🏆</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-[10px] text-zinc-400 uppercase tracking-wider">Score</p><p className="text-lg font-black text-red-400">{score}</p></div>
            <div><p className="text-[10px] text-zinc-400 uppercase tracking-wider">Best Streak</p><p className="text-lg font-black text-amber-400">{bestStreak}🔥</p></div>
            <div><p className="text-[10px] text-zinc-400 uppercase tracking-wider">Accuracy</p><p className="text-lg font-black text-emerald-400">{percentage}%</p></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setGameStarted(false); setShowTutorial(false); setGameOver(false); }} className="skeuo-btn flex-1 py-3 bg-slate-800 text-white font-bold text-xs rounded-xl">Menu</button>
          <button onClick={startGame} className="skeuo-btn flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" />Play Again</button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const progress = ((currIdx) / questions.length) * 100;
  const timerPercent = (timeLeft / TIMER_SECONDS[difficulty]) * 100;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-4 text-center">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Flag className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Country Flag Quiz</h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-amber-400 font-bold">Streak: {streak}🔥</span>
          <span className="text-red-400 font-bold">Score: {score}</span>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-zinc-400 font-mono">Question {currIdx + 1}/{questions.length}</span>
          <span className="text-[10px] text-zinc-400 font-mono">{currentQ.category} • {currentQ.region}</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3">
          <div className="bg-red-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Timer className={`w-4 h-4 ${getTimerColor()}`} />
          <span className={`text-2xl font-black font-mono ${getTimerColor()}`}>{timeLeft}s</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
          <div className={`h-2 rounded-full transition-all ${timeLeft > 8 ? 'bg-emerald-500' : timeLeft > 4 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${timerPercent}%` }} />
        </div>
        <span className="text-7xl leading-none block mb-3">{currentQ.flag}</span>
        <p className="text-xs text-slate-400 font-mono">Which country does this flag belong to?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {currentQ.options.map((opt) => {
          let btnClass = 'bg-slate-950 border-slate-800 hover:border-red-500/50 text-slate-200';
          if (selectedOpt) {
            if (opt === currentQ.correctAnswer) {
              btnClass = 'bg-emerald-600 border-emerald-500 text-white font-bold';
            } else if (opt === selectedOpt) {
              btnClass = 'bg-rose-600 border-rose-500 text-white font-bold';
            }
          }
          if (selectedOpt === '__timeout__' && opt === currentQ.correctAnswer) {
            btnClass = 'bg-emerald-600 border-emerald-500 text-white font-bold';
          }
          return (
            <button key={opt} onClick={() => handleAnswer(opt)} disabled={selectedOpt !== null} className={`skeuo-btn p-3.5 rounded-2xl border text-xs font-bold shadow-md transition-all ${btnClass}`}>
              {opt}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => { setGameStarted(false); setShowTutorial(false); setGameOver(false); }} className="text-[11px] text-zinc-400 hover:text-white transition-all">← Exit Quiz</button>
        <span className="text-[10px] text-zinc-500">Difficulty: <span className="capitalize text-zinc-300">{difficulty}</span></span>
      </div>
    </div>
  );
};
