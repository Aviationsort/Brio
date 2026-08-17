/**
 * Brio Application Type Definitions
 */

// All Supported Languages & Dialects
export type LanguageCode =
  | 'en' // English
  | 'fr' // French
  | 'auto'; // Auto Detect

export type HubId = 'connect' | 'media' | 'arcade' | 'office' | 'telemetry' | 'home';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  masterKeyHash: string; // Derived hash for verification
  avatarUrl?: string;
  createdAt: string;
  isLoggedIn: boolean;
}

// Encryption Payload wrapper
export interface EncryptedPayload<T = unknown> {
  iv: string;
  cipherText: string;
  checksum: string;
  timestamp: number;
  decryptedData?: T;
}

// Hub 1: Messaging
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  encryptedPayload?: EncryptedPayload<string>;
  isEncrypted: boolean;
  timestamp: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'voice' | 'file' | 'sticker';
  status: 'sent' | 'delivered' | 'read';
  mode: 'online' | 'bluetooth';
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  bluetoothNearby: boolean;
  signalStrength?: number;
  lastMessage?: string;
  unreadCount: number;
  publicKeyFingerprint: string;
}

// Hub 1: Social Feed
export interface SocialPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  encryptedContent?: EncryptedPayload<string>;
  isEncrypted: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  timestamp: string;
  likes: number;
  commentsCount: number;
  shares: number;
  userLiked?: boolean;
  privacyRank: number; // 1-5 score used by algorithm
  category: 'aviation' | 'tech' | 'cyber' | 'gaming' | 'general';
}

export interface FeedAlgorithmSettings {
  recencyWeight: number; // 0-100
  engagementWeight: number; // 0-100
  echoChamberFilter: number; // 0-100 (reduces bias)
  decryptedPrivacyRank: number; // 0-100 (prioritize encrypted verified posts)
  mediaWeight: number; // 0-100
}

// Hub 1: Call Dialer
export interface EmergencyNumber {
  code: string;
  name: string;
  region: 'Global' | 'Lebanon' | 'Cyprus' | 'EU' | 'US';
  category: 'Police' | 'Ambulance' | 'Fire' | 'Rescue' | 'Red Cross';
  details: string;
}

export interface CallLogItem {
  id: string;
  number: string;
  name?: string;
  type: 'incoming' | 'outgoing' | 'missed' | 'emergency';
  durationSeconds: number;
  timestamp: string;
  isEncrypted: boolean;
}

// Hub 1: Stickers
export interface StickerItem {
  id: string;
  name: string;
  category: 'Aviation' | 'Cyber' | 'Anime' | 'Emoji' | 'Custom';
  dataUrl: string;
  isEncrypted: boolean;
}

// Hub 2: Nightcore Player
export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  durationSeconds: number;
  isYoutube?: boolean;
  youtubeId?: string;
}

// Hub 2: IPTV
export interface IPTVChannel {
  id: string;
  name: string;
  category: string;
  streamUrl: string;
  logoUrl: string;
  country: string;
  isFavorite?: boolean;
}

// Hub 2: RSS Feed
export interface RSSArticle {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  publishedAt: string;
  category: string;
  read?: boolean;
}

// Hub 3: Games
export type GameId =
  | 'tetris'
  | 'slots'
  | 'lottery'
  | 'uno'
  | 'poker'
  | 'blackjack'
  | 'flappy'
  | 'minesweeper'
  | 'risk'
  | 'tankery'
  | 'flagquiz';

export interface GameHighScore {
  gameId: GameId;
  score: number;
  playerName: string;
  timestamp: string;
  encryptedVerification: string;
}

// Hub 4: Office & Productivity
export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
  isEncrypted: boolean;
  encryptedData?: EncryptedPayload<string>;
}

export interface TodoItem {
  id: string;
  task: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  completed: boolean;
  category: string;
  dueDate?: string;
  isEncrypted: boolean;
}

