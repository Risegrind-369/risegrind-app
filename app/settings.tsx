import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useRef } from "react";
import { clearSyncedFlag } from "@/lib/sync";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { useThemeContext } from "@/lib/theme-provider";
import * as Haptics from "expo-haptics";
import { showSuperwallPaywall } from "@/lib/superwall-provider";
import { useRevenueCat } from "@/lib/revenuecat-provider";
import { completeLogout } from "@/lib/supabase/auth";

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { state, dispatch } = useApp();
  const { colorScheme, setColorScheme } = useThemeContext();
  const { isTrialActive, getTrialExpirationDate } = useRevenueCat();
  const [trialTimeRemaining, setTrialTimeRemaining] = useState<string | null>(null);
  const [trialExpirationDate, setTrialExpirationDate] = useState<Date | null>(null);

  // Fetch trial expiration date and calculate remaining time
  useEffect(() => {
    const fetchTrialInfo = async () => {
      if (!isTrialActive) {
        setTrialTimeRemaining(null);
        setTrialExpirationDate(null);
        return;
      }

      const expirationDate = await getTrialExpirationDate();
      if (!expirationDate) {
        setTrialTimeRemaining(null);
        setTrialExpirationDate(null);
        return;
      }

      setTrialExpirationDate(expirationDate);
      calculateTimeRemaining(expirationDate);
    };

    fetchTrialInfo();

    // Update countdown every minute
    const interval = setInterval(() => {
      if (trialExpirationDate) {
        calculateTimeRemaining(trialExpirationDate);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isTrialActive, getTrialExpirationDate]);

  const calculateTimeRemaining = (expirationDate: Date) => {
    const now = new Date();
    const diffMs = expirationDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      setTrialTimeRemaining(null);
      return;
    }

    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) {
      setTrialTimeRemaining(`${days}d ${hours}h`);
    } else if (hours > 0) {
      setTrialTimeRemaining(`${hours}h ${minutes}m`);
    } else {
      setTrialTimeRemaining(`${minutes}m`);
    }
  };

  // Language is now locked after onboarding - no changes allowed

  const handleResetAllData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "⚠️ Reset All Local Data",
      "This will erase all habits, journal entries, XP, and streaks from this device.\n\nYour account and server data are preserved — you can restore them on next login.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear the synced flag so first-sync runs on next launch
              await clearSyncedFlag();
              // Clear all local AsyncStorage data
              await AsyncStorage.clear();
              // Reset app state
              dispatch({ type: "LOGOUT" });
              router.replace("/onboarding/language" as never);
            } catch (err) {
              Alert.alert("Error", "Failed to reset data: " + String(err));
            }
          },
        },
      ]
    );
  };

  const isLoggingOutRef = useRef(false);

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t("settings.logoutTitle", { defaultValue: "Logout?" }),
      t("settings.logoutMessage", { defaultValue: "Are you sure?" }),
      [
        { text: t("common.cancel", { defaultValue: "Cancel" }), style: "cancel" },
        {
          text: t("common.logout", { defaultValue: "Logout" }),
          style: "destructive",
          onPress: async () => {
            try {
              // Call completeLogout to properly sign out and clear all auth state
              await completeLogout(dispatch, isLoggingOutRef, true);
              // Navigate to onboarding after logout is complete
              router.replace("/onboarding/language" as never);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              console.error("[Settings] Logout error details:", {
                message: errorMessage,
                error,
                stack: error instanceof Error ? error.stack : undefined,
              });
              Alert.alert(
                "Logout Failed",
                errorMessage || "An error occurred while logging out. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={[styles.backButton, { color: colors.accent }]}>← {t("common.back", { defaultValue: "Back" })}</Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {t("settings.title", { defaultValue: "Settings" })}
          </Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {t("settings.profile", { defaultValue: "Profile" })}
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.muted }]}>
                {t("settings.name", { defaultValue: "Name" })}
              </Text>
              <Text style={[styles.settingValue, { color: colors.foreground }]}>
                {state.userName || t("settings.ghost", { defaultValue: "Ghost" })}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.muted }]}>
                {t("settings.rank", { defaultValue: "Rank" })}
              </Text>
              <Text style={[styles.settingValue, { color: colors.accent }]}>
                {t(`ranks.${state.xp < 100 ? "Early Riser" : state.xp < 500 ? "Morning Warrior" : state.xp < 1500 ? "Grind Master" : "Grind Legend"}`)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.muted }]}>
                {t("settings.xp", { defaultValue: "Total XP" })}
              </Text>
              <Text style={[styles.settingValue, { color: colors.foreground }]}>
                {state.xp.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {t("settings.subscription", { defaultValue: "Subscription" })}
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Trial Countdown Timer — only show if trial is active */}
            {isTrialActive && trialTimeRemaining && (
              <View style={[styles.trialTimerCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent }]}>
                <View style={styles.trialTimerContent}>
                  <Text style={[styles.trialTimerLabel, { color: colors.muted }]}>
                    {t("settings.trialExpires", { defaultValue: "Trial expires in" })}
                  </Text>
                  <Text style={[styles.trialTimerValue, { color: colors.accent }]}>
                    {trialTimeRemaining}
                  </Text>
                </View>
                <Text style={[styles.trialTimerEmoji]}>⏳</Text>
              </View>
            )}
            {/* Manage Subscription — shows Superwall paywall immediately, even during trial */}
            <Pressable
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                // On native: Superwall handles the beautiful paywall UI
                // On web/Expo Go: fall back to in-app paywall screen
                try {
                  await showSuperwallPaywall("manage_subscription");
                } catch {
                  router.push("/onboarding/paywall" as never);
                }
              }}
              style={({ pressed }) => [
                styles.settingButton,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={styles.settingButtonText}>
                💳 {t("settings.managePlan", { defaultValue: "Manage Subscription" })}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {t("settings.theme", { defaultValue: "Theme" })}
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {["light", "dark"].map((theme, idx) => (
              <React.Fragment key={theme}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setColorScheme(theme as "light" | "dark");
                  }}
                  style={({ pressed }) => [
                    styles.languageRow,
                    {
                      backgroundColor:
                        colorScheme === theme ? colors.accent + "15" : "transparent",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={styles.languageEmoji}>
                    {theme === "light" ? "☀️" : "🌙"}
                  </Text>
                  <Text style={[styles.languageName, { color: colors.foreground }]}>
                    {theme === "light" ? t("settings.lightMode", { defaultValue: "Light" }) : t("settings.darkMode", { defaultValue: "Dark" })}
                  </Text>
                  {colorScheme === theme && (
                    <Text style={[styles.checkmark, { color: colors.accent }]}>✓</Text>
                  )}
                </Pressable>
                {idx < 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Language Section - Locked after onboarding */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {t("settings.language", { defaultValue: "Language" })}
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.languageRow}>
              <Text style={styles.languageEmoji}>
                {i18n.language === "en" ? "🇺🇸" : i18n.language === "fr" ? "🇫🇷" : "🇧🇷"}
              </Text>
              <Text style={[styles.languageName, { color: colors.foreground }]}>
                {t(`lang.${i18n.language}`)}
              </Text>
              <Text style={[styles.checkmark, { color: colors.accent }]}>🔒</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.lockedNote, { color: colors.muted }]}>
              {t("settings.languageLocked", { defaultValue: "Language is locked and cannot be changed." })}
            </Text>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>⚠️ Danger Zone</Text>
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            style={[styles.dangerButton, { backgroundColor: colors.error + "15", borderColor: colors.error }]}
          >
            <Text style={[styles.dangerButtonText, { color: colors.error }]}>
              {t("common.logout", { defaultValue: "Logout" })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleResetAllData}
            activeOpacity={0.7}
            style={[styles.dangerButton, { backgroundColor: colors.error + "25", borderColor: colors.error, marginTop: 8 }]}
          >
            <Text style={[styles.dangerButtonText, { color: colors.error }]}>
              🗑️ Reset All Local Data
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
  },
  header: {
    gap: 12,
    marginBottom: 8,
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  settingValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  divider: {
    height: 1,
  },
  settingButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    margin: 12,
  },
  settingButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  languageEmoji: {
    fontSize: 24,
  },
  languageName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "700",
  },
  lockedNote: {
    fontSize: 13,
    fontWeight: "500",
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontStyle: "italic",
  },
  dangerButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  trialTimerCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trialTimerContent: {
    flex: 1,
    gap: 4,
  },
  trialTimerLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  trialTimerValue: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  trialTimerEmoji: {
    fontSize: 24,
    marginLeft: 12,
  },
});
