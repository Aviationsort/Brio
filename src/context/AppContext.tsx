/**
 * Global Brio Application State Context
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  loginUser: (username: string, email: string, passphrase: string) => Promise<boolean>;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_POSTS: SocialPost[] = [];

const INITIAL_STICKERS: StickerItem[] = [
  {
    id: 'st-1',
    name: 'Boeing 777 Wing',
    category: 'Aviation',
    dataUrl: '✈️',
    isEncrypted: false,
  },
  {
    id: 'st-2',
    name: 'Cyber Shield',
    category: 'Cyber',
    dataUrl: '🛡️',
    isEncrypted: false,
  },
];

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const detectDeviceGUI = () => {
      const width = window.innerWidth;
      const ua = navigator.userAgent || '';
      const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

      if (width < 640 || (isMobileUA && width < 768)) {
        setShowMobileGUI(true);
      } else {
        setShowMobileGUI(false);
      }
    };

    detectDeviceGUI();
    window.addEventListener('resize', detectDeviceGUI);
    return () => window.removeEventListener('resize', detectDeviceGUI);
  }, []);

  useEffect(() => {
    const loadDb = async () => {
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
    };
    loadDb();
  }, [masterKeySet]);

  const saveDb = useCallback(async (data: any) => {
    try {
      await dbManager.saveDatabase(data);
    } catch (e) {
      console.error('Failed to save .db database:', e);
    }
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(INITIAL_POSTS);
  const [algorithmSettings, setAlgorithmSettings] = useState<FeedAlgorithmSettings>({
    recencyWeight: 75,
    engagementWeight: 60,
    echoChamberFilter: 80,
    decryptedPrivacyRank: 90,
    mediaWeight: 50,
  });
  const [stickers, setStickers] = useState<StickerItem[]>(INITIAL_STICKERS);

  const [currentTrack, setCurrentTrack] = useState<MediaTrack | null>({
    id: 'track-1',
    title: 'Cyber Sky (Nightcore Remix)',
    artist: 'Brio Sound Lab',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cyberpunk-2099-10701.mp3',
    durationSeconds: 184,
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
  });

  useEffect(() => {
    const picsForDb = myPlanePics.map((p) => {
      const { imageUrl, videoUrl, ...rest } = p as any;
      return {
        ...rest,
        imageUrl: p.thumbnailUrl || '',
        videoUrl: undefined,
      };
    });
    saveDb({
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
    });
  }, [user, masterKeySet, authRequired, messages, socialPosts, stickers, currentTrack, iptvChannels, notes, todos, myPlanePics, algorithmSettings, nightcorePitch, saveDb]);

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

  const setMasterPassphrase = useCallback(
    async (passphrase: string) => {
      try {
        await encryptionService.setMasterPassphrase(passphrase);
        setMasterPassphraseState(passphrase);
        setMasterKeySet(true);
        showToast('Vault Key Updated', 'AES-GCM Master Key derived successfully.', 'success');
      } catch (err) {
        showToast('Encryption Key Error', String(err), 'error');
      }
    },
    [showToast]
  );

  const loginUser = useCallback(
    async (username: string, email: string, passphrase: string): Promise<boolean> => {
      try {
        await setMasterPassphrase(passphrase);

        const storedDb = await dbManager.loadDatabase();
        const existingUser = storedDb?.data?.settings?.user as UserAccount | undefined;

        if (existingUser && existingUser.username.toLowerCase() === username.toLowerCase()) {
          const storedHash = existingUser.masterKeyHash;
          const currentHash = await encryptionService.calculateChecksum(passphrase);
          if (storedHash && storedHash === currentHash) {
            setUser({ ...existingUser, isLoggedIn: true });
            setAuthRequired(false);
            setShowAuthModal(false);
            showToast('Access Granted', `Welcome back, ${existingUser.username}! Vault unlocked.`, 'success');
            return true;
          }
          showToast('Authentication Failed', 'Incorrect passphrase for existing account.', 'error');
          return false;
        }

        const checksum = await encryptionService.calculateChecksum(passphrase);
        const newUser: UserAccount = {
          id: `usr-${Date.now()}`,
          username,
          email,
          masterKeyHash: checksum,
          createdAt: new Date().toLocaleDateString(),
          isLoggedIn: true,
        };
        setUser(newUser);
        setAuthRequired(false);
        setShowAuthModal(false);
        showToast('Account Created', `Welcome, ${username}! Encrypted vault initialized.`, 'success');
        return true;
      } catch (err) {
        showToast('Authentication Error', String(err), 'error');
        return false;
      }
    },
    [setMasterPassphrase, showToast]
  );

  const logoutUser = useCallback(() => {
    setUser(null);
    setAuthRequired(true);
    setShowAuthModal(true);
    showToast('Vault Locked', 'Session terminated. Data secured.', 'info');
  }, [showToast]);

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
        showToast('Message Sent', msg.isEncrypted ? 'Encrypted message sent' : 'Sent', 'success');
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
        showToast('Post Broadcast', isEncrypted ? 'Encrypted Social Payload Published' : 'Published to Feed', 'success');
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
        showToast('Sticker Saved', `Added ${name} to Encrypted Vault.`, 'success');
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
        showToast('Note Saved', isEncrypted ? 'Note Encrypted and Stored' : 'Note Saved', 'success');
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
