import React, { useState } from 'react';

type Category = 'length' | 'weight' | 'temperature' | 'speed' | 'aviation';

interface UnitDef {
  label: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const UNITS: Record<Category, UnitDef[]> = {
  length: [
    { label: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
    { label: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    { label: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { label: 'Nautical Miles', symbol: 'NM', toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
  ],
  weight: [
    { label: 'Kilograms', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
    { label: 'Pounds', symbol: 'lb', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    { label: 'Grams', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { label: 'Ounces', symbol: 'oz', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
  ],
  temperature: [
    { label: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
    { label: 'Fahrenheit', symbol: '°F', toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
    { label: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
  speed: [
    { label: 'km/h', symbol: 'km/h', toBase: (v) => v, fromBase: (v) => v },
    { label: 'mph', symbol: 'mph', toBase: (v) => v * 1.60934, fromBase: (v) => v / 1.60934 },
    { label: 'm/s', symbol: 'm/s', toBase: (v) => v * 3.6, fromBase: (v) => v / 3.6 },
    { label: 'Knots', symbol: 'kt', toBase: (v) => v * 1.852, fromBase: (v) => v / 1.852 },
  ],
  aviation: [
    { label: 'Feet', symbol: 'ft', toBase: (v) => v, fromBase: (v) => v },
    { label: 'Meters', symbol: 'm', toBase: (v) => v / 0.3048, fromBase: (v) => v * 0.3048 },
    { label: 'Knots', symbol: 'kt', toBase: (v) => v, fromBase: (v) => v },
    { label: 'km/h', symbol: 'km/h', toBase: (v) => v / 1.852, fromBase: (v) => v * 1.852 },
    { label: 'Mach', symbol: 'M', toBase: (v) => v * 1225.044, fromBase: (v) => v / 1225.044 },
  ],
};

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'length', label: 'Length' },
  { key: 'weight', label: 'Weight' },
  { key: 'temperature', label: 'Temp' },
  { key: 'speed', label: 'Speed' },
  { key: 'aviation', label: 'Aviation' },
];

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<Category>('length');
  const [from, setFrom] = useState(0);
  const [fromUnit, setFromUnit] = useState(0);
  const [toUnit, setToUnit] = useState(1);

  const units = UNITS[category];
  const result = units[toUnit].fromBase(units[fromUnit].toBase(from));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="p-2 skeuo-inset-panel border border-red-500/30 rounded-xl text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
        </span>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Unit Converter</h2>
          <p className="text-[10px] font-mono text-zinc-400 mt-0.5">LENGTH, WEIGHT, TEMP, SPEED, AVIATION</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => { setCategory(cat.key); setFromUnit(0); setToUnit(1); }}
            className={`skeuo-btn-primary px-4 py-2 text-white font-bold text-xs rounded-xl cursor-pointer ${category === cat.key ? 'ring-2 ring-red-300' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="skeuo-panel p-4 space-y-3">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">From</label>
          <input
            type="number"
            value={from}
            onChange={(e) => setFrom(parseFloat(e.target.value) || 0)}
            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-white outline-none"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(parseInt(e.target.value))}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
          >
            {units.map((u, i) => <option key={i} value={i}>{u.label} ({u.symbol})</option>)}
          </select>
        </div>

        <div className="skeuo-panel p-4 space-y-3">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">To</label>
          <div className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-red-300 min-h-[52px] flex items-center">
            {Number.isFinite(result) ? result.toFixed(6).replace(/\.?0+$/, '') : '—'}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(parseInt(e.target.value))}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
          >
            {units.map((u, i) => <option key={i} value={i}>{u.label} ({u.symbol})</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};
