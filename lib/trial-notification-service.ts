import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TRIAL_NOTIFICATION_SCHEDULED_KEY = "trial_notification_scheduled";
const TRIAL_24H_WARNING_KEY = "trial_24h_warning_sent";

/**
 * Schedule a push notification for trial expiration.
 * Sends notification 24 hours before trial ends.
 */
export async function scheduleTrialExpirationNotification(
  trialExpirationDate: Date
): Promise<void> {
  try {
    // Check if we've already scheduled this notification
    const alreadyScheduled = await AsyncStorage.getItem(TRIAL_NOTIFICATION_SCHEDULED_KEY);
    if (alreadyScheduled) {
      return;
    }

    // Calculate time until 24 hours before expiration
    const now = new Date();
    const twentyFourHoursBefore = new Date(trialExpirationDate.getTime() - 24 * 60 * 60 * 1000);
    const timeUntilNotification = twentyFourHoursBefore.getTime() - now.getTime();

    // Only schedule if there's time left and it's within 7 days
    if (timeUntilNotification > 0 && timeUntilNotification < 7 * 24 * 60 * 60 * 1000) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Your trial is expiring soon!",
          body: "Your 3-day trial ends in 24 hours. Upgrade now to keep using Ghost Mode.",
          data: {
            type: "trial_expiration_warning",
            expirationDate: trialExpirationDate.toISOString(),
          },
          sound: "default",
          badge: 1,
        },
        trigger: {
          seconds: Math.floor(timeUntilNotification / 1000),
        } as any,
      });

      // Mark as scheduled
      await AsyncStorage.setItem(TRIAL_NOTIFICATION_SCHEDULED_KEY, "true");
    }
  } catch (error) {
    console.error("Failed to schedule trial expiration notification:", error);
  }
}

/**
 * Check if trial is expiring soon (within 24 hours) and show local notification.
 */
export async function checkAndNotifyTrialExpiring(
  trialExpirationDate: Date
): Promise<boolean> {
  try {
    const now = new Date();
    const hoursUntilExpiration = (trialExpirationDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // If trial expires within 24 hours, show notification
    if (hoursUntilExpiration > 0 && hoursUntilExpiration <= 24) {
      const alreadySent = await AsyncStorage.getItem(TRIAL_24H_WARNING_KEY);
      if (!alreadySent) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Trial Expiring Soon",
            body: `Your trial expires in ${Math.round(hoursUntilExpiration)} hours. Upgrade now!`,
            data: {
              type: "trial_expiration_warning",
            },
          },
          trigger: null,
        });

        await AsyncStorage.setItem(TRIAL_24H_WARNING_KEY, "true");
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Failed to check trial expiration:", error);
    return false;
  }
}

/**
 * Clear trial notification flags (call after user upgrades).
 */
export async function clearTrialNotificationFlags(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      TRIAL_NOTIFICATION_SCHEDULED_KEY,
      TRIAL_24H_WARNING_KEY,
    ]);
  } catch (error) {
    console.error("Failed to clear trial notification flags:", error);
  }
}
