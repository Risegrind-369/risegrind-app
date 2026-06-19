/**
 * Message Limit Logic
 *
 * TRIAL users: 5 AI mentor messages per month
 * PAID users (Weekly/Annual/Lifetime): Unlimited messages
 *
 * Logic:
 * 1. Check RevenueCat → is user in trial (periodType === 'TRIAL')?
 * 2. If NO (paid or no subscription) → unlimited, send message
 * 3. If YES (trial active) → check monthly_message_count in Supabase
 * 4. If count < 5 → send message, increment count
 * 5. If count >= 5 → block message, show paywall
 */

import { supabase } from "@/lib/supabase/client";

const MESSAGE_LIMIT = 5;

/**
 * Check if user is in trial period via RevenueCat
 */
export async function checkUserIsInTrial(): Promise<boolean> {
  try {
    const Purchases = await import("react-native-purchases").then((m) => m.default);
    const customerInfo = await Purchases.getCustomerInfo();

    if (!customerInfo) return false;

    // Check if user has "premium" entitlement AND it's in trial period
    const hasPremium = !!customerInfo.entitlements.active["premium"];
    const isTrialPeriod = hasPremium && customerInfo.entitlements.active["premium"]?.periodType === "TRIAL";
    return isTrialPeriod;
  } catch (error) {
    console.warn("[MessageLimits] Error checking RevenueCat trial status:", error);
    // Default to no trial if check fails
    return false;
  }
}

/**
 * Get current monthly message count for user
 */
export async function getMonthlyMessageCount(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("monthly_message_count, message_limit_reset_date")
      .eq("supabase_user_id", userId)
      .single();

    if (error) {
      console.warn("[MessageLimits] Error fetching message count:", error);
      return 0;
    }

    if (!data) return 0;

    // Check if we need to reset the counter (new month)
    const resetDate = data.message_limit_reset_date
      ? new Date(data.message_limit_reset_date)
      : null;
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // If reset date is before 1st of this month, reset counter
    if (!resetDate || resetDate < firstOfMonth) {
      await resetMonthlyMessageCount(userId);
      return 0;
    }

    return data.monthly_message_count || 0;
  } catch (error) {
    console.error("[MessageLimits] Error getting message count:", error);
    return 0;
  }
}

/**
 * Reset monthly message counter to 0 and update reset date
 */
export async function resetMonthlyMessageCount(userId: string): Promise<void> {
  try {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const { error } = await supabase
      .from("users")
      .update({
        monthly_message_count: 0,
        message_limit_reset_date: firstOfMonth.toISOString().split("T")[0],
      })
      .eq("supabase_user_id", userId);

    if (error) {
      console.warn("[MessageLimits] Error resetting message count:", error);
    }
  } catch (error) {
    console.error("[MessageLimits] Error resetting message count:", error);
  }
}

/**
 * Increment monthly message counter by 1
 */
export async function incrementMessageCount(userId: string): Promise<number> {
  try {
    const currentCount = await getMonthlyMessageCount(userId);
    const newCount = currentCount + 1;

    const { error } = await supabase
      .from("users")
      .update({ monthly_message_count: newCount })
      .eq("supabase_user_id", userId);

    if (error) {
      console.warn("[MessageLimits] Error incrementing message count:", error);
      return currentCount;
    }

    return newCount;
  } catch (error) {
    console.error("[MessageLimits] Error incrementing message count:", error);
    return 0;
  }
}

/**
 * Main check: Can user send a message?
 *
 * Returns:
 * - { allowed: true } → user can send message
 * - { allowed: false, reason: "limit_reached" } → user hit 5 message limit
 * - { allowed: false, reason: "error" } → error checking limits
 */
export async function canSendMessage(userId: string): Promise<{
  allowed: boolean;
  reason?: "limit_reached" | "error";
  messagesRemaining?: number;
}> {
  try {
    // Check if user is in trial period
    const isInTrial = await checkUserIsInTrial();
    if (!isInTrial) {
      // Paid users (Weekly/Annual/Lifetime) have unlimited messages
      return { allowed: true };
    }

    // Trial users have 5-message limit per month
    const messageCount = await getMonthlyMessageCount(userId);

    if (messageCount >= MESSAGE_LIMIT) {
      return {
        allowed: false,
        reason: "limit_reached",
        messagesRemaining: 0,
      };
    }

    return {
      allowed: true,
      messagesRemaining: MESSAGE_LIMIT - messageCount,
    };
  } catch (error) {
    console.error("[MessageLimits] Error checking message permission:", error);
    return { allowed: false, reason: "error" };
  }
}

/**
 * Attempt to send a message and increment counter if allowed
 *
 * Returns:
 * - { success: true, newCount } → message sent and counter incremented
 * - { success: false, reason } → message blocked
 */
export async function attemptSendMessage(userId: string): Promise<{
  success: boolean;
  reason?: "limit_reached" | "error";
  newCount?: number;
  messagesRemaining?: number;
}> {
  try {
    const permission = await canSendMessage(userId);

    if (!permission.allowed) {
      return {
        success: false,
        reason: permission.reason || "error",
      };
    }

    // Increment counter
    const newCount = await incrementMessageCount(userId);

    return {
      success: true,
      newCount,
      messagesRemaining: MESSAGE_LIMIT - newCount,
    };
  } catch (error) {
    console.error("[MessageLimits] Error attempting to send message:", error);
    return { success: false, reason: "error" };
  }
}
