/**
 * Hub 5: Aviation Telemetry & MyPlanePics
 * Includes MyPlanePics Vault and enhanced System Telemetry
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cpu, Search, ShieldCheck, Activity, Image as ImageIcon,
  Gauge, Battery, Monitor, Globe, Clock, Zap,
  HardDrive as HardDriveIcon, Thermometer,
  Wifi, WifiOff, Network, RefreshCw, Server, Timer, Info,
  Signal, History,
} from 'lucide-react';

type SpeedTestState = 'idle' | 'testing' | 'done' | 'error';

const HISTORY_LENGTH = 30;

const MiniSparkline: React.FC<{ data: number[]; color: string; height?: number; width?: number }> = ({
  data, color, height = 40, width = 150,
}) => {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} className="overflow-visible">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke={color} strokeWidth="1.5" opacity="0.3" />
      </svg>
    );
  }
  const padded = [...data];
  while (padded.length < HISTORY_LENGTH) padded.unshift(padded[0]);
  const visible = padded.slice(-HISTORY_LENGTH);
  const min = Math.min(...visible);
  const max = Math.max(...visible);
  const range = max - min || 1;
  const points = visible.map((v, i) => {
    const x = (i / (visible.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const lineD = `M ${points.join(' L ')}`;
  const areaD = `${lineD} L ${width},${height} L 0,${height} Z`;
  const lastVal = visible[visible.length - 1];
  const lastX = width;
  const lastY = height - ((lastVal - min) / range) * height;
  const gradId = `sg-${color.replace('#', '')}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="3" fill={color} />
      <text x={lastX - 4} y={lastY - 6} fill={color} fontSize="9" fontFamily="monospace" textAnchor="end">
        {typeof lastVal === 'number' ? (lastVal >= 1000 ? `${(lastVal / 1000).toFixed(1)}k` : lastVal.toFixed(1)) : lastVal}
      </text>
    </svg>
  );
};

const UsageBar: React.FC<{ percent: number; color?: string }> = ({ percent, color = '#C8102E' }) => {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
};

const HistoryChartRow: React.FC<{
  label: string; icon: React.ReactNode; data: number[] | undefined;
  color: string; unit: string; max?: number;
}> = ({ label, icon, data, color, unit, max = 100 }) => {
  const last = data && data.length > 0 ? data[data.length - 1] : undefined;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-[10px] text-zinc-500 w-16 shrink-0 font-mono uppercase tracking-wider">{label}</span>
      <MiniSparkline data={data || []} color={color} height={36} width={140} />
      <span className="text-[11px] font-mono text-zinc-300 w-16 text-right">
        {last !== undefined ? `${last.toFixed(1)}${unit}` : `--${unit}`}
      </span>
    </div>
  );
};

const formatUptime = (seconds?: number) => {
  if (seconds === undefined || seconds === null) return '--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const formatBytes = (mb?: number) => {
  if (mb === undefined || mb === null) return '--';
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
};

const formatTemp = (c?: number) => (c !== undefined ? `${c}°C` : '--');

const formatBatteryTime = (sec?: number) => {
  if (!sec && sec !== 0) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
};

export const AviationTelemetryHub: React.FC = () => {
  const { telemetry, showToast } = useApp();
  const [speedState, setSpeedState] = useState<SpeedTestState>('idle');
  const [downloadMbps, setDownloadMbps] = useState<number | null>(null);
  const [uploadMbps, setUploadMbps] = useState<number | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [jitterMs, setJitterMs] = useState<number | null>(null);
  const [packetLoss, setPacketLoss] = useState<number>(0);
  const [testQuality, setTestQuality] = useState<string>('');
  const [testHistory, setTestHistory] = useState<{date: string; download: number; upload: number; ping: number; jitter: number; packetLoss: number; quality: string}[]>([]);
  const [liveGraphData, setLiveGraphData] = useState<{time: number; speed: number}[]>([]);
  const [pingHistoryArr, setPingHistoryArr] = useState<number[]>([]);
  const [downloadSamplesArr, setDownloadSamplesArr] = useState<number[]>([]);
  const [uploadSamplesArr, setUploadSamplesArr] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('brio_speedtest_history');
      if (stored) setTestHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const runSpeedTest = useCallback(async () => {
    setSpeedState('testing');
    setDownloadMbps(null);
    setUploadMbps(null);
    setPingMs(null);
    setJitterMs(null);
    setPacketLoss(0);
    setTestQuality('');
    setLiveGraphData([]);
    setPingHistoryArr([]);
    setDownloadSamplesArr([]);
    setUploadSamplesArr([]);

    try {
      const pings: number[] = [];
      const pingTarget = 'https://1.1.1.1/cdn-cgi/trace';
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        try {
          await fetch(pingTarget + '?_=' + Date.now(), { mode: 'no-cors', cache: 'no-store' });
        } catch {}
        const end = performance.now();
        const rtt = Math.round(end - start);
        if (rtt > 0 && rtt < 5000) pings.push(rtt);
        if (i < 9) await new Promise(r => setTimeout(r, 150));
      }

      const avgPing = pings.length > 0 ? Math.round(pings.reduce((a, b) => a + b, 0) / pings.length) : 0;
      const jitter = pings.length > 1
        ? Math.round(pings.reduce((sum, p) => sum + Math.abs(p - avgPing), 0) / (pings.length - 1))
        : 0;
      const loss = Math.round(((10 - pings.length) / 10) * 100);
      setPingMs(avgPing);
      setPingHistoryArr(pings);
      setJitterMs(jitter);
      setPacketLoss(loss);

      const downloadSamples: number[] = [];
      const dlChunks = [
        'https://httpbin.org/bytes/524288',
        'https://httpbin.org/bytes/524288',
        'https://httpbin.org/bytes/524288',
      ];
      let totalDlBits = 0;
      let totalDlTime = 0;

      for (const url of dlChunks) {
        const start = performance.now();
        try {
          const response = await fetch(url + '?_=' + Date.now(), { cache: 'no-store' });
          const blob = await response.blob();
          const end = performance.now();
          const duration = (end - start) / 1000;
          const bits = blob.size * 8;
          totalDlBits += bits;
          totalDlTime += duration;
          const mbps = duration > 0 ? Math.round((bits / duration) / 1_000_000) : 0;
          downloadSamples.push(mbps);
          setLiveGraphData(prev => [...prev, { time: end, speed: mbps }]);
        } catch {}
      }

      const avgDlMbps = totalDlTime > 0 ? Math.round((totalDlBits / totalDlTime) / 1_000_000) : 0;
      setDownloadMbps(avgDlMbps || null);
      setDownloadSamplesArr(downloadSamples);

      const uploadSamples: number[] = [];
      const ulSize = 256 * 1024;
      let totalUlBits = 0;
      let totalUlTime = 0;

      for (let i = 0; i < 3; i++) {
        const blob = new Blob([new Uint8Array(ulSize)], { type: 'application/octet-stream' });
        const start = performance.now();
        try {
          await fetch('https://httpbin.org/post?_=' + Date.now() + '_' + i, {
            method: 'POST',
            body: blob,
            mode: 'no-cors',
          });
          const end = performance.now();
          const duration = (end - start) / 1000;
          const bits = ulSize * 8;
          totalUlBits += bits;
          totalUlTime += duration;
          const mbps = duration > 0 ? Math.round((bits / duration) / 1_000_000) : 0;
          uploadSamples.push(mbps);
          setLiveGraphData(prev => [...prev, { time: end, speed: mbps }]);
        } catch {}
      }

      const avgUlMbps = totalUlTime > 0 ? Math.round((totalUlBits / totalUlTime) / 1_000_000) : 0;
      setUploadMbps(avgUlMbps || null);
      setUploadSamplesArr(uploadSamples);

      let quality = 'Poor';
      if (avgDlMbps >= 50 && avgUlMbps >= 20 && avgPing > 0 && avgPing < 20 && loss < 1) quality = 'Excellent';
      else if (avgDlMbps >= 25 && avgUlMbps >= 10 && avgPing > 0 && avgPing < 50 && loss < 5) quality = 'Good';
      else if (avgDlMbps >= 10 && avgUlMbps >= 5 && avgPing > 0 && avgPing < 100 && loss < 10) quality = 'Fair';
      setTestQuality(quality);

      setSpeedState('done');
      showToast('Speed Test Complete', `DL: ${avgDlMbps} Mbps | UL: ${avgUlMbps} Mbps | Ping: ${avgPing}ms | Jitter: ${jitter}ms`, 'success');

      setTestHistory(prev => {
        const next = [{ date: new Date().toLocaleTimeString(), download: avgDlMbps, upload: avgUlMbps, ping: avgPing, jitter, packetLoss: loss, quality }, ...prev].slice(0, 10);
        try { localStorage.setItem('brio_speedtest_history', JSON.stringify(next)); } catch {}
        return next;
      });
    } catch {
      setSpeedState('error');
      showToast('Speed Test Failed', 'Unable to reach test servers. Please try again.', 'error');
    }
  }, [showToast]);

  const isOnline = navigator.onLine;

  const cpuPercent = useMemo(() => {
    const v = telemetry.cpuHistory && telemetry.cpuHistory.length > 0
      ? telemetry.cpuHistory[telemetry.cpuHistory.length - 1]
      : telemetry.cpuUsage;
    return Math.max(0, Math.min(100, v));
  }, [telemetry.cpuHistory, telemetry.cpuUsage]);

  const ramPercent = useMemo(() => {
    return telemetry.ramUsagePercent ?? (telemetry.ramTotalMb ? Math.round((telemetry.ramUsageMb / telemetry.ramTotalMb) * 100) : 0);
  }, [telemetry.ramUsagePercent, telemetry.ramUsageMb, telemetry.ramTotalMb]);

  const hasHistory = (telemetry.cpuHistory?.length || 0) > 0;

  return (
    <div className="space-y-4">
      {/* System Overview Banner */}
          <div className="skeuo-panel p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">System Health Monitor</p>
                <h3 className="text-base font-bold text-white">Live Telemetry & Network Speed Test</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${isOnline ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <Activity className="w-5 h-5 text-red-500 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {telemetry.uptimeSeconds !== undefined && (
                <span className="flex items-center gap-1.5 text-[11px] text-zinc-300 font-mono bg-black/30 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-red-400" />
                  Uptime: {formatUptime(telemetry.uptimeSeconds)}
                </span>
              )}
              {telemetry.osPlatform && (
                <span className="flex items-center gap-1.5 text-[11px] text-zinc-300 font-mono bg-black/30 px-2.5 py-1 rounded-lg">
                  <Monitor className="w-3.5 h-3.5 text-red-400" />
                  {telemetry.osPlatform}
                </span>
              )}
              {telemetry.screenResolution && (
                <span className="text-[11px] text-zinc-400 font-mono bg-black/30 px-2.5 py-1 rounded-lg">
                  {telemetry.screenResolution}
                </span>
              )}
              {telemetry.language && (
                <span className="text-[11px] text-zinc-400 font-mono bg-black/30 px-2.5 py-1 rounded-lg">
                  {telemetry.language.toUpperCase()}
                </span>
              )}
              {telemetry.cpuName && (
                <span className="text-[11px] text-zinc-300 font-mono bg-black/30 px-2.5 py-1 rounded-lg truncate max-w-[200px]" title={telemetry.cpuName}>
                  {telemetry.cpuName}
                </span>
              )}
            </div>
          </div>

          {/* Speed Test */}
          <div className="skeuo-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-red-400" />
                <p className="text-xs font-bold text-white uppercase tracking-widest">Network Speed Test</p>
                {testQuality && speedState === 'done' && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    testQuality === 'Excellent' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    testQuality === 'Good' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    testQuality === 'Fair' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {testQuality}
                  </span>
                )}
              </div>
              <button
                onClick={runSpeedTest}
                disabled={speedState === 'testing'}
                className="skeuo-btn px-4 py-2 rounded-xl bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white text-xs font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${speedState === 'testing' ? 'animate-spin' : ''}`} />
                {speedState === 'testing' ? 'Testing...' : speedState === 'done' ? 'Retest' : 'Start Test'}
              </button>
            </div>

            {/* Phase indicator */}
            {speedState === 'testing' && (
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                <span className={`w-2 h-2 rounded-full ${liveGraphData.length === 0 ? 'bg-red-400 animate-pulse' : 'bg-zinc-600'}`}>●</span>
                Ping
                <span className={`w-2 h-2 rounded-full ml-2 ${pingMs !== null && jitterMs === null ? 'bg-red-400 animate-pulse' : 'bg-zinc-600'}`}>●</span>
                Download
                <span className={`w-2 h-2 rounded-full ml-2 ${downloadMbps !== null && uploadMbps === null ? 'bg-red-400 animate-pulse' : 'bg-zinc-600'}`}>●</span>
                Upload
                <span className={`w-2 h-2 rounded-full ml-2 ${uploadMbps !== null ? 'bg-red-400 animate-pulse' : 'bg-zinc-600'}`}>●</span>
              </div>
            )}

            {/* Real-time Graph */}
            {speedState === 'testing' && liveGraphData.length > 0 && (
              <div className="skeuo-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Live Speed</p>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {liveGraphData[liveGraphData.length - 1]?.speed || 0} Mbps
                  </span>
                </div>
                <MiniSparkline
                  data={liveGraphData.map(d => d.speed)}
                  color="#C8102E"
                  height={60}
                  width={300}
                />
              </div>
            )}

            {/* Results */}
            {speedState !== 'idle' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="skeuo-card p-3">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Ping</p>
                  <p className="text-lg font-bold text-red-300 mt-1">{pingMs !== null ? `${pingMs} ms` : '--'}</p>
                  {jitterMs !== null && <p className="text-[10px] text-zinc-500 font-mono">Jitter: {jitterMs}ms</p>}
                </div>
                <div className="skeuo-card p-3">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Download</p>
                  <p className="text-lg font-bold text-white mt-1">{downloadMbps !== null ? `${downloadMbps} Mbps` : '--'}</p>
                  {downloadSamplesArr.length > 0 && <p className="text-[10px] text-zinc-500 font-mono">{downloadSamplesArr.length} chunks</p>}
                </div>
                <div className="skeuo-card p-3">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Upload</p>
                  <p className="text-lg font-bold text-red-400 mt-1">{uploadMbps !== null ? `${uploadMbps} Mbps` : '--'}</p>
                  {uploadSamplesArr.length > 0 && <p className="text-[10px] text-zinc-500 font-mono">{uploadSamplesArr.length} chunks</p>}
                </div>
              </div>
            )}

            {/* Extended Metrics */}
            {speedState === 'done' && (
              <div className="grid grid-cols-4 gap-2">
                <div className="skeuo-card p-2 text-center">
                  <p className="text-[9px] text-zinc-500 uppercase">Jitter</p>
                  <p className="text-sm font-bold text-zinc-200 font-mono">{jitterMs !== null ? `${jitterMs}ms` : '--'}</p>
                </div>
                <div className="skeuo-card p-2 text-center">
                  <p className="text-[9px] text-zinc-500 uppercase">Packet Loss</p>
                  <p className="text-sm font-bold text-zinc-200 font-mono">{packetLoss}%</p>
                </div>
                <div className="skeuo-card p-2 text-center">
                  <p className="text-[9px] text-zinc-500 uppercase">DL Samples</p>
                  <p className="text-sm font-bold text-zinc-200 font-mono">{downloadSamplesArr.length}</p>
                </div>
                <div className="skeuo-card p-2 text-center">
                  <p className="text-[9px] text-zinc-500 uppercase">UL Samples</p>
                  <p className="text-sm font-bold text-zinc-200 font-mono">{uploadSamplesArr.length}</p>
                </div>
              </div>
            )}

            <p className="text-[10px] text-zinc-500 font-mono">
              {speedState === 'testing' ? 'Measuring... Please wait.' :
               speedState === 'done' ? `Test completed at ${testHistory[0]?.date}` :
               'Max transfer per test: ~1.5 MB download + ~0.5 MB upload (multi-chunk)'}
            </p>
          </div>

          {/* Speed Test History */}
          {testHistory.length > 0 && (
            <div className="skeuo-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-red-400" />
                <p className="text-xs font-bold text-white uppercase tracking-widest">Test History</p>
                <span className="text-[10px] text-zinc-500 font-mono ml-auto">{testHistory.length} records</span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {testHistory.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-black/20 border border-white/5 text-[11px]">
                    <span className="text-zinc-500 font-mono w-16">{h.date}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      h.quality === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                      h.quality === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                      h.quality === 'Fair' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{h.quality}</span>
                    <span className="text-zinc-300 font-mono">↓{h.download}</span>
                    <span className="text-zinc-300 font-mono">↑{h.upload}</span>
                    <span className="text-zinc-400 font-mono">{h.ping}ms</span>
                    <span className="text-zinc-500 font-mono">J:{h.jitter}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Live Resource Monitor Charts ── */}
          {hasHistory && (
            <div className="skeuo-card p-4 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-red-400" />
                <p className="text-xs font-bold text-white uppercase tracking-widest">Live Resource Monitor</p>
                <span className="text-[10px] text-zinc-500 font-mono ml-auto">60s rolling window</span>
              </div>
              <HistoryChartRow label="CPU" icon={<Cpu className="w-3 h-3 text-red-400" />} data={telemetry.cpuHistory} color="#C8102E" unit="%" />
              <HistoryChartRow label="RAM" icon={<HardDriveIcon className="w-3 h-3 text-orange-400" />} data={telemetry.ramHistory} color="#f97316" unit="%" />
              <HistoryChartRow label="FPS" icon={<Zap className="w-3 h-3 text-red-400" />} data={telemetry.fpsHistory} color="#ef4444" unit="" max={120} />
              <HistoryChartRow label="Net" icon={<Globe className="w-3 h-3 text-red-300" />} data={telemetry.networkHistory} color="#f87171" unit="ms" />
            </div>
          )}

          {/* ── CPU Details ── */}
          <div className="skeuo-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-red-400" />
              <p className="text-xs font-bold text-white uppercase tracking-widest">Processor</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">CPU Load</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold text-red-500">{cpuPercent}%</p>
                </div>
                <UsageBar percent={cpuPercent} color="#C8102E" />
              </div>
              {telemetry.cpuName && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Name</p>
                  <p className="text-xs font-bold text-white mt-1 break-all leading-snug">{telemetry.cpuName}</p>
                </div>
              )}
              <div className="flex gap-4">
                {telemetry.cpuCores !== undefined && (
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Cores</p>
                    <p className="text-sm font-bold text-red-300 mt-0.5">{telemetry.cpuCores}</p>
                  </div>
                )}
                {telemetry.cpuThreads !== undefined && (
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Threads</p>
                    <p className="text-sm font-bold text-red-300 mt-0.5">{telemetry.cpuThreads}</p>
                  </div>
                )}
              </div>
              {telemetry.cpuSpeedMhz !== undefined && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Base Clock</p>
                  <p className="text-sm font-bold text-zinc-300 mt-0.5 font-mono">{(telemetry.cpuSpeedMhz / 1000).toFixed(1)} GHz</p>
                </div>
              )}
              {telemetry.cpuTemperature !== undefined && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Est. Temp</p>
                  <p className={`text-sm font-bold mt-0.5 font-mono flex items-center gap-1 ${telemetry.cpuTemperature > 70 ? 'text-red-400' : 'text-zinc-300'}`}>
                    <Thermometer className="w-3 h-3" />
                    {formatTemp(telemetry.cpuTemperature)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── RAM Details ── */}
          <div className="skeuo-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <HardDriveIcon className="w-4 h-4 text-orange-400" />
              <p className="text-xs font-bold text-white uppercase tracking-widest">Memory (RAM)</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white">{formatBytes(telemetry.ramTotalMb)}</p>
                <span className="text-[10px] text-zinc-500">Total</span>
              </div>
              <UsageBar percent={ramPercent} color="#f97316" />
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Used</p>
                  <p className="text-sm font-bold text-red-300 mt-0.5">{formatBytes(telemetry.ramUsageMb)}</p>
                </div>
                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Available</p>
                  <p className="text-sm font-bold text-green-300 mt-0.5">{formatBytes(telemetry.ramAvailableMb)}</p>
                </div>
                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Cached</p>
                  <p className="text-sm font-bold text-zinc-300 mt-0.5">{formatBytes(telemetry.ramCachedMb)}</p>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">
                {ramPercent}% utilized · {formatBytes(telemetry.ramAvailableMb)} free · {formatBytes(telemetry.ramCachedMb)} cached
              </p>
            </div>
          </div>

          {/* ── GPU Details ── */}
          {telemetry.gpuName && (
            <div className="skeuo-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-400" />
                <p className="text-xs font-bold text-white uppercase tracking-widest">Graphics Processor</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-red-200 break-all">{telemetry.gpuName}</p>
                {telemetry.gpuDriver && <p className="text-[10px] text-zinc-500 font-mono">{telemetry.gpuDriver}</p>}
                <div className="grid grid-cols-3 gap-2">
                  {telemetry.gpuMemoryTotalMb !== undefined && (
                    <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">VRAM Total</p>
                      <p className="text-sm font-bold text-white mt-0.5">{formatBytes(telemetry.gpuMemoryTotalMb)}</p>
                    </div>
                  )}
                  {telemetry.gpuMemoryMb !== undefined && (
                    <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">VRAM Used</p>
                      <p className="text-sm font-bold text-red-300 mt-0.5">{formatBytes(telemetry.gpuMemoryMb)}</p>
                    </div>
                  )}
                  {telemetry.gpuUtilization !== undefined && (
                    <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Utilization</p>
                      <p className="text-sm font-bold text-orange-400 mt-0.5">{telemetry.gpuUtilization}%</p>
                      <UsageBar percent={telemetry.gpuUtilization} color="#f97316" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Disk / Storage ── */}
          {(telemetry.disks && telemetry.disks.length > 0) || telemetry.romTotalGb ? (
            <div className="skeuo-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <HardDriveIcon className="w-4 h-4 text-red-400" />
                <p className="text-xs font-bold text-white uppercase tracking-widest">Storage Drives</p>
              </div>
              <div className="space-y-3">
                {(telemetry.disks || [{ name: 'System Drive', totalGb: telemetry.romTotalGb, usedGb: telemetry.romUsedGb, freeGb: (telemetry.romTotalGb || 0) - (telemetry.romUsedGb || 0), usagePercent: telemetry.romTotalGb ? Math.round((telemetry.romUsedGb || 0) / telemetry.romTotalGb * 100) : 0 }]).map((disk, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">{disk.name}</p>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {disk.totalGb ? `${disk.totalGb.toFixed(1)} GB total` : ''}
                      </span>
                    </div>
                    <UsageBar percent={disk.usagePercent} color={disk.usagePercent > 80 ? '#C8102E' : disk.usagePercent > 50 ? '#f97316' : '#22c55e'} />
                    <div className="flex gap-3 text-[10px] font-mono">
                      <span className="text-red-300">Used: {disk.usedGb.toFixed(1)} GB</span>
                      <span className="text-green-300">Free: {disk.freeGb.toFixed(1)} GB</span>
                      <span className="text-zinc-400">{disk.usagePercent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* ── Network ── */}
          <div className="skeuo-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-red-400" />
              <p className="text-xs font-bold text-white uppercase tracking-widest">Network</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Interface</p>
                <p className="text-sm font-bold text-white mt-0.5 font-mono">
                  {telemetry.networkInterface || (isOnline ? 'Active' : 'None')}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Latency</p>
                <p className="text-sm font-bold text-red-300 mt-0.5 font-mono">{telemetry.networkLatencyMs} ms</p>
              </div>
              {telemetry.networkDownloadSpeedMbps !== undefined && (
                <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Downlink (est.)</p>
                  <p className="text-sm font-bold text-green-300 mt-0.5 font-mono">~{telemetry.networkDownloadSpeedMbps} Mbps</p>
                </div>
              )}
              {telemetry.networkUploadSpeedMbps !== undefined && (
                <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Uplink (est.)</p>
                  <p className="text-sm font-bold text-orange-300 mt-0.5 font-mono">~{telemetry.networkUploadSpeedMbps} Mbps</p>
                </div>
              )}
            </div>
            {downloadMbps !== null && speedState === 'done' && (
              <div className="grid grid-cols-3 gap-3 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Ping</p>
                  <p className="text-sm font-bold text-red-300 font-mono">{pingMs} ms</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Download</p>
                  <p className="text-sm font-bold text-white font-mono">{downloadMbps} Mbps</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Upload</p>
                  <p className="text-sm font-bold text-red-400 font-mono">{uploadMbps} Mbps</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Battery ── */}
          {telemetry.batteryLevel !== undefined && (
            <div className="skeuo-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-red-400" />
                <p className="text-xs font-bold text-white uppercase tracking-widest">Battery</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <svg width="64" height="28" viewBox="0 0 64 28" className="drop-shadow-lg">
                    <rect x="0" y="4" width="56" height="20" rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                    <rect x="56" y="9" width="6" height="10" rx="2" fill="rgba(255,255,255,0.12)" />
                    <rect
                      x="2"
                      y="6"
                      width={Math.max(0, (telemetry.batteryLevel / 100) * 52)}
                      height="16"
                      rx="2.5"
                      fill={telemetry.batteryLevel > 50 ? '#22c55e' : telemetry.batteryLevel > 20 ? '#f97316' : '#C8102E'}
                      opacity="0.9"
                    />
                  </svg>
                  <p className="text-center text-[11px] font-bold text-white mt-0.5">{telemetry.batteryLevel}%</p>
                </div>
                <div className="space-y-1">
                  <p className={`text-xs font-bold ${telemetry.batteryCharging ? 'text-green-400' : 'text-zinc-300'}`}>
                    {telemetry.batteryCharging ? '⚡ Charging' : 'On Battery'}
                  </p>
                  {telemetry.batteryTimeRemainingSec !== undefined && !telemetry.batteryCharging && (
                    <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {formatBatteryTime(telemetry.batteryTimeRemainingSec)}
                    </p>
                  )}
                  {telemetry.batteryCharging && (
                    <p className="text-[10px] text-zinc-500 font-mono">Full charge time estimated</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Processes ── */}
          {telemetry.processes && telemetry.processes.length > 0 && (
            <div className="skeuo-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-red-400" />
                <p className="text-xs font-bold text-white uppercase tracking-widest">Process Monitor</p>
                <span className="text-[10px] text-zinc-500 font-mono ml-auto">{telemetry.processes.length} processes</span>
              </div>
              <div className="space-y-1 max-h-52 overflow-y-auto">
                <div className="grid grid-cols-12 gap-2 text-[10px] text-zinc-500 uppercase tracking-wider px-1 pb-1 border-b border-white/5">
                  <span className="col-span-5">Process</span>
                  <span className="col-span-3 text-right">CPU</span>
                  <span className="col-span-4 text-right">Memory</span>
                </div>
                {telemetry.processes.map((proc, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center py-1 px-1 rounded hover:bg-white/3 transition-colors">
                    <span className="col-span-5 text-[11px] text-zinc-300 truncate font-mono">{proc.name}</span>
                    <span className="col-span-3 text-right">
                      <span className={`text-[11px] font-mono ${proc.cpu > 8 ? 'text-red-400' : 'text-zinc-400'}`}>
                        {proc.cpu.toFixed(1)}%
                      </span>
                    </span>
                    <span className="col-span-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-500/60"
                            style={{ width: `${Math.min(100, (proc.memoryMb / 200) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono w-10 text-right">{proc.memoryMb} MB</span>
                      </div>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Live Telemetry Bentos ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="skeuo-card p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">CPU Load</p>
              <p className="text-2xl font-bold text-red-500 mt-1">{telemetry.cpuUsage}%</p>
              <UsageBar percent={cpuPercent} color="#C8102E" />
            </div>
            <div className="skeuo-card p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">RAM Usage</p>
              <p className="text-2xl font-bold text-white mt-1">{ramPercent}%</p>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{formatBytes(telemetry.ramUsageMb)} / {formatBytes(telemetry.ramTotalMb)}</p>
              <UsageBar percent={ramPercent} color="#f97316" />
            </div>
            <div className="skeuo-card p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">UI Refresh</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{telemetry.fps} FPS</p>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Frame rate</p>
            </div>
            <div className="skeuo-card p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Latency</p>
              <p className="text-2xl font-bold text-red-300 mt-1">{telemetry.networkLatencyMs} ms</p>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{isOnline ? 'Reachable' : 'Offline'}</p>
            </div>

            {telemetry.gpuName && (
              <div className="skeuo-card p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">GPU</p>
                <p className="text-xs font-bold text-red-200 mt-1 break-all leading-snug">{telemetry.gpuName}</p>
                {telemetry.gpuMemoryTotalMb && (
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{formatBytes(telemetry.gpuMemoryTotalMb)} VRAM</p>
                )}
              </div>
            )}
            {telemetry.gpuUtilization !== undefined && (
              <div className="skeuo-card p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">GPU Load</p>
                <p className="text-2xl font-bold text-orange-400 mt-1">{telemetry.gpuUtilization}%</p>
                <UsageBar percent={telemetry.gpuUtilization} color="#f97316" />
              </div>
            )}
            {telemetry.cpuName && (
              <div className="skeuo-card p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">CPU</p>
                <p className="text-xs font-bold text-white mt-1 break-all leading-snug">{telemetry.cpuName}</p>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  {telemetry.cpuCores}C / {telemetry.cpuThreads}T
                </p>
              </div>
            )}
            {telemetry.romTotalGb && (
              <div className="skeuo-card p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">ROM Storage</p>
                <p className="text-2xl font-bold text-red-300 mt-1">{telemetry.romTotalGb} GB</p>
                {telemetry.romUsedGb && <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{telemetry.romUsedGb} GB Used</p>}
              </div>
            )}

            {telemetry.batteryLevel !== undefined && (
              <div className="skeuo-card p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Battery</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{telemetry.batteryLevel}%</p>
                {telemetry.batteryCharging !== undefined && (
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    {telemetry.batteryCharging ? '⚡ Charging' : 'On Battery'}
                  </p>
                )}
              </div>
            )}
            {telemetry.uptimeSeconds !== undefined && (
              <div className="skeuo-card p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Uptime</p>
                <p className="text-sm font-bold text-white mt-1">{formatUptime(telemetry.uptimeSeconds)}</p>
              </div>
            )}
            {telemetry.networkDownloadSpeedMbps !== undefined && (
              <div className="skeuo-card p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Downlink</p>
                <p className="text-2xl font-bold text-green-400 mt-1">~{telemetry.networkDownloadSpeedMbps}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Mbps</p>
              </div>
            )}
            {telemetry.networkUploadSpeedMbps !== undefined && (
              <div className="skeuo-card p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Uplink</p>
                <p className="text-2xl font-bold text-orange-400 mt-1">~{telemetry.networkUploadSpeedMbps}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Mbps</p>
              </div>
            )}
            {telemetry.screenResolution && (
              <div className="skeuo-card p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Resolution</p>
                <p className="text-lg font-bold text-white mt-1">{telemetry.screenResolution}</p>
              </div>
            )}
            {telemetry.language && (
              <div className="skeuo-card p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Language</p>
                <p className="text-lg font-bold text-red-200 mt-1">{telemetry.language}</p>
              </div>
            )}
          </div>

          {/* System Information Summary */}
          <div className="skeuo-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-red-400" />
              <p className="text-xs font-bold text-white uppercase tracking-widest">System Information</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] font-mono">
              {telemetry.osPlatform && (
                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-[10px] text-zinc-500">Platform</p>
                  <p className="text-zinc-300 mt-0.5">{telemetry.osPlatform}</p>
                </div>
              )}
              {telemetry.cpuCores && (
                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-[10px] text-zinc-500">CPU Threads</p>
                  <p className="text-zinc-300 mt-0.5">{telemetry.cpuThreads} threads</p>
                </div>
              )}
              {telemetry.cpuTemperature !== undefined && (
                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-[10px] text-zinc-500">CPU Temp (est.)</p>
                  <p className={`mt-0.5 ${telemetry.cpuTemperature > 70 ? 'text-red-400' : 'text-zinc-300'}`}>
                    {formatTemp(telemetry.cpuTemperature)}
                  </p>
                </div>
              )}
              {telemetry.ramTotalMb && (
                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-[10px] text-zinc-500">RAM Total</p>
                  <p className="text-zinc-300 mt-0.5">{formatBytes(telemetry.ramTotalMb)}</p>
                </div>
              )}
              {telemetry.gpuMemoryTotalMb && (
                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-[10px] text-zinc-500">VRAM Total</p>
                  <p className="text-zinc-300 mt-0.5">{formatBytes(telemetry.gpuMemoryTotalMb)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Device & Session Information */}
          <div className="skeuo-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-red-400" />
              <p className="text-xs font-bold text-white uppercase tracking-widest">Device & Session</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              {navigator.platform && (
                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-[10px] text-zinc-500">Platform</p>
                  <p className="text-zinc-300 mt-0.5 break-all">{navigator.platform}</p>
                </div>
              )}
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <p className="text-[10px] text-zinc-500">Screen</p>
                <p className="text-zinc-300 mt-0.5">{screen.width}x{screen.height}</p>
              </div>
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <p className="text-[10px] text-zinc-500">Window</p>
                <p className="text-zinc-300 mt-0.5">{window.innerWidth}x{window.innerHeight}</p>
              </div>
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <p className="text-[10px] text-zinc-500">Pixel Ratio</p>
                <p className="text-zinc-300 mt-0.5">{window.devicePixelRatio}</p>
              </div>
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <p className="text-[10px] text-zinc-500">Language</p>
                <p className="text-zinc-300 mt-0.5">{navigator.language || 'en'}</p>
              </div>
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <p className="text-[10px] text-zinc-500">Online</p>
                <p className="text-zinc-300 mt-0.5">{navigator.onLine ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div className="skeuo-card p-3 space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">App Version</span>
                <span className="text-red-300 font-bold">v2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Build</span>
                <span className="text-red-300 font-bold">Brio-IFE-2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Runtime</span>
                <span className="text-zinc-300">React {React.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Session Started</span>
                <span className="text-zinc-300">{new Date().toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => showToast('Telemetry', 'Diagnostic report submitted to ground systems.', 'success')}
              className="skeuo-btn-primary w-full py-3 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              Run Diagnostics
            </button>
          </div>

          {/* Worker Logs */}
          <div className="skeuo-card p-4 space-y-2">
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
  );
};

