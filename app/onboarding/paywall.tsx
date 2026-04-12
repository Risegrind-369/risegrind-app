/**
 * Paywall Screen — Post-Trial Upgrade
 *
 * Shown after the 3-day free trial ends.
 * Transparent pricing, social proof, and RevenueCat integration.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRevenueCat } from "@/lib/revenuecat-provider";
import { useApp } from "@/lib/app-context";
import * as Haptics from "expo-haptics";

type PlanType = "monthly" | "yearly";

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

export default function PaywallScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { offerings, purchasePackage, restorePurchases, getMonthlyPackage, getAnnualPackage } =
    useRevenueCat();
  const { dispatch } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("yearly");
  const [isLoading, setIsLoading] = useState(false);

  // Get real prices from RevenueCat if available
  const monthlyPkg = getMonthlyPackage();
  const annualPkg = getAnnualPackage();
  const monthlyPrice = (monthlyPkg as any)?.product?.priceString ?? "$4.99";
  const annualPrice = (annualPkg as any)?.product?.priceString ?? "$39.99";

  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      let pkg: unknown = null;
      if (selectedPlan === "yearly" && annualPkg) {
        pkg = annualPkg;
      } else if (selectedPlan === "monthly" && monthlyPkg) {
        pkg = monthlyPkg;
      } else if (offerings && typeof offerings === "object") {
        const off = offerings as { current?: { availablePackages?: unknown[] } };
        pkg = off.current?.availablePackages?.[0] ?? null;
      }

      if (pkg) {
        const success = await purchasePackage(pkg);
        if (success) {
          dispatch({ type: "SET_PREMIUM", payload: true });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.push("/onboarding/setup" as never);
          return;
        }
      } else {
        // No RevenueCat configured yet — proceed as premium for demo/web
        dispatch({ type: "SET_PREMIUM", payload: true });
        router.push("/onboarding/setup" as never);
        return;
      }
    } catch (e: unknown) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err?.userCancelled) {
        Alert.alert(
          t("paywall.purchaseFailed", { defaultValue: "Purchase Failed" }),
          err?.message ?? t("paywall.purchaseError", { defaultValue: "Something went wrong. Please try again." })
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      await restorePurchases();
      Alert.alert(
        t("paywall.restoreSuccess", { defaultValue: "Restored!" }),
        t("paywall.restoreSuccessMsg", { defaultValue: "Your purchases have been restored." })
      );
    } catch {
      Alert.alert(
        t("paywall.restoreFailed", { defaultValue: "Restore Failed" }),
        t("paywall.restoreFailedMsg", { defaultValue: "No purchases found to restore." })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <Image source={{ uri: ICON_URL }} style={styles.icon} />
          <Text style={[styles.title, { color: colors.foreground }]}>
            {t("paywall.title", { defaultValue: "Unlock Ghost Mode" })}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {t("paywall.subtitle", {
              defaultValue: "Less than one coffee per week to transform your mornings and build lifelong discipline.",
            })}
          </Text>
        </Animated.View>

        {/* Social Proof */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={[styles.socialProof, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.socialProofText, { color: colors.foreground }]}>
            {t("paywall.socialProof", {
              defaultValue: "Join thousands of Ghosts who are quietly rebuilding themselves in silence.",
            })}
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.featuresContainer}>
          <Text style={[styles.featuresTitle, { color: colors.foreground }]}>
            {t("paywall.featuresTitle", { defaultValue: "What You Get" })}
          </Text>
          <View style={[styles.featuresCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {FEATURES.map(({ icon, key, fallback }) => (
              <View key={key} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{icon}</Text>
                <Text style={[styles.featureText, { color: colors.foreground }]}>
                  {t(`paywall.${key}`, { defaultValue: fallback })}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Plan Selector */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.plans}>
          {/* Yearly — recommended */}
          <Pressable
            onPress={() => {
              setSelectedPlan("yearly");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              styles.planCard,
              {
                backgroundColor: selectedPlan === "yearly" ? "#E8A87C15" : colors.surface,
                borderColor: selectedPlan === "yearly" ? "#E8A87C" : colors.border,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={styles.planBadgeRow}>
              <View style={[styles.saveBadge, { backgroundColor: "#22C55E" }]}>
                <Text style={styles.saveBadgeText}>
                  {t("paywall.save", { defaultValue: "Save 44%" })}
                </Text>
              </View>
              {selectedPlan === "yearly" && (
                <Text style={[styles.checkmark, { color: "#E8A87C" }]}>✓</Text>
              )}
            </View>
            <Text style={[styles.planName, { color: colors.foreground }]}>
              {t("paywall.yearly", { defaultValue: "Yearly" })}
            </Text>
            <Text style={[styles.planPrice, { color: "#E8A87C" }]}>{annualPrice}</Text>
            <Text style={[styles.planNote, { color: colors.muted }]}>
              {t("paywall.perYear", { defaultValue: "/year" })} · ~$3.33/mo
            </Text>
          </Pressable>

          {/* Monthly */}
          <Pressable
            onPress={() => {
              setSelectedPlan("monthly");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              styles.planCard,
              {
                backgroundColor: selectedPlan === "monthly" ? "#E8A87C15" : colors.surface,
                borderColor: selectedPlan === "monthly" ? "#E8A87C" : colors.border,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={styles.planBadgeRow}>
              {selectedPlan === "monthly" && (
                <Text style={[styles.checkmark, { color: "#E8A87C" }]}>✓</Text>
              )}
            </View>
            <Text style={[styles.planName, { color: colors.foreground }]}>
              {t("paywall.monthly", { defaultValue: "Monthly" })}
            </Text>
            <Text style={[styles.planPrice, { color: "#E8A87C" }]}>{monthlyPrice}</Text>
            <Text style={[styles.planNote, { color: colors.muted }]}>
              {t("paywall.perMonth", { defaultValue: "/month" })}
            </Text>
          </Pressable>
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.ctaSection}>
          <Pressable
            onPress={handlePurchase}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.ctaButton,
              {
                backgroundColor: "#E8A87C",
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>
                {t("paywall.unlock", { defaultValue: "Unlock Ghost Mode" })}
              </Text>
            )}
          </Pressable>

          <Text style={[styles.legalText, { color: colors.muted }]}>
            {t("paywall.terms", {
              defaultValue: "Cancel anytime. No questions asked.",
            })}
          </Text>

          <Pressable
            onPress={handleRestore}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={[styles.restoreText, { color: colors.muted }]}>
              {t("paywall.restore", { defaultValue: "Restore Purchases" })}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 56,
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 40,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  socialProof: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  socialProofText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
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
  plans: {
    gap: 12,
  },
  planCard: {
    borderRadius: 14,
    borderWidth: 2,
    padding: 16,
    gap: 8,
  },
  planBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 24,
  },
  saveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: "700",
  },
  planName: {
    fontSize: 16,
    fontWeight: "700",
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  planNote: {
    fontSize: 12,
  },
  ctaSection: {
    gap: 12,
    marginTop: 8,
  },
  ctaButton: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
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
  restoreText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
});
