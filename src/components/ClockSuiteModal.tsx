import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { encryptionService } from '../utils/crypto';
import { dbManager } from '../utils/dbManager';
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
  Search,
  Sun,
  Moon,
  Cake,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  dateStr: string;
  title: string;
  category: 'Meeting' | 'Flight' | 'Reminder' | 'Task' | 'Personal';
  time: string;
  notes?: string;
  completed: boolean;
  isEncrypted: boolean;
}

interface Birthday {
  id: string;
  name: string;
  dateStr: string;
}

interface ClockSuiteModalProps {
  onClose: () => void;
}

export const ClockSuiteModal: React.FC<ClockSuiteModalProps> = ({ onClose }) => {
  const { t, showToast, user, activeVaultKey } = useApp();

  const [activeTab, setActiveTab] = useState<'ANALOG' | 'STOPWATCH' | 'TIMER' | 'CALENDAR'>('ANALOG');

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

  const smoothSecDegRef = useRef(secDeg);
  const smoothMinDegRef = useRef(minDeg);
  const smoothHourDegRef = useRef(hourDeg);
  const clockRafRef = useRef<number | null>(null);

  useEffect(() => {
    let animId: number;
    const tick = () => {
      const n = new Date();
      const s = n.getSeconds();
      const m = n.getMinutes();
      const h = n.getHours();
      smoothSecDegRef.current = (s / 60) * 360;
      smoothMinDegRef.current = ((m + s / 60) / 60) * 360;
      smoothHourDegRef.current = (((h % 12) + m / 60) / 12) * 360;
      clockRafRef.current = requestAnimationFrame(tick);
    };
    clockRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (clockRafRef.current !== null) cancelAnimationFrame(clockRafRef.current);
    };
  }, []);

  const [swRunning, setSwRunning] = useState(false);
  const [swTimeMs, setSwTimeMs] = useState(0);
  const [swLaps, setSwLaps] = useState<{ id: number; split: number; total: number }[]>([]);
  const swStartRef = useRef<number | null>(null);
  const swRafRef = useRef<number | null>(null);

  useEffect(() => {
    if (swRunning) {
      swStartRef.current = Date.now() - swTimeMs;
      const tick = () => {
        if (swStartRef.current !== null) {
          setSwTimeMs(Date.now() - swStartRef.current);
        }
        swRafRef.current = requestAnimationFrame(tick);
      };
      swRafRef.current = requestAnimationFrame(tick);
    } else {
      if (swRafRef.current !== null) {
        cancelAnimationFrame(swRafRef.current);
        swRafRef.current = null;
      }
      swStartRef.current = null;
    }
    return () => {
      if (swRafRef.current !== null) {
        cancelAnimationFrame(swRafRef.current);
        swRafRef.current = null;
      }
    };
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

  const formatTimerSeconds = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

  const [currentCalDate, setCurrentCalDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
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

  const loadCalendarEvents = useCallback(async () => {
    const key = activeVaultKey || user?.id || 'guest';
    const db = await dbManager.loadDatabase(key);
    if (db?.data?.calendarEvents && Array.isArray(db.data.calendarEvents)) {
      setEvents(db.data.calendarEvents as CalendarEvent[]);
    } else {
      const saved = localStorage.getItem(`brio_calendar_events_${user?.id || 'guest'}`);
      if (saved) {
        try {
          setEvents(JSON.parse(saved));
        } catch {
          // keep defaults
        }
      }
    }
  }, [activeVaultKey, user?.id]);

  useEffect(() => {
    loadCalendarEvents();
  }, [loadCalendarEvents]);

  const [birthdays, setBirthdays] = useState<Birthday[]>(() => {
    const saved = localStorage.getItem(`brio_birthdays_${user?.id || 'guest'}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [newBirthdayName, setNewBirthdayName] = useState('');
  const [newBirthdayDate, setNewBirthdayDate] = useState('');

  useEffect(() => {
    const saveEvents = async () => {
      const key = activeVaultKey || user?.id || 'guest';
      const db = await dbManager.loadDatabase(key);
      const updated = db
        ? { ...db, data: { ...db.data, calendarEvents: events } }
        : {
            metadata: { version: '2.0.0-DB', databaseName: key, createdAt: new Date().toISOString(), lastModified: new Date().toISOString(), tables: ['calendarEvents'], totalRecords: events.length, checksum: '', sizeBytes: 0 },
            data: { calendarEvents: events },
          };
      await dbManager.saveDatabase(updated.data, key);
      localStorage.setItem(`brio_calendar_events_${user?.id || 'guest'}`, JSON.stringify(events));
    };
    saveEvents();
  }, [events, user, activeVaultKey]);

  useEffect(() => {
    localStorage.setItem(
      `brio_birthdays_${user?.id || 'guest'}`,
      JSON.stringify(birthdays)
    );
  }, [birthdays, user]);

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

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('12:00');
  const [editCategory, setEditCategory] = useState<CalendarEvent['category']>('Reminder');
  const [editNotes, setEditNotes] = useState('');

  const startEditEvent = (ev: CalendarEvent) => {
    setEditingEventId(ev.id);
    setEditTitle(ev.title);
    setEditTime(ev.time);
    setEditCategory(ev.category);
    setEditNotes(ev.notes || '');
  };

  const saveEditEvent = () => {
    if (!editingEventId || !editTitle.trim()) {
      showToast('Validation Alert', 'Event title is required.', 'warning');
      return;
    }
    setEvents((prev) => prev.map((ev) => ev.id === editingEventId ? { ...ev, title: editTitle, time: editTime, category: editCategory, notes: editNotes } : ev));
    setEditingEventId(null);
    showToast('Event Updated', 'Event details saved successfully', 'success');
  };

  const cancelEditEvent = () => {
    setEditingEventId(null);
  };

  const handleAddBirthday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBirthdayName.trim() || !newBirthdayDate) {
      showToast('Validation Alert', 'Please enter a name and date for the birthday.', 'warning');
      return;
    }
    const newBday: Birthday = {
      id: `bday-${Date.now()}`,
      name: newBirthdayName.trim(),
      dateStr: newBirthdayDate,
    };
    setBirthdays((prev) => [...prev, newBday]);
    setNewBirthdayName('');
    setNewBirthdayDate('');
    showToast('Birthday Added', `Added birthday for ${newBday.name}`, 'success');
  };

  const deleteBirthday = (id: string) => {
    setBirthdays((prev) => prev.filter((b) => b.id !== id));
    showToast('Birthday Removed', 'Removed from birthday list', 'info');
  };

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

  const timezones = [
    { city: 'London (GMT)', timeZone: 'Europe/London', flag: '🇬🇧', offset: 'UTC+0' },
    { city: 'New York (EDT)', timeZone: 'America/New_York', flag: '🇺🇸', offset: 'UTC-4' },
    { city: 'Tokyo (JST)', timeZone: 'Asia/Tokyo', flag: '🇯🇵', offset: 'UTC+9' },
    { city: 'Dubai (GST)', timeZone: 'Asia/Dubai', flag: '🇦🇪', offset: 'UTC+4' },
    { city: 'Berlin (CEST)', timeZone: 'Europe/Berlin', flag: '🇩🇪', offset: 'UTC+2' },
    { city: 'Sydney (AEST)', timeZone: 'Australia/Sydney', flag: '🇦🇺', offset: 'UTC+10' },
    { city: 'Mumbai (IST)', timeZone: 'Asia/Kolkata', flag: '🇮🇳', offset: 'UTC+5:30' },
    { city: 'São Paulo (BRT)', timeZone: 'America/Sao_Paulo', flag: '🇧🇷', offset: 'UTC-3' },
    { city: 'Cairo (EET)', timeZone: 'Africa/Cairo', flag: '🇪🇬', offset: 'UTC+2' },
    { city: 'Los Angeles (PDT)', timeZone: 'America/Los_Angeles', flag: '🇺🇸', offset: 'UTC-7' },
    { city: 'Chicago (CDT)', timeZone: 'America/Chicago', flag: '🇺🇸', offset: 'UTC-5' },
    { city: 'Hong Kong (HKT)', timeZone: 'Asia/Hong_Kong', flag: '🇭🇰', offset: 'UTC+8' },
    { city: 'Singapore (SGT)', timeZone: 'Asia/Singapore', flag: '🇸🇬', offset: 'UTC+8' },
    { city: 'Seoul (KST)', timeZone: 'Asia/Seoul', flag: '🇰🇷', offset: 'UTC+9' },
    { city: 'Amsterdam (CET)', timeZone: 'Europe/Amsterdam', flag: '🇳🇱', offset: 'UTC+2' },
  ];

  const [worldClockSearch, setWorldClockSearch] = useState('');
  const filteredTimezones = timezones.filter(tz =>
    tz.city.toLowerCase().includes(worldClockSearch.toLowerCase()) ||
    tz.offset.toLowerCase().includes(worldClockSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xl animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl rounded-[28px] border-2 border-red-500/40 shadow-[0_24px_64px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh] skeuo-panel">
        
        {/* MODAL HEADER BAR */}
        <div className="skeuo-panel ">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-900/30 border border-red-500/40 text-red-400">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                <span>{t.clock || 'Clock & Calendar Suite'}</span>
                <span className="px-2 py-0.5 rounded-full bg-red-900/30 text-red-300 text-[10px] font-mono font-bold border border-red-500/30">
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
            className="skeuo-btn p-2 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUB-TABS SELECTOR */}
        <div className="px-6 py-3 skeuo-panel border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar ">
          <button
            onClick={() => setActiveTab('ANALOG')}
            className={`skeuo-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ANALOG'
                ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg border border-red-400/40 font-black'
                : 'bg-[#1a1a1a] text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t.analogClock || 'Analog Clock'}</span>
          </button>

          <button
            onClick={() => setActiveTab('STOPWATCH')}
            className={`skeuo-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'STOPWATCH'
                ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg border border-red-400/40 font-black'
                : 'bg-[#1a1a1a] text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{t.stopwatch || 'Stopwatch'}</span>
          </button>

          <button
            onClick={() => setActiveTab('TIMER')}
            className={`skeuo-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'TIMER'
                ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg border border-red-400/40 font-black'
                : 'bg-[#1a1a1a] text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <TimerIcon className="w-4 h-4" />
            <span>{t.timer || 'Timer'}</span>
          </button>

          <button
            onClick={() => setActiveTab('CALENDAR')}
            className={`skeuo-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CALENDAR'
                ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg border border-red-400/40 font-black'
                : 'bg-[#1a1a1a] text-zinc-300 hover:bg-zinc-800'
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
               
                {/* ANALOG CLOCK FACE */}
                <div className="flex flex-col items-center justify-center p-6 rounded-[2rem] border border-white/10 shadow-inner relative skeuo-panel">
                    <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-[#0f0f12] via-[#0a0a0e] to-[#111115] backdrop-blur-xl border-4 border-white/[0.08] shadow-[inset_0_6px_40px_rgba(0,0,0,0.95),0_0_80px_rgba(200,16,46,0.2),0_0_0_1px_rgba(255,255,255,0.04)] flex items-center justify-center skeuo-card">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-900/30 via-transparent to-red-600/10 pointer-events-none" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/[0.06] via-transparent to-transparent pointer-events-none" />
                      <div className="absolute inset-[3px] rounded-full border border-white/[0.03] pointer-events-none" />

                     {/* Metallic bezel */}
                     <div className="absolute inset-[-8px] rounded-full border-2 border-white/[0.06] pointer-events-none" style={{ boxShadow: '0 0 0 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }} />

                     {[...Array(60)].map((_, i) => {
                      const angle = i * 6;
                      const isHourTick = i % 5 === 0;
                      const tickLength = isHourTick ? 16 : 7;
                      const tickWidth = isHourTick ? 3 : 0.8;
                      const tickOpacity = isHourTick ? 1 : 0.3;
                      const isQuarter = i % 15 === 0;
                      const rad = (angle * Math.PI) / 180;
                      const innerR = 43;
                      const outerR = innerR + tickLength;
                      const x1 = 50 + innerR * Math.sin(rad);
                      const y1 = 50 - innerR * Math.cos(rad);
                      const x2 = 50 + outerR * Math.sin(rad);
                      const y2 = 50 - outerR * Math.cos(rad);
                      return (
                        <div
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            left: `${x1}%`,
                            top: `${y1}%`,
                            width: `${tickWidth}px`,
                            height: `${tickLength}px`,
                            transformOrigin: 'center center',
                            transform: `rotate(${angle}deg) translate(-50%, -50%)`,
                            background: isHourTick
                              ? isQuarter
                                ? 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(200,16,46,0.8))'
                                : 'linear-gradient(to bottom, rgba(255,255,255,0.85), rgba(255,255,255,0.2))'
                              : 'rgba(200,200,200,0.4)',
                            opacity: tickOpacity,
                            boxShadow: isHourTick ? '0 0 4px rgba(200,16,46,0.3)' : 'none',
                          }}
                        />
                      );
                    })}

                     {[...Array(12)].map((_, i) => {
                       const angle = (i + 1) * 30;
                       const rad = (angle * Math.PI) / 180;
                       const x = 50 + 33 * Math.sin(rad);
                       const y = 50 - 33 * Math.cos(rad);
                       return (
                         <span
                           key={i}
                           className="absolute text-sm sm:text-base font-black font-mono bg-gradient-to-b from-white via-white to-zinc-300 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                           style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                         >
                           {i + 1}
                         </span>
                       );
                     })}

                     {/* Date window at 3 o'clock */}
                     <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 sm:w-14 h-8 sm:h-9 rounded-md bg-gradient-to-b from-[#0a0a0e] to-[#050507] border border-white/10 flex items-center justify-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.05)]">
                       <span className="text-[10px] sm:text-xs font-black font-mono text-white tracking-wider">
                         {now.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                       </span>
                     </div>

                     <div
                      className="absolute left-1/2 bottom-1/2 -translate-x-1/2 origin-bottom rounded-full"
                      style={{
                        transform: `translateX(-50%) rotate(${smoothHourDegRef.current}deg)`,
                      }}
                    >
                      <div className="w-3 h-[72px] bg-gradient-to-t from-white via-zinc-100 to-zinc-300 rounded-t-full origin-bottom shadow-[0_0_14px_rgba(255,255,255,0.35),0_0_3px_rgba(255,255,255,0.2)]" />
                      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-zinc-200 mx-auto mt-[-2px] opacity-80" />
                    </div>

                    <div
                      className="absolute left-1/2 bottom-1/2 -translate-x-1/2 origin-bottom rounded-full"
                      style={{
                        transform: `translateX(-50%) rotate(${smoothMinDegRef.current}deg)`,
                      }}
                    >
                      <div className="w-2 h-28 bg-gradient-to-t from-[#C8102E] via-[#ff3b3b] to-[#ff6b6b] rounded-t-full origin-bottom shadow-[0_0_14px_rgba(200,16,46,0.5),0_0_4px_rgba(255,45,45,0.3)]" />
                      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-[#ff6b6b] mx-auto mt-[-2px] opacity-70" />
                    </div>

                    <div
                      className="absolute left-1/2 bottom-1/2 -translate-x-1/2 origin-bottom rounded-full"
                      style={{
                        transform: `translateX(-50%) rotate(${smoothSecDegRef.current}deg)`,
                      }}
                    >
                      <div className="w-[2px] h-32 bg-gradient-to-t from-[#FF2D2D] via-[#ff4545] to-[#ff7070] rounded-t-full origin-bottom shadow-[0_0_16px_rgba(255,45,45,0.7),0_0_5px_rgba(255,45,45,0.4)]" />
                      <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[8px] border-b-[#ff7070] mx-auto mt-[-3px] opacity-80" />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-[2px] h-5 bg-gradient-to-t from-[#C8102E] to-[#FF2D2D] rounded-b-full shadow-[0_0_4px_rgba(200,16,46,0.4)]" />
                    </div>

                    <div className="absolute w-7 h-7 rounded-full border-[2.5px] border-white/90 shadow-[0_0_0_3px_rgba(200,16,46,0.4),0_0_12px_rgba(200,16,46,0.2),inset_0_0_4px_rgba(0,0,0,0.5)] bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-300" />
                    <div className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-white to-zinc-200 shadow-[0_0_4px_rgba(0,0,0,0.3),0_0_8px_rgba(200,16,46,0.25)] z-10" />

                    {/* Seconds sub-dial */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-[#0a0a0e] to-[#050507] border border-white/[0.07] flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.7),0_0_8px_rgba(200,16,46,0.12)]">
                      <div className="relative w-full h-full">
                        {[...Array(12)].map((_, i) => {
                          const angle = i * 30;
                          const rad = (angle * Math.PI) / 180;
                          const x = 50 + 35 * Math.sin(rad);
                          const y = 50 - 35 * Math.cos(rad);
                          return (
                            <div
                              key={i}
                              className="absolute w-px h-1.5 bg-gradient-to-t from-zinc-600 to-zinc-400 rounded-full"
                              style={{
                                left: `${x}%`,
                                top: `${y}%`,
                                transform: 'translate(-50%, -50%)',
                              }}
                            />
                          );
                        })}
                        <div
                          className="absolute w-px h-6 bg-gradient-to-t from-[#C8102E] to-[#FF2D2D] rounded-full origin-bottom left-1/2 bottom-1/2 shadow-[0_0_4px_rgba(255,45,45,0.4)]"
                          style={{ transform: `translateX(-50%) rotate(${smoothSecDegRef.current}deg)` }}
                        />
                        <div className="absolute w-2 h-2 bg-gradient-to-br from-[#C8102E] to-[#ff4545] rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_4px_rgba(200,16,46,0.5)]" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <div className="text-4xl font-black font-mono text-white tracking-[0.2em] drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                      {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="mt-2 flex flex-col items-center gap-0.5">
                      <div className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-widest">
                        {now.toLocaleDateString(undefined, { weekday: 'long' })}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 tracking-wide">
                        {now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
               </div>

               {/* WORLD CLOCKS GRID */}
               <div className="space-y-5">
                 <div className="flex items-center justify-between">
                   <h4 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                     <Globe className="w-4 h-4 text-red-400" />
                     <span>World Clock Matrix</span>
                   </h4>
                 </div>

                 <div className="relative">
                   <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                   <input
                     type="text"
                     placeholder="Search cities or UTC offsets..."
                     value={worldClockSearch}
                     onChange={(e) => setWorldClockSearch(e.target.value)}
                     className="w-full pl-9 pr-3 py-2 bg-[#1a1a1a]/80 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-mono"
                   />
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                   {filteredTimezones.map((tz, idx) => {
                     const cityTime = new Date().toLocaleTimeString('en-US', {
                       timeZone: tz.timeZone,
                       hour: '2-digit',
                       minute: '2-digit',
                       hour12: false,
                     });
                     const cityDate = new Date().toLocaleDateString('en-US', {
                       timeZone: tz.timeZone,
                       weekday: 'short',
                       month: 'short',
                       day: 'numeric',
                     });
                     const cityHour = parseInt(new Date().toLocaleTimeString('en-US', {
                       timeZone: tz.timeZone,
                       hour: '2-digit',
                       hour12: false,
                     }));
                     const isDaytime = cityHour >= 6 && cityHour < 18;
                     return (
                       <div
                         key={idx}
                         className="p-4 rounded-2xl bg-gradient-to-br from-[#1a1a1a]/90 to-[#0a0a0c] border border-white/10 flex items-center justify-between shadow-lg hover:border-red-500/30 transition-all"
                       >
                         <div className="flex items-center gap-3">
                           <span className="text-2xl">{tz.flag}</span>
                           <div>
                             <div className="flex items-center gap-2">
                               <span className="text-xs font-bold text-white block">{tz.city.split(' (')[0]}</span>
                               {isDaytime ? <Sun className="w-3 h-3 text-red-400" /> : <Moon className="w-3 h-3 text-red-300" />}
                             </div>
                             <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{cityDate}</span>
                             <span className="text-[10px] font-mono text-zinc-600">{tz.offset}</span>
                           </div>
                         </div>
                         <div className="text-right">
                           <span className="text-sm font-mono font-black text-red-400 block">
                             {cityTime}
                           </span>
                           <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">
                             {tz.city.match(/\(([^)]+)\)/)?.[1] || ''}
                           </span>
                         </div>
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
               <div className="text-6xl sm:text-7xl font-black font-mono text-white tracking-wider bg-[#0a0a0c] px-10 py-8 rounded-[2rem] border-2 border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)]">
                 {formatMs(swTimeMs)}
               </div>

               <div className="flex items-center gap-5">
                 {!swRunning ? (
                   <button
                     onClick={() => setSwRunning(true)}
                     className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white font-black text-lg flex items-center justify-center cursor-pointer shadow-[0_4px_16px_rgba(200,16,46,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] border border-red-400/40 active:scale-95 transition-transform"
                   >
                     <Play className="w-7 h-7 fill-current ml-1" />
                   </button>
                 ) : (
                   <button
                     onClick={() => setSwRunning(false)}
                     className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white font-black text-lg flex items-center justify-center cursor-pointer shadow-[0_4px_16px_rgba(200,16,46,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] border border-red-400/40 active:scale-95 transition-transform"
                   >
                     <Pause className="w-7 h-7 fill-current" />
                   </button>
                 )}

                 <button
                   onClick={handleSwReset}
                   className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 text-white font-black text-sm flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/10 active:scale-95 transition-transform"
                 >
                   <RotateCcw className="w-6 h-6" />
                 </button>
               </div>

               {swLaps.length > 0 && (
                 <div className="w-full max-w-md skeuo-card rounded-2xl border border-white/10 max-h-64 overflow-y-auto">
                   <div className="space-y-0">
                     {swLaps.slice().reverse().map((lap, idx) => {
                       const isBest = swLaps.length > 1 && lap.split === Math.min(...swLaps.map(l => l.split));
                       const isWorst = swLaps.length > 1 && lap.split === Math.max(...swLaps.map(l => l.split));
                       const rowColor = idx % 2 === 0 ? 'bg-white/[0.03]' : 'bg-transparent';
                       return (
                         <div key={lap.id} className={`flex items-center justify-between px-4 py-2.5 text-xs font-mono border-b border-white/5 ${rowColor}`}>
                           <span className="text-zinc-500 font-bold w-12">Lap {lap.id}</span>
                           <span className={`flex-1 text-center ${isBest ? 'text-emerald-400 font-bold' : isWorst ? 'text-red-400 font-bold' : 'text-zinc-300'}`}>+{formatMs(lap.split)}</span>
                           <span className="text-white font-bold w-24 text-right">{formatMs(lap.total)}</span>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               )}
             </div>
           )}

          {/* TAB 3: TIMER */}
          {activeTab === 'TIMER' && (
            <div className="space-y-6 flex flex-col items-center justify-center py-2">
               
               {!timerRunning ? (
                 <div className="flex items-center gap-4 bg-[#0a0a0c] p-6 rounded-3xl border border-white/10">
                   <div className="flex flex-col items-center">
                     <span className="text-xs font-mono text-zinc-400">Hours</span>
                     <input
                       type="number"
                       min={0}
                       max={23}
                       value={timerInputH}
                       onChange={(e) => setTimerInputH(Math.max(0, parseInt(e.target.value) || 0))}
                       className="w-16 bg-[#1a1a1a] border border-zinc-700 rounded-xl py-2 text-center text-xl font-bold text-white font-mono"
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
                       className="w-16 bg-[#1a1a1a] border border-zinc-700 rounded-xl py-2 text-center text-xl font-bold text-white font-mono"
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
                       className="w-16 bg-[#1a1a1a] border border-zinc-700 rounded-xl py-2 text-center text-xl font-bold text-white font-mono"
                     />
                   </div>
                 </div>
               ) : (
                 <div className="text-5xl sm:text-6xl font-black font-mono text-red-500 tracking-widest bg-[#0a0a0c] px-8 py-6 rounded-3xl border-2 border-red-500/50 animate-pulse">
                   {formatTimerSeconds(timerRemainingSec)}
                 </div>
               )}

               <div className="flex items-center gap-3">
                 {!timerRunning ? (
                   <button
                     onClick={startTimer}
                     className="skeuo-btn-primary px-6 py-3 text-black font-extrabold rounded-2xl text-sm flex items-center gap-2 cursor-pointer shadow-lg"
                   >
                     <Play className="w-4 h-4 fill-current" />
                     <span>Start Countdown</span>
                   </button>
                 ) : (
                   <button
                     onClick={() => setTimerRunning(false)}
                     className="skeuo-btn-primary px-6 py-3 bg-red-500 text-black font-extrabold rounded-2xl text-sm flex items-center gap-2 cursor-pointer shadow-lg"
                   >
                     <Pause className="w-4 h-4 fill-current" />
                     <span>Pause</span>
                   </button>
                 )}

                 <button
                   onClick={resetTimer}
                   className="skeuo-btn px-6 py-3 text-white font-extrabold rounded-2xl text-sm flex items-center gap-2 cursor-pointer border border-white/10"
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
               <div className="bg-[#0a0a0c] p-4 rounded-3xl border border-white/10 space-y-3 skeuo-panel">
                 <div className="flex items-center justify-between px-2">
                   <button
                     onClick={prevMonth}
                     className="skeuo-btn p-1.5 rounded-xl cursor-pointer"
                   >
                     <ChevronLeft className="w-4 h-4" />
                   </button>
                   <span className="text-sm font-bold text-white font-mono tracking-wide">
                     {monthName} {year}
                   </span>
                   <button
                     onClick={nextMonth}
                     className="skeuo-btn p-1.5 rounded-xl cursor-pointer"
                   >
                     <ChevronRight className="w-4 h-4" />
                   </button>
                 </div>

                 <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-zinc-500">
                   <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                 </div>

                  <div className="grid grid-cols-7 gap-1 font-mono text-xs">
                    {daysArray.map((day, idx) => {
                      if (day === null) {
                        return <div key={idx} className="h-10" />;
                      }
                      const dStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                      const isSelected = selectedDateStr === dStr;
                      const isToday = dStr === new Date().toISOString().split('T')[0];
                      const hasBirthday = birthdays.some(b => {
                        const bDate = new Date(b.dateStr);
                        return bDate.getMonth() === month && bDate.getDate() === day;
                      });

                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDateStr(dStr)}
                          className={`skeuo-btn h-10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-white text-black font-bold'
                              : isToday
                              ? 'bg-zinc-800 text-white font-bold border border-zinc-600'
                              : 'bg-transparent text-zinc-300 hover:bg-zinc-900'
                          }`}
                        >
                          <span className="text-xs font-bold">{day}</span>
                          {hasBirthday && (
                            <span className="text-[8px] leading-none mt-0.5">🎂</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
               </div>

               {/* REMINDERS & EVENTS FOR SELECTED DAY */}
               <div className="space-y-4">
                 <h4 className="text-xs font-bold font-mono text-zinc-400">
                   Events for {selectedDateStr}
                 </h4>

                 {/* ADD EVENT FORM */}
                 <form onSubmit={handleAddEvent} className="skeuo-card p-3 rounded-2xl border border-white/10 space-y-2">
                   <div className="flex gap-2">
                     <input
                       type="text"
                       placeholder="Event title..."
                       value={newEventTitle}
                       onChange={(e) => setNewEventTitle(e.target.value)}
                       className="flex-1 bg-[#1a1a1a] border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 font-mono"
                     />
                     <input
                       type="time"
                       value={newEventTime}
                       onChange={(e) => setNewEventTime(e.target.value)}
                       className="w-24 bg-[#1a1a1a] border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                     />
                   </div>

                   <div className="flex gap-2">
                     <select
                       value={newEventCategory}
                       onChange={(e) => setNewEventCategory(e.target.value as any)}
                       className="bg-[#1a1a1a] border border-zinc-800 rounded-xl px-2 py-1 text-xs text-white font-mono"
                     >
                       <option value="Reminder">Reminder</option>
                       <option value="Flight">Flight Spotting</option>
                       <option value="Meeting">Meeting</option>
                       <option value="Task">Task</option>
                     </select>

                     <button
                       type="submit"
                       className="skeuo-btn flex-1 py-1 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                     >
                       <Plus className="w-3.5 h-3.5" />
                       <span>Add</span>
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
                          className={`skeuo-card p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                            ev.completed
                              ? 'bg-[#0a0a0c] border-zinc-800 text-zinc-500 line-through'
                              : editingEventId === ev.id
                              ? 'bg-red-950/30 border-red-500/30'
                              : 'bg-[#1a1a1a] border-zinc-700 text-white'
                          }`}
                        >
                          {editingEventId === ev.id ? (
                            <div className="flex-1 space-y-2">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="flex-1 bg-[#1a1a1a] border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                                  placeholder="Event title"
                                />
                                <input
                                  type="time"
                                  value={editTime}
                                  onChange={(e) => setEditTime(e.target.value)}
                                  className="w-20 bg-[#1a1a1a] border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                                />
                              </div>
                              <div className="flex gap-2">
                                <select
                                  value={editCategory}
                                  onChange={(e) => setEditCategory(e.target.value as any)}
                                  className="bg-[#1a1a1a] border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                                >
                                  <option value="Reminder">Reminder</option>
                                  <option value="Flight">Flight Spotting</option>
                                  <option value="Meeting">Meeting</option>
                                  <option value="Task">Task</option>
                                </select>
                                <button onClick={saveEditEvent} className="skeuo-btn-primary px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer">Save</button>
                                <button onClick={cancelEditEvent} className="skeuo-btn px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleEventComplete(ev.id)}
                                  className="skeuo-btn p-1 rounded text-zinc-400 hover:text-white"
                                >
                                  <CheckCircle2 className={`w-4 h-4 ${ev.completed ? 'fill-zinc-500 text-zinc-500' : ''}`} />
                                </button>
                                <div>
                                  <span className="font-bold block text-xs">{ev.title}</span>
                                  <span className="text-[10px] text-zinc-500">
                                    {ev.time} · {ev.category}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditEvent(ev)}
                                  className="skeuo-btn p-1 text-zinc-500 hover:text-white"
                                  title="Edit event"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button
                                  onClick={() => deleteEvent(ev.id)}
                                  className="skeuo-btn p-1 text-zinc-500 hover:text-white"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                  </div>

                 {/* BIRTHDAYS SECTION */}
                 <div className="space-y-3 pt-4 border-t border-white/10">
                   <h4 className="text-xs font-bold font-mono text-zinc-400 flex items-center gap-2">
                     <Cake className="w-4 h-4 text-red-400" />
                     Birthdays
                   </h4>

                   <form onSubmit={handleAddBirthday} className="skeuo-card p-3 rounded-2xl border border-white/10 space-y-2">
                     <div className="flex gap-2">
                       <input
                         type="text"
                         placeholder="Name..."
                         value={newBirthdayName}
                         onChange={(e) => setNewBirthdayName(e.target.value)}
                         className="flex-1 bg-[#1a1a1a] border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 font-mono"
                       />
                       <input
                         type="date"
                         value={newBirthdayDate}
                         onChange={(e) => setNewBirthdayDate(e.target.value)}
                         className="w-28 bg-[#1a1a1a] border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                       />
                     </div>
                     <button
                       type="submit"
                       className="skeuo-btn w-full py-1.5 bg-red-700 hover:bg-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                     >
                       <Plus className="w-3.5 h-3.5" />
                       <span>Add Birthday</span>
                     </button>
                   </form>

                   <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                     {birthdays.length === 0 && (
                       <p className="text-[10px] text-zinc-600 text-center py-2">No birthdays added yet</p>
                     )}
                     {birthdays.map((bday) => {
                       const bdayDate = new Date(bday.dateStr + 'T00:00:00');
                       const isToday = bday.dateStr === new Date().toISOString().split('T')[0];
                       const monthDay = bdayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                       return (
                         <div
                           key={bday.id}
                           className={`skeuo-card p-2 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                             isToday
                               ? 'bg-red-950/50 border-red-500/30 text-red-200'
                               : 'bg-[#1a1a1a] border-zinc-800 text-zinc-300'
                           }`}
                         >
                           <div className="flex items-center gap-2">
                             <span className="text-sm">🎂</span>
                             <div>
                               <span className="font-bold block text-xs">{bday.name}</span>
                               <span className="text-[10px] text-zinc-500">{monthDay}</span>
                             </div>
                           </div>
                           <button
                             onClick={() => deleteBirthday(bday.id)}
                             className="skeuo-btn p-1 text-zinc-500 hover:text-white"
                           >
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
