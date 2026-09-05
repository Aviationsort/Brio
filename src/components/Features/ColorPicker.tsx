import React, { useState, useEffect } from 'react';

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

export const ColorPicker: React.FC = () => {
  const [hex, setHex] = useState('#C8102E');
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('brio_color_history') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const trimmed = hex.replace('#', '');
    if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) {
      localStorage.setItem('brio_color_history', JSON.stringify([hex, ...recent.filter((c) => c !== hex)].slice(0, 12)));
    }
  }, [hex]);

  const addRecent = () => {
    const trimmed = hex.replace('#', '');
    if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) {
      setRecent([hex, ...recent.filter((c) => c !== hex)].slice(0, 12));
    }
  };

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="p-2 skeuo-inset-panel border border-red-500/30 rounded-xl text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
        </span>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Color Picker</h2>
          <p className="text-[10px] font-mono text-zinc-400 mt-0.5">HEX / RGB / HSL VALUES</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="skeuo-panel p-5 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={hex}
              onChange={(e) => { setHex(e.target.value); addRecent(); }}
              className="w-16 h-16 rounded-xl cursor-pointer border-0 bg-transparent"
            />
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={hex.toUpperCase()}
                onChange={(e) => setHex(e.target.value)}
                onBlur={addRecent}
                className="w-full bg-transparent border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-white uppercase outline-none"
              />
              <div className="flex gap-2">
                {['HEX', 'RGB', 'HSL'].map((tab) => (
                  <button key={tab} className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">{tab}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">RGB</span>
              <span className="text-xs font-mono text-white">{rgb.r}, {rgb.g}, {rgb.b}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">HSL</span>
              <span className="text-xs font-mono text-white">{hsl.h}°, {hsl.s}%, {hsl.l}%</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { navigator.clipboard?.writeText?.(hex.toUpperCase()); }} className="skeuo-btn-primary flex-1 py-2 text-white font-bold text-xs rounded-xl cursor-pointer">
              Copy HEX
            </button>
            <button onClick={() => { navigator.clipboard?.writeText?.(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`); }} className="skeuo-btn-primary flex-1 py-2 text-white font-bold text-xs rounded-xl cursor-pointer">
              Copy RGB
            </button>
          </div>
        </div>

        <div className="skeuo-panel p-5 space-y-3">
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Recent Colors</p>
          <div className="flex flex-wrap gap-2">
            {recent.length === 0 && <p className="text-xs text-zinc-500 font-mono">No recent colors.</p>}
            {recent.map((c) => (
              <button key={c} onClick={() => setHex(c)} className="w-8 h-8 rounded-lg border border-white/20 hover:scale-110 transition-transform cursor-pointer" style={{ backgroundColor: c }} title={c} />
            ))}
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: hex }} />
        </div>
      </div>
    </div>
  );
};
