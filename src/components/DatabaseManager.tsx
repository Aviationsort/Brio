import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Download,
  Upload,
  HardDrive,
  Clock,
  ShieldCheck,
  FileDown,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface DatabaseManagerProps {
  isOpen: boolean;
  onClose: () => void;
  compact?: boolean;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ isOpen, onClose, compact = false }) => {
  const { databaseSize, lastBackupTime, exportDatabase, importDatabase, backupDatabase, restoreDatabase, showToast } = useApp();
  const [importing, setImporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const restoreInputRef = useRef<HTMLInputElement | null>(null);

  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const success = await importDatabase(file);
      if (success) {
        showToast('Import Complete', 'Database imported. Restarting in 3 seconds...', 'success');
        setTimeout(() => window.location.reload(), 3000);
      }
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = '';
    }
  }, [importDatabase, showToast]);

  const handleRestore = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoring(true);
    try {
      const success = await restoreDatabase(file);
      if (success) {
        showToast('Restore Complete', 'Database restored. Restarting in 3 seconds...', 'success');
        setTimeout(() => window.location.reload(), 3000);
      }
    } finally {
      setRestoring(false);
      if (restoreInputRef.current) restoreInputRef.current.value = '';
    }
  }, [restoreDatabase, showToast]);

  const handleBackup = useCallback(async () => {
    setBackingUp(true);
    try {
      await backupDatabase();
    } finally {
      setBackingUp(false);
    }
  }, [backupDatabase]);

  const handleExport = useCallback(async () => {
    await exportDatabase();
  }, [exportDatabase]);

  if (!isOpen) return null;

  const lastBackup = lastBackupTime ? new Date(lastBackupTime).toLocaleString() : 'Never';

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400">
            <HardDrive className="w-6 h-6" />
            <h2 className="text-lg font-bold">Database Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="liquid-glass-btn p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
          >
            <span className="text-lg">×</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <HardDrive className="w-4 h-4" />
            <span>Database Storage</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Current Size</span>
            <span className="text-sm font-black text-white font-mono">{formatBytes(databaseSize)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Last Backup</span>
            <span className="text-xs text-emerald-400 font-mono">{lastBackup}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
            <ShieldCheck className="w-3 h-3" />
            <span>AES-256-GCM encrypted .db file format</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            disabled={backingUp || restoring || importing}
            className="liquid-glass-btn py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            <span>Export .db</span>
          </button>

          <button
            onClick={handleBackup}
            disabled={backingUp || restoring || importing}
            className="liquid-glass-btn py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {backingUp ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Backup Now</span>
              </>
            )}
          </button>

          <button
            onClick={() => importInputRef.current?.click()}
            disabled={backingUp || restoring || importing}
            className="liquid-glass-btn py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {importing ? (
              <span className="animate-pulse">Importing...</span>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Import .db</span>
              </>
            )}
          </button>

          <button
            onClick={() => restoreInputRef.current?.click()}
            disabled={backingUp || restoring || importing}
            className="liquid-glass-btn py-3 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {restoring ? (
              <span className="animate-pulse">Restoring...</span>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Restore Backup</span>
              </>
            )}
          </button>
        </div>

        <input
          ref={importInputRef}
          type="file"
          accept=".db"
          onChange={handleImport}
          className="hidden"
        />
        <input
          ref={restoreInputRef}
          type="file"
          accept=".db"
          onChange={handleRestore}
          className="hidden"
        />

        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[10px] text-amber-200 font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Database Portability</p>
            <p className="mt-1">
              Export creates an encrypted .db file. Import replaces current data. Always backup before importing.
              Integrity checksum verified on load.
            </p>
          </div>
        </div>

        {compact && (
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
            <Clock className="w-3 h-3" />
            <span>Last backup: {lastBackup}</span>
          </div>
        )}
      </div>
    </div>
  );
};
