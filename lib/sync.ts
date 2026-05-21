/**
 * Milestone 2: Client-side sync utilities
 *
 * processPendingSync():
 * - Reads @risegrind_pending_sync from AsyncStorage
 * - Calls the relevant push endpoints for each queued item
 * - Removes successfully synced items from the queue
 * - Leaves failed items in the queue for next attempt
 *
 * Call this on:
 * - App launch (after auth is confirmed)
 * - Network reconnection
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../server/routers";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Auth from "@/lib/_core/auth";

export const PENDING_SYNC_KEY = "@risegrind_pending_sync";

// ─── Queue item types ─────────────────────────────────────────────────────────

export type SyncQueueItem =
  | { type: "habits"; payload: { habits: Array<{ clientId: string; name: string; icon: string; durationMin: number; isDefault: boolean; order: number; deletedAt?: number | null }> } }
  | { type: "completions"; payload: { completions: Array<{ habitClientId: string; date: string; completedAt: number }> } }
  | { type: "journal"; payload: { entries: Array<{ clientId: string; date: string; content: string; prompt: string; moodLevel?: number | null; createdAt: number }> } }
  | { type: "progress"; payload: { xp: number; streak: number; lastActiveDate?: string | null } }
  | { type: "achievements"; payload: { achievements: Array<{ achievementId: string; title: string; description: string; icon: string; unlockedAt?: number | null }> } }
  | { type: "sideQuests"; payload: { quests: Array<{ questId: string; title: string; description: string; icon: string; durationDays: number; xpReward: number; badgeId: string; category: "discipline" | "wellness" | "mindset" | "body"; startedAt?: number | null; completedAt?: number | null }> } }
  | { type: "mood"; payload: { entries: Array<{ date: string; moodLevel: number; note?: string | null }> } };

export type SyncQueue = SyncQueueItem[];

// ─── Queue helpers ────────────────────────────────────────────────────────────

export async function readSyncQueue(): Promise<SyncQueue> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_SYNC_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SyncQueue;
  } catch {
    return [];
  }
}

export async function writeSyncQueue(queue: SyncQueue): Promise<void> {
  try {
    await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn("[sync] Failed to write sync queue:", e);
  }
}

export async function enqueueSyncItem(item: SyncQueueItem): Promise<void> {
  const queue = await readSyncQueue();
  queue.push(item);
  await writeSyncQueue(queue);
}

// ─── tRPC client factory ──────────────────────────────────────────────────────

function createSyncClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getApiBaseUrl()}/api/trpc`,
        transformer: superjson,
        headers: async () => {
          const token = await Auth.getSessionToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}

// ─── processPendingSync ───────────────────────────────────────────────────────

/**
 * Process all items in the offline sync queue.
 * - Reads the queue from AsyncStorage
 * - Calls the relevant push endpoint for each item
 * - Removes successfully synced items
 * - Leaves failed items for the next attempt
 *
 * @returns { synced: number, failed: number }
 */
export async function processPendingSync(): Promise<{ synced: number; failed: number }> {
  const queue = await readSyncQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  console.log(`[sync] Processing ${queue.length} pending sync items`);

  const client = createSyncClient();
  const remaining: SyncQueue = [];
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      let result: { success: boolean; error?: string } | undefined;

      switch (item.type) {
        case "habits":
          result = await client.sync.pushHabits.mutate(item.payload as any);
          break;
        case "completions":
          result = await client.sync.pushCompletions.mutate(item.payload as any);
          break;
        case "journal":
          result = await client.sync.pushJournal.mutate(item.payload as any);
          break;
        case "progress":
          result = await client.sync.pushProgress.mutate(item.payload as any);
          break;
        case "achievements":
          result = await client.sync.pushAchievements.mutate(item.payload as any);
          break;
        case "sideQuests":
          result = await client.sync.pushSideQuests.mutate(item.payload as any);
          break;
        case "mood":
          result = await client.sync.pushMood.mutate(item.payload as any);
          break;
        default:
          console.warn("[sync] Unknown queue item type:", (item as any).type);
          continue;
      }

      if (result?.success) {
        synced++;
        console.log(`[sync] ✓ Synced ${item.type}`);
      } else {
        console.warn(`[sync] ✗ Failed ${item.type}:`, result?.error);
        remaining.push(item);
        failed++;
      }
    } catch (e) {
      console.warn(`[sync] ✗ Error syncing ${item.type}:`, e);
      remaining.push(item);
      failed++;
    }
  }

  await writeSyncQueue(remaining);
  console.log(`[sync] Done — synced: ${synced}, failed: ${failed}, remaining: ${remaining.length}`);
  return { synced, failed };
}

/**
 * Full push of all current AppState data to the server.
 * Used on first sync after install or after a long offline period.
 */
