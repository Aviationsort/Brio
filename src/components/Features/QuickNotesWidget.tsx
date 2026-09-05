import React, { useState, useEffect, useRef } from 'react';

interface Note {
  id: string;
  text: string;
  timestamp: number;
}

export const QuickNotesWidget: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('brio_quick_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('brio_quick_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setNotes((prev) => [{ id: `qn-${Date.now()}`, text: trimmed, timestamp: Date.now() }, ...prev].slice(0, 50));
    setInput('');
    inputRef.current?.focus();
  };

  const deleteNote = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));
  const clearAll = () => setNotes([]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-2 skeuo-inset-panel border border-red-500/30 rounded-xl text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </span>
            Quick Notes
          </h2>
          <p className="text-[10px] font-mono text-zinc-400 mt-1 ml-11">JOT DOWN IDEAS INSTANTLY</p>
        </div>
        {notes.length > 0 && (
          <button onClick={clearAll} className="text-[10px] font-mono text-red-400 hover:text-red-300 uppercase tracking-wider cursor-pointer">
            Clear All
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
          placeholder="Type a quick note and press Enter..."
          className="flex-1 skeuo-panel px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none"
        />
        <button onClick={addNote} className="skeuo-btn-primary px-5 py-3 text-white font-bold text-xs rounded-xl cursor-pointer">
          Add
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto skeuo-scrollbar">
        {notes.length === 0 && (
          <div className="skeuo-card p-8 text-center">
            <p className="text-xs text-zinc-500 font-mono">No notes yet. Start typing above.</p>
          </div>
        )}
        {notes.map((note) => (
          <div key={note.id} className="skeuo-card p-3 flex items-start justify-between gap-3 group">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white break-words">{note.text}</p>
              <p className="text-[10px] text-zinc-500 font-mono mt-1">{new Date(note.timestamp).toLocaleString()}</p>
            </div>
            <button onClick={() => deleteNote(note.id)} className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
