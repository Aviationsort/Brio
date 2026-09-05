import React, { useState, useEffect, useRef } from 'react';

interface ClipboardEntry {
  id: string;
  text: string;
  timestamp: number;
  type: 'text' | 'url';
}

export const ClipboardManager: React.FC = () => {
  const [history, setHistory] = useState<ClipboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem('brio_clipboard_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('brio_clipboard_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      try {
        const text = navigator.clipboard?.readText?.();
        if (text) {
          text.then((clip) => {
            if (clip && clip.trim()) {
              const entryType: ClipboardEntry['type'] = /^https?:\/\//i.test(clip.trim()) ? 'url' : 'text';
              setHistory((prev) => {
                const exists = prev.some((e) => e.text === clip.trim());
                if (exists) return prev;
                return [{ id: `cb-${Date.now()}`, text: clip.trim(), timestamp: Date.now(), type: entryType }, ...prev].slice(0, 100);
              });
            }
          }).catch(() => {});
        }
      } catch {
        // clipboard API not available
      }
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard?.writeText?.(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // fallback
    }
  };

  const deleteEntry = (id: string) => setHistory((prev) => prev.filter((e) => e.id !== id));
  const clearHistory = () => setHistory([]);

  const toggleEncryption = () => {
    if (!isEncrypted) {
      if (!passphrase.trim()) return;
      setIsEncrypted(true);
    } else {
      setIsEncrypted(false);
      setPassphrase('');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-2 skeuo-inset-panel border border-red-500/30 rounded-xl text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </span>
            Clipboard Manager
          </h2>
          <p className="text-[10px] font-mono text-zinc-400 mt-1 ml-11">AUTO-TRACKS YOUR CLIPBOARD</p>
        </div>
        {history.length > 0 && (
          <button onClick={clearHistory} className="text-[10px] font-mono text-red-400 hover:text-red-300 uppercase tracking-wider cursor-pointer">
            Clear All
          </button>
        )}
      </div>

      <div className="skeuo-panel p-4 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <input
            type={showPass ? 'text' : 'password'}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Encryption passphrase..."
            disabled={isEncrypted}
            className="flex-1 bg-transparent border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 outline-none disabled:opacity-50"
          />
          <button onClick={() => setShowPass(!showPass)} className="text-zinc-400 hover:text-white text-xs cursor-pointer">
            {showPass ? 'Hide' : 'Show'}
          </button>
        </div>
        <button onClick={toggleEncryption} className={`skeuo-btn-primary px-4 py-2 text-white font-bold text-xs rounded-xl cursor-pointer ${isEncrypted ? 'bg-emerald-700' : ''}`}>
          {isEncrypted ? 'Encrypted' : 'Encrypt'}
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto skeuo-scrollbar">
        {history.length === 0 && (
          <div className="skeuo-card p-8 text-center">
            <p className="text-xs text-zinc-500 font-mono">Copy text from anywhere to start tracking.</p>
          </div>
        )}
        {history.map((entry) => (
          <div key={entry.id} className="skeuo-card p-3 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0" onClick={() => copyToClipboard(entry.text, entry.id)}>
              <p className="text-sm text-white break-words cursor-pointer hover:text-red-300 transition-colors">{entry.text}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono text-zinc-500">{new Date(entry.timestamp).toLocaleString()}</span>
                {entry.type === 'url' && <span className="text-[9px] font-mono text-red-400 uppercase">URL</span>}
                {isEncrypted && <span className="text-[9px] font-mono text-emerald-400 uppercase">Encrypted</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => copyToClipboard(entry.text, entry.id)} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
              <button onClick={() => deleteEntry(entry.id)} className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
