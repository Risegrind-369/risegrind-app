/**
 * Premium Features Helpers
 * - Ghost Streak Protection (Recovery Quests)
 * - "Why Did I Miss?" AI Coach
 * - Apple Health Integration
 */

import { getDb } from "./db";
import { recoveryQuests, missedHabitReasons, healthData } from "../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

/**
 * Create a recovery quest when a user misses a habit
 * Offers a 5-10 min challenge to save/recover streak
 */
export async function createRecoveryQuest(
  userId: number,
  habitId: string,
  missedDate: Date,
  questDescription: string,
  durationMin: number = 5,
  streakRecoveryPercent: number = 50
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Expiry: 24 hours from now
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const result = await db.insert(recoveryQuests).values({
    userId,
    habitId,
    missedDate,
    questDescription,
    durationMin,
    streakRecoveryPercent,
    expiresAt,
  });

  return result;
}

/**
 * Complete a recovery quest and recover streak
 */
export async function completeRecoveryQuest(questId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const result = await db
    .update(recoveryQuests)
    .set({ completed: 1, completedAt: now })
    .where(eq(recoveryQuests.id, questId));

  return result;
}

/**
 * Get active recovery quests for a user (not expired, not completed)
 */
export async function getActiveRecoveryQuests(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const quests = await db
    .select()
    .from(recoveryQuests)
    .where(
      and(
        eq(recoveryQuests.userId, userId),
        eq(recoveryQuests.completed, 0),
        gte(recoveryQuests.expiresAt, now)
      )
    );

  return quests;
}

/**
 * Record why user missed a habit (for pattern learning)
 */
export async function recordMissedHabitReason(
  userId: number,
  habitId: string,
  missedDate: Date,
  reason: string,
  aiResponse?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(missedHabitReasons).values({
    userId,
    habitId,
    missedDate,
    reason,
    aiResponse,
  });

  return result;
}

/**
 * Get user's missed habit reasons for pattern analysis
 * Returns last 10 reasons for context
 */
export async function getUserMissedReasons(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const reasons = await db
    .select()
    .from(missedHabitReasons)
    .where(eq(missedHabitReasons.userId, userId))
    .orderBy(missedHabitReasons.missedDate)
    .limit(limit);

  return reasons;
}

/**
 * Build context for "Why Did I Miss?" AI Coach
 * Analyzes past reasons to give empathetic, personalized advice
 */
export function buildMissedReasonContext(reasons: any[]): string {
  if (!reasons || reasons.length === 0) return "";

  // Count reason patterns
  const reasonCounts: Record<string, number> = {};
  reasons.forEach((r) => {
    const key = r.reason.toLowerCase();
    reasonCounts[key] = (reasonCounts[key] || 0) + 1;
  });

  // Find most common reason
  const topReasons = Object.entries(reasonCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([reason]) => reason);

  const context = `User's past reasons for missing habits: ${topReasons.join(", ")}. Pattern suggests they struggle with ${topReasons[0]}. Be empathetic and offer specific, actionable advice.`;

  return context;
}

/**
 * Save health data from Apple HealthKit
 */
export async function saveHealthData(
  userId: number,
  dateInput: Date,
  sleepHours?: number,
  steps?: number,
  activeEnergy?: number,
  morningEnergyScore?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Convert date to YYYY-MM-DD format for database
  const dateStr = dateInput.toISOString().split("T")[0];

  // Check if data exists for this date
  const existing = await db
    .select()
    .from(healthData)
    .where(
      and(
        eq(healthData.userId, userId),
        eq(healthData.date, dateStr as any)
      )
    );

  if (existing.length > 0) {
    // Update existing
    const updateData: any = {};
    if (sleepHours !== undefined) updateData.sleepHours = sleepHours;
    if (steps !== undefined) updateData.steps = steps;
    if (activeEnergy !== undefined) updateData.activeEnergy = activeEnergy;
    if (morningEnergyScore !== undefined) updateData.morningEnergyScore = morningEnergyScore;
    updateData.lastSyncedAt = new Date();

    return await db
      .update(healthData)
      .set(updateData)
      .where(
        and(
          eq(healthData.userId, userId),
          eq(healthData.date, dateStr as any)
        )
      );
  } else {
    // Insert new
    const insertData: any = {
      userId,
      date: dateStr,
    };
    if (sleepHours !== undefined) insertData.sleepHours = sleepHours;
    if (steps !== undefined) insertData.steps = steps;
    if (activeEnergy !== undefined) insertData.activeEnergy = activeEnergy;
    if (morningEnergyScore !== undefined) insertData.morningEnergyScore = morningEnergyScore;

    return await db.insert(healthData).values(insertData);
  }
}

/**
 * Calculate Morning Energy Score (0-100)
 * Based on sleep hours and activity level
 */
export function calculateMorningEnergyScore(
  sleepHours?: number,
  steps?: number,
  activeEnergy?: number
): number {
  let score = 50; // Base score

  // Sleep scoring: 7-8 hours = 100%, less/more = penalty
  if (sleepHours) {
    if (sleepHours >= 7 && sleepHours <= 8) {
      score += 30; // Full points
    } else if (sleepHours >= 6 && sleepHours < 9) {
      score += 20; // Partial points
    } else if (sleepHours < 5) {
      score -= 20; // Penalty for poor sleep
    }
  }

  // Activity scoring: 10k+ steps = 20 points
  if (steps && steps >= 10000) {
    score += 20;
  } else if (steps && steps >= 5000) {
    score += 10;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get user's health data for a date range
 */
export async function getHealthDataRange(
  userId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const data = await db
    .select()
    .from(healthData)
    .where(
      and(
        eq(healthData.userId, userId),
        gte(healthData.date, startDate),
        lte(healthData.date, endDate)
      )
    )
    .orderBy(healthData.date);

  return data;
}

/**
 * Determine routine difficulty adjustment based on health
 * Returns adjustment factor (0.7 = lighter, 1.0 = normal, 1.3 = harder)
 */
export function getRoutineDifficultyAdjustment(morningEnergyScore: number): number {
  if (morningEnergyScore < 30) return 0.6; // Very light routine
  if (morningEnergyScore < 50) return 0.8; // Light routine
  if (morningEnergyScore < 70) return 1.0; // Normal routine
  return 1.2; // Harder routine (high energy)
}
