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
    } catch (err: any) {
      console.error('Error loading news feeds:', err);
      showToast('RSS Stream Notice', `Network update notice: ${err.message || 'Stream sync interrupted'}`, 'info');
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
    } catch (err: any) {
      showToast('Feed Sync Error', `Unable to parse feed at ${feedUrl}: ${err.message}`, 'error');
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

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

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
    const readingTime = calculateReadingTime(art.summary + ' ' + art.title);

    let domain = '';
    try {
      domain = new URL(art.url).hostname.replace('www.', '');
    } catch {
      domain = 'news.google.com';
    }

    const providerLogo = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    const fallbackImage = art.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop';

    const isNewlyLoaded = recentlyLoaded.includes(art.source);

    if (viewMode === 'compact') {
      return (
        <div
          key={art.id}
          className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:bg-white/5 ${
            isRead ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5'
          } ${isNewlyLoaded ? 'animate-slideIn' : ''}`}
          onClick={() => {
            markAsRead(art.id);
            window.open(art.url, '_blank', 'noopener,noreferrer');
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${getSourceBadgeColor(art.category)}`}>
                {art.category}
              </span>
              <span className="text-[10px] text-slate-500 font-mono truncate">{art.source}</span>
              <span className="text-[10px] text-slate-600 font-mono">{readingTime} min</span>
            </div>
            <h4 className={`text-sm font-semibold truncate ${isRead ? 'text-slate-500' : 'text-white'}`}>
              {art.title}
            </h4>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); toggleReadLater(art); }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isReadLater ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-transparent text-slate-500 hover:text-white'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
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
          </div>
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <Clock className="w-3 h-3" />
              <span>{art.date}</span>
              <span className="text-slate-600">·</span>
              <span>{readingTime} min</span>
            </div>
            <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-red-300 transition-colors">
              {art.title}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-2">{art.summary}</p>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5">
                <img src={providerLogo} alt={domain} className="w-3.5 h-3.5 rounded-full" />
                <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{domain}</span>
              </div>
              <div className="flex items-center gap-1">
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
          window.open(art.url, '_blank', 'noopener,noreferrer');
        }}
      >
        <div className="flex gap-4 p-4">
          <div className="relative w-32 h-24 rounded-xl overflow-hidden bg-slate-950 shrink-0">
            <img
              src={fallbackImage}
              alt={art.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
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
            </div>
            <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-red-300 transition-colors">
              {art.title}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-2">{art.summary}</p>
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl">
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
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value={0}>Auto-refresh: Off</option>
              <option value="5">Every 5 min</option>
              <option value="10">Every 10 min</option>
              <option value="30">Every 30 min</option>
            </select>

            <button
              onClick={() => setReaderMode((m) => (m === 'dark' ? 'light' : 'dark'))}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
              title="Toggle reading mode"
            >
              {readerMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => { if (activeTab !== 'saved' && activeTab !== 'readlater') loadNews(activeTab); }}
              disabled={loading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh feeds"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-2 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['all', 'aviation', 'world'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-red-600 to-red-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab === 'all' && <Layers className="w-4 h-4" />}
              {tab === 'aviation' && <Plane className="w-4 h-4 text-red-400" />}
              {tab === 'world' && <Globe className="w-4 h-4 text-red-400" />}
              <span>{tab === 'all' ? 'All Live Feeds' : tab === 'aviation' ? 'Aviation' : 'World News'}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono">
                {activeTab === tab ? currentList.length : '—'}
              </span>
            </button>
          ))}

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-red-600 to-red-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span>Saved ({savedArticles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('readlater')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'readlater'
                ? 'bg-gradient-to-r from-red-600 to-red-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookMarked className="w-4 h-4 text-red-400" />
            <span>Read Later ({readLater.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== 'saved' && activeTab !== 'readlater' && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer text-xs font-bold flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Mark All Read
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              showFilters ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-0.5">
            {(['list', 'grid', 'compact'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === mode ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'list' && <Newspaper className="w-4 h-4" />}
                {mode === 'grid' && <TrendingUp className="w-4 h-4" />}
                {mode === 'compact' && <Zap className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      {showFilters && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl animate-slideIn">
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
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
                <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px]">
                  {getArticleCountForCategory(cat)}
                </span>
              </button>
            ))}
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
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
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
                className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-500 hover:to-red-500 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{addingFeed ? 'Syncing...' : 'Add'}</span>
              </button>
            </form>
          </div>

          {/* Source Status */}
          {sources.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
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
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isWorking ? 'bg-red-400' : 'bg-red-400'}`} />
                        {src.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        isWorking ? 'text-red-400 bg-red-500/10 border-red-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'
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
        </div>
      </div>
    </div>
  );
};
