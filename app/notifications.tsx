import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "react-i18next";
import {
  loadNotificationSettings,
  saveNotificationSettings,
  scheduleDailyReminder,
  cancelDailyReminder,
  requestNotificationPermission,
  type NotificationSettings,
  DEFAULT_NOTIF_SETTINGS,
} from "@/lib/notifications";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function NotificationsScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIF_SETTINGS);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    loadNotificationSettings().then(setSettings);
    if (Platform.OS !== "web") {
      requestNotificationPermission().then(setPermissionGranted);
    }
  }, []);

  const updateSetting = async <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveNotificationSettings(updated);

    if (key === "dailyReminderEnabled" || key === "reminderHour" || key === "reminderMinute") {
      if (updated.dailyReminderEnabled) {
        await scheduleDailyReminder(
          updated,
          t("notifications.reminderTitle"),
          t("notifications.reminderBody")
        );
      } else {
        await cancelDailyReminder();
      }
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    if (!granted) {
      Alert.alert("👻", t("notifications.permissionDenied"));
    }
  };

  const formatTime = (h: number, m: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            🔔 {t("notifications.title")}
          </Text>
        </View>

        {/* Permission Banner */}
        {!permissionGranted && Platform.OS !== "web" && (
          <Pressable
            onPress={handleRequestPermission}
            style={({ pressed }) => [
              styles.permissionBanner,
              { backgroundColor: colors.warning + "20", borderColor: colors.warning + "40", opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.permissionText, { color: colors.warning }]}>
              ⚠️ Notifications are disabled. Tap to enable.
            </Text>
          </Pressable>
        )}

        {/* Daily Reminder */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>
                ⚡ {t("notifications.dailyReminder")}
              </Text>
              <Text style={[styles.settingDesc, { color: colors.muted }]}>
                {t("notifications.dailyReminderDesc")}
              </Text>
            </View>
            <Switch
              value={settings.dailyReminderEnabled}
              onValueChange={(v) => updateSetting("dailyReminderEnabled", v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {settings.dailyReminderEnabled && (
            <View style={styles.timeSection}>
              <Text style={[styles.timeLabel, { color: colors.muted }]}>
                {t("notifications.reminderTime")}
              </Text>
              <Text style={[styles.timeDisplay, { color: colors.foreground }]}>
                {formatTime(settings.reminderHour, settings.reminderMinute)}
              </Text>
              {/* Hour picker */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hourPicker}
              >
                {HOURS.map((h) => (
                  <Pressable
                    key={h}
                    onPress={() => updateSetting("reminderHour", h)}
                    style={[
                      styles.hourChip,
                      {
                        backgroundColor: settings.reminderHour === h ? colors.primary : colors.background,
                        borderColor: settings.reminderHour === h ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.hourChipText,
                        { color: settings.reminderHour === h ? "#fff" : colors.muted },
                      ]}
                    >
                      {h.toString().padStart(2, "0")}h
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Inactivity Alert */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>
                👻 {t("notifications.inactivityAlert")}
              </Text>
              <Text style={[styles.settingDesc, { color: colors.muted }]}>
                {t("notifications.inactivityDesc")}
              </Text>
            </View>
            <Switch
              value={settings.inactivityAlertEnabled}
              onValueChange={(v) => updateSetting("inactivityAlertEnabled", v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.previewBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.previewTitle, { color: colors.foreground }]}>
              {t("notifications.inactivityTitle")}
            </Text>
            <Text style={[styles.previewBody, { color: colors.muted }]}>
              {t("notifications.inactivityBody")}
            </Text>
          </View>
        </View>

        {/* Rank-Up Alert */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>
                🏆 {t("notifications.rankUpAlert")}
              </Text>
              <Text style={[styles.settingDesc, { color: colors.muted }]}>
                {t("notifications.rankUpDesc")}
              </Text>
            </View>
            <Switch
              value={settings.rankUpAlertEnabled}
              onValueChange={(v) => updateSetting("rankUpAlertEnabled", v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.previewBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.previewTitle, { color: colors.foreground }]}>
              {t("notifications.rankUpTitle")}
            </Text>
            <Text style={[styles.previewBody, { color: colors.muted }]}>
              {t("notifications.rankUpBody", { rank: "Morning Warrior" })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  header: { gap: 8 },
  backBtn: { alignSelf: "flex-start" },
  backText: { fontSize: 15, fontWeight: "600" },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  permissionBanner: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  permissionText: { fontSize: 13, fontWeight: "600" },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingInfo: { flex: 1, gap: 3 },
  settingTitle: { fontSize: 15, fontWeight: "700" },
  settingDesc: { fontSize: 12 },
  timeSection: { gap: 8 },
  timeLabel: { fontSize: 12, fontWeight: "600" },
  timeDisplay: { fontSize: 28, fontWeight: "800" },
  hourPicker: { gap: 6, paddingVertical: 4 },
  hourChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  hourChipText: { fontSize: 11, fontWeight: "700" },
  previewBox: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    gap: 4,
  },
  previewTitle: { fontSize: 13, fontWeight: "700" },
  previewBody: { fontSize: 12 },
});
