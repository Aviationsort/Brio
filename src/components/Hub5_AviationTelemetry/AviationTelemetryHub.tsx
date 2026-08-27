/**
 * Hub 5: Aviation Telemetry & MyPlanePics
 * Includes MyPlanePics Vault and System Telemetry
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cpu, Search, ShieldCheck, Activity, Image as ImageIcon } from 'lucide-react';
import { MyPlanePicsSuite } from './MyPlanePicsSuite';


export const AviationTelemetryHub: React.FC = () => {
  const { telemetry, showToast } = useApp();
  const [subTab, setSubTab] = useState<'myplanepics' | 'telemetry'>('myplanepics');

  return (
    <div className="space-y-6">
      {/* Navigation Sub-bar */}
      <div className="flex items-center gap-2 p-1.5 aero-panel overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab('myplanepics')}
          className={`ife-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'myplanepics'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>MyPlanePics Vault & Ranking</span>
        </button>

        <button
          onClick={() => setSubTab('telemetry')}
          className={`ife-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'telemetry'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>System Telemetry & Vault Logs</span>
        </button>
      </div>

      {/* Sub-tab Views */}
      {subTab === 'myplanepics' && <MyPlanePicsSuite />}

      {subTab === 'telemetry' && (
        <div className="aero-panel p-6 shadow-2xl space-y-6 aero-glossy">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">System Health</p>
              <h3 className="text-base font-bold text-white">Live Telemetry & Cryptographic Worker Status</h3>
            </div>
            <Activity className="w-5 h-5 text-red-500 animate-pulse" />
          </div>

          {/* Telemetry Bento Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="ife-card p-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">CPU Load</p>
              <p className="text-2xl font-bold text-red-500 mt-1">{telemetry.cpuUsage}%</p>
            </div>
            <div className="ife-card p-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">RAM Consumption</p>
              <p className="text-2xl font-bold text-white mt-1">{telemetry.ramUsageMb} MB</p>
            </div>
            <div className="ife-card p-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">UI Refresh Rate</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{telemetry.fps} FPS</p>
            </div>
            <div className="ife-card p-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Latency</p>
              <p className="text-2xl font-bold text-red-300 mt-1">{telemetry.networkLatencyMs} ms</p>
            </div>

            {telemetry.gpuName && (
              <div className="ife-card p-4">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">GPU Name</p>
                <p className="text-sm font-bold text-red-200 mt-1 break-all">{telemetry.gpuName}</p>
                {telemetry.gpuDriver && <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{telemetry.gpuDriver}</p>}
              </div>
            )}
            {telemetry.gpuMemoryTotalMb && (
              <div className="ife-card p-4">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">GPU Memory</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{telemetry.gpuMemoryTotalMb} MB</p>
              </div>
            )}
            {telemetry.cpuName && (
              <div className="ife-card p-4">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">CPU</p>
                <p className="text-xs font-bold text-white mt-1 break-all">{telemetry.cpuName}</p>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{telemetry.cpuCores} Cores / {telemetry.cpuThreads} Threads</p>
              </div>
            )}
            {telemetry.romTotalGb && (
              <div className="ife-card p-4">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">ROM Storage</p>
                <p className="text-2xl font-bold text-red-300 mt-1">{telemetry.romTotalGb} GB</p>
                {telemetry.romUsedGb && <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{telemetry.romUsedGb} GB Used</p>}
              </div>
            )}
          </div>

          {/* Worker Logs */}
          <div className="ife-card p-4 space-y-2">
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
