/**
 * StickersVault Component: Encrypted Sticker Storage & Pack Manager
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StickerItem } from '../../types';
import { Smile, Plus, Copy, Check, ShieldCheck } from 'lucide-react';

export const StickersVault: React.FC = () => {
  const { stickers, addSticker, showToast } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newStickerName, setNewStickerName] = useState('');
  const [newStickerCategory, setNewStickerCategory] = useState<StickerItem['category']>('Aviation');
  const [newStickerData, setNewStickerData] = useState('');

  const handleCopy = (sticker: StickerItem) => {
    navigator.clipboard.writeText(sticker.dataUrl);
    setCopiedId(sticker.id);
    showToast('Sticker Copied', `Copied ${sticker.name} to clipboard.`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStickerName.trim() || !newStickerData.trim()) return;
    try {
      await addSticker(newStickerName, newStickerCategory, newStickerData);
      setNewStickerName('');
      setNewStickerData('');
    } catch (err) {
      showToast('Sticker Save Error', String(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Encrypted Stickers Vault</h3>
            <p className="text-xs text-slate-400">Store and deploy custom SVG/Emoji/Image stickers across Brio messaging</p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" /> AES-256 Vault Stored
        </span>
      </div>

      {/* Add New Sticker Form */}
      <form onSubmit={handleAdd} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Sticker Name</label>
          <input
            type="text"
            required
            value={newStickerName}
            onChange={(e) => setNewStickerName(e.target.value)}
            placeholder="e.g. Jet Engine Icon"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
          <select
            value={newStickerCategory}
            onChange={(e) => setNewStickerCategory(e.target.value as StickerItem['category'])}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="Aviation">Aviation</option>
            <option value="Cyber">Cyber</option>
            <option value="Anime">Anime</option>
            <option value="Emoji">Emoji</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Emoji / Image URL / SVG</label>
          <input
            type="text"
            required
            value={newStickerData}
            onChange={(e) => setNewStickerData(e.target.value)}
            placeholder="e.g. 🚀 or https://..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="liquid-glass-btn w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Vault</span>
          </button>
        </div>
      </form>

      {/* Sticker Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {stickers.map((st) => (
          <div
            key={st.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 shadow-xl flex flex-col items-center justify-between text-center transition-all group"
          >
            <div className="w-16 h-16 rounded-xl bg-slate-950 flex items-center justify-center text-3xl shadow-inner mb-3 group-hover:scale-110 transition-transform">
              {st.dataUrl.startsWith('http') ? (
                <img src={st.dataUrl} alt={st.name} className="w-12 h-12 object-contain" />
              ) : (
                <span>{st.dataUrl}</span>
              )}
            </div>

            <div className="w-full mb-2">
              <h4 className="text-xs font-bold text-white truncate">{st.name}</h4>
              <p className="text-[10px] text-cyan-400 font-mono">{st.category}</p>
            </div>

            <button
              onClick={() => handleCopy(st)}
              className="liquid-glass-btn w-full py-1.5 bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white text-[11px] font-semibold rounded-xl transition-all flex items-center justify-center gap-1"
            >
              {copiedId === st.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="liquid-glass-btn w-3.5 h-3.5" />}
              <span>{copiedId === st.id ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
