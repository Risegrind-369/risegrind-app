import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import * as Haptics from "expo-haptics";

export default function TrialRevealScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { state, dispatch } = useApp();

  // Trial is automatically managed by RevenueCat
  // This screen just shows the trial offer

  const handleStartTrial = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Trial period starts automatically
    router.replace("/(tabs)" as never);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={styles.container}>
        {/* Icon */}
        <Text style={styles.icon}>🎁</Text>

        {/* Title */}
        <Text style={[styles.title, { color: colors.foreground }]}>
          {t("trial.title", { defaultValue: "Free Trial Unlocked" })}
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {t("trial.subtitle", { defaultValue: "3 Days of Full Access" })}
        </Text>

        {/* Trial Duration */}
        <View style={[styles.trialCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent }]}>
          <Text style={[styles.trialDays, { color: colors.accent }]}>3</Text>
          <Text style={[styles.trialSubtext, { color: colors.muted }]}>
            {t("trial.daysOfFullAccess", { defaultValue: "Days of full access to all premium features" })}
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresList}>
          <Text style={[styles.featuresTitle, { color: colors.foreground }]}>
            {t("trial.includes", { defaultValue: "Your trial includes:" })}
          </Text>

          {[
            { icon: "📋", label: t("trial.unlimitedHabits", { defaultValue: "Unlimited habits & tracking" }) },
            { icon: "📝", label: t("trial.aiJournal", { defaultValue: "AI-powered journal analysis" }) },
            { icon: "🎤", label: t("trial.voiceEntry", { defaultValue: "Voice-to-text entries" }) },
            { icon: "⚡", label: t("trial.sideQuests", { defaultValue: "Exclusive side quests" }) },
            { icon: "📊", label: t("trial.advancedAnalytics", { defaultValue: "Advanced analytics & insights" }) },
            { icon: "👥", label: t("trial.ghostCrew", { defaultValue: "Ghost Crew community access" }) },
          ].map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={[styles.featureLabel, { color: colors.foreground }]}>
                {feature.label}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <Pressable
          onPress={handleStartTrial}
          style={({ pressed }) => [
            styles.ctaButton,
            {
              backgroundColor: colors.accent,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Text style={styles.ctaButtonText}>
            {t("trial.startTrial", { defaultValue: "Start Your 3-Day Trial" })}
          </Text>
        </Pressable>

        {/* Fine Print */}
        <Text style={[styles.finePrint, { color: colors.muted }]}>
          {t("trial.cancelAnytime", { defaultValue: "Cancel anytime. No credit card required." })}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: "center",
    gap: 24,
  },
  icon: {
    fontSize: 64,
    textAlign: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 24,
  },
  trialCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  trialDays: {
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1,
  },
  trialSubtext: {
    fontSize: 14,
    fontWeight: "500",
  },
  featuresList: {
    gap: 12,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  ctaButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },
  ctaButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  finePrint: {
    fontSize: 12,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 16,
  },
});
