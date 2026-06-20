/**
 * Onboarding Step 6: Free Trial Reveal
 *
 * Shows "Enjoy 3 full days of RiseGrind completely free – no card required right now."
 * Lists all premium features with icons.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import PaywallModal from "./paywall-modal";

const ICON_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663533327081/FX74FzCVEe6tC4xxrVKhws/risegrind-icon-v2-fGbAHYbpaF4huMRJsUSWRR.png";

const FEATURES = [
  { icon: "👻", key: "feature1", fallback: "Ghost Mode — full discipline toolkit" },
  { icon: "🧠", key: "feature2", fallback: "AI Journal Mentor — daily clarity & direction" },
  { icon: "🔥", key: "feature3", fallback: "Unlimited habits & streak protection" },
  { icon: "📊", key: "feature4", fallback: "Ghost Intel — mood trends & habit analytics" },
  { icon: "🏆", key: "feature5", fallback: "Side Quests — bonus discipline challenges" },
  { icon: "🎤", key: "feature6", fallback: "Voice journaling with AI response playback" },
];

export default function Step6TrialRevealScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to notification permission screen
    router.push("/onboarding/step7-notifications");
  };
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <>
      <ScreenContainer containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Icon */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.iconContainer}>
            <Image source={{ uri: ICON_URL }} style={styles.icon} />
          </Animated.View>

          {/* Header */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {t("onboarding.step6.title", { defaultValue: "Ready to Enter Ghost Mode?" })}
            </Text>
            <Text style={[styles.trialCopy, { color: colors.muted }]}>
              {t("onboarding.step6.trialCopy", {
                defaultValue:
                  "Enjoy 3 full days of RiseGrind completely free – no card required right now.",
              })}
            </Text>
          </Animated.View>

          {/* Features */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.featuresContainer}>
            <Text style={[styles.featuresTitle, { color: colors.foreground }]}>
              {t("onboarding.step6.featuresTitle", { defaultValue: "What You Get" })}
            </Text>
            <View style={[styles.featuresCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {FEATURES.map(({ icon, key, fallback }, idx) => (
                <Animated.View
                  key={key}
                  entering={FadeInDown.delay(400 + idx * 50).duration(600)}
                  style={styles.featureRow}
                >
                  <Text style={styles.featureIcon}>{icon}</Text>
                  <Text style={[styles.featureText, { color: colors.foreground }]}>
                    {t(`onboarding.step6.${key}`, { defaultValue: fallback })}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* CTA */}
          <Animated.View entering={FadeInDown.delay(700).duration(600)} style={styles.footer}>
            <Pressable
              onPress={handleStart}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: "#E8A87C",
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text style={styles.buttonText}>
                {t("onboarding.step6.startTrial", { defaultValue: "Start My Free Trial" })}
              </Text>
            </Pressable>

            <Text style={[styles.legalText, { color: colors.muted }]}>
              {t("onboarding.step6.legal", {
                defaultValue: "No card required. Cancel anytime.",
              })}
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    gap: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  header: {
    gap: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 40,
    textAlign: "center",
  },
  trialCopy: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  featuresContainer: {
    gap: 12,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  featuresCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
    width: 28,
    textAlign: "center",
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  footer: {
    gap: 12,
    marginTop: 16,
  },
  button: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  legalText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
