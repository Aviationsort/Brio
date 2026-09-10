/**
 * Brio Application Type Definitions
 */

export type HubId = 'connect' | 'media' | 'arcade' | 'office' | 'telemetry' | 'myplanepics' | 'home' | 'security' | 'rss';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  masterKeyHash: string; // Derived hash for verification
  avatarUrl?: string;
  status?: 'online' | 'away' | 'dnd' | 'offline';
  bio?: string;
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
  conversationId?: string;
  senderId: string;
  senderName: string;
  text: string;
  encryptedPayload?: EncryptedPayload<string>;
  isEncrypted: boolean;
  timestamp: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'video' | 'voice' | 'file' | 'sticker';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  mode: 'online' | 'bluetooth';
  edited?: boolean;
  editedAt?: string;
  disappearingAt?: string;
  reactions?: string[];
  replyTo?: { messageId: string; senderName: string; textSnippet: string };
  forwardedFrom?: { messageId: string; senderName: string };
  mentions?: string[];
  linkPreview?: { url: string; title?: string; description?: string; imageUrl?: string };
  localId?: string;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  bluetoothNearby: boolean;
  signalStrength?: number;
  lastMessage?: string;
  lastSeen?: string;
  unreadCount: number;
  publicKeyFingerprint: string;
  bio?: string;
  isMuted?: boolean;
  isBlocked?: boolean;
  typing?: boolean;
  sharedMediaCount?: number;
  mutualFriends?: number;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails: ChatContact[];
  lastMessageId?: string;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  userLiked?: boolean;
  replies?: Comment[];
}

// Hub 1: Social Feed
export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  encryptedContent?: EncryptedPayload<string>;
  isEncrypted: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'carousel';
  mediaUrls?: string[];
  timestamp: string;
  likes: number;
  commentsCount: number;
  shares: number;
  userLiked?: boolean;
  userSaved?: boolean;
  privacyRank: number; // 1-5 score used by algorithm
  category: 'aviation' | 'tech' | 'cyber' | 'gaming' | 'general';
  mentions?: string[];
  hashtags?: string[];
  location?: string;
  comments?: Comment[];
  repostOf?: string;
  isPinned?: boolean;
  bookmarkCount?: number;
  viewCount?: number;
}

export interface FeedAlgorithmSettings {
  recencyWeight: number; // 0-100
  engagementWeight: number; // 0-100
  echoChamberFilter: number; // 0-100 (reduces bias)
  decryptedPrivacyRank: number; // 0-100 (prioritize encrypted verified posts)
  mediaWeight: number; // 0-100
}

export interface Story {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  timestamp: string;
  expiresAt: string;
  viewers?: string[];
}

export interface Notification {
  id: string;
  type: 'message' | 'like' | 'comment' | 'follow' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  timestamp: string;
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
export type PlaybackMode = 'sequential' | 'shuffle' | 'repeat-one' | 'repeat-all';

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl: string;
  durationSeconds: number;
  isYoutube?: boolean;
  youtubeId?: string;
  mediaType?: 'audio' | 'video';
  fileFormat?: string;
  fileSize?: number;
  lyrics?: string;
  lrcUrl?: string;
  addedAt: number;
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
  | 'flagquiz'
  | 'memory'
  | 'snake'
  | 'typing'
  | 'hangman';

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

export interface SpreadsheetCell {
  id: string;
  row: number;
  col: number;
  value: string;
  formula?: string;
  format: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    textAlign?: 'left' | 'center' | 'right';
  };
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  transition: 'fade' | 'slide' | 'none';
  order: number;
}

export interface DocumentPage {
  id: string;
  title: string;
  content: string;
  order: number;
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

export interface SystemTelemetryData {
  cpuUsage: number;
  ramUsageMb: number;
  ramTotalMb: number;
  ramAvailableMb?: number;
  ramCachedMb?: number;
  ramUsagePercent?: number;
  fps: number;
  networkLatencyMs: number;
  storageUsedMb: number;
  cryptoWorkerStatus: 'active' | 'idle' | 'processing';
  activeThreads: number;
  systemLogs: { timestamp: string; level: 'info' | 'warn' | 'error'; message: string }[];
  gpuName?: string;
  gpuDriver?: string;
  gpuMemoryMb?: number;
  gpuMemoryTotalMb?: number;
  gpuUtilization?: number;
  cpuName?: string;
  cpuCores?: number;
  cpuThreads?: number;
  cpuSpeedMhz?: number;
  cpuTemperature?: number;
  romTotalGb?: number;
  romUsedGb?: number;
  disks?: { name: string; totalGb: number; usedGb: number; freeGb: number; usagePercent: number }[];
  batteryLevel?: number;
  batteryCharging?: boolean;
  batteryTimeRemainingSec?: number;
  osPlatform?: string;
  osVersion?: string;
  screenResolution?: string;
  language?: string;
  uptimeSeconds?: number;
  networkInterface?: string;
  networkMac?: string;
  networkUploadSpeedMbps?: number;
  networkDownloadSpeedMbps?: number;
  processes?: { name: string; cpu: number; memoryMb: number }[];
  cpuHistory?: number[];
  ramHistory?: number[];
  fpsHistory?: number[];
  networkHistory?: number[];
}

export type ErrorCategory = 'network' | 'auth' | 'crypto' | 'storage' | 'validation' | 'unknown';

export interface BrioError extends Error {
  category: ErrorCategory;
  code?: string;
  isRetryable?: boolean;
  originalError?: unknown;
  timestamp: number;
}

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  retryableCategories: ErrorCategory[];
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  reportCritical?: boolean;
  retryOptions?: Partial<RetryOptions>;
}

export interface RateLimitEntry {
  lastShown: number;
  count: number;
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
  tags?: string[];
  collections?: string[];
  favorite?: boolean;
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

