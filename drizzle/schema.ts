import { boolean, bigint, date, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, uniqueIndex } from "drizzle-orm/mysql-core";

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
  supabase_user_id: varchar("supabase_user_id", { length: 255 }).unique(),
  // Ghost Crew v1.0 fields
  friendCode: varchar("friendCode", { length: 6 }).unique(), // 6-char code for adding friends (e.g., K3NZ9X)
  displayName: varchar("displayName", { length: 255 }), // Name shown to friends in Ghost Crew
  avatar: varchar("avatar", { length: 255 }), // Emoji or URL for friend display
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Accountability partners table for Phase 3 social features
 */
export const accountabilityPartners = mysqlTable("accountabilityPartners", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  partnerId: int("partnerId").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "ended"]).default("pending").notNull(),
  matchScore: int("matchScore"), // 0-100 compatibility score
  commonGoals: text("commonGoals"), // JSON array of shared goals
  startDate: date("startDate"),
  endDate: date("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AccountabilityPartner = typeof accountabilityPartners.$inferSelect;
export type InsertAccountabilityPartner = typeof accountabilityPartners.$inferInsert;

/**
 * Ghost Crew friends table for v1.0 social features
 * Uses Supabase user IDs for proper auth integration
 */
export const ghostCrewFriends = mysqlTable(
  "ghostCrewFriends",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(), // Supabase user ID
    friendId: varchar("friendId", { length: 255 }).notNull(), // Supabase user ID
    addedAt: timestamp("addedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdFriendIdUnique: uniqueIndex("ghostCrewFriends_userId_friendId_unique").on(table.userId, table.friendId),
  })
);

export type GhostCrewFriend = typeof ghostCrewFriends.$inferSelect;
export type InsertGhostCrewFriend = typeof ghostCrewFriends.$inferInsert;

/**
 * Mentor groups for community habit tracking
 */
