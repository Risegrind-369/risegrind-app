/**
 * Milestone 2 Phase C — useSyncToServer hook
 *
 * Encapsulates all server sync logic:
 * - First-sync flow: pushAllState() → pullAll() → merge → set @risegrind_synced
 * - Normal launch: processPendingSync() + background pullAll()
 * - Debounced push (2s) on habits/completions/journal/progress state changes
 * - Immediate push on achievement unlock and side quest completion
 * - Network reconnect: processPendingSync()
 * - Offline: enqueue to @risegrind_pending_sync
 *
 * Returns: { isSyncing, syncError, retryFirstSync }
 */

import { useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import type { AppState, AppAction, Habit, HabitCompletion, JournalEntry, Achievement, SideQuest, GhostFriend, MoodEntry } from "./app-context";
import {
  processPendingSync,
  pushAllState,
  enqueueSyncItem,
  PENDING_SYNC_KEY,
} from "./sync";
import * as Auth from "./_core/auth";
import { createTRPCClient as createVanillaTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../server/routers";
import { getApiBaseUrl } from "@/constants/oauth";

const SYNCED_FLAG_KEY = "@risegrind_synced";

// ─── Vanilla tRPC client (not React-Query, safe to call outside components) ──

function makeSyncClient() {
  return createVanillaTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getApiBaseUrl()}/api/trpc`,
        transformer: superjson,
        headers: async () => {
          const token = await Auth.getSessionToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        fetch(url, options) {
          return fetch(url, { ...options, credentials: "include" });
        },
      }),
    ],
  });
}

// ─── Merge helpers ────────────────────────────────────────────────────────────

/**
 * Union merge for habits: keep all local + add server-only habits.
 * Never delete. Soft-deleted server habits are skipped.
 */
function mergeHabits(local: Habit[], serverRaw: unknown[]): Habit[] {
  const server = serverRaw as Array<{
    clientId: string; name: string; icon: string;
    durationMin: number; isDefault: boolean; order: number; deletedAt?: number | null;
  }>;
  const localIds = new Set(local.map((h) => h.id));
  const additions: Habit[] = server
    .filter((sh) => !sh.deletedAt && !localIds.has(sh.clientId))
    .map((sh) => ({
      id: sh.clientId,
      name: sh.name,
      icon: sh.icon,
      durationMin: sh.durationMin ?? 0,
      isDefault: sh.isDefault ?? false,
      order: sh.order ?? 0,
    }));
  return [...local, ...additions];
}

/**
 * Union merge for completions: keep all local + add server-only completions.
 */
function mergeCompletions(local: HabitCompletion[], serverRaw: unknown[]): HabitCompletion[] {
  const server = serverRaw as Array<{ habitClientId: string; date: string; completedAt: number }>;
  const localKeys = new Set(local.map((c) => `${c.habitId}|${c.date}`));
  const additions: HabitCompletion[] = server
    .filter((sc) => !localKeys.has(`${sc.habitClientId}|${sc.date}`))
    .map((sc) => ({ habitId: sc.habitClientId, date: sc.date, completedAt: sc.completedAt }));
  return [...local, ...additions];
}

/**
 * Union merge for journal entries.
 */
function mergeJournal(local: JournalEntry[], serverRaw: unknown[]): JournalEntry[] {
  const server = serverRaw as Array<{
    clientId: string; date: string; content: string;
    prompt: string; moodLevel?: number | null; createdAt: number;
  }>;
  const localIds = new Set(local.map((e) => e.id));
  const additions: JournalEntry[] = server
    .filter((se) => !localIds.has(se.clientId))
    .map((se) => ({
      id: se.clientId,
      date: se.date,
      content: se.content,
      prompt: se.prompt,
      moodLevel: (se.moodLevel as any) ?? undefined,
      createdAt: se.createdAt,
    }));
  return [...local, ...additions];
}

/**
 * Union merge for achievements.
 */
function mergeAchievements(local: Achievement[], serverRaw: unknown[]): Achievement[] {
  const server = serverRaw as Array<{
    achievementId: string; title: string; description: string;
    icon: string; unlockedAt?: number | null;
  }>;
  const localIds = new Set(local.map((a) => a.id));
  const additions: Achievement[] = server
    .filter((sa) => !localIds.has(sa.achievementId))
    .map((sa) => ({
      id: sa.achievementId,
      title: sa.title,
      description: sa.description,
      icon: sa.icon,
      unlockedAt: sa.unlockedAt ?? undefined,
    }));
  return [...local, ...additions];
}

/**
 * Union merge for side quests.
 */
function mergeSideQuests(local: SideQuest[], serverRaw: unknown[]): SideQuest[] {
  const server = serverRaw as Array<{
    questId: string; title: string; description: string; icon: string;
    durationDays: number; xpReward: number; badgeId: string;
    category: "discipline" | "wellness" | "mindset" | "body";
    startedAt?: number | null; completedAt?: number | null;
  }>;
  const localIds = new Set(local.map((q) => q.id));
  const additions: SideQuest[] = server
    .filter((sq) => !localIds.has(sq.questId))
    .map((sq) => ({
      id: sq.questId,
      title: sq.title,
      description: sq.description,
      icon: sq.icon,
      durationDays: sq.durationDays,
      xpReward: sq.xpReward,
      badgeId: sq.badgeId,
      category: sq.category,
      startedAt: sq.startedAt ?? undefined,
      completedAt: sq.completedAt ?? undefined,
    }));
  return [...local, ...additions];
}

/**
 * Union merge for mood entries.
 */
function mergeMood(local: MoodEntry[], serverRaw: unknown[]): MoodEntry[] {
  const server = serverRaw as Array<{ date: string; moodLevel: number; note?: string | null }>;
  const localDates = new Set(local.map((m) => m.date));
  const additions: MoodEntry[] = server
    .filter((sm) => !localDates.has(sm.date))
    .map((sm) => ({
      id: `mood_${sm.date}`,
      date: sm.date,
      level: Math.max(1, Math.min(5, sm.moodLevel)) as 1 | 2 | 3 | 4 | 5,
      emoji: ["😔", "😕", "😐", "🙂", "😄"][sm.moodLevel - 1] ?? "😐",
      timestamp: Date.now(),
    }));
  return [...local, ...additions];
}

/**
 * Server-wins merge for XP and streak (take the higher value).
 */
function mergeProgress(
  localXP: number,
  localStreak: number,
  serverProgress: { xp: number; streak: number; lastActiveDate?: string | null } | null
): { xp: number; streak: number; lastActiveDate: string | null } {
  if (!serverProgress) return { xp: localXP, streak: localStreak, lastActiveDate: null };
  return {
    xp: Math.max(localXP, serverProgress.xp),
    streak: Math.max(localStreak, serverProgress.streak),
    lastActiveDate: serverProgress.lastActiveDate ?? null,
  };
}

/**
 * Merge friends from server (live stats from userProgress join).
 */
function mergeFriends(local: GhostFriend[], serverRaw: unknown[]): GhostFriend[] {
  const server = serverRaw as Array<{
    code: string; name: string; streak: number; xp: number; addedAt: number;
  }>;
  const localCodes = new Set(local.map((f) => f.code));
  const additions: GhostFriend[] = server
    .filter((sf) => !localCodes.has(sf.code))
    .map((sf) => ({ code: sf.code, name: sf.name, streak: sf.streak, xp: sf.xp, addedAt: sf.addedAt }));
  // Update existing friends with live server stats
  const updated = local.map((f) => {
    const serverFriend = server.find((sf) => sf.code === f.code);
    if (serverFriend) {
      return { ...f, streak: serverFriend.streak, xp: serverFriend.xp, name: serverFriend.name };
    }
    return f;
  });
  return [...updated, ...additions];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseSyncOptions {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  onSyncingChange: (syncing: boolean) => void;
  onSyncError: (error: string | null) => void;
}

export function useSyncToServer({ state, dispatch, onSyncingChange, onSyncError }: UseSyncOptions) {
  const hasRunFirstSync = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStateRef = useRef<AppState>(state);
  const isOnlineRef = useRef(true);

  // ─── Check if user has an active session ──────────────────────────────────
  const hasSession = useCallback(async (): Promise<boolean> => {
    try {
      const token = await Auth.getSessionToken();
      return !!token;
    } catch {
      return false;
    }
  }, []);

  // ─── pullAll and merge into AppState ──────────────────────────────────────
  const pullAndMerge = useCallback(async (currentState: AppState) => {
    try {
      const client = makeSyncClient();
      const serverData = await client.sync.pullAll.query();
      if (!serverData) return;

      const mergedHabits = mergeHabits(currentState.habits, (serverData.habits as unknown[]) ?? []);
      const mergedCompletions = mergeCompletions(currentState.completions, (serverData.completions as unknown[]) ?? []);
      const mergedJournal = mergeJournal(currentState.journalEntries, (serverData.journal as unknown[]) ?? []);
      const mergedAchievements = mergeAchievements(currentState.achievements, (serverData.achievements as unknown[]) ?? []);
      const mergedSideQuests = mergeSideQuests(currentState.sideQuests, (serverData.sideQuests as unknown[]) ?? []);
      const mergedMood = mergeMood(currentState.moodEntries, (serverData.mood as unknown[]) ?? []);
      const mergedFriends = mergeFriends(currentState.friends, (serverData.friends as unknown[]) ?? []);
      const mergedProgress = mergeProgress(
        currentState.xp,
        currentState.streak,
        serverData.progress as { xp: number; streak: number; lastActiveDate?: string | null } | null
      );

      dispatch({
        type: "LOAD_STATE",
        payload: {
          habits: mergedHabits,
          completions: mergedCompletions,
          journalEntries: mergedJournal,
          achievements: mergedAchievements,
          sideQuests: mergedSideQuests,
          moodEntries: mergedMood,
          friends: mergedFriends,
          xp: mergedProgress.xp,
          streak: mergedProgress.streak,
          lastActiveDate: mergedProgress.lastActiveDate,
        },
      });
    } catch (e) {
      console.warn("[sync] pullAndMerge failed (silent):", e);
    }
  }, [dispatch]);

  // ─── First-sync flow ──────────────────────────────────────────────────────
  const runFirstSync = useCallback(async (currentState: AppState) => {
    if (hasRunFirstSync.current) return;
    hasRunFirstSync.current = true;

    const authenticated = await hasSession();
    if (!authenticated) {
      console.log("[sync] First sync skipped — no session");
      return;
    }

    const syncedFlag = await AsyncStorage.getItem(SYNCED_FLAG_KEY);

    if (!syncedFlag) {
      // First launch or reinstall: push local → pull server → merge
      console.log("[sync] First sync: pushing local data to server...");
      onSyncingChange(true);
      onSyncError(null);

      try {
        const pushResult = await pushAllState({
          habits: currentState.habits,
          completions: currentState.completions,
          journalEntries: currentState.journalEntries,
          xp: currentState.xp,
          streak: currentState.streak,
          lastActiveDate: currentState.lastActiveDate,
          achievements: currentState.achievements,
          sideQuests: currentState.sideQuests,
          moodEntries: currentState.moodEntries.map((m) => ({
            date: m.date,
            moodLevel: m.level,
            note: undefined,
          })),
        });

        if (!pushResult.success) {
          console.error("[sync] First sync push failed:", pushResult.error);
          onSyncError(pushResult.error ?? "Sync failed. Tap to retry.");
          onSyncingChange(false);
          hasRunFirstSync.current = false; // allow retry
          return;
        }

        console.log("[sync] First sync: pulling server data...");
        await pullAndMerge(currentState);

        await AsyncStorage.setItem(SYNCED_FLAG_KEY, "true");
        console.log("[sync] First sync complete — @risegrind_synced set");
      } catch (e) {
        console.error("[sync] First sync error:", e);
        onSyncError("Sync failed. Tap to retry.");
        hasRunFirstSync.current = false; // allow retry
      } finally {
        onSyncingChange(false);
      }
    } else {
      // Normal launch: flush queue + background pull
      console.log("[sync] Normal launch: flushing pending sync queue...");
      processPendingSync().catch((e) => console.warn("[sync] processPendingSync error:", e));

      // Background pull — non-blocking, don't delay home screen
      setTimeout(() => {
        pullAndMerge(currentState).catch((e) => console.warn("[sync] Background pullAndMerge error:", e));
      }, 1500);
    }
  }, [hasSession, onSyncingChange, onSyncError, pullAndMerge]);

  // ─── Network reconnect handler ────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState: { isConnected: boolean | null; isInternetReachable: boolean | null | undefined }) => {
      const wasOffline = !isOnlineRef.current;
      const isNowOnline = netState.isConnected === true && netState.isInternetReachable !== false;
      isOnlineRef.current = isNowOnline;

      if (wasOffline && isNowOnline) {
        console.log("[sync] Network reconnected — flushing pending sync queue");
        processPendingSync().catch((e) => console.warn("[sync] processPendingSync on reconnect error:", e));
      }
    });
    return () => unsubscribe();
  }, []);

  // ─── First-sync trigger: run once when state finishes loading ────────────
  useEffect(() => {
    if (state.isLoading) return; // wait for AsyncStorage to finish loading
    if (hasRunFirstSync.current) return;
    runFirstSync(state);
  }, [state.isLoading, runFirstSync, state]);

  // ─── Debounced push on state changes ─────────────────────────────────────
  useEffect(() => {
    if (state.isLoading) return;
    const prev = prevStateRef.current;

    const habitsChanged = prev.habits !== state.habits;
    const completionsChanged = prev.completions !== state.completions;
    const journalChanged = prev.journalEntries !== state.journalEntries;
    const progressChanged = prev.xp !== state.xp || prev.streak !== state.streak || prev.lastActiveDate !== state.lastActiveDate;
    const moodChanged = prev.moodEntries !== state.moodEntries;

    prevStateRef.current = state;

    const needsDebounce = habitsChanged || completionsChanged || journalChanged || progressChanged || moodChanged;
    if (!needsDebounce) return;

    // Clear existing debounce timer
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      const authenticated = await hasSession();
      if (!authenticated) return;

      const online = isOnlineRef.current;

      if (habitsChanged) {
        const payload = {
          habits: state.habits.map((h) => ({
            clientId: h.id, name: h.name, icon: h.icon,
            durationMin: h.durationMin, isDefault: h.isDefault, order: h.order, deletedAt: null,
          })),
        };
        if (online) {
          try {
            const client = makeSyncClient();
            await client.sync.pushHabits.mutate(payload);
          } catch {
            await enqueueSyncItem({ type: "habits", payload });
          }
        } else {
          await enqueueSyncItem({ type: "habits", payload });
        }
      }

      if (completionsChanged) {
        const payload = {
          completions: state.completions.map((c) => ({
            habitClientId: c.habitId, date: c.date, completedAt: c.completedAt,
          })),
        };
        if (online) {
          try {
            const client = makeSyncClient();
            await client.sync.pushCompletions.mutate(payload);
          } catch {
            await enqueueSyncItem({ type: "completions", payload });
          }
        } else {
          await enqueueSyncItem({ type: "completions", payload });
        }
      }

      if (journalChanged) {
        const payload = {
          entries: state.journalEntries.map((e) => ({
            clientId: e.id, date: e.date, content: e.content,
            prompt: e.prompt, moodLevel: e.moodLevel ?? null, createdAt: e.createdAt,
          })),
        };
        if (online) {
          try {
            const client = makeSyncClient();
            await client.sync.pushJournal.mutate(payload);
          } catch {
            await enqueueSyncItem({ type: "journal", payload });
          }
        } else {
          await enqueueSyncItem({ type: "journal", payload });
        }
      }

      if (progressChanged) {
        const payload = {
          xp: state.xp,
          streak: state.streak,
          lastActiveDate: state.lastActiveDate ?? null,
        };
        if (online) {
          try {
            const client = makeSyncClient();
            await client.sync.pushProgress.mutate(payload);
          } catch {
            await enqueueSyncItem({ type: "progress", payload });
          }
        } else {
          await enqueueSyncItem({ type: "progress", payload });
        }
      }

      if (moodChanged) {
        const payload = {
          entries: state.moodEntries.map((m) => ({
            date: m.date, moodLevel: m.level, note: undefined,
          })),
        };
        if (online) {
          try {
            const client = makeSyncClient();
            await client.sync.pushMood.mutate(payload as any);
          } catch {
            await enqueueSyncItem({ type: "mood", payload: payload as any });
          }
        } else {
          await enqueueSyncItem({ type: "mood", payload: payload as any });
        }
      }
    }, 2000);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [state, hasSession]);

  // ─── Immediate push on achievement unlock ────────────────────────────────
  useEffect(() => {
    if (state.isLoading) return;
    const prev = prevStateRef.current;
    if (prev.achievements === state.achievements) return;

    const newAchievements = state.achievements.filter(
      (a) => !prev.achievements.find((pa) => pa.id === a.id)
    );
    if (newAchievements.length === 0) return;

    const push = async () => {
      const authenticated = await hasSession();
      if (!authenticated) return;
      const payload = {
        achievements: state.achievements.map((a) => ({
          achievementId: a.id, title: a.title, description: a.description,
          icon: a.icon, unlockedAt: a.unlockedAt ?? null,
        })),
      };
      if (isOnlineRef.current) {
        try {
          const client = makeSyncClient();
          await client.sync.pushAchievements.mutate(payload);
          console.log("[sync] Achievement unlocked — pushed immediately");
        } catch {
          await enqueueSyncItem({ type: "achievements", payload });
        }
      } else {
        await enqueueSyncItem({ type: "achievements", payload });
      }
    };
    push();
  }, [state.achievements, state.isLoading, hasSession]);

  // ─── Immediate push on side quest completion ─────────────────────────────
  useEffect(() => {
    if (state.isLoading) return;
    const prev = prevStateRef.current;
    if (prev.sideQuests === state.sideQuests) return;

    const newlyCompleted = state.sideQuests.filter(
      (q) => q.completedAt && !prev.sideQuests.find((pq) => pq.id === q.id && pq.completedAt)
    );
    if (newlyCompleted.length === 0) return;

    const push = async () => {
      const authenticated = await hasSession();
      if (!authenticated) return;
      const payload = {
        quests: state.sideQuests.map((q) => ({
          questId: q.id, title: q.title, description: q.description, icon: q.icon,
          durationDays: q.durationDays, xpReward: q.xpReward, badgeId: q.badgeId,
          category: q.category, startedAt: q.startedAt ?? null, completedAt: q.completedAt ?? null,
        })),
      };
      if (isOnlineRef.current) {
        try {
          const client = makeSyncClient();
          await client.sync.pushSideQuests.mutate(payload);
          console.log("[sync] Side quest completed — pushed immediately");
        } catch {
          await enqueueSyncItem({ type: "sideQuests", payload });
        }
      } else {
        await enqueueSyncItem({ type: "sideQuests", payload });
      }
    };
    push();
  }, [state.sideQuests, state.isLoading, hasSession]);

  // ─── Immediate pushProgress on habit completion (XP gain) or streak milestone ─
  useEffect(() => {
    if (state.isLoading) return;
    const prev = prevStateRef.current;

    // Detect XP gain (habit completed) or streak milestone (7, 30, 60, 90, 180, 365)
    const xpGained = state.xp > prev.xp;
    const streakMilestones = [7, 30, 60, 90, 180, 365];
    const hitStreakMilestone =
      state.streak !== prev.streak && streakMilestones.includes(state.streak);
    const newCompletion = state.completions.length > prev.completions.length;

    if (!xpGained && !hitStreakMilestone && !newCompletion) return;

    const push = async () => {
      const authenticated = await hasSession();
      if (!authenticated) return;
      const payload = {
        xp: state.xp,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate ?? null,
      };
      if (isOnlineRef.current) {
        try {
          const client = makeSyncClient();
          await client.sync.pushProgress.mutate(payload);
          console.log(
            `[sync] Immediate pushProgress — XP: ${state.xp}, streak: ${state.streak}${
              hitStreakMilestone ? ` (milestone: ${state.streak} days!)` : ""
            }`
          );
        } catch {
          await enqueueSyncItem({ type: "progress", payload });
        }
      } else {
        await enqueueSyncItem({ type: "progress", payload });
      }
    };
    push();
  }, [state.xp, state.streak, state.completions, state.isLoading, state.lastActiveDate, hasSession]);

  // ─── Immediate pushCompletions on habit tap ───────────────────────────────
  // Fires without debounce the moment a new completion is recorded so the
  // Ghost Crew leaderboard and server DB reflect the tap in real-time.
  const prevCompletionsLengthRef = useRef(state.completions.length);
  useEffect(() => {
    if (state.isLoading) return;
    const prevLen = prevCompletionsLengthRef.current;
    const currLen = state.completions.length;
    prevCompletionsLengthRef.current = currLen;

    // Only fire when a new completion is added (not on initial load or removal)
    if (currLen <= prevLen) return;

    const push = async () => {
      const authenticated = await hasSession();
      if (!authenticated) return;
      const payload = {
        completions: state.completions.map((c) => ({
          habitClientId: c.habitId, date: c.date, completedAt: c.completedAt,
        })),
      };
      if (isOnlineRef.current) {
        try {
          const client = makeSyncClient();
          await client.sync.pushCompletions.mutate(payload);
          console.log(`[sync] Immediate pushCompletions — ${currLen - prevLen} new completion(s)`);
        } catch {
          await enqueueSyncItem({ type: "completions", payload });
        }
      } else {
        await enqueueSyncItem({ type: "completions", payload });
      }
    };
    push();
  }, [state.completions, state.isLoading, hasSession]);

  // ─── Retry first sync (called from error UI) ──────────────────────────────
  const retryFirstSync = useCallback(() => {
    hasRunFirstSync.current = false;
    runFirstSync(state);
  }, [runFirstSync, state]);

  return { retryFirstSync };
}
