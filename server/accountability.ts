/**
 * Accountability Features Server Logic
 * Handles Habit Stacking, Future Self Letters, Motivational Quotes, and Weekly Reminders
 */

import { eq, and, desc, gte, lt } from "drizzle-orm";
import {
  habitStacks,
  futureLetters,
  motivationalQuotes,
  weeklyReminders,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get habit stacking suggestions for a user
 * Returns habits that can be stacked after completing a given habit
 */
export async function getHabitStackingSuggestions(
  userId: number,
  completedHabitId: string
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const stacks = await db
      .select()
      .from(habitStacks)
      .where(
        and(
          eq(habitStacks.userId, userId),
          eq(habitStacks.anchorHabitId, completedHabitId),
          eq(habitStacks.isActive, true)
        )
      );

    return stacks;
  } catch (error) {
    console.error("Error fetching habit stacking suggestions:", error);
    return [];
  }
}

/**
 * Create a new habit stack
 */
export async function createHabitStack(
  userId: number,
  anchorHabitId: string,
  stackedHabitId: string,
  instruction?: string
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(habitStacks).values({
      userId,
      anchorHabitId,
      stackedHabitId,
      instruction,
      isActive: true,
      completionCount: 0,
    });

    return result;
  } catch (error) {
    console.error("Error creating habit stack:", error);
    return null;
  }
}

/**
 * Increment habit stack completion count
 */
export async function incrementStackCompletion(stackId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const stack = await db
      .select()
      .from(habitStacks)
      .where(eq(habitStacks.id, stackId));

    if (!stack.length) return null;

    const updated = await db
      .update(habitStacks)
      .set({
        completionCount: (stack[0].completionCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(habitStacks.id, stackId));

    return updated;
  } catch (error) {
    console.error("Error incrementing stack completion:", error);
    return null;
  }
}

/**
 * Save or update user's future self letter
 */
export async function saveFutureLetter(
  userId: number,
  content: string,
  reason: string,
  mantra?: string
) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Check if letter already exists
    const existing = await db
      .select()
      .from(futureLetters)
      .where(eq(futureLetters.userId, userId));

    if (existing.length > 0) {
      // Update existing
      const updated = await db
        .update(futureLetters)
        .set({
          content,
          reason,
          mantra,
          updatedAt: new Date(),
        })
        .where(eq(futureLetters.userId, userId));

      return updated;
    } else {
      // Create new
      const result = await db.insert(futureLetters).values({
        userId,
        content,
        reason,
        mantra,
        viewCount: 0,
      });

      return result;
    }
  } catch (error) {
    console.error("Error saving future letter:", error);
    return null;
  }
}

/**
 * Get user's future self letter
 */
export async function getFutureLetter(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const letter = await db
      .select()
      .from(futureLetters)
      .where(eq(futureLetters.userId, userId));

    return letter.length > 0 ? letter[0] : null;
  } catch (error) {
    console.error("Error fetching future letter:", error);
    return null;
  }
}

/**
 * Increment future letter view count
 */
export async function incrementLetterViewCount(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const letter = await getFutureLetter(userId);
    if (!letter) return null;

    const updated = await db
      .update(futureLetters)
      .set({
        viewCount: (letter.viewCount || 0) + 1,
        lastShownAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(futureLetters.userId, userId));

    return updated;
  } catch (error) {
    console.error("Error incrementing letter view count:", error);
    return null;
  }
}

/**
 * Get motivational quotes for a user
 * Returns quotes filtered by category
 */
export async function getMotivationalQuotes(
  userId: number,
  category?: "quit-prevention" | "daily" | "milestone" | "custom"
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [
      eq(motivationalQuotes.userId, userId),
      eq(motivationalQuotes.isActive, true),
    ];

    if (category) {
      conditions.push(eq(motivationalQuotes.category, category));
    }

    const quotes = await db
      .select()
      .from(motivationalQuotes)
      .where(and(...conditions));

    return quotes;
  } catch (error) {
    console.error("Error fetching motivational quotes:", error);
    return [];
  }
}

/**
 * Get a random motivational quote for quit-prevention
 */
export async function getQuitPreventionQuote(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const quotes = await getMotivationalQuotes(userId, "quit-prevention");
    if (quotes.length === 0) return null;

    // Return random quote
    return quotes[Math.floor(Math.random() * quotes.length)];
  } catch (error) {
    console.error("Error getting quit-prevention quote:", error);
    return null;
  }
}

/**
 * Add a motivational quote for user
 */
export async function addMotivationalQuote(
  userId: number,
  quote: string,
  category: "quit-prevention" | "daily" | "milestone" | "custom",
  author?: string
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(motivationalQuotes).values({
      userId,
      quote,
      category,
      author,
      isActive: true,
      showCount: 0,
    });

    return result;
  } catch (error) {
    console.error("Error adding motivational quote:", error);
    return null;
  }
}

/**
 * Increment quote show count
 */
export async function incrementQuoteShowCount(quoteId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const quote = await db
      .select()
      .from(motivationalQuotes)
      .where(eq(motivationalQuotes.id, quoteId));

    if (!quote.length) return null;

    const updated = await db
      .update(motivationalQuotes)
      .set({
        showCount: (quote[0].showCount || 0) + 1,
        lastShownAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(motivationalQuotes.id, quoteId));

    return updated;
  } catch (error) {
    console.error("Error incrementing quote show count:", error);
    return null;
  }
}

/**
 * Create weekly reminder with letter and quote
 */
export async function createWeeklyReminder(
  userId: number,
  weekStartDate: Date,
  weeklySummary: string,
  letterIdShown?: number,
  quoteIdShown?: number
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(weeklyReminders).values({
      userId,
      weekStartDate,
      letterIdShown,
      quoteIdShown,
      weeklySummary,
      wasViewed: false,
    });

    return result;
  } catch (error) {
    console.error("Error creating weekly reminder:", error);
    return null;
  }
}

/**
 * Get latest weekly reminder for user
 */
export async function getLatestWeeklyReminder(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const reminder = await db
      .select()
      .from(weeklyReminders)
      .where(eq(weeklyReminders.userId, userId))
      .orderBy(desc(weeklyReminders.weekStartDate))
      .limit(1);

    return reminder.length > 0 ? reminder[0] : null;
  } catch (error) {
    console.error("Error fetching latest weekly reminder:", error);
    return null;
  }
}

/**
 * Mark weekly reminder as viewed
 */
export async function markReminderAsViewed(reminderId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const updated = await db
      .update(weeklyReminders)
      .set({
        wasViewed: true,
        viewedAt: new Date(),
      })
      .where(eq(weeklyReminders.id, reminderId));

    return updated;
  } catch (error) {
    console.error("Error marking reminder as viewed:", error);
    return null;
  }
}

/**
 * Check if user should receive weekly reminder (once per week)
 */
export async function shouldSendWeeklyReminder(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return true;

  try {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentReminders = await db
      .select()
      .from(weeklyReminders)
      .where(
        and(
          eq(weeklyReminders.userId, userId),
          gte(weeklyReminders.createdAt, weekAgo)
        )
      );

    return recentReminders.length === 0;
  } catch (error) {
    console.error("Error checking weekly reminder eligibility:", error);
    return true;
  }
}
