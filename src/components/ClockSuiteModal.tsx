import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { encryptionService } from '../utils/crypto';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Bell,
  X,
  Sparkles,
  Globe,
  Timer as TimerIcon,
  Activity,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  dateStr: string; // YYYY-MM-DD
  title: string;
  category: 'Meeting' | 'Flight' | 'Reminder' | 'Task' | 'Personal';
  time: string;
  notes?: string;
  completed: boolean;
  isEncrypted: boolean;
}

interface ClockSuiteModalProps {
  onClose: () => void;
}

export const ClockSuiteModal: React.FC<ClockSuiteModalProps> = ({ onClose }) => {
  const { t, showToast, user } = useApp();

  // Active Tab: 'ANALOG' | 'STOPWATCH' | 'TIMER' | 'CALENDAR'
  const [activeTab, setActiveTab] = useState<'ANALOG' | 'STOPWATCH' | 'TIMER' | 'CALENDAR'>('ANALOG');

  // --- 1. ANALOG CLOCK STATE ---
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  const secDeg = (seconds / 60) * 360;
  const minDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;

  // --- 2. STOPWATCH STATE ---
  const [swRunning, setSwRunning] = useState(false);
  const [swTimeMs, setSwTimeMs] = useState(0);
  const [swLaps, setSwLaps] = useState<{ id: number; split: number; total: number }[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (swRunning) {
      interval = setInterval(() => {
        setSwTimeMs((prev) => prev + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  const handleSwLap = () => {
    if (!swRunning) return;
    const lastLapTotal = swLaps.length > 0 ? swLaps[swLaps.length - 1].total : 0;
    const split = swTimeMs - lastLapTotal;
    setSwLaps((prev) => [...prev, { id: prev.length + 1, split, total: swTimeMs }]);
  };

  const handleSwReset = () => {
    setSwRunning(false);
    setSwTimeMs(0);
    setSwLaps([]);
  };

  const formatMs = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  };

  // --- 3. TIMER STATE ---
  const [timerInputH, setTimerInputH] = useState(0);
  const [timerInputM, setTimerInputM] = useState(5);
  const [timerInputS, setTimerInputS] = useState(0);

  const [timerRemainingSec, setTimerRemainingSec] = useState(300);
  const [timerTotalSec, setTimerTotalSec] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerRemainingSec > 0) {
      interval = setInterval(() => {
        setTimerRemainingSec((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            showToast('Timer Finished!', 'Countdown completed alarm!', 'warning');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerRemainingSec, showToast]);

  const startTimer = () => {
    const total = timerInputH * 3600 + timerInputM * 60 + timerInputS;
    if (total <= 0) {
      showToast('Timer Alert', 'Please set a duration greater than 0', 'warning');
      return;
    }
    setTimerTotalSec(total);
    setTimerRemainingSec(total);
    setTimerRunning(true);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    const total = timerInputH * 3600 + timerInputM * 60 + timerInputS;
    setTimerRemainingSec(total);
  };

  const formatTimerSeconds = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- 4. CALENDAR & REMINDERS STATE ---
  const [currentCalDate, setCurrentCalDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(`brio_calendar_events_${user?.id || 'guest'}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'ev-1',
        dateStr: new Date().toISOString().split('T')[0],
        title: 'Aircraft Spotting & Telemetry Review',
        category: 'Flight',
        time: '14:30',
        notes: 'Check MyPlanePics vault and spotter rankings.',
        completed: false,
        isEncrypted: true,
      },
      {
        id: 'ev-[#2]',
        dateStr: new Date().toISOString().split('T')[0],
        title: 'Mesh Network P2P Verification',
        category: 'Meeting',
        time: '18:00',
        notes: 'Encrypted channel testing.',
        completed: false,
        isEncrypted: true,
      },
    ];
  });

  // Save events on change
  useEffect(() => {
    localStorage.setItem(
      `brio_calendar_events_${user?.id || 'guest'}`,
      JSON.stringify(events)
    );
  }, [events, user]);

  // Event Input Form
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<CalendarEvent['category']>('Reminder');
  const [newEventTime, setNewEventTime] = useState('12:00');
  const [newEventNotes, setNewEventNotes] = useState('');

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      showToast('Validation Alert', 'Event title is required.', 'warning');
      return;
    }

    try {
      const encryptedNotes = await encryptionService.encrypt(newEventNotes || 'None');
      const newEv: CalendarEvent = {
        id: `ev-${Date.now()}`,
        dateStr: selectedDateStr,
        title: newEventTitle,
        category: newEventCategory,
        time: newEventTime,
        notes: encryptedNotes ? newEventNotes : '',
        completed: false,
        isEncrypted: true,
      };

      setEvents((prev) => [...prev, newEv]);
      setNewEventTitle('');
      setNewEventNotes('');
      showToast('Event Scheduled', `Saved event for ${selectedDateStr}`, 'success');
    } catch {
      showToast('Error', 'Failed to save encrypted event', 'error');
    }
  };

  const toggleEventComplete = (id: string) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, completed: !ev.completed } : ev))
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    showToast('Event Deleted', 'Removed from calendar', 'info');
  };

  // Calendar calculations
  const year = currentCalDate.getFullYear();
  const month = currentCalDate.getMonth();
  const monthName = currentCalDate.toLocaleString('default', { month: 'long' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) daysArray.push(null);
  for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);

  const prevMonth = () => {
    setCurrentCalDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentCalDate(new Date(year, month + 1, 1));
  };

  // World Clocks
  const timezones = [
    { city: 'London (GMT)', offset: 1, flag: '🇬🇧' },
    { city: 'New York (EDT)', offset: -4, flag: '🇺🇸' },
    { city: 'Tokyo (JST)', offset: 9, flag: '🇯🇵' },
    { city: 'Dubai (GST)', offset: 4, flag: '🇦🇪' },
    { city: 'Berlin (CEST)', offset: 2, flag: '🇩🇪' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl border-2 border-[#FF5F1F]/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER BAR */}
        <div className="px-6 py-4 bg-black/90 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FF5F1F]/20 border border-[#FF5F1F]/40 text-[#FF5F1F]">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                <span>{t.clock || 'Clock & Calendar Suite'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                  Precision Sync
                </span>
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Analog Clock • Stopwatch • Countdown Timer • Calendar & Reminders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="liquid-glass-btn p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="liquid-glass-btn w-5 h-5" />
          </button>
        </div>

        {/* SUB-TABS SELECTOR */}
        <div className="px-6 py-3 bg-slate-950/90 border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('ANALOG')}
            className={`liquid-glass-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ANALOG'
                ? 'bg-gradient-to-r from-[#FF5F1F] to-orange-500 text-black shadow-lg font-black'
                : 'bg-slate-900 text-zinc-300 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t.analogClock || 'Analog Clock'}</span>
          </button>

          <button
            onClick={() => setActiveTab('STOPWATCH')}
            className={`liquid-glass-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'STOPWATCH'
                ? 'bg-gradient-to-r from-[#FF5F1F] to-orange-500 text-black shadow-lg font-black'
                : 'bg-slate-900 text-zinc-300 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{t.stopwatch || 'Stopwatch'}</span>
          </button>

          <button
            onClick={() => setActiveTab('TIMER')}
            className={`liquid-glass-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'TIMER'
                ? 'bg-gradient-to-r from-[#FF5F1F] to-orange-500 text-black shadow-lg font-black'
                : 'bg-slate-900 text-zinc-300 hover:bg-slate-800'
            }`}
          >
            <TimerIcon className="w-4 h-4" />
            <span>{t.timer || 'Timer'}</span>
          </button>

          <button
            onClick={() => setActiveTab('CALENDAR')}
            className={`liquid-glass-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CALENDAR'
                ? 'bg-gradient-to-r from-[#FF5F1F] to-orange-500 text-black shadow-lg font-black'
                : 'bg-slate-900 text-zinc-300 hover:bg-slate-800'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>{t.calendar || 'Calendar & Events'}</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: ANALOG CLOCK */}
          {activeTab === 'ANALOG' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* ANALOG CLOCK FACE */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-3xl border border-white/10 shadow-inner relative">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-[#FF5F1F]/60 bg-gradient-to-b from-slate-900 to-black shadow-[0_0_30px_rgba(255,95,31,0.2)] flex items-center justify-center">
                  
                  {/* Clock Numbers & Ticks */}
                  {[...Array(12)].map((_, i) => {
                    const angle = (i + 1) * 30;
                    const rad = (angle * Math.PI) / 180;
                    const x = 50 + 38 * Math.sin(rad);
                    const y = 50 - 38 * Math.cos(rad);
                    return (
                      <span
                        key={i}
                        className="absolute text-xs font-black font-mono text-zinc-300"
                        style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        {i + 1}
                      </span>
                    );
                  })}

                  {/* HOUR HAND */}
                  <div
                    className="absolute w-1.5 h-16 bg-white rounded-full origin-bottom shadow-lg"
                    style={{
                      transform: `rotate(${hourDeg}deg)`,
                      bottom: '50%',
                    }}
                  />

                  {/* MINUTE HAND */}
                  <div
                    className="absolute w-1 h-24 bg-sky-400 rounded-full origin-bottom shadow-lg"
                    style={{
                      transform: `rotate(${minDeg}deg)`,
                      bottom: '50%',
                    }}
                  />

                  {/* SECOND HAND */}
                  <div
                    className="absolute w-0.5 h-28 bg-[#FF5F1F] rounded-full origin-bottom shadow-lg"
                    style={{
                      transform: `rotate(${secDeg}deg)`,
                      bottom: '50%',
                    }}
                  />

                  {/* CENTER CAP */}
                  <div className="w-4 h-4 bg-[#FF5F1F] rounded-full border-2 border-white z-10 shadow-md" />
                </div>

                {/* DIGITAL READOUT BELOW CLOCK */}
                <div className="mt-4 text-center">
                  <div className="text-3xl font-black font-mono text-white tracking-widest">
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <div className="text-xs font-mono text-sky-400 font-bold mt-1">
                    {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* WORLD CLOCKS GRID */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#FF5F1F]" />
                  <span>World Clock Matrix</span>
                </h4>

                <div className="space-y-2.5">
                  {timezones.map((tz, idx) => {
                    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
                    const cityDate = new Date(utc + 3600000 * tz.offset);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{tz.flag}</span>
                          <span className="text-xs font-bold text-white">{tz.city}</span>
                        </div>
                        <span className="text-xs font-mono font-black text-[#FF5F1F]">
                          {cityDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: STOPWATCH */}
          {activeTab === 'STOPWATCH' && (
            <div className="space-y-6 flex flex-col items-center justify-center py-4">
              <div className="text-5xl sm:text-6xl font-black font-mono text-white tracking-wider bg-slate-950 px-8 py-6 rounded-3xl border-2 border-[#FF5F1F]/40 shadow-inner">
                {formatMs(swTimeMs)}
              </div>

              <div className="flex items-center gap-4">
                {!swRunning ? (
                  <button
                    onClick={() => setSwRunning(true)}
                    className="liquid-glass-btn px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black rounded-2xl text-sm flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setSwRunning(false)}
                    className="liquid-glass-btn px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl text-sm flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </button>
                )}

                <button
                  onClick={handleSwLap}
                  disabled={!swRunning}
                  className="liquid-glass-btn px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-black rounded-2xl text-sm flex items-center gap-2 cursor-pointer border border-white/10"
                >
                  <Flag className="w-4 h-4" />
                  <span>Split Lap</span>
                </button>

                <button
                  onClick={handleSwReset}
                  className="liquid-glass-btn px-6 py-3 bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-black rounded-2xl text-sm flex items-center gap-2 cursor-pointer border border-rose-500/30"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>

              {/* LAPS SPLIT TABLE */}
              {swLaps.length > 0 && (
                <div className="w-full max-w-md bg-slate-950 rounded-2xl border border-white/10 p-4 max-h-48 overflow-y-auto space-y-2">
                  <h5 className="text-xs font-mono font-bold text-zinc-400 uppercase">Lap Splits History</h5>
                  <div className="space-y-1.5 font-mono text-xs">
                    {swLaps.map((lap) => (
                      <div key={lap.id} className="flex items-center justify-between py-1 border-b border-zinc-800 text-zinc-300">
                        <span className="font-bold text-sky-400">Lap {lap.id}</span>
                        <span>Split: {formatMs(lap.split)}</span>
                        <span className="text-white font-bold">Total: {formatMs(lap.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TIMER */}
          {activeTab === 'TIMER' && (
            <div className="space-y-6 flex flex-col items-center justify-center py-2">
              
              {!timerRunning ? (
                <div className="flex items-center gap-4 bg-slate-950 p-6 rounded-3xl border border-white/10">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-mono text-zinc-400">Hours</span>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={timerInputH}
                      onChange={(e) => setTimerInputH(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 bg-slate-900 border border-zinc-700 rounded-xl py-2 text-center text-xl font-bold text-white font-mono"
                    />
                  </div>
                  <span className="text-2xl font-bold text-zinc-500">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-mono text-zinc-400">Minutes</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={timerInputM}
                      onChange={(e) => setTimerInputM(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 bg-slate-900 border border-zinc-700 rounded-xl py-2 text-center text-xl font-bold text-white font-mono"
                    />
                  </div>
                  <span className="text-2xl font-bold text-zinc-500">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-mono text-zinc-400">Seconds</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={timerInputS}
                      onChange={(e) => setTimerInputS(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 bg-slate-900 border border-zinc-700 rounded-xl py-2 text-center text-xl font-bold text-white font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-5xl sm:text-6xl font-black font-mono text-[#FF5F1F] tracking-widest bg-slate-950 px-8 py-6 rounded-3xl border-2 border-[#FF5F1F]/50 animate-pulse">
                  {formatTimerSeconds(timerRemainingSec)}
                </div>
              )}

              <div className="flex items-center gap-3">
                {!timerRunning ? (
                  <button
                    onClick={startTimer}
                    className="liquid-glass-btn px-6 py-3 bg-gradient-to-r from-[#FF5F1F] to-orange-500 text-black font-extrabold rounded-2xl text-sm flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Countdown</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setTimerRunning(false)}
                    className="liquid-glass-btn px-6 py-3 bg-amber-500 text-black font-extrabold rounded-2xl text-sm flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </button>
                )}

                <button
                  onClick={resetTimer}
                  className="liquid-glass-btn px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-2xl text-sm flex items-center gap-2 cursor-pointer border border-white/10"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: CALENDAR & REMINDERS */}
          {activeTab === 'CALENDAR' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* MONTHLY CALENDAR GRID */}
              <div className="bg-slate-950 p-4 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <button
                    onClick={prevMonth}
                    className="liquid-glass-btn p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-black text-white font-mono">
                    {monthName} {year}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="liquid-glass-btn p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-zinc-400">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 font-mono text-xs">
                  {daysArray.map((day, idx) => {
                    if (day === null) {
                      return <div key={idx} className="h-8" />;
                    }
                    const dStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    const isSelected = selectedDateStr === dStr;
                    const isToday = dStr === new Date().toISOString().split('T')[0];
                    const hasEvents = events.some((e) => e.dateStr === dStr);

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDateStr(dStr)}
                        className={`liquid-glass-btn h-9 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#FF5F1F] text-black font-extrabold shadow-md'
                            : isToday
                            ? 'bg-sky-500/30 text-sky-300 border border-sky-400/50 font-bold'
                            : 'bg-slate-900 hover:bg-slate-800 text-zinc-200'
                        }`}
                      >
                        <span>{day}</span>
                        {hasEvents && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-[#FF5F1F]'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* REMINDERS & EVENTS FOR SELECTED DAY */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h4 className="text-xs font-bold font-mono text-sky-400">
                    Events for {selectedDateStr}
                  </h4>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-zinc-300 font-mono">
                    {events.filter((e) => e.dateStr === selectedDateStr).length} Scheduled
                  </span>
                </div>

                {/* ADD EVENT FORM */}
                <form onSubmit={handleAddEvent} className="p-3 bg-slate-950 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Event or Reminder title..."
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      className="flex-1 bg-slate-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 font-mono"
                    />
                    <input
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="w-24 bg-slate-900 border border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={newEventCategory}
                      onChange={(e) => setNewEventCategory(e.target.value as any)}
                      className="bg-slate-900 border border-zinc-700 rounded-xl px-2 py-1 text-xs text-white font-mono"
                    >
                      <option value="Reminder">Reminder</option>
                      <option value="Flight">Flight Spotting</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Task">Task</option>
                    </select>

                    <button
                      type="submit"
                      className="liquid-glass-btn flex-1 py-1 bg-[#FF5F1F] hover:bg-orange-500 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Event</span>
                    </button>
                  </div>
                </form>

                {/* EVENT LIST */}
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {events
                    .filter((e) => e.dateStr === selectedDateStr)
                    .map((ev) => (
                      <div
                        key={ev.id}
                        className={`liquid-glass-btn p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                          ev.completed
                            ? 'bg-zinc-950 border-zinc-800 text-zinc-500 line-through'
                            : 'bg-slate-900 border-white/10 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleEventComplete(ev.id)}
                            className="liquid-glass-btn p-1 rounded text-emerald-400 hover:text-emerald-300"
                          >
                            <CheckCircle2 className={`liquid-glass-btn w-4 h-4 ${ev.completed ? 'fill-emerald-500 text-black' : ''}`} />
                          </button>
                          <div>
                            <span className="font-bold block">{ev.title}</span>
                            <span className="text-[10px] text-sky-400">
                              {ev.time} • {ev.category}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="liquid-glass-btn p-1 text-zinc-500 hover:text-rose-400"
                        >
                          <Trash2 className="liquid-glass-btn w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
