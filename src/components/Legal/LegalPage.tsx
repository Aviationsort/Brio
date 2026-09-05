import React, { useState } from 'react';
import { X, FileText, Shield } from 'lucide-react';
import { TermsOfUse } from './TermsOfUse';
import { PrivacyPolicy } from './PrivacyPolicy';

interface LegalPageProps {
  onClose: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl skeuo-inset-panel p-0 text-white  animate-slideIn flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-red-400">
            <Shield className="w-6 h-6" />
            <h2 className="text-xl font-bold uppercase tracking-wider">Legal</h2>
          </div>
          <button
            onClick={onClose}
            className="skeuo-btn p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex shrink-0 border-b border-white/10">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 ${
              activeTab === 'terms'
                ? 'text-white bg-white/10 border-b-2 border-red-500'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            Terms of Use
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 ${
              activeTab === 'privacy'
                ? 'text-white bg-white/10 border-b-2 border-red-500'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            Privacy Policy
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto skeuo-scrollbar p-5 sm:p-6">
          {activeTab === 'terms' && <TermsOfUse />}
          {activeTab === 'privacy' && <PrivacyPolicy />}
        </div>
      </div>
    </div>
  );
};
