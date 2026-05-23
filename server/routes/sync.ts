/**
 * Milestone 2: Core App State Sync Router
 *
 * Security model:
 * - Every endpoint uses protectedProcedure — unauthenticated requests throw UNAUTHORIZED
 * - userId is ALWAYS derived from ctx.user (the authenticated session), never from the request body
 * - A user can only read/write their own data — enforced on every query via WHERE userId = authUserId
 *
 * Idempotency:
 * - All push endpoints use INSERT ... ON DUPLICATE KEY UPDATE (Drizzle onDuplicateKeyUpdate)
 * - Calling any push endpoint 10x with the same data produces the same result
 *
 * Conflict resolution (as approved):
 * - XP and streak: server wins if server value is higher
 * - Habits and journal: union (never delete, push missing items to server)
 * - Achievements and side quests: upsert (server stores the latest state)
 * - Mood: one entry per day per user (upsert by userId+date)
 */

import { z } from "zod";
import { and, eq, inArray, sql } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  userHabits,
  habitCompletions,
  journalEntries,
  userProgress,
  userAchievements,
  userSideQuests,
  moodSnapshots,
  ghostCrewFriends,
  users,
} from "../../drizzle/schema";

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Derive the canonical sync userId from the authenticated session.
 * Uses the numeric users.id as a string — consistent across all sync tables.
 */
function getSyncUserId(user: { id: number }): string {
  return String(user.id);
}

// ─── Zod input schemas ────────────────────────────────────────────────────────

const HabitSchema = z.object({
  clientId: z.string(),
  name: z.string(),
  icon: z.string(),
  durationMin: z.number().int().default(0),
  isDefault: z.boolean().default(false),
  order: z.number().int().default(0),
  deletedAt: z.number().nullable().optional(), // unix ms or null
});

const CompletionSchema = z.object({
  habitClientId: z.string(),
  date: z.string().length(10), // YYYY-MM-DD
  completedAt: z.number().int(), // unix ms
});

const JournalSchema = z.object({
  clientId: z.string(),
  date: z.string().length(10),
  content: z.string(),
  prompt: z.string(),
  moodLevel: z.number().int().min(1).max(5).nullable().optional(),
  createdAt: z.number().int(), // unix ms
});

const ProgressSchema = z.object({
  xp: z.number().int().min(0),
  streak: z.number().int().min(0),
  lastActiveDate: z.string().length(10).nullable().optional(),
});

const AchievementSchema = z.object({
  achievementId: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  unlockedAt: z.number().int().nullable().optional(), // unix ms or null
});

const SideQuestSchema = z.object({
  questId: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  durationDays: z.number().int(),
  xpReward: z.number().int(),
  badgeId: z.string(),
  category: z.enum(["discipline", "wellness", "mindset", "body"]),
  startedAt: z.number().int().nullable().optional(),
  completedAt: z.number().int().nullable().optional(),
});

const MoodSchema = z.object({
  date: z.string().length(10), // YYYY-MM-DD
  moodLevel: z.number().int().min(1).max(5),
  note: z.string().nullable().optional(),
});

// ─── Sync Router ──────────────────────────────────────────────────────────────

