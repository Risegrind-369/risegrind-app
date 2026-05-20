import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { useRevenueCat } from "@/lib/revenuecat-provider";
import * as Haptics from "expo-haptics";

export default function TrialRevealScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { state, dispatch } = useApp();
  const { packages, purchasePackage, isNativeBuild } = useRevenueCat();
  const [isLoading, setIsLoading] = useState(false);

  // Find the trial package
  const trialPackage = packages?.find(
    (pkg: any) => pkg.product.subscriptionOptions?.some((opt: any) => opt.billingPeriod?.unit === 'DAY' && opt.billingPeriod?.value === 3)
  );

  const handleStartTrial = async () => {
    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Navigate to paywall to show pricing options
      // User can choose to start trial or purchase a plan
      router.push("/onboarding/paywall" as never);
    } catch (error) {
      console.error('[TrialReveal] Error navigating to paywall:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsLoading(false);
    }
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
        <TouchableOpacity
          onPress={handleStartTrial}
          disabled={isLoading}
          activeOpacity={0.6}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaButtonText}>
              {t("trial.viewPlans", { defaultValue: "View Plans" })}
            </Text>
          )}
        </TouchableOpacity>

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
