/**
 * Onboarding Step 7: Notification Permissions
 *
 * Requests notification access and explains the benefits:
 * - Daily motivational reminders
 * - Routine/journal prompts
 * - Stats analysis insights
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { debugLog } from "@/lib/debug-logger";

import {
  requestNotificationPermission,
  loadNotificationSettings,
  scheduleDailyReminder,
} from "@/lib/notifications";

const BENEFITS = [
  { icon: "🌅", key: "benefit1", fallback: "Daily motivation at your chosen time" },
  { icon: "📝", key: "benefit2", fallback: "Gentle reminders to journal & reflect" },
  { icon: "📊", key: "benefit3", fallback: "Weekly insights on your progress" },
  { icon: "🔥", key: "benefit4", fallback: "Celebrate streaks & rank-ups" },
];

export default function Step7NotificationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();

  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);



  const handleRequestPermission = async () => {
    debugLog("STEP7_NOTIFICATIONS_REQUEST_PERMISSION", {});
    if (Platform.OS === "web") {
      // Skip on web
      handleContinue();
      return;
    }

    setIsRequesting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const granted = await requestNotificationPermission();
      setPermissionGranted(granted);

      if (granted) {
        // Schedule daily reminder immediately
        const settings = await loadNotificationSettings();
        await scheduleDailyReminder(
          settings,
          t("notifications.reminderTitle", { defaultValue: "Time to rise, Ghost 👻" }),
          t("notifications.reminderBody", {
            defaultValue: "Your morning routine awaits. Let's build discipline today.",
          })
        );

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "🔔",
          t("onboarding.step7.permissionGranted", {
            defaultValue:
              "Notifications enabled! You'll receive daily motivation at 7:00 AM.",
          }),
          [
            {
              text: "Continue",
              onPress: handleContinue,
            },
          ]
        );
      } else {
        Alert.alert(
          "👻",
          t("onboarding.step7.permissionDenied", {
            defaultValue:
              "Notifications disabled. You can enable them later in Settings.",
          })
        );
      }
    } catch (error) {
      console.error("[Notifications] Permission request error:", error);
      Alert.alert("Error", "Failed to request notification permission");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleContinue();
  };
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleContinue = () => {
    debugLog("STEP7_NOTIFICATIONS_CONTINUE_PRESSED", {});
    router.push("/onboarding/step8-paywall" as never);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Icon */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.iconContainer}>
            <Text style={styles.icon}>🔔</Text>
          </Animated.View>

          {/* Header */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {t("onboarding.step7.title", { defaultValue: "Stay Motivated Daily" })}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {t("onboarding.step7.subtitle", {
                defaultValue:
                  "Get daily reminders to complete your routine, journal, and celebrate your progress.",
              })}
            </Text>
          </Animated.View>

          {/* Benefits */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.benefitsContainer}>
            <View style={[styles.benefitsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {BENEFITS.map(({ icon, key, fallback }, idx) => (
                <Animated.View
                  key={key}
                  entering={FadeInDown.delay(400 + idx * 50).duration(600)}
                  style={styles.benefitRow}
                >
                  <Text style={styles.benefitIcon}>{icon}</Text>
                  <Text style={[styles.benefitText, { color: colors.foreground }]}>
                    {t(`onboarding.step7.${key}`, { defaultValue: fallback })}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Motivational Quote */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(600)}
            style={[styles.quoteCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
          >
            <Text style={[styles.quoteText, { color: colors.foreground }]}>
              {t("onboarding.step7.quote", {
                defaultValue:
                  '"Who do you want to become? Daily reminders keep you focused on becoming that version of yourself."',
              })}
            </Text>
          </Animated.View>

          {/* Buttons */}
          <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.buttonsContainer}>
            <Pressable
              onPress={handleRequestPermission}
              disabled={isRequesting}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.primary, opacity: pressed || isRequesting ? 0.8 : 1 },
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                {isRequesting
                  ? t("onboarding.step7.requesting", { defaultValue: "Requesting..." })
                  : permissionGranted
                    ? t("onboarding.step7.enabled", { defaultValue: "✓ Notifications Enabled" })
                    : t("onboarding.step7.enableNotifications", { defaultValue: "Enable Notifications" })}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSkip}
              style={({ pressed }) => [
                styles.secondaryButton,
                { borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                {t("onboarding.step7.skipForNow", { defaultValue: "Skip for now" })}
              </Text>
            </Pressable>
          </Animated.View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.primary, width: "100%" },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.muted }]}>
              {t("onboarding.step7.progress", { defaultValue: "Step 7 of 8" })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
  },
  container: {
    paddingHorizontal: 20,
    gap: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    fontSize: 64,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  benefitsContainer: {
    marginVertical: 8,
  },
  benefitsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitIcon: {
    fontSize: 24,
    width: 32,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  quoteCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
    textAlign: "center",
  },
  buttonsContainer: {
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  progressBar: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