export const mentorGroups = mysqlTable("mentorGroups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  creatorId: int("creatorId").notNull(),
  habitFocus: varchar("habitFocus", { length: 100 }), // e.g., "meditation", "fitness"
  memberCount: int("memberCount").default(1),
  visibility: mysqlEnum("visibility", ["public", "private"]).default("public"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MentorGroup = typeof mentorGroups.$inferSelect;
export type InsertMentorGroup = typeof mentorGroups.$inferInsert;

/**
 * Group membership table
 */
export const groupMembers = mysqlTable("groupMembers", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["member", "moderator", "admin"]).default("member"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = typeof groupMembers.$inferInsert;

/**
 * Leaderboard entries for consistency-based ranking
 */
export const leaderboardEntries = mysqlTable("leaderboardEntries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId"),
  consistencyScore: int("consistencyScore").default(0), // 0-100 based on completion rate
  currentStreak: int("currentStreak").default(0),
  longestStreak: int("longestStreak").default(0),
  completedHabits: int("completedHabits").default(0),
  totalHabits: int("totalHabits").default(0),
  rank: int("rank"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type InsertLeaderboardEntry = typeof leaderboardEntries.$inferInsert;

/**
 * Shared mentor insights for community learning
 */
export const sharedInsights = mysqlTable("sharedInsights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId"),
  insight: text("insight").notNull(), // AI-generated or user-written insight
  habitId: varchar("habitId", { length: 255 }),
  likes: int("likes").default(0),
  shares: int("shares").default(0),
  visibility: mysqlEnum("visibility", ["public", "group", "private"]).default("group"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SharedInsight = typeof sharedInsights.$inferSelect;
export type InsertSharedInsight = typeof sharedInsights.$inferInsert;

/**
 * Community challenges for group engagement
 */
export const communityChallenges = mysqlTable("communityChallenges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  groupId: int("groupId"),
  habitId: varchar("habitId", { length: 255 }).notNull(),
  duration: int("duration").notNull(), // in days
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  participantCount: int("participantCount").default(0),
  reward: varchar("reward", { length: 255 }), // e.g., "badge", "points"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommunityChallenge = typeof communityChallenges.$inferSelect;
export type InsertCommunityChallenge = typeof communityChallenges.$inferInsert;

/**
 * Challenge participation tracking
 */
export const challengeParticipants = mysqlTable("challengeParticipants", {
  id: int("id").autoincrement().primaryKey(),
  challengeId: int("challengeId").notNull(),
  userId: int("userId").notNull(),
  completionRate: int("completionRate").default(0), // 0-100%
  status: mysqlEnum("status", ["active", "completed", "failed", "abandoned"]).default("active"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type InsertChallengeParticipant = typeof challengeParticipants.$inferInsert;

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
 * Mentor Chat table for storing AI mentor conversations.
 * Tracks all messages between user and AI mentor for context and history.
 */
export const mentorChats = mysqlTable("mentorChats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Chat message content */
  message: text("message").notNull(),
  /** Role: 'user' or 'assistant' */
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  /** Mentor personality used for this message */
  mentorPersonality: varchar("mentorPersonality", { length: 50 }).default("supportive").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MentorChat = typeof mentorChats.$inferSelect;
export type InsertMentorChat = typeof mentorChats.$inferInsert;

/**
 * Emotional Check-in table for tracking user's emotional state before habit tracking.
 * Used for AI mentor to understand context and provide better coaching.
 */
export const emotionalCheckIns = mysqlTable("emotionalCheckIns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Date of check-in */
  date: date("date").notNull(),
  /** Mood (1-5 scale: 1=Very Bad, 5=Very Good) */
  mood: int("mood").notNull(),
  /** Energy level (1-10 scale) */
  energy: int("energy").notNull(),
  /** Stress level (1-10 scale) */
  stress: int("stress"),
  /** User's notes about their emotional state */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmotionalCheckIn = typeof emotionalCheckIns.$inferSelect;
export type InsertEmotionalCheckIn = typeof emotionalCheckIns.$inferInsert;

/**
 * Habit Recommendations table for storing personalized daily recommendations.
 * AI mentor generates these based on user's habits, success rates, and emotional state.
 */
export const habitRecommendations = mysqlTable("habitRecommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Date of recommendation */
  date: date("date").notNull(),
  /** Habit ID being recommended */
  habitId: varchar("habitId", { length: 255 }).notNull(),
  /** Reason for recommendation (e.g., "High success rate", "Complements other habits") */
  reason: text("reason").notNull(),
  /** Priority rank (1=highest) */
  rank: int("rank").notNull(),
  /** Whether user accepted this recommendation */
  accepted: boolean("accepted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HabitRecommendation = typeof habitRecommendations.$inferSelect;
export type InsertHabitRecommendation = typeof habitRecommendations.$inferInsert;

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

/**
 * Routine Cancellation Tracking
 * Tracks when user cancels routine and re-achieves for double XP
 */
export const routineCancellations = mysqlTable("routineCancellations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: date("date").notNull(),
  /** Whether routine was cancelled today */
  wasCancelled: boolean("wasCancelled").default(false).notNull(),
  /** Whether routine was re-achieved after cancellation (for double XP) */
  wasReachieved: boolean("wasReachieved").default(false).notNull(),
  /** XP multiplier (1 for normal, 2 for re-achieved) */
  xpMultiplier: int("xpMultiplier").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RoutineCancellation = typeof routineCancellations.$inferSelect;
export type InsertRoutineCancellation = typeof routineCancellations.$inferInsert;

/**
 * Echo Journal - Past journal entries for growth reflection
 * Shows entries from 7/30/90 days ago to highlight personal growth
 */
export const echoJournalViews = mysqlTable("echoJournalViews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Original journal entry ID from 7/30/90 days ago */
  originalEntryId: varchar("originalEntryId", { length: 255 }).notNull(),
  /** Days back (7, 30, or 90) */
  daysBack: int("daysBack").notNull(),
  /** AI-generated growth highlights comparing then vs now */
  growthHighlights: text("growthHighlights"),
  /** When this echo was shown to user */
  shownAt: timestamp("shownAt").defaultNow().notNull(),
  /** Whether user marked this as meaningful */
  wasMeaningful: boolean("wasMeaningful").default(false).notNull(),
});
export type EchoJournalView = typeof echoJournalViews.$inferSelect;
export type InsertEchoJournalView = typeof echoJournalViews.$inferInsert;

/**
 * Ghost Mirror - Weekly future self visualization
 * AI generates a short "future self" message based on current progress
 */
export const ghostMirrors = mysqlTable("ghostMirrors", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Week start date */
  weekStartDate: date("weekStartDate").notNull(),
  /** AI-generated future self visualization (short message) */
  visualization: text("visualization").notNull(),
  /** Streak at time of generation */
  streakAtGeneration: int("streakAtGeneration").notNull(),
  /** XP at time of generation */
  xpAtGeneration: int("xpAtGeneration").notNull(),
  /** When user viewed this mirror */
  viewedAt: timestamp("viewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type GhostMirror = typeof ghostMirrors.$inferSelect;
export type InsertGhostMirror = typeof ghostMirrors.$inferInsert;

/**
 * Mood Time Machine - Historical mood data for comparison
 * Stores mood snapshots for 1/3/6 month lookback
 */
export const moodSnapshots = mysqlTable("moodSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: date("date").notNull(),
  /** Mood level (1-5) on this date */
  moodLevel: int("moodLevel").notNull(),
  /** Optional note about mood */
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MoodSnapshot = typeof moodSnapshots.$inferSelect;
export type InsertMoodSnapshot = typeof moodSnapshots.$inferInsert;

// ─── Milestone 2: Core App State Sync Tables ─────────────────────────────────

/**
 * User habits — synced from AppState.habits.
 * clientId is the local UUID (e.g. "h1", "h-abc123").
 * Soft-delete via deletedAt: null = active, timestamp = deleted.
 */
export const userHabits = mysqlTable(
  "userHabits",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(), // Supabase user ID
    clientId: varchar("clientId", { length: 255 }).notNull(), // local UUID
    name: varchar("name", { length: 255 }).notNull(),
    icon: varchar("icon", { length: 10 }).notNull(), // emoji
    durationMin: int("durationMin").default(0).notNull(),
    isDefault: boolean("isDefault").default(false).notNull(),
    order: int("order").default(0).notNull(),
    deletedAt: timestamp("deletedAt"), // null = active
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (t) => ({
    userClientIdx: uniqueIndex("userHabits_userId_clientId_unique").on(t.userId, t.clientId),
  }),
);
export type UserHabit = typeof userHabits.$inferSelect;
export type InsertUserHabit = typeof userHabits.$inferInsert;

/**
 * Habit completions — synced from AppState.completions.
 * One row per (userId, habitClientId, date).
 */
export const habitCompletions = mysqlTable(
  "habitCompletions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    habitClientId: varchar("habitClientId", { length: 255 }).notNull(), // matches userHabits.clientId
    date: varchar("date", { length: 10 }).notNull(), // "YYYY-MM-DD"
    completedAt: bigint("completedAt", { mode: "number" }).notNull(), // unix ms
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    userHabitDateIdx: uniqueIndex("habitCompletions_userId_habitClientId_date_unique").on(
      t.userId,
      t.habitClientId,
      t.date,
    ),
  }),
);
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type InsertHabitCompletion = typeof habitCompletions.$inferInsert;

/**
 * Journal entries — synced from AppState.journalEntries.
 * clientId is the local UUID assigned when the entry is created.
 */
export const journalEntries = mysqlTable(
  "journalEntries",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    clientId: varchar("clientId", { length: 255 }).notNull(), // local UUID
    date: varchar("date", { length: 10 }).notNull(), // "YYYY-MM-DD"
    content: text("content").notNull(),
    prompt: text("prompt").notNull(),
    moodLevel: int("moodLevel"), // 1-5, nullable
    createdAt: bigint("createdAt", { mode: "number" }).notNull(), // unix ms
    syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  },
  (t) => ({
    userClientIdx: uniqueIndex("journalEntries_userId_clientId_unique").on(t.userId, t.clientId),
  }),
);
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

/**
 * User progress — one row per user, server-authoritative for XP and streak.
 * ghostCode is NOT stored here — it lives in users.friendCode to avoid duplication.
 */
export const userProgress = mysqlTable("userProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull().unique(), // one row per user
  xp: int("xp").default(0).notNull(),
  streak: int("streak").default(0).notNull(),
  lastActiveDate: varchar("lastActiveDate", { length: 10 }), // "YYYY-MM-DD" or null
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  // Milestone 3: Mentor chat rate limiting
  mentorMessagesUsed: int("mentorMessagesUsed").default(0).notNull(),
  mentorMessagesResetAt: timestamp("mentorMessagesResetAt").defaultNow().notNull(),
});
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

/**
 * User achievements — synced from AppState.achievements.
 * achievementId matches the Achievement.id string from the client.
 */
export const userAchievements = mysqlTable(
  "userAchievements",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    achievementId: varchar("achievementId", { length: 255 }).notNull(), // matches Achievement.id
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    icon: varchar("icon", { length: 10 }).notNull(),
    unlockedAt: bigint("unlockedAt", { mode: "number" }), // unix ms, null = locked
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    userAchievementIdx: uniqueIndex("userAchievements_userId_achievementId_unique").on(
      t.userId,
      t.achievementId,
    ),
  }),
);
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

/**
 * User side quests — synced from AppState.sideQuests.
 * questId matches the SideQuest.id string from the client.
 */
export const userSideQuests = mysqlTable(
  "userSideQuests",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    questId: varchar("questId", { length: 255 }).notNull(), // matches SideQuest.id
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    icon: varchar("icon", { length: 10 }).notNull(),
    durationDays: int("durationDays").notNull(),
    xpReward: int("xpReward").notNull(),
    badgeId: varchar("badgeId", { length: 255 }).notNull(),
    category: mysqlEnum("category", ["discipline", "wellness", "mindset", "body"]).notNull(),
    startedAt: bigint("startedAt", { mode: "number" }), // unix ms, null = not started
    completedAt: bigint("completedAt", { mode: "number" }), // unix ms, null = not completed
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (t) => ({
    userQuestIdx: uniqueIndex("userSideQuests_userId_questId_unique").on(t.userId, t.questId),
  }),
);
export type UserSideQuest = typeof userSideQuests.$inferSelect;
export type InsertUserSideQuest = typeof userSideQuests.$inferInsert;

/**
 * AI usage logs — tracks every Anthropic API call for cost monitoring.
 * One row per API call, keyed by userId + feature + timestamp.
 */
export const aiUsageLogs = mysqlTable("aiUsageLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  feature: varchar("feature", { length: 50 }).notNull(),
  model: varchar("model", { length: 50 }).notNull(),
  inputTokens: int("inputTokens").default(0).notNull(),
  outputTokens: int("outputTokens").default(0).notNull(),
  estimatedCostUsd: decimal("estimatedCostUsd", { precision: 8, scale: 6 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AiUsageLog = typeof aiUsageLogs.$inferSelect;
export type InsertAiUsageLog = typeof aiUsageLogs.$inferInsert;

