import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { updateUserSupabaseId, deleteUserData } from "../db";

/**
 * Auth migration procedures for Supabase integration.
 * Handles linking existing Manus OAuth users to new Supabase accounts.
 */
export const authMigrationRouter = router({
  /**
   * Claim account: Link existing Manus user to new Supabase account.
   * Called after user creates Supabase account with email/password.
   */
  claimAccount: publicProcedure
    .input(
      z.object({
        supabaseUserId: z.string().min(1),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { supabaseUserId, email } = input;

      if (!ctx.user) {
        throw new Error("No authenticated user found");
      }

      try {
        // Update user with Supabase ID
        // Note: In a single-user migration, we just update the one user
        await updateUserSupabaseId(ctx.user.id, supabaseUserId);

        return {
          success: true,
          message: "Account claimed successfully",
          userId: ctx.user.id,
          supabaseUserId,
        };
      } catch (error) {
        console.error("[Auth Migration] Failed to claim account:", error);
        throw new Error("Failed to claim account");
      }
    }),

  /**
   * Start fresh: Delete all user data and create new Supabase account.
   * Used for testing purposes - will be removed before public launch.
   */
  startFresh: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        supabaseUserId: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, supabaseUserId } = input;

      if (!ctx.user) {
        throw new Error("No authenticated user found");
      }

      try {
        // Delete all user data (simplified for single user)
        await deleteUserData(ctx.user.id);

        // Update user with Supabase ID
        await updateUserSupabaseId(ctx.user.id, supabaseUserId);

        return {
          success: true,
          message: "Fresh start complete - all old data deleted",
          userId: ctx.user.id,
          supabaseUserId,
        };
      } catch (error) {
        console.error("[Auth Migration] Failed to start fresh:", error);
        throw new Error("Failed to start fresh");
      }
    }),
});
