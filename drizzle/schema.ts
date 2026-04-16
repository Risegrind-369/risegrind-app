import { boolean, date, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User profile table for storing personalized onboarding answers.
 * Used to personalize AI mentor, routine generation, and insights.
 */
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** User's first name from onboarding */
  firstName: varchar("firstName", { length: 100 }),
  /** User's age from onboarding */
  age: int("age"),
  /** Answer to 'Why don't you feel good enough?' */
  empathyAnswer: text("empathyAnswer"),
  /** Answer to 'How do you want to become better?' */
  goalAnswer: text("goalAnswer"),
  /** Main goals selected (JSON array) */
  mainGoals: text("mainGoals"),
  /** Biggest problems selected (JSON array) */
  biggestProblems: text("biggestProblems"),
  /** Preferred wake time */
  wakeTime: varchar("wakeTime", { length: 10 }),
  /** Motivation/coaching style preference */
  motivationStyle: varchar("motivationStyle", { length: 100 }),
  /** Language preference (en, fr, pt) */
  language: varchar("language", { length: 10 }).default("en"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Weekly challenges table for tracking challenges that reset every week.
 * Each user gets a fresh set of challenges every Monday.
 */
export const weeklyChallenges = mysqlTable("weeklyChallenges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Challenge title (e.g., "Complete 5 workouts", "Meditate daily") */
  title: varchar("title", { length: 255 }).notNull(),
  /** Challenge description */
  description: text("description"),
  /** XP reward for completing this challenge */
  xpReward: int("xpReward").default(50).notNull(),
  /** Whether this challenge has been completed */
  completed: int("completed").default(0).notNull(),
  /** Week start date (Monday of the week) */
  weekStartDate: timestamp("weekStartDate").notNull(),
  /** Week end date (Sunday of the week) */
  weekEndDate: timestamp("weekEndDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type WeeklyChallenge = typeof weeklyChallenges.$inferSelect;
export type InsertWeeklyChallenge = typeof weeklyChallenges.$inferInsert;

/**
 * Recovery quests table for Ghost Streak Protection.
 * When a user misses a habit, offer a 5-10 min recovery quest to save/recover streak.
 */
export const recoveryQuests = mysqlTable("recoveryQuests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Habit ID that was missed */
  habitId: varchar("habitId", { length: 255 }).notNull(),
  /** Date the habit was missed */
  missedDate: date("missedDate").notNull(),
  /** Recovery quest description (e.g., "Do 5 min meditation") */
  questDescription: text("questDescription").notNull(),
  /** Duration in minutes (5-10) */
  durationMin: int("durationMin").default(5).notNull(),
  /** Whether the recovery quest was completed */
  completed: int("completed").default(0).notNull(),
  /** Streak recovery amount (0-100%, e.g., 50 = 50% recovery) */
  streakRecoveryPercent: int("streakRecoveryPercent").default(50).notNull(),
  /** Expiry time (user has X hours to complete) */
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type RecoveryQuest = typeof recoveryQuests.$inferSelect;
export type InsertRecoveryQuest = typeof recoveryQuests.$inferInsert;

/**
 * Missed habit reasons table for "Why Did I Miss?" AI Coach.
 * Stores user's explanation when they miss a habit, for pattern learning.
 */
export const missedHabitReasons = mysqlTable("missedHabitReasons", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Habit ID that was missed */
  habitId: varchar("habitId", { length: 255 }).notNull(),
  /** Date the habit was missed */
  missedDate: date("missedDate").notNull(),
  /** User's explanation (e.g., "Too tired", "Forgot", "Busy day") */
  reason: text("reason").notNull(),
  /** AI coach's empathetic response */
  aiResponse: text("aiResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MissedHabitReason = typeof missedHabitReasons.$inferSelect;
export type InsertMissedHabitReason = typeof missedHabitReasons.$inferInsert;

/**
 * Apple Health data table for storing synced health metrics.
 * Stores sleep, steps, and active energy data for Morning Energy Score calculation.
 */
export const healthData = mysqlTable("healthData", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Date of the health data */
  date: date("date").notNull(),
  /** Sleep duration in hours */
  sleepHours: decimal("sleepHours", { precision: 4, scale: 2 }),
  /** Steps count for the day */
  steps: int("steps"),
  /** Active energy burned (kcal) */
  activeEnergy: int("activeEnergy"),
  /** Morning Energy Score (0-100) calculated from sleep + activity */
  morningEnergyScore: int("morningEnergyScore"),
  /** Last sync timestamp */
  lastSyncedAt: timestamp("lastSyncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HealthData = typeof healthData.$inferSelect;
export type InsertHealthData = typeof healthData.$inferInsert;

/**
 * Habit Stacking table for linking habits together.
 * Enables "After X habit, do Y habit" suggestions.
 */
export const habitStacks = mysqlTable("habitStacks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** The anchor habit (e.g., "Drink coffee") */
  anchorHabitId: varchar("anchorHabitId", { length: 255 }).notNull(),
  /** The new habit to stack (e.g., "Meditate") */
  stackedHabitId: varchar("stackedHabitId", { length: 255 }).notNull(),
  /** User's custom stacking instruction (e.g., "After coffee, meditate for 5 min") */
  instruction: text("instruction"),
  /** Whether this stack is active */
  isActive: boolean("isActive").default(true).notNull(),
  /** Completion count for this stack */
  completionCount: int("completionCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HabitStack = typeof habitStacks.$inferSelect;
export type InsertHabitStack = typeof habitStacks.$inferInsert;

/**
 * Future Self Letter table for storing user's motivational letters.
 * Shows weekly to remind user why they want to become better.
 */
export const futureLetters = mysqlTable("futureLetters", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Letter content written by user */
  content: text("content").notNull(),
  /** User's reason for becoming better */
  reason: text("reason").notNull(),
  /** Quote or mantra user wants to remember */
  mantra: text("mantra"),
  /** Last time letter was shown to user */
  lastShownAt: timestamp("lastShownAt"),
  /** How many times letter has been shown */
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FutureLetter = typeof futureLetters.$inferSelect;
export type InsertFutureLetter = typeof futureLetters.$inferInsert;

/**
 * Motivational Quotes table for quit-prevention and daily inspiration.
 * Shows when user is about to quit or during weekly reminders.
 */
export const motivationalQuotes = mysqlTable("motivationalQuotes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Quote text */
  quote: text("quote").notNull(),
  /** Author or source */
  author: varchar("author", { length: 255 }),
  /** Category: "quit-prevention", "daily", "milestone", "custom" */
  category: mysqlEnum("category", ["quit-prevention", "daily", "milestone", "custom"]).notNull(),
  /** Whether this quote is active */
  isActive: boolean("isActive").default(true).notNull(),
  /** Times this quote has been shown */
  showCount: int("showCount").default(0).notNull(),
  /** Last time this quote was shown */
  lastShownAt: timestamp("lastShownAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MotivationalQuote = typeof motivationalQuotes.$inferSelect;
export type InsertMotivationalQuote = typeof motivationalQuotes.$inferInsert;

/**
 * Weekly Reminder Log table for tracking when weekly reminders are sent.
 * Stores letter content, summary, and quotes shown in each weekly reminder.
 */
export const weeklyReminders = mysqlTable("weeklyReminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Week start date */
  weekStartDate: date("weekStartDate").notNull(),
  /** Letter ID shown in this reminder */
  letterIdShown: int("letterIdShown"),
  /** Quote ID shown in this reminder */
  quoteIdShown: int("quoteIdShown"),
  /** Weekly summary (habits completed, XP earned, etc.) */
  weeklySummary: text("weeklySummary"),
  /** Whether reminder was viewed by user */
  wasViewed: boolean("wasViewed").default(false).notNull(),
  /** When reminder was viewed */
  viewedAt: timestamp("viewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type WeeklyReminder = typeof weeklyReminders.$inferSelect;
export type InsertWeeklyReminder = typeof weeklyReminders.$inferInsert;

// TODO: Add your tables here
