/**
 * OfficeHub Component: Encrypted Notes & Todolist Suite with AI Assistant
 * Styled with luxurious sidebar navigation, refined palette, and generous spacing
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { encryptionService } from '../../utils/crypto';
import { TodoItem, SpreadsheetCell, Slide, DocumentPage, PDFAnnotation } from '../../types';
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
  Calendar,
  StickyNote,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  Table,
  Presentation,
  PenTool,
  BookOpen,
  LayoutTemplate,
  FileType2,
  Clock,
  Download,
  ChevronRight,
  ChevronLeft,
  Image,
  MousePointer2,
  Highlighter,
  Stamp,
  Signature,
  Eraser,
  Save,
  FileSpreadsheet,
  FileImage,
  FileText as FileTextIcon,
  Columns,
  Rows,
  Home,
} from 'lucide-react';

type TabId = 'notes' | 'todos' | 'stickies' | 'texteditor' | 'spreadsheet' | 'presentation' | 'wordprocessor' | 'notebook' | 'publisher' | 'pdfviewer';

const SIDEBAR_NAV: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
  { id: 'todos', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'stickies', label: 'Stickies', icon: <StickyNote className="w-4 h-4" /> },
  { id: 'texteditor', label: 'Editor', icon: <Type className="w-4 h-4" /> },
  { id: 'spreadsheet', label: 'Sheet', icon: <Table className="w-4 h-4" /> },
  { id: 'presentation', label: 'Slides', icon: <Presentation className="w-4 h-4" /> },
  { id: 'wordprocessor', label: 'Word', icon: <FileTextIcon className="w-4 h-4" /> },
  { id: 'notebook', label: 'Notebook', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'publisher', label: 'Publisher', icon: <LayoutTemplate className="w-4 h-4" /> },
  { id: 'pdfviewer', label: 'PDF', icon: <FileType2 className="w-4 h-4" /> },
];

const TABS: { id: TabId; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'notes', label: 'Encrypted Notes', icon: <FileText className="w-4 h-4" />, color: '#C8102E' },
  { id: 'todos', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" />, color: '#10b981' },
  { id: 'stickies', label: 'Stickies', icon: <StickyNote className="w-4 h-4" />, color: '#eab308' },
  { id: 'texteditor', label: 'Editor', icon: <Type className="w-4 h-4" />, color: '#06b6d4' },
  { id: 'spreadsheet', label: 'Spreadsheet', icon: <Table className="w-4 h-4" />, color: '#10b981' },
  { id: 'presentation', label: 'Presentation', icon: <Presentation className="w-4 h-4" />, color: '#a855f7' },
  { id: 'wordprocessor', label: 'Word Processor', icon: <FileTextIcon className="w-4 h-4" />, color: '#3b82f6' },
  { id: 'notebook', label: 'Notebook', icon: <BookOpen className="w-4 h-4" />, color: '#6366f1' },
  { id: 'publisher', label: 'Publisher', icon: <LayoutTemplate className="w-4 h-4" />, color: '#ec4899' },
  { id: 'pdfviewer', label: 'PDF Viewer', icon: <FileType2 className="w-4 h-4" />, color: '#f43f5e' },
];

const SECTION_HEADER = (icon: React.ReactNode, label: string, sublabel: string, color: string) => (
  <div className="flex items-center justify-between pb-4 border-b border-white/10">
    <div className="flex items-center gap-3">
      <span className="p-2.5 rounded-xl border" style={{ backgroundColor: `${color}15`, borderColor: `${color}30`, color }}>
        {icon}
      </span>
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">{sublabel}</p>
        <h3 className="text-base font-bold text-white">{label}</h3>
      </div>
    </div>
  </div>
);

export const OfficeHub: React.FC = () => {
  const { notes, saveNote, deleteNote, todos, addTodo, toggleTodo, deleteTodo, showToast, t } = useApp();

  const [activeTab, setActiveTab] = useState<TabId>('notes');
  const [recentDocuments, setRecentDocuments] = useState<{ id: string; title: string; type: TabId; updatedAt: string }[]>([]);

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('Work, Encrypted');
  const [isNoteEncrypted, setIsNoteEncrypted] = useState(true);
  const [selectedNote, setSelectedNote] = useState<string | null>(notes[0]?.id || null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [todoText, setTodoText] = useState('');
  const [todoPriority, setTodoPriority] = useState<TodoItem['priority']>('high');

  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [stickyNotes, setStickyNotes] = useState<{id: string, text: string, color: string}[]>([]);
  const [newStickyText, setNewStickyText] = useState('');

  const [editorText, setEditorText] = useState('');

  const [spreadsheetCells, setSpreadsheetCells] = useState<SpreadsheetCell[]>([]);
  const [selectedCell, setSelectedCell] = useState<{row: number; col: number} | null>(null);
  const [cellFormats, setCellFormats] = useState<Record<string, Partial<SpreadsheetCell['format']>>>({});

  const [slides, setSlides] = useState<Slide[]>([
    { id: 'slide-1', title: 'New Slide', content: 'Start your presentation here...', transition: 'fade', order: 0 }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<number | null>(null);

  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('<p>Start writing your document...</p>');

  const [notebookPages, setNotebookPages] = useState<DocumentPage[]>([
    { id: 'page-1', title: 'Page 1', content: '', order: 0 }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [publisherElements, setPublisherElements] = useState<{id: string; type: 'text' | 'image'; content: string; x: number; y: number; width: number; height: number}[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({x: 0, y: 0});

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfAnnotations, setPdfAnnotations] = useState<PDFAnnotation[]>([]);
  const [pdfTool, setPdfTool] = useState<'select' | 'pen' | 'highlighter' | 'text' | 'stamp'>('select');
  const [pdfColor, setPdfColor] = useState('#ff0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeTabData = TABS.find(t => t.id === activeTab);

  const addToRecent = (title: string, type: TabId) => {
    setRecentDocuments((prev) => {
      const filtered = prev.filter((d) => !(d.title === title && d.type === type));
      return [{ id: `${type}-${Date.now()}`, title, type, updatedAt: new Date().toISOString() }, ...filtered].slice(0, 20);
    });
  };

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
      addToRecent(noteTitle, 'notes');
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

  const handleAddSticky = () => {
    if (!newStickyText.trim()) return;
    const colors = ['bg-yellow-200 text-yellow-900', 'bg-green-200 text-green-900', 'bg-red-200 text-red-900', 'bg-red-200 text-red-900'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    setStickyNotes(prev => [...prev, { id: `sticky-${Date.now()}`, text: newStickyText, color }]);
    setNewStickyText('');
    showToast('Sticky Added', 'Quick note added to board', 'success');
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const neuBase = 'bg-[#141414] border border-white/10';
  const neuShadow = 'shadow-[inset_2px_2px_4px_rgba(255,255,255,0.03),inset_-2px_-2px_4px_rgba(0,0,0,0.5)]';
  const neuInput = `${neuBase} ${neuShadow} rounded-xl text-white text-xs focus:outline-none focus:border-[#C8102E]`;

  const cellId = (r: number, c: number) => `${r}-${c}`;
  const getCell = (r: number, c: number) => spreadsheetCells.find(cell => cell.row === r && cell.col === c);
  const updateCell = (r: number, c: number, updates: Partial<SpreadsheetCell>) => {
    setSpreadsheetCells(prev => {
      const existing = prev.find(cell => cell.row === r && cell.col === c);
      if (existing) {
        return prev.map(cell => cell.row === r && cell.col === c ? { ...cell, ...updates } : cell);
      }
      return [...prev, { id: cellId(r, c), row: r, col: c, value: '', formula: '', format: {} as any, ...updates }];
    });
  };

  const evaluateFormula = (formula: string): string => {
    const sumMatch = formula.match(/^=SUM\(([A-Z]+\d+):([A-Z]+\d+)\)$/i);
    const avgMatch = formula.match(/^=AVG\(([A-Z]+\d+):([A-Z]+\d+)\)$/i);
    if (sumMatch || avgMatch) {
      const rangeMatch = formula.match(/\(([A-Z]+\d+):([A-Z]+\d+)\)/);
      if (!rangeMatch) return '#ERR';
      const start = rangeMatch[1];
      const end = rangeMatch[2];
      const startCol = start.match(/[A-Z]+/)?.[0] || 'A';
      const startRow = parseInt(start.match(/\d+/)?.[0] || '1');
      const endCol = end.match(/[A-Z]+/)?.[0] || 'A';
      const endRow = parseInt(end.match(/\d+/)?.[0] || '1');
      let sum = 0;
      let count = 0;
      for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
        for (let c = startCol.charCodeAt(0); c <= endCol.charCodeAt(0); c++) {
          const cell = getCell(r, c);
          const val = parseFloat(cell?.value || '0');
          if (!isNaN(val)) {
            sum += val;
            count++;
          }
        }
      }
      if (avgMatch && count > 0) return String(sum / count);
      return String(sum);
    }
    return formula;
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
  };
  const prevSlide = () => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  };
  const addSlide = () => {
    const newSlide: Slide = { id: `slide-${Date.now()}`, title: 'New Slide', content: '', transition: 'fade', order: slides.length };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const addPage = () => {
    const newPage: DocumentPage = { id: `page-${Date.now()}`, title: `Page ${notebookPages.length + 1}`, content: '', order: notebookPages.length };
    setNotebookPages([...notebookPages, newPage]);
    setCurrentPageIndex(notebookPages.length);
  };

  const addPublisherElement = (type: 'text' | 'image') => {
    const newEl = {
      id: `pub-${Date.now()}`,
      type,
      content: type === 'text' ? 'Double-click to edit' : 'https://via.placeholder.com/150',
      x: 50,
      y: 50,
      width: 150,
      height: type === 'text' ? 40 : 150,
    };
    setPublisherElements([...publisherElements, newEl]);
  };

  const handlePublisherMouseDown = (e: React.MouseEvent, id: string) => {
    const el = publisherElements.find(el => el.id === id);
    if (!el) return;
    setDraggingId(id);
    setDragOffset({ x: e.clientX - el.x, y: e.clientY - el.y });
  };

  const handlePublisherMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    setPublisherElements(prev => prev.map(el => el.id === draggingId ? { ...el, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : el));
  };

  const handlePublisherMouseUp = () => {
    setDraggingId(null);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      showToast('PDF Loaded', file.name, 'success');
    } else {
      showToast('Invalid File', 'Please select a PDF file', 'error');
    }
  };

  const handlePdfCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (pdfTool === 'select') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    const newAnnotation: PDFAnnotation = {
      id: `pdf-ann-${Date.now()}`,
      type: pdfTool,
      color: pdfColor,
      strokeWidth: 2,
      points: pdfTool === 'pen' || pdfTool === 'highlighter' ? [{x, y}] : undefined,
      text: pdfTool === 'text' ? prompt('Enter text:') || '' : undefined,
      x: pdfTool === 'text' || pdfTool === 'stamp' ? x : undefined,
      y: pdfTool === 'text' || pdfTool === 'stamp' ? y : undefined,
      pageNumber: 1,
    };
    setPdfAnnotations([...pdfAnnotations, newAnnotation]);
  };

  const handlePdfCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || pdfTool === 'select') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPdfAnnotations(prev => {
      const last = prev[prev.length - 1];
      if (last && (pdfTool === 'pen' || pdfTool === 'highlighter')) {
        return [...prev.slice(0, -1), { ...last, points: [...(last.points || []), {x, y}] }];
      }
      return prev;
    });
  };

  const handlePdfCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const exportSpreadsheet = () => {
    let csv = '';
    const maxRow = Math.max(...spreadsheetCells.map(c => c.row), 0);
    const maxCol = Math.max(...spreadsheetCells.map(c => c.col), 0);
    for (let r = 0; r <= maxRow; r++) {
      const row: string[] = [];
      for (let c = 0; c <= maxCol; c++) {
        const cell = getCell(r, c);
        row.push(cell?.value || '');
      }
      csv += row.join(',') + '\n';
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export Successful', 'Spreadsheet exported as CSV', 'success');
  };

  const exportDocument = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export Successful', `Exported as ${filename}`, 'success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-2 space-y-5">
        {/* Document Type Icons */}
        <div className={`${neuBase} ${neuShadow} rounded-3xl p-3 space-y-1`}>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-2">Workspace</p>
          {SIDEBAR_NAV.map((nav) => (
            <button
              key={nav.id}
              onClick={() => setActiveTab(nav.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === nav.id
                  ? 'bg-gradient-to-r from-[#C8102E] to-red-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {nav.icon}
              <span className="truncate">{nav.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Documents */}
        <div className={`${neuBase} ${neuShadow} rounded-3xl p-4 space-y-3`}>
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Recent</h4>
          <div className="space-y-2 max-h-[40vh] overflow-y-auto">
            {recentDocuments.length === 0 && (
              <p className="text-[10px] text-zinc-600">No recent documents</p>
            )}
            {recentDocuments.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setActiveTab(doc.type)}
                className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === doc.type
                    ? 'bg-zinc-900 border-[#C8102E] text-white'
                    : 'bg-zinc-950/80 border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <p className="text-[11px] font-bold truncate">{doc.title}</p>
                <p className="text-[9px] text-zinc-500">{new Date(doc.updatedAt).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-10 space-y-6">
        {/* Tab Navigation Bar */}
        <div className={`${neuBase} ${neuShadow} rounded-3xl p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar`}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`liquid-glass-btn px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${tab.color}dd, ${tab.color}99)`,
                  boxShadow: `0 4px 15px ${tab.color}40`
                } : {}}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${neuBase} ${neuShadow} rounded-3xl p-8 space-y-5`}>
              {SECTION_HEADER(<FileText className="w-5 h-5" />, 'Office Notes & Vault', 'Encrypted Workspace', '#C8102E')}
              <form onSubmit={handleCreateNote} className="space-y-4">
                <input type="text" placeholder="Note Title..." value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className={neuInput + ' px-4 py-3'} />
                <textarea placeholder="Write your encrypted notes here..." rows={4} value={noteContent} onChange={(e) => setNoteContent(e.target.value)} className={neuInput + ' px-4 py-3'} />
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-auto flex-1">
                    <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                    <input type="text" placeholder="Tags (comma separated)..." value={noteTags} onChange={(e) => setNoteTags(e.target.value)} className={`w-full pl-9 pr-3 py-2.5 ${neuInput}`} />
                  </div>
                  <button type="submit" className="liquid-glass-btn w-full sm:w-auto px-5 py-2.5 bg-[#C8102E] hover:bg-[#ff7236] text-black font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 shrink-0">
                    <Plus className="w-4 h-4" /> Save Encrypted Note
                  </button>
                </div>
              </form>
            </div>

            <div className={`${neuBase} ${neuShadow} rounded-3xl p-8 space-y-5`}>
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Saved Notes ({filteredNotes.length})</h4>
                <div className="relative w-48">
                  <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-zinc-500" />
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-8 pr-3 py-1.5 ${neuInput}`} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredNotes.map((note) => {
                  const isSelected = selectedNote === note.id;
                  return (
                    <div key={note.id} onClick={() => { setSelectedNote(note.id); setDecryptedText(null); }} className={`liquid-glass-btn p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[120px] ${isSelected ? 'bg-zinc-900 border-[#C8102E] shadow-lg' : 'bg-zinc-950/80 border-white/10 hover:border-zinc-700'}`}>
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h5 className="text-xs font-bold text-white truncate">{note.title}</h5>
                          {note.isEncrypted && <Lock className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2">{note.content}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[10px]">
                        <div className="flex gap-1 overflow-x-auto">
                          {note.tags.map((t) => <span key={t} className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">#{t}</span>)}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); showToast('Note Deleted', note.title, 'info'); }} className="liquid-glass-btn text-zinc-500 hover:text-rose-400 p-1"><Trash2 className="liquid-glass-btn w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedNote && (
                <div className={`p-5 ${neuInput} space-y-3 mt-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#C8102E]">Decryption Viewer</span>
                    <div className="flex gap-2">
                      <button onClick={handleSummarizeNote} disabled={aiLoading} className="liquid-glass-btn px-3 py-1.5 bg-red-600 text-white text-[11px] font-bold rounded-lg hover:bg-red-500 transition-all flex items-center gap-1"><Sparkles className="w-3 h-3" /> {aiLoading ? 'Processing...' : 'AI Summarize'}</button>
                      <button onClick={() => { const target = notes.find((n) => n.id === selectedNote); if (target) handleDecryptNote(target); }} disabled={decrypting} className="liquid-glass-btn px-3 py-1.5 bg-[#C8102E] text-black text-[11px] font-bold rounded-lg hover:bg-[#ff7236] transition-all">{decrypting ? 'Decrypting...' : 'Decrypt Payload'}</button>
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 min-h-[60px] whitespace-pre-wrap">{decryptedText || 'Press Decrypt Payload to unlock raw decrypted contents.'}</div>
                </div>
              )}

              {showAIAssistant && (
                <div className={`${neuBase} ${neuShadow} rounded-3xl p-6 space-y-4`}>
                  <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 bg-red-600/10 border border-red-500/30 rounded-xl text-red-400"><Bot className="w-5 h-5" /></span>
                      <div>
                        <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold">Independent AI</p>
                        <h3 className="text-base font-bold text-white">Brio Assistant</h3>
                      </div>
                    </div>
                    <button onClick={() => { setShowAIAssistant(false); setAiMessages([]); }} className="liquid-glass-btn text-zinc-500 hover:text-white">✕</button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {aiMessages.length === 0 && <p className="text-xs text-zinc-500 text-center py-4">Ask me anything or summarize your notes!</p>}
                    {aiMessages.map((msg, idx) => (
                      <div key={idx} className={`p-3 rounded-xl text-xs ${msg.role === 'user' ? 'bg-red-900/30 border border-red-500/20 text-red-100 ml-4' : 'bg-zinc-900 border border-white/10 text-zinc-200 mr-4'}`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))}
                    {aiLoading && <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl text-xs text-zinc-400">Thinking...</div>}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Ask Brio AI..." value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAISend()} className="flex-1 px-4 py-2.5 bg-zinc-900 border border-red-500/20 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-red-500" />
                    <button onClick={handleAISend} disabled={aiLoading || !aiInput.trim()} className="liquid-glass-btn px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"><Send className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Todos Tab */}
        {activeTab === 'todos' && (
          <div className={`${neuBase} ${neuShadow} rounded-3xl p-8 space-y-5`}>
            {SECTION_HEADER(<CheckSquare className="w-5 h-5" />, 'Encrypted Tasks', 'Action Queue', '#10b981')}
            <form onSubmit={handleAddTodoSubmit} className="space-y-4">
              <input type="text" placeholder="Add urgent task..." value={todoText} onChange={(e) => setTodoText(e.target.value)} className={neuInput + ' px-4 py-3'} />
              <div className="flex items-center gap-3">
                <select value={todoPriority} onChange={(e) => setTodoPriority(e.target.value as TodoItem['priority'])} className={`px-4 py-2.5 ${neuInput}`}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Priority</option>
                </select>
                <button type="submit" className="liquid-glass-btn flex-1 py-2.5 bg-[#C8102E] hover:bg-[#ff7236] text-black font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1"><Plus className="w-4 h-4" /> Add Task</button>
              </div>
            </form>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {todos.map((todo) => (
                <div key={todo.id} className={`liquid-glass-btn p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${todo.completed ? 'bg-zinc-950/50 border-white/5 opacity-60' : 'bg-zinc-900 border-white/10 hover:border-zinc-700'}`}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} className="w-4 h-4 rounded accent-[#C8102E] cursor-pointer shrink-0" />
                    <span className={`liquid-glass-btn text-sm font-medium truncate ${todo.completed ? 'line-through text-zinc-500' : 'text-white'}`}>{todo.task}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`liquid-glass-btn text-[9px] font-mono px-2.5 py-1 rounded-full font-bold uppercase ${todo.priority === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : todo.priority === 'high' ? 'bg-red-950 text-red-300 border border-red-500/30' : 'bg-zinc-800 text-zinc-400'}`}>{todo.priority}</span>
                    <button onClick={() => deleteTodo(todo.id)} className="liquid-glass-btn p-1 text-zinc-500 hover:text-rose-400"><Trash2 className="liquid-glass-btn w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sticky Notes Tab */}
        {activeTab === 'stickies' && (
          <div className={`${neuBase} ${neuShadow} rounded-3xl p-8 space-y-5`}>
            {SECTION_HEADER(<StickyNote className="w-5 h-5" />, 'Sticky Board', 'Quick Notes', '#eab308')}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stickyNotes.map((note) => (
                <div key={note.id} className={`p-4 rounded-2xl ${note.color} text-sm font-medium shadow-lg flex justify-between items-start relative group`}>
                  <span className="leading-relaxed">{note.text}</span>
                  <button onClick={() => setStickyNotes(prev => prev.filter(n => n.id !== note.id))} className="text-black/50 hover:text-black ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <input type="text" value={newStickyText} onChange={(e) => setNewStickyText(e.target.value)} placeholder="Add quick sticky note..." className={`flex-1 px-4 py-2.5 ${neuInput}`} />
              <button onClick={handleAddSticky} disabled={!newStickyText.trim()} className="liquid-glass-btn px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-xl transition-all disabled:opacity-50"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Text Editor Tab */}
        {activeTab === 'texteditor' && (
          <div className={`${neuBase} ${neuShadow} rounded-3xl p-8 space-y-5`}>
            {SECTION_HEADER(<Type className="w-5 h-5" />, 'Quick Text Editor', 'Draft', '#06b6d4')}
            <div className={`${neuInput} p-4 rounded-2xl min-h-[220px]`}>
              <textarea placeholder="Type your draft here..." value={editorText} onChange={(e) => setEditorText(e.target.value)} className="w-full bg-transparent border-none outline-none resize-none text-sm text-white placeholder-zinc-500 h-full min-h-[200px]" />
            </div>
            <div className="flex items-center gap-2">
              <button className="liquid-glass-btn p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-white/10 transition-all"><Bold className="w-3.5 h-3.5" /></button>
              <button className="liquid-glass-btn p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-white/10 transition-all"><Italic className="w-3.5 h-3.5" /></button>
              <button className="liquid-glass-btn p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-white/10 transition-all"><Underline className="w-3.5 h-3.5" /></button>
              <button className="liquid-glass-btn p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-white/10 transition-all"><List className="w-3.5 h-3.5" /></button>
              <button className="liquid-glass-btn p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-white/10 transition-all"><AlignLeft className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}

        {/* Spreadsheet Tab */}
        {activeTab === 'spreadsheet' && (
          <div className={`${neuBase} ${neuShadow} rounded-3xl p-8 space-y-5`}>
            {SECTION_HEADER(<Table className="w-5 h-5" />, 'Spreadsheet', 'Grid', '#10b981')}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2.5 bg-zinc-900 text-zinc-400 text-[10px] font-mono border border-zinc-800 w-10"></th>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <th key={i} className="p-2.5 bg-zinc-900 text-zinc-400 text-[10px] font-mono border border-zinc-800">{String.fromCharCode(65 + i)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }).map((_, r) => (
                    <tr key={r}>
                      <td className="p-2.5 bg-zinc-900 text-zinc-400 text-[10px] font-mono border border-zinc-800 text-center">{r + 1}</td>
                      {Array.from({ length: 6 }).map((_, c) => {
                        const cell = getCell(r + 1, c + 1);
                        const isSelected = selectedCell?.row === r + 1 && selectedCell?.col === c + 1;
                        return (
                          <td key={c} onClick={() => setSelectedCell({ row: r + 1, col: c + 1 })} className={`p-1.5 border border-zinc-800 cursor-pointer ${isSelected ? 'ring-2 ring-[#C8102E]' : ''}`}>
                            <input
                              type="text"
                              value={cell?.value || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateCell(r + 1, c + 1, { value: val.startsWith('=') ? val : val, formula: val.startsWith('=') ? val : '' });
                              }}
                              className="w-full bg-transparent text-xs text-white outline-none p-1.5"
                              placeholder=""
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedCell && (
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <span className="text-xs text-zinc-400 font-mono">Formula:</span>
                <input type="text" placeholder="=SUM(A1:B2)" className={`flex-1 px-4 py-2 ${neuInput}`} onKeyDown={(e) => { if (e.key === 'Enter' && selectedCell) { const val = (e.target as HTMLInputElement).value; updateCell(selectedCell.row, selectedCell.col, { value: evaluateFormula(val), formula: val }); } }} />
                <button onClick={() => { if (selectedCell) { const cell = getCell(selectedCell.row, selectedCell.col); if (cell?.formula) { updateCell(selectedCell.row, selectedCell.col, { value: evaluateFormula(cell.formula) }); } } }} className="liquid-glass-btn px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl">Apply</button>
              </div>
            )}
          </div>
        )}

        {/* Presentation Tab */}
        {activeTab === 'presentation' && (
          <div className={`${neuBase} ${neuShadow} rounded-3xl p-8 space-y-5`}>
            {SECTION_HEADER(<Presentation className="w-5 h-5" />, 'Presentation', 'Slides', '#a855f7')}
            <div className="flex items-center justify-center gap-6">
              <button onClick={prevSlide} disabled={currentSlideIndex === 0} className="liquid-glass-btn p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl border border-zinc-700 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
              <div className="flex-1 max-w-2xl aspect-video bg-zinc-900 rounded-3xl border border-zinc-800 p-8 flex flex-col items-center justify-center text-center shadow-inner">
                <h2 className="text-3xl font-bold text-white mb-4">{slides[currentSlideIndex]?.title}</h2>
                <p className="text-base text-zinc-300 whitespace-pre-wrap leading-relaxed">{slides[currentSlideIndex]?.content}</p>
              </div>
              <button onClick={nextSlide} disabled={currentSlideIndex === slides.length - 1} className="liquid-glass-btn p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl border border-zinc-700 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400 font-mono">Slide {currentSlideIndex + 1} of {slides.length}</span>
              <button onClick={addSlide} className="liquid-glass-btn px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-500 transition-all flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Slide</button>
            </div>
          </div>
        )}

        {/* Word Processor Tab */}
        {activeTab === 'wordprocessor' && (
          <div className={`${neuBase} ${neuShadow} rounded-3xl p-8 space-y-5`}>
            {SECTION_HEADER(<FileTextIcon className="w-5 h-5" />, 'Word Processor', 'Document', '#3b82f6')}
            <input type="text" placeholder="Document Title..." value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className={`w-full px-4 py-3 ${neuInput}`} />
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => document.execCommand('bold')} className="liquid-glass-btn p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-white/10 transition-all" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
              <button onClick={() => document.execCommand('italic')} className="liquid-glass-btn p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-white/10 transition-all" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
              <button onClick={() => document.execCommand('underline')} className="liquid-glass-btn p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-white/10 transition-all" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
              <button onClick={() => document.execCommand('formatBlock', false, 'h2')} className="liquid-glass-btn px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-white/10 transition-all text-xs font-bold" title="Heading">H</button>
              <button onClick={() => document.execCommand('insertUnorderedList')} className="liquid-glass-btn p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-white/10 transition-all" title="Bullet List"><List className="w-3.5 h-3.5" /></button>
            </div>
            <div
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => setDocContent((e.target as HTMLDivElement).innerHTML)}
              className={`${neuInput} p-5 rounded-2xl min-h-[320px] prose prose-invert max-w-none text-sm leading-relaxed`}
              dangerouslySetInnerHTML={{ __html: docContent }}
            />
          </div>
        )}

        {/* Notebook Tab */}
        {activeTab === 'notebook' && (
          <div className={`${neuBase} ${neuShadow} rounded-3xl p-8 space-y-5`}>
            {SECTION_HEADER(<BookOpen className="w-5 h-5" />, 'Notebook', 'Pages', '#6366f1')}
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))} disabled={currentPageIndex === 0} className="liquid-glass-btn p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl border border-zinc-700 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm text-zinc-400 font-mono">Page {currentPageIndex + 1} of {notebookPages.length}</span>
              <button onClick={() => setCurrentPageIndex((p) => Math.min(notebookPages.length - 1, p + 1))} disabled={currentPageIndex === notebookPages.length - 1} className="liquid-glass-btn p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl border border-zinc-700 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
            {notebookPages[currentPageIndex] && (
              <div className="space-y-4">
                <input type="text" value={notebookPages[currentPageIndex].title} onChange={(e) => setNotebookPages(prev => prev.map((p, i) => i === currentPageIndex ? { ...p, title: e.target.value } : p))} className={`w-full px-4 py-2.5 ${neuInput}`} />
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setNotebookPages(prev => prev.map((p, i) => i === currentPageIndex ? { ...p, content: (e.target as HTMLDivElement).innerHTML } : p))}
                  className={`${neuInput} p-5 rounded-2xl min-h-[280px] prose prose-invert max-w-none text-sm leading-relaxed`}
                  dangerouslySetInnerHTML={{ __html: notebookPages[currentPageIndex]?.content || '<p>Start writing...</p>' }}
                />
              </div>
            )}
          </div>
        )}

        {/* Publisher Tab */}
        {activeTab === 'publisher' && (
          <div className={`${neuBase} ${neuShadow} rounded-3xl p-8 space-y-5`}>
            {SECTION_HEADER(<LayoutTemplate className="w-5 h-5" />, 'Publisher', 'Layout', '#ec4899')}
            <div className="flex items-center gap-3">
              <button onClick={() => addPublisherElement('text')} className="liquid-glass-btn px-4 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-500 transition-all flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Text</button>
              <button onClick={() => addPublisherElement('image')} className="liquid-glass-btn px-4 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-500 transition-all flex items-center gap-1"><Image className="w-3.5 h-3.5" /> Image</button>
            </div>
            <div className="relative w-full h-[420px] bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-inner" onMouseMove={handlePublisherMouseMove} onMouseUp={handlePublisherMouseUp} onMouseLeave={handlePublisherMouseUp}>
              {publisherElements.map((el) => (
                <div
                  key={el.id}
                  onMouseDown={(e) => handlePublisherMouseDown(e, el.id)}
                  className={`absolute cursor-move rounded-2xl border-2 ${draggingId === el.id ? 'border-red-500 shadow-lg' : 'border-zinc-700'} bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center text-xs text-white p-3 shadow-md`}
                  style={{ left: el.x, top: el.y, width: el.width, height: el.height }}
                >
                  {el.type === 'text' ? (
                    <input type="text" value={el.content} onChange={(e) => setPublisherElements(prev => prev.map(item => item.id === el.id ? { ...item, content: e.target.value } : item))} className="bg-transparent border-none outline-none text-center w-full text-xs" />
                  ) : (
                    <img src={el.content} alt="Publisher" className="w-full h-full object-cover rounded-xl" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Viewer Tab */}
        {activeTab === 'pdfviewer' && (
          <div className={`${neuBase} ${neuShadow} rounded-3xl p-8 space-y-5`}>
            {SECTION_HEADER(<FileType2 className="w-5 h-5" />, 'PDF Viewer', 'Annotate', '#f43f5e')}
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { id: 'select', icon: <MousePointer2 className="w-4 h-4" />, label: 'Select' },
                { id: 'pen', icon: <PenTool className="w-4 h-4" />, label: 'Pen' },
                { id: 'highlighter', icon: <Highlighter className="w-4 h-4" />, label: 'Highlighter' },
                { id: 'text', icon: <Type className="w-4 h-4" />, label: 'Text' },
                { id: 'stamp', icon: <Stamp className="w-4 h-4" />, label: 'Stamp' },
              ].map((tool) => (
                <button key={tool.id} onClick={() => setPdfTool(tool.id as any)} className={`liquid-glass-btn px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${pdfTool === tool.id ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}>
                  {tool.icon} {tool.label}
                </button>
              ))}
              <input type="color" value={pdfColor} onChange={(e) => setPdfColor(e.target.value)} className="w-9 h-9 rounded-xl cursor-pointer border border-zinc-700" />
            </div>
            <div className="relative w-full h-[520px] bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-inner">
              {pdfFile ? (
                <canvas
                  ref={canvasRef}
                  className="w-full h-full cursor-crosshair"
                  onMouseDown={handlePdfCanvasMouseDown}
                  onMouseMove={handlePdfCanvasMouseMove}
                  onMouseUp={handlePdfCanvasMouseUp}
                  onMouseLeave={handlePdfCanvasMouseUp}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">Load a PDF file to begin annotating</div>
              )}
            </div>
            {pdfAnnotations.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">{pdfAnnotations.length} annotations</span>
                <button onClick={() => exportDocument('annotations.json', JSON.stringify(pdfAnnotations, null, 2), 'application/json')} className="liquid-glass-btn px-4 py-2 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl hover:bg-zinc-700 transition-all">Save Annotations</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
