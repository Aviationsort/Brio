/**
 * RSSReader Component: Clean, modern RSS news reader
 * Stores data in memory with localStorage for saved/read-later articles
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  fetchAllNews,
  fetchAviationNews,
  fetchWorldNews,
  fetchSingleFeed,
  searchArticles,
  NewsItem,
  NewsSource,
} from '../../utils/rssService';
import { encryptionService } from '../../utils/crypto';
import { EncryptedPayload } from '../../types';
import {
  Rss,
  ExternalLink,
  Bookmark,
  Plus,
  Check,
  RefreshCw,
  Search,
  ShieldCheck,
  Globe,
  Plane,
  Layers,
  AlertCircle,
  Activity,
  Clock,
  Sun,
  Moon,
  Copy,
  Share2,
  Eye,
  EyeOff,
  X,
  Loader2,
  BookMarked,
  Filter,
  ChevronDown,
  Newspaper,
  TrendingUp,
  Zap,
  Download,
  PenLine,
  Star,
  Target,
  Trash2,
  Printer,
  Keyboard,
  WifiOff,
  RefreshCcw,
  BookmarkPlus,
  Highlighter,
  FileDown,
  Volume2,
  VolumeX,
  FileText,
  Flame,
  Upload,
  BarChart3,
} from 'lucide-react';

const READING_TIME_WPM = 200;

type Tab = 'all' | 'aviation' | 'world' | 'saved' | 'readlater';
type ViewMode = 'list' | 'grid' | 'compact';

export const RSSReader: React.FC = () => {
  const { showToast, t } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, sourceName: '' });
  const [recentlyLoaded, setRecentlyLoaded] = useState<string[]>([]);
  const latestSourceRef = useRef<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customFeedUrl, setCustomFeedUrl] = useState('');
  const [addingFeed, setAddingFeed] = useState(false);

  const [savedArticles, setSavedArticles] = useState<NewsItem[]>([]);
  const [savedEncryptedPayloads, setSavedEncryptedPayloads] = useState<Record<string, EncryptedPayload<NewsItem>>>({});

  const [readLater, setReadLater] = useState<NewsItem[]>([]);
  const [readArticleIds, setReadArticleIds] = useState<Set<string>>(new Set());
  const [readerMode, setReaderMode] = useState<'dark' | 'light'>('dark');
  const [refreshInterval, setRefreshInterval] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(20);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [swipeState, setSwipeState] = useState<{ id: string; startX: number; currentX: number } | null>(null);
  const [sortMode, setSortMode] = useState<'date' | 'source'>('date');
  const [readerArticle, setReaderArticle] = useState<NewsItem | null>(null);
  const [articleNotes, setArticleNotes] = useState<Record<string, string>>({});
  const [exportFormat, setExportFormat] = useState<'json' | 'text'>('json');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [highlightMode, setHighlightMode] = useState(false);
  const [highlights, setHighlights] = useState<Record<string, string[]>>({});
  const [dailyDigest, setDailyDigest] = useState<NewsItem[]>([]);
  const [showDigest, setShowDigest] = useState(false);
  const [bookmarkFolders, setBookmarkFolders] = useState<Record<string, NewsItem[]>>({});
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [activeBookmarkFolder, setActiveBookmarkFolder] = useState<string | null>(null);
  const [feedHealth, setFeedHealth] = useState<Record<string, { success: number; fail: number; lastChecked: string }>>({});
  const [duplicateGroups, setDuplicateGroups] = useState<Record<string, string[]>>({});
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [opmlImportUrl, setOpmlImportUrl] = useState('');
  const [showOpmlModal, setShowOpmlModal] = useState(false);
  const [readingGoal, setReadingGoal] = useState(10);
  const [articlesReadToday, setArticlesReadToday] = useState(0);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastReadDate, setLastReadDate] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [ratingMode, setRatingMode] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [shareTarget, setShareTarget] = useState<NewsItem | null>(null);
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<NewsItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

   const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const shareMenuRef = useRef<HTMLDivElement | null>(null);

  const categories = ['all', 'Centrist', 'Left-wing', 'Right-wing', 'State-Controlled'];

  const calculateReadingTime = (text: string): number => {
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / READING_TIME_WPM));
  };

  const loadNews = useCallback(async (tab: Tab) => {
    if (tab === 'saved' || tab === 'readlater') return;

    setLoading(true);
    setArticles([]);
    setSources([]);
    setVisibleCount(20);
    setRecentlyLoaded([]);
    setProgress({
      current: 0,
      total: tab === 'aviation' ? 14 : tab === 'world' ? 120 : 134,
      sourceName: '',
    });

    try {
      if (tab === 'aviation') {
        await fetchAviationNews(
          ((items, srcList, feedSourceName) => {
            setArticles((prev) => [...prev, ...items.filter((it) => !prev.some((p) => p.id === it.id))]);
            setSources(srcList);
            if (feedSourceName) {
              setProgress((prev) => ({ ...prev, sourceName: feedSourceName }));
              setRecentlyLoaded((prev) => [...new Set([...prev, feedSourceName])]);
              latestSourceRef.current = feedSourceName;
            }
          }) as any,
          () => setProgress((prev) => ({ ...prev, current: prev.current + 1 }))
        );
        showToast('Aviation Feeds Synced', 'Live aviation feeds loaded', 'success');
      } else if (tab === 'world') {
        await fetchWorldNews(
          ((items, srcList, feedSourceName) => {
            setArticles((prev) => [...prev, ...items.filter((it) => !prev.some((p) => p.id === it.id))]);
            setSources(srcList);
            if (feedSourceName) {
              setProgress((prev) => ({ ...prev, sourceName: feedSourceName }));
              setRecentlyLoaded((prev) => [...new Set([...prev, feedSourceName])]);
              latestSourceRef.current = feedSourceName;
            }
          }) as any,
          () => setProgress((prev) => ({ ...prev, current: prev.current + 1 }))
        );
        showToast('World News Synced', 'Live world news feeds loaded', 'success');
      } else {
        await fetchAllNews(
          ((items, srcList, feedSourceName) => {
            setArticles((prev) => [...prev, ...items.filter((it) => !prev.some((p) => p.id === it.id))]);
            setSources(srcList);
            if (feedSourceName) {
              setProgress((prev) => ({ ...prev, sourceName: feedSourceName }));
              setRecentlyLoaded((prev) => [...new Set([...prev, feedSourceName])]);
              latestSourceRef.current = feedSourceName;
            }
          }) as any,
          () => setProgress((prev) => ({ ...prev, current: prev.current + 1 }))
        );
        showToast('All Feeds Synced', 'All live feeds loaded', 'success');
      }
    } catch {
      console.error('Error loading news feeds:');
      showToast('RSS Stream Notice', 'Stream sync interrupted. Please try again later.', 'info');
    } finally {
      setLoading(false);
      setProgress((prev) => ({ ...prev, sourceName: '' }));
      setTimeout(() => setRecentlyLoaded([]), 2000);
    }
  }, [showToast]);

  useEffect(() => {
    loadNews(activeTab);
  }, [activeTab, loadNews]);

  useEffect(() => {
    const loadEncryptedVault = async () => {
      try {
        const raw = localStorage.getItem('brio_encrypted_rss_vault');
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, EncryptedPayload<NewsItem>>;
          setSavedEncryptedPayloads(parsed);

          const decryptedList: NewsItem[] = [];
          for (const key of Object.keys(parsed)) {
            try {
              const item = await encryptionService.decrypt<NewsItem>(parsed[key]);
              decryptedList.push(item);
            } catch (err) {
              console.warn(`Failed to decrypt saved RSS article ${key}:`, err);
            }
          }
          setSavedArticles(decryptedList);
        }
      } catch (err) {
        console.error('Error loading encrypted RSS vault:', err);
      }
    };
    loadEncryptedVault();

    const loadReadLater = () => {
      try {
        const raw = localStorage.getItem('brio_rss_read_later');
        if (raw) setReadLater(JSON.parse(raw));
      } catch { /* ignore */ }
    };
    loadReadLater();
  }, []);

  useEffect(() => {
    localStorage.setItem('brio_rss_read_later', JSON.stringify(readLater));
  }, [readLater]);

  useEffect(() => {
    localStorage.setItem('brio_rss_read_ids', JSON.stringify([...readArticleIds]));
  }, [readArticleIds]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('brio_rss_notes');
      if (raw) setArticleNotes(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem('brio_rss_notes', JSON.stringify(articleNotes));
  }, [articleNotes]);

  useEffect(() => {
    const loadExtras = async () => {
      try {
        const raw = localStorage.getItem('brio_rss_extras');
        if (raw) {
          const data = JSON.parse(raw);
          setHighlights(data.highlights || {});
          setBookmarkFolders(data.bookmarkFolders || {});
          setStarredIds(new Set(data.starredIds || []));
          setRatings(data.ratings || {});
          setReadingGoal(data.readingGoal || 10);
          setStreak(data.streak || 0);
          setLastReadDate(data.lastReadDate || '');
          setFontSize(data.fontSize || 'md');
          setOfflineQueue(data.offlineQueue || []);
        }
      } catch { /* ignore */ }
    };
    loadExtras();
  }, []);

  useEffect(() => {
    const payload = { highlights, bookmarkFolders, starredIds: [...starredIds], ratings, readingGoal, streak, lastReadDate, fontSize, offlineQueue };
    localStorage.setItem('brio_rss_extras', JSON.stringify(payload));
  }, [highlights, bookmarkFolders, starredIds, ratings, readingGoal, streak, lastReadDate, fontSize, offlineQueue]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (lastReadDate && lastReadDate !== new Date().toDateString()) {
      setStreak((s) => s + 1);
      setLastReadDate(new Date().toDateString());
    } else if (!lastReadDate) {
      setLastReadDate(new Date().toDateString());
    }
  }, [articlesReadToday, lastReadDate]);

  useEffect(() => {
    if (refreshInterval > 0) {
      refreshTimerRef.current = window.setInterval(() => {
        if (activeTab !== 'saved') loadNews(activeTab);
      }, refreshInterval * 60 * 1000);
    }
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [refreshInterval, activeTab, loadNews]);

  useEffect(() => {
    if (latestSourceRef.current && recentlyLoaded.length > 0) {
      const timeout = window.setTimeout(() => {
        setRecentlyLoaded((prev) => prev.filter((s) => s !== latestSourceRef.current));
      }, 2500);
      return () => window.clearTimeout(timeout);
    }
  }, [recentlyLoaded]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + 20);
      }
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddCustomFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFeedUrl.trim()) return;

    setAddingFeed(true);
    const feedUrl = customFeedUrl.trim();

    try {
      const res = await fetchSingleFeed(feedUrl);
      if (res.items.length > 0) {
        setArticles((prev) => [...res.items, ...prev]);
        setSources((prev) => [res.source, ...prev]);
        showToast('Custom Feed Connected', `Fetched ${res.items.length} articles from ${res.source.name}`, 'success');
        setCustomFeedUrl('');
      } else {
        throw new Error('No valid RSS items found in feed.');
      }
    } catch {
      showToast('Feed Sync Error', 'Unable to parse feed. Please check the URL and try again.', 'error');
    } finally {
      setAddingFeed(false);
    }
  };

  const toggleSaveArticle = async (item: NewsItem) => {
    const isSaved = savedArticles.some((a) => a.id === item.id);

    if (isSaved) {
      const updatedSaved = savedArticles.filter((a) => a.id !== item.id);
      const updatedPayloads = { ...savedEncryptedPayloads };
      delete updatedPayloads[item.id];

      setSavedArticles(updatedSaved);
      setSavedEncryptedPayloads(updatedPayloads);
      localStorage.setItem('brio_encrypted_rss_vault', JSON.stringify(updatedPayloads));
      showToast('Article Removed', 'Article removed from Encrypted Vault', 'info');
    } else {
      try {
        const encrypted = await encryptionService.encrypt<NewsItem>(item);
        const updatedPayloads = { ...savedEncryptedPayloads, [item.id]: encrypted };

        setSavedArticles((prev) => [item, ...prev]);
        setSavedEncryptedPayloads(updatedPayloads);
        localStorage.setItem('brio_encrypted_rss_vault', JSON.stringify(updatedPayloads));
        showToast('AES-GCM Encrypted', 'Article safely saved to local Encrypted Vault', 'success');
      } catch (err) {
        showToast('Encryption Error', 'Failed to encrypt article payload', 'error');
      }
    }
  };

  const toggleReadLater = (item: NewsItem) => {
    setReadLater((prev) => {
      const exists = prev.some((a) => a.id === item.id);
      if (exists) {
        showToast('Removed', 'Removed from Read Later queue', 'info');
        return prev.filter((a) => a.id !== item.id);
      }
      showToast('Saved', 'Added to Read Later queue', 'success');
      return [item, ...prev];
    });
  };

  const toggleStar = (id: string) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const rateArticle = (id: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [id]: rating }));
  };

  const toggleHighlight = (id: string, text: string) => {
    setHighlights((prev) => {
      const existing = prev[id] || [];
      const next = existing.includes(text) ? existing.filter((t) => t !== text) : [...existing, text];
      return { ...prev, [id]: next };
    });
  };

  const addBookmarkFolder = () => {
    if (!newFolderName.trim()) return;
    setBookmarkFolders((prev) => ({ ...prev, [newFolderName.trim()]: [] }));
    setNewFolderName('');
    setShowFolderModal(false);
  };

  const moveToFolder = (item: NewsItem, folder: string) => {
    setBookmarkFolders((prev) => ({ ...prev, [folder]: [...(prev[folder] || []), item] }));
    showToast('Moved', `Added to folder: ${folder}`, 'success');
  };

  const speakArticle = (item: NewsItem) => {
    if (!('speechSynthesis' in window)) {
      showToast('Unsupported', 'Text-to-speech is not supported in this browser', 'error');
      return;
    }
    if (textToSpeech && speechUtterance) {
      window.speechSynthesis.cancel();
      setTextToSpeech(false);
      setSpeechUtterance(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(`${item.title}. ${item.summary}`);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => {
      setTextToSpeech(false);
      setSpeechUtterance(null);
    };
    window.speechSynthesis.speak(utterance);
    setSpeechUtterance(utterance);
    setTextToSpeech(true);
  };

  const exportOpml = () => {
    const items = currentList;
    const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Brio RSS Feeds</title>
  </head>
  <body>
    ${sources.map((s) => `<outline text="${s.name}" type="rss" xmlUrl="${s.url}" />`).join('\n    ')}
  </body>
</opml>`;
    const blob = new Blob([opml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brio-rss-${new Date().toISOString().slice(0, 10)}.opml`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported', 'OPML file exported successfully', 'success');
  };

  const importOpml = async () => {
    if (!opmlImportUrl.trim()) return;
    try {
      const res = await fetchSingleFeed(opmlImportUrl.trim());
      if (res.items.length > 0) {
        setArticles((prev) => [...res.items, ...prev]);
        setSources((prev) => [...prev, res.source]);
        showToast('Imported', `Imported ${res.items.length} articles from OPML feed`, 'success');
        setOpmlImportUrl('');
        setShowOpmlModal(false);
      } else {
        throw new Error('No valid RSS items found.');
      }
    } catch {
      showToast('Import Failed', 'Unable to import OPML feed', 'error');
    }
  };

  const detectDuplicates = () => {
    const groups: Record<string, string[]> = {};
    currentList.forEach((item) => {
      const key = item.title.toLowerCase().trim().slice(0, 40);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item.id);
    });
    const dupes = Object.fromEntries(Object.entries(groups).filter(([, ids]) => ids.length > 1));
    setDuplicateGroups(dupes);
    setShowDuplicates(Object.keys(dupes).length > 0);
    showToast('Scan Complete', `Found ${Object.keys(dupes).length} duplicate groups`, 'info');
  };

  const toggleBulkSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const bulkMarkRead = () => {
    setReadArticleIds((prev) => {
      const next = new Set(prev);
      selectedIds.forEach((id) => next.add(id));
      return next;
    });
    showToast('Bulk Update', `Marked ${selectedIds.size} articles as read`, 'success');
    setSelectedIds(new Set());
    setShowBulkActions(false);
  };

  const bulkStar = () => {
    selectedIds.forEach((id) => setStarredIds((prev) => new Set(prev).add(id)));
    showToast('Bulk Update', `Starred ${selectedIds.size} articles`, 'success');
    setSelectedIds(new Set());
    setShowBulkActions(false);
  };

  const bulkArchive = () => {
    setArticles((prev) => prev.filter((a) => !selectedIds.has(a.id)));
    showToast('Bulk Archive', `Archived ${selectedIds.size} articles`, 'success');
    setSelectedIds(new Set());
    setShowBulkActions(false);
  };

  const incrementReadCount = () => {
    setArticlesReadToday((prev) => {
      const next = prev + 1;
      if (next >= readingGoal) {
        showToast('Goal Reached', `You read ${readingGoal} articles today!`, 'success');
      }
      return next;
    });
  };

  const shareArticle = async (item: NewsItem) => {
    setShareTarget(item);
    setShowShareSheet(true);
  };

  const openImagePreview = (url: string) => {
    setShowImagePreview(url);
  };

  const togglePrintMode = () => {
    setPrintMode((prev) => !prev);
    showToast('Print Mode', printMode ? 'Exited print mode' : 'Entered print mode - use browser print', 'info');
  };

  const adjustFontSize = (size: 'sm' | 'md' | 'lg') => {
    setFontSize(size);
    showToast('Font Size', `Font size set to ${size}`, 'info');
  };

  const toggleKeyboardShortcuts = () => {
    setShowKeyboardShortcuts((prev) => !prev);
  };

  const addToOfflineQueue = (item: NewsItem) => {
    setOfflineQueue((prev) => {
      if (prev.some((q) => q.id === item.id)) return prev;
      return [...prev, item];
    });
    showToast('Offline Queue', 'Article saved for offline reading', 'success');
  };

  const clearOfflineQueue = () => {
    setOfflineQueue([]);
    showToast('Cleared', 'Offline queue cleared', 'info');
  };

  const generateDailyDigest = () => {
    const today = new Date().toDateString();
    const todays = articles.filter((a) => new Date(a.date).toDateString() === today || a._ts && new Date(a._ts).toDateString() === today);
    const top = todays.sort((a, b) => (b._ts || 0) - (a._ts || 0)).slice(0, 10);
    setDailyDigest(top);
    setShowDigest(true);
  };

  const createBookmarkFolder = () => {
    setShowFolderModal(true);
  };

  const markAsRead = (id: string) => {
    setReadArticleIds((prev) => new Set(prev).add(id));
  };

  const markAllAsRead = () => {
    const ids = filteredArticles.map((a) => a.id);
    setReadArticleIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
    showToast('Updated', 'All articles marked as read', 'success');
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => showToast('Copied', 'Link copied to clipboard', 'success'));
  };

  const openReader = (item: NewsItem) => {
    setReaderArticle(item);
    markAsRead(item.id);
  };

  const saveNote = (id: string, text: string) => {
    setArticleNotes((prev) => ({ ...prev, [id]: text }));
  };

  const exportArticles = () => {
    const list = activeTab === 'saved' ? savedArticles : activeTab === 'readlater' ? readLater : articles;
    if (!list.length) {
      showToast('Nothing to export', 'No articles available to export', 'info');
      return;
    }
    let content = '';
    let mime = 'text/plain';
    let ext = 'txt';
    if (exportFormat === 'json') {
      content = JSON.stringify(list.map(({ id, title, summary, date, url, source, category }) => ({ id, title, summary, date, url, source, category })), null, 2);
      mime = 'application/json';
      ext = 'json';
    } else {
      content = list.map((a) => `[${a.date}] ${a.source} - ${a.title}\n${a.summary}\n${a.url}\n`).join('\n');
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rss-export-${new Date().toISOString().slice(0, 10)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported', `Articles exported as ${ext.toUpperCase()}`, 'success');
    setShowExportMenu(false);
  };

  const currentList = activeTab === 'saved' ? savedArticles : activeTab === 'readlater' ? readLater : articles;

  const filteredArticles = searchArticles(
    currentList.filter((art) => {
      if (selectedCategory === 'all') return true;
      return art.category === selectedCategory;
    }),
    searchQuery
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: currentList.length };
    currentList.forEach((art) => {
      counts[art.category] = (counts[art.category] || 0) + 1;
    });
    return counts;
  }, [currentList]);

  const visibleArticles = useMemo(() => {
    const sorted = [...filteredArticles].map((article, index) => ({ ...article, _originalIndex: index }));
    sorted.sort((a, b) => {
      if (sortMode === 'date') {
        const dateA = new Date(a.date).getTime() || a._ts || 0;
        const dateB = new Date(b.date).getTime() || b._ts || 0;
        const cmp = dateB - dateA;
        return cmp !== 0 ? cmp : a._originalIndex - b._originalIndex;
      } else {
        const sourceA = a.source.toLowerCase();
        const sourceB = b.source.toLowerCase();
        const cmp = sourceA < sourceB ? -1 : sourceA > sourceB ? 1 : 0;
        return cmp !== 0 ? cmp : a._originalIndex - b._originalIndex;
      }
    });
    return sorted.slice(0, visibleCount);
  }, [filteredArticles, sortMode, visibleCount]);
  const hasMore = visibleCount < filteredArticles.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!readerArticle) return;
      if (e.key === 'Escape') setReaderArticle(null);
      if (e.key === 'ArrowRight' || e.key === 'j') {
        const idx = visibleArticles.findIndex((a) => a.id === readerArticle.id);
        if (idx >= 0 && idx < visibleArticles.length - 1) setReaderArticle(visibleArticles[idx + 1]);
      }
      if (e.key === 'ArrowLeft' || e.key === 'k') {
        const idx = visibleArticles.findIndex((a) => a.id === readerArticle.id);
        if (idx > 0) setReaderArticle(visibleArticles[idx - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readerArticle, visibleArticles]);

  const successfulSources = sources.filter((s) => s.status === 'success');
  const failedSources = sources.filter((s) => s.status === 'failed');

  const getArticleCountForCategory = (cat: string) => categoryCounts[cat] || 0;

  const getSourceBadgeColor = (category: string) => {
    switch (category) {
      case 'Centrist': return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      case 'Left-wing': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Right-wing': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'State-Controlled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Centrist': return '📰';
      case 'Left-wing': return '🔵';
      case 'Right-wing': return '🔴';
      case 'State-Controlled': return '🏛️';
      default: return '📰';
    }
  };

  const renderArticleCard = (art: NewsItem) => {
    const isSaved = savedArticles.some((a) => a.id === art.id);
    const isReadLater = readLater.some((a) => a.id === art.id);
    const isRead = readArticleIds.has(art.id);
    const isStarred = starredIds.has(art.id);
    const readingTime = calculateReadingTime(art.summary + ' ' + art.title);
    const userRating = ratings[art.id] || 0;

    let domain = '';
    try {
      domain = new URL(art.url).hostname.replace('www.', '');
    } catch {
      domain = 'news.google.com';
    }

    const providerLogo = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    const fallbackImage = art.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop';

    const isNewlyLoaded = recentlyLoaded.includes(art.source);
    const cardBase = `group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:bg-white/5 ${
      isRead ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5'
    } ${isNewlyLoaded ? 'animate-slideIn' : ''}`;
    const fontSizeClass = fontSize === 'lg' ? 'text-base' : fontSize === 'sm' ? 'text-[11px]' : 'text-sm';

    if (viewMode === 'compact') {
      return (
        <div
          key={art.id}
          className={cardBase}
          onClick={() => {
            markAsRead(art.id);
            incrementReadCount();
            window.open(art.url, '_blank', 'noopener,noreferrer');
          }}
        >
          {showBulkActions && (
            <input
              type="checkbox"
              checked={selectedIds.has(art.id)}
              onChange={(e) => { e.stopPropagation(); toggleBulkSelect(art.id); }}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-red-500 focus:ring-red-500 cursor-pointer"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${getSourceBadgeColor(art.category)}`}>
                {art.category}
              </span>
              <span className="text-[10px] text-slate-500 font-mono truncate">{art.source}</span>
              <span className="text-[10px] text-slate-600 font-mono">{readingTime} min</span>
              {isStarred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
              {userRating > 0 && <span className="text-[10px] text-amber-300 font-mono">★{userRating}</span>}
            </div>
            <h4 className={`${fontSizeClass} font-semibold truncate ${isRead ? 'text-slate-500' : 'text-white'}`}>
              {art.title}
            </h4>
            {(highlights[art.id] || []).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {(highlights[art.id] || []).slice(0, 3).map((h, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[9px] font-mono">
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); openReader(art); }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isRead ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-transparent text-slate-500 hover:text-white'
              }`}
              title="Read in app"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleReadLater(art); }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isReadLater ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-transparent text-slate-500 hover:text-white'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleStar(art.id); }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isStarred ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-transparent text-slate-500 hover:text-white'
              }`}
              title="Star"
            >
              <Star className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); speakArticle(art); }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${textToSpeech ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-transparent text-slate-500 hover:text-white'}`}
              title="Text-to-speech"
            >
              {textToSpeech ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); addToOfflineQueue(art); }}
              className="p-1.5 rounded-lg border border-transparent text-slate-500 hover:text-white cursor-pointer"
              title="Save offline"
            >
              <WifiOff className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleSaveArticle(art); }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isSaved ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-transparent text-slate-500 hover:text-white'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div
          key={art.id}
          className={`group rounded-2xl border overflow-hidden transition-all cursor-pointer hover:border-white/20 bg-white/[0.02] border-white/5 ${isNewlyLoaded ? 'animate-slideIn' : ''}`}
          onClick={() => {
            markAsRead(art.id);
            incrementReadCount();
            window.open(art.url, '_blank', 'noopener,noreferrer');
          }}
        >
          <div className="relative h-36 overflow-hidden bg-slate-950">
            <img
              src={fallbackImage}
              alt={art.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur border border-white/10 text-[9px] font-mono font-bold">
              {art.category}
            </span>
            {isStarred && (
              <span className="absolute top-2 right-2">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </span>
            )}
          </div>
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <Clock className="w-3 h-3" />
              <span>{art.date}</span>
              <span className="text-slate-600">·</span>
              <span>{readingTime} min</span>
              {userRating > 0 && <span className="text-amber-300">★{userRating}</span>}
            </div>
            <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-red-300 transition-colors">
              {art.title}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-2">{art.summary}</p>
            {(highlights[art.id] || []).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(highlights[art.id] || []).slice(0, 3).map((h, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[9px] font-mono">
                    {h}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5">
                <img src={providerLogo} alt={domain} className="w-3.5 h-3.5 rounded-full" />
                <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{domain}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); openReader(art); }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isRead ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Read in app"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleStar(art.id); }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isStarred ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Star"
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSaveArticle(art); }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isSaved ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={art.id}
        className={`group rounded-2xl border overflow-hidden transition-all cursor-pointer hover:border-white/20 bg-white/[0.02] border-white/5 ${isNewlyLoaded ? 'animate-slideIn' : ''}`}
        onClick={() => {
          markAsRead(art.id);
          incrementReadCount();
          window.open(art.url, '_blank', 'noopener,noreferrer');
        }}
      >
        <div className="flex gap-4 p-4">
          {showBulkActions && (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.has(art.id)}
                onChange={(e) => { e.stopPropagation(); toggleBulkSelect(art.id); }}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-red-500 focus:ring-red-500 cursor-pointer"
              />
            </div>
          )}
          <div className="relative w-32 h-24 rounded-xl overflow-hidden bg-slate-950 shrink-0">
            <img
              src={fallbackImage}
              alt={art.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
            {isStarred && (
              <div className="absolute top-2 right-2">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${getSourceBadgeColor(art.category)}`}>
                {getCategoryIcon(art.category)} {art.category}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{art.source}</span>
              {isRead && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-mono font-bold">
                  Read
                </span>
              )}
              {isStarred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
              {userRating > 0 && <span className="text-[10px] text-amber-300 font-mono">★{userRating}</span>}
            </div>
            <h4 className={`${fontSizeClass} font-semibold text-white leading-snug line-clamp-2 group-hover:text-red-300 transition-colors`}>
              {art.title}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-2">{art.summary}</p>
            {(highlights[art.id] || []).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(highlights[art.id] || []).slice(0, 3).map((h, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[9px] font-mono">
                    {h}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {art.date}
                </span>
                <span>{readingTime} min read</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); openReader(art); }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isRead ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Read in app"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleStar(art.id); }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isStarred ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Star"
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); speakArticle(art); }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${textToSpeech ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-white/10 text-slate-400 hover:text-white'}`}
                  title="Text-to-speech"
                >
                  {textToSpeech ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); addToOfflineQueue(art); }}
                  className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                  title="Save offline"
                >
                  <WifiOff className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleReadLater(art); }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isReadLater ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {isReadLater ? <BookMarked className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSaveArticle(art); }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isSaved ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                </button>
                <div className="relative" ref={shareMenuRef}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowShareMenu(showShareMenu === art.id ? null : art.id); }}
                    className="p-1.5 border border-white/10 text-slate-400 rounded-lg hover:text-white transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  {showShareMenu === art.id && (
                    <div className="absolute right-0 top-8 z-20 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-1.5 space-y-1 min-w-[160px]">
                      <button
                        onClick={(e) => { e.stopPropagation(); copyLink(art.url); setShowShareMenu(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" /> {t.copyLink}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); shareArticle(art); setShowShareMenu(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); addToOfflineQueue(art); setShowShareMenu(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <WifiOff className="w-3.5 h-3.5" /> Save Offline
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); window.open(art.url, '_blank', 'noopener,noreferrer'); setShowShareMenu(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> {t.openInNewTab}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const readerClasses = readerMode === 'light' ? 'bg-white text-slate-900' : 'bg-slate-950 text-slate-100';

  return (
    <div className={`space-y-4 rounded-3xl transition-colors duration-300 ${readerClasses}`}>
      {/* Header */}
      <div className="liquid-glass p-5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-500/20 border border-red-500/30 rounded-2xl text-red-400">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">RSS News Reader</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeTab === 'saved' ? 'Your encrypted saved articles' : activeTab === 'readlater' ? 'Your read later queue' : 'Multi-source real-time news aggregator'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="liquid-glass-btn px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value={0}>Auto-refresh: Off</option>
              <option value="5">Every 5 min</option>
              <option value="10">Every 10 min</option>
              <option value="30">Every 30 min</option>
            </select>

            <button
              onClick={() => setReaderMode((m) => (m === 'dark' ? 'light' : 'dark'))}
              className="liquid-glass-btn p-2.5 text-slate-300"
              title="Toggle reading mode"
            >
              {readerMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => { if (activeTab !== 'saved' && activeTab !== 'readlater') loadNews(activeTab); }}
              disabled={loading}
              className="liquid-glass-btn p-2.5 text-slate-300 disabled:opacity-50"
              title="Refresh feeds"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-400' : ''}`} />
            </button>

            <button
              onClick={togglePrintMode}
              className="liquid-glass-btn p-2.5 text-slate-300"
              title="Print mode"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              onClick={toggleKeyboardShortcuts}
              className="liquid-glass-btn p-2.5 text-slate-300"
              title="Keyboard shortcuts"
            >
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar - Organized with visual groups */}
      <div className="liquid-glass p-4">
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
          {/* Content Stats Group */}
          <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Content</span>
            <div className="h-4 w-px bg-slate-700"></div>
            <span className="text-slate-300">Articles: <strong className="text-white">{filteredArticles.length}</strong></span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Read: <strong className="text-emerald-400">{readArticleIds.size}</strong></span>
          </div>

          {/* Saved & Favorites Group */}
          <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Saved</span>
            <div className="h-4 w-px bg-slate-700"></div>
            <span className="text-slate-300">Vault: <strong className="text-red-400">{savedArticles.length}</strong></span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Starred: <strong className="text-amber-400">{starredIds.size}</strong></span>
          </div>

          {/* Progress Group */}
          <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Progress</span>
            <div className="h-4 w-px bg-slate-700"></div>
            <span className="text-slate-300">Streak: <strong className="text-orange-400">{streak}🔥</strong></span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Goal: <strong className="text-white">{articlesReadToday}/{readingGoal}</strong></span>
          </div>

          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <span className={`text-xs font-bold ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
              {isOnline ? '● Online' : '○ Offline'}
            </span>
            {offlineQueue.length > 0 && (
              <span className="text-amber-400 font-bold">({offlineQueue.length} queued)</span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={generateDailyDigest} className="liquid-glass-btn px-3 py-2 text-[10px] font-bold flex items-center gap-1.5 hover:bg-orange-500/20 hover:border-orange-500/40 transition-colors" title="Today's top stories">
              <Flame className="w-3.5 h-3.5" /> Digest
            </button>
            <button onClick={detectDuplicates} className="liquid-glass-btn px-3 py-2 text-[10px] font-bold flex items-center gap-1.5 hover:bg-purple-500/20 hover:border-purple-500/40 transition-colors" title="Find duplicates">
              <Copy className="w-3.5 h-3.5" /> Dupes
            </button>
            <button onClick={exportOpml} className="liquid-glass-btn px-3 py-2 text-[10px] font-bold flex items-center gap-1.5 hover:bg-blue-500/20 hover:border-blue-500/40 transition-colors" title="Export feeds">
              <Download className="w-3.5 h-3.5" /> OPML
            </button>
            <button onClick={() => setShowOpmlModal(true)} className="liquid-glass-btn px-3 py-2 text-[10px] font-bold flex items-center gap-1.5 hover:bg-green-500/20 hover:border-green-500/40 transition-colors" title="Import feeds">
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <button onClick={() => setShowStats(!showStats)} className={`liquid-glass-btn px-3 py-2 text-[10px] font-bold flex items-center gap-1.5 transition-colors ${showStats ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'hover:bg-indigo-500/20 hover:border-indigo-500/40'}`} title="View statistics">
              <BarChart3 className="w-3.5 h-3.5" /> Stats
            </button>
          </div>
        </div>
      </div>

      {/* Font Size & Display Controls */}
      <div className="liquid-glass p-3 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Font Size</span>
          <div className="flex items-center gap-1">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <button
                key={size}
                onClick={() => adjustFontSize(size)}
                className={`px-3 py-1.5 text-[10px] font-bold cursor-pointer rounded-lg transition-all ${
                  fontSize === size 
                    ? 'bg-red-500/20 border border-red-500/40 text-red-400 shadow-sm' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {size === 'sm' ? 'A⁺' : size === 'md' ? 'A' : 'A⁻'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Tools</span>
          <button 
            onClick={() => setHighlightMode(!highlightMode)} 
            className={`px-3 py-1.5 text-[10px] font-bold cursor-pointer rounded-lg transition-all flex items-center gap-1.5 ${
              highlightMode 
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-sm' 
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" /> Highlight
          </button>
          <button 
            onClick={() => setShowBulkActions(!showBulkActions)} 
            className={`px-3 py-1.5 text-[10px] font-bold cursor-pointer rounded-lg transition-all flex items-center gap-1.5 ${
              showBulkActions 
                ? 'bg-red-500/20 border border-red-500/40 text-red-400 shadow-sm' 
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <BookmarkPlus className="w-3.5 h-3.5" /> Bulk Edit
          </button>
        </div>
      </div>

      {/* Reading Stats Panel */}
      {showStats && (
        <div className="liquid-glass p-4 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-red-400" /> Reading Statistics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-2xl font-black text-white">{readArticleIds.size}</div>
              <div className="text-[10px] text-slate-400 font-mono">Articles Read</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-2xl font-black text-red-400">{starredIds.size}</div>
              <div className="text-[10px] text-slate-400 font-mono">Starred</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-2xl font-black text-amber-400">{streak}</div>
              <div className="text-[10px] text-slate-400 font-mono">Day Streak</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-2xl font-black text-emerald-400">{Object.keys(ratings).length}</div>
              <div className="text-[10px] text-slate-400 font-mono">Rated</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowGoalModal(true)} className="liquid-glass-btn px-3 py-2 text-xs font-bold flex items-center gap-1">
              <Target className="w-3.5 h-3.5" /> Set Goal
            </button>
            <button onClick={() => showToast('Coming Soon', 'Weekly reports coming soon', 'info')} className="liquid-glass-btn px-3 py-2 text-xs font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Weekly Report
            </button>
          </div>
        </div>
      )}

      {/* Daily Digest Modal */}
      {showDigest && (
        <div className="liquid-glass p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400" /> Daily Digest
            </h4>
            <button onClick={() => setShowDigest(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          {dailyDigest.length === 0 ? (
            <p className="text-xs text-slate-400">No articles published today yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dailyDigest.map((art) => (
                <div key={art.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">{art.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{art.summary}</p>
                  </div>
                  <button onClick={() => { openReader(art); setShowDigest(false); }} className="liquid-glass-btn p-1.5 shrink-0">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="liquid-glass p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Keyboard Shortcuts</h4>
            <button onClick={toggleKeyboardShortcuts} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10"><span className="text-white">j / →</span> <span className="text-slate-400">Next article</span></div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10"><span className="text-white">k / ←</span> <span className="text-slate-400">Previous article</span></div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10"><span className="text-white">Esc</span> <span className="text-slate-400">Close modal</span></div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10"><span className="text-white">r</span> <span className="text-slate-400">Refresh feeds</span></div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10"><span className="text-white">f</span> <span className="text-slate-400">Focus search</span></div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10"><span className="text-white">s</span> <span className="text-slate-400">Toggle sort</span></div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10"><span className="text-white">v</span> <span className="text-slate-400">Cycle view</span></div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10"><span className="text-white">p</span> <span className="text-slate-400">Print mode</span></div>
          </div>
        </div>
      )}

      {/* OPML Import Modal */}
      {showOpmlModal && (
        <div className="liquid-glass p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Import OPML / Feed URL</h4>
            <button onClick={() => setShowOpmlModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={opmlImportUrl}
              onChange={(e) => setOpmlImportUrl(e.target.value)}
              placeholder="Paste RSS/Atom feed URL..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 placeholder-slate-500"
            />
            <button onClick={importOpml} className="liquid-glass-btn px-4 py-2 text-xs font-bold flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
          </div>
        </div>
      )}

      {/* Reading Goal Modal */}
      {showGoalModal && (
        <div className="liquid-glass p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Set Daily Reading Goal</h4>
            <button onClick={() => setShowGoalModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={readingGoal}
              onChange={(e) => setReadingGoal(Number(e.target.value))}
              className="w-20 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            />
            <span className="text-xs text-slate-400">articles per day</span>
            <button onClick={() => { setReadingGoal(readingGoal); setShowGoalModal(false); showToast('Updated', `Daily goal set to ${readingGoal}`, 'success'); }} className="liquid-glass-btn px-3 py-2 text-xs font-bold">
              Save
            </button>
          </div>
        </div>
      )}

      {/* Folder Modal */}
      {showFolderModal && (
        <div className="liquid-glass p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Create Bookmark Folder</h4>
            <button onClick={() => setShowFolderModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 placeholder-slate-500"
            />
            <button onClick={addBookmarkFolder} className="liquid-glass-btn px-4 py-2 text-xs font-bold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Create
            </button>
          </div>
        </div>
      )}

      {/* Share Sheet */}
      {showShareSheet && shareTarget && (
        <div className="liquid-glass p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Share Article</h4>
            <button onClick={() => setShowShareSheet(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => { copyLink(shareTarget.url); setShowShareSheet(false); }} className="liquid-glass-btn px-3 py-2 text-xs font-bold flex items-center gap-1">
              <Copy className="w-3.5 h-3.5" /> Copy Link
            </button>
            <button onClick={() => { window.open(shareTarget.url, '_blank', 'noopener,noreferrer'); setShowShareSheet(false); }} className="liquid-glass-btn px-3 py-2 text-xs font-bold flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" /> Open Original
            </button>
            <button onClick={() => { shareArticle(shareTarget); setShowShareSheet(false); }} className="liquid-glass-btn px-3 py-2 text-xs font-bold flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" /> System Share
            </button>
          </div>
        </div>
      )}

      {/* Duplicates Panel */}
      {showDuplicates && (
        <div className="liquid-glass p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Copy className="w-4 h-4 text-red-400" /> Duplicate Articles
            </h4>
            <button onClick={() => setShowDuplicates(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(duplicateGroups).map(([key, ids]) => (
              <div key={key} className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs font-bold text-white mb-1">{key}...</div>
                <div className="flex flex-wrap gap-1">
                  {ids.map((id) => {
                    const art = currentList.find((a) => a.id === id);
                    return (
                      <button key={id} onClick={() => openReader(art || currentList[0])} className="liquid-glass-btn px-2 py-1 text-[10px] font-mono truncate max-w-[180px]">
                        {art?.source}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="liquid-glass p-3 flex items-center gap-2">
          <span className="text-xs font-mono text-slate-300">{selectedIds.size} selected</span>
          <button onClick={bulkMarkRead} className="liquid-glass-btn px-3 py-2 text-xs font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Mark Read
          </button>
          <button onClick={bulkStar} className="liquid-glass-btn px-3 py-2 text-xs font-bold flex items-center gap-1">
            <Star className="w-3.5 h-3.5" /> Star
          </button>
          <button onClick={bulkArchive} className="liquid-glass-btn px-3 py-2 text-xs font-bold flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> Archive
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="liquid-glass-btn px-3 py-2 text-xs font-bold text-slate-300">
            Clear
          </button>
        </div>
      )}

      {/* Navigation Tabs - Organized with visual hierarchy */}
      <div className="liquid-glass p-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Primary Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            {(['all', 'aviation', 'world'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-xs font-bold flex items-center gap-2.5 cursor-pointer whitespace-nowrap rounded-xl transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-red-600 to-red-600 text-white shadow-lg shadow-red-500/25 border border-red-500/40 scale-105'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <span className={`p-1.5 rounded-lg ${activeTab === tab ? 'bg-white/20' : 'bg-white/5'}`}>
                  {tab === 'all' && <Layers className="w-4 h-4" />}
                  {tab === 'aviation' && <Plane className="w-4 h-4" />}
                  {tab === 'world' && <Globe className="w-4 h-4" />}
                </span>
                <span>{tab === 'all' ? 'All Feeds' : tab === 'aviation' ? 'Aviation News' : 'World News'}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-colors ${
                  activeTab === tab 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/10 text-slate-400'
                }`}>
                  {activeTab === tab ? currentList.length : '—'}
                </span>
              </button>
            ))}

            {/* Secondary Tabs - Saved & Read Later */}
            <div className="h-8 w-px bg-slate-700 mx-1"></div>
            
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-5 py-3 text-xs font-bold flex items-center gap-2.5 cursor-pointer whitespace-nowrap rounded-xl transition-all duration-200 ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-500/40 scale-105'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <span className={`p-1.5 rounded-lg ${activeTab === 'saved' ? 'bg-white/20' : 'bg-white/5'}`}>
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span>Encrypted Vault</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'saved' ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {savedArticles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('readlater')}
              className={`px-5 py-3 text-xs font-bold flex items-center gap-2.5 cursor-pointer whitespace-nowrap rounded-xl transition-all duration-200 ${
                activeTab === 'readlater'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-600 text-white shadow-lg shadow-amber-500/25 border border-amber-500/40 scale-105'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <span className={`p-1.5 rounded-lg ${activeTab === 'readlater' ? 'bg-white/20' : 'bg-white/5'}`}>
                <BookMarked className="w-4 h-4" />
              </span>
              <span>Read Later</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'readlater' ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {readLater.length}
              </span>
            </button>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {activeTab !== 'saved' && activeTab !== 'readlater' && (
              <button
                onClick={markAllAsRead}
                className="liquid-glass-btn px-4 py-2.5 text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-colors rounded-xl"
                title="Mark all articles as read"
              >
                <Check className="w-4 h-4" />
                Mark All Read
              </button>
            )}
            
            <div className="h-6 w-px bg-slate-700"></div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`liquid-glass-btn px-3 py-2.5 rounded-xl transition-all ${
                showFilters 
                  ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-sm' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
              title="Toggle filters"
            >
              <Filter className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setSortMode(m => m === 'date' ? 'source' : 'date')}
              className="liquid-glass-btn px-3 py-2.5 text-xs font-bold flex items-center gap-2 hover:bg-white/5 rounded-xl transition-colors"
              title={sortMode === 'date' ? 'Sort by Date' : 'Sort by Source'}
            >
              {sortMode === 'date' ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Date ↓</span>
                </>
              ) : (
                <>
                  <Rss className="w-4 h-4" />
                  <span>Source A→Z</span>
                </>
              )}
            </button>
            
            <div className="h-6 w-px bg-slate-700"></div>
            
            {/* View Mode Selector */}
            <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded-xl p-1">
              {(['list', 'grid', 'compact'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    viewMode === mode 
                      ? 'bg-red-500 text-white shadow-sm' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                  title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} View`}
                >
                  {mode === 'list' && <Newspaper className="w-4 h-4" />}
                  {mode === 'grid' && <TrendingUp className="w-4 h-4" />}
                  {mode === 'compact' && <Zap className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      {showFilters && (
        <div className="liquid-glass p-4 space-y-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search titles, summaries, sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
            <span className="text-xs text-slate-500 font-mono shrink-0">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`liquid-glass-btn px-3 py-1 text-xs font-mono flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-red-500/20 border-red-500/40 text-red-300 font-bold'
                    : 'text-slate-300'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
                <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px]">
                  {getArticleCountForCategory(cat)}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedCategory('all')} className="liquid-glass-btn px-3 py-1.5 text-[10px] font-bold">
              Clear Filters
            </button>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="liquid-glass-btn px-3 py-1.5 text-[10px] font-bold">
              Reset All
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-3 flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <span className="text-xs font-bold text-red-400">LIVE</span>
          {progress.total > 0 && (
            <span className="text-xs font-mono text-slate-500">
              {progress.current}/{progress.total} sources
            </span>
          )}
          {progress.sourceName && (
            <span className="text-xs font-mono text-slate-400">Fetching: {progress.sourceName}</span>
          )}
          {recentlyLoaded.length > 0 && (
            <div className="flex items-center gap-1.5 ml-auto flex-wrap">
              {recentlyLoaded.map((src) => (
                <span key={src} className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono rounded-full font-bold">
                  + {src}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-3">
          {/* Status Banner */}
          {sources.length > 0 && activeTab !== 'saved' && activeTab !== 'readlater' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-slate-300">
                  Active Streams:{' '}
                  <strong className="text-red-400">{successfulSources.length} Live</strong>
                  {failedSources.length > 0 && (
                    <span className="text-red-400 ml-2">({failedSources.length} Offline)</span>
                  )}
                </span>
              </div>
              <div className="text-slate-400">
                Displaying <strong className="text-white">{filteredArticles.length}</strong> articles
              </div>
            </div>
          )}

          {/* Articles */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
            {visibleArticles.map((art) => renderArticleCard(art))}
          </div>

          {/* Load More */}
          {hasMore && !loading && (
            <div ref={loadMoreRef} className="flex items-center justify-center py-6">
              <button
                onClick={() => setVisibleCount((prev) => prev + 20)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all cursor-pointer text-xs font-bold flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4" /> Load More
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredArticles.length === 0 && (
            <div className="p-10 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Articles Found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {activeTab === 'saved'
                  ? 'Your AES-GCM Encrypted Vault is empty. Bookmark articles using the bookmark button on any live feed.'
                  : activeTab === 'readlater'
                  ? 'Your Read Later queue is empty. Bookmark articles to read them later.'
                  : `No articles matched your filter "${searchQuery}". Try clearing search or selecting a different category.`}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Add Custom Feed */}
          <div className="liquid-glass p-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Add Custom Feed</h4>
            <form onSubmit={handleAddCustomFeed} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customFeedUrl}
                  onChange={(e) => setCustomFeedUrl(e.target.value)}
                  placeholder="Paste RSS/Atom Feed URL..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 placeholder-slate-500"
                />
              </div>
              <button
                type="submit"
                disabled={addingFeed || !customFeedUrl.trim()}
                className="liquid-glass-btn px-4 py-2.5 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{addingFeed ? 'Syncing...' : 'Add'}</span>
              </button>
            </form>
          </div>

          {/* Source Status */}
          {sources.length > 0 && (
            <div className="liquid-glass p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Source Status</h4>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {sources.slice(0, 20).map((src) => {
                  const isWorking = src.status === 'success';
                  return (
                    <div key={src.name} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 truncate max-w-[140px] flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isWorking ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {src.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        isWorking ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'
                      }`}>
                        {isWorking ? 'Working' : 'Failed'}
                      </span>
                    </div>
                  );
                })}
                {sources.length > 20 && (
                  <p className="text-[10px] text-slate-500 font-mono text-center">+{sources.length - 20} more sources</p>
                )}
              </div>
            </div>
          )}

          {/* Offline Queue */}
          {offlineQueue.length > 0 && (
            <div className="liquid-glass p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-amber-400" /> Offline Queue
                </h4>
                <button onClick={clearOfflineQueue} className="liquid-glass-btn px-2 py-1 text-[10px] font-bold text-slate-300">
                  Clear
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {offlineQueue.map((item) => (
                  <div key={item.id} className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.source}</div>
                    </div>
                    <button onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')} className="liquid-glass-btn p-1.5 shrink-0">
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookmark Folders */}
          <div className="liquid-glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4 text-red-400" /> Bookmark Folders
              </h4>
              <button onClick={createBookmarkFolder} className="liquid-glass-btn p-1.5">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.keys(bookmarkFolders).length === 0 ? (
                <p className="text-[11px] text-slate-400">No folders yet. Create one to organize bookmarks.</p>
              ) : (
                Object.entries(bookmarkFolders).map(([folder, items]) => (
                  <div key={folder} className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{folder}</div>
                      <div className="text-[10px] text-slate-400">{items.length} articles</div>
                    </div>
                    <button onClick={() => setActiveBookmarkFolder(folder === activeBookmarkFolder ? null : folder)} className={`liquid-glass-btn px-2 py-1 text-[10px] font-bold ${folder === activeBookmarkFolder ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'text-slate-300'}`}>
                      {folder === activeBookmarkFolder ? 'Close' : 'Open'}
                    </button>
                  </div>
                ))
              )}
            </div>
            {activeBookmarkFolder && (bookmarkFolders[activeBookmarkFolder] || []).length === 0 && (
              <p className="text-[11px] text-slate-400">This folder is empty.</p>
            )}
          </div>
        </div>

        {/* Export */}
        <div className="liquid-glass p-4 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Export</h4>
          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'json' | 'text')}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="json">JSON</option>
              <option value="text">Plain Text</option>
            </select>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="liquid-glass-btn px-3 py-2 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-10 z-20 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-1.5 space-y-1 min-w-[160px]">
                  <button
                    onClick={() => exportArticles()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export current view
                  </button>
                  <button
                    onClick={exportOpml}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" /> Export OPML
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Article Reader Modal */}
        {readerArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setReaderArticle(null)}>
            <div className="w-full max-w-3xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <button onClick={() => setReaderArticle(null)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Article Reader</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const idx = visibleArticles.findIndex((a) => a.id === readerArticle.id);
                      if (idx > 0) setReaderArticle(visibleArticles[idx - 1]);
                    }}
                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 cursor-pointer"
                    title="Previous (k/←)"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {visibleArticles.findIndex((a) => a.id === readerArticle.id) + 1}/{visibleArticles.length}
                  </span>
                  <button
                    onClick={() => {
                      const idx = visibleArticles.findIndex((a) => a.id === readerArticle.id);
                      if (idx >= 0 && idx < visibleArticles.length - 1) setReaderArticle(visibleArticles[idx + 1]);
                    }}
                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 cursor-pointer"
                    title="Next (j/→)"
                  >
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-60px)] p-6 space-y-4">
                {readerArticle.imageUrl && (
                  <img src={readerArticle.imageUrl} alt={readerArticle.title} className="w-full h-56 object-cover rounded-2xl" />
                )}
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getSourceBadgeColor(readerArticle.category)}`}>
                    {getCategoryIcon(readerArticle.category)} {readerArticle.category}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white leading-tight">{readerArticle.title}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>{readerArticle.source}</span>
                  <span>·</span>
                  <span>{readerArticle.date}</span>
                  <span>·</span>
                  <span>{calculateReadingTime(readerArticle.summary + ' ' + readerArticle.title)} min read</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{readerArticle.summary}</p>
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <PenLine className="w-3.5 h-3.5" /> Notes
                  </label>
                  <textarea
                    value={articleNotes[readerArticle.id] || ''}
                    onChange={(e) => saveNote(readerArticle.id, e.target.value)}
                    placeholder="Add private notes for this article..."
                    className="w-full h-28 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 placeholder-slate-500 resize-none"
                  />
                </div>
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Star className="w-3.5 h-3.5" /> Rate Article
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => rateArticle(readerArticle.id, star)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${(ratings[readerArticle.id] || 0) >= star ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-white/10 text-slate-400 hover:text-white'}`}
                      >
                        <Star className={`w-4 h-4 ${(ratings[readerArticle.id] || 0) >= star ? 'fill-amber-400' : ''}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-xs text-slate-400 font-mono">{ratings[readerArticle.id] || 0}/5</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Highlighter className="w-3.5 h-3.5" /> Highlights
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {readerArticle.summary.split(' ').slice(0, 20).map((word, i) => (
                      <button
                        key={i}
                        onClick={() => toggleHighlight(readerArticle.id, word.replace(/[^a-zA-Z0-9]/g, ''))}
                        className={`px-2 py-1 rounded-lg border text-[11px] cursor-pointer transition-all ${(highlights[readerArticle.id] || []).includes(word.replace(/[^a-zA-Z0-9]/g, '')) ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'border-white/10 text-slate-400 hover:text-white'}`}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => window.open(readerArticle.url, '_blank', 'noopener,noreferrer')}
                    className="liquid-glass-btn px-4 py-2 text-xs font-bold flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Original
                  </button>
                  <button
                    onClick={() => speakArticle(readerArticle)}
                    className={`liquid-glass-btn px-4 py-2 text-xs font-bold flex items-center gap-2 ${textToSpeech ? 'bg-red-500/20 border-red-500/40 text-red-400' : ''}`}
                  >
                    {textToSpeech ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    {textToSpeech ? 'Stop TTS' : 'Listen'}
                  </button>
                  <button
                    onClick={() => addToOfflineQueue(readerArticle)}
                    className="liquid-glass-btn px-4 py-2 text-xs font-bold flex items-center gap-2"
                  >
                    <WifiOff className="w-3.5 h-3.5" /> Save Offline
                  </button>
                  <button
                    onClick={() => togglePrintMode()}
                    className="liquid-glass-btn px-4 py-2 text-xs font-bold flex items-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button
                    onClick={() => {
                      toggleSaveArticle(readerArticle);
                    }}
                    className={`px-4 py-2 rounded-xl border transition-all text-xs font-bold flex items-center gap-2 cursor-pointer ${
                      savedArticles.some((a) => a.id === readerArticle.id)
                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                        : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                    }`}
                  >
                    {savedArticles.some((a) => a.id === readerArticle.id) ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    {savedArticles.some((a) => a.id === readerArticle.id) ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      toggleReadLater(readerArticle);
                    }}
                    className={`px-4 py-2 rounded-xl border transition-all text-xs font-bold flex items-center gap-2 cursor-pointer ${
                      readLater.some((a) => a.id === readerArticle.id)
                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                        : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                    }`}
                  >
                    {readLater.some((a) => a.id === readerArticle.id) ? <BookMarked className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    {readLater.some((a) => a.id === readerArticle.id) ? 'In Read Later' : 'Read Later'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
