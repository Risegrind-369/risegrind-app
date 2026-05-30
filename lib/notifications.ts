import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateDailyNotification, type MotivationalContext } from "./motivational-messages";

// ─── Storage keys ─────────────────────────────────────────────────────────────
const NOTIF_SETTINGS_KEY = "@risegrind_notif_settings";
const LAST_JOURNAL_DATE_KEY = "@risegrind_last_journal_date";
const LAST_RANK_KEY = "@risegrind_last_rank";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface NotificationSettings {
  dailyReminderEnabled: boolean;
  reminderHour: number;   // 0-23
  reminderMinute: number; // 0-59
  inactivityAlertEnabled: boolean;
  rankUpAlertEnabled: boolean;
}

export const DEFAULT_NOTIF_SETTINGS: NotificationSettings = {
  dailyReminderEnabled: true,
  reminderHour: 7,
  reminderMinute: 0,
  inactivityAlertEnabled: true,
  rankUpAlertEnabled: true,
};

// ─── Setup ────────────────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ─── Settings persistence ─────────────────────────────────────────────────────
export async function loadNotificationSettings(): Promise<NotificationSettings> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_SETTINGS_KEY);
    if (raw) return { ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_NOTIF_SETTINGS;
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(settings));
}

// ─── Daily Habit Reminder ─────────────────────────────────────────────────────
export async function scheduleDailyReminder(
  settings: NotificationSettings,
  titleText: string,
  bodyText: string,
  motivationalContext?: MotivationalContext
): Promise<void> {
  if (Platform.OS === "web") return;

  // Cancel existing daily reminder
  await cancelDailyReminder();

  if (!settings.dailyReminderEnabled) return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  // Use motivational context if provided, otherwise use provided title/body
  let finalTitle = titleText;
  let finalBody = bodyText;

  if (motivationalContext) {
    const notification = generateDailyNotification(motivationalContext);
    finalTitle = notification.title;
    finalBody = notification.body;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: "daily_reminder",
    content: {
      title: finalTitle,
      body: finalBody,
      sound: true,
      badge: 1,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: settings.reminderHour,
      minute: settings.reminderMinute,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync("daily_reminder").catch(() => {});
}

// ─── Inactivity Check ─────────────────────────────────────────────────────────
export async function recordJournalActivity(): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  await AsyncStorage.setItem(LAST_JOURNAL_DATE_KEY, today);
  // Cancel any pending inactivity alert
  await Notifications.cancelScheduledNotificationAsync("inactivity_alert").catch(() => {});
}

export async function scheduleInactivityAlert(
  settings: NotificationSettings,
  titleText: string,
  bodyText: string
): Promise<void> {
  if (Platform.OS === "web" || !settings.inactivityAlertEnabled) return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  const lastDate = await AsyncStorage.getItem(LAST_JOURNAL_DATE_KEY);
  if (!lastDate) return;

  const last = new Date(lastDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - last.getTime()) / 86400000);

  if (diffDays >= 2) {
    // Fire immediately if already 2+ days inactive
    await Notifications.scheduleNotificationAsync({
      identifier: "inactivity_alert",
      content: {
        title: titleText,
        body: bodyText,
        sound: true,
      },
      trigger: null, // immediate
    });
  } else {
    // Schedule for 48 hours after last journal
    const triggerDate = new Date(last.getTime() + 2 * 86400000);
    if (triggerDate > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: "inactivity_alert",
        content: {
          title: titleText,
          body: bodyText,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    }
  }
}

// ─── Rank-Up Celebration ──────────────────────────────────────────────────────
export async function triggerRankUpNotification(
  settings: NotificationSettings,
  newRank: string,
  titleText: string,
  bodyText: string
): Promise<void> {
  if (Platform.OS === "web" || !settings.rankUpAlertEnabled) return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  const lastRank = await AsyncStorage.getItem(LAST_RANK_KEY);
  if (lastRank === newRank) return; // already notified for this rank

  await AsyncStorage.setItem(LAST_RANK_KEY, newRank);

  await Notifications.scheduleNotificationAsync({
    identifier: `rank_up_${newRank}`,
    content: {
      title: titleText,
      body: bodyText,
      sound: true,
    },
    trigger: null, // immediate
  });
}

// ─── Cancel all ───────────────────────────────────────────────────────────────
export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
