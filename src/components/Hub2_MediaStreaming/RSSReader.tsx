/**
 * RSSReader Component: Live RSS & News Aggregator with AES-GCM 256 Encryption & Offline Vault Caching
 */

import React, { useState, useEffect } from 'react';
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
  Lock,
  Globe,
  Plane,
  Layers,
  AlertCircle,
  Activity,
  Clock,
} from 'lucide-react';

export const RSSReader: React.FC = () => {
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'aviation' | 'world' | 'saved'>('all');
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number; sourceName: string }>({
    current: 0,
    total: 0,
    sourceName: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customFeedUrl, setCustomFeedUrl] = useState('');
  const [addingFeed, setAddingFeed] = useState(false);

  // Encrypted Saved Articles Storage
  const [savedArticles, setSavedArticles] = useState<NewsItem[]>([]);
  const [savedEncryptedPayloads, setSavedEncryptedPayloads] = useState<Record<string, EncryptedPayload<NewsItem>>>(
    {}
  );

  // Load news feeds on mount or tab change
  useEffect(() => {
    loadNews(activeTab);
  }, [activeTab]);

  // Load saved encrypted articles on mount
  useEffect(() => {
    const loadEncryptedVault = async () => {
      try {
        const raw = localStorage.getItem('brio_encrypted_rss_vault');
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, EncryptedPayload<NewsItem>>;
          setSavedEncryptedPayloads(parsed);

          // Decrypt all saved articles safely
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
  }, []);

  const loadNews = async (tab: 'all' | 'aviation' | 'world' | 'saved') => {
    if (tab === 'saved') return;

    setLoading(true);
    setArticles([]);
    setSources([]);

    try {
      if (tab === 'aviation') {
        const res = await fetchAviationNews(
          (items, srcList) => {
            setArticles([...items]);
            setSources([...srcList]);
          },
          (source, count) => setProgress((prev) => ({ ...prev, current: prev.current + 1, sourceName: source }))
        );
        setArticles(res.articles);
        setSources(res.sources);
        showToast('Aviation Feeds Sync Complete', `Loaded ${res.articles.length} live articles`, 'success');
      } else if (tab === 'world') {
        const res = await fetchWorldNews(
          (items, srcList) => {
            setArticles([...items]);
            setSources([...srcList]);
          },
          (p, s) => setProgress((prev) => ({ ...prev, current: prev.current + 1, sourceName: s }))
        );
        setArticles(res.articles);
        setSources(res.sources);
        showToast('World News Feeds Sync Complete', `Loaded ${res.articles.length} live articles`, 'success');
      } else {
        const res = await fetchAllNews(
          (items, srcList) => {
            setArticles([...items]);
            setSources([...srcList]);
          },
          (p, s) => setProgress((prev) => ({ ...prev, current: prev.current + 1, sourceName: s }))
        );
        setArticles(res.articles);
        setSources(res.sources);
        showToast('All Live Feeds Sync Complete', `Loaded ${res.articles.length} live articles`, 'success');
      }
    } catch (err: any) {
      console.error('Error loading news feeds:', err);
      showToast('RSS Stream Notice', `Network update notice: ${err.message || 'Stream sync interrupted'}`, 'info');
    } finally {
      setLoading(false);
    }
  };

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

  // Filtered display list
  const currentList = activeTab === 'saved' ? savedArticles : articles;

  const filteredArticles = searchArticles(
    currentList.filter((art) => {
      if (selectedCategory === 'all') return true;
      return art.category === selectedCategory;
    }),
    searchQuery
  );

  const successfulSources = sources.filter((s) => s.status === 'success');
  const failedSources = sources.filter((s) => s.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Top Header & Feed Connector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl text-pink-400">
            <Rss className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Live Global RSS Intelligence Hub</h3>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono rounded flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" /> Encrypted Vault
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-source real-time RSS aggregator with CORS proxying and AES-256 local caching
            </p>
          </div>
        </div>

        {/* Custom Feed URL Form */}
        <form onSubmit={handleAddCustomFeed} className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <input
              type="text"
              value={customFeedUrl}
              onChange={(e) => setCustomFeedUrl(e.target.value)}
              placeholder="Paste RSS/Atom Feed XML URL..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-pink-500 placeholder-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={addingFeed || !customFeedUrl.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{addingFeed ? 'Syncing...' : 'Add Stream'}</span>
          </button>
        </form>
      </div>

      {/* Tabs & Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 p-2 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Live Feeds</span>
          </button>

          <button
            onClick={() => setActiveTab('aviation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'aviation'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Plane className="w-4 h-4 text-sky-400" />
            <span>Aviation & Optics</span>
          </button>

          <button
            onClick={() => setActiveTab('world')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'world'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>World & Geopolitics</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Saved Encrypted Vault ({savedArticles.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={() => loadNews(activeTab)}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh feeds"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-pink-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search titles, summaries, sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
          <span className="text-xs text-slate-500 font-mono shrink-0">Lean / Category:</span>
          {['all', 'Centrist', 'Left-wing', 'Right-wing', 'State-Controlled'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Status Summary Banner */}
      {sources.length > 0 && activeTab !== 'saved' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-pink-400 animate-pulse" />
            <span className="text-slate-300">
              Active Stream Monitors:{' '}
              <strong className="text-emerald-400">{successfulSources.length} Live</strong>
              {failedSources.length > 0 && (
                <span className="text-red-400 ml-2">({failedSources.length} Offline / Proxy Bypassed)</span>
              )}
            </span>
          </div>

          <div className="text-slate-400">
            Displaying <strong className="text-white">{filteredArticles.length}</strong> loaded articles
          </div>
        </div>
      )}

      {/* Loading Progress */}
      {loading && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-pink-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Polling Live News Servers via CORS Proxy Pipeline...</span>
          </div>
          {progress.sourceName && (
            <p className="text-xs font-mono text-slate-400">Fetching feed from: {progress.sourceName}</p>
          )}
        </div>
      )}

      {/* Articles Grid / Rich Visual Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((art) => {
          const isSaved = savedArticles.some((a) => a.id === art.id);

          // Extract domain for favicon provider logo
          let domain = '';
          try {
            domain = new URL(art.url).hostname.replace('www.', '');
          } catch {
            domain = 'news.google.com';
          }

          const providerLogo = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

          // Default fallback imagery if art.imageUrl is absent
          const fallbackImage =
            art.category === 'State-Controlled' || activeTab === 'aviation'
              ? 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&fit=crop'
              : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop';

          const cardImg = art.imageUrl || fallbackImage;

          return (
            <div
              key={art.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-pink-500/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between transition-all group duration-300"
            >
              {/* Cover Image */}
              <div className="relative h-44 overflow-hidden bg-slate-950">
                <img
                  src={cardImg}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Category Pill */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-pink-300">
                  {art.category}
                </span>

                {/* Provider Logo Header */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold">
                  <img src={providerLogo} alt={domain} className="w-3.5 h-3.5 rounded-full object-contain" />
                  <span className="truncate max-w-[90px]">{art.source}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-pink-400" />
                      {art.date}
                    </span>
                    {art.country && (
                      <span className="px-2 py-0.5 bg-slate-800 rounded-md text-slate-300 font-bold border border-slate-700">
                        {art.country}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-extrabold text-white leading-snug group-hover:text-pink-300 transition-colors line-clamp-2">
                    {art.title}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{art.summary}</p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={providerLogo} alt={domain} className="w-4 h-4 rounded-full" />
                    <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[120px]">{domain}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSaveArticle(art)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-lg'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title={isSaved ? 'Saved in AES Vault' : 'Save to AES Encrypted Vault'}
                    >
                      {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl border border-slate-700 transition-all cursor-pointer"
                      title="Read full story on provider site"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!loading && filteredArticles.length === 0 && (
        <div className="p-12 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No Articles Found</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {activeTab === 'saved'
              ? 'Your AES-GCM Encrypted Vault is empty. Bookmark articles using the bookmark button on any live feed to save them offline.'
              : `No articles matched your filter "${searchQuery}". Try clearing search or selecting a different category.`}
          </p>
        </div>
      )}
    </div>
  );
};
