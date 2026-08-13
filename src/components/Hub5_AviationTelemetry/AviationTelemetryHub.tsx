/**
 * Hub 5: Aviation, Optics Telemetry & Transit Timetables
 * Includes Camera Setup Rating Engine, Aviation Glossary, Bus Schedules (Lebanon & Cyprus), and System Telemetry
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CameraSetupRating, AviationTerm, BusSchedule } from '../../types';
import { Plane, Camera, Bus, Cpu, Search, Sparkles, ShieldCheck, Activity, Image as ImageIcon, ExternalLink, Lock } from 'lucide-react';
import { MyPlanePicsSuite } from './MyPlanePicsSuite';


// Pre-populated Aviation Terms
const AVIATION_GLOSSARY: AviationTerm[] = [
  { term: 'BEY', fullForm: 'Beirut Rafic Hariri International Airport', category: 'ATC', definition: 'Primary international airport of Lebanon located in Beirut.' },
  { term: 'LCA', fullForm: 'Larnaca International Airport', category: 'ATC', definition: 'Main international gateway of Cyprus located in Larnaca.' },
  { term: 'METAR', fullForm: 'Meteorological Aerodrome Report', category: 'Weather', definition: 'Routine weather report issued at hourly or half-hourly intervals.' },
  { term: 'ILS', fullForm: 'Instrument Landing System', category: 'Navigation', definition: 'Precision runway approach guide utilizing radio beams.' },
  { term: 'TCAS', fullForm: 'Traffic Collision Avoidance System', category: 'Airframes', definition: 'Airborne collision warning system monitoring transponder signals.' },
];

// Pre-populated Bus Schedules for Lebanon & Cyprus using official operator links
const BUS_SCHEDULES: BusSchedule[] = [
  // LEBANON
  {
    id: 'bus-1',
    country: 'Lebanon',
    routeNumber: 'L-01',
    routeName: 'Beirut - Tripoli Coastal Express (Connexion WENL)',
    origin: 'Cola / Charles Helou Station, Beirut',
    destination: 'Tripoli Port Main Station',
    stops: ['Beirut', 'Jounieh', 'Byblos', 'Batroun', 'Chekka', 'Tripoli'],
    departureTimes: ['06:00', '07:30', '09:00', '11:00', '13:30', '15:30', '17:30', '19:00'],
    fareLocalCurrency: '250,000 LBP',
    operator: 'Connexion (WENL Bus)',
    timetableUrl: 'https://wenlbus.com/schedule',
  },
  {
    id: 'bus-2',
    country: 'Lebanon',
    routeNumber: 'L-02',
    routeName: 'Tripoli - Beirut Express Corridor (Tripoline)',
    origin: 'Tripoli Al-Nour Square Station',
    destination: 'Beirut Charles Helou Bus Terminal',
    stops: ['Tripoli', 'Qalamoun', 'Batroun', 'Jbeil / Byblos', 'Jounieh', 'Beirut'],
    departureTimes: ['06:15', '08:00', '10:00', '12:30', '14:45', '17:00', '18:45'],
    fareLocalCurrency: '250,000 LBP',
    operator: 'Tripoline',
    timetableUrl: 'https://tripoline.org/en/Lines',
  },
  {
    id: 'bus-3',
    country: 'Lebanon',
    routeNumber: 'L-03',
    routeName: 'Greater Beirut & Mount Lebanon Transit (ACTCPT)',
    origin: 'Beirut Dora Bus Hub',
    destination: 'Jounieh - Byblos Metropolitan Line',
    stops: ['Dora', 'Antelias', 'Zouk Mosbeh', 'Jounieh', 'Tabarja', 'Byblos'],
    departureTimes: ['06:45', '08:15', '10:15', '12:00', '14:15', '16:30', '18:00'],
    fareLocalCurrency: '180,000 LBP',
    operator: 'ACTCPT (ACTC)',
    timetableUrl: 'https://actc-international.com',
  },

  // CYPRUS
  {
    id: 'bus-4',
    country: 'Cyprus',
    routeNumber: 'CY-IC01',
    routeName: 'Nicosia - Limassol Intercity Express',
    origin: 'Nicosia Solomos Square Station',
    destination: 'Limassol New Port / Old Hospital Terminal',
    stops: ['Nicosia Solomos Sq', 'Aglantzia', 'Kophinou Interchange', 'Limassol Center', 'Limassol New Port'],
    departureTimes: ['06:00', '07:30', '09:00', '11:00', '13:00', '15:00', '17:00', '19:30'],
    fareLocalCurrency: '€5.00 (Single) / €9.00 (Day Pass)',
    operator: 'Intercity Buses Cyprus',
    timetableUrl: 'https://intercity-buses.com/en/routes/',
  },
  {
    id: 'bus-5',
    country: 'Cyprus',
    routeNumber: 'CY-E30',
    routeName: 'Limassol Coast Coastal Trunk Line (EMEL)',
    origin: 'MyMall Limassol Terminal',
    destination: 'Parklane Resort / St. Raphael Hotel Coast',
    stops: ['MyMall', 'Limassol New Port', 'Old Port / Marina', 'Amathus Ruins', 'Parklane'],
    departureTimes: ['06:10', '07:15', '08:30', '10:00', '11:45', '13:30', '15:15', '17:00', '18:45', '20:30'],
    fareLocalCurrency: '€1.50',
    operator: 'EMEL (Limassol Buses)',
    timetableUrl: 'https://limassolbuses.com/routes/',
  },
  {
    id: 'bus-6',
    country: 'Cyprus',
    routeNumber: 'CY-P612',
    routeName: 'Paphos Harbour Station - Paphos Airport Express (OSYPA)',
    origin: 'Paphos Harbour Main Station',
    destination: 'Paphos International Airport Departure Terminal',
    stops: ['Paphos Harbour', 'Poseidonos Avenue', 'Yeroskipou', 'Paphos Airport'],
    departureTimes: ['07:05', '08:35', '10:15', '12:05', '14:20', '16:10', '18:00', '20:15', '22:30'],
    fareLocalCurrency: '€1.50',
    operator: 'OSYPA (Pafos Buses)',
    timetableUrl: 'https://www.pafosbuses.com/routes',
  },
  {
    id: 'bus-7',
    country: 'Cyprus',
    routeNumber: 'CY-O101',
    routeName: 'WaterWorld Ayia Napa - Protaras - Paralimni Loop (OSEA)',
    origin: 'WaterWorld Water Park Ayia Napa',
    destination: 'Paralimni Main Terminal Station',
    stops: ['WaterWorld', 'Nissi Beach', 'Ayia Napa Square', 'Cape Greco', 'Protaras', 'Paralimni'],
    departureTimes: ['06:30', '07:45', '09:15', '11:00', '12:30', '14:00', '15:45', '17:30', '19:15', '21:00'],
    fareLocalCurrency: '€1.50',
    operator: 'OSEA (Famagusta District)',
    timetableUrl: 'https://osea.com.cy/wp-content/uploads/2026/07/ΔΡΟΜΟΛΟΓΙΑ-ΟΣΕΑ-ΑΠΟ-25-05-2026-ΜΕΧΡΙ-31-10-2026-ΟΛΑ-ΜΑΖΙ-updated-on-10-07-2026-COLORED-1.pdf',
  },
  {
    id: 'bus-8',
    country: 'Cyprus',
    routeNumber: 'CY-K01',
    routeName: 'Larnaca Airport - Nicosia Capital Shuttle (Kapnos)',
    origin: 'Larnaca Airport Arrivals Terminal',
    destination: 'Nicosia Kyrenias Avenue Station',
    stops: ['Larnaca Airport Terminal 1', 'Aradippou', 'Aglantzia', 'Nicosia Capital Hub'],
    departureTimes: ['05:30', '07:15', '09:30', '11:45', '14:00', '16:30', '18:45', '21:15', '23:30'],
    fareLocalCurrency: '€9.00',
    operator: 'Kapnos Airport Shuttle',
    timetableUrl: 'https://kapnosairportshuttle.com/timetables',
  },
  {
    id: 'bus-9',
    country: 'Cyprus',
    routeNumber: 'CY-M401',
    routeName: 'Larnaca City Center & Airport Trunk Line (PAME)',
    origin: 'Larnaca Central Station',
    destination: 'Larnaca Airport Terminal / Mackenzie Beach',
    stops: ['Larnaca Station', 'Finikoudes Promenade', 'Mackenzie', 'Larnaca Airport'],
    departureTimes: ['06:00', '07:00', '08:15', '09:30', '11:00', '12:45', '14:15', '16:00', '17:30', '19:00', '21:00'],
    fareLocalCurrency: '€2.40',
    operator: 'PAME (Cyprus Public Transport)',
    timetableUrl: 'https://www.publictransport.com.cy/routes/page/routes-and-timetables',
  },
];

export const AviationTelemetryHub: React.FC = () => {
  const { telemetry, showToast } = useApp();
  const [subTab, setSubTab] = useState<'myplanepics' | 'camera' | 'glossary' | 'transit' | 'telemetry'>('myplanepics');


  // Camera Calculator Inputs
  const [cameraName, setCameraName] = useState('Sony A7 IV + 200-600mm G');
  const [focalLength, setFocalLength] = useState(400);
  const [aperture, setAperture] = useState(5.6);
  const [distance, setDistance] = useState(350);
  const [targetSpeed, setTargetSpeed] = useState(280); // km/h
  const [calcResult, setCalcResult] = useState<CameraSetupRating | null>(null);

  // Glossary Search
  const [glossarySearch, setGlossarySearch] = useState('');

  // Bus Filter & Search & Live Countdown State
  const [busCountry, setBusCountry] = useState<'Lebanon' | 'Cyprus'>('Lebanon');
  const [busSearch, setBusSearch] = useState('');
  const [nowTime, setNowTime] = useState<Date>(new Date());

  // Live timer for bus countdowns
  React.useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getNextBusCountdown = (departureTimes: string[]) => {
    if (!departureTimes || departureTimes.length === 0) return { label: 'No schedule', nextTime: '' };

    const currentMinutes = nowTime.getHours() * 60 + nowTime.getMinutes();
    const currentSeconds = nowTime.getSeconds();

    let nextMinutes = -1;
    let nextTimeStr = '';

    for (const timeStr of departureTimes) {
      const [hStr, mStr] = timeStr.split(':');
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      const depMins = h * 60 + m;

      if (depMins > currentMinutes) {
        nextMinutes = depMins;
        nextTimeStr = timeStr;
        break;
      }
    }

    // If past all buses today, target the first bus tomorrow
    let isTomorrow = false;
    if (nextMinutes === -1) {
      const [hStr, mStr] = departureTimes[0].split(':');
      nextMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
      nextTimeStr = departureTimes[0];
      isTomorrow = true;
    }

    let diffSecs = (nextMinutes - currentMinutes) * 60 - currentSeconds;
    if (isTomorrow) {
      diffSecs += 24 * 3600;
    }

    const hours = Math.floor(diffSecs / 3600);
    const mins = Math.floor((diffSecs % 3600) / 60);
    const secs = diffSecs % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const label = `${hours > 0 ? `${hours}h ` : ''}${mins}m ${pad(secs)}s${isTomorrow ? ' (Tomorrow)' : ''}`;

    return { label, nextTime: nextTimeStr };
  };

  const calculateOptics = () => {
    const cropFactor = 1.0;
    const effectiveFocalLength = focalLength * cropFactor;
    const fov = Math.round(57.3 * (36 / effectiveFocalLength));
    const minShutter = `1/${Math.max(500, Math.round((targetSpeed * 10) / 2))}`;
    const sharpnessScore = Math.min(98, Math.max(60, 100 - (aperture > 8 ? 15 : 0)));
    const motionBlurScore = targetSpeed > 400 ? 75 : 92;
    const overall = Math.round((sharpnessScore + motionBlurScore) / 2);

    const result: CameraSetupRating = {
      cameraName,
      sensorType: 'Full Frame',
      focalLengthMm: focalLength,
      apertureFStop: aperture,
      distanceMeters: distance,
      targetSpeedKmh: targetSpeed,
      lightingCondition: 'Bright Sun',
      cropFactor,
      effectiveFocalLength,
      fieldOfViewDeg: fov,
      minShutterSpeedSec: minShutter,
      opticalSharpnessScore: sharpnessScore,
      motionBlurSafetyScore: motionBlurScore,
      overallScore: overall,
      recommendations: [
        'Recommended Shutter: ' + minShutter + 's for crisp wingtips',
        'AF Mode: Continuous Tracking (AF-C) with Aviation Subject Detection',
      ],
    };

    setCalcResult(result);
    showToast('Optics Rated', `Overall Spotting Score: ${overall}/100`, 'success');
  };

  const filteredGlossary = AVIATION_GLOSSARY.filter(
    (g) =>
      g.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      g.definition.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  const filteredBuses = BUS_SCHEDULES.filter((b) => {
    if (b.country !== busCountry) return false;
    if (!busSearch.trim()) return true;
    const q = busSearch.toLowerCase();
    return (
      b.routeName.toLowerCase().includes(q) ||
      b.routeNumber.toLowerCase().includes(q) ||
      b.operator.toLowerCase().includes(q) ||
      b.origin.toLowerCase().includes(q) ||
      b.destination.toLowerCase().includes(q) ||
      b.stops.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Navigation Sub-bar */}
      <div className="flex items-center gap-2 p-1.5 bg-[#141414] border border-white/10 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab('myplanepics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'myplanepics'
              ? 'bg-[#FF5F1F] text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>MyPlanePics Vault & Ranking</span>
        </button>

        <button
          onClick={() => setSubTab('camera')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'camera'
              ? 'bg-[#FF5F1F] text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Optics Spotting Calculator</span>
        </button>

        <button
          onClick={() => setSubTab('glossary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'glossary'
              ? 'bg-[#FF5F1F] text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>Aviation Glossary</span>
        </button>

        <button
          onClick={() => setSubTab('transit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'transit'
              ? 'bg-[#FF5F1F] text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>Bus Schedules (Lebanon & Cyprus)</span>
        </button>

        <button
          onClick={() => setSubTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'telemetry'
              ? 'bg-[#FF5F1F] text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>System Telemetry & Vault Logs</span>
        </button>
      </div>

      {/* Sub-tab Views */}
      {subTab === 'myplanepics' && <MyPlanePicsSuite />}

      {subTab === 'camera' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="pb-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Spotting Calculator</p>
                <h3 className="text-base font-bold text-white">Camera & Optics Setup Rating</h3>
              </div>
              <Camera className="w-5 h-5 text-[#FF5F1F]" />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-400 font-mono">Camera / Lens Setup Name</label>
                <input
                  type="text"
                  value={cameraName}
                  onChange={(e) => setCameraName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:border-[#FF5F1F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 font-mono">Focal Length (mm)</label>
                  <input
                    type="number"
                    value={focalLength}
                    onChange={(e) => setFocalLength(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:border-[#FF5F1F]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 font-mono">Aperture (f/stop)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={aperture}
                    onChange={(e) => setAperture(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:border-[#FF5F1F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 font-mono">Target Distance (meters)</label>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:border-[#FF5F1F]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 font-mono">Target Speed (km/h)</label>
                  <input
                    type="number"
                    value={targetSpeed}
                    onChange={(e) => setTargetSpeed(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:border-[#FF5F1F]"
                  />
                </div>
              </div>

              <button
                onClick={calculateOptics}
                className="w-full py-3 bg-[#FF5F1F] hover:bg-[#ff7236] text-black font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Calculate Optics Rating
              </button>
            </div>
          </div>

          {/* Results Bento */}
          <div className="lg:col-span-6 bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Calculated Optical Metrics</h3>
            {calcResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Overall Spotting Score</p>
                    <p className="text-4xl font-black text-[#FF5F1F]">{calcResult.overallScore}/100</p>
                  </div>
                  <div className="text-right font-mono text-xs text-zinc-400">
                    <p>FOV: {calcResult.fieldOfViewDeg}°</p>
                    <p>Min Shutter: {calcResult.minShutterSpeedSec}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-white">System Recommendations:</p>
                  {calcResult.recommendations.map((rec, i) => (
                    <p key={i} className="text-xs font-mono text-zinc-300 p-2.5 bg-zinc-900 rounded-xl border border-white/5">
                      • {rec}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-800 rounded-2xl">
                Fill optical inputs and click Calculate Optics Rating.
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'glossary' && (
        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Aviation Terms</p>
              <h3 className="text-base font-bold text-white">Glossary & Acronym Dictionary</h3>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search acronyms..."
                value={glossarySearch}
                onChange={(e) => setGlossarySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:border-[#FF5F1F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredGlossary.map((item) => (
              <div key={item.term} className="p-4 bg-zinc-950 border border-white/10 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-[#FF5F1F] font-mono">{item.term}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/10">
                    {item.category}
                  </span>
                </div>
                {item.fullForm && <p className="text-xs font-bold text-white">{item.fullForm}</p>}
                <p className="text-xs text-zinc-400">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'transit' && (
        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
          {/* Transit Header & Filters */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#FF5F1F] uppercase tracking-widest font-black bg-[#FF5F1F]/10 px-2 py-0.5 rounded border border-[#FF5F1F]/30">
                  Live Operations
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Real-time Countdown Engine
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">Regional Bus Transit Timetables & Route Network</h3>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter route number, stop, operator..."
                  value={busSearch}
                  onChange={(e) => setBusSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:border-[#FF5F1F] placeholder-zinc-500"
                />
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => setBusCountry('Lebanon')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    busCountry === 'Lebanon' ? 'bg-[#FF5F1F] text-black shadow-lg font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  🇱🇧 Lebanon Network
                </button>
                <button
                  onClick={() => setBusCountry('Cyprus')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    busCountry === 'Cyprus' ? 'bg-[#FF5F1F] text-black shadow-lg font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  🇨🇾 Cyprus Network
                </button>
              </div>
            </div>
          </div>

          {/* Companies / Operators List Overview */}
          <div className="p-3 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs font-mono">
            <span className="text-zinc-400 font-bold shrink-0">Operator Networks:</span>
            {busCountry === 'Lebanon' ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 bg-zinc-900 text-amber-300 rounded-lg border border-amber-500/30 font-bold">Connexion WENL</span>
                <span className="px-2.5 py-1 bg-zinc-900 text-amber-300 rounded-lg border border-amber-500/30 font-bold">Tripoline Corridor</span>
                <span className="px-2.5 py-1 bg-zinc-900 text-amber-300 rounded-lg border border-amber-500/30 font-bold">ACTCPT (ACTC)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 bg-zinc-900 text-sky-300 rounded-lg border border-sky-500/30 font-bold">Intercity Buses</span>
                <span className="px-2.5 py-1 bg-zinc-900 text-sky-300 rounded-lg border border-sky-500/30 font-bold">EMEL Limassol</span>
                <span className="px-2.5 py-1 bg-zinc-900 text-sky-300 rounded-lg border border-sky-500/30 font-bold">OSYPA Pafos</span>
                <span className="px-2.5 py-1 bg-zinc-900 text-sky-300 rounded-lg border border-sky-500/30 font-bold">OSEA Famagusta</span>
                <span className="px-2.5 py-1 bg-zinc-900 text-sky-300 rounded-lg border border-sky-500/30 font-bold">Kapnos Shuttle</span>
                <span className="px-2.5 py-1 bg-zinc-900 text-sky-300 rounded-lg border border-sky-500/30 font-bold">PAME CPT</span>
              </div>
            )}
          </div>

          {/* Bus Cards List */}
          <div className="space-y-4">
            {filteredBuses.map((bus) => {
              const countdown = getNextBusCountdown(bus.departureTimes);
              return (
                <div key={bus.id} className="p-5 bg-zinc-950 border border-white/10 rounded-2xl space-y-4 hover:border-[#FF5F1F]/40 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-[#FF5F1F] font-black px-2.5 py-0.5 bg-[#FF5F1F]/10 border border-[#FF5F1F]/30 rounded-md">
                          {bus.routeNumber}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-3 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1.5 shadow-md animate-pulse">
                          <Bus className="w-3.5 h-3.5 text-amber-300" />
                          <span>ESTIMATED COUNTDOWN: {countdown.label}</span>
                          {countdown.nextTime && <span className="text-zinc-300 font-bold">({countdown.nextTime})</span>}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-white mt-1.5">{bus.routeName}</h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/30">
                        Fare: {bus.fareLocalCurrency}
                      </span>
                      {bus.timetableUrl && (
                        <a
                          href={bus.timetableUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-sky-500/30 rounded-full text-xs font-mono font-bold flex items-center gap-1 transition-all"
                        >
                          <span>Official Timetable</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-zinc-300 bg-zinc-900/80 p-3 rounded-xl border border-white/10">
                    <p><strong className="text-zinc-400">Origin Station:</strong> {bus.origin}</p>
                    <p><strong className="text-zinc-400">Destination:</strong> {bus.destination}</p>
                    <p><strong className="text-zinc-400">Operator Company:</strong> <span className="text-amber-300 font-bold">{bus.operator}</span></p>
                  </div>

                  {/* Complete Stops Sequence */}
                  {bus.stops && bus.stops.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-mono text-zinc-400 font-bold flex items-center justify-between">
                        <span>COMPLETE ROUTE STOPS ({bus.stops.length} STOPS TOTAL):</span>
                        <span className="text-[10px] text-zinc-500 font-normal">Sequence order Left to Right</span>
                      </p>
                      <div className="flex flex-wrap gap-2 items-center">
                        {bus.stops.map((stop, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="px-2.5 py-1 bg-zinc-900 text-white text-xs font-mono rounded-lg border border-white/10 font-medium">
                              <span className="text-[#FF5F1F] font-bold mr-1">#{i + 1}</span> {stop}
                            </span>
                            {i < bus.stops.length - 1 && <span className="text-zinc-600 font-bold">➔</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Departure Times with Next Bus Highlight */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-mono text-zinc-400 font-bold">
                      OFFICIAL DEPARTURE TIMES ({bus.departureTimes.length} SCHEDULED DEPARTURES):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {bus.departureTimes.map((t) => {
                        const isNext = t === countdown.nextTime;
                        return (
                          <span
                            key={t}
                            className={`px-3 py-1 font-mono text-xs rounded-xl font-bold border transition-all ${
                              isNext
                                ? 'bg-amber-500 text-black border-amber-300 shadow-lg scale-105 ring-2 ring-amber-300'
                                : 'bg-zinc-900 border-white/10 text-zinc-200'
                            }`}
                          >
                            {t} {isNext && '★ NEXT DEPARTURE'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredBuses.length === 0 && (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-800 rounded-2xl">
                No bus routes matched "{busSearch}". Try searching for city names or operators like Intercity, EMEL, OSYPA, OSEA, Kapnos, PAME, Connexion, Tripoline, or ACTCPT.
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'telemetry' && (
        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">System Health</p>
              <h3 className="text-base font-bold text-white">Live Telemetry & Cryptographic Worker Status</h3>
            </div>
            <Activity className="w-5 h-5 text-[#FF5F1F] animate-pulse" />
          </div>

          {/* Telemetry Bento Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">CPU Load</p>
              <p className="text-2xl font-bold text-[#FF5F1F] mt-1">{telemetry.cpuUsage}%</p>
            </div>
            <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">RAM Consumption</p>
              <p className="text-2xl font-bold text-white mt-1">{telemetry.ramUsageMb} MB</p>
            </div>
            <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">UI Refresh Rate</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{telemetry.fps} FPS</p>
            </div>
            <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Latency</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">{telemetry.networkLatencyMs} ms</p>
            </div>
          </div>

          {/* Worker Logs */}
          <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl space-y-2">
            <p className="text-[10px] text-zinc-500 font-bold font-mono uppercase tracking-widest">Vault System Logs</p>
            <div className="space-y-1 font-mono text-xs text-zinc-300 max-h-40 overflow-y-auto">
              {telemetry.systemLogs.map((log, i) => (
                <p key={i} className="text-zinc-400">
                  <span className="text-zinc-600">[{log.timestamp}]</span> [{log.level.toUpperCase()}] {log.message}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
