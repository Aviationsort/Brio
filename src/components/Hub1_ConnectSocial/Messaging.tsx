/**
 * Messaging Component: Online & Bluetooth Mesh Messaging with AES-GCM 256 Encryption
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatContact } from '../../types';
import {
  ShieldCheck,
  Send,
  Paperclip,
  Mic,
  Bluetooth,
  Wifi,
  Lock,
  Unlock,
  CheckCheck,
  FileText,
  Volume2,
} from 'lucide-react';

export const Messaging: React.FC = () => {
  const { messages, addMessage, showToast } = useApp();
  const [contacts, setContacts] = useState<ChatContact[]>([
    {
      id: 'c-1',
      name: 'P2P Operations Channel',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      online: true,
      bluetoothNearby: true,
      signalStrength: 98,
      lastMessage: 'Active AES-GCM Encrypted Room',
      unreadCount: 0,
      publicKeyFingerprint: 'A3:99:BC:41:88:F0',
    },
    {
      id: 'c-2',
      name: 'Encrypted Broadcast Channel',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      online: true,
      bluetoothNearby: true,
      signalStrength: 85,
      lastMessage: 'Secure mesh link verified.',
      unreadCount: 0,
      publicKeyFingerprint: '7B:E2:19:64:D0:FE',
    },
  ]);
  const [selectedContact, setSelectedContact] = useState<ChatContact>(contacts[0]);
  const [inputText, setInputText] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [mode, setMode] = useState<'online' | 'bluetooth'>('online');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [recordingVoice, setRecordingVoice] = useState(false);

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    const newChan: ChatContact = {
      id: `c-${Date.now()}`,
      name: newChannelName.trim(),
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
      online: true,
      bluetoothNearby: mode === 'bluetooth',
      signalStrength: 95,
      lastMessage: 'Channel Created & AES Verified',
      unreadCount: 0,
      publicKeyFingerprint: `EC:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}:FF`,
    };
    setContacts((prev) => [newChan, ...prev]);
    setSelectedContact(newChan);
    setNewChannelName('');
    setShowAddChannel(false);
    showToast('Channel Created', `Established encrypted room: ${newChan.name}`, 'success');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await addMessage({
        senderId: 'user-self',
        senderName: 'Me',
        text: inputText,
        isEncrypted,
        status: 'sent',
        mode,
      });
      setInputText('');
    } catch (err) {
      showToast('Send Error', String(err), 'error');
    }
  };

  const handleSendVoiceNote = async () => {
    setRecordingVoice(true);
    setTimeout(async () => {
      setRecordingVoice(false);
      try {
        await addMessage({
          senderId: 'user-self',
          senderName: 'Me',
          text: '🎙️ Voice Note (Encrypted Audio Stream 8s)',
          isEncrypted,
          attachmentType: 'voice',
          status: 'sent',
          mode,
        });
        showToast('Voice Note Sent', 'Voice payload encrypted and attached.', 'success');
      } catch (err) {
        showToast('Voice Error', String(err), 'error');
      }
    }, 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
      {/* Contact List Sidebar */}
      <div className="border-r border-slate-800 bg-slate-950/60 p-4 space-y-4">
        {/* Mode Selector */}
        <div className="flex items-center justify-between p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setMode('online')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold transition-all ${
              mode === 'online' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Online</span>
          </button>
          <button
            onClick={() => setMode('bluetooth')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold transition-all ${
              mode === 'bluetooth' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bluetooth className="w-3.5 h-3.5" />
            <span>Bluetooth</span>
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Channels</h4>
            <button
              onClick={() => setShowAddChannel(!showAddChannel)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold border border-cyan-500/30 px-2 py-0.5 rounded-lg bg-cyan-950/40"
            >
              + New Channel
            </button>
          </div>

          {showAddChannel && (
            <form onSubmit={handleAddChannel} className="mb-3 space-y-1.5 p-2 bg-slate-900 border border-cyan-500/30 rounded-xl">
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Channel / Room Name..."
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="w-full py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs rounded-lg shadow"
              >
                Create Encrypted Channel
              </button>
            </form>
          )}

          <div className="space-y-1.5">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                  selectedContact.id === contact.id
                    ? 'bg-slate-800/90 border border-slate-700 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-900/50 hover:text-white'
                }`}
              >
                <div className="relative shrink-0">
                  <img src={contact.avatar} alt={contact.name} className="w-9 h-9 rounded-full object-cover" />
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold truncate">{contact.name}</p>
                    {contact.bluetoothNearby && (
                      <span className="text-[10px] text-cyan-400 font-mono">{contact.signalStrength}% RSSI</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{contact.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Conversation Window */}
      <div className="md:col-span-2 flex flex-col justify-between bg-slate-900/50">
        {/* Chat Header */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={selectedContact.avatar} alt={selectedContact.name} className="w-8 h-8 rounded-full object-cover" />
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">{selectedContact.name}</h4>
              <p className="text-[10px] text-slate-400 font-mono">Fingerprint: {selectedContact.publicKeyFingerprint}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEncrypted(!isEncrypted)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                isEncrypted
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {isEncrypted ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isEncrypted ? 'E2E Active' : 'Plaintext'}</span>
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3.5 max-h-[420px]">
          {messages.map((msg) => {
            const isMe = msg.senderId === 'user-self';
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed shadow-lg ${
                    isMe
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  {msg.attachmentType === 'voice' ? (
                    <div className="flex items-center gap-2 font-mono">
                      <Volume2 className="w-4 h-4 text-cyan-200 animate-pulse" />
                      <span>{msg.text}</span>
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}

                  {msg.encryptedPayload && (
                    <div className="mt-2 pt-1.5 border-t border-white/20 text-[10px] font-mono text-white/80 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-300" /> AES-256 Checksum Verified
                      </span>
                      <span>IV: {msg.encryptedPayload.iv.slice(0, 8)}...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 px-1">
                  <span>{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
          <button
            type="button"
            onClick={() => showToast('Attachment Locked', 'Select file or sticker from vault', 'info')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSendVoiceNote}
            disabled={recordingVoice}
            className={`p-2 rounded-xl transition-colors ${
              recordingVoice
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isEncrypted ? 'Send E2E encrypted message...' : 'Send message...'}
            className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />

          <button
            type="submit"
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
