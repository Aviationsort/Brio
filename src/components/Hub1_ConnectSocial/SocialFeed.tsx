/**
 * SocialFeed Component: Customizable Algorithm Feed with Encrypted Posts
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { encryptionService } from '../../utils/crypto';
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
} from 'lucide-react';

export const SocialFeed: React.FC = () => {
  const {
    socialPosts,
    addSocialPost,
    toggleLikePost,
    algorithmSettings,
    setAlgorithmSettings,
    showToast,
  } = useApp();

  const [postText, setPostText] = useState('');
  const [encryptPost, setEncryptPost] = useState(false);
  const [showAlgoModal, setShowAlgoModal] = useState(false);
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;
    try {
      await addSocialPost(postText, encryptPost);
      setPostText('');
    } catch (err) {
      showToast('Post Error', String(err), 'error');
    }
  };

  const handleDecryptPost = async (postId: string) => {
    const post = socialPosts.find((p) => p.id === postId);
    if (!post || !post.encryptedContent) return;

    try {
      const plain = await encryptionService.decrypt(post.encryptedContent);
      setDecryptedCache((prev) => ({ ...prev, [postId]: plain }));
      showToast('Decryption Success', 'Payload checksum matched SHA-256.', 'success');
    } catch (err) {
      showToast('Decryption Error', String(err), 'error');
    }
  };

  // Algorithm Ranking calculation for posts
  const rankedPosts = [...socialPosts].sort((a, b) => {
    const rankA =
      a.likes * (algorithmSettings.engagementWeight / 100) +
      a.privacyRank * (algorithmSettings.decryptedPrivacyRank / 100);
    const rankB =
      b.likes * (algorithmSettings.engagementWeight / 100) +
      b.privacyRank * (algorithmSettings.decryptedPrivacyRank / 100);
    return rankB - rankA;
  });

  return (
    <div className="space-y-5">
      {/* Feed Controls Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Algorithmic Social Feed</h3>
            <p className="text-xs text-slate-400">Customizable ranking weights & E2E encrypted posts</p>
          </div>
        </div>

        <button
          onClick={() => setShowAlgoModal(!showAlgoModal)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 rounded-xl border border-cyan-500/20 transition-all shadow-md"
        >
          <Sliders className="w-4 h-4" />
          <span>Tune Feed Algorithm</span>
        </button>
      </div>

      {/* Algorithm Tuning Modal / Drawer */}
      {showAlgoModal && (
        <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Feed Algorithm Parameters</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Recency Weight ({algorithmSettings.recencyWeight}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={algorithmSettings.recencyWeight}
                onChange={(e) => setAlgorithmSettings((s) => ({ ...s, recencyWeight: Number(e.target.value) }))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Engagement Weight ({algorithmSettings.engagementWeight}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={algorithmSettings.engagementWeight}
                onChange={(e) => setAlgorithmSettings((s) => ({ ...s, engagementWeight: Number(e.target.value) }))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Echo-Chamber Filter ({algorithmSettings.echoChamberFilter}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={algorithmSettings.echoChamberFilter}
                onChange={(e) => setAlgorithmSettings((s) => ({ ...s, echoChamberFilter: Number(e.target.value) }))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Encrypted Privacy Bonus ({algorithmSettings.decryptedPrivacyRank}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={algorithmSettings.decryptedPrivacyRank}
                onChange={(e) => setAlgorithmSettings((s) => ({ ...s, decryptedPrivacyRank: Number(e.target.value) }))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Post Composer */}
      <form onSubmit={handleCreatePost} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Broadcast an encrypted or public message to the Brio network..."
          rows={3}
          className="w-full p-3 bg-slate-950 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setEncryptPost(!encryptPost)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              encryptPost
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {encryptPost ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{encryptPost ? 'AES-GCM Encrypted Post' : 'Public Post'}</span>
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Post</span>
          </button>
        </div>
      </form>

      {/* Feed Stream */}
      <div className="space-y-4">
        {rankedPosts.map((post) => {
          const isDecrypted = decryptedCache[post.id];

          return (
            <div key={post.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={post.authorAvatar} alt={post.authorName} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{post.authorName}</h4>
                    <p className="text-[11px] text-slate-400">{post.authorHandle} • {post.timestamp}</p>
                  </div>
                </div>

                {post.isEncrypted && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-semibold text-emerald-400">
                    <ShieldCheck className="w-3 h-3" /> Encrypted Payload
                  </span>
                )}
              </div>

              {/* Post Body */}
              <div className="text-xs text-slate-200 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                {post.isEncrypted ? (
                  isDecrypted ? (
                    <div className="space-y-1">
                      <p className="text-emerald-300 font-medium">{isDecrypted}</p>
                      <p className="text-[10px] text-slate-400 font-mono">✅ Decrypted via local Master Key</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-slate-400 font-mono italic">{post.content}</p>
                      <button
                        onClick={() => handleDecryptPost(post.id)}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[11px] rounded-lg shadow transition-all shrink-0"
                      >
                        Decrypt Payload
                      </button>
                    </div>
                  )
                ) : (
                  <p>{post.content}</p>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center gap-6 pt-1 text-slate-400 text-xs font-medium">
                <button
                  onClick={() => toggleLikePost(post.id)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    post.userLiked ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.userLiked ? 'fill-rose-400' : ''}`} />
                  <span>{post.likes}</span>
                </button>

                <button className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentsCount}</span>
                </button>

                <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>{post.shares}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
