import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plane,
  Moon,
  Sun,
  Cpu,
  Activity,
  Zap,
  HardDrive,
  CloudRain,
  Plus,
  X,
  Save,
  Camera,
} from 'lucide-react';

interface SidebarProps {
  onHome: () => void;
  onOpenOverlay: (overlay: 'WEATHER' | 'SETTINGS' | 'ACCOUNT' | 'HELP') => void;
  user?: { username?: string; avatarUrl?: string } | null;
  onClose?: () => void;
}

const StatRow = React.memo(({ icon, label, value, title }: { icon: React.ReactNode; label: string; value: React.ReactNode; title?: string }) => (
  <div className="sidebar-stat-row w-full" title={title}>
    <div className="sidebar-stat-label">{icon}<span className="text-[9px]">{label}</span></div>
    <span className="sidebar-stat-value">{value}</span>
  </div>
));
StatRow.displayName = 'StatRow';

export const Sidebar: React.FC<SidebarProps> = React.memo(({ onHome, onOpenOverlay, user, onClose }) => {
  const { telemetry, showToast } = useApp();
  const [quickNote, setQuickNote] = useState('');
  const [showQuickNote, setShowQuickNote] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const cpuPercent = useMemo(() => Math.min(100, Math.max(0, telemetry.cpuUsage ?? 14)), [telemetry.cpuUsage]);
  const ramPercent = useMemo(() => Math.min(100, Math.max(0, telemetry.ramUsagePercent ?? 20)), [telemetry.ramUsagePercent]);
  const batteryLevel = useMemo(() => Math.min(100, Math.max(0, telemetry.batteryLevel ?? 85)), [telemetry.batteryLevel]);
  const batteryCharging = useMemo(() => telemetry.batteryCharging ?? false, [telemetry.batteryCharging]);
  const storagePercent = useMemo(() => {
    const used = telemetry.storageUsedMb ?? 62;
    const totalGb = Math.max(1, telemetry.romTotalGb ?? 256);
    return Math.min(100, Math.round((used / (totalGb * 1024)) * 100));
  }, [telemetry.storageUsedMb, telemetry.romTotalGb]);

  const handleQuickNoteSave = useCallback(() => {
    if (!quickNote.trim()) return;
    showToast('Quick Note', 'Note saved locally', 'success');
    setQuickNote('');
    setShowQuickNote(false);
  }, [quickNote, showToast]);

  const getBatteryColor = useCallback(() => {
    if (batteryLevel > 60) return 'text-emerald-400';
    if (batteryLevel > 30) return 'text-amber-400';
    return 'text-red-400';
  }, [batteryLevel]);

  const statColor = useCallback((value: number, thresholds = [80, 50]) => {
    if (value > thresholds[0]) return 'text-red-400';
    if (value > thresholds[1]) return 'text-amber-400';
    return 'text-emerald-400';
  }, []);

  return (
    <aside className="relative z-10 flex flex-col items-center gap-3 w-16 sm:w-20 py-4 shrink-0 border-r border-white/10 bg-black/50 rounded-l-2xl skeuo-inset-panel lg:rounded-l-2xl rounded-r-2xl lg:rounded-r-none">
      {onClose && (
        <button onClick={onClose} className="lg:hidden absolute top-2 right-2 p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer" aria-label="Close menu">
          <X className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={onHome}
        title="Home"
        aria-label="Back to Home"
        className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 to-red-800 border border-red-400/40 shadow-[0_0_16px_rgba(200,16,46,0.5)] skeuo-btn cursor-pointer transition-all hover:scale-105 active:scale-95"
      >
        <Plane className="w-5 h-5 text-white" />
        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full skeuo-led-dot--green animate-pulse" />
      </button>

      <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-1" />

      <div className="flex flex-col items-center gap-1.5 px-2 w-full space-y-1">
        <StatRow icon={<Cpu className="w-3.5 h-3.5" />} label="CPU" value={<span className={statColor(cpuPercent)}>{cpuPercent}%</span>} title={`CPU: ${cpuPercent}%`} />
        <StatRow icon={<Activity className="w-3.5 h-3.5" />} label="RAM" value={<span className={statColor(ramPercent)}>{ramPercent}%</span>} title={`RAM: ${ramPercent}%`} />
        <StatRow icon={batteryCharging ? <Zap className="w-3.5 h-3.5 text-amber-400" /> : <Zap className="w-3.5 h-3.5" />} label="Batt" value={<span className={getBatteryColor()}>{batteryLevel}%</span>} title={`Battery: ${batteryLevel}%${batteryCharging ? ' (Charging)' : ''}`} />
        <StatRow icon={<HardDrive className="w-3.5 h-3.5" />} label="Disk" value={<span className={statColor(storagePercent, [85, 70])}>{storagePercent}%</span>} title={`Storage: ${storagePercent}% used`} />
      </div>

      <div className="w-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-1" />

      <div className="flex flex-col items-center gap-2 px-2 w-full flex-1 overflow-y-auto skeuo-scrollbar">
        <button onClick={() => onOpenOverlay('WEATHER')} className="sidebar-toggle w-full rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white" style={{ width: '100%', height: '2.25rem', borderRadius: '0.5rem' }} title="Weather">
          <CloudRain className="w-4 h-4 text-sky-400" />
          <span className="text-[8px] font-mono font-bold uppercase">Weather</span>
        </button>

        <button onClick={() => setShowQuickNote(!showQuickNote)} className="sidebar-toggle w-full rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white" style={{ width: '100%', height: '2.25rem', borderRadius: '0.5rem' }} title="Quick Note">
          {showQuickNote ? <X className="w-4 h-4 text-red-400" /> : <Plus className="w-4 h-4 text-emerald-400" />}
          <span className="text-[8px] font-mono font-bold uppercase">Note</span>
        </button>

        {showQuickNote && (
          <div className="w-full p-2 skeuo-inset-panel rounded-lg space-y-1.5 animate-slideIn">
            <textarea ref={noteRef} value={quickNote} onChange={(e) => setQuickNote(e.target.value)} placeholder="Quick note..." className="w-full bg-transparent border border-white/10 rounded-md px-2 py-1 text-[10px] text-white placeholder:text-zinc-500 outline-none resize-none font-mono" rows={2} />
            <button onClick={handleQuickNoteSave} className="w-full skeuo-btn-primary py-1 rounded-md text-[9px] font-bold cursor-pointer">Save</button>
          </div>
        )}

        <button onClick={() => onOpenOverlay('SETTINGS')} className="sidebar-toggle w-full rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white" style={{ width: '100%', height: '2.25rem', borderRadius: '0.5rem' }} title="Settings">
          <Save className="w-4 h-4 text-purple-400" />
          <span className="text-[8px] font-mono font-bold uppercase">Settings</span>
        </button>
      </div>

      <div className="mt-auto pt-2 flex flex-col items-center gap-2 w-full px-2">
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        {user ? (
          <button onClick={() => onOpenOverlay('ACCOUNT')} className="sidebar-user-card" title="Account">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username || 'User'} className="w-9 h-9 rounded-full object-cover border-2 border-red-400/40 shadow-[0_0_12px_rgba(200,16,46,0.4)]" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-red-800 border-2 border-red-400/40 flex items-center justify-center text-white font-black text-sm shadow-[0_0_12px_rgba(200,16,46,0.4)]">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate max-w-full px-1">{user.username || 'User'}</span>
          </button>
        ) : (
          <button onClick={() => onOpenOverlay('ACCOUNT')} className="sidebar-user-card" title="Sign In">
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Guest</span>
          </button>
        )}
        <div className="skeuo-led items-center gap-1">
          <span className="skeuo-led-dot--green" style={{ width: '0.4rem', height: '0.4rem' }} />
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">IFE</span>
        </div>
      </div>
    </aside>
  );
});
Sidebar.displayName = 'Sidebar';
