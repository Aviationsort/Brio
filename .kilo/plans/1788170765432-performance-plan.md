# Performance Implementation Plan

## Scope
Implement Fix 1, Fix 3, Fix 4, Fix 5, and Fix 6.
Fix 2 is modified: keep photos at original quality (do NOT downscale/compress thumbnails).

---

## Fix 1 — Remove import popup + batch progress updates

**Files to edit:**
- `src/components/Hub5_AviationTelemetry/MyPlanePicsSuite.tsx`

**What was already done:**
- The folder-choice modal (`showFolderChoiceModal`) was removed in a previous pass.
- `importFolder` was added and `handleFolderInputChange` now calls it directly.

**What still needs to be done:**

1. In `processFilesInChunks` (around line 94):
   - Remove the per-file `onProgress(...)` call inside `Promise.all`.
   - Keep only the per-chunk `onProgress(...)` call after `Promise.all` resolves.
   - This cuts progress dispatches from N to N/32.

2. In `processUploadedFiles` (around line 908):
   - Buffer progress updates in a ref.
   - Flush to `setImportProgress` / `setImportStatusText` at most once per 200 ms or once per 32 files.
   - This cuts dispatches from 4× per file to ≤1× per batch.

3. Remove the unused `showFolderChoiceModal`, `executeFolderUpload`, `pendingFolderFiles` state/setters if any remain.

**Validation:**
- Import a folder with 500+ images.
- FPS stays ≥ 50 during import.
- Progress bar updates smoothly (no jank).
- No "browser unresponsive" warnings.

---

## Fix 2 (Modified) — Keep photos in original quality

**What changed from the original plan:**
- Do NOT reduce thumbnail quality.
- Keep the thumbnail generation for grid performance, but use `canvas.toDataURL('image/jpeg', 1.0)` instead of `0.7` so thumbnails stay at maximum quality.

**File to edit:**
- `src/components/Hub5_AviationTelemetry/MyPlanePicsSuite.tsx` line 81

**Change:**
```typescript
// Before:
resolve(canvas.toDataURL('image/jpeg', 0.7));
// After:
resolve(canvas.toDataURL('image/jpeg', 1.0));
```

**Validation:**
- Import a photo and verify thumbnail looks sharp.
- Check browser memory tab for any leaks.

---

## Fix 3 — Speed up parser + livery dedup

**File to edit:**
- `src/components/Hub5_AviationTelemetry/MyPlanePicsSuite.tsx` lines 339–377

**What to do:**
- In the `airlineAircraftMap` useMemo, change `liveries: string[]` to `liveries: Set<string>` during construction.
- Replace `airlineMap[airline].aircrafts[aircraft].liveries.includes(livery)` with `airlineMap[airline].aircrafts[aircraft].liveriesSet.has(livery)`.
- Convert Set back to sorted array only at the final `.map(...)` step before rendering.

**Validation:**
- Import 1,000+ photos and verify the Liveries tab renders without lag.
- Verify livery list is still correct and sorted.

---

## Fix 4 — Debounce auto-save

**File to edit:**
- `src/context/AppContext.tsx` lines 332–376

**What to do:**
- Add a 2-second debounce before calling `dbManager.saveDatabase`.
- Use a `useRef<number | null>` to track the pending timeout ID.
- Cancel any pending save before scheduling a new one.
- Skip save entirely if `!activeVaultKey`.

**Pseudocode:**
```typescript
const saveTimerRef = useRef<number | null>(null);

useEffect(() => {
  if (!activeVaultKey) return;

  if (saveTimerRef.current) {
    clearTimeout(saveTimerRef.current);
  }

  saveTimerRef.current = window.setTimeout(() => {
    // ... existing save logic ...
  }, 2000);

  return () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
  };
}, [activeVaultKey, user, masterKeySet, authRequired, messages, socialPosts, stickers, currentTrack, iptvChannels, notes, todos, myPlanePics, algorithmSettings, nightcorePitch]);
```

**Validation:**
- Type a note, wait 2 seconds, verify it auto-saves.
- Close app within 1 second of editing — verify no crash (data stays in React state until next save).
- FPS counter stays stable during typing.

---

## Fix 5 — Fix stopwatch interval

**File to edit:**
- `src/components/ClockSuiteModal.tsx` lines 74–84

**What to do:**
- Replace the 10 ms `setInterval` with `requestAnimationFrame`.
- Track `startTime` in a ref.
- On each frame, compute `elapsed = Date.now() - startTime` and call `setSwTimeMs(elapsed)`.
- This aligns updates with the display refresh (~60 fps) instead of 100 fps.

**Pseudocode:**
```typescript
const swStartRef = useRef<number | null>(null);
const rafRef = useRef<number | null>(null);

useEffect(() => {
  if (swRunning) {
    swStartRef.current = Date.now() - swTimeMs;
    const tick = () => {
      if (swStartRef.current !== null) {
        setSwTimeMs(Date.now() - swStartRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  } else {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    swStartRef.current = null;
  }
  return () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };
}, [swRunning]);
```

**Validation:**
- Start stopwatch, verify it runs smoothly.
- Check FPS counter — should no longer drop in Clock Suite.
- Verify lap/reset still work correctly.

---

## Fix 6 — Cache profile stats

**File to edit:**
- `src/components/ProfilePage.tsx` lines 13–15

**What to do:**
- Wrap the three `compute*` calls in `useMemo` keyed on `myPlanePics`.

**Pseudocode:**
```typescript
const stats = useMemo(() => computeLiveStats(myPlanePics), [myPlanePics]);
const airlineRankings = useMemo(() => computeAirlineRankings(myPlanePics), [myPlanePics]);
const modelRankings = useMemo(() => computeAircraftModelRankings(myPlanePics), [myPlanePics]);
```

**Validation:**
- Open Profile page, verify stats display correctly.
- Switch away and back — stats should not flicker or recalculate unnecessarily.
- With 1,000+ photos, tab switch should be instant.

---

## Execution Order
1. Fix 4 (auto-save debounce) — biggest global FPS win.
2. Fix 1 (batch progress) + Fix 3 (Set dedup) — both in MyPlanePicsSuite.tsx, do together.
3. Fix 2 (thumbnail quality 1.0) — tiny change, do with Fix 1/3.
4. Fix 5 (stopwatch rAF) — isolated file.
5. Fix 6 (profile memo) — isolated file.

## Out of Scope
- Server-side changes.
- Parser regex/format changes.
- Virtualization (grid is already paginated).
