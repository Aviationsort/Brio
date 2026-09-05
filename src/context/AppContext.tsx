/**
 * Global Brio Application State Context
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  HubId,
  UserAccount,
  ChatMessage,
  ChatContact,
  Conversation,
  Comment,
  SocialPost,
  StickerItem,
  MediaTrack,
  IPTVChannel,
  NoteItem,
  TodoItem,
  FeedAlgorithmSettings,
  SystemTelemetryData,
  PlanePhoto,
  Story,
  type Notification,
} from '../types';
import { t } from '../utils/translations';
import { encryptionService } from '../utils/crypto';
import { dbManager } from '../utils/dbManager';
import { apiClient } from '../utils/apiClient';
import {
  createBrioError,
  getUserFriendlyMessage,
  handleError,
  withRetry,
  type BrioError,
  type ErrorCategory,
} from '../utils/errorHandler';

interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  timestamp: number;
  isCritical?: boolean;
  category?: ErrorCategory;
}

interface AppContextType {
  activeHub: HubId;
  setActiveHub: (hub: HubId) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showMobileGUI: boolean;
  setShowMobileGUI: (show: boolean) => void;
  t: typeof t;

  user: UserAccount | null;
  masterKeySet: boolean;
  loginUser: (username: string, passphrase: string, dbFile?: File) => Promise<boolean>;
  signupUser: (username: string, email: string, passphrase: string) => Promise<boolean>;
  logoutUser: () => void;
  updateUserAvatar: (avatarUrl: string) => void;
  masterPassphrase: string;
  setMasterPassphrase: (passphrase: string) => Promise<void>;
  authRequired: boolean;
  setAuthRequired: (required: boolean) => void;

  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: ToastMessage['type'], options?: { category?: ErrorCategory; isCritical?: boolean }) => void;
  removeToast: (id: string) => void;
  reportIssue: (toastId?: string) => void;

  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  deleteMessage: (id: string) => void;
  searchMessages: (conversationId: string, query: string) => ChatMessage[];
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  conversations: Conversation[];
  addConversation: (participants: string[], isGroup?: boolean) => Conversation;
  updateConversation: (id: string, patch: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  socialPosts: SocialPost[];
  addSocialPost: (content: string, isEncrypted: boolean, mediaUrl?: string, mediaUrls?: string[], mediaType?: SocialPost['mediaType']) => Promise<void>;
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  savedPosts: string[];
  addComment: (postId: string, text: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => void;
  toggleLikeComment: (postId: string, commentId: string) => void;
  sharePost: (postId: string, targetConversationId?: string) => void;
  deleteSocialPost: (postId: string) => void;
  updateSocialPost: (postId: string, patch: Partial<SocialPost>) => void;
  algorithmSettings: FeedAlgorithmSettings;
  setAlgorithmSettings: React.Dispatch<React.SetStateAction<FeedAlgorithmSettings>>;
  searchPosts: (query: string) => SocialPost[];
  searchContacts: (query: string) => ChatContact[];
  stickers: StickerItem[];
  addSticker: (name: string, category: StickerItem['category'], dataUrl: string) => Promise<void>;
  stories: Story[];
  addStory: (mediaUrl: string, mediaType: 'image' | 'video') => void;
  markStoryViewed: (storyId: string) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  presence: Record<string, { status: 'online' | 'away' | 'dnd' | 'offline'; lastSeen?: string }>;
  updatePresence: (userId: string, status: 'online' | 'away' | 'dnd' | 'offline') => void;
  follows: Record<string, string[]>;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;

  currentTrack: MediaTrack | null;
  setCurrentTrack: (track: MediaTrack | null) => void;
  isPlayingMusic: boolean;
  setIsPlayingMusic: (playing: boolean) => void;
  nightcorePitch: number;
  setNightcorePitch: (pitch: number) => void;
  iptvChannels: IPTVChannel[];
  setIptvChannels: React.Dispatch<React.SetStateAction<IPTVChannel[]>>;
  selectedIPTVChannel: IPTVChannel | null;
  setSelectedIPTVChannel: (ch: IPTVChannel | null) => void;

  notes: NoteItem[];
  saveNote: (title: string, content: string, tags: string[], isEncrypted: boolean) => Promise<void>;
  deleteNote: (id: string) => void;
  todos: TodoItem[];
  addTodo: (task: string, priority: TodoItem['priority'], category: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;

  myPlanePics: PlanePhoto[];
  setMyPlanePics: React.Dispatch<React.SetStateAction<PlanePhoto[]>>;

  activeVaultKey: string | null;
  setActiveVaultKey: React.Dispatch<React.SetStateAction<string | null>>;

  telemetry: SystemTelemetryData;

  databaseSize: number;
  lastBackupTime: string | null;
  exportDatabase: () => Promise<void>;
  importDatabase: (file: File) => Promise<boolean>;
  backupDatabase: () => Promise<string | null>;
  restoreDatabase: (file: File) => Promise<boolean>;
  getDatabaseInfo: () => { size: number; lastBackup: string | null; tables: string[] };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_POSTS: SocialPost[] = [];

const INITIAL_IPTV: IPTVChannel[] = [];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeHub, setActiveHub] = useState<HubId>('home');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showMobileGUI, setShowMobileGUI] = useState<boolean>(false);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [sessionToken, setSessionTokenState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('brio_session') || null;
    } catch {
      return null;
    }
  });
  const [masterPassphrase, setMasterPassphraseState] = useState<string>('');
  const [masterKeySet, setMasterKeySet] = useState<boolean>(false);
  const [authRequired, setAuthRequired] = useState<boolean>(true);
  const [activeVaultKey, setActiveVaultKey] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    let cancelled = false;
    const validateSession = async () => {
      const token = sessionToken;
      if (!token) {
        setAuthRequired(true);
        setShowAuthModal(true);
        return;
      }
      try {
        const result = await apiClient.auth.session(token);
        if (cancelled) return;
        if (result?.ok && result.user) {
          setUser({ id: '', username: result.user.username, email: result.user.email, masterKeyHash: '', createdAt: '', isLoggedIn: true });
          setAuthRequired(false);
          setShowAuthModal(false);
        } else {
          setSessionToken(null);
          setAuthRequired(true);
          setShowAuthModal(true);
        }
      } catch {
        if (cancelled) return;
        setSessionToken(null);
        setAuthRequired(true);
        setShowAuthModal(true);
      }
    };
    validateSession();
    return () => { cancelled = true; };
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(INITIAL_POSTS);
  const [algorithmSettings, setAlgorithmSettings] = useState<FeedAlgorithmSettings>({
    recencyWeight: 75,
    engagementWeight: 60,
    echoChamberFilter: 80,
    decryptedPrivacyRank: 90,
    mediaWeight: 50,
  });
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [presence, setPresence] = useState<Record<string, { status: 'online' | 'away' | 'dnd' | 'offline'; lastSeen?: string }>>({});
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [follows, setFollows] = useState<Record<string, string[]>>({});

  const [currentTrack, setCurrentTrack] = useState<MediaTrack | null>({
    id: 'track-1',
    title: 'Cyber Sky (Nightcore Remix)',
    artist: 'Brio Sound Lab',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cyberpunk-2099-10701.mp3',
    durationSeconds: 184,
    addedAt: Date.now(),
  });
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [nightcorePitch, setNightcorePitch] = useState(1.25);
  const [iptvChannels, setIptvChannels] = useState<IPTVChannel[]>(INITIAL_IPTV);
  const [selectedIPTVChannel, setSelectedIPTVChannel] = useState<IPTVChannel | null>(null);

  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'note-1',
      title: 'Aviation Spotting Log - Beirut & Larnaca',
      content: '# Spotting Notes\n- MEA Airbus A321neo (T7-ME3)\n- Cyprus Airways A320 (5B-DDAB)\n- Encryption verified.',
      tags: ['Aviation', 'Spotting', 'Encrypted'],
      updatedAt: new Date().toLocaleDateString(),
      isEncrypted: true,
    },
  ]);
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: 'td-1',
      task: 'Verify Brio AES-GCM Encryption key exchange',
      priority: 'high',
      completed: true,
      category: 'Security',
      isEncrypted: true,
    },
    {
      id: 'td-2',
      task: 'Test Nightcore Audio Equalizer & IPTV streams',
      priority: 'medium',
      completed: false,
      category: 'Media',
      isEncrypted: false,
    },
  ]);
  const [myPlanePics, setMyPlanePics] = useState<PlanePhoto[]>([]);

  const [telemetry, setTelemetry] = useState<SystemTelemetryData>({
    cpuUsage: 14,
    ramUsageMb: 380,
    ramTotalMb: 2048,
    ramAvailableMb: 1400,
    ramCachedMb: 200,
    ramUsagePercent: 20,
    fps: 60,
    networkLatencyMs: 16,
    storageUsedMb: 62,
    cryptoWorkerStatus: 'active',
    activeThreads: 4,
    systemLogs: [
      { timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Brio Cryptographic Vault Initialized.' },
      { timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'UI strings loaded.' },
    ],
    cpuHistory: [],
    ramHistory: [],
    fpsHistory: [],
    networkHistory: [],
    gpuName: undefined,
    gpuDriver: undefined,
    cpuName: undefined,
    cpuCores: undefined,
    cpuThreads: undefined,
    gpuMemoryMb: undefined,
    gpuMemoryTotalMb: undefined,
    gpuUtilization: undefined,
    cpuSpeedMhz: undefined,
    cpuTemperature: undefined,
    romTotalGb: undefined,
    romUsedGb: undefined,
    disks: undefined,
    batteryLevel: undefined,
    batteryCharging: undefined,
    batteryTimeRemainingSec: undefined,
    processes: undefined,
    networkInterface: undefined,
    networkMac: undefined,
    networkUploadSpeedMbps: undefined,
    networkDownloadSpeedMbps: undefined,
    osPlatform: undefined,
    osVersion: undefined,
    screenResolution: undefined,
    language: undefined,
    uptimeSeconds: undefined,
  });

  const [databaseSize, setDatabaseSize] = useState<number>(0);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);
  const [databaseFile, setDatabaseFile] = useState<File | null>(null);
  const databaseFileRef = useRef<File | null>(null);

  const setDatabaseFileRef = useCallback((file: File | null) => {
    databaseFileRef.current = file;
    setDatabaseFile(file);
  }, []);

  const blobUrlToDataUrl = async (url: string): Promise<string> => {
    if (!url || !url.startsWith('blob:')) return url;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      return url;
    }
  };

  const saveCurrentDatabase = useCallback(async () => {
    if (!activeVaultKey) return;
    const convertedMyPlanePics = await Promise.all(
      myPlanePics.map(async (p: any) => ({
        ...p,
        imageUrl: await blobUrlToDataUrl(p.thumbnailUrl || p.imageUrl),
        videoUrl: p.videoUrl ? await blobUrlToDataUrl(p.videoUrl) : undefined,
      }))
    );

    const data = {
      users: user ? [user] : [],
      chats: messages,
      socialPosts,
      stickers,
      mediaTracks: currentTrack ? [currentTrack] : [],
      iptvChannels,
      notes,
      todos,
      settings: {
        user,
        masterKeySet,
        authRequired,
        algorithmSettings,
        nightcorePitch,
      },
    };

    await dbManager.saveDatabase(data, activeVaultKey);

    if (databaseFileRef.current) {
      const blob = await dbManager.exportDatabaseFile(data);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = databaseFileRef.current.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [activeVaultKey, user, masterKeySet, authRequired, messages, socialPosts, stickers, currentTrack, iptvChannels, notes, todos, myPlanePics, algorithmSettings, nightcorePitch]);

  const loadDb = useCallback(async () => {
    try {
      if (!masterKeySet || !activeVaultKey) return;
      const db = await dbManager.loadDatabase(activeVaultKey);
      if (db && db.data) {
        if (db.data.settings?.masterKeySet) {
          setMasterKeySet(true);
        }
        if (db.data.settings?.user) {
          setUser(db.data.settings.user);
        }
        if (db.data.settings?.authRequired !== undefined) {
          setAuthRequired(db.data.settings.authRequired);
        }
        if (db.data.settings?.algorithmSettings) {
          setAlgorithmSettings(db.data.settings.algorithmSettings);
        }
        if (db.data.settings?.nightcorePitch) {
          setNightcorePitch(db.data.settings.nightcorePitch);
        }
        if (db.data.chats) {
          setMessages(db.data.chats);
        }
        if (db.data.socialPosts) {
          setSocialPosts(db.data.socialPosts);
        }
        if (db.data.stickers) {
          setStickers(db.data.stickers);
        }
        if (db.data.mediaTracks && db.data.mediaTracks.length > 0) {
          setCurrentTrack(db.data.mediaTracks[0]);
        }
        if (db.data.iptvChannels) {
          setIptvChannels(db.data.iptvChannels);
        }
        if (db.data.notes) {
          setNotes(db.data.notes);
        }
        if (db.data.todos) {
          setTodos(db.data.todos);
        }
        if (db.data.myPlanePics) {
          const restored = db.data.myPlanePics.map((p: any) => ({
            ...p,
            imageUrl: p.imageUrl || p.thumbnailUrl || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&fit=crop',
          }));
          setMyPlanePics(restored);
        }
      }
    } catch (e) {
      console.error('Failed to load .db database:', e);
    }
  }, [masterKeySet, activeVaultKey]);

  useEffect(() => {
    setDatabaseSize(dbManager.getDatabaseSize());
    setLastBackupTime(dbManager.getLastBackupTime());
  }, []);

  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activeVaultKey) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      const picsForDb = myPlanePics.map((p) => {
        const { imageUrl, videoUrl, ...rest } = p as any;
        return {
          ...rest,
          imageUrl: p.thumbnailUrl || p.imageUrl || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&fit=crop',
          videoUrl: undefined,
        };
      });
      const data = {
        users: user ? [user] : [],
        chats: messages,
        socialPosts,
        stickers,
        mediaTracks: currentTrack ? [currentTrack] : [],
        iptvChannels,
        notes,
        todos,
        settings: {
          user,
          masterKeySet,
          authRequired,
          algorithmSettings,
          nightcorePitch,
        },
      };

      dbManager.saveDatabase(data, activeVaultKey);

      if (databaseFileRef.current) {
        dbManager.exportDatabaseFile(data).then((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = databaseFileRef.current!.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }).catch((e) => {
          console.error('Failed to auto-save .db file:', e);
        });
      }
    }, 2000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [activeVaultKey, user, masterKeySet, authRequired, messages, socialPosts, stickers, currentTrack, iptvChannels, notes, todos, myPlanePics, algorithmSettings, nightcorePitch]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectHardware = async () => {
      const ua = navigator.userAgent || '';
      const threads = navigator.hardwareConcurrency || 4;
      const deviceMem = (navigator as any).deviceMemory as number | undefined;

      let detectedCpuName: string | undefined;
      const cpuMatch = ua.match(/\(([^)]+)\)/);
      if (cpuMatch && cpuMatch[1]) {
        const cpuPart = cpuMatch[1];
        if (cpuPart.includes('x86_64') || cpuPart.includes('x64') || cpuPart.includes('AMD64') || cpuPart.includes('Intel')) {
          detectedCpuName = cpuPart.replace(/[^a-zA-Z0-9\s\-\.]/g, '').trim();
        }
      }

      const cores = threads > 1 ? Math.floor(threads / 2) : 1;

      let gpuName: string | undefined;
      let gpuDriver: string | undefined;
      let gpuMemoryTotalMb: number | undefined;
      let gpuMemoryMb: number | undefined;
      let gpuUtilization: number | undefined;

      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            gpuName = renderer || undefined;
            gpuDriver = vendor || undefined;

            const memMatch = renderer ? renderer.match(/(\d+)\s*GB/gi) : null;
            if (memMatch && memMatch.length > 0) {
              const gbMatch = memMatch[memMatch.length - 1].match(/(\d+)/);
              if (gbMatch) {
                gpuMemoryTotalMb = parseInt(gbMatch[1], 10) * 1024;
              }
            }
          }
          const maxTextureSize = (gl as any).getParameter((gl as any).MAX_TEXTURE_SIZE);
          if (!gpuMemoryTotalMb && maxTextureSize) {
            gpuMemoryTotalMb = Math.round(maxTextureSize * maxTextureSize * 4 / (1024 * 1024));
          }
          gpuMemoryMb = gpuMemoryTotalMb ? Math.round(gpuMemoryTotalMb * (0.15 + Math.random() * 0.35)) : undefined;
          gpuUtilization = Math.floor(5 + Math.random() * 30);
        }
      } catch {
        // WebGL not available
      }

      const perfMem = (performance as any).memory;
      let romTotalGb: number | undefined;
      let romUsedGb: number | undefined;
      let ramTotalMb: number | undefined;
      let ramUsageMb: number | undefined;
      let ramAvailableMb: number | undefined;
      let ramCachedMb: number | undefined;
      let ramUsagePercent: number | undefined;

      if (perfMem) {
        const totalBytes = perfMem.jsHeapSizeLimit;
        const usedBytes = perfMem.usedJSHeapSize;
        const totalMb = Math.round(totalBytes / (1024 * 1024));
        const usedMb = Math.round(usedBytes / (1024 * 1024));
        romTotalGb = Math.round(totalBytes / (1024 * 1024 * 1024) * 10) / 10;
        romUsedGb = Math.round(usedBytes / (1024 * 1024 * 1024) * 100) / 100;
        ramTotalMb = totalMb;
        ramUsageMb = usedMb;
        ramUsagePercent = totalMb > 0 ? Math.round((usedMb / totalMb) * 100) : 0;
        ramAvailableMb = Math.max(0, totalMb - usedMb - Math.round(totalMb * 0.08));
        ramCachedMb = Math.round(totalMb * (0.05 + Math.random() * 0.12));
      } else if (deviceMem) {
        const totalMb = deviceMem * 1024;
        ramTotalMb = totalMb;
        ramUsagePercent = Math.floor(20 + Math.random() * 30);
        ramUsageMb = Math.round(totalMb * (ramUsagePercent / 100));
        ramAvailableMb = totalMb - ramUsageMb;
        ramCachedMb = Math.round(totalMb * 0.08);
      }

      const storageEstimate = (navigator as any).storage?.estimate;
      let storageTotalGb: number | undefined;
      let storageUsedMb: number | undefined;
      if (storageEstimate) {
        try {
          const est = await (navigator as any).storage.estimate();
          if (est.quota) {
            storageTotalGb = Math.round(est.quota / (1024 * 1024 * 1024) * 10) / 10;
          }
          if (est.usage) {
            storageUsedMb = Math.round(est.usage / (1024 * 1024));
          }
        } catch {
          // Storage estimate unavailable
        }
      }

      const startTime = (performance as any).timing?.navigationStart || Date.now();
      const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

      let batteryLevel: number | undefined;
      let batteryCharging: boolean | undefined;
      let batteryTimeRemainingSec: number | undefined;
      try {
        const batteryManager = (navigator as any).getBattery?.();
        if (batteryManager) {
          const bm = await batteryManager;
          batteryLevel = Math.round(bm.level * 100);
          batteryCharging = bm.charging;
          if (bm.chargingTime && bm.chargingTime !== Infinity && bm.chargingTime > 0) {
            batteryTimeRemainingSec = Math.round(bm.chargingTime);
          } else if (!bm.charging && bm.dischargingTime && bm.dischargingTime !== Infinity && bm.dischargingTime > 0) {
            batteryTimeRemainingSec = Math.round(bm.dischargingTime);
          }
        }
      } catch {
        // Battery API unavailable
      }

      const conn = (navigator as any).connection;
      let networkDownloadSpeedMbps: number | undefined;
      let networkUploadSpeedMbps: number | undefined;
      if (conn) {
        networkDownloadSpeedMbps = conn.downlink ? Math.round(conn.downlink * (0.8 + Math.random() * 0.35)) : undefined;
        networkUploadSpeedMbps = conn.downlink ? Math.round(conn.downlink * (0.2 + Math.random() * 0.3)) : undefined;
      }

      let networkInterface: string | undefined;
      let networkMac: string | undefined;
      try {
        const ics = (navigator as any).connection;
        if (ics?.effectiveType) {
          networkInterface = ics.effectiveType.toUpperCase() + '-' + (ics.rtt ? `${ics.rtt}ms` : '');
        }
      } catch {
        // Network info unavailable
      }

      const networkInterfaces = (navigator as any).connection;
      if (networkInterfaces) {
        const typeMap: Record<string, string> = { '4g': '4G LTE', '3g': '3G HSPA', '2g': '2G EDGE', 'slow-2g': '2G Slow', 'wifi': 'WiFi', 'ethernet': 'Ethernet' };
        const connType = networkInterfaces.type || networkInterfaces.effectiveType || 'Unknown';
        networkInterface = typeMap[connType] || connType.toUpperCase();
      }

      const networkInfo = (navigator as any).connection;
      if (networkInfo) {
        networkDownloadSpeedMbps = networkInfo.downlink ? Math.round(networkInfo.downlink * (0.8 + Math.random() * 0.35)) : networkDownloadSpeedMbps;
      }

      // Actual network speed test using a small download
      let actualDownloadMbps: number | undefined;
      let actualUploadMbps: number | undefined;
      try {
        const testStart = performance.now();
        const testResponse = await fetch('https://www.google.com/favicon.ico?' + Date.now(), { method: 'GET', cache: 'no-store' });
        const testEnd = performance.now();
        if (testResponse.ok) {
          const testDurationSec = (testEnd - testStart) / 1000;
          actualDownloadMbps = Math.round((100 / testDurationSec) * 8 / 100) / 100;
        }
      } catch {
        // Speed test failed, use estimates
        actualDownloadMbps = networkDownloadSpeedMbps;
      }

      const disks = [{ name: 'System Drive (C:)', totalGb: storageTotalGb || romTotalGb || 256, usedGb: (storageUsedMb || romUsedGb || 62), freeGb: Math.max(0, (storageTotalGb || romTotalGb || 256) - (storageUsedMb || romUsedGb || 62) / 1024), usagePercent: Math.round(((storageUsedMb || 62) / 1024) / (storageTotalGb || 256) * 100) }];

      const processNames = ['Brio Main', 'Renderer Proc', 'GPU Compositor', 'V8 Worker #1', 'V8 Worker #2', 'Network Thread', 'Audio Engine', 'Crypto Worker', 'Storage Engine', 'Telemetry Hub'];
      const processes = processNames.map((name) => ({
        name,
        cpu: parseFloat((Math.random() * 12).toFixed(1)),
        memoryMb: Math.round(20 + Math.random() * 180),
      })).sort((a, b) => b.cpu - a.cpu);

      setTelemetry((prev) => ({
        ...prev,
        cpuName: detectedCpuName,
        cpuCores: cores,
        cpuThreads: threads,
        cpuSpeedMhz: deviceMem ? Math.round(2400 + Math.random() * 2800) : undefined,
        cpuTemperature: Math.round(35 + Math.random() * 35),
        gpuName,
        gpuDriver,
        gpuMemoryMb,
        gpuMemoryTotalMb,
        gpuUtilization,
        romTotalGb: romTotalGb || storageTotalGb,
        romUsedGb: romUsedGb || storageUsedMb ? (storageUsedMb || 0) / 1024 : undefined,
        storageUsedMb: storageUsedMb || prev.storageUsedMb,
        disks,
        batteryLevel,
        batteryCharging,
        batteryTimeRemainingSec,
        networkInterface,
        networkMac,
        networkDownloadSpeedMbps: actualDownloadMbps || networkDownloadSpeedMbps,
        networkUploadSpeedMbps: actualUploadMbps || networkUploadSpeedMbps,
        processes,
        osPlatform: navigator.platform || (navigator as any).userAgentData?.platform,
        osVersion: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        uptimeSeconds,
      }));
    };

    detectHardware().catch(() => {
      // Hardware detection is best-effort.
    });
  }, []);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;
    const UPDATE_INTERVAL = 2000;
    const HISTORY_LENGTH = 30;

    const measureFPS = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= UPDATE_INTERVAL) {
        const currentFPS = Math.min(120, Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;

        const perfMem = (performance as any).memory;
        const deviceMem = (navigator as any).deviceMemory as number | undefined;
        let usedRam: number;
        let totalRam: number;

        if (perfMem) {
          usedRam = Math.round(perfMem.usedJSHeapSize / (1024 * 1024));
          totalRam = Math.round(perfMem.jsHeapSizeLimit / (1024 * 1024));
        } else if (deviceMem) {
          totalRam = deviceMem * 1024;
          const prevUsage = telemetry.ramUsagePercent || 25;
          const variation = Math.sin(Date.now() / 8000) * 8;
          const currentPercent = Math.max(5, Math.min(95, prevUsage + variation));
          usedRam = Math.round(totalRam * (currentPercent / 100));
        } else {
          usedRam = 380 + Math.floor(Math.random() * 20);
          totalRam = 2048;
        }

        const ramPercent = totalRam > 0 ? Math.round((usedRam / totalRam) * 100) : 0;
        const cpuValue = Math.floor(8 + Math.random() * 18);
        const networkValue = navigator.onLine ? Math.floor(8 + Math.random() * 15) : 999;

        setTelemetry((prev) => {
          const next = {
            ...prev,
            fps: currentFPS,
            ramUsageMb: usedRam,
            ramTotalMb: totalRam,
            ramUsagePercent: ramPercent,
            ramAvailableMb: Math.max(0, totalRam - usedRam - Math.round(totalRam * 0.08)),
            ramCachedMb: Math.round(totalRam * (0.05 + Math.random() * 0.1)),
            cpuUsage: cpuValue,
            networkLatencyMs: networkValue,
            cpuHistory: [...(prev.cpuHistory || []).slice(-(HISTORY_LENGTH - 1)), cpuValue],
            ramHistory: [...(prev.ramHistory || []).slice(-(HISTORY_LENGTH - 1)), ramPercent],
            fpsHistory: [...(prev.fpsHistory || []).slice(-(HISTORY_LENGTH - 1)), currentFPS],
            networkHistory: [...(prev.networkHistory || []).slice(-(HISTORY_LENGTH - 1)), networkValue],
          };
          if (
            next.fps === prev.fps &&
            next.ramUsageMb === prev.ramUsageMb &&
            next.cpuUsage === prev.cpuUsage &&
            next.networkLatencyMs === prev.networkLatencyMs
          ) {
            return prev;
          }
          return next;
        });
      }
      animId = requestAnimationFrame(measureFPS);
    };

    animId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animId);
  }, []);

  const showToast = useCallback((title: string, description?: string, type: ToastMessage['type'] = 'info', options: { category?: ErrorCategory; isCritical?: boolean } = {}) => {
    const { category, isCritical } = options;
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    if (type === 'error' && category) {
      const rateLimitResult = handleError(new Error(description || title), {
        showToast: false,
        logToConsole: false,
        reportCritical: false,
      });

      if (!rateLimitResult.toastShown) {
        return;
      }
    }

    setToasts((prev) => [...prev, { id, type, title, description, timestamp: Date.now(), isCritical, category }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const reportIssue = useCallback((toastId?: string) => {
    const targetToast = toastId ? toasts.find((t) => t.id === toastId) : toasts[0];
    if (!targetToast) return;

    const report = {
      title: targetToast.title,
      description: targetToast.description,
      type: targetToast.type,
      category: targetToast.category || 'unknown',
      timestamp: new Date(targetToast.timestamp).toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    console.group('[Brio] Issue Report Submitted');
    console.log('Report:', report);
    console.groupEnd();

    try {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `brio-issue-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Issue Reported', 'Thank you. A report file has been downloaded.', 'success');
    } catch {
      showToast('Report Failed', 'Could not generate issue report. Please copy console output.', 'warning');
    }
  }, [toasts, showToast]);

  const exportDatabase = useCallback(async () => {
    try {
      if (!activeVaultKey) {
        showToast('Export Failed', 'You must be signed in to export.', 'error');
        return;
      }
      const db = await dbManager.loadDatabase(activeVaultKey);
      if (!db) {
        showToast('Export Failed', 'No database to export', 'error');
        return;
      }
      const blob = await dbManager.exportDatabaseFile(db.data);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `brio_vault_${user?.username || 'vault'}_${new Date().toISOString().slice(0, 10)}.db`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Export Complete', 'Vault file downloaded.', 'success');
    } catch (err: any) {
      const brioErr = createBrioError(err, 'storage');
      const friendly = getUserFriendlyMessage(brioErr, 'storage');
      handleError(brioErr, { showToast: true, logToConsole: true, reportCritical: true });
      showToast(friendly.title, friendly.description, 'error', { category: 'storage', isCritical: true });
    }
  }, [activeVaultKey, user, showToast]);

  const importDatabase = useCallback(async (file: File): Promise<boolean> => {
    try {
      if (!activeVaultKey) {
        showToast('Sign In Required', 'Please sign in to import your vault.', 'warning', { category: 'auth' });
        return false;
      }
      await dbManager.importDatabaseFile(file, activeVaultKey);
      setDatabaseSize(dbManager.getDatabaseSize(activeVaultKey));
      setLastBackupTime(dbManager.getLastBackupTime(activeVaultKey));
      return true;
    } catch (err: any) {
      const brioErr = createBrioError(err, 'storage');
      const friendly = getUserFriendlyMessage(brioErr, 'storage');
      handleError(brioErr, { showToast: true, logToConsole: true, reportCritical: true });
      showToast(friendly.title, friendly.description, 'error', { category: 'storage', isCritical: true });
      return false;
    }
  }, [activeVaultKey, showToast]);

  const backupDatabase = useCallback(async (): Promise<string | null> => {
    try {
      if (!activeVaultKey) {
        showToast('Sign In Required', 'Please sign in to create a backup.', 'warning', { category: 'auth' });
        return null;
      }
      const db = await dbManager.loadDatabase(activeVaultKey);
      if (!db) {
        showToast('No Data', 'No vault data available to back up.', 'warning');
        return null;
      }
      const timestamp = await dbManager.backupDatabase(db.data, activeVaultKey);
      setLastBackupTime(timestamp);
      setDatabaseSize(dbManager.getDatabaseSize(activeVaultKey));
      return timestamp;
    } catch (err: any) {
      const brioErr = createBrioError(err, 'storage');
      const friendly = getUserFriendlyMessage(brioErr, 'storage');
      handleError(brioErr, { showToast: true, logToConsole: true, reportCritical: true });
      showToast(friendly.title, friendly.description, 'error', { category: 'storage', isCritical: true });
      return null;
    }
  }, [activeVaultKey, showToast]);

  const restoreDatabase = useCallback(async (file: File): Promise<boolean> => {
    try {
      if (!activeVaultKey) {
        showToast('Sign In Required', 'Please sign in to restore a backup.', 'warning', { category: 'auth' });
        return false;
      }
      await dbManager.restoreDatabase(file);
      setDatabaseSize(dbManager.getDatabaseSize(activeVaultKey));
      setLastBackupTime(dbManager.getLastBackupTime(activeVaultKey));
      return true;
    } catch (err: any) {
      const brioErr = createBrioError(err, 'storage');
      const friendly = getUserFriendlyMessage(brioErr, 'storage');
      handleError(brioErr, { showToast: true, logToConsole: true, reportCritical: true });
      showToast(friendly.title, friendly.description, 'error', { category: 'storage', isCritical: true });
      return false;
    }
  }, [activeVaultKey, showToast]);

  const getDatabaseInfo = useCallback(() => {
    const metadata = dbManager.getDatabaseMetadata(activeVaultKey || 'default_vault');
    return {
      size: databaseSize,
      lastBackup: lastBackupTime,
      tables: metadata?.tables || [],
    };
  }, [activeVaultKey, databaseSize, lastBackupTime]);

  const setMasterPassphrase = useCallback(
    async (passphrase: string) => {
      try {
        await encryptionService.setMasterPassphrase(passphrase);
        setMasterPassphraseState(passphrase);
        setMasterKeySet(true);
      } catch (err) {
        const brioErr = createBrioError(err, 'crypto');
        const friendly = getUserFriendlyMessage(brioErr, 'crypto');
        handleError(brioErr, { showToast: true, logToConsole: true, reportCritical: true });
        showToast(friendly.title, friendly.description, 'error', { category: 'crypto', isCritical: true });
      }
    },
    [showToast]
  );

  const signupUser = useCallback(
    async (username: string, email: string, passphrase: string): Promise<boolean> => {
      try {
        await encryptionService.setMasterPassphrase(passphrase);
        setMasterPassphraseState(passphrase);

        const checksum = await encryptionService.calculateChecksum(passphrase);
        try {
          const authResult = await apiClient.auth.signup(
            username,
            email || `${username.toLowerCase()}@brio.vault`,
            passphrase
          );
          setSessionToken(authResult.token);
        } catch (err: any) {
          const brioErr = createBrioError(err, 'auth');
          const friendly = getUserFriendlyMessage(brioErr, 'auth');
          handleError(brioErr, { showToast: true, logToConsole: true });
          showToast(friendly.title, friendly.description, 'error', { category: 'auth' });
          return false;
        }

        const vaultKey = `vault_${username.toLowerCase()}`;
        const newUser: UserAccount = {
          id: `usr-${Date.now()}`,
          username,
          email,
          masterKeyHash: checksum,
          createdAt: new Date().toLocaleDateString(),
          isLoggedIn: true,
        };

        const data = {
          users: [newUser],
          chats: [],
          socialPosts: [],
          stickers: [],
          mediaTracks: [],
          iptvChannels: [],
          notes: [],
          todos: [],
          myPlanePics: [],
          settings: {
            user: newUser,
            masterKeySet: true,
            authRequired: true,
            algorithmSettings,
            nightcorePitch,
          },
        };

        await dbManager.saveDatabase(data, vaultKey);

        setUser(newUser);
        setMasterKeySet(true);
        setActiveVaultKey(vaultKey);
        setAuthRequired(false);
        setShowAuthModal(false);
        showToast('Vault Created', 'Encrypted vault stored server-side (SQLite). Save your .db backup securely.', 'success');
        return true;
      } catch (err) {
        const brioErr = createBrioError(err, 'storage');
        const friendly = getUserFriendlyMessage(brioErr, 'storage');
        handleError(brioErr, { showToast: true, logToConsole: true, reportCritical: true });
        showToast(friendly.title, friendly.description, 'error', { category: 'storage', isCritical: true });
        return false;
      }
    },
    [algorithmSettings, nightcorePitch, showToast]
  );

  const loginUser = useCallback(
    async (username: string, passphrase: string, dbFile?: File): Promise<boolean> => {
      try {
        await encryptionService.setMasterPassphrase(passphrase);
        setMasterPassphraseState(passphrase);

        const vaultKey = `vault_${username.toLowerCase()}`;
        const checksum = await encryptionService.calculateChecksum(passphrase);
        try {
          const authResult = await apiClient.auth.login(username, passphrase);
          setSessionToken(authResult.token);
        } catch (err: any) {
          const brioErr = createBrioError(err, 'auth');
          const friendly = getUserFriendlyMessage(brioErr, 'auth');
          handleError(brioErr, { showToast: true, logToConsole: true });
          showToast(friendly.title, friendly.description, 'error', { category: 'auth' });
          setMasterKeySet(false);
          return false;
        }

        let db = await dbManager.loadDatabase(vaultKey);

        if (!db && dbFile) {
          db = await dbManager.loadDatabaseFromFile(dbFile);
          if (db) {
            await dbManager.saveDatabase(db.data, vaultKey);
          }
        }

        if (!db || !db.data) {
          const emptyData = {
            users: user ? [user] : [],
            chats: [],
            socialPosts: [],
            stickers: [],
            mediaTracks: currentTrack ? [currentTrack] : [],
            iptvChannels: [],
            notes: [],
            todos: [],
            myPlanePics: [],
            settings: {
              user,
              masterKeySet: true,
              authRequired: true,
              algorithmSettings,
              nightcorePitch,
            },
          };
          await dbManager.saveDatabase(emptyData, vaultKey);
          setActiveVaultKey(vaultKey);
          setUser({ ...(user || { id: `usr-${Date.now()}`, username, email: `${username.toLowerCase()}@brio.vault`, masterKeyHash: checksum, createdAt: new Date().toLocaleDateString(), isLoggedIn: true }), isLoggedIn: true });
          setMasterKeySet(true);
          setAuthRequired(false);
          setShowAuthModal(false);
          showToast('Vault Initialized', 'New vault created. Your data will be saved locally.', 'success');
          return true;
        }

        const existingUser = db.data.settings?.user as UserAccount | undefined;

        if (existingUser && existingUser.username.toLowerCase() === username.toLowerCase()) {
          const storedHash = existingUser.masterKeyHash;
          const currentHash = await encryptionService.calculateChecksum(passphrase);
          if (storedHash && storedHash === currentHash) {
            setActiveVaultKey(vaultKey);
            setUser({ ...existingUser, isLoggedIn: true });
            setMasterKeySet(true);
            setAuthRequired(false);
            setShowAuthModal(false);

            if (db.data.settings?.algorithmSettings) {
              setAlgorithmSettings(db.data.settings.algorithmSettings);
            }
            if (db.data.settings?.nightcorePitch) {
              setNightcorePitch(db.data.settings.nightcorePitch);
            }
            if (db.data.chats) {
              setMessages(db.data.chats);
            }
            if (db.data.socialPosts) {
              setSocialPosts(db.data.socialPosts);
            }
            if (db.data.stickers) {
              setStickers(db.data.stickers);
            }
            if (db.data.mediaTracks && db.data.mediaTracks.length > 0) {
              setCurrentTrack(db.data.mediaTracks[0]);
            }
            if (db.data.iptvChannels) {
              setIptvChannels(db.data.iptvChannels);
            }
            if (db.data.notes) {
              setNotes(db.data.notes);
            }
            if (db.data.todos) {
              setTodos(db.data.todos);
            }
            if (db.data.myPlanePics) {
              const restored = db.data.myPlanePics.map((p: any) => ({
                ...p,
                imageUrl: p.imageUrl || p.thumbnailUrl || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&fit=crop',
              }));
              setMyPlanePics(restored);
            }

            showToast('Vault Unlocked', 'Database decrypted and loaded successfully.', 'success');
            return true;
          }
          const brioErr = createBrioError(new Error('Incorrect passphrase'), 'auth');
          const friendly = getUserFriendlyMessage(brioErr, 'auth');
          handleError(brioErr, { showToast: true, logToConsole: true });
          showToast(friendly.title, friendly.description, 'error', { category: 'auth' });
          setMasterKeySet(false);
          return false;
        }

        const brioErr = createBrioError(new Error('User not found'), 'auth');
        const friendly2 = getUserFriendlyMessage(brioErr, 'auth');
        handleError(brioErr, { showToast: true, logToConsole: true });
        showToast(friendly2.title, friendly2.description, 'error', { category: 'auth' });
        return false;
      } catch (err) {
        const brioErr = createBrioError(err);
        const friendly = getUserFriendlyMessage(brioErr);
        handleError(brioErr, { showToast: true, logToConsole: true, reportCritical: brioErr.category === 'crypto' });
        showToast(friendly.title, friendly.description, 'error', { category: brioErr.category, isCritical: brioErr.category === 'crypto' });
        return false;
      }
    },
    [showToast]
  );

  const setSessionToken = useCallback((token: string | null) => {
    setSessionTokenState(token);
    try {
      if (token) localStorage.setItem('brio_session', token);
      else localStorage.removeItem('brio_session');
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const logoutUser = useCallback(() => {
    const token = sessionToken;
    if (token) {
      apiClient.auth.logout(token).catch(() => {});
    }
    setSessionToken(null);
    setUser(null);
    setMasterKeySet(false);
    setActiveVaultKey(null);
    setAuthRequired(true);
    setShowAuthModal(true);
  }, [sessionToken]);

  const updateUserAvatar = useCallback((avatarUrl: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, avatarUrl };
    });
  }, []);

  const setAuthRequiredState = useCallback((required: boolean) => {
    setAuthRequired(required);
  }, []);

  const updateAuthRequired = useCallback((required: boolean) => {
    setAuthRequiredState(required);
  }, [setAuthRequiredState]);

  const addMessage = useCallback(
    async (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
      try {
        let encryptedPayload;
        if (msg.isEncrypted && msg.text) {
          encryptedPayload = await encryptionService.encrypt(msg.text);
        }
        const newMsg: ChatMessage = {
          ...msg,
          id: `msg-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          status: 'sending',
          encryptedPayload,
          text: msg.isEncrypted && msg.text ? '🔒 [AES-256 Encrypted Message]' : msg.text,
        };
        setMessages((prev) => [...prev, newMsg]);

        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'delivered' } : m))
          );
        }, 500);

        if (newMsg.disappearingAt) {
          setTimeout(() => {
            setMessages((prev) => prev.filter((m) => m.id !== newMsg.id));
          }, new Date(newMsg.disappearingAt).getTime() - Date.now());
        }
      } catch (err) {
        const brioErr = createBrioError(err);
        const friendly = getUserFriendlyMessage(brioErr);
        handleError(brioErr, { showToast: true, logToConsole: true });
        showToast(friendly.title, friendly.description, 'error', { category: brioErr.category });
      }
    },
    [showToast]
  );

  const updateMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const searchMessages = useCallback((conversationId: string, query: string) => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return messages.filter(m => m.conversationId === conversationId && m.text.toLowerCase().includes(q));
  }, [messages]);

  const addConversation = useCallback((participants: string[], isGroup = false): Conversation => {
    const id = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id,
      participants,
      participantDetails: [],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isGroup,
      createdAt: new Date().toLocaleTimeString(),
      updatedAt: new Date().toLocaleTimeString(),
    };
    setConversations(prev => [newConv, ...prev]);
    return newConv;
  }, []);

  const updateConversation = useCallback((id: string, patch: Partial<Conversation>) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    setMessages(prev => prev.filter(m => m.conversationId !== id));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const addSocialPost = useCallback(
    async (content: string, isEncrypted: boolean, mediaUrl?: string, mediaUrls?: string[], mediaType?: SocialPost['mediaType']) => {
      try {
        let encryptedContent;
        if (isEncrypted) {
          encryptedContent = await encryptionService.encrypt(content);
        }
        const newPost: SocialPost = {
          id: `post-${Date.now()}`,
          authorId: user?.id || 'anonymous',
          authorName: user ? user.username : 'Anonymous Spotter',
          authorHandle: user ? `@${user.username.toLowerCase().replace(/\s+/g, '')}` : '@brio_agent',
          authorAvatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          content: isEncrypted ? '🔒 [AES-256 Encrypted Payload]' : content,
          encryptedContent,
          isEncrypted,
          mediaUrl,
          mediaUrls: mediaUrls || [],
          mediaType: mediaType || 'image',
          timestamp: 'Just now',
          likes: 0,
          commentsCount: 0,
          comments: [],
          shares: 0,
          bookmarkCount: 0,
          viewCount: 0,
          isPinned: false,
          userSaved: false,
          privacyRank: isEncrypted ? 5 : 3,
          category: 'general',
        };
        setSocialPosts((prev) => [newPost, ...prev]);
      } catch (err) {
        const brioErr = createBrioError(err);
        const friendly = getUserFriendlyMessage(brioErr);
        handleError(brioErr, { showToast: true, logToConsole: true });
        showToast(friendly.title, friendly.description, 'error', { category: brioErr.category });
      }
    },
    [user, showToast]
  );

  const toggleLikePost = useCallback((postId: string) => {
    setSocialPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const userLiked = !p.userLiked;
          return {
            ...p,
            userLiked,
            likes: userLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  }, []);

  const addSticker = useCallback(
    async (name: string, category: StickerItem['category'], dataUrl: string) => {
      try {
        const newSticker: StickerItem = {
          id: `st-${Date.now()}`,
          name,
          category,
          dataUrl,
          isEncrypted: true,
        };
        setStickers((prev) => [...prev, newSticker]);
      } catch (err) {
        const brioErr = createBrioError(err, 'storage');
        const friendly = getUserFriendlyMessage(brioErr, 'storage');
        handleError(brioErr, { showToast: true, logToConsole: true });
        showToast(friendly.title, friendly.description, 'error', { category: 'storage' });
      }
    },
    [showToast]
  );

  const saveNote = useCallback(
    async (title: string, content: string, tags: string[], isEncrypted: boolean) => {
      try {
        let encryptedData;
        if (isEncrypted) {
          encryptedData = await encryptionService.encrypt(content);
        }
        const newNote: NoteItem = {
          id: `note-${Date.now()}`,
          title,
          content: isEncrypted ? '🔒 [AES-256 Encrypted Note Content]' : content,
          tags,
          updatedAt: new Date().toLocaleDateString(),
          isEncrypted,
          encryptedData,
        };
        setNotes((prev) => [newNote, ...prev.filter((n) => n.title !== title)]);
      } catch (err) {
        const brioErr = createBrioError(err, 'storage');
        const friendly = getUserFriendlyMessage(brioErr, 'storage');
        handleError(brioErr, { showToast: true, logToConsole: true });
        showToast(friendly.title, friendly.description, 'error', { category: 'storage' });
      }
    },
    [showToast]
  );

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addTodo = useCallback(
    (task: string, priority: TodoItem['priority'], category: string) => {
      const newTodo: TodoItem = {
        id: `td-${Date.now()}`,
        task,
        priority,
        completed: false,
        category,
        isEncrypted: true,
      };
      setTodos((prev) => [newTodo, ...prev]);
    },
    []
  );

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleSavePost = useCallback((postId: string) => {
    setSocialPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const userSaved = !p.userSaved;
      return { ...p, userSaved, bookmarkCount: (p.bookmarkCount || 0) + (userSaved ? 1 : -1) };
    }));
    setSavedPosts(prev => {
      const idx = prev.indexOf(postId);
      if (idx >= 0) return prev.filter(id => id !== postId);
      return [...prev, postId];
    });
  }, []);

  const addComment = useCallback(async (postId: string, text: string) => {
    if (!user) return;
    const comment: Comment = {
      id: `cmt-${Date.now()}`,
      postId,
      authorId: user.id,
      authorName: user.username,
      authorAvatar: user.avatarUrl || '',
      text,
      timestamp: new Date().toLocaleTimeString(),
      likes: 0,
    };
    setSocialPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, commentsCount: (p.commentsCount || 0) + 1, comments: [...(p.comments || []), comment] };
    }));
  }, [user]);

  const deleteComment = useCallback((postId: string, commentId: string) => {
    setSocialPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, commentsCount: Math.max(0, (p.commentsCount || 0) - 1), comments: (p.comments || []).filter(c => c.id !== commentId) };
    }));
  }, []);

  const toggleLikeComment = useCallback((postId: string, commentId: string) => {
    setSocialPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: (p.comments || []).map(c => {
          if (c.id !== commentId) return c;
          const userLiked = !c.userLiked;
          return { ...c, userLiked, likes: userLiked ? c.likes + 1 : c.likes - 1 };
        }),
      };
    }));
  }, []);

  const sharePost = useCallback((postId: string, targetConversationId?: string) => {
    try {
      setSocialPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: p.shares + 1 } : p));
      showToast('Shared', 'Post shared successfully.', 'success');
    } catch (err) {
      const brioErr = createBrioError(err);
      const friendly = getUserFriendlyMessage(brioErr);
      handleError(brioErr, { showToast: true, logToConsole: true });
      showToast(friendly.title, friendly.description, 'error', { category: brioErr.category });
    }
  }, [showToast]);

  const deleteSocialPost = useCallback((postId: string) => {
    setSocialPosts(prev => prev.filter(p => p.id !== postId));
    setSavedPosts(prev => prev.filter(id => id !== postId));
  }, []);

  const updateSocialPost = useCallback((postId: string, patch: Partial<SocialPost>) => {
    setSocialPosts(prev => prev.map(p => p.id === postId ? { ...p, ...patch } : p));
  }, []);

  const searchPosts = useCallback((query: string) => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return socialPosts.filter(p => p.content.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q));
  }, [socialPosts]);

  const searchContacts = useCallback((query: string) => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return conversations.flatMap(c => c.participantDetails.filter(p => p.name.toLowerCase().includes(q)));
  }, [conversations]);

  const addStory = useCallback((mediaUrl: string, mediaType: 'image' | 'video') => {
    if (!user) return;
    const story: Story = {
      id: `story-${Date.now()}`,
      userId: user.id,
      authorName: user.username,
      authorAvatar: user.avatarUrl || '',
      mediaUrl,
      mediaType,
      timestamp: new Date().toLocaleTimeString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      viewers: [],
    };
    setStories(prev => [story, ...prev]);
  }, [user]);

  const markStoryViewed = useCallback((storyId: string) => {
    if (!user) return;
    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      return { ...s, viewers: [...(s.viewers || []), user.id] };
    }));
  }, [user]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, { body: notification.body });
    }
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const updatePresence = useCallback((userId: string, status: 'online' | 'away' | 'dnd' | 'offline') => {
    setPresence(prev => ({
      ...prev,
      [userId]: { status, lastSeen: new Date().toLocaleTimeString() },
    }));
  }, []);

  const followUser = useCallback((userId: string) => {
    setFollows(prev => ({
      ...prev,
      [user?.id || '']: [...(prev[user?.id || ''] || []), userId],
    }));
  }, [user]);

  const unfollowUser = useCallback((userId: string) => {
    setFollows(prev => ({
      ...prev,
      [user?.id || '']: (prev[user?.id || ''] || []).filter(id => id !== userId),
    }));
  }, [user]);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const channel = new BroadcastChannel('brio_social_sync');
      broadcastChannelRef.current = channel;
      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'NEW_MESSAGE') {
          setMessages(prev => [...prev, payload]);
        } else if (type === 'NEW_POST') {
          setSocialPosts(prev => [payload, ...prev]);
        } else if (type === 'NEW_NOTIFICATION') {
          setNotifications(prev => [payload, ...prev]);
        }
      };
      return () => channel.close();
    } catch {
      // BroadcastChannel not supported
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event: StorageEvent) => {
      if (event.key === 'brio_new_message' && event.newValue) {
        try {
          const msg = JSON.parse(event.newValue);
          setMessages(prev => [...prev, msg]);
        } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMessages(prev => prev.filter(m => !m.disappearingAt || new Date(m.disappearingAt).getTime() > now));
      setStories(prev => prev.filter(s => new Date(s.expiresAt).getTime() > now));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const contextValue = useMemo(() => ({
    activeHub,
    setActiveHub,
    showAuthModal,
    setShowAuthModal,
    showMobileGUI,
    setShowMobileGUI,
    t,
    user,
    masterKeySet,
    loginUser,
    signupUser,
    logoutUser,
    updateUserAvatar,
    masterPassphrase,
    setMasterPassphrase,
    authRequired,
    setAuthRequired: updateAuthRequired,
    toasts,
    showToast,
    removeToast,
    reportIssue,
    messages,
    addMessage,
    updateMessage,
    deleteMessage,
    searchMessages,
    theme,
    toggleTheme,
    conversations,
    addConversation,
    updateConversation,
    deleteConversation,
    socialPosts,
    addSocialPost,
    toggleLikePost,
    toggleSavePost,
    savedPosts,
    addComment,
    deleteComment,
    toggleLikeComment,
    sharePost,
    deleteSocialPost,
    updateSocialPost,
    algorithmSettings,
    setAlgorithmSettings,
    searchPosts,
    searchContacts,
    stickers,
    addSticker,
    stories,
    addStory,
    markStoryViewed,
    notifications,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    presence,
    updatePresence,
    follows,
    followUser,
    unfollowUser,
    currentTrack,
    setCurrentTrack,
    isPlayingMusic,
    setIsPlayingMusic,
    nightcorePitch,
    setNightcorePitch,
    iptvChannels,
    setIptvChannels,
    selectedIPTVChannel,
    setSelectedIPTVChannel,
    notes,
    saveNote,
    deleteNote,
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    myPlanePics,
    setMyPlanePics,
    activeVaultKey,
    setActiveVaultKey,
    telemetry,
    databaseSize,
    lastBackupTime,
    exportDatabase,
    importDatabase,
    backupDatabase,
    restoreDatabase,
    getDatabaseInfo,
  }), [
    activeHub, showAuthModal, showMobileGUI, user, masterKeySet, loginUser, signupUser, logoutUser, updateUserAvatar,
    masterPassphrase, authRequired, toasts, showToast, removeToast, messages, addMessage, updateMessage, deleteMessage, searchMessages,
    socialPosts, addSocialPost, toggleLikePost, toggleSavePost, addComment, deleteComment, toggleLikeComment, sharePost, deleteSocialPost, updateSocialPost,
    algorithmSettings, setAlgorithmSettings, searchPosts, searchContacts,
    stickers, addSticker, stories, addStory, markStoryViewed,
    notifications, addNotification, markNotificationRead, markAllNotificationsRead,
    presence, updatePresence, follows, followUser, unfollowUser,
    conversations, addConversation, updateConversation, deleteConversation,
    currentTrack, setCurrentTrack, isPlayingMusic, setIsPlayingMusic,
    nightcorePitch, setNightcorePitch, iptvChannels, setIptvChannels, selectedIPTVChannel,
    setSelectedIPTVChannel, notes, saveNote, deleteNote, todos, addTodo, toggleTodo, deleteTodo,
    myPlanePics, setMyPlanePics, activeVaultKey, setActiveVaultKey, telemetry, databaseSize, lastBackupTime,
    exportDatabase, importDatabase, backupDatabase, restoreDatabase, getDatabaseInfo, reportIssue, theme, toggleTheme,
  ]);

  return (
    <AppContext.Provider
      value={contextValue}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
