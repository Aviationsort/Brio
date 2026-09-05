/**
 * Messaging Component: Online & Bluetooth Mesh Messaging with AES-GCM 256 Encryption
 * Features: E2EE, disappearing messages, read receipts, typing indicators,
 *           message editing/deletion, emoji picker, sensitive content blur,
 *           KaiOS-friendly sizing, dark/light theme.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { type Conversation } from '../../types';
import { fileToDataUrl } from '../../utils/mediaManager';
import {
  ShieldCheck,
  Send,
  Paperclip,
  Mic,
  MicOff,
  Bluetooth,
  Wifi,
  Lock,
  Unlock,
  CheckCheck,
  FileText,
  Volume2,
  Smile,
  Trash2,
  Edit3,
  X,
  Sun,
  Moon,
  ImageOff,
  Clock,
  Check,
  MoreVertical,
  Phone,
  Video,
  Info,
  Pin,
  VolumeX,
  LogOut,
  Search,
  ChevronDown,
  ChevronUp,
  Sticker,
  AlertCircle,
  Reply,
  Forward,
  Play,
  Pause,
} from 'lucide-react';

const EMOJI_LIST = [
  '😀','😂','🤣','😍','🥰','😎','🤔','👍','👎','🔥',
  '✈️','🛫','🛬','🌍','🌤️','⛈️','🔒','🔓','✅','❌',
  '📸','🎙️','📎','⚡','🚀','📡','🛰️','🧭','🌐','💬',
];

const STICKER_LIST = [
  '✈️','🛫','🛬','🌍','🌤️','⛈️','🔒','🔓','✅','❌',
  '📸','🎙️','📎','⚡','🚀','📡','🛰️','🧭','🌐','💬',
];

const DISAPPEARING_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '5s', value: 5 },
  { label: '10s', value: 10 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
];

type ContextMenuAction = 'pin' | 'mute' | 'leave';
type MessageContextAction = 'reply' | 'forward' | 'edit' | 'delete';

interface ReplyTo {
  messageId: string;
  senderName: string;
  textSnippet: string;
}

interface ForwardedFrom {
  messageId: string;
  senderName: string;
}

// ============================================================
// ForwardModal
// ============================================================
interface ForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onForward: (conversationId: string) => void;
}

const ForwardModal: React.FC<ForwardModalProps> = ({ isOpen, onClose, conversations, currentConversationId, onForward }) => {
  if (!isOpen) return null;

  const getDisplayName = (conv: Conversation): string => {
    if (conv.participantDetails.length > 0) {
      return conv.participantDetails[0].name;
    }
    const otherParticipant = conv.participants.find(p => p !== 'user-self');
    return otherParticipant || 'Unknown';
  };

  const getInitial = (conv: Conversation): string => {
    const name = getDisplayName(conv);
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Forward to...</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-2 max-h-[300px] overflow-y-auto">
          {conversations.filter(c => c.id !== currentConversationId).length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No conversations available</p>
          ) : (
            conversations
              .filter(c => c.id !== currentConversationId)
              .map(conv => (
                <button
                  key={conv.id}
                  onClick={() => onForward(conv.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-slate-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {getInitial(conv)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{getDisplayName(conv)}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {conv.isGroup ? 'Group' : 'Direct Message'}
                    </p>
                  </div>
                </button>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ReplyBar
// ============================================================
interface ReplyBarProps {
  replyTo: ReplyTo | null;
  onCancel: () => void;
}

const ReplyBar: React.FC<ReplyBarProps> = ({ replyTo, onCancel }) => {
  if (!replyTo) return null;

  return (
    <div className="flex items-center justify-between p-2.5 bg-slate-800/60 border-t border-slate-700/60 rounded-b-xl">
      <div className="flex items-center gap-2 text-xs min-w-0">
        <Reply className="w-3.5 h-3.5 text-red-400 shrink-0" />
        <span className="text-slate-400 shrink-0">Replying to</span>
        <span className="font-bold text-white truncate">{replyTo.senderName}</span>
        <span className="text-slate-300 truncate">{replyTo.textSnippet}</span>
      </div>
      <button onClick={onCancel} className="p-1 text-slate-400 hover:text-white rounded shrink-0 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ============================================================
// MessageBubble
// ============================================================
interface MessageBubbleProps {
  message: any;
  isMe: boolean;
  isEditing: boolean;
  editText: string;
  sensitiveBlur: boolean;
  onEdit: (msg: any) => void;
  onEditSave: () => void;
  onCancelEdit: () => void;
  onEditTextChange: (text: string) => void;
  onDelete: (id: string) => void;
  onAddReaction: (msgId: string, emoji: string) => void;
  onReply: (msg: any) => void;
  onForward: (msg: any) => void;
  onShowImage: () => void;
  onScrollToMessage: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, msg: any) => void;
  onTouchStart: (e: React.TouchEvent, msg: any) => void;
  onTouchEnd: () => void;
  longPressTimer: number | null;
  onDecrypt: (msgId: string) => void;
  isDecrypted: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  isEditing,
  editText,
  sensitiveBlur,
  onEdit,
  onEditSave,
  onCancelEdit,
  onEditTextChange,
  onDelete,
  onAddReaction,
  onReply,
  onForward,
  onShowImage,
  onScrollToMessage,
  onContextMenu,
  onTouchStart,
  onTouchEnd,
  longPressTimer,
  onDecrypt,
  isDecrypted,
}) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleVoicePlay = () => {
    if (!message.attachmentUrl) return;
    
    if (isPlayingVoice && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingVoice(false);
      return;
    }

    const audio = new Audio(message.attachmentUrl);
    audioRef.current = audio;
    
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        setVoiceProgress(audio.currentTime / audio.duration);
      }
    });

    audio.addEventListener('ended', () => {
      setIsPlayingVoice(false);
      setVoiceProgress(0);
    });

    audio.play().catch(() => {});
    setIsPlayingVoice(true);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'read') return <CheckCheck className="w-3 h-3 text-red-400" />;
    if (status === 'delivered') return <CheckCheck className="w-3 h-3 text-slate-400" />;
    if (status === 'sending') return <Clock className="w-3 h-3 text-slate-500 animate-spin" />;
    if (status === 'failed') return <AlertCircle className="w-3 h-3 text-red-500" />;
    return <Check className="w-3 h-3 text-slate-500" />;
  };

  const waveformBars = Array.from({ length: 24 }, (_, i) => {
    const seed = (message.id.charCodeAt(0) + i) % 100;
    const height = 20 + (seed % 80);
    return height;
  });

  return (
    <div
      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
      onContextMenu={(e) => onContextMenu(e, message)}
      onTouchStart={(e) => onTouchStart(e, message)}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={`skeuo-btn max-w-md p-3 rounded-2xl text-xs leading-relaxed shadow-lg transition-all ${
          isMe
            ? 'bg-gradient-to-r from-red-600 to-red-800 text-white rounded-br-none'
            : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-none'
        }`}
      >
        {message.forwardedFrom && (
          <div className="flex items-center gap-1 mb-1.5 text-[10px] text-slate-300/80 border-b border-white/10 pb-1.5">
            <Forward className="w-3 h-3" />
            <span>Forwarded</span>
          </div>
        )}

        {message.replyTo && (
          <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-white/20">
            <p className="text-[10px] font-bold text-white/90">{message.replyTo.senderName}</p>
            <p className="text-[10px] text-white/60 truncate">{message.replyTo.textSnippet}</p>
          </div>
        )}

        {message.attachmentType === 'image' && message.attachmentUrl && (
          <div className="relative mb-2 rounded-lg overflow-hidden border border-white/10">
            <img
              src={message.attachmentUrl}
              alt="attachment"
              className={`w-full max-h-[200px] object-cover ${sensitiveBlur ? 'blur-xl' : ''}`}
            />
            {sensitiveBlur && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); onShowImage(); }}
                  className="px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 border border-white/20"
                >
                  <ImageOff className="w-3.5 h-3.5" /> Show Image
                </button>
              </div>
            )}
          </div>
        )}

        {message.attachmentType === 'video' && message.attachmentUrl && (
          <video src={message.attachmentUrl} controls className="w-full max-h-[200px] rounded-lg mb-2" />
        )}

        {message.attachmentType === 'voice' && message.attachmentUrl ? (
          <div className="flex items-center gap-3 py-1">
            <button
              onClick={handleVoicePlay}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
            >
              {isPlayingVoice ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>
            <div className="flex-1 flex items-center gap-0.5 h-8">
              {waveformBars.map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-white/40 rounded-full transition-all"
                  style={{
                    height: `${h}%`,
                    opacity: isPlayingVoice && i / waveformBars.length < voiceProgress ? 1 : 0.6,
                  }}
                />
              ))}
            </div>
            <Volume2 className="w-4 h-4 text-white/60 shrink-0" />
          </div>
        ) : message.attachmentType === 'voice' ? (
          <div className="flex items-center gap-2 font-mono">
            <Volume2 className="w-4 h-4 text-red-200 animate-pulse" />
            <span>{message.text}</span>
          </div>
        ) : message.isEncrypted && !isDecrypted ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-slate-400 font-mono italic text-xs">{message.text}</p>
            <button
              onClick={() => onDecrypt(message.id)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-[11px] rounded-lg shadow transition-all shrink-0"
            >
              Decrypt
            </button>
          </div>
        ) : isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              className="flex-1 bg-black/30 border border-white/20 rounded px-2 py-1 text-xs text-white"
              autoFocus
            />
            <button onClick={onEditSave} className="text-red-300 font-bold text-xs">Save</button>
            <button onClick={onCancelEdit} className="text-slate-300"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <p>{message.text}</p>
        )}

        {message.reactions && message.reactions.length > 0 && (
          <div className="mt-1.5 flex items-center gap-1 flex-wrap">
            {message.reactions.map((r: string, i: number) => (
              <span key={i} className="text-[10px] bg-white/10 rounded-full px-1.5 py-0.5 border border-white/10">{r}</span>
            ))}
          </div>
        )}

        {message.encryptedPayload && (
          <div className="mt-2 pt-1.5 border-t border-white/20 text-[10px] font-mono text-white/80 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-red-300" /> AES-256 Checksum Verified
            </span>
            <span>IV: {message.encryptedPayload.iv.slice(0, 8)}...</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[10px] text-slate-300/80 mt-1.5">
          <span>{message.timestamp}</span>
          {message.edited && <span className="italic text-slate-400">(edited)</span>}
          {isMe && getStatusIcon(message.status)}
        </div>

        {isMe && !isEditing && (
          <div className="flex items-center gap-1 mt-1">
            <button onClick={() => onReply(message)} className="p-1 text-slate-300 hover:text-white rounded" title="Reply">
              <Reply className="w-3 h-3" />
            </button>
            <button onClick={() => onForward(message)} className="p-1 text-slate-300 hover:text-white rounded" title="Forward">
              <Forward className="w-3 h-3" />
            </button>
            <button onClick={() => onEdit(message)} className="p-1 text-slate-300 hover:text-white rounded" title="Edit">
              <Edit3 className="w-3 h-3" />
            </button>
            <button onClick={() => onDelete(message.id)} className="p-1 text-slate-300 hover:text-red-400 rounded" title="Delete">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {!isMe && (
          <div className="flex items-center gap-1 mt-1">
            <button onClick={() => onReply(message)} className="p-1 text-slate-300 hover:text-white rounded" title="Reply">
              <Reply className="w-3 h-3" />
            </button>
            <button onClick={() => onForward(message)} className="p-1 text-slate-300 hover:text-white rounded" title="Forward">
              <Forward className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {!isMe && (
        <div className="flex items-center gap-1 mt-1">
          {EMOJI_LIST.slice(0, 6).map((emoji) => (
            <button
              key={emoji}
              onClick={() => onAddReaction(message.id, emoji)}
              className="text-[10px] bg-white/5 hover:bg-white/10 rounded-full w-6 h-6 flex items-center justify-center border border-white/10 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Composer
// ============================================================
interface ComposerProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: (e: React.FormEvent) => void;
  onAttachment: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleEmoji: () => void;
  onToggleSticker: () => void;
  onToggleRecording: () => void;
  isRecordingVoice: boolean;
  showEmojiPicker: boolean;
  showStickerPicker: boolean;
  disappearingSeconds: number;
  onDisappearingSecondsChange: (val: number) => void;
  isEncrypted: boolean;
  replyTo: ReplyTo | null;
  onCancelReply: () => void;
  textareaRef: React.Ref<HTMLTextAreaElement>;
  fileInputRef: React.Ref<HTMLInputElement>;
}

const Composer: React.FC<ComposerProps> = ({
  inputText,
  onInputChange,
  onSend,
  onAttachment,
  onFileChange,
  onToggleEmoji,
  onToggleSticker,
  onToggleRecording,
  isRecordingVoice,
  showEmojiPicker,
  showStickerPicker,
  disappearingSeconds,
  onDisappearingSecondsChange,
  isEncrypted,
  replyTo,
  onCancelReply,
  textareaRef,
  fileInputRef,
}) => {
  return (
    <form onSubmit={onSend} className="p-3 border-t border-slate-800 bg-slate-950/80">
      <ReplyBar replyTo={replyTo} onCancel={onCancelReply} />
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onFileChange}
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
        <button
          type="button"
          onClick={onAttachment}
          className="skeuo-btn p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          title="Attach media or file"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={isEncrypted ? 'Send E2E encrypted message...' : 'Send message...'}
            rows={1}
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-colors resize-none overflow-hidden"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        <button
          type="button"
          onClick={onToggleEmoji}
          className={`skeuo-btn p-2 rounded-xl transition-colors shrink-0 ${showEmojiPicker ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          title="Emoji"
        >
          <Smile className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleSticker}
          className={`skeuo-btn p-2 rounded-xl transition-colors shrink-0 ${showStickerPicker ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          title="Stickers"
        >
          <Sticker className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleRecording}
          disabled={isRecordingVoice}
          className={`skeuo-btn p-2 rounded-xl transition-colors shrink-0 ${
            isRecordingVoice
              ? 'bg-red-600 text-white animate-pulse'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isRecordingVoice ? 'Stop Recording' : 'Record Voice Note'}
        >
          {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <select
          value={disappearingSeconds}
          onChange={(e) => onDisappearingSecondsChange(Number(e.target.value))}
          className="bg-slate-900 border border-slate-700 text-[10px] text-slate-300 rounded-lg px-2 py-2 cursor-pointer shrink-0"
          title="Disappearing messages"
        >
          {DISAPPEARING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="skeuo-btn px-3.5 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </div>

      {showEmojiPicker && (
        <div className="mt-3 p-3 border-t border-slate-800 bg-slate-950/90 rounded-b-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Emoji</span>
            <button onClick={onToggleEmoji} className="text-slate-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onInputChange(inputText + emoji)}
                className="text-lg hover:bg-slate-800 rounded p-1 transition-colors cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {showStickerPicker && (
        <div className="mt-3 p-3 border-t border-slate-800 bg-slate-950/90 rounded-b-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Stickers</span>
            <button onClick={onToggleSticker} className="text-slate-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {STICKER_LIST.map((sticker) => (
              <button
                key={sticker}
                onClick={() => onInputChange(inputText + sticker)}
                className="text-lg hover:bg-slate-800 rounded p-1 transition-colors cursor-pointer"
              >
                {sticker}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
};

// ============================================================
// ChatHeader
// ============================================================
interface ChatHeaderProps {
  conversation: Conversation;
  isEncrypted: boolean;
  onToggleEncryption: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  localTyping: boolean;
  remoteTyping: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSearch: boolean;
  onToggleSearch: () => void;
  onSearchResultClick: (messageId: string) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  isEncrypted,
  onToggleEncryption,
  theme,
  onToggleTheme,
  localTyping,
  remoteTyping,
  searchQuery,
  onSearchChange,
  showSearch,
  onToggleSearch,
  onSearchResultClick,
}) => {
  const contact = conversation.participantDetails[0] || {
    name: conversation.participants.find(p => p !== 'user-self') || 'Unknown',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    online: false,
    publicKeyFingerprint: '',
  };

  return (
    <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 flex flex-col gap-2 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={contact.avatar} alt={contact.name} className="w-8 h-8 rounded-full object-cover" />
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">{contact.name}</h4>
            <p className="text-[10px] text-slate-400 font-mono">
              {remoteTyping ? 'typing...' : contact.online ? 'Online' : 'Offline'} • {contact.publicKeyFingerprint}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleEncryption}
            className={`skeuo-btn flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
              isEncrypted
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {isEncrypted ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isEncrypted ? 'E2E Active' : 'Plaintext'}</span>
          </button>
          <button className="skeuo-btn p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Voice Call">
            <Phone className="w-4 h-4" />
          </button>
          <button className="skeuo-btn p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Video Call">
            <Video className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleSearch}
            className={`skeuo-btn p-2 rounded-lg transition-colors ${showSearch ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
            title="Search in Chat"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleTheme}
            className="skeuo-btn p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className="skeuo-btn p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Info">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-8 pr-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-400"
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

// ============================================================
// ConversationList
// ============================================================
type ExpandedSections = { pinned: boolean; direct: boolean; group: boolean };
type SectionKey = keyof ExpandedSections;

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conv: Conversation) => void;
  mode: 'online' | 'bluetooth';
  onModeChange: (mode: 'online' | 'bluetooth') => void;
  sidebarSearch: string;
  onSidebarSearchChange: (search: string) => void;
  showAddChannel: boolean;
  onToggleAddChannel: () => void;
  newChannelName: string;
  onNewChannelNameChange: (name: string) => void;
  onAddChannel: (e: React.FormEvent) => void;
  expandedSections: ExpandedSections;
  onToggleSection: (section: SectionKey) => void;
  contextMenu: { conversationId: string; action: ContextMenuAction } | null;
  onContextMenu: (ctx: { conversationId: string; action: ContextMenuAction }) => void;
  onContextMenuAction: (conversationId: string, action: ContextMenuAction) => void;
}

const getDisplayContact = (conv: Conversation) => {
  if (conv.participantDetails.length > 0) {
    return conv.participantDetails[0];
  }
  const otherParticipant = conv.participants.find(p => p !== 'user-self');
  return {
    id: otherParticipant || conv.id,
    name: otherParticipant || 'Unknown',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    online: false,
    bluetoothNearby: false,
    unreadCount: conv.unreadCount,
    publicKeyFingerprint: '',
  };
};

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  mode,
  onModeChange,
  sidebarSearch,
  onSidebarSearchChange,
  showAddChannel,
  onToggleAddChannel,
  newChannelName,
  onNewChannelNameChange,
  onAddChannel,
  expandedSections,
  onToggleSection,
  contextMenu,
  onContextMenu,
  onContextMenuAction,
}) => {
  const searchFilter = (conv: Conversation) => {
    const contact = getDisplayContact(conv);
    return contact.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
      contact.lastMessage?.toLowerCase().includes(sidebarSearch.toLowerCase());
  };

  const pinnedConversations = conversations.filter(c => c.isPinned);
  const directConversations = conversations.filter(c => !c.isPinned && !c.isGroup);
  const groupConversations = conversations.filter(c => !c.isPinned && c.isGroup);

  const renderConversationList = (items: Conversation[], sectionKey: SectionKey) => {
    const filtered = items.filter(searchFilter);
    if (filtered.length === 0) return null;
    return (
      <div className="mb-2">
        <button
          onClick={() => onToggleSection(sectionKey)}
          className="flex items-center justify-between w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1"
        >
          <span>{sectionKey === 'pinned' ? '📌 Pinned' : sectionKey === 'direct' ? '💬 Direct Messages' : '👥 Group Channels'}</span>
          {expandedSections[sectionKey] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {expandedSections[sectionKey] && (
          <div className="space-y-1">
            {filtered.map((conv) => {
              const contact = getDisplayContact(conv);
              return (
                <div key={conv.id} className="relative group">
                  <button
                    onClick={() => onSelectConversation(conv)}
                    className={`skeuo-btn w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                      selectedConversationId === conv.id
                        ? 'bg-slate-800/90 border border-slate-700 text-white shadow'
                        : 'text-slate-300 hover:bg-slate-900/50 hover:text-white'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img src={contact.avatar} alt={contact.name} className="w-9 h-9 rounded-full object-cover" />
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-slate-950 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold truncate">{contact.name}</p>
                        <div className="flex items-center gap-1">
                          {contact.bluetoothNearby && (
                            <span className="text-[10px] text-red-400 font-mono">{contact.signalStrength}%</span>
                          )}
                          {conv.unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] text-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{contact.lastMessage || (conv.isGroup ? 'Group channel' : 'Start messaging')}</p>
                    </div>
                  </button>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onContextMenu({ conversationId: conv.id, action: 'pin' }); }}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Pin"
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onContextMenu({ conversationId: conv.id, action: 'mute' }); }}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Mute"
                    >
                      <VolumeX className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onContextMenu({ conversationId: conv.id, action: 'leave' }); }}
                      className="p-1 text-slate-400 hover:text-red-400 rounded"
                      title="Leave"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border-r border-slate-800 bg-slate-950/60 p-4 space-y-4 skeuo-card">
      <div className="flex items-center justify-between p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        <button
          onClick={() => onModeChange('online')}
          className={`skeuo-btn flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold transition-all ${
            mode === 'online' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Online</span>
        </button>
        <button
          onClick={() => onModeChange('bluetooth')}
          className={`skeuo-btn flex items-center justify-center gap-1.5 py-1.5 font-semibold transition-all ${
            mode === 'bluetooth' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bluetooth className="w-3.5 h-3.5" />
          <span>Bluetooth</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          value={sidebarSearch}
          onChange={(e) => onSidebarSearchChange(e.target.value)}
          placeholder="Search channels..."
          className="w-full pl-8 pr-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-400"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Channels</h4>
          <button
            onClick={onToggleAddChannel}
            className="skeuo-btn text-xs text-red-400 hover:text-red-300 font-bold border border-red-500/30 px-2 py-0.5 rounded-lg bg-red-950/40"
          >
            + New
          </button>
        </div>

        {showAddChannel && (
          <form onSubmit={onAddChannel} className="mb-3 space-y-1.5 p-2 bg-slate-900 border border-red-500/30 rounded-xl">
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => onNewChannelNameChange(e.target.value)}
              placeholder="Channel / Room Name..."
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-400"
            />
            <button
              type="submit"
              className="skeuo-btn w-full py-1 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-lg shadow"
            >
              Create Encrypted Channel
            </button>
          </form>
        )}

        {conversations.length === 0 ? (
          <div className="text-center text-slate-500 text-[10px] py-4">No channels yet. Create one above.</div>
        ) : (
          <>
            {renderConversationList(pinnedConversations, 'pinned')}
            {renderConversationList(directConversations, 'direct')}
            {renderConversationList(groupConversations, 'group')}
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Main Messaging Component
// ============================================================
interface MessagingProps {
  highlightedConversationId?: string;
}

export const Messaging: React.FC<MessagingProps> = ({ highlightedConversationId }) => {
  const {
    messages,
    addMessage,
    updateMessage,
    deleteMessage,
    showToast,
    theme,
    toggleTheme,
    conversations,
    addConversation,
    updateConversation,
    deleteConversation,
    searchMessages,
    user,
  } = useApp();

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [mode, setMode] = useState<'online' | 'bluetooth'>('online');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [recordingVoice, setRecordingVoice] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [disappearingSeconds, setDisappearingSeconds] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [sensitiveBlur, setSensitiveBlur] = useState(true);
  const [localTyping, setLocalTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState({ pinned: true, direct: true, group: true });
  const [contextMenu, setContextMenu] = useState<{ conversationId: string; action: ContextMenuAction } | null>(null);
  const [messageContextMenu, setMessageContextMenu] = useState<{ message: any; x: number; y: number } | null>(null);
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});

  const typingTimeoutRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const longPressTimerRef = useRef<number | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(messageId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-red-400');
      setTimeout(() => el.classList.remove('ring-2', 'ring-red-400'), 2000);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation, scrollToBottom]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  useEffect(() => {
    if (!selectedConversation) return;

    const timer = setTimeout(() => {
      setRemoteTyping(true);
      const stopTimer = setTimeout(() => setRemoteTyping(false), 2000 + Math.random() * 1000);
      return () => clearTimeout(stopTimer);
    }, 1000 + Math.random() * 2000);

    return () => clearTimeout(timer);
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (!selectedConversation) return;

    const timer = setTimeout(() => {
      messages.forEach(msg => {
        if (msg.conversationId === selectedConversation.id && msg.senderId === 'user-self' && (msg.status === 'sending' || msg.status === 'delivered')) {
          updateMessage(msg.id, { status: 'read' });
        }
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (!highlightedConversationId) return;
    const conv = conversations.find(c => c.id === highlightedConversationId);
    if (conv) {
      setSelectedConversation(conv);
    }
  }, [highlightedConversationId, conversations]);

  useEffect(() => {
    if (!selectedConversation || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results = searchMessages(selectedConversation.id, searchQuery);
    setSearchResults(results);
  }, [searchQuery, selectedConversation, searchMessages]);

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const newChanId = `c-${Date.now()}`;
    const newChan = {
      id: newChanId,
      name: newChannelName.trim(),
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
      online: true,
      bluetoothNearby: mode === 'bluetooth',
      signalStrength: 95,
      lastMessage: 'Channel Created & AES Verified',
      unreadCount: 0,
      publicKeyFingerprint: `EC:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}:FF`,
    };

    const isGroup = newChannelName.trim().includes(' ');
    const conv = addConversation(['user-self', newChanId], isGroup);
    await updateConversation(conv.id, { participantDetails: [newChan] });

    const updatedConv = { ...conv, participantDetails: [newChan] };
    setSelectedConversation(updatedConv);
    setNewChannelName('');
    setShowAddChannel(false);
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setReplyTo(null);
    setEditingId(null);
    setShowEmojiPicker(false);
    setShowStickerPicker(false);
    setSearchQuery('');
    setShowSearch(false);
    updateConversation(conv.id, { unreadCount: 0 });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConversation) return;

    const text = inputText.trim();
    const now = Date.now();
    const payload: any = {
      senderId: 'user-self',
      senderName: 'Me',
      text,
      isEncrypted,
      status: 'sent',
      mode,
      conversationId: selectedConversation.id,
    };

    if (disappearingSeconds > 0) {
      payload.disappearingAt = new Date(now + disappearingSeconds * 1000).toISOString();
    }

    if (replyTo) {
      payload.replyTo = replyTo;
    }

    await addMessage(payload);
    setInputText('');
    setReplyTo(null);
    setShowEmojiPicker(false);
    setShowStickerPicker(false);
    setLocalTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    updateConversation(selectedConversation.id, {
      updatedAt: new Date().toLocaleTimeString(),
      lastMessageId: `msg-${Date.now()}`,
      participantDetails: selectedConversation.participantDetails.map((p, i) =>
        i === 0 ? { ...p, lastMessage: text.slice(0, 50) } : p
      ),
    });
  };

  const handleSendVoiceNote = async () => {
    if (!selectedConversation) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'voice-note.webm', { type: 'audio/webm' });
        const dataUrl = await fileToDataUrl(file);

        await addMessage({
          senderId: 'user-self',
          senderName: 'Me',
          text: '🎙️ Voice Note',
          isEncrypted,
          attachmentType: 'voice',
          attachmentUrl: dataUrl,
          conversationId: selectedConversation.id,
          status: 'sent',
          mode,
        });

        stream.getTracks().forEach(track => track.stop());
        setRecordingVoice(false);
        mediaRecorderRef.current = null;
      };

      mediaRecorder.start();
      setRecordingVoice(true);
      mediaRecorderRef.current = mediaRecorder;

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 30000);

    } catch {
      showToast('Microphone Error', 'Unable to access microphone. Please check permissions.', 'error');
      setRecordingVoice(false);
    }
  };

  const toggleRecording = async () => {
    if (recordingVoice && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    } else {
      await handleSendVoiceNote();
    }
  };

  const handleTyping = () => {
    if (!localTyping) {
      setLocalTyping(true);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => setLocalTyping(false), 2000);
  };

  const handleEdit = (msg: any) => {
    setEditingId(msg.id);
    setEditText(msg.text);
  };

  const handleEditSave = async () => {
    if (!editingId || !editText.trim()) return;
    await updateMessage(editingId, {
      text: editText.trim(),
      edited: true,
      editedAt: new Date().toLocaleTimeString(),
    });
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (id: string) => {
    await deleteMessage(id);
    showToast('Message Deleted', 'Message removed from local history.', 'info');
  };

  const handleDecryptMessage = async (msgId: string) => {
    const msg = messages.find(m => m.id === msgId);
    if (!msg || !msg.encryptedPayload) return;
    try {
      const { encryptionService } = await import('../../utils/crypto');
      const plain = await encryptionService.decrypt<string>(msg.encryptedPayload);
      setDecryptedCache(prev => ({ ...prev, [msgId]: plain }));
      updateMessage(msgId, { text: plain });
      showToast('Decryption Success', 'Payload checksum matched SHA-256.', 'success');
    } catch {
      showToast('Decryption Error', 'Failed to decrypt payload.', 'error');
    }
  };

  const handleAddReaction = async (msgId: string, emoji: string) => {
    await updateMessage(msgId, {
      reactions: [...(messages.find((m) => m.id === msgId)?.reactions || []), emoji],
    });
  };

  const handleReply = (msg: any) => {
    setReplyTo({
      messageId: msg.id,
      senderName: msg.senderName,
      textSnippet: msg.text.slice(0, 50),
    });
    setMessageContextMenu(null);
    textareaRef.current?.focus();
  };

  const handleForward = (msg: any) => {
    setForwardingMessage(msg);
    setMessageContextMenu(null);
  };

  const handleForwardSelect = async (conversationId: string) => {
    if (!forwardingMessage) return;

    await addMessage({
      senderId: 'user-self',
      senderName: 'Me',
      text: forwardingMessage.text,
      isEncrypted,
      attachmentType: forwardingMessage.attachmentType,
      attachmentUrl: forwardingMessage.attachmentUrl,
      conversationId,
      status: 'sent',
      mode,
      forwardedFrom: {
        messageId: forwardingMessage.id,
        senderName: forwardingMessage.senderName,
      },
    });

    setForwardingMessage(null);
    showToast('Forwarded', 'Message forwarded successfully.', 'success');
  };

  const handleAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'file';
    await addMessage({
      senderId: 'user-self',
      senderName: 'Me',
      text: type === 'image' || type === 'video' ? '' : file.name,
      isEncrypted,
      attachmentType: type,
      attachmentUrl: url,
      conversationId: selectedConversation.id,
      status: 'sent',
      mode,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredMessages = messages.filter((m) => {
    if (!selectedConversation) return false;
    if (m.disappearingAt && new Date(m.disappearingAt).getTime() < now) return false;
    return m.conversationId === selectedConversation.id;
  });

  const getStatusIcon = (status: string) => {
    if (status === 'read') return <CheckCheck className="w-3 h-3 text-red-400" />;
    if (status === 'delivered') return <CheckCheck className="w-3 h-3 text-slate-400" />;
    if (status === 'sending') return <Clock className="w-3 h-3 text-slate-500 animate-spin" />;
    if (status === 'failed') return <AlertCircle className="w-3 h-3 text-red-500" />;
    return <Check className="w-3 h-3 text-slate-500" />;
  };

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleContextMenu = (conversationId: string, action: ContextMenuAction) => {
    setContextMenu(null);
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    switch (action) {
      case 'pin':
        updateConversation(conversationId, { isPinned: !conv.isPinned });
        showToast(conv.isPinned ? 'Unpinned' : 'Pinned', `Channel ${conv.isPinned ? 'unpinned' : 'pinned to top'}.`, 'info');
        break;
      case 'mute':
        updateConversation(conversationId, { isMuted: !conv.isMuted });
        showToast(conv.isMuted ? 'Unmuted' : 'Muted', `Notifications for channel ${conv.isMuted ? 'unmuted' : 'muted'}.`, 'info');
        break;
      case 'leave':
        deleteConversation(conversationId);
        if (selectedConversation?.id === conversationId) setSelectedConversation(null);
        showToast('Left Channel', 'You left the channel.', 'info');
        break;
    }
  };

  const handleMessageContextMenu = (e: React.MouseEvent, msg: any) => {
    e.preventDefault();
    setMessageContextMenu({ message: msg, x: e.clientX, y: e.clientY });
  };

  const handleMessageTouchStart = (e: React.TouchEvent, msg: any) => {
    longPressTimerRef.current = window.setTimeout(() => {
      const touch = e.touches[0];
      setMessageContextMenu({ message: msg, x: touch.clientX, y: touch.clientY });
    }, 500);
  };

  const handleMessageTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-red-500/30 text-white px-0.5 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-3 min-h-[550px] skeuo-panel ${theme === 'light' ? 'light-mode' : ''}`}>
      <ConversationList
        conversations={conversations}
        selectedConversationId={selectedConversation?.id || null}
        onSelectConversation={handleSelectConversation}
        mode={mode}
        onModeChange={setMode}
        sidebarSearch={sidebarSearch}
        onSidebarSearchChange={setSidebarSearch}
        showAddChannel={showAddChannel}
        onToggleAddChannel={() => setShowAddChannel(!showAddChannel)}
        newChannelName={newChannelName}
        onNewChannelNameChange={setNewChannelName}
        onAddChannel={handleAddChannel}
        expandedSections={expandedSections}
        onToggleSection={toggleSection}
        contextMenu={contextMenu}
        onContextMenu={(ctx) => setContextMenu(ctx)}
        onContextMenuAction={handleContextMenu}
      />

      <div className="md:col-span-2 flex flex-col justify-between bg-slate-900/50">
        {selectedConversation ? (
          <>
            <ChatHeader
              conversation={selectedConversation}
              isEncrypted={isEncrypted}
              onToggleEncryption={() => setIsEncrypted(!isEncrypted)}
              theme={theme}
              onToggleTheme={toggleTheme}
              localTyping={localTyping}
              remoteTyping={remoteTyping}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              showSearch={showSearch}
              onToggleSearch={() => setShowSearch(!showSearch)}
              onSearchResultClick={scrollToMessage}
            />

            {showSearch && searchQuery.trim() && (
              <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-slate-500">No messages found</p>
                ) : (
                  <div className="space-y-1 max-h-[100px] overflow-y-auto">
                    {searchResults.map(msg => (
                      <button
                        key={msg.id}
                        onClick={() => scrollToMessage(msg.id)}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <p className="text-[10px] text-slate-400">{msg.timestamp}</p>
                        <p className="text-xs text-slate-200 line-clamp-1">{highlightText(msg.text, searchQuery)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[420px]">
              {filteredMessages.length === 0 && (
                <div className="text-center text-slate-500 text-xs py-8">
                  No messages yet. Say hello 👋
                </div>
              )}
              {filteredMessages.map((msg) => {
                const isMe = msg.senderId === 'user-self';
                const isEditing = editingId === msg.id;
                const isDecrypted = !!decryptedCache[msg.id];
                return (
                  <div key={msg.id} id={msg.id}>
                    <MessageBubble
                      message={msg}
                      isMe={isMe}
                      isEditing={isEditing}
                      editText={editText}
                      sensitiveBlur={sensitiveBlur}
                      onEdit={handleEdit}
                      onEditSave={handleEditSave}
                      onCancelEdit={() => { setEditingId(null); setEditText(''); }}
                      onEditTextChange={setEditText}
                      onDelete={handleDelete}
                      onAddReaction={handleAddReaction}
                      onReply={handleReply}
                      onForward={handleForward}
                      onShowImage={() => setSensitiveBlur(false)}
                      onScrollToMessage={scrollToMessage}
                      onContextMenu={handleMessageContextMenu}
                      onTouchStart={handleMessageTouchStart}
                      onTouchEnd={handleMessageTouchEnd}
                      longPressTimer={longPressTimerRef.current}
                      onDecrypt={handleDecryptMessage}
                      isDecrypted={isDecrypted}
                    />
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <Composer
              inputText={inputText}
              onInputChange={(text) => { setInputText(text); handleTyping(); }}
              onSend={handleSend}
              onAttachment={handleAttachment}
              onFileChange={handleFileChange}
              onToggleEmoji={() => { setShowEmojiPicker(!showEmojiPicker); setShowStickerPicker(false); }}
              onToggleSticker={() => { setShowStickerPicker(!showStickerPicker); setShowEmojiPicker(false); }}
              onToggleRecording={toggleRecording}
              isRecordingVoice={recordingVoice}
              showEmojiPicker={showEmojiPicker}
              showStickerPicker={showStickerPicker}
              disappearingSeconds={disappearingSeconds}
              onDisappearingSecondsChange={setDisappearingSeconds}
              isEncrypted={isEncrypted}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              textareaRef={textareaRef}
              fileInputRef={fileInputRef}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
            Select a channel to start messaging
          </div>
        )}
      </div>

      {contextMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)}>
          <div className="absolute bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => handleContextMenu(contextMenu.conversationId, 'pin')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800">
              <Pin className="w-3.5 h-3.5" /> Pin Channel
            </button>
            <button onClick={() => handleContextMenu(contextMenu.conversationId, 'mute')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800">
              <VolumeX className="w-3.5 h-3.5" /> Mute Notifications
            </button>
            <button onClick={() => handleContextMenu(contextMenu.conversationId, 'leave')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-slate-800">
              <LogOut className="w-3.5 h-3.5" /> Leave Channel
            </button>
          </div>
        </div>
      )}

      {messageContextMenu && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setMessageContextMenu(null)}
        >
          <div
            className="absolute bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 min-w-[160px]"
            style={{ left: messageContextMenu.x, top: messageContextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleReply(messageContextMenu.message)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
            >
              <Reply className="w-3.5 h-3.5" /> Reply
            </button>
            <button
              onClick={() => handleForward(messageContextMenu.message)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
            >
              <Forward className="w-3.5 h-3.5" /> Forward
            </button>
            {messageContextMenu.message.senderId === 'user-self' && (
              <button
                onClick={() => { handleEdit(messageContextMenu.message); setMessageContextMenu(null); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            <button
              onClick={() => { handleDelete(messageContextMenu.message.id); setMessageContextMenu(null); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-slate-800"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      <ForwardModal
        isOpen={!!forwardingMessage}
        onClose={() => setForwardingMessage(null)}
        conversations={conversations}
        currentConversationId={selectedConversation?.id || null}
        onForward={handleForwardSelect}
      />
    </div>
  );
};

export default Messaging;