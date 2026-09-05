/**
 * Hub 1: Connect & Social Suite Container
 * Includes Messaging, Social Feed, Call Dialer, and Stickers Vault
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Messaging } from './Messaging';
import { SocialFeed } from './SocialFeed';
import { StickersVault } from './StickersVault';
import { MessageSquare, Sparkles, Smile, Bell, Search, User, Heart, MessageCircle, UserPlus, Info, X } from 'lucide-react';

type SubTab = 'messaging' | 'social' | 'stickers';
type SearchTab = 'messages' | 'contacts' | 'posts';

interface SearchResultMessage {
  type: 'message';
  data: {
    id: string;
    text: string;
    conversationId: string;
    conversationName: string;
    timestamp: string;
  };
}

interface SearchResultContact {
  type: 'contact';
  data: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface SearchResultPost {
  type: 'post';
  data: {
    id: string;
    content: string;
    authorName: string;
    timestamp: string;
  };
}

type SearchResult = SearchResultMessage | SearchResultContact | SearchResultPost;

export const ConnectSocialHub: React.FC = () => {
  const {
    t, user,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    conversations,
    searchMessages,
    searchPosts,
    searchContacts,
    addConversation,
    updateConversation,
  } = useApp();

  const [subTab, setSubTab] = useState<SubTab>('messaging');
  const [showSearch, setShowSearch] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchTab, setSearchTab] = useState<SearchTab>('messages');
  const [showNotifications, setShowNotifications] = useState(false);
  const [targetConversationId, setTargetConversationId] = useState<string | null>(null);
  const [targetPostId, setTargetPostId] = useState<string | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalUnreadMessages = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [conversations]);

  const unreadSocialNotifications = useMemo(() => {
    return notifications.filter(n => !n.read && (n.type === 'like' || n.type === 'comment' || n.type === 'follow')).length;
  }, [notifications]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const messageResults = useMemo<SearchResultMessage[]>(() => {
    if (searchTab !== 'messages' || !globalSearch.trim()) return [];
    return conversations.flatMap(c => {
      const results = searchMessages(c.id, globalSearch);
      return results.map(msg => ({
        type: 'message' as const,
        data: {
          id: msg.id,
          text: msg.text,
          conversationId: c.id,
          conversationName: c.participantDetails.map(p => p.name).join(', ') || c.participants.join(', '),
          timestamp: msg.timestamp,
        },
      }));
    });
  }, [globalSearch, searchTab, conversations, searchMessages]);

  const contactResults = useMemo<SearchResultContact[]>(() => {
    if (searchTab !== 'contacts' || !globalSearch.trim()) return [];
    const contacts = searchContacts(globalSearch);
    return contacts.map(c => ({
      type: 'contact' as const,
      data: {
        id: c.id,
        name: c.name,
        avatar: c.avatar,
      },
    }));
  }, [globalSearch, searchTab, searchContacts]);

  const postResults = useMemo<SearchResultPost[]>(() => {
    if (searchTab !== 'posts' || !globalSearch.trim()) return [];
    const posts = searchPosts(globalSearch);
    return posts.map(p => ({
      type: 'post' as const,
      data: {
        id: p.id,
        content: p.content,
        authorName: p.authorName,
        timestamp: p.timestamp,
      },
    }));
  }, [globalSearch, searchTab, searchPosts]);

  const handleMessageResultClick = (convId: string) => {
    setTargetConversationId(convId);
    setSubTab('messaging');
    setShowSearch(false);
    setGlobalSearch('');
  };

  const handleContactResultClick = (contactId: string, contactName: string, contactAvatar: string) => {
    if (!user?.id) return;
    const existingConv = conversations.find(c => c.participantDetails.some(p => p.id === contactId));
    if (existingConv) {
      setTargetConversationId(existingConv.id);
    } else {
      const newConv = addConversation([user.id, contactId]);
      updateConversation(newConv.id, {
        participantDetails: [{
          id: contactId,
          name: contactName,
          avatar: contactAvatar,
          online: false,
          bluetoothNearby: false,
          unreadCount: 0,
          publicKeyFingerprint: '',
        }],
      });
      setTargetConversationId(newConv.id);
    }
    setSubTab('messaging');
    setShowSearch(false);
    setGlobalSearch('');
  };

  const handlePostResultClick = (postId: string) => {
    setTargetPostId(postId);
    setSubTab('social');
    setShowSearch(false);
    setGlobalSearch('');
  };

  const handleNotificationClick = (notif: { id: string; type: string; data?: Record<string, any> }) => {
    markNotificationRead(notif.id);
    if (notif.type === 'message') {
      const convId = notif.data?.conversationId;
      if (convId) setTargetConversationId(convId);
      setSubTab('messaging');
    } else if (notif.type === 'like' || notif.type === 'comment' || notif.type === 'follow') {
      const postId = notif.data?.postId;
      if (postId) setTargetPostId(postId);
      setSubTab('social');
    } else {
      setShowNotifications(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'like': return <Heart className="w-4 h-4 text-red-400" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-green-400" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-purple-400" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case 'message': return 'Message';
      case 'like': return 'Like';
      case 'comment': return 'Comment';
      case 'follow': return 'Follow';
      default: return 'System';
    }
  };

  return (
    <div className="space-y-4 skeuo-panel p-5 ">
      {/* Suite Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 skeuo-inset-panel border border-red-500/40 rounded-xl text-red-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white drop-shadow-md">Connect & Social Suite</h3>
            <p className="text-xs text-red-200/90 font-medium">Encrypted messaging, social feed & stickers</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Global Search */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="skeuo-btn p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Search (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>
            {showSearch && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50">
                <div className="flex gap-1 mb-2">
                  {(['messages', 'contacts', 'posts'] as SearchTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setSearchTab(tab)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        searchTab === tab
                          ? 'bg-red-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder={`Search ${searchTab}...`}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  autoFocus
                />
                <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">⌘K</span>
                  <span>to search</span>
                </div>
                <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                  {searchTab === 'messages' && messageResults.length === 0 && globalSearch.trim() && (
                    <p className="text-[10px] text-slate-500 px-1">No messages found</p>
                  )}
                  {searchTab === 'contacts' && contactResults.length === 0 && globalSearch.trim() && (
                    <p className="text-[10px] text-slate-500 px-1">No contacts found</p>
                  )}
                  {searchTab === 'posts' && postResults.length === 0 && globalSearch.trim() && (
                    <p className="text-[10px] text-slate-500 px-1">No posts found</p>
                  )}
                  {searchTab === 'messages' && messageResults.map(result => (
                    <button
                      key={result.data.id}
                      onClick={() => handleMessageResultClick(result.data.conversationId)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <p className="text-[10px] text-slate-400 truncate">{result.data.conversationName}</p>
                      <p className="text-xs text-slate-200 line-clamp-1">{result.data.text}</p>
                    </button>
                  ))}
                  {searchTab === 'contacts' && contactResults.map(result => (
                    <button
                      key={result.data.id}
                      onClick={() => handleContactResultClick(result.data.id, result.data.name, result.data.avatar)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">
                        {result.data.name.charAt(0)}
                      </div>
                      <span className="text-xs text-slate-200">{result.data.name}</span>
                    </button>
                  ))}
                  {searchTab === 'posts' && postResults.map(result => (
                    <button
                      key={result.data.id}
                      onClick={() => handlePostResultClick(result.data.id)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <p className="text-[10px] text-slate-400">{result.data.authorName}</p>
                      <p className="text-xs text-slate-200 line-clamp-1">{result.data.content}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="skeuo-btn p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50">
                <div className="flex items-center justify-between p-3 border-b border-slate-700">
                  <h4 className="text-xs font-bold text-white">Notifications</h4>
                  {notifications.some(n => !n.read) && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="text-[10px] text-slate-500 p-3 text-center">No notifications</p>
                  )}
                  {notifications.map(notif => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`w-full flex items-start gap-2 p-3 hover:bg-slate-800 transition-colors text-left ${
                        !notif.read ? 'bg-slate-800/50' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            {getNotificationLabel(notif.type)}
                          </span>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-white font-medium truncate">{notif.title}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{notif.body}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Pill */}
          <button className="skeuo-btn flex items-center gap-2 pl-1 pr-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors">
            <div className="relative">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="w-7 h-7 rounded-full object-cover border border-slate-600" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center border border-slate-600">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-slate-800 rounded-full" />
            </div>
            <span className="text-xs font-bold text-white max-w-[80px] truncate">{user?.username || 'Guest'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 p-1.5 skeuo-panel overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab('messaging')}
          className={`skeuo-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'messaging'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg shadow-red-900/30 border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4" />
            {totalUnreadMessages > 0 && (
              <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
              </span>
            )}
          </div>
          <span>Messages</span>
        </button>

        <button
          onClick={() => setSubTab('social')}
          className={`skeuo-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'social'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg shadow-red-900/30 border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <div className="relative">
            <Sparkles className="w-4 h-4" />
            {unreadSocialNotifications > 0 && (
              <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadSocialNotifications > 99 ? '99+' : unreadSocialNotifications}
              </span>
            )}
          </div>
          <span>Social Feed</span>
        </button>

        <button
          onClick={() => setSubTab('stickers')}
          className={`skeuo-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subTab === 'stickers'
              ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] text-white shadow-lg shadow-red-900/30 border border-red-400/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>Stickers</span>
        </button>
      </div>

      <div className="transition-all duration-300">
        {subTab === 'messaging' && (
          <Messaging highlightedConversationId={targetConversationId || undefined} />
        )}
        {subTab === 'social' && (
          <SocialFeed highlightedPostId={targetPostId || undefined} />
        )}
        {subTab === 'stickers' && <StickersVault />}
      </div>
    </div>
  );
};
