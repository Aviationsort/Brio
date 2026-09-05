import React, { useState } from 'react';

export const BMICalculator: React.FC = () => {
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [age, setAge] = useState(30);
  const [bmi, setBmi] = useState<number | null>(null);

  const calculate = () => {
    const h = heightCm / 100;
    if (h > 0 && weightKg > 0) {
      setBmi(weightKg / (h * h));
    } else {
      setBmi(null);
    }
  };

  const getCategory = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-sky-400', bg: 'bg-sky-500/10' };
    if (val < 25) return { label: 'Normal', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (val < 30) return { label: 'Overweight', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { label: 'Obese', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const cat = bmi ? getCategory(bmi) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="p-2 skeuo-inset-panel border border-red-500/30 rounded-xl text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </span>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">BMI Calculator</h2>
          <p className="text-[10px] font-mono text-zinc-400 mt-0.5">HEALTH METRICS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="skeuo-panel p-4 space-y-2">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Height (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(parseInt(e.target.value) || 0)}
            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2 text-lg font-bold text-white outline-none"
          />
          <input
            type="range"
            min="100"
            max="250"
            value={heightCm}
            onChange={(e) => setHeightCm(parseInt(e.target.value))}
            className="w-full accent-red-500"
          />
        </div>
        <div className="skeuo-panel p-4 space-y-2">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Weight (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(parseInt(e.target.value) || 0)}
            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2 text-lg font-bold text-white outline-none"
          />
          <input
            type="range"
            min="20"
            max="300"
            value={weightKg}
            onChange={(e) => setWeightKg(parseInt(e.target.value))}
            className="w-full accent-red-500"
          />
        </div>
        <div className="skeuo-panel p-4 space-y-2">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value) || 0)}
            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2 text-lg font-bold text-white outline-none"
          />
        </div>
      </div>

      <button onClick={calculate} className="skeuo-btn-primary w-full py-3 text-white font-bold text-sm rounded-xl cursor-pointer">
        Calculate BMI
      </button>

      {bmi !== null && (
        <div className={`skeuo-panel p-6 text-center space-y-3 ${cat?.bg}`}>
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Your BMI</p>
          <p className="text-5xl font-black text-white">{bmi.toFixed(1)}</p>
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${cat?.bg} ${cat?.color} border border-white/10`}>
            {cat?.label}
          </span>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-red-400 transition-all" style={{ width: `${Math.min(100, (bmi / 40) * 100)}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};
