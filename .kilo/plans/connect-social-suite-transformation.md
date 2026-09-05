# Brio Connect & Social Suite — Transformation Plan

## Current State Summary

**Messaging:** Functional shell but largely cosmetic. No real threading, no message status progression, simulated voice notes, fake E2EE toggle, no contact persistence, no search-in-chat, no reply/forward, disappearing messages only filter UI (not cleanup).

**Social Feed:** Algorithm sliders are mostly theater (2 of 5 weights used). No media uploads, no comments system, no share/repost, no bookmarks, no hashtags/mentions, no user profiles/follow graph, no explore/discover.

**Architecture gaps:** Flat message array, no conversation model, no transport layer, no real identity, no media pipeline, no notification model.

---

## Phase 1 — Foundation (Prerequisites for everything else)

### 1.1 Identity & Presence Model
**Files:** `src/types/index.ts`, `src/context/AppContext.tsx`

- Add `UserProfile` type: `id`, `username`, `avatarUrl`, `status?: 'online'|'away'|'dnd'|'offline'`, `lastSeen?: string`, `bio?`
- Replace hardcoded `senderId: 'user-self'` with real `user.id` from context
- Add `presence` map in context: `Record<string, { status, lastSeen }>` keyed by userId
- Add heartbeat ping/pong via `setInterval` to update own presence

### 1.2 Conversation / Thread Model
**Files:** `src/types/index.ts`, `src/context/AppContext.tsx`

- New `Conversation` type: `id`, `participants: string[]`, `lastMessageId?, unreadCount, isPinned, isMuted, isGroup, createdAt`
- New `addConversation(participants, type)` in context
- Refactor `messages` from flat array to per-conversation routing:
  - Keep global `messages: ChatMessage[]` for DB persistence
  - Add `getMessagesForConversation(conversationId)` selector
- Update `Messaging.tsx` to create/select conversations instead of raw contacts

### 1.3 Message Status Progression
**Files:** `src/types/index.ts`, `src/context/AppContext.tsx`, `Messaging.tsx`

- Extend status: `'sending' | 'sent' | 'delivered' | 'read' | 'failed'`
- `addMessage` sets `'sending'` initially
- Simulate `delivered` after 500ms (optimistic)
- Simulate `read` when recipient "opens" conversation
- Add retry button for `failed` status

### 1.4 Disappearing Messages Auto-Purge
**Files:** `src/context/AppContext.tsx`

- Add `useEffect` sweep that runs every 1s, removing messages where `disappearingAt < now`
- This prevents unbounded array growth

### 1.5 Media Pipeline
**Files:** `src/utils/mediaManager.ts` (new), `src/context/AppContext.tsx`

- New `mediaManager` utility:
  - `fileToDataUrl(file)` — converts blobs to base64 for DB persistence
  - `revokeBlobUrl(url)` — cleanup
  - `generateThumbnail(file)` — canvas-based image/video thumbnails
- Update `handleFileChange` in `Messaging.tsx` to use data URLs instead of blob URLs
- Add `linkPreview` extraction for URLs in messages

---

## Phase 2 — Messaging: Snapchat/WhatsApp-Grade

### 2.1 Reply / Quote
**Files:** `src/types/index.ts`, `Messaging.tsx`

- Add `replyTo?: { messageId, senderName, textSnippet }` to `ChatMessage`
- Long-press or hover on message → "Reply" button
- Reply bar appears above composer showing quoted message
- Sent message includes quoted snippet visually

### 2.2 Forward
**Files:** `src/types/index.ts`, `src/context/AppContext.tsx`, `Messaging.tsx`

- Add `forwardedFrom?: { messageId, senderName }` to `ChatMessage`
- Context menu on message → "Forward" → contact picker modal
- `forwardMessage(messageId, targetConversationId)` in context

### 2.3 Search in Chat
**Files:** `Messaging.tsx`, `src/context/AppContext.tsx`

- Wire the existing `<Search>` button in chat header
- Add `searchMessages(conversationId, query)` to context
- Highlight matching text in results
- Jump-to-message with scroll-to behavior

