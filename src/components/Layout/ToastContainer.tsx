/**
 * Toast Notification Container with Error Handling & Feedback
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = 'border-red-500/30 bg-red-950/80 text-red-200';
        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-red-400/30 bg-red-900/80 text-red-100';
        } else if (toast.type === 'error') {
          Icon = ShieldAlert;
          borderClass = 'border-red-800/30 bg-[#8B0000]/80 text-red-100';
        } else if (toast.type === 'warning') {
          Icon = AlertCircle;
          borderClass = 'border-red-600/30 bg-red-950/80 text-red-200';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-3 ife-card ${borderClass}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-wide leading-snug">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs opacity-85 mt-0.5 leading-relaxed break-words">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ife-btn p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
