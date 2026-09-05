import React, { useState, useEffect, useRef, useCallback } from 'react';

export const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState(120);
  const [playing, setPlaying] = useState(false);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const intervalRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClick = useCallback((accent: boolean) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(accent ? 1000 : 800, ctx.currentTime);
      gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // ignore
    }
  }, [volume]);

  useEffect(() => {
    if (playing) {
      const intervalMs = Math.max(50, 60000 / bpm);
      playClick(currentBeat === 0);
      intervalRef.current = window.setInterval(() => {
        setCurrentBeat((prev) => {
          const next = (prev + 1) % beatsPerBar;
          playClick(next === 0);
          return next;
        });
      }, intervalMs);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, bpm, beatsPerBar, playClick]);

  const togglePlay = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    setPlaying((prev) => !prev);
    setCurrentBeat(0);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="p-2 skeuo-inset-panel border border-red-500/30 rounded-xl text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
        </span>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Metronome</h2>
          <p className="text-[10px] font-mono text-zinc-400 mt-0.5">AUDIO CLICK TRACK</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="skeuo-panel p-5 space-y-4">
          <div>
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">BPM: {bpm}</label>
            <input
              type="range"
              min="30"
              max="240"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="w-full mt-2 accent-red-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Beats per Bar: {beatsPerBar}</label>
            <div className="flex gap-2 mt-2">
              {[2, 3, 4, 6, 8].map((b) => (
                <button
                  key={b}
                  onClick={() => setBeatsPerBar(b)}
                  className={`skeuo-btn-primary flex-1 py-2 text-white font-bold text-xs rounded-xl cursor-pointer ${beatsPerBar === b ? 'ring-2 ring-red-300' : ''}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
              className="w-full mt-2 accent-red-500"
            />
          </div>
        </div>

        <div className="skeuo-panel p-5 flex flex-col items-center justify-center gap-4">
          <button onClick={togglePlay} className={`skeuo-btn-primary px-8 py-4 text-white font-bold text-lg rounded-2xl cursor-pointer ${playing ? 'bg-red-800' : ''}`}>
            {playing ? 'Stop' : 'Start'}
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: beatsPerBar }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${playing && currentBeat === i ? 'bg-red-400 scale-125 shadow-[0_0_10px_rgba(255,95,31,0.6)]' : 'bg-white/20'}`}
              />
            ))}
          </div>
          <p className="text-[10px] font-mono text-zinc-500">Tap along or use keyboard</p>
        </div>
      </div>
    </div>
  );
};
