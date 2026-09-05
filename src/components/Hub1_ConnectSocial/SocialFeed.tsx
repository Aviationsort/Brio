/**
 * SocialFeed Component: Instagram-grade social feed with Stories, Explore, Comments, Bookmarks, Algorithm tuning.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { fileToDataUrl } from '../../utils/mediaManager';
import { type Comment, type SocialPost, type Story } from '../../types';
import {
  Sliders,
  Heart,
  MessageCircle,
  Share2,
  Lock,
  Unlock,
  Send,
  ShieldCheck,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  X,
  Edit3,
  Trash2,
  Flag,
  Check,
  Image,
  Film,
  Hash,
  AtSign,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Search,
  TrendingUp,
  Eye,
  Bookmark as BookmarkIcon,
  Repeat,
  User,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const STORY_DURATION_MS = 5000;
const FEED_PAGE_SIZE = 10;
const EXPLORE_CATEGORIES: Array<'all' | 'aviation' | 'tech' | 'cyber' | 'gaming'> = ['all', 'aviation', 'tech', 'cyber', 'gaming'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseTimeAgo(timestamp: string): number {
  const now = Date.now();
  const t = String(timestamp);
  if (t === 'Just now') return 0;
  const parsed = Date.parse(t);
  if (isNaN(parsed)) return 0;
  return Math.max(0, (now - parsed) / 3600000);
}

function parseHashtagsAndMentions(text: string): { hashtags: string[]; mentions: string[] } {
  const hashtags = Array.from(text.matchAll(/#([\w]+)/g)).map((m) => m[1].toLowerCase());
  const mentions = Array.from(text.matchAll(/@([\w]+)/g)).map((m) => m[1].toLowerCase());
  return { hashtags, mentions };
}

function computeAlgorithmScore(
  post: SocialPost,
  settings: { engagementWeight: number; decryptedPrivacyRank: number; recencyWeight: number; mediaWeight: number; echoChamberFilter: number },
  top20AuthorCount: number,
): number {
  const hoursAgo = parseTimeAgo(post.timestamp);
  const recencyFactor = Math.max(0, 24 - hoursAgo);
  const hasMedia = Boolean(post.mediaUrl || (post.mediaUrls && post.mediaUrls.length > 0));
  return (
    (post.likes * settings.engagementWeight) / 100 +
    (post.privacyRank * settings.decryptedPrivacyRank) / 100 +
    (recencyFactor * settings.recencyWeight) / 100 +
    (hasMedia ? settings.mediaWeight / 100 : 0) -
    (settings.echoChamberFilter / 100) * top20AuthorCount
  );
}

function rankPosts(
  posts: SocialPost[],
  settings: { engagementWeight: number; decryptedPrivacyRank: number; recencyWeight: number; mediaWeight: number; echoChamberFilter: number },
): SocialPost[] {
  const authorCounts: Record<string, number> = {};
  const sortedForTop20 = [...posts].sort((a, b) => {
    const hoursAgoA = parseTimeAgo(a.timestamp);
    const hoursAgoB = parseTimeAgo(b.timestamp);
    const scoreA = a.likes * settings.engagementWeight / 100 + Math.max(0, 24 - hoursAgoA) * settings.recencyWeight / 100;
    const scoreB = b.likes * settings.engagementWeight / 100 + Math.max(0, 24 - hoursAgoB) * settings.recencyWeight / 100;
    return scoreB - scoreA;
  });
  sortedForTop20.slice(0, 20).forEach((p) => {
    authorCounts[p.authorId] = (authorCounts[p.authorId] || 0) + 1;
  });

  return [...posts]
    .map((p) => ({
      post: p,
      score: computeAlgorithmScore(p, settings, authorCounts[p.authorId] || 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.post);
}

// ─── StoriesBar ──────────────────────────────────────────────────────────────
interface StoriesBarProps {
  stories: Story[];
  onViewStory: (story: Story) => void;
  onAddStory: (mediaUrl: string, mediaType: 'image' | 'video') => void;
}

const StoriesBar: React.FC<StoriesBarProps> = ({ stories, onViewStory, onAddStory }) => {
  const { user } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
    const dataUrl = await fileToDataUrl(file);
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    onAddStory(dataUrl, mediaType);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
      <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center bg-slate-800 hover:bg-slate-700 transition-colors">
            <Plus className="w-5 h-5 text-slate-400" />
          </div>
          {user?.avatarUrl && <img src={user.avatarUrl} className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-slate-900" alt="" />}
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Your Story</span>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer" onClick={() => onViewStory(story)}>
          <div className={`w-16 h-16 rounded-full p-[2px] ${story.viewers?.includes(user?.id || '') ? 'bg-slate-600' : 'bg-gradient-to-tr from-red-500 to-orange-400'}`}>
            <img src={story.authorAvatar} className="w-full h-full rounded-full object-cover border-2 border-slate-900" alt={story.authorName} />
          </div>
          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[64px]">{story.authorName === user?.username ? 'You' : story.authorName}</span>
        </div>
      ))}
    </div>
  );
};

// ─── StoryViewer ─────────────────────────────────────────────────────────────
interface StoryViewerProps {
  story: Story;
  onClose: () => void;
  onMarkViewed: (storyId: string) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ story, onClose, onMarkViewed }) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    onMarkViewed(story.id);
    setProgress(0);
    const step = 100 / (STORY_DURATION_MS / 50);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timerRef.current!);
          onClose();
          return 100;
        }
        return p + step;
      });
    }, 50);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [story.id, onClose, onMarkViewed]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="w-full h-1 bg-slate-800">
        <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img src={story.authorAvatar} className="w-8 h-8 rounded-full object-cover" alt="" />
          <div>
            <p className="text-white text-xs font-bold">{story.authorName}</p>
            <p className="text-slate-400 text-[10px]">{story.timestamp}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {story.mediaType === 'video' ? (
          <video src={story.mediaUrl} className="max-w-full max-h-full object-contain" autoPlay playsInline />
        ) : (
          <img src={story.mediaUrl} className="max-w-full max-h-full object-contain" alt="" />
        )}
      </div>
      <div className="flex absolute inset-x-0 top-0 bottom-0 pointer-events-none">
        <div className="w-1/3 pointer-events-auto cursor-pointer" onClick={onClose} />
        <div className="flex-1" />
        <div className="w-1/3 pointer-events-auto cursor-pointer" onClick={onClose} />
      </div>
    </div>
  );
};

// ─── AlgorithmModal ──────────────────────────────────────────────────────────
interface AlgorithmModalProps {
  settings: { recencyWeight: number; engagementWeight: number; echoChamberFilter: number; decryptedPrivacyRank: number; mediaWeight: number };
  onUpdate: (patch: Partial<{ recencyWeight: number; engagementWeight: number; echoChamberFilter: number; decryptedPrivacyRank: number; mediaWeight: number }>) => void;
  onClose: () => void;
}

const AlgorithmModal: React.FC<AlgorithmModalProps> = ({ settings, onUpdate, onClose }) => {
  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl w-full max-w-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">Feed Algorithm Parameters</h4>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { key: 'recencyWeight', label: 'Recency Weight', value: settings.recencyWeight },
            { key: 'engagementWeight', label: 'Engagement Weight', value: settings.engagementWeight },
            { key: 'echoChamberFilter', label: 'Echo-Chamber Filter', value: settings.echoChamberFilter },
            { key: 'decryptedPrivacyRank', label: 'Encrypted Privacy Bonus', value: settings.decryptedPrivacyRank },
            { key: 'mediaWeight', label: 'Media Bonus', value: settings.mediaWeight },
          ].map((slider) => (
            <div key={slider.key}>
              <label className="block text-slate-300 text-xs font-medium mb-2">
                {slider.label} ({slider.value}%)
              </label>
              <input type="range" min="0" max="100" value={slider.value} onChange={(e) => onUpdate({ [slider.key]: Number(e.target.value) })} className="w-full accent-red-500" />
            </div>
          ))}
        </div>
        <div className="pt-2">
          <button onClick={onClose} className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-colors">
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── CommentSection ──────────────────────────────────────────────────────────
interface CommentSectionProps {
  comments: Comment[];
  onAdd: (text: string) => void;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAdd, onLike, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const sorted = useMemo(() => [...comments].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)), [comments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim());
    setText('');
  };

  return (
    <div className="border-t border-slate-800 pt-3">
      <button onClick={() => setIsOpen(!isOpen)} className="text-[11px] text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5 font-medium">
        <MessageCircle className="w-3.5 h-3.5" />
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </button>
      {isOpen && (
        <div className="mt-3 space-y-3">
          <div className="space-y-2.5 max-h-48 overflow-y-auto">
            {sorted.length === 0 && <p className="text-[11px] text-slate-500 italic">No comments yet. Be the first!</p>}
            {sorted.map((comment) => (
              <div key={comment.id} className="flex gap-2.5">
                <img src={comment.authorAvatar} className="w-7 h-7 rounded-full object-cover shrink-0" alt={comment.authorName} />
                <div className="flex-1 bg-slate-950/60 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-white">{comment.authorName}</span>
                      <span className="text-[10px] text-slate-500">{comment.timestamp}</span>
                    </div>
                    <button onClick={() => onDelete(comment.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{comment.text}</p>
                  <button
                    onClick={() => onLike(comment.id)}
                    className={`flex items-center gap-1 text-[10px] transition-colors ${comment.userLiked ? 'text-red-400 font-bold' : 'text-slate-500 hover:text-red-400'}`}
                  >
                    <Heart className={`w-3 h-3 ${comment.userLiked ? 'fill-red-400' : ''}`} />
                    {comment.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-2.5 bg-slate-950 border border-slate-700/60 rounded-xl text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
            <button type="submit" disabled={!text.trim()} className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-[11px] font-bold rounded-xl transition-colors">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// ─── PostCard ────────────────────────────────────────────────────────────────
interface PostCardProps {
  post: SocialPost;
  currentUserId?: string;
  decryptedContent?: string;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onComment: (comment: string) => void;
  onLikeComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onEdit: (postId: string, newContent: string) => void;
  onDelete: (postId: string) => void;
  onReport: (postId: string) => void;
  onDecrypt: (postId: string) => void;
  onRepost: (postId: string) => void;
  onHashtagClick: (tag: string) => void;
  onMentionClick: (handle: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  decryptedContent,
  onLike,
  onSave,
  onShare,
  onComment,
  onLikeComment,
  onDeleteComment,
  onEdit,
  onDelete,
  onReport,
  onDecrypt,
  onRepost,
  onHashtagClick,
  onMentionClick,
}) => {
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [localContent, setLocalContent] = useState(post.content);
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const mediaUrls = post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls : post.mediaUrl ? [post.mediaUrl] : [];

  useEffect(() => {
    if (decryptedContent && isDecrypted) {
      setLocalContent(decryptedContent);
    }
  }, [decryptedContent, isDecrypted]);

  const isOwner = post.authorId === currentUserId;

  const renderContent = () => {
    if (post.isEncrypted && !isDecrypted) {
      return (
        <div className="flex items-center justify-between gap-3">
          <p className="text-slate-400 font-mono italic text-xs">{post.content}</p>
          <button
            onClick={() => { onDecrypt(post.id); setIsDecrypted(true); }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-[11px] rounded-lg shadow transition-all shrink-0"
          >
            Decrypt
          </button>
        </div>
      );
    }

    let text = isDecrypted ? (decryptedContent || localContent) : post.content;
    const parts: Array<{ text: string; type: 'text' | 'hashtag' | 'mention' }> = [];
    const regex = /(#[\w]+|@[\w]+)/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push({ text: text.slice(lastIndex, match.index), type: 'text' });
      const token = match[0];
      if (token.startsWith('#')) parts.push({ text: token.slice(1), type: 'hashtag' });
      else parts.push({ text: token.slice(1), type: 'mention' });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), type: 'text' });

    return (
      <p className="text-xs text-slate-200 leading-relaxed">
        {parts.map((part, i) => {
          if (part.type === 'hashtag') return <span key={i} onClick={() => onHashtagClick(part.text)} className="text-red-400 cursor-pointer hover:underline font-medium">#{part.text}</span>;
          if (part.type === 'mention') return <span key={i} onClick={() => onMentionClick(part.text)} className="text-blue-400 cursor-pointer hover:underline font-medium">@{part.text}</span>;
          return <span key={i}>{part.text}</span>;
        })}
      </p>
    );
  };

  return (
    <div id={`post-${post.id}`} className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-3 overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img src={post.authorAvatar} alt={post.authorName} className="w-9 h-9 rounded-full object-cover" />
          <div>
            <h4 className="text-xs font-bold text-white">{post.authorName}</h4>
            <p className="text-[11px] text-slate-400">{post.authorHandle} • {post.timestamp}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.isEncrypted && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] font-mono font-semibold text-red-400">
              <ShieldCheck className="w-3 h-3" /> Encrypted
            </span>
          )}
          {isOwner && (
            <div className="relative">
              <button onClick={() => setShowActions(!showActions)} className="text-slate-400 hover:text-white transition-colors p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showActions && (
                <div className="absolute right-0 top-6 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-10 min-w-[140px]">
                  <button onClick={() => { setIsEditing(true); setShowActions(false); }} className="w-full text-left px-3 py-2 text-[11px] text-slate-300 hover:bg-slate-700 flex items-center gap-2">
                    <Edit3 className="w-3 h-3" /> Edit Post
                  </button>
                  <button onClick={() => { onDelete(post.id); setShowActions(false); }} className="w-full text-left px-3 py-2 text-[11px] text-red-400 hover:bg-slate-700 flex items-center gap-2">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                  <button onClick={() => { onReport(post.id); setShowActions(false); }} className="w-full text-left px-3 py-2 text-[11px] text-orange-400 hover:bg-slate-700 flex items-center gap-2">
                    <Flag className="w-3 h-3" /> Report
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700/60 rounded-xl text-xs text-white resize-none focus:outline-none focus:border-red-500"
              rows={3}
            />
            <div className="flex gap-2">
              <button onClick={() => { onEdit(post.id, localContent); setIsEditing(false); }} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1">
                <Check className="w-3 h-3" /> Save
              </button>
              <button onClick={() => { setIsEditing(false); setLocalContent(post.content); }} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-bold rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">{renderContent()}</div>
        )}
      </div>

      {mediaUrls.length > 0 && (
        <div className="px-4 relative">
          <div className="relative rounded-xl overflow-hidden bg-slate-950">
            {mediaUrls[currentMediaIndex]?.startsWith('data:video') || mediaUrls[currentMediaIndex]?.match(/\.(mp4|webm|mov)$/) ? (
              <video src={mediaUrls[currentMediaIndex]} className="w-full max-h-80 object-contain" controls />
            ) : (
              <img src={mediaUrls[currentMediaIndex]} className="w-full max-h-80 object-cover" alt="" />
            )}
            {mediaUrls.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentMediaIndex((i) => Math.max(0, i - 1))}
                  disabled={currentMediaIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentMediaIndex((i) => Math.min(mediaUrls.length - 1, i + 1))}
                  disabled={currentMediaIndex === mediaUrls.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {mediaUrls.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentMediaIndex ? 'bg-white' : 'bg-white/40'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {post.hashtags && post.hashtags.length > 0 && (
        <div className="px-4 flex flex-wrap gap-1.5">
          {post.hashtags.map((tag) => (
            <span key={tag} onClick={() => onHashtagClick(tag)} className="text-[10px] text-red-400 hover:underline cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-5 px-4 pb-4 pt-1">
        <button onClick={onLike} className={`flex items-center gap-1.5 transition-colors ${post.userLiked ? 'text-red-400 font-bold' : 'text-slate-400 hover:text-red-400'}`}>
          <Heart className={`w-4 h-4 ${post.userLiked ? 'fill-red-400' : ''}`} />
          <span className="text-xs font-medium">{post.likes}</span>
        </button>
        <span className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-medium">{post.commentsCount}</span>
        </span>
        <button onClick={onShare} className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors">
          <Share2 className="w-4 h-4" />
          <span className="text-xs font-medium">{post.shares}</span>
        </button>
        <button onClick={onSave} className={`ml-auto transition-colors ${post.userSaved ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'}`}>
          <BookmarkIcon className={`w-4 h-4 ${post.userSaved ? 'fill-yellow-400' : ''}`} />
        </button>
        <button onClick={() => onRepost(post.id)} className="flex items-center gap-1.5 text-slate-400 hover:text-green-400 transition-colors">
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount || 0} views</span>
          <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{post.shares} shares</span>
          <span className="flex items-center gap-1"><BookmarkIcon className="w-3 h-3" />{post.bookmarkCount || 0} bookmarks</span>
        </div>
      </div>

      <div className="px-4 pb-3">
        <CommentSection comments={post.comments || []} onAdd={onComment} onLike={onLikeComment} onDelete={onDeleteComment} />
      </div>
    </div>
  );
};

// ─── PostComposer ────────────────────────────────────────────────────────────
interface PostComposerProps {
  currentUser?: { id: string; username: string; avatarUrl?: string } | null;
}

const PostComposer: React.FC<PostComposerProps> = ({ currentUser }) => {
  const { addSocialPost, showToast } = useApp();
  const [text, setText] = useState('');
  const [encrypt, setEncrypt] = useState(false);
  const [media, setMedia] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'carousel'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (files: File[]): Promise<string[]> => {
    return new Promise((resolve) => {
      setUploadProgress(0);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 15;
        setUploadProgress(Math.min(progress, 90));
        if (progress >= 90) {
          clearInterval(interval);
          Promise.all(files.map((f) => fileToDataUrl(f))).then((dataUrls) => {
            setUploadProgress(100);
            setTimeout(() => setUploadProgress(null), 600);
            resolve(dataUrls);
          });
        }
      }, 120);
    });
  };

  const handleFiles = async (files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'));
    if (valid.length === 0) return;
    const urls = await simulateUpload(valid);
    setMedia((prev) => [...prev, ...urls]);
    setMediaType(valid.length > 1 ? 'carousel' : valid[0].type.startsWith('video/') ? 'video' : 'image');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) handleFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && media.length === 0) return;
    try {
      await addSocialPost(text, encrypt, media[0] || undefined, media, mediaType);
      setText('');
      setMedia([]);
      setEncrypt(false);
      setMediaType('image');
      showToast('Posted', 'Your post is now live.', 'success');
    } catch {
      showToast('Error', 'Failed to create post.', 'error');
    }
  };

  const removeMedia = (index: number) => setMedia((prev) => prev.filter((_, i) => i !== index));

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Broadcast an encrypted or public message to the Brio network..."
        rows={3}
        className="w-full p-3 bg-slate-950 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
      />

      {media.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {media.map((url, i) => (
            <div key={i} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-slate-700">
              {url.startsWith('data:video') ? (
                <video src={url} className="w-full h-full object-cover" />
              ) : (
                <img src={url} className="w-full h-full object-cover" alt="" />
              )}
              <button type="button" onClick={() => removeMedia(i)} className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white hover:bg-red-600 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadProgress !== null && (
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed cursor-pointer transition-colors ${isDragOver ? 'border-red-500 bg-red-500/5' : 'border-slate-700 hover:border-slate-600'}`}
      >
        {isDragOver ? (
          <p className="text-[11px] text-red-400 font-medium">Drop files here...</p>
        ) : (
          <>
            <Image className="w-4 h-4 text-slate-500" />
            <Film className="w-4 h-4 text-slate-500" />
            <p className="text-[11px] text-slate-500">Drop media or click to upload (images/video, multi-file for carousel)</p>
          </>
        )}
        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileInput} />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setEncrypt(!encrypt)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            encrypt ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          {encrypt ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>{encrypt ? 'AES-GCM Encrypted' : 'Public Post'}</span>
        </button>

        <button type="submit" className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5">
          <Send className="w-3.5 h-3.5" />
          <span>Broadcast Post</span>
        </button>
      </div>
    </form>
  );
};

// ─── ExploreGrid ─────────────────────────────────────────────────────────────
interface ExploreGridProps {
  posts: SocialPost[];
  onHashtagClick: (tag: string) => void;
  onPostClick: (post: SocialPost) => void;
}

const ExploreGrid: React.FC<ExploreGridProps> = ({ posts, onHashtagClick, onPostClick }) => {
  const [category, setCategory] = useState<'all' | 'aviation' | 'tech' | 'cyber' | 'gaming'>('all');

  const filtered = useMemo(() => {
    if (category === 'all') return posts;
    return posts.filter((p) => p.category === category);
  }, [posts, category]);

  const trending = useMemo(() => [...filtered].sort((a, b) => (b.likes + (b.shares || 0)) - (a.likes + (a.shares || 0))), [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {EXPLORE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
              category === cat ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {trending.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs">No posts to explore. Create some!</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {trending.map((post) => {
            const hasMedia = Boolean(post.mediaUrl || (post.mediaUrls && post.mediaUrls.length > 0));
            return (
              <div
                key={post.id}
                onClick={() => onPostClick(post)}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-slate-800"
              >
                {hasMedia ? (
                  <img src={post.mediaUrls?.[0] || post.mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-3 bg-gradient-to-br from-slate-800 to-slate-900">
                    <p className="text-[10px] text-slate-400 text-center line-clamp-4">{post.content}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="absolute bottom-0 inset-x-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex items-center gap-3 text-white text-[10px] font-medium">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount || 0}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.commentsCount}</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {post.isEncrypted && <ShieldCheck className="w-3.5 h-3.5 text-red-400" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── FeedTabs ────────────────────────────────────────────────────────────────
interface FeedTabsProps {
  activeTab: 'foryou' | 'following' | 'explore' | 'saved';
  onChange: (tab: 'foryou' | 'following' | 'explore' | 'saved') => void;
  savedCount: number;
}

const FeedTabs: React.FC<FeedTabsProps> = ({ activeTab, onChange, savedCount }) => {
  const tabs: Array<{ key: FeedTabsProps['activeTab']; label: string; icon?: React.ReactNode }> = [
    { key: 'foryou', label: 'For You' },
    { key: 'following', label: 'Following' },
    { key: 'explore', label: 'Explore', icon: <Search className="w-3.5 h-3.5" /> },
    { key: 'saved', label: 'Saved', icon: <Bookmark className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
            activeTab === tab.key ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          {tab.icon}
          {tab.label}
          {tab.key === 'saved' && savedCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-500/30 text-red-300 rounded-full text-[10px]">{savedCount}</span>}
        </button>
      ))}
    </div>
  );
};

// ─── SharePicker ─────────────────────────────────────────────────────────────
interface SharePickerProps {
  contacts: Array<{ id: string; name: string; avatar: string }>;
  onSelect: (conversationId: string) => void;
  onClose: () => void;
}

const SharePicker: React.FC<SharePickerProps> = ({ contacts, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h4 className="text-xs font-bold text-white">Share with</h4>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {contacts.length === 0 && <p className="text-[11px] text-slate-500 p-4 text-center">No contacts available</p>}
          {contacts.map((contact) => (
            <button key={contact.id} onClick={() => onSelect(contact.id)} className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 transition-colors text-left">
              <img src={contact.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
              <span className="text-xs text-white font-medium">{contact.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── ReportModal ─────────────────────────────────────────────────────────────
interface ReportModalProps {
  postId: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose, onSubmit }) => {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h4 className="text-sm font-bold text-white">Report Post</h4>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe the issue..."
          rows={3}
          className="w-full p-3 bg-slate-950 border border-slate-700/60 rounded-xl text-xs text-white resize-none focus:outline-none focus:border-red-500"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={() => { onSubmit(reason); onClose(); }} disabled={!reason.trim()} className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors">
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PostDetailModal ──────────────────────────────────────────────────────────
interface PostDetailModalProps {
  post: SocialPost;
  currentUserId?: string;
  decryptedContent?: string;
  onClose: () => void;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onComment: (text: string) => void;
  onLikeComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onEdit: (postId: string, newContent: string) => void;
  onDelete: (postId: string) => void;
  onReport: (postId: string) => void;
  onDecrypt: (postId: string) => void;
  onRepost: (postId: string) => void;
  onHashtagClick: (tag: string) => void;
  onMentionClick: (handle: string) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  currentUserId,
  decryptedContent,
  onClose,
  onLike,
  onSave,
  onShare,
  onComment,
  onLikeComment,
  onDeleteComment,
  onEdit,
  onDelete,
  onReport,
  onDecrypt,
  onRepost,
  onHashtagClick,
  onMentionClick,
}) => {
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [localContent, setLocalContent] = useState(post.content);
  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const comments = post.comments || [];

  useEffect(() => {
    if (decryptedContent && isDecrypted) {
      setLocalContent(decryptedContent);
    }
  }, [decryptedContent, isDecrypted]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(commentText.trim());
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Post Details</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <PostCard
            post={{ ...post, content: isDecrypted ? localContent : post.content }}
            currentUserId={currentUserId}
            decryptedContent={isDecrypted ? localContent : undefined}
            onLike={onLike}
            onSave={onSave}
            onShare={onShare}
            onComment={onComment}
            onLikeComment={onLikeComment}
            onDeleteComment={onDeleteComment}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={onReport}
            onDecrypt={onDecrypt}
            onRepost={onRepost}
            onHashtagClick={onHashtagClick}
            onMentionClick={onMentionClick}
          />
          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Post Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-center">
                <Eye className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-white">{post.viewCount || 0}</p>
                <p className="text-[10px] text-slate-500 uppercase">Views</p>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-center">
                <Heart className="w-4 h-4 text-red-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-white">{post.likes}</p>
                <p className="text-[10px] text-slate-500 uppercase">Likes</p>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-center">
                <Share2 className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-white">{post.shares}</p>
                <p className="text-[10px] text-slate-500 uppercase">Shares</p>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-center">
                <BookmarkIcon className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-white">{post.bookmarkCount || 0}</p>
                <p className="text-[10px] text-slate-500 uppercase">Bookmarks</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Comments ({comments.length})</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.length === 0 && <p className="text-[11px] text-slate-500 italic">No comments yet.</p>}
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5">
                  <img src={comment.authorAvatar} className="w-7 h-7 rounded-full object-cover shrink-0" alt={comment.authorName} />
                  <div className="flex-1 bg-slate-950/60 rounded-xl p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-white">{comment.authorName}</span>
                        <span className="text-[10px] text-slate-500">{comment.timestamp}</span>
                      </div>
                      {comment.authorId === currentUserId && (
                        <button onClick={() => onDeleteComment(comment.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{comment.text}</p>
                    <button
                      onClick={() => onLikeComment(comment.id)}
                      className={`flex items-center gap-1 text-[10px] transition-colors ${comment.userLiked ? 'text-red-400 font-bold' : 'text-slate-500 hover:text-red-400'}`}
                    >
                      <Heart className={`w-3 h-3 ${comment.userLiked ? 'fill-red-400' : ''}`} />
                      {comment.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-2.5 bg-slate-950 border border-slate-700/60 rounded-xl text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
              />
              <button type="submit" disabled={!commentText.trim()} className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-[11px] font-bold rounded-xl transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TrendingHashtags ────────────────────────────────────────────────────────
interface TrendingHashtagsProps {
  posts: SocialPost[];
  onHashtagClick: (tag: string) => void;
}

const TrendingHashtags: React.FC<TrendingHashtagsProps> = ({ posts, onHashtagClick }) => {
  const hashtagCounts: Record<string, number> = {};
  posts.forEach(p => {
    (p.hashtags || []).forEach(tag => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });
  });
  const trending = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (trending.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <TrendingUp className="w-3.5 h-3.5 text-red-400" /> Trending Hashtags
      </h4>
      <div className="space-y-2">
        {trending.map(([tag, count]) => (
          <button
            key={tag}
            onClick={() => onHashtagClick(tag)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors text-left"
          >
            <span className="text-xs text-red-400 font-medium">#{tag}</span>
            <span className="text-[10px] text-slate-500">{count} posts</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── UserProfileStub ─────────────────────────────────────────────────────────
interface UserProfileStubProps {
  user: { id: string; username: string; avatarUrl?: string; bio?: string } | null;
  onClose: () => void;
}

const UserProfileStub: React.FC<UserProfileStubProps> = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">User Profile</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-xl font-bold text-white border-2 border-slate-700">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="text-sm font-bold text-white">{user.username}</h4>
            <p className="text-[11px] text-slate-400">{user.bio || 'Aviation enthusiast & Brio user'}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div className="text-center">
            <p className="text-sm font-bold text-white">0</p>
            <p className="text-[10px] text-slate-500 uppercase">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">0</p>
            <p className="text-[10px] text-slate-500 uppercase">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">0</p>
            <p className="text-[10px] text-slate-500 uppercase">Following</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main SocialFeed ─────────────────────────────────────────────────────────
interface SocialFeedProps {
  highlightedPostId?: string;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ highlightedPostId }) => {
  const {
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
    showToast,
    conversations,
    stories,
    addStory,
    markStoryViewed,
    user,
  } = useApp();

  const [showAlgoModal, setShowAlgoModal] = useState(false);
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'foryou' | 'following' | 'explore' | 'saved'>('foryou');
  const [visibleCount, setVisibleCount] = useState(FEED_PAGE_SIZE);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [shareTarget, setShareTarget] = useState<{ postId: string; contacts: Array<{ id: string; name: string; avatar: string }> } | null>(null);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [hashtagFilter, setHashtagFilter] = useState<string | null>(null);
  const [mentionFilter, setMentionFilter] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const rankedPosts = useMemo(() => {
    let filtered = socialPosts;

    if (activeTab === 'saved') {
      filtered = filtered.filter((p) => p.userSaved);
    } else if (activeTab === 'following') {
      const following = user ? (Array.isArray((user as any).follows) ? (user as any).follows : []) : [];
      filtered = filtered.filter((p) => following.includes(p.authorId) || p.authorId === user?.id);
    }

    if (hashtagFilter) {
      filtered = filtered.filter((p) => p.hashtags?.includes(hashtagFilter.toLowerCase()));
    }

    if (mentionFilter) {
      filtered = filtered.filter((p) => p.mentions?.includes(mentionFilter.toLowerCase()) || p.authorHandle.toLowerCase().includes(`@${mentionFilter.toLowerCase()}`));
    }

    filtered = filtered.filter((p) => !p.repostOf);

    return rankPosts(filtered, algorithmSettings);
  }, [socialPosts, algorithmSettings, activeTab, savedPosts, hashtagFilter, mentionFilter, user]);

  const displayPosts = rankedPosts.slice(0, visibleCount);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + FEED_PAGE_SIZE, rankedPosts.length));
        }
      },
      { threshold: 0.5 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [rankedPosts.length]);

  useEffect(() => {
    setVisibleCount(FEED_PAGE_SIZE);
  }, [activeTab, hashtagFilter, mentionFilter]);

  useEffect(() => {
    if (!highlightedPostId) return;
    const el = document.getElementById(`post-${highlightedPostId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-red-500');
      setTimeout(() => el.classList.remove('ring-2', 'ring-red-500'), 2000);
    }
  }, [highlightedPostId]);

  const handleDecryptPost = async (postId: string) => {
    const post = socialPosts.find((p) => p.id === postId);
    if (!post || !post.encryptedContent) return;
    try {
      const { encryptionService } = await import('../../utils/crypto');
      const plain = await encryptionService.decrypt(post.encryptedContent);
      setDecryptedCache((prev) => ({ ...prev, [postId]: plain }));
      showToast('Decryption Success', 'Payload checksum matched SHA-256.', 'success');
    } catch {
      showToast('Decryption Error', 'Failed to decrypt payload.', 'error');
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    await addComment(postId, text);
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      deleteSocialPost(postId);
      showToast('Post Deleted', 'Your post has been removed.', 'info');
    }
  };

  const handleReport = (reason: string) => {
    showToast('Report Submitted', 'Thank you, our team will review.', 'success');
  };

  const handleEdit = async (postId: string, newContent: string) => {
    updateSocialPost(postId, { content: newContent });
    showToast('Post Updated', 'Your post has been updated.', 'success');
  };

  const handleShare = (postId: string) => {
    const contacts = (conversations || []).flatMap((c) => c.participantDetails || []).slice(0, 20);
    setShareTarget({ postId, contacts: contacts.map((c) => ({ id: c.id, name: c.name, avatar: c.avatar })) });
  };

  const handleShareSelect = (conversationId: string) => {
    if (shareTarget) {
      sharePost(shareTarget.postId, conversationId);
      showToast('Shared', 'Post shared to conversation.', 'success');
      setShareTarget(null);
    }
  };

  const handleRepost = (postId: string) => {
    showToast('Reposted', 'Post shared to your profile.', 'success');
  };

  const handleAddStory = (mediaUrl: string, mediaType: 'image' | 'video') => {
    addStory(mediaUrl, mediaType);
    showToast('Story Added', 'Your story is now live.', 'success');
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Feed Header */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Social Feed</h3>
                <p className="text-xs text-slate-400">Algorithmic ranking • {socialPosts.length} posts</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowProfile(true)}
                className="skeuo-btn p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                title="Profile"
              >
                <User className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAlgoModal(!showAlgoModal)}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-red-300 rounded-xl border border-red-500/20 transition-all shadow-md"
              >
                <Sliders className="w-4 h-4" />
                <span className="hidden sm:inline">Tune Algorithm</span>
              </button>
            </div>
          </div>

      {/* Active filter display */}
      {hashtagFilter && (
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2">
          <span className="text-[11px] text-slate-400">Filtering by:</span>
          <span className="text-[11px] text-red-400 font-bold">#{hashtagFilter}</span>
          <button onClick={() => setHashtagFilter(null)} className="text-slate-400 hover:text-white transition-colors ml-auto">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {mentionFilter && (
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2">
          <span className="text-[11px] text-slate-400">Mentions of:</span>
          <span className="text-[11px] text-blue-400 font-bold">@{mentionFilter}</span>
          <button onClick={() => setMentionFilter(null)} className="text-slate-400 hover:text-white transition-colors ml-auto">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Algorithm Modal */}
      {showAlgoModal && (
        <AlgorithmModal
          settings={algorithmSettings}
          onUpdate={(patch) => setAlgorithmSettings((prev) => ({ ...prev, ...patch }))}
          onClose={() => setShowAlgoModal(false)}
        />
      )}

      {/* Stories Bar */}
      {stories.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl">
          <StoriesBar stories={stories} onViewStory={setSelectedStory} onAddStory={handleAddStory} />
        </div>
      )}

      {/* Story Viewer */}
      {selectedStory && <StoryViewer story={selectedStory} onClose={() => setSelectedStory(null)} onMarkViewed={markStoryViewed} />}

      {/* Feed Tabs */}
      <FeedTabs activeTab={activeTab} onChange={setActiveTab} savedCount={savedPosts.length} />

      {/* Post Composer */}
      <PostComposer currentUser={user ?? undefined} />

      {/* Explore Grid or Feed Stream */}
      {activeTab === 'explore' ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <ExploreGrid posts={socialPosts} onHashtagClick={(tag) => { setHashtagFilter(tag); setActiveTab('foryou'); }} onPostClick={(post) => setSelectedPost(post)} />
        </div>
      ) : (
        <div className="space-y-4">
          {displayPosts.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              {activeTab === 'saved' ? 'No saved posts yet. Bookmark posts to see them here.' : 'No posts in your feed. Create the first post!'}
            </div>
          )}
          {displayPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              decryptedContent={decryptedCache[post.id]}
              onLike={() => toggleLikePost(post.id)}
              onSave={() => toggleSavePost(post.id)}
              onShare={() => handleShare(post.id)}
              onComment={(text) => handleAddComment(post.id, text)}
              onLikeComment={(commentId) => toggleLikeComment(post.id, commentId)}
              onDeleteComment={(commentId) => deleteComment(post.id, commentId)}
              onEdit={handleEdit}
              onDelete={handleDeletePost}
              onReport={() => setReportTarget(post.id)}
              onDecrypt={handleDecryptPost}
              onRepost={handleRepost}
              onHashtagClick={(tag) => { setHashtagFilter(tag); setActiveTab('foryou'); }}
              onMentionClick={(handle) => { setMentionFilter(handle); setActiveTab('foryou'); }}
            />
          ))}
          {visibleCount < rankedPosts.length && (
            <div ref={sentinelRef} className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
              <span className="ml-2 text-[11px] text-slate-400">Loading more posts...</span>
            </div>
          )}
         </div>
       )}
       </div>

       {/* Sidebar */}
       <div className="hidden lg:block space-y-4">
         <TrendingHashtags posts={socialPosts} onHashtagClick={(tag) => { setHashtagFilter(tag); setActiveTab('foryou'); }} />
       </div>
     </div>

      {/* Mobile FAB */}
      <button
        onClick={() => document.getElementById('post-composer')?.scrollIntoView({ behavior: 'smooth' })}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all"
        title="Create Post"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Share Picker */}
      {shareTarget && (
        <SharePicker contacts={shareTarget.contacts} onSelect={handleShareSelect} onClose={() => setShareTarget(null)} />
      )}

      {/* Report Modal */}
      {reportTarget && <ReportModal postId={reportTarget} onClose={() => setReportTarget(null)} onSubmit={handleReport} />}

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          currentUserId={user?.id}
          onClose={() => setSelectedPost(null)}
          onLike={() => { toggleLikePost(selectedPost.id); setSelectedPost(prev => prev ? { ...prev, userLiked: !prev.userLiked, likes: prev.userLiked ? prev.likes - 1 : prev.likes + 1 } : null); }}
          onSave={() => { toggleSavePost(selectedPost.id); setSelectedPost(prev => prev ? { ...prev, userSaved: !prev.userSaved } : null); }}
          onShare={() => handleShare(selectedPost.id)}
          onComment={(text) => handleAddComment(selectedPost.id, text)}
          onLikeComment={(commentId) => toggleLikeComment(selectedPost.id, commentId)}
          onDeleteComment={(commentId) => deleteComment(selectedPost.id, commentId)}
          onEdit={handleEdit}
          onDelete={handleDeletePost}
          onReport={() => setReportTarget(selectedPost.id)}
          onDecrypt={handleDecryptPost}
          onRepost={handleRepost}
          onHashtagClick={(tag) => { setHashtagFilter(tag); setActiveTab('foryou'); setSelectedPost(null); }}
          onMentionClick={(handle) => { setMentionFilter(handle); setActiveTab('foryou'); setSelectedPost(null); }}
        />
      )}

      {/* User Profile Stub */}
      {showProfile && <UserProfileStub user={user} onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default SocialFeed;
