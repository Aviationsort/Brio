import React, { useState, useEffect } from 'react';

interface CityTime {
  name: string;
  timezone: string;
  offset: string;
}

const CITIES: CityTime[] = [
  { name: 'London', timezone: 'Europe/London', offset: 'UTC+0' },
  { name: 'Beirut', timezone: 'Asia/Beirut', offset: 'UTC+3' },
  { name: 'New York', timezone: 'America/New_York', offset: 'UTC-5' },
  { name: 'Tokyo', timezone: 'Asia/Tokyo', offset: 'UTC+9' },
  { name: 'Dubai', timezone: 'Asia/Dubai', offset: 'UTC+4' },
  { name: 'Los Angeles', timezone: 'America/Los_Angeles', offset: 'UTC-8' },
  { name: 'Paris', timezone: 'Europe/Paris', offset: 'UTC+2' },
  { name: 'Sydney', timezone: 'Australia/Sydney', offset: 'UTC+11' },
];

export const WorldClock: React.FC = () => {
  const [times, setTimes] = useState<Record<string, string>>({});
  const [dates, setDates] = useState<Record<string, string>>({});

  useEffect(() => {
    const update = () => {
      const newTimes: Record<string, string> = {};
      const newDates: Record<string, string> = {};
      CITIES.forEach((city) => {
        try {
          const now = new Date();
          const opts: Intl.DateTimeFormatOptions = { timeZone: city.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
          const dateOpts: Intl.DateTimeFormatOptions = { timeZone: city.timezone, weekday: 'short', month: 'short', day: 'numeric' };
          newTimes[city.name] = now.toLocaleTimeString('en-US', opts);
          newDates[city.name] = now.toLocaleDateString('en-US', dateOpts);
        } catch {
          newTimes[city.name] = '--:--:--';
          newDates[city.name] = '';
        }
      });
      setTimes(newTimes);
      setDates(newDates);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="p-2 skeuo-inset-panel border border-red-500/30 rounded-xl text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </span>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">World Clock</h2>
          <p className="text-[10px] font-mono text-zinc-400 mt-0.5">MULTI-TIMEZONE DISPLAY</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CITIES.map((city) => (
          <div key={city.name} className="skeuo-panel p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">{city.name}</p>
              <span className="text-[9px] font-mono text-zinc-500">{city.offset}</span>
            </div>
            <p className="text-3xl font-black text-red-300 tracking-tight font-mono">{times[city.name] || '--:--:--'}</p>
            <p className="text-[10px] text-zinc-400 font-mono">{dates[city.name] || ''}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