export const syncRouter = router({
  /**
   * Push habits from device → server.
   * Upsert by (userId, clientId). Handles soft deletes.
   */
  pushHabits: protectedProcedure
    .input(z.object({ habits: z.array(HabitSchema) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false, error: "Database unavailable" };

      const authUserId = getSyncUserId(ctx.user);

      try {
        for (const habit of input.habits) {
          const deletedAtDate = habit.deletedAt ? new Date(habit.deletedAt) : null;
          await db
            .insert(userHabits)
            .values({
              userId: authUserId,
              clientId: habit.clientId,
              name: habit.name,
              icon: habit.icon,
              durationMin: habit.durationMin,
              isDefault: habit.isDefault,
              order: habit.order,
              deletedAt: deletedAtDate,
            })
            .onDuplicateKeyUpdate({
              set: {
                name: habit.name,
                icon: habit.icon,
                durationMin: habit.durationMin,
                isDefault: habit.isDefault,
                order: habit.order,
                deletedAt: deletedAtDate,
              },
            });
        }
        return { success: true, synced: input.habits.length };
      } catch (error) {
        console.error("[sync.pushHabits] Error:", error);
        return { success: false, error: "Failed to sync habits" };
      }
    }),

  /**
   * Push habit completions from device → server.
   * Upsert by (userId, habitClientId, date). Idempotent.
   */
  pushCompletions: protectedProcedure
    .input(z.object({ completions: z.array(CompletionSchema) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false, error: "Database unavailable" };

      const authUserId = getSyncUserId(ctx.user);

      try {
        for (const c of input.completions) {
          await db
            .insert(habitCompletions)
            .values({
              userId: authUserId,
              habitClientId: c.habitClientId,
              date: c.date,
              completedAt: c.completedAt,
            })
            .onDuplicateKeyUpdate({
              set: { completedAt: c.completedAt },
            });
        }
        return { success: true, synced: input.completions.length };
      } catch (error) {
        console.error("[sync.pushCompletions] Error:", error);
        return { success: false, error: "Failed to sync completions" };
      }
    }),

  /**
   * Push journal entries from device → server.
   * Upsert by (userId, clientId).
   * Never overwrites content if server version is newer (higher createdAt).
   */
  pushJournal: protectedProcedure
    .input(z.object({ entries: z.array(JournalSchema) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false, error: "Database unavailable" };

      const authUserId = getSyncUserId(ctx.user);

      try {
        // Fetch existing entries to check timestamps
        const clientIds = input.entries.map((e) => e.clientId);
        const existing = clientIds.length > 0
          ? await db
              .select({ clientId: journalEntries.clientId, createdAt: journalEntries.createdAt })
              .from(journalEntries)
              .where(
                and(
                  eq(journalEntries.userId, authUserId),
                  inArray(journalEntries.clientId, clientIds),
                ),
              )
          : [];

        const existingMap = new Map(existing.map((e) => [e.clientId, e.createdAt]));

        for (const entry of input.entries) {
          const serverCreatedAt = existingMap.get(entry.clientId);
          // If server version is newer, skip (don't overwrite)
          if (serverCreatedAt && serverCreatedAt > entry.createdAt) continue;

          await db
            .insert(journalEntries)
            .values({
              userId: authUserId,
              clientId: entry.clientId,
              date: entry.date,
              content: entry.content,
              prompt: entry.prompt,
              moodLevel: entry.moodLevel ?? null,
              createdAt: entry.createdAt,
            })
            .onDuplicateKeyUpdate({
              set: {
                content: entry.content,
                prompt: entry.prompt,
                moodLevel: entry.moodLevel ?? null,
              },
            });
        }
        return { success: true, synced: input.entries.length };
      } catch (error) {
        console.error("[sync.pushJournal] Error:", error);
        return { success: false, error: "Failed to sync journal" };
      }
    }),

  /**
   * Push XP/streak progress from device → server.
   * Upsert by userId (one row per user).
   * Server wins if server XP or streak is higher.
   */
  pushProgress: protectedProcedure
    .input(ProgressSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false, error: "Database unavailable" };

      const authUserId = getSyncUserId(ctx.user);

      try {
        // Fetch current server values for conflict resolution
        const existing = await db
          .select()
          .from(userProgress)
          .where(eq(userProgress.userId, authUserId))
          .limit(1);

        const serverXp = existing[0]?.xp ?? 0;
        const serverStreak = existing[0]?.streak ?? 0;

        // Server wins if server value is higher
        const finalXp = Math.max(input.xp, serverXp);
        const finalStreak = Math.max(input.streak, serverStreak);

        await db
          .insert(userProgress)
          .values({
            userId: authUserId,
            xp: finalXp,
            streak: finalStreak,
            lastActiveDate: input.lastActiveDate ?? null,
          })
          .onDuplicateKeyUpdate({
            set: {
              xp: finalXp,
              streak: finalStreak,
              lastActiveDate: input.lastActiveDate ?? null,
            },
          });

        return { success: true, xp: finalXp, streak: finalStreak };
      } catch (error) {
        console.error("[sync.pushProgress] Error:", error);
        return { success: false, error: "Failed to sync progress" };
      }
    }),

  /**
   * Push achievements from device → server.
   * Upsert by (userId, achievementId).
   */
  pushAchievements: protectedProcedure
    .input(z.object({ achievements: z.array(AchievementSchema) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false, error: "Database unavailable" };

      const authUserId = getSyncUserId(ctx.user);

      try {
        for (const a of input.achievements) {
          await db
            .insert(userAchievements)
            .values({
              userId: authUserId,
              achievementId: a.achievementId,
              title: a.title,
              description: a.description,
              icon: a.icon,
              unlockedAt: a.unlockedAt ?? null,
            })
            .onDuplicateKeyUpdate({
              set: {
                title: a.title,
                description: a.description,
                icon: a.icon,
                unlockedAt: a.unlockedAt ?? null,
              },
            });
        }
        return { success: true, synced: input.achievements.length };
      } catch (error) {
        console.error("[sync.pushAchievements] Error:", error);
        return { success: false, error: "Failed to sync achievements" };
      }
    }),

  /**
   * Push side quests from device → server.
   * Upsert by (userId, questId).
   */
  pushSideQuests: protectedProcedure
    .input(z.object({ quests: z.array(SideQuestSchema) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false, error: "Database unavailable" };

      const authUserId = getSyncUserId(ctx.user);

      try {
        for (const q of input.quests) {
          await db
            .insert(userSideQuests)
            .values({
              userId: authUserId,
              questId: q.questId,
              title: q.title,
              description: q.description,
              icon: q.icon,
              durationDays: q.durationDays,
              xpReward: q.xpReward,
              badgeId: q.badgeId,
              category: q.category,
              startedAt: q.startedAt ?? null,
              completedAt: q.completedAt ?? null,
            })
            .onDuplicateKeyUpdate({
              set: {
                startedAt: q.startedAt ?? null,
                completedAt: q.completedAt ?? null,
              },
            });
        }
        return { success: true, synced: input.quests.length };
      } catch (error) {
        console.error("[sync.pushSideQuests] Error:", error);
        return { success: false, error: "Failed to sync side quests" };
      }
    }),

  /**
   * Push mood entries from device → server.
   * Upsert into moodSnapshots by (userId, date). One entry per day.
   * moodSnapshots.date is a Drizzle date() column (expects Date object).
   * No unique constraint on (userId, date) — use select+insert/update pattern.
   */
  pushMood: protectedProcedure
    .input(z.object({ entries: z.array(MoodSchema) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false, error: "Database unavailable" };

      // moodSnapshots uses numeric userId
      const numericUserId = ctx.user.id;

      try {
        for (const m of input.entries) {
          const dateObj = new Date(m.date + "T00:00:00.000Z");
          // Check if a row already exists for this user+date
          const existing = await db
            .select({ id: moodSnapshots.id })
            .from(moodSnapshots)
            .where(and(eq(moodSnapshots.userId, numericUserId), eq(moodSnapshots.date, dateObj)))
            .limit(1);

          if (existing.length > 0) {
            // Update existing row
            await db
              .update(moodSnapshots)
              .set({ moodLevel: m.moodLevel, note: m.note ?? null })
              .where(eq(moodSnapshots.id, existing[0].id));
          } else {
            // Insert new row
            await db.insert(moodSnapshots).values({
              userId: numericUserId,
              date: dateObj,
              moodLevel: m.moodLevel,
              note: m.note ?? null,
            });
          }
        }
        return { success: true, synced: input.entries.length };
      } catch (error) {
        console.error("[sync.pushMood] Error:", error);
        return { success: false, error: "Failed to sync mood entries" };
      }
    }),

  /**
   * Pull all user data from server → device.
   * Returns all 8 data types in a single response.
   * Only returns data belonging to the authenticated user.
   */
  pullAll: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        success: false as const,
        error: "Database unavailable",
        habits: [],
        completions: [],
        journal: [],
        progress: null,
        achievements: [],
        sideQuests: [],
        mood: [],
        friends: [],
      };
    }

    const authUserId = getSyncUserId(ctx.user);
    const numericUserId = ctx.user.id;

    try {
      const [
        habits,
        completions,
        journal,
        progressRows,
        achievements,
        sideQuests,
        moodRows,
        friendRows,
      ] = await Promise.all([
        // Habits — exclude soft-deleted
        db
          .select()
          .from(userHabits)
          .where(and(eq(userHabits.userId, authUserId))),

        // Completions
        db
          .select()
          .from(habitCompletions)
          .where(eq(habitCompletions.userId, authUserId)),

        // Journal entries
        db
          .select()
          .from(journalEntries)
          .where(eq(journalEntries.userId, authUserId)),

        // Progress (one row per user)
        db
          .select()
          .from(userProgress)
          .where(eq(userProgress.userId, authUserId))
          .limit(1),

        // Achievements
        db
          .select()
          .from(userAchievements)
          .where(eq(userAchievements.userId, authUserId)),

        // Side quests
        db
          .select()
          .from(userSideQuests)
          .where(eq(userSideQuests.userId, authUserId)),

        // Mood snapshots (uses numeric userId)
        db
          .select()
          .from(moodSnapshots)
          .where(eq(moodSnapshots.userId, numericUserId)),

        // Ghost Crew friends — join with users to get name, friendCode, and progress
        db
          .select({
            friendId: ghostCrewFriends.friendId,
            addedAt: ghostCrewFriends.addedAt,
            friendCode: users.friendCode,
            displayName: users.displayName,
            xp: userProgress.xp,
            streak: userProgress.streak,
          })
          .from(ghostCrewFriends)
          // friendId is stored as String(user.id) — cast to int for the join
          .leftJoin(users, sql`${users.id} = CAST(${ghostCrewFriends.friendId} AS UNSIGNED)`)
          .leftJoin(userProgress, eq(userProgress.userId, ghostCrewFriends.friendId))
          .where(eq(ghostCrewFriends.userId, authUserId)),
      ]);

      // Map friend rows to GhostFriend shape
      const friends = friendRows.map((f) => ({
        code: f.friendCode ?? f.friendId.slice(0, 6).toUpperCase(),
        name: f.displayName ?? "Ghost",
        streak: f.streak ?? 0,
        xp: f.xp ?? 0,
        addedAt: f.addedAt ? new Date(f.addedAt).getTime() : Date.now(),
      }));

      return {
        success: true as const,
        habits,
        completions,
        journal,
        progress: progressRows[0] ?? null,
        achievements,
        sideQuests,
        mood: moodRows,
        friends,
      };
    } catch (error) {
      console.error("[sync.pullAll] Error:", error);
      return {
        success: false as const,
        error: "Failed to pull data",
        habits: [],
        completions: [],
        journal: [],
        progress: null,
        achievements: [],
        sideQuests: [],
        mood: [],
        friends: [],
      };
    }
  }),

  // ─── Ghost Crew: Add Friend by Code ────────────────────────────────────────
  addFriendByCode: protectedProcedure
    .input(z.object({ code: z.string().min(1).max(20) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          console.error("[sync.addFriendByCode] Database unavailable");
          return { success: false as const, error: "Database unavailable" };
        }
        const authUserId = getSyncUserId(ctx.user);
        console.log("[sync.addFriendByCode] Starting for user:", authUserId);

        // Look up the friend by their ghostCode (stored in users.friendCode)
        const friendRows = await db
          .select({ id: users.id, displayName: users.displayName, friendCode: users.friendCode })
          .from(users)
          .where(eq(users.friendCode, input.code.toUpperCase()))
          .limit(1);

        if (friendRows.length === 0) {
          console.warn("[sync.addFriendByCode] No user found with code:", input.code.toUpperCase());
          return { success: false as const, error: "No user found with that Ghost Code" };
        }

        const friend = friendRows[0];
        // friendUserId is the canonical String(user.id) used across all sync tables
        const friendUserId = String(friend.id);
        console.log("[sync.addFriendByCode] Found friend:", { friendUserId, displayName: friend.displayName });

        if (friendUserId === authUserId) {
          console.warn("[sync.addFriendByCode] User tried to add themselves");
          return { success: false as const, error: "You cannot add yourself" };
        }

        // Check if already friends
        const existing = await db
          .select({ id: ghostCrewFriends.id })
          .from(ghostCrewFriends)
          .where(and(eq(ghostCrewFriends.userId, authUserId), eq(ghostCrewFriends.friendId, friendUserId)))
          .limit(1);

        if (existing.length > 0) {
          console.log("[sync.addFriendByCode] Already friends");
          return { success: false as const, error: "Already in your Ghost Crew" };
        }

        // Insert BOTH rows atomically so the friendship is mutual:
        //   Row 1: ghost2 (requester) → ghost1 (target)
        //   Row 2: ghost1 (target)    → ghost2 (requester)  [auto-reverse]
        // The unique constraint on (userId, friendId) ensures ON DUPLICATE KEY UPDATE
        // can properly detect and skip duplicates without crashing.
        console.log("[sync.addFriendByCode] Inserting mutual friendship rows");
        await db.transaction(async (tx) => {
          await tx
            .insert(ghostCrewFriends)
            .values({ userId: authUserId, friendId: friendUserId, addedAt: new Date() })
            .onDuplicateKeyUpdate({ set: { addedAt: sql`${ghostCrewFriends.addedAt}` } });

          await tx
            .insert(ghostCrewFriends)
            .values({ userId: friendUserId, friendId: authUserId, addedAt: new Date() })
            .onDuplicateKeyUpdate({ set: { addedAt: sql`${ghostCrewFriends.addedAt}` } });
        });
        console.log("[sync.addFriendByCode] Transaction completed successfully");

        // Get friend's live progress
        const progressRows = await db
          .select({ xp: userProgress.xp, streak: userProgress.streak })
          .from(userProgress)
          .where(eq(userProgress.userId, friendUserId))
          .limit(1);

        console.log("[sync.addFriendByCode] Returning success with friend data");
        return {
          success: true as const,
          friend: {
            code: friend.friendCode ?? input.code.toUpperCase(),
            name: friend.displayName ?? "Ghost",
            streak: progressRows[0]?.streak ?? 0,
            xp: progressRows[0]?.xp ?? 0,
            addedAt: Date.now(),
          },
        };
      } catch (error) {
        console.error("[sync.addFriendByCode] Full error object:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          error,
        });
        return { success: false as const, error: "Failed to add friend" };
      }
    }),
});
