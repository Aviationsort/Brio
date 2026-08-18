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
      <div className="relative w-full max-w-md aero-panel p-6 shadow-2xl text-slate-800 overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/40 border border-white/60 text-blue-700 shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-wide text-blue-900 drop-shadow-sm">
                {isSignUp ? t.createEncryptedAccount : t.easyLoginUnlock}
              </h3>
              <p className="text-xs text-blue-700/80 font-medium">
                {t.aesGCM256Cryptography}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`skeuo-button p-1.5 rounded-lg text-white ${authRequired ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={authRequired}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-blue-900 mb-1 drop-shadow-sm">{t.usernameOperatorCall}</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. CaptainVance or BrioAgent"
              className="w-full px-3.5 py-2.5 flash-panel text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-blue-900 mb-1 drop-shadow-sm">{t.emailAddressOptional}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@brio.vault"
                className="w-full px-3.5 py-2.5 flash-panel text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-blue-900 mb-1 drop-shadow-sm">
              {t.vaultMasterPassphrasePBKDF2}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-blue-600" />
              <input
                type="password"
                required
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder={t.enterMasterSecretPassphrase}
                className="w-full pl-9 pr-3.5 py-2.5 flash-panel text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium"
              />
            </div>
            <p className="text-[11px] text-blue-700/90 mt-1 flex items-center gap-1 font-medium">
              {t.passphraseGeneratesClientSideKey}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="skeuo-button w-full py-3 text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
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
              className="text-xs text-blue-700 hover:underline font-semibold hover:text-blue-900 transition-colors"
            >
              {isSignUp ? t.alreadyHavePassphrase : t.firstTimeCreateNewVault}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
