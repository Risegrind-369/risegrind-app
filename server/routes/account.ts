import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { users, habitStacks, moodSnapshots, emotionalCheckIns, ghostMirrors } from "../../drizzle/schema";

/**
 * Account management routes
 * Handles account deletion, data export, etc.
 */

export const accountRouter = router({
  /**
   * Delete user account and all associated data
   * This is a destructive operation and cannot be undone
   */
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      // Delete in order of foreign key dependencies
      // 1. Delete mood snapshots
      await db
        .delete(moodSnapshots)
        .where(eq(moodSnapshots.userId, ctx.user.id));

      // 2. Delete emotional check-ins
      await db
        .delete(emotionalCheckIns)
        .where(eq(emotionalCheckIns.userId, ctx.user.id));

      // 3. Delete ghost mirrors (journal-like entries)
      await db
        .delete(ghostMirrors)
        .where(eq(ghostMirrors.userId, ctx.user.id));

      // 4. Delete habit stacks
      await db
        .delete(habitStacks)
        .where(eq(habitStacks.userId, ctx.user.id));

      // 5. Delete user
      await db.delete(users).where(eq(users.id, ctx.user.id));

      console.log(`[Account] User ${ctx.user.id} account deleted`);

      return { success: true, message: "Account deleted successfully" };
    } catch (error) {
      console.error("[Account] Delete account error:", error);
      throw new Error("Failed to delete account");
    }
  }),

  /**
   * Export user data as JSON (GDPR compliance)
   * Returns all user data in a portable format
   */
  exportData: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      // Fetch all user data
      const userRecord = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id));

      const userHabitStacks = await db
        .select()
        .from(habitStacks)
        .where(eq(habitStacks.userId, ctx.user.id));

      const userCheckIns = await db
        .select()
        .from(emotionalCheckIns)
        .where(eq(emotionalCheckIns.userId, ctx.user.id));

      const userMood = await db
        .select()
        .from(moodSnapshots)
        .where(eq(moodSnapshots.userId, ctx.user.id));

      const userGhostMirrors = await db
        .select()
        .from(ghostMirrors)
        .where(eq(ghostMirrors.userId, ctx.user.id));

      const exportData = {
        exportDate: new Date().toISOString(),
        user: userRecord[0] || null,
        habitStacks: userHabitStacks,
        emotionalCheckIns: userCheckIns,
        moodSnapshots: userMood,
        ghostMirrors: userGhostMirrors,
      };

      console.log(`[Account] User ${ctx.user.id} data exported`);

      return exportData;
    } catch (error) {
      console.error("[Account] Export data error:", error);
      throw new Error("Failed to export data");
    }
  }),
});