export interface PDFAnnotation {
  id: string;
  type: 'pen' | 'highlighter' | 'text' | 'signature' | 'stamp';
  color: string;
  strokeWidth: number;
  points?: { x: number; y: number }[];
  text?: string;
  x?: number;
  y?: number;
  pageNumber: number;
}

// Hub 5: Aviation & Telemetry
export interface CameraSetupRating {
  cameraName: string;
  sensorType: 'Full Frame' | 'APS-C' | 'Micro 4/3' | '1-inch';
  focalLengthMm: number;
  apertureFStop: number;
  distanceMeters: number;
  targetSpeedKmh: number;
  lightingCondition: 'Bright Sun' | 'Overcast' | 'Golden Hour' | 'Night / Backlit';
  // Calculated outputs
  cropFactor: number;
  effectiveFocalLength: number;
  fieldOfViewDeg: number;
  minShutterSpeedSec: string;
  opticalSharpnessScore: number; // 0-100
  motionBlurSafetyScore: number; // 0-100
  overallScore: number; // 0-100
  recommendations: string[];
}

export interface AviationTerm {
  term: string;
  fullForm?: string;
  category: 'Acronym' | 'Navigation' | 'Airframes' | 'Weather' | 'ATC';
  definition: string;
  phoneticEquivalent?: string;
}

export interface BusSchedule {
  id: string;
  country: 'Lebanon' | 'Cyprus';
  routeNumber: string;
  routeName: string;
  origin: string;
  destination: string;
  stops: string[];
  departureTimes: string[];
  fareLocalCurrency: string;
  operator: string;
  timetableUrl?: string;
}

export interface SystemTelemetryData {
  cpuUsage: number;
  ramUsageMb: number;
  ramTotalMb: number;
  fps: number;
  networkLatencyMs: number;
  storageUsedMb: number;
  cryptoWorkerStatus: 'active' | 'idle' | 'processing';
  activeThreads: number;
  systemLogs: { timestamp: string; level: 'info' | 'warn' | 'error'; message: string }[];
}

// MyPlanePics Aircraft Photo Vault, Ranking & Statistics
export interface ParsedFilenameResult {
  filename: string;
  registration: string;
  specialLivery: string;
  dateCaptured: string; // ISO or MM/DD/YYYY
  formattedDate: string;
  rawDate: string;
  shotNumber: number | null;
  extension: string;
  formatPattern: string;
  isRangeFormat: boolean;
  isAutoCorrected: boolean;
  correctedFilename: string;
  isValid: boolean;
  errorMessage?: string;
}

export interface PlanePhoto {
  id: string;
  filename: string;
  originalFilename?: string;
  imageUrl: string;
  mediaType: 'image' | 'video';
  videoUrl?: string;
  thumbnailUrl?: string;
  registration: string;
  specialLivery: string;
  dateCaptured?: string;
  formattedDate?: string;
  dateSpotted?: string;
  shotNumber?: number;
  formatPattern: string;
  isRangeFormat: boolean;
  isAutoCorrected: boolean;
  location?: string;
  aircraftModel?: string;
  airline?: string;
  spotterName?: string;
  isEncrypted?: boolean;
  encryptedData?: EncryptedPayload<string>;
  rating?: number;
  notes?: string;
}

export interface SpotterRanking {
  id: string;
  spotterName: string;
  avatar: string;
  rank: number;
  totalPhotos: number;
  rareRegistrationsSpotted: number;
  liveriesCollected: number;
  spottingStreakDays: number;
  tier: 'Legendary Spotter' | 'Master Spotter' | 'Senior Spotter' | 'Aviation Enthusiast';
  favoriteAirport: string;
  badges: string[];
}

export interface PlanePicsStats {
  totalPhotos: number;
  uniqueRegistrations: number;
  uniqueLiveries: number;
  rangeFormatCount: number;
  autoCorrectedCount: number;
  topAirlines: { airline: string; count: number }[];
  topModels: { model: string; count: number }[];
  monthlyTrends: { month: string; photos: number }[];
}

