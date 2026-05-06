import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";

/**
 * RevenueCat webhook handlers
 * Processes subscription events from RevenueCat
 */

export const webhooksRouter = router({
  /**
   * Handle RevenueCat subscription events
   * This endpoint receives POST requests from RevenueCat when subscription events occur
   * 
   * Events:
   * - INITIAL_PURCHASE: User purchased a subscription
   * - RENEWAL: Subscription renewed
   * - CANCELLATION: User cancelled subscription
   * - EXPIRATION: Subscription expired
   * - BILLING_ISSUE: Payment failed
   */
  revenuecat: publicProcedure
    .input(
      z.object({
        event: z.object({
          type: z.enum([
            "INITIAL_PURCHASE",
            "RENEWAL",
            "CANCELLATION",
            "EXPIRATION",
            "BILLING_ISSUE",
            "UNCANCELLATION",
          ]),
          id: z.string(),
          app_user_id: z.string(),
          product_id: z.string(),
          period_type: z.string().optional(),
          purchased_at_ms: z.number().optional(),
          expiration_at_ms: z.number().optional(),
          cancellation_reason: z.string().optional(),
          is_trial_conversion: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const { event } = input;

      try {
        const db = await getDb();
        if (!db) {
          console.warn("[RevenueCat] Database not available");
          return { success: false, message: "Database unavailable" };
        }

        console.log(`[RevenueCat] Webhook received: ${event.type} for user ${event.app_user_id}`);

        // Handle different event types
        switch (event.type) {
          case "INITIAL_PURCHASE":
            console.log(
              `[RevenueCat] Initial purchase: ${event.product_id} for ${event.app_user_id}`
            );
            // Track initial purchase in analytics
            // You can add custom logic here (e.g., log to database, send email, etc.)
            break;

          case "RENEWAL":
            console.log(
              `[RevenueCat] Subscription renewed: ${event.product_id} for ${event.app_user_id}`
            );
            // Track renewal in analytics
            break;

          case "CANCELLATION":
            console.log(
              `[RevenueCat] Subscription cancelled: ${event.product_id} for ${event.app_user_id}`
            );
            console.log(`[RevenueCat] Cancellation reason: ${event.cancellation_reason}`);
            // Handle cancellation (e.g., notify user, log reason)
            break;

          case "EXPIRATION":
            console.log(
              `[RevenueCat] Subscription expired: ${event.product_id} for ${event.app_user_id}`
            );
            // Handle expiration (e.g., downgrade user, send re-engagement email)
            break;

          case "BILLING_ISSUE":
            console.log(
              `[RevenueCat] Billing issue for ${event.app_user_id}: ${event.product_id}`
            );
            // Handle billing failure (e.g., notify user, retry payment)
            break;

          case "UNCANCELLATION":
            console.log(
              `[RevenueCat] Subscription uncancelled: ${event.product_id} for ${event.app_user_id}`
            );
            // Handle uncancellation (e.g., restore access)
            break;

          default:
            console.warn(`[RevenueCat] Unknown event type: ${event.type}`);
        }

        return {
          success: true,
          message: `Event ${event.type} processed successfully`,
        };
      } catch (error) {
        console.error("[RevenueCat] Webhook error:", error);
        return {
          success: false,
          message: "Failed to process webhook",
        };
      }
    }),

  /**
   * Health check endpoint for RevenueCat webhook configuration
   */
  health: publicProcedure.query(() => ({
    status: "ok",
    message: "RevenueCat webhook endpoint is healthy",
  })),
});
