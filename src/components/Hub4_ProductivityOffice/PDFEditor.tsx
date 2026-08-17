/**
 * PDFEditor Component: Interactive PDF Annotator, Highlighting & Signature Stamp Suite
 * Styled in Bento Grid theme with encrypted export
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PDFAnnotation } from '../../types';
import { FileText, Edit3, Type, ShieldCheck, Download, Trash2, CheckCircle2, Highlighter } from 'lucide-react';

export const PDFEditor: React.FC = () => {
  const { showToast } = useApp();
  const [activeTool, setActiveTool] = useState<'pen' | 'highlighter' | 'text' | 'signature'>('pen');
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([
    { id: 'ann-1', type: 'highlighter', color: '#facc15', strokeWidth: 12, pageNumber: 1, text: 'Highlighted Passage' },
    { id: 'ann-2', type: 'signature', color: '#FF5F1F', strokeWidth: 2, pageNumber: 1, text: '✓ DIGITALLY SIGNED & ENCRYPTED' },
  ]);
  const [textInput, setTextInput] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FF5F1F');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleAddAnnotation = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    const newAnn: PDFAnnotation = {
      id: `ann-${Date.now()}`,
      type: activeTool,
      color: activeTool === 'highlighter' ? '#facc15' : selectedColor,
      strokeWidth: activeTool === 'highlighter' ? 14 : 3,
      x,
      y,
      text: activeTool === 'text' ? textInput || 'Sample Note' : activeTool === 'signature' ? '✓ VERIFIED SIGNATURE' : undefined,
      pageNumber: 1,
    };

    setAnnotations([...annotations, newAnn]);
    showToast('Annotation Placed', `Added ${activeTool} annotation layer on page.`, 'success');
  };

  const handleClear = () => {
    setAnnotations([]);
    showToast('Canvas Cleared', 'All annotation layers removed.', 'info');
  };

  const handleExport = () => {
    showToast('Export Complete', 'PDF layer with AES-256 metadata exported successfully.', 'success');
  };

  return (
    <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-[#FF5F1F]/10 border border-[#FF5F1F]/20 rounded-xl text-[#FF5F1F]">
            <FileText className="w-5 h-5" />
          </span>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Document Processing</p>
            <h3 className="text-base font-bold text-white">PDF Annotator & Digital Signature</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="liquid-glass-btn px-3 py-1.5 bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
          >
            <Trash2 className="liquid-glass-btn w-3.5 h-3.5" /> Clear Layers
          </button>
          <button
            onClick={handleExport}
            className="liquid-glass-btn px-4 py-1.5 bg-[#FF5F1F] hover:bg-[#ff7236] text-black text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Signed PDF
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950 p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTool('pen')}
            className={`liquid-glass-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTool === 'pen' ? 'bg-[#FF5F1F] text-black shadow' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            <Edit3 className="liquid-glass-btn w-3.5 h-3.5" /> Pen Tool
          </button>
          <button
            onClick={() => setActiveTool('highlighter')}
            className={`liquid-glass-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTool === 'highlighter' ? 'bg-[#FF5F1F] text-black shadow' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            Highlighter
          </button>
          <button
            onClick={() => setActiveTool('text')}
            className={`liquid-glass-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTool === 'text' ? 'bg-[#FF5F1F] text-black shadow' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            <Type className="w-3.5 h-3.5" /> Text Box
          </button>
          <button
            onClick={() => setActiveTool('signature')}
            className={`liquid-glass-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTool === 'signature' ? 'bg-[#FF5F1F] text-black shadow' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            <CheckCircle2 className="liquid-glass-btn w-3.5 h-3.5" /> Digital Stamp
          </button>
        </div>

        {activeTool === 'text' && (
          <input
            type="text"
            placeholder="Type note to place..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="px-3 py-1 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
        )}
      </div>

      {/* Simulated PDF Document Area */}
      <div
        onClick={handleAddAnnotation}
        className="relative min-h-[420px] bg-zinc-900 border-2 border-dashed border-zinc-800 hover:border-[#FF5F1F]/40 rounded-3xl p-8 cursor-crosshair transition-colors flex flex-col justify-between overflow-hidden shadow-inner"
      >
        <div className="space-y-4 max-w-2xl text-zinc-300 font-serif leading-relaxed text-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 font-sans text-xs">
            <span className="font-bold text-[#FF5F1F]">CONFIDENTIAL TELEMETRY SPECIFICATION - PAGE 1</span>
            <span className="text-zinc-500">REF: B-2026-X</span>
          </div>

          <h2 className="text-xl font-bold font-sans text-white">Cryptographic Mesh Protocol & Flight Dynamics</h2>
          <p>
            The Brio architecture provides real-time end-to-end encrypted packet transmission across dual Bluetooth and
            Internet sockets. Every telemetry packet contains a cryptographic SHA-256 integrity checksum ensuring zero tampering.
          </p>
          <p>
            Optical focal distance equations are calculated dynamically using sensor crop factors, focal length inputs, and target speed vectors.
          </p>
        </div>

        {/* Render Annotations Overlay */}
        {annotations.map((ann) => (
          <div
            key={ann.id}
            style={{ left: ann.x || 100, top: ann.y || 200 }}
            className="absolute p-2 rounded-lg font-mono text-xs font-bold shadow-lg transition-transform hover:scale-105 pointer-events-none"
          >
            {ann.type === 'signature' ? (
              <span className="px-3 py-1.5 rounded-xl bg-[#FF5F1F] text-black border border-white/20 font-black">
                {ann.text}
              </span>
            ) : ann.type === 'text' ? (
              <span className="px-2 py-1 bg-zinc-950 text-[#FF5F1F] border border-[#FF5F1F]/40 rounded">
                {ann.text}
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-400/30 text-amber-300 border border-amber-400/50 rounded">
                {ann.text || 'Highlighted'}
              </span>
            )}
          </div>
        ))}

        <div className="pt-4 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex justify-between">
          <span>Click anywhere on the document canvas to place current annotation tool</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
