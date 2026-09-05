import React, { useState, useEffect } from 'react';

interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

const BASE_RATES: Record<string, CurrencyRate> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 149.5 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.36 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.53 },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', rate: 0.88 },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.24 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.1 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.67 },
  LBP: { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', rate: 89500 },
};

export const CurrencyConverter: React.FC = () => {
  const [fromCode, setFromCode] = useState('USD');
  const [toCode, setToCode] = useState('EUR');
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());

  useEffect(() => {
    const from = BASE_RATES[fromCode]?.rate || 1;
    const to = BASE_RATES[toCode]?.rate || 1;
    setResult((amount / from) * to);
  }, [amount, fromCode, toCode]);

  const swap = () => { setFromCode(toCode); setToCode(fromCode); };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="p-2 skeuo-inset-panel border border-red-500/30 rounded-xl text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </span>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Currency Converter</h2>
          <p className="text-[10px] font-mono text-zinc-400 mt-0.5">LIVE SIMULATED RATES</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="skeuo-panel p-5 space-y-3">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">From</label>
          <select value={fromCode} onChange={(e) => setFromCode(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer">
            {Object.values(BASE_RATES).map((c) => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-white outline-none"
          />
        </div>

        <div className="skeuo-panel p-5 space-y-3 relative">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">To</label>
          <select value={toCode} onChange={(e) => setToCode(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer">
            {Object.values(BASE_RATES).map((c) => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
          </select>
          <div className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-red-300 min-h-[52px] flex items-center">
            {Number.isFinite(result) ? result.toFixed(2) : '—'} {toCode}
          </div>
          <button onClick={swap} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 skeuo-btn-primary p-2 rounded-full text-white cursor-pointer z-10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </button>
        </div>
      </div>

      <div className="skeuo-card p-3 flex items-center justify-between">
        <span className="text-[10px] font-mono text-zinc-500">Last updated: {lastUpdated}</span>
        <span className="text-[10px] font-mono text-red-400 uppercase">Simulated rates</span>
      </div>
    </div>
  );
};