### 2.4 Real Typing Indicators (Remote)
**Files:** `src/types/index.ts`, `src/context/AppContext.tsx`, `Messaging.tsx`

- Move `isTyping` from `ChatMessage` to `ChatContact` (it's a presence signal, not a message property)
- `handleTyping` broadcasts via context: `setContactTyping(contactId, true)`
- Auto-clear after 3s timeout
- Show "typing..." with animated dots in chat header and contact list

### 2.5 Message Reactions (Full)
**Files:** `Messaging.tsx`

- Long-press or hover on any message → reaction picker (emoji grid)
- Show reaction pills below bubbles with counts
- Tap reaction pill to add/remove own reaction
- Store as `Map<messageId, Map<emoji, userId[]>>` in context

### 2.6 Voice Notes (Real)
**Files:** `Messaging.tsx`, `src/utils/mediaManager.ts`

- Replace `setTimeout` mock with `MediaRecorder` API
- Record audio blob → convert to data URL → attach as `attachmentType: 'voice'`
- Show waveform playback UI (canvas-based)
- Support playback speed, scrub

### 2.7 Contact Persistence & Details
**Files:** `src/context/AppContext.tsx`, `Messaging.tsx`

- Move `contacts` state into context as `conversations`
- Persist to `localStorage` + encrypted `.db` vault
- Add contact detail panel (avatar, status, encryption key, shared media count)
- Support blocking, clearing chat

### 2.8 Optimistic UI & Retry
**Files:** `Messaging.tsx`, `src/context/AppContext.tsx`

- Messages appear instantly with `'sending'` status
- Failed messages show retry icon + "Tap to retry"
- Network failure simulation with exponential backoff

### 2.9 Notifications System
**Files:** `src/types/index.ts`, `src/context/AppContext.tsx`, `ConnectSocialHub.tsx`

- New `Notification` type: `id, type, title, body, data?, read, timestamp`
- `notifications` array in context
- `addNotification()` used by messaging/social for new events
- Notification center dropdown from bell icon
- Badge counts on sub-tabs

---

## Phase 3 — Social Feed: Instagram-Grade

### 3.1 Fix the Algorithm
**Files:** `SocialFeed.tsx`

- Implement real ranking formula using ALL 5 weights:
  ```
  score = (likes * engagementWeight / 100)
        + (privacyRank * decryptedPrivacyRank / 100)
        + (recencyHoursAgo * recencyWeight / 100)  // inverse
        + (hasMedia ? mediaWeight / 100 : 0)
        - (echoChamberFilter / 100 * sameAuthorBonus)
  ```
- Add `For You` / `Following` tabs (requires follow graph)
- Show "Trending" section based on velocity (likes/hour)

### 3.2 Media Upload Pipeline
**Files:** `SocialFeed.tsx`, `src/utils/mediaManager.ts`, `src/context/AppContext.tsx`

- Composer gets `file input` + drag-and-drop
- Support multiple media per post (carousel)
- Generate thumbnails via canvas
- Convert to data URLs for persistence
- Show upload progress (simulated)

### 3.3 Comments System
**Files:** `src/types/index.ts`, `src/context/AppContext.tsx`, `SocialFeed.tsx`

- Replace `commentsCount: number` with `comments: Comment[]`
- New `Comment` type: `id, postId, authorName, authorAvatar, text, timestamp, likes`
- `addComment(postId, text)` in context
- Comment section below post (expandable)
- Reply to comments (nested or flat)

### 3.4 Share / Repost
**Files:** `SocialFeed.tsx`, `src/context/AppContext.tsx`

- Share opens contact/channel picker → forwards post
- Repost creates new post with `repostOf: originalPostId`
- Share count increments

### 3.5 Save / Bookmark
**Files:** `src/types/index.ts`, `src/context/AppContext.tsx`, `SocialFeed.tsx`

- Add `savedPosts: string[]` (post IDs) to context
- Bookmark icon on post cards
- "Saved" tab in feed

### 3.6 Hashtags & Mentions
**Files:** `SocialFeed.tsx`, `src/context/AppContext.tsx`

- Parse `#hashtag` and `@mention` from post text
- Clickable hashtags → filter feed by tag
- Clickable mentions → show user profile stub
- Extract and store in `hashtags[]` and `mentions[]` arrays

### 3.7 User Profiles & Follow Graph
**Files:** `src/types/index.ts`, `src/context/AppContext.tsx`, `SocialFeed.tsx`

- Add `UserProfile` type (if not done in Phase 1)
- Add `follows: Map<userId, userId[]>` in context
- `followUser(userId)` / `unfollowUser(userId)`
- Profile header on posts (avatar, name, follow button, post count)
- "Following" tab in feed

### 3.8 Stories / Highlights
**Files:** `src/types/index.ts`, `src/context/AppContext.tsx`, `SocialFeed.tsx`

- New `Story` type: `id, userId, mediaUrl, mediaType, timestamp, expiresAt, viewers?`
- Stories bar at top of feed (horizontal scroll)
- Tap to view full-screen story with progress bar
- Auto-expire after 24h
- "Your Story" creation

### 3.9 Explore / Trending
**Files:** `SocialFeed.tsx`

- New `Explore` tab alongside `For You` / `Following`
- Grid layout of trending media posts
- Category filters (Aviation, Tech, Cyber, Gaming)
- "Suggested for you" based on hashtags

### 3.10 Infinite Scroll
**Files:** `SocialFeed.tsx`

- Replace flat render with `IntersectionObserver`-based pagination
- Load 10 posts at a time
- Show loading skeleton at bottom

### 3.11 Post Actions
**Files:** `SocialFeed.tsx`, `src/context/AppContext.tsx`

- Edit post (within 15 min window)
- Delete post with confirmation
- Report post (opens report modal)
- Copy link / share to external

---

## Phase 4 — Cross-Cutting Improvements

### 4.1 Real-Time Transport (Simulated)
**Files:** `src/context/AppContext.tsx`, `Messaging.tsx`, `SocialFeed.tsx`

- Add `useRealtimeChannel` hook that uses `BroadcastChannel` API for same-origin cross-tab sync
- Fallback: `storage` event listener for cross-tab sync
- Simulates WebSocket delivery for demo purposes
- Messages appear in other tabs/windows in real-time

### 4.2 Notifications Dropdown
**Files:** `ConnectSocialHub.tsx`, `src/context/AppContext.tsx`

- Bell icon opens dropdown with notification list
- Group by type: "New message", "Like", "Comment", "Follow"
- Mark all as read / individual read
- Click notification → navigate to relevant conversation/post

### 4.3 Global Search
**Files:** `ConnectSocialHub.tsx`, `src/context/AppContext.tsx`

- Wire search input to filter messages, contacts, posts
- Tabs: "Messages", "Contacts", "Posts"
- Highlight matches
- Keyboard shortcut `⌘K` / `Ctrl+K`

### 4.4 Sub-tab Badge Counts
**Files:** `ConnectSocialHub.tsx`

- Messages tab: total unread across all conversations
- Social tab: new notifications count
- Calls tab: missed call count
- Badge styling with red dot/number

### 4.5 Empty States & Onboarding
**Files:** `Messaging.tsx`, `SocialFeed.tsx`

- First-open empty states with illustrations/icons
- "Start your first conversation" CTA
- "Create your first post" CTA
- Tooltips for key actions

### 4.6 Performance
- Split `Messaging.tsx` and `SocialFeed.tsx` into sub-components
- Use `React.memo` for message bubbles and post cards
- Virtualize message list if >100 messages
- Lazy-load emoji/sticker pickers

---

## Implementation Order

```
Week 1: Foundation (Phase 1.1–1.5)
  └── Identity, conversations, status progression, media pipeline

Week 2: Messaging Core (Phase 2.1–2.6)
  └── Reply, forward, search, typing, reactions, real voice

Week 3: Messaging Polish (Phase 2.7–2.9)
  └── Contact persistence, optimistic UI, notifications

Week 4: Social Core (Phase 3.1–3.4)
  └── Algorithm fix, media uploads, comments, share/repost

Week 5: Social Polish (Phase 3.5–3.8)
  └── Bookmarks, hashtags, profiles, stories

Week 6: Social Polish 2 (Phase 3.9–3.10) + Cross-Cutting (Phase 4)
  └── Explore, infinite scroll, post actions, real-time, global search
```

---

## Files to Create

| File | Purpose |
|---|---|
| `src/utils/mediaManager.ts` | File→dataURL, thumbnails, blob cleanup |
| `src/components/Hub1_ConnectSocial/ConversationList.tsx` | Sidebar conversation list |
| `src/components/Hub1_ConnectSocial/ChatHeader.tsx` | Active chat header |
| `src/components/Hub1_ConnectSocial/MessageBubble.tsx` | Single message bubble |
| `src/components/Hub1_ConnectSocial/Composer.tsx` | Message input bar |
| `src/components/Hub1_ConnectSocial/EmojiPicker.tsx` | Emoji grid |
| `src/components/Hub1_ConnectSocial/StickerPicker.tsx` | Sticker grid |
| `src/components/Hub1_ConnectSocial/ReactionPicker.tsx` | Reaction bar |
| `src/components/Hub1_ConnectSocial/ReplyBar.tsx` | Reply preview above composer |
| `src/components/Hub1_ConnectSocial/ForwardModal.tsx` | Contact picker for forwarding |
| `src/components/Hub1_ConnectSocial/CommentSection.tsx` | Post comments |
| `src/components/Hub1_ConnectSocial/StoryBar.tsx` | Stories horizontal scroll |
| `src/components/Hub1_ConnectSocial/StoryViewer.tsx` | Full-screen story viewer |
| `src/components/Hub1_ConnectSocial/ExploreGrid.tsx` | Explore/discover grid |
| `src/components/Hub1_ConnectSocial/ProfileHeader.tsx` | User profile card |
| `src/components/Hub1_ConnectSocial/NotificationsDropdown.tsx` | Notification center |

## Files to Modify

| File | Changes |
|---|---|
| `src/types/index.ts` | Add UserProfile, Conversation, Comment, Story, Notification types; extend ChatMessage, SocialPost |
| `src/context/AppContext.tsx` | Add conversations, notifications, presence, comments, follows, search; fix algorithm |
| `src/components/Hub1_ConnectSocial/ConnectSocialHub.tsx` | Wire global search, notification dropdown, sub-tab badges |
| `src/components/Hub1_ConnectSocial/Messaging.tsx` | Refactor into sub-components; add reply/forward/search/reactions/real voice |
| `src/components/Hub1_ConnectSocial/SocialFeed.tsx` | Fix algorithm; add media upload, comments, share, bookmarks, hashtags, stories, explore, infinite scroll |
| `src/components/Hub1_ConnectSocial/CallDialer.tsx` | Keep as-is or integrate into Messaging header |
| `src/components/Hub1_ConnectSocial/StickersVault.tsx` | Keep as-is; integrate sticker picker into composer |
| `src/index.css` | Add light-mode styles, KaiOS refinements, animation reductions |

---

## Non-Goals (Out of Scope)

- Real WebSocket backend (we'll simulate with BroadcastChannel + storage events)
- Real WebRTC voice/video calling (UI only)
- Real Web Bluetooth mesh (mode toggle stays as connectivity indicator)
- Server-side media hosting (all media stays local/dataURL)
- Real E2EE key exchange beyond existing AES-GCM (no Double Ratchet)
- Push notifications (use browser Notification API as fallback)

---

## Success Criteria

**Messaging:**
- Feels like WhatsApp: threaded conversations, real read receipts, reply/forward, working search, voice notes with waveform
- Feels like Snapchat: disappearing messages actually purge, sensitive content blur, sticker picker integrated
- Contacts persist across sessions
- Typing indicators feel alive

**Social Feed:**
- Feels like Instagram: media posts render, comments work, share/repost functional, bookmarks, hashtags clickable
- Algorithm actually uses all tunable weights
- Stories bar at top with full-screen viewer
- Explore grid with category filters
- Infinite scroll feels smooth
