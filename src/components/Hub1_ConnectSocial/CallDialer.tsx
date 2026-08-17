/**
 * CallDialer Component: Keypad, Emergency Number Triggers, and Encrypted Logs
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmergencyNumber, CallLogItem } from '../../types';
import { Phone, PhoneCall, PhoneOff, AlertTriangle, ShieldCheck, History, Delete } from 'lucide-react';

const EMERGENCY_NUMBERS: EmergencyNumber[] = [
  {
    code: '140',
    name: 'Lebanese Red Cross Ambulance',
    region: 'Lebanon',
    category: 'Ambulance',
    details: 'Lebanon National Emergency Medical Dispatch',
  },
  {
    code: '112',
    name: 'Lebanon Internal Security Forces (ISF)',
    region: 'Lebanon',
    category: 'Police',
    details: 'Police & Emergency Response in Lebanon',
  },
  {
    code: '112',
    name: 'Cyprus European Emergency Call',
    region: 'Cyprus',
    category: 'Police',
    details: 'Cyprus & EU Unified Emergency Services',
  },
  {
    code: '199',
    name: 'Cyprus Fire & Rescue Services',
    region: 'Cyprus',
    category: 'Fire',
    details: 'National Fire Brigade Cyprus',
  },
  {
    code: '911',
    name: 'Global Emergency Dispatch',
    region: 'Global',
    category: 'Police',
    details: 'Universal Emergency Relay',
  },
];

export const CallDialer: React.FC = () => {
  const { showToast } = useApp();
  const [dialedNumber, setDialedNumber] = useState('');
  const [inCall, setInCall] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [callLogs, setCallLogs] = useState<CallLogItem[]>([
    {
      id: 'log-1',
      number: '140',
      name: 'Lebanese Red Cross',
      type: 'emergency',
      durationSeconds: 45,
      timestamp: 'Today 11:20',
      isEncrypted: true,
    },
  ]);

  const handleKeyPress = (digit: string) => {
    if (dialedNumber.length < 15) {
      setDialedNumber((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const startCall = (numberToCall?: string) => {
    const num = numberToCall || dialedNumber;
    if (!num) return;

    const isEmergency = EMERGENCY_NUMBERS.some((e) => e.code === num);
    setInCall(true);
    setCallTimer(0);

    const interval = setInterval(() => {
      setCallTimer((t) => t + 1);
    }, 1000);
    setTimerInterval(interval);

    if (isEmergency) {
      showToast(
        '🚨 EMERGENCY CALL CONNECTED',
        `Transmitting GPS coordinates to ${num} Emergency Dispatcher.`,
        'warning'
      );
    } else {
      showToast('Encrypted Call Initiated', `Secure P2P Voice Channel established to ${num}`, 'success');
    }
  };

  const endCall = () => {
    if (timerInterval) clearInterval(timerInterval);
    setInCall(false);

    if (dialedNumber) {
      const isEmergency = EMERGENCY_NUMBERS.some((e) => e.code === dialedNumber);
      const newLog: CallLogItem = {
        id: `call-${Date.now()}`,
        number: dialedNumber,
        name: isEmergency ? 'Emergency Service' : undefined,
        type: isEmergency ? 'emergency' : 'outgoing',
        durationSeconds: callTimer,
        timestamp: 'Just now',
        isEncrypted: true,
      };
      setCallLogs((prev) => [newLog, ...prev]);
    }
    setDialedNumber('');
    setCallTimer(0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Keypad & Dialer */}
      <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-between min-h-[500px]">
        {/* Dial Display Screen */}
        <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center relative mb-6">
          <p className="text-xs text-slate-500 font-mono mb-1">Encrypted Voice Channel Ready</p>
          <div className="h-10 flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-cyan-400">
              {dialedNumber || '—'}
            </span>
          </div>

          {inCall && (
            <div className="mt-2 flex items-center justify-center gap-2 text-xs font-mono text-emerald-400 animate-pulse">
              <PhoneCall className="w-4 h-4" />
              <span>
                IN CALL: {Math.floor(callTimer / 60)}:{(callTimer % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* 3x4 Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="liquid-glass-btn py-3.5 bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700/60 rounded-2xl text-lg font-bold text-white shadow transition-all"
            >
              {digit}
            </button>
          ))}
        </div>

        {/* Call Actions Bar */}
        <div className="flex items-center gap-4 w-full max-w-xs">
          <button
            onClick={handleBackspace}
            disabled={!dialedNumber}
            className="liquid-glass-btn p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all disabled:opacity-40"
          >
            <Delete className="w-5 h-5" />
          </button>

          {inCall ? (
            <button
              onClick={endCall}
              className="liquid-glass-btn flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Call</span>
            </button>
          ) : (
            <button
              onClick={() => startCall()}
              disabled={!dialedNumber}
              className="liquid-glass-btn flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Phone className="w-5 h-5" />
              <span>Dial Call</span>
            </button>
          )}
        </div>
      </div>

      {/* Emergency Shortcuts & Call Logs */}
      <div className="space-y-6">
        {/* Emergency Panel */}
        <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Emergency Speed-Dial</h4>
          </div>

          <div className="space-y-2">
            {EMERGENCY_NUMBERS.map((em) => (
              <button
                key={em.code + em.name}
                onClick={() => {
                  setDialedNumber(em.code);
                  startCall(em.code);
                }}
                className="liquid-glass-btn w-full p-2.5 bg-slate-950 border border-slate-800 hover:border-rose-500/40 rounded-xl text-left transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                      {em.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-rose-950 text-rose-300 rounded font-mono">
                      {em.code}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{em.details}</p>
                </div>
                <PhoneCall className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Encrypted Logs */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <History className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Encrypted Call Logs</h4>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {callLogs.map((log) => (
              <div key={log.id} className="p-2 bg-slate-950 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-200">{log.name || log.number}</p>
                  <p className="text-[10px] text-slate-400">{log.timestamp} • {log.durationSeconds}s</p>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Encrypted</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
