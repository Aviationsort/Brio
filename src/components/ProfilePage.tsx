import React from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Award, BarChart3, User, Mail, ShieldCheck, QrCode, ArrowLeft } from 'lucide-react';
import { computeAirlineRankings, computeAircraftModelRankings, computeLiveStats } from '../data/planePicsData';

interface ProfilePageProps {
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user, myPlanePics, showToast } = useApp();

  const stats = computeLiveStats(myPlanePics);
  const airlineRankings = computeAirlineRankings(myPlanePics);
  const modelRankings = computeAircraftModelRankings(myPlanePics);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
        <button
          onClick={onBack}
          className="liquid-glass-btn p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-white">User Profile</span>
      </div>

      <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF5F1F] to-purple-600 flex items-center justify-center text-white font-bold text-xl">
            {user ? user.username.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{user ? user.username : 'Guest Operator'}</h3>
            <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
              <Mail className="w-3 h-3" /> {user ? user.email : 'operator@brio.vault'}
            </p>
            <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Brio Cryptographic Account Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-[9px] text-zinc-500 uppercase">Total Photos</p>
          <p className="text-sm font-black text-white">{stats.totalPhotos}</p>
        </div>
        <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-[9px] text-zinc-500 uppercase">Unique Regs</p>
          <p className="text-sm font-black text-white">{stats.uniqueRegistrations}</p>
        </div>
        <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-[9px] text-zinc-500 uppercase">Auto-Corrected</p>
          <p className="text-sm font-black text-white">{stats.autoCorrectedCount}</p>
        </div>
        <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-[9px] text-zinc-500 uppercase">Military Ranges</p>
          <p className="text-sm font-black text-white">{stats.rangeFormatCount}</p>
        </div>
      </div>

      {myPlanePics.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Camera className="w-3 h-3" /> MyPlanePics Album ({myPlanePics.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {myPlanePics.slice(0, 9).map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-black border border-white/10">
                {photo.mediaType === 'video' && photo.videoUrl ? (
                  <video src={photo.videoUrl} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={photo.thumbnailUrl || photo.imageUrl} alt={photo.registration} className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-[8px] font-mono text-white text-center truncate">
                  {photo.registration}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {airlineRankings.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3" /> Top Airlines
          </p>
          <div className="space-y-1">
            {airlineRankings.slice(0, 5).map((r, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <span className="text-[10px] font-bold text-white">{r.airline}</span>
                <span className="text-[9px] text-zinc-400 font-mono">{r.photoCount} photos</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {modelRankings.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Top Aircraft Models
          </p>
          <div className="space-y-1">
            {modelRankings.slice(0, 5).map((r, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <span className="text-[10px] font-bold text-white">{r.aircraftModel}</span>
                <span className="text-[9px] text-zinc-400 font-mono">{r.photoCount} photos</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {myPlanePics.length === 0 && (
        <div className="text-center py-6">
          <Camera className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-xs text-zinc-400">No photos yet</p>
          <p className="text-[10px] text-zinc-500">Import photos to get started</p>
        </div>
      )}
    </div>
  );
};
