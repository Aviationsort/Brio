/**
 * AuthModal — Login / Sign Up (red · grey · black edition, Flash/Nightcore)
 *
 * Improved glassmorphic styling, password strength indicator with 5-segment bar,
 * show/hide password toggles, specific error guidance, loading states, smoother
 * mode transitions, and a simulated "Forgot Passphrase" recovery flow.
 *
 * Strict tri-color palette (red, grey, black + achromatic white highlight).
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Lock, X, Eye, EyeOff, CheckCircle2, AlertTriangle, KeyRound, ArrowLeft, Send } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const C = {
  black: '#0A0A0A',
  panel: 'rgba(18,18,20,0.72)',
  panelSolid: '#121214',
  border: 'rgba(255,255,255,0.12)',
  borderStrong: 'rgba(255,26,26,0.45)',
  borderFaint: 'rgba(255,255,255,0.06)',
  red: '#FF1A1A',
  redDeep: '#B91C1C',
  redGlow: 'rgba(255,26,26,0.55)',
  redSoft: 'rgba(255,26,26,0.15)',
  text: '#E5E7EB',
  textDim: '#9CA3AF',
  textFaint: '#6B7280',
  white: '#FFFFFF',
  green: '#22C55E',
  greenGlow: 'rgba(34,197,94,0.4)',
  amber: '#F59E0B',
  amberGlow: 'rgba(245,158,11,0.35)',
  overlay: 'rgba(0,0,0,0.92)',
};

type DbStatus = 'HEALTHY' | 'DEGRADED' | 'CORRUPTED' | 'OFFLINE' | '...';

interface Health {
  status: DbStatus;
  latencyMs?: number;
  connections?: number;
}

type Mode = 'login' | 'signup' | 'forgot';

function statusColor(s: DbStatus): string {
  switch (s) {
    case 'HEALTHY':
      return C.white;
    case 'DEGRADED':
      return C.red;
    case 'CORRUPTED':
    case 'OFFLINE':
      return C.textFaint;
    default:
      return C.textDim;
  }
}

function getStrengthColor(score: number): string {
  if (score <= 1) return C.textFaint;
  if (score <= 2) return C.amber;
  if (score <= 3) return C.red;
  return C.green;
}

function getStrengthGlow(score: number): string {
  if (score <= 2) return 'none';
  if (score <= 3) return C.redGlow;
  return C.greenGlow;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginUser, signupUser, user, showToast, authRequired } = useApp();

  const [mode, setMode] = useState<Mode>('login');
  const [displayMode, setDisplayMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [showConfirmPassphrase, setShowConfirmPassphrase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [health, setHealth] = useState<Health>({ status: '...' });
  const [pingId, setPingId] = useState(0);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setDisplayMode(mode);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => setDisplayMode(mode), 20);
    return () => clearTimeout(timer);
  }, [mode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    modalRef.current?.focus();
  }, [isOpen, displayMode]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const poll = async () => {
      try {
        const r = await fetch('/api/v1/health/db');
        const j = await r.json();
        if (active) setHealth({ status: j.status, latencyMs: j.latencyMs, connections: j.connections });
      } catch {
        if (active) setHealth({ status: 'OFFLINE' });
      } finally {
        if (active) setPingId((n) => n + 1);
      }
    };
    poll();
    const id = setInterval(poll, 3500);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const passphraseStrength = (() => {
    if (!passphrase) return { score: 0, label: '', color: C.textFaint, width: '0%', glow: 'none' };
    let score = 0;
    if (passphrase.length >= 8) score++;
    if (passphrase.length >= 12) score++;
    if (/[A-Z]/.test(passphrase)) score++;
    if (/[0-9]/.test(passphrase)) score++;
    if (/[^A-Za-z0-9]/.test(passphrase)) score++;
    if (score <= 1) return { score, label: 'Weak', color: C.textFaint, width: '20%', glow: 'none' };
    if (score <= 2) return { score, label: 'Fair', color: C.amber, width: '40%', glow: C.amberGlow };
    if (score <= 3) return { score, label: 'Good', color: C.red, width: '60%', glow: C.redGlow };
    if (score <= 4) return { score, label: 'Strong', color: C.green, width: '80%', glow: C.greenGlow };
    return { score, label: 'Excellent', color: C.green, width: '100%', glow: C.greenGlow };
  })();

  const updateHint = (value: string) => {
    if (!value) { setHint(null); return; }
    if (value.length < 8) setHint('Use at least 8 characters for a strong passphrase.');
    else if (!/[A-Z]/.test(value)) setHint('Add an uppercase letter to increase strength.');
    else if (!/[0-9]/.test(value)) setHint('Include a number for better security.');
    else if (!/[^A-Za-z0-9]/.test(value)) setHint('Add a special character (e.g. !@#) for maximum strength.');
    else setHint('Excellent — this passphrase is very strong.');
  };

  const validate = (): boolean => {
    setValidationError(null);
    setHint(null);
    if (!username.trim() || !passphrase.trim()) {
      setValidationError('Username and passphrase are both required.');
      return false;
    }
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username.trim())) {
      setValidationError('Username must be 3–32 characters using only letters, numbers, and underscores.');
      return false;
    }
    if (passphrase.length < 8) {
      setValidationError('Passphrase is too short — minimum 8 characters required.');
      return false;
    }
    if (mode === 'signup' && passphrase !== confirmPassphrase) {
      setValidationError('Passphrases do not match. Please re-type your master passphrase.');
      return false;
    }
    return true;
  };

  const handleClose = () => {
    if (authRequired) {
      showToast('Authentication Required', 'Please sign in or create a vault to continue.', 'warning');
      return;
    }
    setMode('login');
    setValidationError(null);
    setHint(null);
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
      if (mode === 'signup') {
        success = await signupUser(username, email || `${username.toLowerCase()}@brio.vault`, passphrase);
        if (success) {
          setPassphrase('');
          setConfirmPassphrase('');
          setValidationError(null);
          setHint(null);
          setEmail('');
          setMode('login');
        }
      } else {
        success = await loginUser(username, passphrase);
        if (success) {
          setPassphrase('');
          setValidationError(null);
          setHint(null);
          onClose();
        }
      }
    } catch (err: any) {
      showToast('Error', err?.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setValidationError(null);
    setHint(null);
    setConfirmPassphrase('');
    setRecoveryEmail('');
    setRecoverySent(false);
  };

  const handleForgotPassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      showToast('Email Required', 'Please provide your account email for recovery.', 'warning');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setRecoverySent(true);
    setLoading(false);
    showToast('Recovery Email Sent', `If ${recoveryEmail} is linked to a Brio vault, you'll receive reset instructions.`, 'success');
  };

  const led = statusColor(health.status);

  const isTransitioning = displayMode !== mode;

  return (
    <>
      <style>{`
        @keyframes brioDropIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: none; }
        }
        @keyframes brioFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes brioFadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-6px); }
        }
        @keyframes brioSlideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes brioShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes brioPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        .brio-drop-in { animation: brioDropIn 0.35s cubic-bezier(.2,.9,.3,1.2) both; }
        .brio-fade-in { animation: brioFadeIn 0.3s ease-out both; }
        .brio-fade-out { animation: brioFadeOut 0.2s ease-in both; }
        .brio-slide-in { animation: brioSlideInRight 0.35s cubic-bezier(.2,.9,.3,1.2) both; }
        .brio-scanlines::before {
          content: ''; position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
          background: repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px);
          opacity: 0.4; mix-blend-mode: overlay;
        }
        .skeuo-led { animation: brioPulse 1.4s ease-in-out infinite; }
        .brio-gel::after {
          content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
          background: linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 45%);
        }
        .skeuo-input:focus {
          outline: none;
          border-color: rgba(255,26,26,0.55) !important;
          box-shadow: 0 0 0 3px rgba(255,26,26,0.12), 0 0 18px rgba(255,26,26,0.2), inset 0 2px 6px rgba(0,0,0,0.6) !important;
        }
        .skeuo-input-error {
          border-color: rgba(255,26,26,0.6) !important;
          box-shadow: 0 0 0 2px rgba(255,26,26,0.1), 0 0 14px rgba(255,26,26,0.15) !important;
        }
        .brio-field-enter {
          animation: brioFadeIn 0.35s ease-out both;
        }
        .brio-mode-switch {
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .brio-toast-enter {
          animation: brioSlideInRight 0.35s cubic-bezier(.2,.9,.3,1.2) both;
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: C.overlay, backdropFilter: 'blur(24px) saturate(1.2)', WebkitBackdropFilter: 'blur(24px) saturate(1.2)' }}
        onClick={(e) => { if (e.target === e.currentTarget && !authRequired) handleClose(); }}
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={mode === 'login' ? 'Login to your vault' : mode === 'signup' ? 'Create a new vault' : 'Recover your passphrase'}
           className="skeuo-panel relative w-full max-w-md rounded-[28px] p-0 overflow-hidden brio-drop-in"
          style={{
            background: `linear-gradient(155deg, ${C.panelSolid} 0%, ${C.black} 100%)`,
            border: `1px solid ${C.borderStrong}`,
            boxShadow: `0 30px 70px -20px rgba(0,0,0,0.95), 0 0 0 1px ${C.borderFaint}, 0 0 50px ${C.redGlow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
          }}
        >
          {/* Ambient red neon glows */}
          <div className="absolute -top-28 -right-24 w-60 h-60 rounded-full pointer-events-none" style={{ background: C.redGlow, filter: 'blur(80px)', opacity: 0.5 }} />
          <div className="absolute -bottom-28 -left-24 w-60 h-60 rounded-full pointer-events-none" style={{ background: 'rgba(255,26,26,0.25)', filter: 'blur(80px)', opacity: 0.35 }} />
          <div className="absolute inset-x-0 top-0 h-28 rounded-t-[28px] pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.07), transparent)' }} />

          {/* DB Diagnostic */}
          <div
            className="skeuo-inset-panel relative z-10 mx-5 mt-5 mb-3 rounded-2xl p-3 flex items-center justify-between brio-drop-in"
            style={{
              background: 'rgba(0,0,0,0.65)',
              border: `1px solid ${C.border}`,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="skeuo-led w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: led, boxShadow: `0 0 10px ${led}, 0 0 3px ${led}` }}
                aria-hidden="true"
              />
              <div className="leading-tight">
                <p className="text-[10px] font-black tracking-[0.18em] font-mono" style={{ color: C.white }}>
                  ◉ DB DIAGNOSTIC
                </p>
                <p className="text-[10px] font-mono" style={{ color: led }}>
                  {health.status}
                  {health.latencyMs != null && health.status !== 'OFFLINE' && health.status !== '...' ? ` · ${health.latencyMs.toFixed(0)}ms` : ''}
                  {health.connections != null ? ` · ${health.connections} conn` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5" title="ping" aria-label="Connection ping indicator">
              <span className="text-[9px] font-mono" style={{ color: C.textFaint }}>PING</span>
              <span
                key={pingId}
                className="brio-drop-in w-2 h-2 rounded-full"
                style={{ background: C.red, boxShadow: `0 0 8px ${C.red}` }}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Header */}
          <div
            className="relative z-10 flex items-center justify-between px-6 sm:px-7 pt-5 pb-4"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-2xl border"
                style={{
                  background: 'rgba(255,26,26,0.12)',
                  borderColor: C.borderStrong,
                  color: C.red,
                  boxShadow: `0 0 20px ${C.redGlow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
                }}
              >
                {mode === 'forgot' ? <KeyRound className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-[17px] font-black tracking-wide leading-tight" style={{ color: C.white }}>
                  {mode === 'login' && 'Unlock Vault'}
                  {mode === 'signup' && 'Create Encrypted Vault'}
                  {mode === 'forgot' && 'Recover Passphrase'}
                </h3>
                <p className="text-[11px] font-semibold mt-0.5" style={{ color: C.red }}>
                  {mode === 'login' && 'Enter your master passphrase'}
                  {mode === 'signup' && 'One vault · Zero-knowledge encryption'}
                  {mode === 'forgot' && 'We\'ll send reset instructions'}
                </p>
              </div>
            </div>
            {!authRequired && (
              <button
                onClick={handleClose}
                type="button"
                title="Close dialog"
                className="p-1.5 rounded-lg transition-all hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
                style={{ color: C.textDim }}
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 px-6 sm:px-7 pb-7 pt-5">
            {/* ─── MODE CONTENT ─── */}
            <div
              key={displayMode}
              className={`brio-mode-switch ${isTransitioning ? 'brio-fade-out' : 'brio-field-enter'}`}
              style={{ opacity: isTransitioning ? 0 : 1, transform: isTransitioning ? 'translateY(-6px)' : 'none' }}
            >
              {/* LOGIN + SIGNUP form fields */}
              {(displayMode === 'login' || displayMode === 'signup') && (
                <div className="space-y-4">
                  {/* Username */}
                  <div>
                    <label htmlFor="auth-username" className="block text-[11px] font-bold mb-1.5 uppercase tracking-[0.14em]" style={{ color: C.textDim }}>
                      Username
                    </label>
                    <input
                      id="auth-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. CaptainVance"
                      aria-describedby="username-hint"
                      autoComplete="username"
                      className="skeuo-input w-full px-4 py-3 rounded-xl text-sm transition-all"
                      style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${C.border}`, color: C.white, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)' }}
                      minLength={3}
                      maxLength={32}
                    />
                    <p id="username-hint" className="mt-1 text-[10px] font-mono" style={{ color: C.textFaint }}>
                      3–32 characters · letters, numbers, underscores
                    </p>
                  </div>

                  {/* Email (signup only) */}
                  {displayMode === 'signup' && (
                    <div className="brio-field-enter">
                      <label htmlFor="auth-email" className="block text-[11px] font-bold mb-1.5 uppercase tracking-[0.14em]" style={{ color: C.textDim }}>
                        Email <span style={{ color: C.textFaint }}>(optional)</span>
                      </label>
                      <input
                        id="auth-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="operator@brio.vault"
                        autoComplete="email"
                        className="skeuo-input w-full px-4 py-3 rounded-xl text-sm transition-all"
                        style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${C.border}`, color: C.white, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)' }}
                      />
                      <p className="mt-1 text-[10px] font-mono" style={{ color: C.textFaint }}>
                        Used for vault recovery notifications only
                      </p>
                    </div>
                  )}

                  {/* Passphrase */}
                  <div>
                    <label htmlFor="auth-passphrase" className="block text-[11px] font-bold mb-1.5 uppercase tracking-[0.14em]" style={{ color: C.textDim }}>
                      Master Passphrase
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 pointer-events-none" style={{ color: C.red }} aria-hidden="true" />
                      <input
                        id="auth-passphrase"
                        type={showPassphrase ? 'text' : 'password'}
                        required
                        value={passphrase}
                        onChange={(e) => { setPassphrase(e.target.value); updateHint(e.target.value); }}
                        placeholder="Enter your master passphrase"
                        aria-describedby="strength-hint"
                        autoComplete={displayMode === 'signup' ? 'new-password' : 'current-password'}
                        className="skeuo-input w-full pl-10 pr-20 py-3 rounded-xl text-sm transition-all"
                        style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${C.border}`, color: C.white, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)' }}
                        minLength={8}
                        maxLength={256}
                      />
                      <div className="absolute right-2 top-2 flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => setShowPassphrase((p) => !p)}
                          className="p-1.5 rounded-md transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                          style={{ color: C.textDim }}
                          tabIndex={0}
                          aria-label={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                          title={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                        >
                          {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Strength bar */}
                    {passphrase.length > 0 && (
                      <div id="strength-hint" className="mt-2.5 space-y-1.5 brio-fade-in">
                        <div className="flex items-center gap-1.5" role="meter" aria-valuenow={passphraseStrength.score} aria-valuemin={0} aria-valuemax={5} aria-label={`Password strength: ${passphraseStrength.label}`}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="flex-1 h-1.5 rounded-full transition-all duration-300"
                              style={{
                                background: i <= passphraseStrength.score
                                  ? `linear-gradient(90deg, ${passphraseStrength.color}, ${passphraseStrength.color})`
                                  : 'rgba(255,255,255,0.07)',
                                boxShadow: i <= passphraseStrength.score ? passphraseStrength.glow : 'none',
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono transition-colors duration-300" style={{ color: passphraseStrength.color }}>
                            {passphraseStrength.label}
                          </span>
                          <span className="text-[10px] font-mono" style={{ color: C.textFaint }}>
                            {passphrase.length} chars
                          </span>
                        </div>
                      </div>
                    )}

                    {hint && passphrase.length > 0 && (
                      <p className="mt-1.5 text-[10px] font-medium brio-fade-in" style={{ color: C.textDim }}>
                        💡 {hint}
                      </p>
                    )}
                  </div>

                  {/* Confirm Passphrase (signup only) */}
                  {displayMode === 'signup' && (
                    <div className="brio-field-enter">
                      <label htmlFor="auth-confirm" className="block text-[11px] font-bold mb-1.5 uppercase tracking-[0.14em]" style={{ color: C.textDim }}>
                        Confirm Passphrase
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 pointer-events-none" style={{ color: C.red }} aria-hidden="true" />
                        <input
                          id="auth-confirm"
                          type={showConfirmPassphrase ? 'text' : 'password'}
                          required
                          value={confirmPassphrase}
                          onChange={(e) => setConfirmPassphrase(e.target.value)}
                          placeholder="Re-type your master passphrase..."
                          autoComplete="new-password"
                          className="skeuo-input w-full pl-10 pr-20 py-3 rounded-xl text-sm transition-all"
                          style={{ background: 'rgba(0,0,0,0.6)', border: `1px ${confirmPassphrase.length > 0 && passphrase !== confirmPassphrase ? 'rgba(255,26,26,0.5)' : C.border} solid`, color: C.white, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)' }}
                          minLength={8}
                        />
                        <div className="absolute right-2 top-2 flex items-center gap-0.5">
                          {confirmPassphrase.length > 0 && (
                            passphrase === confirmPassphrase
                              ? <CheckCircle2 className="w-4 h-4" style={{ color: C.green }} aria-label="Passphrases match" />
                              : <AlertTriangle className="w-4 h-4" style={{ color: C.red }} aria-label="Passphrases do not match" />
                          )}
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassphrase((p) => !p)}
                            className="p-1.5 rounded-md transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                            style={{ color: C.textDim }}
                            tabIndex={0}
                            aria-label={showConfirmPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                            title={showConfirmPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                          >
                            {showConfirmPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Validation error */}
                  {validationError && (
                    <div
                      role="alert"
                      className="brio-drop-in p-3 rounded-xl border text-xs font-semibold flex items-start gap-2.5 brio-fade-in"
                      style={{ background: 'rgba(255,26,26,0.10)', borderColor: C.borderStrong, color: C.red, boxShadow: `0 0 24px ${C.redGlow}, inset 0 1px 0 rgba(255,255,255,0.06)` }}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <p>{validationError}</p>
                        {validationError.includes('do not match') && (
                          <p className="mt-1 font-mono text-[10px] opacity-80">Tip: check caps lock and re-type carefully.</p>
                        )}
                        {validationError.includes('too short') && (
                          <p className="mt-1 font-mono text-[10px] opacity-80">Try a passphrase or phrase you can remember but others can't guess.</p>
                        )}
                        {validationError.includes('Username must') && (
                          <p className="mt-1 font-mono text-[10px] opacity-80">Example: <span style={{ color: C.textDim }}>spott3r_01</span></p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="skeuo-btn-primary relative w-full py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 font-black disabled:opacity-60 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    style={{
                      background: `linear-gradient(135deg, ${C.red}, ${C.redDeep})`,
                      color: C.white,
                      border: `1px solid rgba(255,255,255,0.18)`,
                      boxShadow: `0 14px 32px ${C.redGlow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
                    }}
                    aria-busy={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: C.white, borderTopColor: 'transparent' }} aria-hidden="true" />
                        <span className="text-sm tracking-wide">Please wait...</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontFamily: 'monospace' }} aria-hidden="true">
                          {displayMode === 'signup' ? '⚡' : '►'}
                        </span>
                        <span className="text-sm tracking-wide">
                          {displayMode === 'signup' ? 'Create Vault' : 'Unlock Vault'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* FORGOT PASSPHRASE flow */}
              {displayMode === 'forgot' && (
                <div className="space-y-4 brio-slide-in">
                  {!recoverySent ? (
                    <>
                      <p className="text-xs leading-relaxed" style={{ color: C.textDim }}>
                        Enter the email associated with your Brio vault. If an account exists, we'll send a simulated recovery link with next steps.
                      </p>
                      <div>
                        <label htmlFor="recovery-email" className="block text-[11px] font-bold mb-1.5 uppercase tracking-[0.14em]" style={{ color: C.textDim }}>
                          Account Email
                        </label>
                        <input
                          id="recovery-email"
                          type="email"
                          required
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder="your-email@example.com"
                          autoComplete="email"
                          className="skeuo-input w-full px-4 py-3 rounded-xl text-sm transition-all"
                          style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${C.border}`, color: C.white, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)' }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        onClick={handleForgotPassphrase}
                        className="skeuo-btn-primary relative w-full py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 font-black disabled:opacity-60 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
                        style={{
                          background: `linear-gradient(135deg, ${C.red}, ${C.redDeep})`,
                          color: C.white,
                          border: `1px solid rgba(255,255,255,0.18)`,
                          boxShadow: `0 14px 32px ${C.redGlow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
                        }}
                        aria-busy={loading}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: C.white, borderTopColor: 'transparent' }} />
                            <span className="text-sm">Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" aria-hidden="true" />
                            <span className="text-sm tracking-wide">Send Recovery Link</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="brio-slide-in text-center py-4 space-y-3">
                      <div
                        className="mx-auto w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(34,197,94,0.12)', border: `1px solid rgba(34,197,94,0.3)`, boxShadow: `0 0 24px ${C.greenGlow}` }}
                      >
                        <CheckCircle2 className="w-7 h-7" style={{ color: C.green }} aria-hidden="true" />
                      </div>
                      <p className="text-sm font-bold" style={{ color: C.white }}>
                        Recovery email sent
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: C.textDim }}>
                        If <span className="font-mono font-bold" style={{ color: C.red }}>{recoveryEmail || 'your email'}</span> is linked to a Brio vault, you'll receive simulated instructions on how to reset your passphrase.
                      </p>
                      <p className="text-[10px] font-mono pt-1" style={{ color: C.textFaint }}>
                        ⚠ Since Brio uses zero-knowledge encryption, only you can access your vault. This flow is for reference only.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── FOOTER ACTIONS ─── */}
            <div className="relative z-10 pt-4 space-y-2" style={{ borderTop: `1px solid ${C.border}` }}>
              {mode !== 'forgot' && (
                <div className="text-center space-y-1.5 brio-fade-in">
                  <button
                    type="button"
                    onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-xs font-bold transition-colors hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 rounded px-2 py-1"
                    style={{ color: C.red }}
                  >
                    {mode === 'login' ? 'First time? Create new vault' : 'Already have a vault? Login'}
                  </button>
                  <div>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[11px] font-semibold transition-colors hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 rounded px-2 py-0.5"
                      style={{ color: C.textDim }}
                    >
                      Forgot passphrase?
                    </button>
                  </div>
                </div>
              )}

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full text-center text-xs font-bold py-2 rounded-xl transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                  style={{ color: C.textDim }}
                >
                  <ArrowLeft className="w-3.5 h-3.5 inline mr-1 -mt-0.5" aria-hidden="true" />
                  Back to login
                </button>
              )}

              <p className="text-center text-[10px] font-mono leading-relaxed pt-0.5" style={{ color: C.textFaint }}>
                {mode === 'login' && '🔒 Your vault is end-to-end encrypted. Without your passphrase it cannot be unlocked.'}
                {mode === 'signup' && '🔒 Passwords hashed with Argon2id — we never see your passphrase.'}
                {mode === 'forgot' && '🔒 Zero-knowledge architecture: recovery simulates the flow for UX reference only.'}
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
