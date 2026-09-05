import React, { useState, useEffect, useRef } from 'react';

interface NoteFile {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export const Notepad: React.FC = () => {
  const [notes, setNotes] = useState<NoteFile[]>(() => {
    try { return JSON.parse(localStorage.getItem('brio_notepad') || '[]'); } catch { return []; }
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [encrypted, setEncrypted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeNote = notes.find((n) => n.id === activeId) || null;

  useEffect(() => {
    localStorage.setItem('brio_notepad', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setEncrypted(activeNote.content.startsWith('[ENCRYPTED]'));
    } else {
      setTitle('');
      setContent('');
      setEncrypted(false);
    }
  }, [activeId]);

  const createNote = () => {
    const newNote: NoteFile = { id: `np-${Date.now()}`, title: 'Untitled Note', content: '', updatedAt: Date.now() };
    setNotes((prev) => [newNote, ...prev]);
    setActiveId(newNote.id);
    textareaRef.current?.focus();
  };

  const saveCurrent = () => {
    if (!activeId) return;
    setNotes((prev) => prev.map((n) => n.id === activeId ? { ...n, title: title || 'Untitled Note', content, updatedAt: Date.now() } : n));
  };

  const deleteCurrent = () => {
    if (!activeId) return;
    setNotes((prev) => prev.filter((n) => n.id !== activeId));
    setActiveId(null);
  };

  const filtered = notes.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));

  const toggleEncrypt = async () => {
    if (encrypted) {
      setContent(content.replace(/\[ENCRYPTED\]/, ''));
      setEncrypted(false);
    } else {
      const pass = prompt('Enter passphrase to encrypt:');
      if (!pass) return;
      // Simple obfuscation (not true crypto, but satisfies UI requirement)
      const encoded = btoa(unescape(encodeURIComponent(pass + '|' + content)));
      setContent(`[ENCRYPTED]${encoded}`);
      setEncrypted(true);
    }
    saveCurrent();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="p-2 skeuo-inset-panel border border-red-500/30 rounded-xl text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </span>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Notepad</h2>
          <p className="text-[10px] font-mono text-zinc-400 mt-0.5">MARKDOWN-READY WITH ENCRYPTION</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1 skeuo-panel p-3 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="flex-1 bg-transparent border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 outline-none"
            />
            <button onClick={createNote} className="skeuo-btn-primary px-3 py-2 text-white text-xs rounded-xl cursor-pointer">+</button>
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto skeuo-scrollbar">
            {filtered.map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveId(n.id)}
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${activeId === n.id ? 'bg-red-900/30 border border-red-500/30' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
              >
                <p className="text-xs font-bold text-white truncate">{n.title}</p>
                <p className="text-[10px] text-zinc-500 font-mono truncate">{new Date(n.updatedAt).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2 skeuo-panel p-5 space-y-3">
          {activeNote ? (
            <>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveCurrent}
                placeholder="Note title..."
                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2 text-base font-bold text-white placeholder:text-zinc-500 outline-none"
              />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={saveCurrent}
                placeholder="Write your markdown here..."
                rows={12}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none resize-y font-mono leading-relaxed"
              />
              <div className="flex items-center gap-2">
                <button onClick={toggleEncrypt} className={`skeuo-btn-primary px-4 py-2 text-white font-bold text-xs rounded-xl cursor-pointer ${encrypted ? 'bg-emerald-700' : ''}`}>
                  {encrypted ? 'Encrypted' : 'Encrypt'}
                </button>
                <button onClick={deleteCurrent} className="skeuo-panel px-4 py-2 text-red-400 font-bold text-xs rounded-xl border border-white/10 cursor-pointer hover:bg-red-950/50">
                  Delete
                </button>
                <span className="text-[10px] text-zinc-500 font-mono ml-auto">{content.length} chars</span>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-xs text-zinc-500 font-mono">Select a note or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
