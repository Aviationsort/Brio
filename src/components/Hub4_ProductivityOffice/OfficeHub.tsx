/**
 * OfficeHub Component: Encrypted Notes & Todolist Suite with AI Assistant
 * Styled in Bento Grid aesthetic
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { encryptionService } from '../../utils/crypto';
import { TodoItem } from '../../types';
import { AIProvider } from '../../services/AIProvider';
import {
  FileText,
  CheckSquare,
  Plus,
  Trash2,
  Lock,
  Search,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Send,
  Bot,
} from 'lucide-react';

export const OfficeHub: React.FC = () => {
  const { notes, saveNote, deleteNote, todos, addTodo, toggleTodo, deleteTodo, showToast } = useApp();

  // Note State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('Work, Encrypted');
  const [isNoteEncrypted, setIsNoteEncrypted] = useState(true);
  const [selectedNote, setSelectedNote] = useState<string | null>(notes[0]?.id || null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Todo State
  const [todoText, setTodoText] = useState('');
  const [todoPriority, setTodoPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  
  // AI Assistant State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleAISend = async () => {
    if (!aiInput.trim()) return;
    
    const userMessage = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiLoading(true);
    
    try {
      const response = await AIProvider.chat([...aiMessages, { role: 'user', content: userMessage }]);
      setAiMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      showToast('AI Error', 'Failed to get AI response', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSummarizeNote = async () => {
    if (!selectedNote) {
      showToast('No Note Selected', 'Please select a note to summarize', 'warning');
      return;
    }
    
    const note = notes.find(n => n.id === selectedNote);
    if (!note) return;
    
    setAiLoading(true);
    try {
      let content = note.content;
      if (note.isEncrypted && note.encryptedData) {
        content = await encryptionService.decrypt(note.encryptedData);
      }
      
      const summary = AIProvider.summarizeText(content);
      setAiMessages([{ role: 'assistant', content: `**Summary of "${note.title}":**\n\n${summary}` }]);
      setShowAIAssistant(true);
      showToast('Note Summarized', 'AI has generated a summary', 'success');
    } catch (err) {
      showToast('Summarization Error', String(err), 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) {
      showToast('Validation Error', 'Note title and content cannot be blank.', 'warning');
      return;
    }

    try {
      const tagArray = noteTags.split(',').map((t) => t.trim()).filter(Boolean);
      await saveNote(noteTitle, noteContent, tagArray, isNoteEncrypted);
      setNoteTitle('');
      setNoteContent('');
      showToast('Note Created', isNoteEncrypted ? 'Note encrypted with AES-256' : 'Note saved successfully', 'success');
    } catch (err) {
      showToast('Encryption Error', String(err), 'error');
    }
  };

  const handleDecryptNote = async (note: typeof notes[0]) => {
    if (!note.isEncrypted || !note.encryptedData) {
      setDecryptedText(note.content);
      return;
    }

    setDecrypting(true);
    try {
      const plain = await encryptionService.decrypt(note.encryptedData);
      setDecryptedText(plain);
      showToast('Decryption Success', 'Payload checksum verified ok.', 'success');
    } catch (err) {
      showToast('Decryption Failed', 'Invalid key or corrupted payload.', 'error');
      setDecryptedText('❌ Failed to decrypt content.');
    } finally {
      setDecrypting(false);
    }
  };

  const handleAddTodoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoText.trim()) return;
    try {
      addTodo(todoText, todoPriority, 'Office');
      setTodoText('');
      showToast('Task Created', 'Added to encrypted todo list.', 'success');
    } catch (err) {
      showToast('Task Error', String(err), 'error');
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Notes Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Create Note Bento Card */}
        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-[#FF5F1F]/10 border border-[#FF5F1F]/20 rounded-xl text-[#FF5F1F]">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Encrypted Workspace</p>
                <h3 className="text-base font-bold text-white">Office Notes & Vault</h3>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-400">
              <input
                type="checkbox"
                checked={isNoteEncrypted}
                onChange={(e) => setIsNoteEncrypted(e.target.checked)}
                className="w-4 h-4 rounded accent-[#FF5F1F]"
              />
              <span className="flex items-center gap-1 text-[#FF5F1F]">
                <Lock className="w-3.5 h-3.5" /> AES-256
              </span>
            </label>
          </div>

          <form onSubmit={handleCreateNote} className="space-y-3">
            <input
              type="text"
              placeholder="Note Title..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5F1F]"
            />

            <textarea
              placeholder="Write your encrypted notes here..."
              rows={3}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5F1F] resize-none"
            />

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-auto flex-1">
                <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Tags (comma separated)..."
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5F1F]"
                />
              </div>

              <button
                type="submit"
                className="liquid-glass-btn w-full sm:w-auto px-5 py-2.5 bg-[#FF5F1F] hover:bg-[#ff7236] text-black font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Save Encrypted Note
              </button>
            </div>
          </form>
        </div>

        {/* Existing Notes List */}
        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Saved Notes ({filteredNotes.length})</h4>
            <div className="relative w-48">
              <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5F1F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {filteredNotes.map((note) => {
              const isSelected = selectedNote === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note.id);
                    setDecryptedText(null);
                  }}
                  className={`liquid-glass-btn p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[120px] ${
                    isSelected
                      ? 'bg-zinc-900 border-[#FF5F1F] shadow-lg'
                      : 'bg-zinc-950/80 border-white/10 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className="text-xs font-bold text-white truncate">{note.title}</h5>
                      {note.isEncrypted && <Lock className="w-3.5 h-3.5 text-[#FF5F1F] shrink-0" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">{note.content}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[10px]">
                    <div className="flex gap-1 overflow-x-auto">
                      {note.tags.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                        showToast('Note Deleted', note.title, 'info');
                      }}
                      className="liquid-glass-btn text-zinc-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="liquid-glass-btn w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Decrypt Viewer */}
          {selectedNote && (
            <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#FF5F1F]">Decryption Viewer</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleSummarizeNote}
                    disabled={aiLoading}
                    className="liquid-glass-btn px-3 py-1 bg-purple-600 text-white text-[11px] font-bold rounded-lg hover:bg-purple-500 transition-all flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> {aiLoading ? 'Processing...' : 'AI Summarize'}
                  </button>
                  <button
                    onClick={() => {
                      const target = notes.find((n) => n.id === selectedNote);
                      if (target) handleDecryptNote(target);
                    }}
                    disabled={decrypting}
                    className="liquid-glass-btn px-3 py-1 bg-[#FF5F1F] text-black text-[11px] font-bold rounded-lg hover:bg-[#ff7236] transition-all"
                  >
                    {decrypting ? 'Decrypting...' : 'Decrypt Payload'}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 min-h-[60px] whitespace-pre-wrap">
                {decryptedText || '🔒 Press Decrypt Payload to unlock raw decrypted contents.'}
              </div>
            </div>
          )}

          {/* AI Assistant Panel */}
          {showAIAssistant && (
            <div className="bg-[#141414] border border-purple-500/20 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-purple-600/10 border border-purple-500/30 rounded-xl text-purple-400">
                    <Bot className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Independent AI</p>
                    <h3 className="text-base font-bold text-white">Brio Assistant</h3>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAIAssistant(false);
                    setAiMessages([]);
                  }}
                  className="liquid-glass-btn text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {aiMessages.length === 0 && (
                  <p className="text-xs text-zinc-500 text-center py-4">Ask me anything or summarize your notes!</p>
                )}
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-xs ${
                      msg.role === 'user'
                        ? 'bg-purple-900/30 border border-purple-500/20 text-purple-100 ml-4'
                        : 'bg-zinc-900 border border-white/10 text-zinc-200 mr-4'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
                {aiLoading && (
                  <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl text-xs text-zinc-400">
                    Thinking...
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Brio AI..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAISend()}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 border border-purple-500/20 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleAISend}
                  disabled={aiLoading || !aiInput.trim()}
                  className="liquid-glass-btn px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Todos Column Bento Card */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-[#FF5F1F]/10 border border-[#FF5F1F]/20 rounded-xl text-[#FF5F1F]">
                <CheckSquare className="w-5 h-5" />
              </span>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Action Queue</p>
                <h3 className="text-base font-bold text-white">Encrypted Tasks</h3>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 text-zinc-400">
              {todos.filter((t) => t.completed).length}/{todos.length} Done
            </span>
          </div>

          {/* Add Todo Form */}
          <form onSubmit={handleAddTodoSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Add urgent task..."
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5F1F]"
            />

            <div className="flex items-center gap-2">
              <select
                value={todoPriority}
                onChange={(e) => setTodoPriority(e.target.value as TodoItem['priority'])}
                className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#FF5F1F]"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Priority</option>
              </select>

              <button
                type="submit"
                className="liquid-glass-btn flex-1 py-2 bg-[#FF5F1F] hover:bg-[#ff7236] text-black font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
          </form>

          {/* Todo List */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`liquid-glass-btn p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  todo.completed
                    ? 'bg-zinc-950/50 border-white/5 opacity-60'
                    : 'bg-zinc-900 border-white/10 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-4 h-4 rounded accent-[#FF5F1F] cursor-pointer shrink-0"
                  />
                  <span
                    className={`liquid-glass-btn text-xs font-medium truncate ${
                      todo.completed ? 'line-through text-zinc-500' : 'text-white'
                    }`}
                  >
                    {todo.task}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`liquid-glass-btn text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      todo.priority === 'critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        : todo.priority === 'high'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {todo.priority}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="liquid-glass-btn p-1 text-zinc-500 hover:text-rose-400"
                  >
                    <Trash2 className="liquid-glass-btn w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
