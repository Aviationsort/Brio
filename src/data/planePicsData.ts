/**
 * MyPlanePics Aircraft Vault, Airline Rankings, Aircraft Model Rankings, and Statistics
 */

import { PlanePhoto, PlanePicsStats } from '../types';

export interface AirlineRankingItem {
  rank: number;
  airline: string;
  photoCount: number;
  percentage: number;
  exampleRegs: string[];
  rarityScore: number;
  badge: string;
}

export interface AircraftModelRankingItem {
  rank: number;
  aircraftModel: string;
  photoCount: number;
  percentage: number;
  exampleRegs: string[];
  rarityScore: number;
  badge: string;
}

export const INITIAL_PLANE_PHOTOS: PlanePhoto[] = [];

/**
 * Compute Rankings by Airline from the album photos
 */
export function computeAirlineRankings(photoList: PlanePhoto[]): AirlineRankingItem[] {
  const map: Record<string, { count: number; regs: Set<string> }> = {};

  photoList.forEach((p) => {
    const airline = p.airline || 'Unknown Airline';
    if (!map[airline]) map[airline] = { count: 0, regs: new Set() };
    map[airline].count += 1;
    if (p.registration) map[airline].regs.add(p.registration);
  });

  const total = photoList.length || 1;

  const sorted = Object.entries(map)
    .map(([airline, data]) => ({
      airline,
      photoCount: data.count,
      percentage: Math.round((data.count / total) * 100),
      exampleRegs: Array.from(data.regs).slice(0, 3),
      rarityScore: Math.max(60, 100 - data.count * 8),
    }))
    .sort((a, b) => b.photoCount - a.photoCount);

  return sorted.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    badge:
      idx === 0
        ? '🥇 Fleet Dominator'
        : idx === 1
        ? '🥈 Premier Carrier'
        : idx === 2
        ? '🥉 Flag Carrier'
        : '✈️ Vault Spotting',
  }));
}

/**
 * Compute Rankings by Aircraft Type / Model from the album photos
 */
export function computeAircraftModelRankings(photoList: PlanePhoto[]): AircraftModelRankingItem[] {
  const map: Record<string, { count: number; regs: Set<string> }> = {};

  photoList.forEach((p) => {
    const model = p.aircraftModel || 'Uncategorized Model';
    if (!map[model]) map[model] = { count: 0, regs: new Set() };
    map[model].count += 1;
    if (p.registration) map[model].regs.add(p.registration);
  });

  const total = photoList.length || 1;

  const sorted = Object.entries(map)
    .map(([aircraftModel, data]) => ({
      aircraftModel,
      photoCount: data.count,
      percentage: Math.round((data.count / total) * 100),
      exampleRegs: Array.from(data.regs).slice(0, 3),
      rarityScore: Math.max(65, 100 - data.count * 10),
    }))
    .sort((a, b) => b.photoCount - a.photoCount);

  return sorted.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    badge:
      idx === 0
        ? '👑 Top Airframe Type'
        : idx === 1
        ? '⭐ Heavy Cruiser'
        : idx === 2
        ? '🌟 Widebody Master'
        : '🛫 Spotter Catch',
  }));
}

export function computeLiveStats(photoList: PlanePhoto[]): PlanePicsStats {
  const airlineCounts: Record<string, number> = {};
  const modelCounts: Record<string, number> = {};

  photoList.forEach((p) => {
    if (p.airline) airlineCounts[p.airline] = (airlineCounts[p.airline] || 0) + 1;
    if (p.aircraftModel) modelCounts[p.aircraftModel] = (modelCounts[p.aircraftModel] || 0) + 1;
  });

  return {
    totalPhotos: photoList.length,
    uniqueRegistrations: new Set(photoList.map((p) => p.registration).filter(Boolean)).size,
    uniqueLiveries: new Set(photoList.map((p) => p.specialLivery).filter(Boolean)).size,
    rangeFormatCount: photoList.filter((p) => p.isRangeFormat).length,
    autoCorrectedCount: photoList.filter((p) => p.isAutoCorrected).length,
    topAirlines: Object.entries(airlineCounts)
      .map(([airline, count]) => ({ airline, count }))
      .sort((a, b) => b.count - a.count),
    topModels: Object.entries(modelCounts)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count),
    monthlyTrends: [{ month: 'Current Vault', photos: photoList.length }],
  };
}

export const INITIAL_PICS_STATS: PlanePicsStats = computeLiveStats(INITIAL_PLANE_PHOTOS);
