/**
 * Weekly Challenges Database Helper
 *
 * Manages weekly challenges that reset every Monday.
 * Provides functions to:
 * - Get current week's challenges for a user
 * - Create new challenges for a user
 * - Mark challenges as complete
 * - Auto-generate new challenges when week changes
 */

import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import { weeklyChallenges, InsertWeeklyChallenge } from "../drizzle/schema";

/**
 * Get the Monday of the current week (start of week)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get the Sunday of the current week (end of week)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

/**
 * Get current week's challenges for a user
 */
export async function getWeeklyChallenges(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  return db
    .select()
    .from(weeklyChallenges)
    .where(
      and(
        eq(weeklyChallenges.userId, userId),
        gte(weeklyChallenges.weekStartDate, weekStart),
        lte(weeklyChallenges.weekEndDate, weekEnd)
      )
    );
}

/**
 * Create new challenges for a user (called once per week)
 */
export async function createWeeklyChallenges(userId: number, challenges: Omit<InsertWeeklyChallenge, "userId" | "weekStartDate" | "weekEndDate">[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  const challengesToInsert: InsertWeeklyChallenge[] = challenges.map((c) => ({
    ...c,
    userId,
    weekStartDate: weekStart,
    weekEndDate: weekEnd,
  }));

  await db.insert(weeklyChallenges).values(challengesToInsert);
}

/**
 * Mark a challenge as complete
 */
export async function completeChallenge(challengeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(weeklyChallenges)
    .set({
      completed: 1,
      completedAt: new Date(),
    })
    .where(eq(weeklyChallenges.id, challengeId));
}

/**
 * Get completed challenges count for current week
 */
export async function getCompletedChallengesCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  const result = await db
    .select({ count: weeklyChallenges.id })
    .from(weeklyChallenges)
    .where(
      and(
        eq(weeklyChallenges.userId, userId),
        eq(weeklyChallenges.completed, 1),
        gte(weeklyChallenges.weekStartDate, weekStart),
        lte(weeklyChallenges.weekEndDate, weekEnd)
      )
    );

  return result.length;
}

/**
 * Default challenges to create for new users
 */
export const DEFAULT_CHALLENGES = [
  {
    title: "Complete your morning routine",
    description: "Finish all habits in your routine",
    xpReward: 100,
  },
  {
    title: "Journal 5 times",
    description: "Write 5 journal entries this week",
    xpReward: 75,
  },
  {
    title: "Maintain your streak",
    description: "Don't break your current streak",
    xpReward: 150,
  },
  {
    title: "Reach 500 XP",
    description: "Earn 500 XP this week",
    xpReward: 200,
  },
  {
    title: "Complete 10 habits",
    description: "Complete 10 individual habits",
    xpReward: 125,
  },
];
