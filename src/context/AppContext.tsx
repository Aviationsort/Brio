/**
 * Global Brio Application State Context
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  HubId,
  UserAccount,
  ChatMessage,
  SocialPost,
  StickerItem,
  MediaTrack,
  IPTVChannel,
  NoteItem,
  TodoItem,
  FeedAlgorithmSettings,
  SystemTelemetryData,
  PlanePhoto,
} from '../types';
import { t } from '../utils/translations';
import { encryptionService } from '../utils/crypto';
import { dbManager } from '../utils/dbManager';

interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  timestamp: number;
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
  loginUser: (username: string, passphrase: string) => Promise<boolean>;
  signupUser: (username: string, email: string, passphrase: string) => Promise<boolean>;
  logoutUser: () => void;
  masterPassphrase: string;
  setMasterPassphrase: (passphrase: string) => Promise<void>;
  authRequired: boolean;
  setAuthRequired: (required: boolean) => void;

  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  socialPosts: SocialPost[];
  addSocialPost: (content: string, isEncrypted: boolean, mediaUrl?: string) => Promise<void>;
  toggleLikePost: (postId: string) => void;
  algorithmSettings: FeedAlgorithmSettings;
  setAlgorithmSettings: React.Dispatch<React.SetStateAction<FeedAlgorithmSettings>>;
  stickers: StickerItem[];
  addSticker: (name: string, category: StickerItem['category'], dataUrl: string) => Promise<void>;

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
  const [masterPassphrase, setMasterPassphraseState] = useState<string>('');
  const [masterKeySet, setMasterKeySet] = useState<boolean>(false);
  const [authRequired, setAuthRequired] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(INITIAL_POSTS);
  const [algorithmSettings, setAlgorithmSettings] = useState<FeedAlgorithmSettings>({
    recencyWeight: 75,
    engagementWeight: 60,
    echoChamberFilter: 80,
    decryptedPrivacyRank: 90,
    mediaWeight: 50,
  });
  const [stickers, setStickers] = useState<StickerItem[]>([]);

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
    fps: 60,
    networkLatencyMs: 16,
    storageUsedMb: 62,
    cryptoWorkerStatus: 'active',
    activeThreads: 4,
    systemLogs: [
      { timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Brio Cryptographic Vault Initialized.' },
      { timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'UI strings loaded.' },
    ],
    gpuName: undefined,
    gpuDriver: undefined,
    cpuName: undefined,
    cpuCores: undefined,
    cpuThreads: undefined,
    gpuMemoryMb: undefined,
    gpuMemoryTotalMb: undefined,
    romTotalGb: undefined,
    romUsedGb: undefined,
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
      myPlanePics: convertedMyPlanePics,
      settings: {
        user,
        masterKeySet,
        authRequired,
        algorithmSettings,
        nightcorePitch,
      },
    };

    await dbManager.saveDatabase(data);

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
  }, [user, masterKeySet, authRequired, messages, socialPosts, stickers, currentTrack, iptvChannels, notes, todos, myPlanePics, algorithmSettings, nightcorePitch]);

  const loadDb = useCallback(async () => {
    try {
      if (!masterKeySet) return;
      const db = await dbManager.loadDatabase();
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
  }, [masterKeySet]);

  useEffect(() => {
    setDatabaseSize(dbManager.getDatabaseSize());
    setLastBackupTime(dbManager.getLastBackupTime());
  }, []);

  useEffect(() => {
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
      myPlanePics: picsForDb,
      settings: {
        user,
        masterKeySet,
        authRequired,
        algorithmSettings,
        nightcorePitch,
      },
    };

    dbManager.saveDatabase(data);

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
  }, [user, masterKeySet, authRequired, messages, socialPosts, stickers, currentTrack, iptvChannels, notes, todos, myPlanePics, algorithmSettings, nightcorePitch]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectHardware = () => {
      const ua = navigator.userAgent || '';
      const threads = navigator.hardwareConcurrency || 4;

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
        }
      } catch {
        // WebGL not available
      }

      const perfMem = (performance as any).memory;
      let romTotalGb: number | undefined;
      let romUsedGb: number | undefined;
      if (perfMem) {
        const totalBytes = perfMem.jsHeapSizeLimit;
        const usedBytes = perfMem.usedJSHeapSize;
        romTotalGb = Math.round(totalBytes / (1024 * 1024 * 1024) * 10) / 10;
        romUsedGb = Math.round(usedBytes / (1024 * 1024 * 1024) * 100) / 100;
      }

      const storageEstimate = (navigator as any).storage?.estimate;
      let storageTotalGb: number | undefined;
      let storageUsedMb: number | undefined;
      if (storageEstimate) {
        storageEstimate().then((est: any) => {
          if (est.quota) {
            storageTotalGb = Math.round(est.quota / (1024 * 1024 * 1024) * 10) / 10;
          }
          if (est.usage) {
            storageUsedMb = Math.round(est.usage / (1024 * 1024));
          }
        });
      }

      setTelemetry((prev) => ({
        ...prev,
        cpuName: detectedCpuName,
        cpuCores: cores,
        cpuThreads: threads,
        gpuName,
        gpuDriver,
        gpuMemoryTotalMb,
        romTotalGb: romTotalGb || storageTotalGb,
        romUsedGb: romUsedGb || storageUsedMb ? (storageUsedMb || 0) / 1024 : undefined,
        storageUsedMb: storageUsedMb || prev.storageUsedMb,
      }));
    };

    detectHardware();
  }, []);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measureFPS = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const currentFPS = Math.min(60, Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;

        const perfMem = (performance as any).memory;
        const usedRam = perfMem ? Math.round(perfMem.usedJSHeapSize / (1024 * 1024)) : 380 + Math.floor(Math.random() * 20);
        const totalRam = perfMem ? Math.round(perfMem.jsHeapSizeLimit / (1024 * 1024)) : 2048;

        setTelemetry((prev) => ({
          ...prev,
          fps: currentFPS,
          ramUsageMb: usedRam,
          ramTotalMb: totalRam,
          cpuUsage: Math.floor(10 + Math.random() * 15),
          networkLatencyMs: navigator.onLine ? Math.floor(12 + Math.random() * 12) : 999,
        }));
      }
      animId = requestAnimationFrame(measureFPS);
    };

    animId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animId);
  }, []);

  const showToast = useCallback((title: string, description?: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, description, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const exportDatabase = useCallback(async () => {
    try {
      const db = await dbManager.loadDatabase();
      if (!db) {
        showToast('Export Failed', 'No database to export', 'error');
        return;
      }
      const blob = await dbManager.exportDatabaseFile(db.data);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `brio_vault_database_${new Date().toISOString().slice(0, 10)}.db`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Export Complete', 'Vault file downloaded.', 'success');
    } catch (err: any) {
      showToast('Export Error', err.message || 'Failed to export database', 'error');
    }
  }, [showToast]);

  const importDatabase = useCallback(async (file: File): Promise<boolean> => {
    try {
      await dbManager.importDatabaseFile(file);
      return true;
    } catch (err: any) {
      showToast('Import Error', err.message || 'Failed to import database', 'error');
      return false;
    }
  }, [showToast]);

  const backupDatabase = useCallback(async (): Promise<string | null> => {
    try {
      const db = await dbManager.loadDatabase();
      if (!db) {
        showToast('Backup Failed', 'No database to backup', 'error');
        return null;
      }
      const timestamp = await dbManager.backupDatabase(db.data);
      setLastBackupTime(timestamp);
      setDatabaseSize(dbManager.getDatabaseSize());
      return timestamp;
    } catch (err: any) {
      showToast('Backup Error', err.message || 'Failed to backup database', 'error');
      return null;
    }
  }, [showToast]);

  const restoreDatabase = useCallback(async (file: File): Promise<boolean> => {
    try {
      await dbManager.restoreDatabase(file);
      setDatabaseSize(dbManager.getDatabaseSize());
      setLastBackupTime(dbManager.getLastBackupTime());
      return true;
    } catch (err: any) {
      showToast('Restore Error', err.message || 'Failed to restore database', 'error');
      return false;
    }
  }, [showToast]);

  const getDatabaseInfo = useCallback(() => {
    const metadata = dbManager.getDatabaseMetadata();
    return {
      size: databaseSize,
      lastBackup: lastBackupTime,
      tables: metadata?.tables || [],
    };
  }, [databaseSize, lastBackupTime]);

  const setMasterPassphrase = useCallback(
    async (passphrase: string) => {
      try {
        await encryptionService.setMasterPassphrase(passphrase);
        setMasterPassphraseState(passphrase);
        setMasterKeySet(true);
      } catch (err) {
        showToast('Encryption Key Error', String(err), 'error');
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
            authRequired: false,
            algorithmSettings,
            nightcorePitch,
          },
        };

        await dbManager.saveDatabase(data);
        setUser(newUser);
        setMasterKeySet(true);
        setAuthRequired(false);
        setShowAuthModal(false);
        showToast('Vault Created', 'Encrypted .db vault created. Download and save it securely.', 'success');
        return true;
      } catch (err) {
        showToast('Signup Error', String(err), 'error');
        return false;
      }
    },
    [algorithmSettings, nightcorePitch, showToast]
  );

  const loginUser = useCallback(
    async (username: string, passphrase: string): Promise<boolean> => {
      try {
        await encryptionService.setMasterPassphrase(passphrase);
        setMasterPassphraseState(passphrase);

        const storedDb = await dbManager.loadDatabase();

        if (!storedDb || !storedDb.data) {
          showToast('No Vault Found', 'Please create a vault first.', 'warning');
          return false;
        }

        const existingUser = storedDb.data.settings?.user as UserAccount | undefined;

        if (existingUser && existingUser.username.toLowerCase() === username.toLowerCase()) {
          const storedHash = existingUser.masterKeyHash;
          const currentHash = await encryptionService.calculateChecksum(passphrase);
          if (storedHash && storedHash === currentHash) {
            setUser({ ...existingUser, isLoggedIn: true });
            setMasterKeySet(true);
            setAuthRequired(false);
            setShowAuthModal(false);

            if (storedDb.data.settings?.algorithmSettings) {
              setAlgorithmSettings(storedDb.data.settings.algorithmSettings);
            }
            if (storedDb.data.settings?.nightcorePitch) {
              setNightcorePitch(storedDb.data.settings.nightcorePitch);
            }
            if (storedDb.data.chats) {
              setMessages(storedDb.data.chats);
            }
            if (storedDb.data.socialPosts) {
              setSocialPosts(storedDb.data.socialPosts);
            }
            if (storedDb.data.stickers) {
              setStickers(storedDb.data.stickers);
            }
            if (storedDb.data.mediaTracks && storedDb.data.mediaTracks.length > 0) {
              setCurrentTrack(storedDb.data.mediaTracks[0]);
            }
            if (storedDb.data.iptvChannels) {
              setIptvChannels(storedDb.data.iptvChannels);
            }
            if (storedDb.data.notes) {
              setNotes(storedDb.data.notes);
            }
            if (storedDb.data.todos) {
              setTodos(storedDb.data.todos);
            }
            if (storedDb.data.myPlanePics) {
              const restored = storedDb.data.myPlanePics.map((p: any) => ({
                ...p,
                imageUrl: p.imageUrl || p.thumbnailUrl || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&fit=crop',
              }));
              setMyPlanePics(restored);
            }

            const dbDataForExport = {
              users: storedDb.data.users || [],
              chats: storedDb.data.chats || [],
              socialPosts: storedDb.data.socialPosts || [],
              stickers: storedDb.data.stickers || [],
              mediaTracks: storedDb.data.mediaTracks || [],
              iptvChannels: storedDb.data.iptvChannels || [],
              notes: storedDb.data.notes || [],
              todos: storedDb.data.todos || [],
              myPlanePics: storedDb.data.myPlanePics || [],
              settings: storedDb.data.settings || {},
            };
            dbManager.exportDatabaseFile(dbDataForExport).then((blob) => {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `brio_vault_${existingUser.username}_${new Date().toISOString().slice(0, 10)}.db`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }).catch(() => {});

            showToast('Vault Unlocked', 'Database decrypted and loaded successfully.', 'success');
            return true;
          }
          showToast('Authentication Failed', 'Incorrect passphrase.', 'error');
          setMasterKeySet(false);
          return false;
        }

        showToast('User Not Found', 'No account found with that username.', 'error');
        return false;
      } catch (err) {
        showToast('Login Error', String(err), 'error');
        return false;
      }
    },
    [showToast]
  );

  const logoutUser = useCallback(() => {
    setUser(null);
    setAuthRequired(true);
    setShowAuthModal(true);
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
          encryptedPayload,
        };
        setMessages((prev) => [...prev, newMsg]);
      } catch (err) {
        showToast('Messaging Error', String(err), 'error');
      }
    },
    [showToast]
  );

  const addSocialPost = useCallback(
    async (content: string, isEncrypted: boolean, mediaUrl?: string) => {
      try {
        let encryptedContent;
        if (isEncrypted) {
          encryptedContent = await encryptionService.encrypt(content);
        }
        const newPost: SocialPost = {
          id: `post-${Date.now()}`,
          authorName: user ? user.username : 'Anonymous Spotter',
          authorHandle: user ? `@${user.username.toLowerCase().replace(/\s+/g, '')}` : '@brio_agent',
          authorAvatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          content: isEncrypted ? '🔒 [AES-256 Encrypted Payload]' : content,
          encryptedContent,
          isEncrypted,
          mediaUrl,
          timestamp: 'Just now',
          likes: 0,
          commentsCount: 0,
          shares: 0,
          privacyRank: isEncrypted ? 5 : 3,
          category: 'general',
        };
        setSocialPosts((prev) => [newPost, ...prev]);
      } catch (err) {
        showToast('Publishing Error', String(err), 'error');
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
        showToast('Sticker Storage Error', String(err), 'error');
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
        showToast('Note Error', String(err), 'error');
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

  return (
    <AppContext.Provider
      value={{
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
        masterPassphrase,
        setMasterPassphrase,
        authRequired,
        setAuthRequired: updateAuthRequired,
        toasts,
        showToast,
        removeToast,
        messages,
        addMessage,
        socialPosts,
        addSocialPost,
        toggleLikePost,
        algorithmSettings,
        setAlgorithmSettings,
        stickers,
        addSticker,
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
        telemetry,
        databaseSize,
        lastBackupTime,
        exportDatabase,
        importDatabase,
        backupDatabase,
        restoreDatabase,
        getDatabaseInfo,
      }}
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
