/**
 * Paywall Screen
 *
 * Shown during onboarding and when the user tries to access premium features.
 * Uses RevenueCat offerings to display real package prices when available.
 *
 * Trial: 3-day free trial → full access → then $4.99/month or $39.99/year
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
  const monthlyPrice =
    (monthlyPkg as any)?.product?.priceString ?? "$4.99";
  const annualPrice =
    (annualPkg as any)?.product?.priceString ?? "$39.99";

  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      // Select the right package based on plan choice
      let pkg: unknown = null;
      if (selectedPlan === "yearly" && annualPkg) {
        pkg = annualPkg;
      } else if (selectedPlan === "monthly" && monthlyPkg) {
        pkg = monthlyPkg;
      } else if (offerings && typeof offerings === "object") {
        // Fallback: first available package
        const off = offerings as { current?: { availablePackages?: unknown[] } };
        pkg = off.current?.availablePackages?.[0] ?? null;
      }

      if (pkg) {
        const success = await purchasePackage(pkg);
        if (success) {
          dispatch({ type: "SET_PREMIUM", payload: true });
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={{ uri: ICON_URL }} style={styles.icon} />
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {t("paywall.badge", { defaultValue: "3-DAY FREE TRIAL" })}
              </Text>
            </View>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {t("paywall.title", { defaultValue: "Unlock Ghost Mode" })}
          </Text>
          <Text style={[styles.trialCopy, { color: colors.muted }]}>
            {t("paywall.trialCopy", {
              defaultValue:
                "Start your 3-day free trial – Full access to AI coach, unlimited habits, deep insights, and Ghost Mode tools.",
            })}
          </Text>
        </View>

        {/* Features */}
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

        {/* Plan Selector */}
        <View style={styles.plans}>
          {/* Yearly — recommended */}
          <Pressable
            onPress={() => {
              setSelectedPlan("yearly");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              styles.planCard,
              {
                backgroundColor:
                  selectedPlan === "yearly" ? "#F9731615" : colors.surface,
                borderColor:
                  selectedPlan === "yearly" ? "#F97316" : colors.border,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={styles.planBadgeRow}>
              <View style={[styles.saveBadge, { backgroundColor: "#22C55E" }]}>
                <Text style={styles.saveBadgeText}>
                  {t("paywall.save", { defaultValue: "Save 50%" })}
                </Text>
              </View>
              {selectedPlan === "yearly" && (
                <Text style={[styles.checkmark, { color: "#F97316" }]}>✓</Text>
              )}
            </View>
            <Text style={[styles.planName, { color: colors.foreground }]}>
              {t("paywall.yearly", { defaultValue: "Yearly" })}
            </Text>
            <Text style={[styles.planPrice, { color: "#F97316" }]}>{annualPrice}</Text>
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
                backgroundColor:
                  selectedPlan === "monthly" ? "#F9731615" : colors.surface,
                borderColor:
                  selectedPlan === "monthly" ? "#F97316" : colors.border,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={styles.planBadgeRow}>
              {selectedPlan === "monthly" && (
                <Text style={[styles.checkmark, { color: "#F97316" }]}>✓</Text>
              )}
            </View>
            <Text style={[styles.planName, { color: colors.foreground }]}>
              {t("paywall.monthly", { defaultValue: "Monthly" })}
            </Text>
            <Text style={[styles.planPrice, { color: "#F97316" }]}>{monthlyPrice}</Text>
            <Text style={[styles.planNote, { color: colors.muted }]}>
              {t("paywall.perMonth", { defaultValue: "/month" })}
            </Text>
          </Pressable>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Pressable
            onPress={handlePurchase}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.ctaButton,
              {
                backgroundColor: "#F97316",
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {t("paywall.startTrial", { defaultValue: "Start Free Trial" })}
                </Text>
                <Text style={styles.ctaSubText}>
                  {t("paywall.trialNote", { defaultValue: "3 days free, then" })}{" "}
                  {selectedPlan === "yearly" ? annualPrice + "/year" : monthlyPrice + "/month"}
                </Text>
              </>
            )}
          </Pressable>

          <Text style={[styles.legalText, { color: colors.muted }]}>
            {t("paywall.terms", {
              defaultValue:
                "Cancel anytime. Billed after 3-day free trial ends. No charge today.",
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
        </View>
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
  badgeRow: {
    flexDirection: "row",
  },
  badge: {
    backgroundColor: "#F9731620",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F9731640",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#F97316",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  trialCopy: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 23,
    paddingHorizontal: 8,
  },
  featuresCard: {
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
    width: 28,
  },
  featureText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    lineHeight: 22,
  },
  plans: {
    flexDirection: "row",
    gap: 12,
  },
  planCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    gap: 4,
  },
  planBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 22,
    marginBottom: 4,
  },
  saveBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saveBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "700",
  },
  planName: {
    fontSize: 16,
    fontWeight: "700",
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "800",
  },
  planNote: {
    fontSize: 12,
    lineHeight: 18,
  },
  ctaSection: {
    gap: 14,
    alignItems: "center",
  },
  ctaButton: {
    width: "100%",
    height: 62,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  ctaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  ctaSubText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "500",
  },
  legalText: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    paddingHorizontal: 16,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
