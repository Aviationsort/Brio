/**
 * TypingGame Component: Typing Speed Test
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Keyboard, Trophy, RotateCcw, Zap, Timer } from 'lucide-react';

const WORD_POOL = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'great', 'between', 'need', 'large', 'often', 'hand', 'high', 'place', 'hold', 'real', 'world', 'system', 'program', 'question', 'during', 'play', 'small', 'number', 'part', 'turn', 'move', 'live', 'believe', 'hold', 'bring', 'happen', 'write', 'provide', 'sit', 'stand', 'lose', 'pay', 'meet', 'include', 'continue', 'learn', 'change', 'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read', 'allow', 'add', 'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send', 'expect', 'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain', 'suggest', 'raise', 'pass', 'sell', 'require', 'report', 'decide', 'pull', 'develop', 'thank', 'receive', 'return', 'explain', 'hope', 'describe', 'plan', 'carry', 'pick', 'break', 'base', 'explain', 'catch', 'draw', 'wish', 'throw', 'feed', 'cover', 'grow', 'shake', 'hide', 'seek', 'fly', 'sing', 'dance', 'draw', 'paint', 'write', 'code', 'build', 'design', 'test', 'debug', 'deploy', 'scale', 'optimize', 'refactor', 'commit', 'merge', 'review', 'ship', 'launch', 'iterate', 'improve', 'innovate', 'collaborate', 'communicate', 'analyze', 'evaluate', 'assess', 'measure', 'monitor', 'observe', 'detect', 'identify', 'recognize', 'classify', 'predict', 'recommend', 'suggest', 'advise', 'mentor', 'coach', 'guide', 'support', 'assist', 'help', 'enable', 'empower', 'transform', 'evolve', 'adapt', 'respond', 'react', 'adjust', 'modify', 'revise', 'update', 'upgrade', 'migrate', 'integrate', 'connect', 'link', 'join', 'combine', 'unite', 'align', 'synchronize', 'coordinate', 'orchestrate', 'facilitate', 'streamline', 'simplify', 'automate', 'accelerate', 'optimize', 'maximize', 'minimize', 'balance', 'prioritize', 'focus', 'strategize', 'execute', 'deliver', 'achieve', 'succeed', 'excel', 'thrive', 'prosper', 'flourish', 'grow', 'expand', 'extend', 'reach', 'touch', 'impact', 'influence', 'inspire', 'motivate', 'ignite', 'spark', 'fuel', 'power', 'drive', 'push', 'propel', 'boost', 'enhance', 'improve', 'refine', 'polish', 'perfect', 'master', 'conquer', 'overcome', 'surpass', 'exceed', 'transcend', 'elevate', 'rise', 'ascend', 'soar', 'fly', 'dream', 'imagine', 'create', 'invent', 'discover', 'explore', 'investigate', 'research', 'study', 'learn', 'practice', 'train', 'exercise', 'workout', 'compete', 'perform', 'deliver', 'produce', 'generate', 'manufacture', 'assemble', 'construct', 'compose', 'arrange', 'organize', 'structure', 'framework', 'architect', 'engineer', 'develop', 'implement', 'execute', 'operate', 'maintain', 'support', 'sustain', 'preserve', 'protect', 'defend', 'secure', 'safeguard', 'ensure', 'guarantee', 'promise', 'commit', 'pledge', 'vow', 'swear', 'declare', 'announce', 'proclaim', 'publish', 'share', 'distribute', 'broadcast', 'transmit', 'send', 'deliver', 'present', 'show', 'display', 'exhibit', 'demonstrate', 'illustrate', 'visualize', 'represent', 'portray', 'depict', 'describe', 'define', 'explain', 'interpret', 'translate', 'convert', 'transform', 'transmute', 'transfigure', 'transpose', 'transfer', 'transmit', 'transport', 'carry', 'bear', 'bring', 'fetch', 'gather', 'collect', 'accumulate', 'amass', 'compile', 'aggregate', 'consolidate', 'merge', 'unify', 'unite', 'integrate', 'combine', 'fuse', 'blend', 'mix', 'merge', 'join', 'connect', 'link', 'attach', 'affix', 'bond', 'bind', 'tie', 'knot', 'weave', 'intertwine', 'interlace', 'interconnect', 'network', 'web', 'mesh', 'grid', 'matrix', 'array', 'list', 'set', 'map', 'dictionary', 'object', 'class', 'instance', 'entity', 'item', 'element', 'component', 'module', 'package', 'library', 'framework', 'platform', 'system', 'ecosystem', 'environment', 'context', 'scope', 'domain', 'realm', 'universe', 'world', 'sphere', 'orbit', 'cycle', 'loop', 'iteration', 'recursion', 'sequence', 'series', 'chain', 'stream', 'flow', 'current', 'trend', 'pattern', 'trend', 'direction', 'trajectory', 'path', 'route', 'journey', 'voyage', 'quest', 'mission', 'purpose', 'goal', 'objective', 'target', 'aim', 'focus', 'priority', 'mission', 'vision', 'strategy', 'tactics', 'plan', 'scheme', 'design', 'blueprint', 'roadmap', 'itinerary', 'agenda', 'schedule', 'calendar', 'timeline', 'deadline', 'milestone', 'checkpoint', 'gate', 'review', 'assessment', 'evaluation', 'analysis', 'diagnosis', 'examination', 'inspection', 'audit', 'survey', 'poll', 'vote', 'election', 'referendum', 'ballot', 'ticket', 'pass', 'permit', 'license', 'certificate', 'diploma', 'degree', 'qualification', 'credential', 'badge', 'award', 'prize', 'trophy', 'medal', 'ribbon', 'title', 'crown', 'throne', 'kingdom', 'empire', 'nation', 'country', 'state', 'province', 'region', 'territory', 'district', 'zone', 'area', 'sector', 'segment', 'fraction', 'portion', 'share', 'stake', 'interest', 'claim', 'right', 'entitlement', 'privilege', 'advantage', 'benefit', 'value', 'worth', 'merit', 'virtue', 'quality', 'excellence', 'superiority', 'dominance', 'mastery', 'command', 'control', 'authority', 'power', 'influence', 'sway', 'clout', 'weight', 'importance', 'significance', 'meaning', 'purpose', 'intention', 'intent', 'aim', 'objective', 'goal', 'target', 'destination', 'endpoint', 'finish', 'completion', 'conclusion', 'termination', 'cessation', 'halt', 'stop', 'pause', 'break', 'rest', 'pause', 'intermission', 'interlude', 'interruption', 'disruption', 'disturbance', 'noise', 'sound', 'voice', 'tone', 'pitch', 'frequency', 'wavelength', 'amplitude', 'volume', 'intensity', 'strength', 'power', 'force', 'energy', 'momentum', 'velocity', 'speed', 'acceleration', 'deceleration', 'brake', 'stop', 'halt', 'pause', 'wait', 'delay', 'lag', 'gap', 'space', 'distance', 'length', 'width', 'height', 'depth', 'size', 'scale', 'magnitude', 'extent', 'range', 'scope', 'span', 'reach', 'grasp', 'hold', 'grip', 'clutch', 'clasp', 'grasp', 'seize', 'capture', 'catch', 'trap', 'snare', 'net', 'mesh', 'web', 'network', 'system', 'structure', 'framework', 'architecture', 'design', 'pattern', 'template', 'mold', 'cast', 'form', 'shape', 'figure', 'silhouette', 'outline', 'contour', 'profile', 'face', 'visage', 'countenance', 'expression', 'look', 'gaze', 'stare', 'glance', 'peek', ' glimpse', 'view', 'sight', 'vision', 'scene', 'panorama', 'landscape', 'vista', 'perspective', 'angle', 'viewpoint', 'standpoint', 'position', 'location', 'site', 'spot', 'place', 'position', 'location', 'venue', 'setting', 'context', 'circumstance', 'condition', 'state', 'status', 'situation', 'scenario', 'case', 'instance', 'example', 'illustration', 'demonstration', 'exhibit', 'show', 'display', 'presentation', 'performance', 'show', 'act', 'play', 'drama', 'comedy', 'tragedy', 'farce', 'melodrama', 'spectacle', 'pageant', 'procession', 'parade', 'march', 'walk', 'run', 'sprint', 'dash', 'rush', 'hurry', 'haste', 'speed', 'velocity', 'pace', 'rhythm', 'tempo', 'beat', 'pulse', 'heartbeat', 'circulation', 'flow', 'stream', 'current', 'trend', 'movement', 'motion', 'action', 'activity', 'operation', 'function', 'process', 'procedure', 'method', 'technique', 'approach', 'strategy', 'tactic', 'plan', 'scheme', 'design', 'blueprint', 'model', 'prototype', 'sample', 'specimen', 'example', 'illustration', 'case', 'instance', 'item', 'article', 'object', 'thing', 'entity', 'being', 'creature', 'animal', 'plant', 'organism', 'life', 'existence', 'reality', 'fact', 'truth', 'actuality', 'act', 'deed', 'action', 'performance', 'execution', 'accomplishment', 'achievement', 'attainment', 'realization', 'fulfillment', 'completion', 'conclusion', 'closure', 'ending', 'termination', 'finale', 'coda', 'epilogue', 'postscript', 'addendum', 'appendix', 'supplement', 'extension', 'addition', 'extra', 'surplus', 'excess', 'overflow', 'overabundance', 'plethora', 'wealth', 'riches', 'fortune', 'treasure', 'hoard', 'cache', 'store', 'stock', 'supply', 'inventory', 'reserve', 'reservoir', 'well', 'spring', 'source', 'origin', 'root', 'foundation', 'base', 'basis', 'ground', 'earth', 'soil', 'dirt', 'dust', 'powder', 'granule', 'particle', 'atom', 'molecule', 'cell', 'unit', 'module', 'component', 'element', 'factor', 'variable', 'parameter', 'argument', 'value', 'quantity', 'amount', 'number', 'numeral', 'digit', 'figure', 'character', 'symbol', 'sign', 'mark', 'trait', 'feature', 'attribute', 'property', 'quality', 'characteristic', 'aspect', 'facet', 'angle', 'side', 'face', 'surface', 'interface', 'boundary', 'border', 'edge', 'margin', 'borderline', 'threshold', 'limit', 'boundary', 'frontier', 'border', 'perimeter', 'circumference', 'circuit', 'cycle', 'loop', 'circle', 'ring', 'hoop', 'band', 'belt', 'strap', 'cord', 'rope', 'string', 'twine', 'thread', 'yarn', 'wool', 'cotton', 'silk', 'fabric', 'cloth', 'textile', 'material', 'substance', 'matter', 'stuff', 'content', 'substance', 'essence', 'core', 'heart', 'center', 'middle', 'midst', 'interior', 'inside', 'within', 'in', 'into', 'inside', 'inner', 'internal', 'intrinsic', 'inherent', 'innate', 'native', 'natural', 'organic', 'biological', 'living', 'alive', 'vital', 'dynamic', 'active', 'energetic', 'vigorous', 'strong', 'powerful', 'mighty', 'potent', 'forceful', 'effective', 'efficient', 'productive', 'fruitful', 'fertile', 'fecund', 'prolific', 'abundant', 'plentiful', 'bountiful', 'generous', 'liberal', 'magnanimous', 'charitable', 'benevolent', 'kind', 'compassionate', 'empathetic', 'sympathetic', 'sensitive', 'tactful', 'diplomatic', 'discreet', 'prudent', 'wise', 'sage', 'scholar', 'learned', 'erudite', 'knowledgeable', 'informed', 'aware', 'conscious', 'mindful', 'attentive', 'observant', 'perceptive', 'discerning', 'astute', 'shrewd', 'clever', 'smart', 'intelligent', 'brilliant', 'genius', 'prodigy', 'wonder', 'marvel', 'miracle', 'phenomenon', 'spectacle', 'sight', 'view', 'scene', 'panorama', 'vista', 'landscape', 'scenery', 'terrain', 'topography', 'geography', 'geology', 'earth', 'ground', 'land', 'terrain', 'territory', 'region', 'zone', 'district', 'sector', 'area', 'realm', 'domain', 'kingdom', 'empire', 'nation', 'state', 'country', 'land', 'home', 'homeland', 'motherland', 'fatherland', 'native', 'native', 'aboriginal', 'indigenous', 'autochthonous', 'original', 'primordial', 'primeval', 'ancient', 'antique', 'old', 'aged', 'elderly', 'senior', 'mature', 'grown', 'adult', 'ripe', 'mellow', 'developed', 'advanced', 'progressive', 'forward', 'ahead', 'in front', 'leading', 'front', 'vanguard', 'forefront', 'vanguard', 'forefront', 'forefront', 'vanguard', 'vanguard', 'forefront',
];

type Difficulty = 'easy' | 'medium' | 'hard';

export const TypingGame: React.FC = () => {
  const { showToast } = useApp();
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeLeft, setTimeLeft] = useState(60);
  const [typedText, setTypedText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<number | null>(null);

  const TIME_LIMITS: Record<Difficulty, number> = { easy: 120, medium: 60, hard: 30 };

  const generateText = useCallback(() => {
    const wordCount = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 50 : 80;
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
    }
    return words.join(' ');
  }, [difficulty]);

  const startGame = useCallback(() => {
    const text = generateText();
    setTargetText(text);
    setTypedText('');
    setCharIndex(0);
    setCorrectChars(0);
    setTotalTyped(0);
    setScore(0);
    setWpm(0);
    setAccuracy(100);
    setTimeLeft(TIME_LIMITS[difficulty]);
    setGameOver(false);
    setGameStarted(true);
    setShowTutorial(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [generateText, difficulty]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    timeRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timeRef.current!);
          setGameOver(true);
          const minutes = TIME_LIMITS[difficulty] / 60;
          const finalWpm = Math.round((correctChars / 5) / minutes);
          const finalAccuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;
          const finalScore = finalWpm * (finalAccuracy / 100) * (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2);
          setWpm(finalWpm);
          setAccuracy(finalAccuracy);
          setScore(Math.round(finalScore));
          showToast('Time Up!', `WPM: ${finalWpm} | Accuracy: ${finalAccuracy}%`, 'info');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timeRef.current) clearInterval(timeRef.current); };
  }, [gameStarted, gameOver, difficulty, correctChars, totalTyped, showToast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameOver) return;
    const val = e.target.value;
    setTypedText(val);
    setCharIndex(val.length);
    setTotalTyped((prev) => prev + 1);
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetText[i]) correct++;
    }
    setCorrectChars(correct);
    setAccuracy(totalTyped > 0 ? Math.round((correct / (totalTyped + 1)) * 100) : 100);
    const elapsed = TIME_LIMITS[difficulty] - timeLeft;
    const minutes = elapsed / 60 || 1 / 60;
    setWpm(Math.round((correct / 5) / minutes));
    const scoreVal = Math.round(correct * 0.1);
    setScore(scoreVal);
    if (val.length >= targetText.length) {
      setGameOver(true);
      if (timeRef.current) clearInterval(timeRef.current);
      showToast('Complete!', `WPM: ${wpm} | Accuracy: ${accuracy}%`, 'success');
    }
  };

  const renderChar = (char: string, idx: number) => {
    const typed = typedText[idx];
    if (typed === undefined) return <span className="text-zinc-500">{char === ' ' ? '\u00A0' : char}</span>;
    const isCorrect = typed === char;
    return <span className={isCorrect ? 'text-emerald-400' : 'text-rose-400 bg-rose-950/50 rounded px-0.5'}>{char === ' ' ? '\u00A0' : char}</span>;
  };

  if (showTutorial || (!gameStarted && !gameOver)) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-6 text-center">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400"><Keyboard className="w-5 h-5" /><h3 className="text-base font-bold text-white">Typing Speed Test</h3></div>
          <button onClick={() => setShowTutorial(false)} className="text-[11px] text-zinc-400 hover:text-white">Skip</button>
        </div>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-left">
          <h4 className="text-sm font-bold text-white">How to Play</h4>
          <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
            <li>Type the displayed text as accurately and quickly as possible.</li>
            <li>Your WPM (Words Per Minute) and accuracy are tracked live.</li>
            <li>Score is calculated from speed × accuracy × difficulty multiplier.</li>
            <li>Green characters are correct, red characters are incorrect.</li>
            <li>Complete the text or beat the clock for the best score.</li>
          </ul>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-2">Time Limit</label>
            <div className="flex gap-2 justify-center">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`skeuo-btn px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${difficulty === d ? 'bg-red-500 text-slate-950' : 'bg-slate-800 text-zinc-300 hover:bg-slate-700'}`}>
                  {d} ({TIME_LIMITS[d]}s)
                </button>
              ))}
            </div>
          </div>
          <button onClick={startGame} className="skeuo-btn w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
            <Keyboard className="w-4 h-4" /><span>Start Test</span>
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-6 text-center">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400"><Trophy className="w-5 h-5" /><h3 className="text-base font-bold text-white">Test Complete</h3></div>
        </div>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="text-5xl mb-2">⌨️</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-[10px] text-zinc-400 uppercase">WPM</p><p className="text-lg font-black text-red-400">{wpm}</p></div>
            <div><p className="text-[10px] text-zinc-400 uppercase">Accuracy</p><p className="text-lg font-black text-emerald-400">{accuracy}%</p></div>
            <div><p className="text-[10px] text-zinc-400 uppercase">Score</p><p className="text-lg font-black text-amber-400">{score}</p></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setGameStarted(false); setShowTutorial(false); setGameOver(false); }} className="skeuo-btn flex-1 py-3 bg-slate-800 text-white font-bold text-xs rounded-xl">Menu</button>
          <button onClick={startGame} className="skeuo-btn flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" />Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md mx-auto space-y-4 text-center">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-rose-400"><Keyboard className="w-5 h-5" /><h3 className="text-base font-bold text-white">Typing Speed Test</h3></div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-red-400 font-bold">WPM: {wpm}</span>
          <span className="text-zinc-400 font-bold flex items-center gap-1"><Timer className="w-3 h-3" />{timeLeft}s</span>
        </div>
      </div>
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-2 text-[10px] text-zinc-400">
          <span>Accuracy: {accuracy}%</span>
          <span>Progress: {typedText.length}/{targetText.length}</span>
        </div>
        <p className="text-sm text-zinc-300 font-mono leading-relaxed text-left break-words select-none">
          {targetText.split('').map((char, idx) => renderChar(char, idx))}
        </p>
      </div>
      <input ref={inputRef} value={typedText} onChange={handleInputChange} disabled={gameOver} className="opacity-0 absolute pointer-events-none" autoFocus />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-500">Click the text area and start typing. Score: {score}</span>
        <button onClick={() => { setGameStarted(false); setShowTutorial(false); setGameOver(false); }} className="text-[11px] text-zinc-400 hover:text-white">← Exit</button>
      </div>
    </div>
  );
};
