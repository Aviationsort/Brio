/**
 * AuthModal - Login / Sign Up only
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Lock, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginUser, user, showToast, authRequired, t } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (authRequired) {
      showToast(t.authRequired, t.pleaseSignIn, 'warning');
      return;
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !passphrase.trim()) {
      showToast('Validation Failed', 'Please provide a username and passphrase.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const success = await loginUser(username, email || `${username.toLowerCase()}@brio.vault`, passphrase);
      if (success) {
        onClose();
      }
    } catch (err) {
      showToast(t.encryptionError, String(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-wide">
                {isSignUp ? t.createEncryptedAccount : t.easyLoginUnlock}
              </h3>
              <p className="text-xs text-slate-400">
                {t.aesGCM256Cryptography}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`liquid-glass-btn p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${authRequired ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={authRequired}
          >
            <X className="liquid-glass-btn w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">{t.usernameOperatorCall}</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. CaptainVance or BrioAgent"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">{t.emailAddressOptional}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@brio.vault"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t.vaultMasterPassphrasePBKDF2}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder={t.enterMasterSecretPassphrase}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              {t.passphraseGeneratesClientSideKey}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="liquid-glass-btn w-full py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-4 h-4" />
                {isSignUp ? t.createEncryptedVault : t.unlockBrioVault}
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="liquid-glass-btn text-xs text-cyan-400 hover:underline"
            >
              {isSignUp ? t.alreadyHavePassphrase : t.firstTimeCreateNewVault}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
