/**
 * AuthModal - Login / Sign Up with liquid glass UI
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Shield, Lock, X, Eye, EyeOff, CheckCircle2, AlertTriangle, Download, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginUser, signupUser, user, showToast, authRequired } = useApp();
  const { theme, cycleTheme } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const passphraseStrength = (() => {
    if (!passphrase) return { score: 0, label: '', color: '' };
    let score = 0;
    if (passphrase.length >= 6) score++;
    if (passphrase.length >= 10) score++;
    if (/[A-Z]/.test(passphrase)) score++;
    if (/[0-9]/.test(passphrase)) score++;
    if (/[^A-Za-z0-9]/.test(passphrase)) score++;
    if (score <= 1) return { score, label: 'Weak', color: 'text-red-400' };
    if (score <= 3) return { score, label: 'Fair', color: 'text-red-300' };
    return { score, label: 'Strong', color: 'text-red-200' };
  })();

  const validate = (): boolean => {
    setValidationError(null);
    if (!username.trim() || !passphrase.trim()) {
      setValidationError('Username and passphrase are required.');
      return false;
    }
    if (username.trim().length < 3) {
      setValidationError('Username must be at least 3 characters.');
      return false;
    }
    if (passphrase.length < 6) {
      setValidationError('Passphrase must be at least 6 characters.');
      return false;
    }
    if (isSignUp && passphrase !== confirmPassphrase) {
      setValidationError('Passphrases do not match.');
      return false;
    }
    return true;
  };

  const handleClose = () => {
    if (authRequired) {
      showToast('Auth Required', 'Please sign in to continue.', 'warning');
      return;
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Validation Failed', validationError || 'Please check your input.', 'warning');
      return;
    }
    setLoading(true);
    try {
      let success = false;
      if (isSignUp) {
        success = await signupUser(username, email || `${username.toLowerCase()}@brio.vault`, passphrase);
        if (success) {
          setPassphrase('');
          setConfirmPassphrase('');
          setValidationError(null);
        }
      } else {
        success = await loginUser(username, passphrase);
        if (success) {
          setPassphrase('');
          setValidationError(null);
          onClose();
        }
      }
    } catch (err) {
      showToast('Error', String(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp((prev) => !prev);
    setValidationError(null);
    setConfirmPassphrase('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
      <div 
        className="relative w-full max-w-md rounded-[28px] p-8 shadow-2xl text-slate-200 overflow-hidden aero-glossy aero-panel"
        style={{
          background: `linear-gradient(135deg, ${theme.bgSecondary}ee, ${theme.bgTertiary}ee)`,
          border: `1px solid ${theme.glassBorder}`,
          boxShadow: `0 30px 60px -12px ${theme.shadow}, 0 0 0 1px ${theme.border}, 0 0 40px ${theme.accentGlow}`,
          backdropFilter: 'blur(28px)',
        }}
      >
        {/* Ambient glow */}
        <div 
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: theme.accentGlow }}
        />
        <div 
          className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: theme.accentGlow, opacity: 0.5 }}
        />

        {/* Theme selector & close */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b ife-status-bar" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2.5">
            <div 
              className="p-2 rounded-xl border shadow-inner"
              style={{ 
                background: `${theme.accent}20`,
                borderColor: `${theme.accent}40`,
                color: theme.accent,
              }}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-wide drop-shadow-sm" style={{ color: theme.textPrimary }}>
                {isSignUp ? 'Create Encrypted Vault' : 'Unlock Vault'}
              </h3>
              <p className="text-xs font-medium" style={{ color: `${theme.accent}cc` }}>
                {isSignUp ? 'One vault for all your data' : 'Enter your passphrase to unlock'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={cycleTheme}
              className="p-1.5 rounded-lg transition-all hover:rotate-180 duration-500"
              style={{ color: theme.textSecondary }}
              title="Cycle theme"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className={`p-1.5 rounded-lg transition-colors ${authRequired ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ color: theme.textSecondary }}
              disabled={authRequired}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 mt-6 space-y-5">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. CaptainVance"
              className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none aero-input"
              style={{
                background: theme.bgTertiary,
                border: `1px solid ${theme.border}`,
                color: theme.textPrimary,
                boxShadow: `inset 0 2px 4px ${theme.shadow}`,
              }}
              minLength={3}
            />
          </div>

          {/* Email (signup only) */}
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@brio.vault"
                className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                style={{
                  background: theme.bgTertiary,
                  border: `1px solid ${theme.border}`,
                  color: theme.textPrimary,
                  boxShadow: `inset 0 2px 4px ${theme.shadow}`,
                }}
              />
            </div>
          )}

          {/* Passphrase */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>
              Master Passphrase
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4" style={{ color: theme.accent }} />
                <input
                  type={showPassphrase ? 'text' : 'password'}
                  required
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter your master passphrase"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all outline-none aero-input"
                  style={{
                    background: theme.bgTertiary,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary,
                    boxShadow: `inset 0 2px 4px ${theme.shadow}`,
                  }}
                  minLength={6}
                />
              <button
                type="button"
                onClick={() => setShowPassphrase((prev) => !prev)}
                className="absolute right-3 top-3 transition-colors"
                style={{ color: theme.accent }}
                tabIndex={-1}
              >
                {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passphrase.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div 
                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ background: theme.bgTertiary }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(passphraseStrength.score / 5) * 100}%`,
                      backgroundColor: passphraseStrength.score <= 1 ? theme.error : passphraseStrength.score <= 3 ? theme.warning : theme.success,
                    }}
                  />
                </div>
                <span className={`text-[10px] font-bold font-mono ${passphraseStrength.color}`}>
                  {passphraseStrength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Passphrase (signup only) */}
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>
                Confirm Passphrase
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4" style={{ color: theme.accent }} />
                <input
                  type={showPassphrase ? 'text' : 'password'}
                  required
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="Confirm your master passphrase..."
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all outline-none aero-input"
                  style={{
                    background: theme.bgTertiary,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary,
                    boxShadow: `inset 0 2px 4px ${theme.shadow}`,
                  }}
                  minLength={6}
                />
                {confirmPassphrase.length > 0 && (
                  <div className="absolute right-3 top-3">
                    {passphrase === confirmPassphrase ? (
                      <CheckCircle2 className="w-4 h-4" style={{ color: theme.success }} />
                    ) : (
                      <AlertTriangle className="w-4 h-4" style={{ color: theme.error }} />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Validation error */}
          {validationError && (
            <div 
              className="p-3 rounded-xl border text-xs font-medium flex items-center gap-2"
              style={{ 
                background: `${theme.error}18`,
                borderColor: `${theme.error}50`,
                color: theme.error,
                boxShadow: `0 0 20px ${theme.error}25`,
              }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {validationError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 font-extrabold disabled:opacity-50 active:scale-[0.97] wiiu-btn"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
              color: theme.buttonText,
              boxShadow: `0 14px 32px ${theme.accentGlow}`,
            }}
          >
            {loading ? (
              <div 
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: theme.buttonText, borderTopColor: 'transparent' }}
              />
            ) : (
              <>
                <Shield className="w-4 h-4" />
                {isSignUp ? 'Create Vault' : 'Unlock Vault'}
              </>
            )}
          </button>

          {/* Toggle mode */}
          <div className="pt-1 text-center space-y-1">
            <button
              type="button"
              onClick={switchMode}
              className="text-xs font-semibold transition-colors"
              style={{ color: theme.accent }}
            >
              {isSignUp ? 'Already have a vault? Login' : 'First time? Create new vault'}
            </button>
            <p className="text-[10px]" style={{ color: theme.textSecondary }}>
              {isSignUp
                ? 'Your vault is stored locally and encrypted. You can export a .db backup anytime.'
                : 'Your vault is stored locally and encrypted. Without your passphrase it cannot be unlocked.'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
