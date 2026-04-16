/**
 * Premium Addictive Features
 * Routine cancellation, Echo Journal, Ghost Mirror, Chain Reaction, Mood Time Machine
 */

import { getDb } from "./db";
import {
  routineCancellations,
  echoJournalViews,
  ghostMirrors,
  moodSnapshots,
} from "../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

// ─── Routine Cancellation ──────────────────────────────────────────────────────

export async function trackRoutineCancellation(userId: number, date: string) {
  const database = await getDb();
  if (!database) return null;

  return await database
    .insert(routineCancellations)
    .values({
      userId,
      date: new Date(date),
      wasCancelled: true,
      wasReachieved: false,
      xpMultiplier: 1,
    })
    .onDuplicateKeyUpdate({
      set: { wasCancelled: true },
    });
}

export async function markRoutineReachieved(userId: number, date: string) {
  const database = await getDb();
  if (!database) return null;

  return await database
    .update(routineCancellations)
    .set({
      wasReachieved: true,
      xpMultiplier: 2, // Double XP for re-achievement
    })
    .where(
      and(
        eq(routineCancellations.userId, userId),
        eq(routineCancellations.date, new Date(date))
      )
    );
}

export async function getRoutineXpMultiplier(userId: number, date: string) {
  const database = await getDb();
  if (!database) return 1;

  const result = await database
    .select({ xpMultiplier: routineCancellations.xpMultiplier })
    .from(routineCancellations)
    .where(
      and(
        eq(routineCancellations.userId, userId),
        eq(routineCancellations.date, new Date(date))
      )
    )
    .limit(1);

  return result[0]?.xpMultiplier ?? 1;
}

// ─── Echo Journal ──────────────────────────────────────────────────────────────

export async function recordEchoJournalView(
  userId: number,
  originalEntryId: string,
  daysBack: number,
  growthHighlights: string
) {
  const database = await getDb();
  if (!database) return null;

  return await database.insert(echoJournalViews).values({
    userId,
    originalEntryId,
    daysBack,
    growthHighlights,
    shownAt: new Date(),
    wasMeaningful: false,
  });
}

export async function markEchoAsMeaningful(userId: number, echoId: number) {
  const database = await getDb();
  if (!database) return null;

  return await database
    .update(echoJournalViews)
    .set({ wasMeaningful: true })
    .where(
      and(eq(echoJournalViews.userId, userId), eq(echoJournalViews.id, echoId))
    );
}

// ─── Ghost Mirror ──────────────────────────────────────────────────────────────

export async function createGhostMirror(
  userId: number,
  weekStartDate: string,
  visualization: string,
  streak: number,
  xp: number
) {
  const database = await getDb();
  if (!database) return null;

  return await database.insert(ghostMirrors).values({
    userId,
    weekStartDate: new Date(weekStartDate),
    visualization,
    streakAtGeneration: streak,
    xpAtGeneration: xp,
  });
}

export async function getGhostMirrorForWeek(userId: number, weekStartDate: string) {
  const database = await getDb();
  if (!database) return null;

  const result = await database
    .select()
    .from(ghostMirrors)
    .where(
      and(
        eq(ghostMirrors.userId, userId),
        eq(ghostMirrors.weekStartDate, new Date(weekStartDate))
      )
    )
    .limit(1);

  return result[0] ?? null;
}

export async function markGhostMirrorViewed(userId: number, mirrorId: number) {
  const database = await getDb();
  if (!database) return null;

  return await database
    .update(ghostMirrors)
    .set({ viewedAt: new Date() })
    .where(and(eq(ghostMirrors.userId, userId), eq(ghostMirrors.id, mirrorId)));
}

// ─── Mood Time Machine ─────────────────────────────────────────────────────────

export async function recordMoodSnapshot(
  userId: number,
  date: string,
  moodLevel: number,
  note?: string
) {
  const database = await getDb();
  if (!database) return null;

  return await database.insert(moodSnapshots).values({
    userId,
    date: new Date(date),
    moodLevel,
    note,
  });
}

export async function getMoodHistoryComparison(
  userId: number,
  daysBack: number
) {
  const database = await getDb();
  if (!database) return [];

  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() - daysBack);

  return await database
    .select()
    .from(moodSnapshots)
    .where(
      and(
        eq(moodSnapshots.userId, userId),
        gte(moodSnapshots.date, targetDate),
        lte(moodSnapshots.date, today)
      )
    )
    .orderBy(moodSnapshots.date);
}

export async function getMoodTrend(userId: number, daysBack: number) {
  const database = await getDb();
  if (!database) return { average: 0, trend: "stable" };

  const snapshots = await getMoodHistoryComparison(userId, daysBack);

  if (snapshots.length === 0) {
    return { average: 0, trend: "stable" };
  }

  const average = snapshots.reduce((sum: number, s: any) => sum + s.moodLevel, 0) / snapshots.length;

  // Determine trend (improving, declining, stable)
  const firstHalf = snapshots.slice(0, Math.floor(snapshots.length / 2));
  const secondHalf = snapshots.slice(Math.floor(snapshots.length / 2));

  const firstAvg =
    firstHalf.length > 0
      ? firstHalf.reduce((sum: number, s: any) => sum + s.moodLevel, 0) / firstHalf.length
      : average;
  const secondAvg =
    secondHalf.length > 0
      ? secondHalf.reduce((sum: number, s: any) => sum + s.moodLevel, 0) / secondHalf.length
      : average;

  const trend =
    secondAvg > firstAvg + 0.5
      ? "improving"
      : secondAvg < firstAvg - 0.5
        ? "declining"
        : "stable";

  return { average: Math.round(average * 10) / 10, trend };
}