export async function pushAllState(state: {
  habits: Array<{ id: string; name: string; icon: string; durationMin: number; isDefault: boolean; order: number }>;
  completions: Array<{ habitId: string; date: string; completedAt: number }>;
  journalEntries: Array<{ id: string; date: string; content: string; prompt: string; moodLevel?: number | null; createdAt: number }>;
  xp: number;
  streak: number;
  lastActiveDate?: string | null;
  achievements: Array<{ id: string; title: string; description: string; icon: string; unlockedAt?: number | null }>;
  sideQuests: Array<{ id: string; title: string; description: string; icon: string; durationDays: number; xpReward: number; badgeId: string; category: "discipline" | "wellness" | "mindset" | "body"; startedAt?: number | null; completedAt?: number | null }>;
  moodEntries: Array<{ date: string; moodLevel: number; note?: string | null }>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createSyncClient();

    const results = await Promise.allSettled([
      state.habits.length > 0
        ? client.sync.pushHabits.mutate({
            habits: state.habits.map((h) => ({
              clientId: h.id,
              name: h.name,
              icon: h.icon,
              durationMin: h.durationMin,
              isDefault: h.isDefault,
              order: h.order,
              deletedAt: null,
            })),
          })
        : Promise.resolve({ success: true }),

      state.completions.length > 0
        ? client.sync.pushCompletions.mutate({
            completions: state.completions.map((c) => ({
              habitClientId: c.habitId,
              date: c.date,
              completedAt: c.completedAt,
            })),
          })
        : Promise.resolve({ success: true }),

      state.journalEntries.length > 0
        ? client.sync.pushJournal.mutate({
            entries: state.journalEntries.map((e) => ({
              clientId: e.id,
              date: e.date,
              content: e.content,
              prompt: e.prompt,
              moodLevel: e.moodLevel ?? null,
              createdAt: e.createdAt,
            })),
          })
        : Promise.resolve({ success: true }),

      client.sync.pushProgress.mutate({
        xp: state.xp,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate ?? null,
      }),

      state.achievements.length > 0
        ? client.sync.pushAchievements.mutate({
            achievements: state.achievements.map((a) => ({
              achievementId: a.id,
              title: a.title,
              description: a.description,
              icon: a.icon,
              unlockedAt: a.unlockedAt ?? null,
            })),
          })
        : Promise.resolve({ success: true }),

      state.sideQuests.length > 0
        ? client.sync.pushSideQuests.mutate({
            quests: state.sideQuests.map((q) => ({
              questId: q.id,
              title: q.title,
              description: q.description,
              icon: q.icon,
              durationDays: q.durationDays,
              xpReward: q.xpReward,
              badgeId: q.badgeId,
              category: q.category,
              startedAt: q.startedAt ?? null,
              completedAt: q.completedAt ?? null,
            })),
          })
        : Promise.resolve({ success: true }),

      state.moodEntries.length > 0
        ? client.sync.pushMood.mutate({
            entries: state.moodEntries.map((m) => ({
              date: m.date,
              moodLevel: m.moodLevel,
              note: m.note ?? null,
            })),
          })
        : Promise.resolve({ success: true }),
    ]);

    const failed = results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value?.success));
    if (failed.length > 0) {
      console.warn("[sync] pushAllState: some endpoints failed:", failed);
      return { success: false, error: `${failed.length} endpoints failed` };
    }

    return { success: true };
  } catch (e) {
    console.error("[sync] pushAllState error:", e);
    return { success: false, error: String(e) };
  }
}

// ─── pullAndMergeStandalone ───────────────────────────────────────────────────

/**
 * Standalone pullAll → merge helper for use in screens (community, friends).
 * Returns the raw server data so the caller can dispatch LOAD_STATE.
 * Does NOT dispatch — caller is responsible for merging and dispatching.
 */
export async function pullAllFromServer(): Promise<{
  habits: unknown[];
  completions: unknown[];
  journal: unknown[];
  progress: { xp: number; streak: number; lastActiveDate?: string | null } | null;
  achievements: unknown[];
  sideQuests: unknown[];
  mood: unknown[];
  friends: unknown[];
} | null> {
  try {
    const client = createSyncClient();
    const data = await client.sync.pullAll.query();
    if (!data || !data.success) return null;
    return {
      habits: (data.habits as unknown[]) ?? [],
      completions: (data.completions as unknown[]) ?? [],
      journal: (data.journal as unknown[]) ?? [],
      progress: (data.progress as { xp: number; streak: number; lastActiveDate?: string | null } | null) ?? null,
      achievements: (data.achievements as unknown[]) ?? [],
      sideQuests: (data.sideQuests as unknown[]) ?? [],
      mood: (data.mood as unknown[]) ?? [],
      friends: (data.friends as unknown[]) ?? [],
    };
  } catch (e) {
    console.warn("[sync] pullAllFromServer failed:", e);
    return null;
  }
}

// ─── Sync flag helpers ────────────────────────────────────────────────────────

export const SYNCED_FLAG_KEY = "@risegrind_synced";

/**
 * Clear the @risegrind_synced flag so the next app launch triggers first-sync.
 * Used by Danger Zone "Reset All Data".
 */
export async function clearSyncedFlag(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SYNCED_FLAG_KEY);
    console.log("[sync] Cleared @risegrind_synced flag — next launch will re-sync from server");
  } catch (e) {
    console.warn("[sync] Failed to clear synced flag:", e);
  }
}
